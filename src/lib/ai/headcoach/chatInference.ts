import { buildHeadCoachSystemPrompt } from "@/lib/ai/prompts";
import { trackGeminiUsage } from "@/lib/ai/telemetry";
import { normalizeDisciplines } from "@/lib/gemini/engine";
import { ResolvedChatContext } from "./chatContext";
import { ChatMessage, HeadCoachChatRequest, HeadCoachChatResponse } from "./types";

export async function executeGeminiInference(
  ctx: ResolvedChatContext,
  body: HeadCoachChatRequest
): Promise<{ success: boolean; data?: any; successfulModel?: string }> {
  const { customGeminiKey, selectedModel, fallbackModels, temperature = 0.0, messages = [], isInitialAudit } = body;
  const rawKey = (customGeminiKey || process.env.GEMINI_API_KEY || "").toString();
  const geminiKey = rawKey.replace(/^["']|["']$/g, "").trim();

  if (!geminiKey) {
    return { success: false };
  }

  const systemInstructions = buildHeadCoachSystemPrompt(
    body.customPrompt || undefined,
    ctx.promptContext
  );

  const userPrompt = isInitialAudit
    ? `Realiza el Dictamen Fisiológico de la Semana ${body.weekNumber || 1} (${ctx.planningStartDateStr} al ${ctx.planningEndDateStr}) evaluando lo ejecutado hasta hoy y presentando la propuesta adaptada para los días restantes de la semana respetando la matriz semanal. Pregúntame si apruebo la semana o si deseamos calibrar algo más.`
    : (messages[messages.length - 1]?.content || "Analiza y ajusta mi microciclo");

  // Construcción Normalizada del Historial Multi-Turno (garantía estricta user ⇄ model)
  const normalizedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  normalizedContents.push({
    role: "user",
    parts: [
      {
        text: isInitialAudit
          ? "Inicia la evaluación fisiológica y auditoría del microciclo de la semana."
          : "Inicia la conversación como Head Coach de resistencia.",
      },
    ],
  });

  messages.forEach((m: ChatMessage, mIdx: number) => {
    const gRole: "user" | "model" = m.role === "user" ? "user" : "model";
    const lastTurn = normalizedContents[normalizedContents.length - 1];

    if (mIdx === messages.length - 1 && m.role === "user") {
      return;
    }

    if (lastTurn && lastTurn.role === gRole) {
      lastTurn.parts[0].text += `\n\n${m.content}`;
    } else {
      normalizedContents.push({
        role: gRole,
        parts: [{ text: m.content }],
      });
    }
  });

  const finalTurn = normalizedContents[normalizedContents.length - 1];
  if (finalTurn && finalTurn.role === "user") {
    finalTurn.parts[0].text += `\n\n${userPrompt}`;
  } else {
    normalizedContents.push({
      role: "user",
      parts: [{ text: userPrompt }],
    });
  }

  const mappedModel = (selectedModel === "gemini-flash-latest" || !selectedModel || selectedModel.includes("2.5-flash") || selectedModel.includes("2.0-flash"))
    ? "gemini-3.5-flash"
    : selectedModel;
  const userFallbacks = Array.isArray(fallbackModels) ? fallbackModels.filter((m: string) => !m.includes("2.5-flash") && !m.includes("2.5-pro")) : [];
  const candidateModels = Array.from(
    new Set([
      mappedModel,
      ...userFallbacks,
      "gemini-3.5-flash",
      "gemini-3.6-flash",
    ].filter(Boolean))
  ).slice(0, 2);

  const safeTemp = typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.0;

  const cleanJson = (str: string) => {
    let cleaned = str.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    return cleaned.trim();
  };

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstructions }] },
            contents: normalizedContents,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: safeTemp,
            },
          }),
          signal: AbortSignal.timeout(25000),
        }
      );

      if (response.ok) {
        const raw = await response.json();
        if (raw.usageMetadata) {
          const pTokens = Number(raw.usageMetadata.promptTokenCount) || 0;
          const cTokens = Number(raw.usageMetadata.candidatesTokenCount) || 0;
          trackGeminiUsage(model, pTokens, cTokens, "CHAT_HEADCOACH").catch(() => {});
        }

        const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            const parsed = JSON.parse(cleanJson(text));
            if (parsed && typeof parsed === "object" && parsed.reply) {
              if (Array.isArray(parsed.suggestedPlan)) {
                const dayNamesList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                const allUserText = (messages.map((m) => m.content).join(" ") + " " + userPrompt).toLowerCase();

                parsed.suggestedPlan = parsed.suggestedPlan.map((p: any, idx: number) => {
                  const dateInfo = ctx.planningWeekDates[idx] || { day: dayNamesList[idx], date: "", formattedDate: "" };
                  const dName = dateInfo.day || dayNamesList[idx];
                  const itemDate = p.date || dateInfo.date;
                  const isPast = ctx.isCurrentWeek && Boolean(itemDate && itemDate < ctx.todayDateStr);

                  // 1. DÍAS ANTERIORES A HOY: CONGELAMIENTO HISTÓRICO INMUTABLE
                  if (isPast) {
                    const execData = ctx.effectiveExecutedMap[itemDate];
                    if (execData && execData.activities.length > 0) {
                      const act = execData.activities[0];
                      const isRide = /ride|cycling|bike|virtualride/i.test(act.type);
                      const isWeight = /weight|strength|fuerza/i.test(act.type);
                      const disc = isRide ? "Ciclismo" : isWeight ? "Fuerza" : "Carrera";
                      const pWatts = act.watts ? `${act.watts}W` : (act.heartrate ? `${act.heartrate} bpm` : "Completada");
                      return {
                        day: dName,
                        date: itemDate,
                        formattedDate: dateInfo.formattedDate,
                        discipline: disc,
                        workoutName: act.name || `${disc} Completada`,
                        action: "MANTENER",
                        powerTarget: pWatts,
                        tss: execData.totalTss,
                        durationMinutes: act.movingTimeMin || 0,
                        justification: "Historial inmutable: sesión realizada y registrada en Intervals.icu.",
                        workoutStructure: "",
                      };
                    }

                    const plannedSession = Array.isArray(body.currentPlan) ? body.currentPlan[idx] : null;
                    const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;

                    if (isRestPlanned) {
                      return {
                        day: dName,
                        date: itemDate,
                        formattedDate: dateInfo.formattedDate,
                        discipline: "Descanso",
                        workoutName: "Descanso Pasivo Realizado",
                        action: "MANTENER",
                        powerTarget: "0W",
                        tss: 0,
                        durationMinutes: 0,
                        justification: "Historial inmutable: descanso respetado.",
                        workoutStructure: "",
                      };
                    } else {
                      return {
                        day: dName,
                        date: itemDate,
                        formattedDate: dateInfo.formattedDate,
                        discipline: plannedSession.discipline || "Carrera",
                        workoutName: `Sesión Saltada (${plannedSession.workoutName || plannedSession.title || "Entrenamiento"})`,
                        action: "MANTENER",
                        powerTarget: "0 TSS",
                        tss: 0,
                        durationMinutes: 0,
                        justification: "Historial inmutable: sesión no registrada en Intervals.icu.",
                        workoutStructure: "",
                      };
                    }
                  }

                  // 2. DÍAS DE HOY EN ADELANTE: RESPETAR MATRIZ SEMANAL DE DISPONIBILIDAD
                  const dLower = dName.toLowerCase();
                  const userRequestedChange = allUserText.includes(dLower) && (
                    allUserText.includes("cambia") || allUserText.includes("carrera") || allUserText.includes("bici") ||
                    allUserText.includes("ciclismo") || allUserText.includes("descanso") || allUserText.includes("rodillo") ||
                    allUserText.includes("fuerza") || allUserText.includes("modifica")
                  );

                  const configuredList = normalizeDisciplines(ctx.safeAvailability[dName]);
                  let safeDiscipline = p.discipline || p.type || "Carrera";

                  if (!userRequestedChange && configuredList.length > 0) {
                    if (configuredList.length === 1 && configuredList[0] === "Descanso") {
                      safeDiscipline = "Descanso";
                    } else if (configuredList.includes("Ciclismo") && !configuredList.includes("Carrera")) {
                      safeDiscipline = "Ciclismo";
                    } else if (configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) {
                      safeDiscipline = "Carrera";
                    } else if (configuredList.includes("Fuerza") && !configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) {
                      safeDiscipline = "Fuerza";
                    }
                  }

                  const isRest = safeDiscipline === "Descanso";
                  const safeTss = isRest ? 0 : (typeof p.tss === "number" && p.tss > 0 ? p.tss : (safeDiscipline === "Ciclismo" ? 50 : 45));
                  const safeDuration = isRest ? 0 : (typeof p.durationMinutes === "number" && p.durationMinutes > 0 ? p.durationMinutes : (safeDiscipline === "Ciclismo" ? 60 : 45));

                  let safePower = p.powerTarget || p.intensity || "";
                  if (safeDiscipline === "Ciclismo" && (!safePower || safePower.includes("CP") || safePower.includes("Stryd"))) {
                    const bikeFtp = ctx.profile.bike_ftp || 250;
                    safePower = `65-72% Bike FTP (${Math.round(bikeFtp * 0.68)}W)`;
                  } else if (safeDiscipline === "Carrera" && (!safePower || safePower.includes("Bike"))) {
                    const runFtp = ctx.profile.run_ftp || 320;
                    safePower = `70-75% Stryd CP (${Math.round(runFtp * 0.72)}W)`;
                  }

                  let safeName = p.workoutName || p.title || p.name;
                  if (isRest) {
                    safeName = "Descanso Pasivo Total";
                  } else if (!safeName || safeName === "Entrenamiento" || (safeDiscipline === "Ciclismo" && /carrera|rodaje/i.test(safeName))) {
                    safeName = safeDiscipline === "Ciclismo" ? "Ciclismo Resistencia Base Z2 (Rodillo/Ruta)" : "Carrera Aeróbica Continua Z2";
                  }

                  return {
                    day: dName,
                    date: itemDate,
                    formattedDate: p.formattedDate || dateInfo.formattedDate,
                    discipline: safeDiscipline,
                    workoutName: safeName,
                    action: p.action || "MANTENER",
                    powerTarget: safePower,
                    tss: safeTss,
                    durationMinutes: safeDuration,
                    justification: p.justification || p.description || "",
                    workoutStructure: p.workoutStructure || p.structure || "",
                  };
                });
              }
              return {
                success: true,
                data: parsed,
                successfulModel: model,
              };
            }
          } catch (pErr) {
            console.warn(`Error al parsear JSON devuelto por Gemini (${model}):`, pErr);
          }
        }
      }
    } catch (e) {
      console.warn(`Intento fallido con modelo ${model}:`, e);
    }
  }

  return { success: false };
}
