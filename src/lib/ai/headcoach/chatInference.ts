import { buildHeadCoachSystemPrompt } from "@/lib/ai/prompts";
import { trackGeminiUsage } from "@/lib/ai/telemetry";
import { normalizeDisciplines, getDayDisciplines } from "@/lib/gemini/engine";
import { applyTssAdjustmentToPlan } from "./weekRetrospective";
import { ResolvedChatContext } from "./chatContext";
import { ChatMessage, HeadCoachChatRequest, HeadCoachChatResponse } from "./types";

export async function executeGeminiInference(
  ctx: ResolvedChatContext,
  body: HeadCoachChatRequest
): Promise<{ success: boolean; data?: any; successfulModel?: string }> {
  const { customGeminiKey, selectedModel, fallbackModels, temperature = 0.0, messages = [], isInitialAudit } = body;
  const geminiKey = (customGeminiKey || process.env.GEMINI_API_KEY || "").toString().replace(/^["']|["']$/g, "").trim();

  if (!geminiKey) {
    return { success: false };
  }

  const systemInstructions = buildHeadCoachSystemPrompt(
    body.customPrompt || undefined,
    ctx.promptContext
  );

  const userPrompt = isInitialAudit
    ? `Realiza el Dictamen Fisiológico de la Semana ${body.weekNumber || 1} (${ctx.planningStartDateStr} al ${ctx.planningEndDateStr}). Evalúa adherencia y carga. Si el plan es idóneo declara continuidad (sin suggestedPlan). Si requiere ajuste pregunta primero si desea adaptar la semana.`
    : (messages[messages.length - 1]?.content || "Analiza y ajusta mi microciclo");

  // Construcción Normalizada del Historial Multi-Turno (garantía estricta user ⇄ model)
  const normalizedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  normalizedContents.push({
    role: "user",
    parts: [{ text: isInitialAudit ? "Inicia la evaluación fisiológica y auditoría del microciclo de la semana." : "Inicia la conversación como Head Coach de resistencia." }],
  });

  messages.forEach((m: ChatMessage, mIdx: number) => {
    const gRole: "user" | "model" = m.role === "user" ? "user" : "model";
    const lastTurn = normalizedContents[normalizedContents.length - 1];
    if (mIdx === messages.length - 1 && m.role === "user") return;

    if (lastTurn && lastTurn.role === gRole) {
      lastTurn.parts[0].text += `\n\n${m.content}`;
    } else {
      normalizedContents.push({ role: gRole, parts: [{ text: m.content }] });
    }
  });

  const smartBrevityInstruction = `\n\n[DIRECTRICES ESTRICTAS DEL HEAD COACH FISIOLÓGICO PULSE]:
1. "reply": Habla en términos prácticos de "frecuencia", "intensidad", "descanso" y "días". Cero jerga de cálculos matemáticos de TSS al atleta.
   - Formato conciso: Contexto directo (1-2 oraciones) + Propuesta concreta (1-2 oraciones) + Pregunta de decisión binaria.
   - Máximo 70-110 palabras. Prohibido usar encabezados mecánicos como "Estado de la semana:" o "Diagnóstico:".
2. "quickReplies": Proporciona exactamente 2 botones:
   - Botón 1 (Primario): Acción recomendada.
   - Botón 2 (Secundario): Alternativa segura.
3. "suggestedPlan": Solo incluir array de 7 días si el atleta solicitó explícitamente adaptar la semana; de lo contrario debe ser null.`;

  const finalTurn = normalizedContents[normalizedContents.length - 1];
  if (finalTurn && finalTurn.role === "user") {
    finalTurn.parts[0].text += `\n\n${userPrompt}${smartBrevityInstruction}`;
  } else {
    normalizedContents.push({ role: "user", parts: [{ text: `${userPrompt}${smartBrevityInstruction}` }] });
  }

  const mappedModel = (selectedModel === "gemini-flash-latest" || !selectedModel || selectedModel.includes("2.5-") || selectedModel.includes("2.0-"))
    ? "gemini-3.5-flash"
    : selectedModel;
  const userFallbacks = Array.isArray(fallbackModels) ? fallbackModels.filter((m: string) => !m.includes("2.5-")) : [];
  const candidateModels = Array.from(new Set([mappedModel, ...userFallbacks, "gemini-3.5-flash", "gemini-3.6-flash"].filter(Boolean))).slice(0, 3);
  const safeTemp = typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.0;

  const cleanJson = (str: string) => {
    const cleaned = str.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    return (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) ? cleaned.substring(firstBrace, lastBrace + 1) : cleaned;
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
              maxOutputTokens: 6144,
            },
          }),
          signal: AbortSignal.timeout(50000),
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
              if (typeof parsed.reply === "string") {
                parsed.reply = parsed.reply
                  .replace(/\[\s*ESTADO DEL PROCESO\s*\]:?\s*/gi, "**Estado de la semana:**\n")
                  .replace(/\[\s*DIAGN[OÓ]STICO(?:\s*\/\s*VEREDICTO)?\s*\]:?\s*/gi, "\n\n**Diagnóstico:**\n")
                  .replace(/\[\s*ACCI[OÓ]N PRESCRIPTIVA\s*\]:?\s*/gi, "\n\n**Pauta para hoy:**\n")
                  .trim();
              }

              const allUserText = (messages.map((m) => m.content || "").join(" ") + " " + (userPrompt || "")).toLowerCase();
              const isContinuityVerdict =
                parsed.actionType === "REVIEW_PHYSIOLOGY" ||
                (typeof parsed.reply === "string" && /continuidad/i.test(parsed.reply) && !/ajuste t[aá]ctico/i.test(parsed.reply));

              const userExplicitlyRequestedAdjustment =
                allUserText.includes("reduc") || allUserText.includes("-15%") || allUserText.includes("-25%") ||
                allUserText.includes("+10%") || allUserText.includes("viaje") || allUserText.includes("cambia") ||
                allUserText.includes("sí, adaptar") || allUserText.includes("si, adaptar") || allUserText.includes("ajusta");

              if (isContinuityVerdict || !userExplicitlyRequestedAdjustment) {
                parsed.actionType = "REVIEW_PHYSIOLOGY";
                parsed.suggestedPlan = null;
                if (!parsed.quickReplies || parsed.quickReplies.length === 0) {
                  parsed.quickReplies = ["🎯 Pautas & Vatios de Hoy", "🌙 Confirmar Fin de Semana", "🔍 Ver Zonas de Potencia"];
                }
              } else if (Array.isArray(parsed.suggestedPlan)) {
                const dayNamesList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                parsed.suggestedPlan = parsed.suggestedPlan.map((p: any, idx: number) => {
                  const dateInfo = ctx.planningWeekDates[idx] || { day: dayNamesList[idx % 7], date: "", formattedDate: "" };
                  const dName = dateInfo.day || dayNamesList[idx % 7] || "Lunes";
                  const itemDate = p.date || dateInfo.date;
                  const isPast = ctx.isCurrentWeek && Boolean(itemDate && itemDate < ctx.todayDateStr);

                  // 1. DÍAS ANTERIORES A HOY: CONGELAMIENTO HISTÓRICO INMUTABLE
                  if (isPast) {
                    const execData = ctx.effectiveExecutedMap[itemDate];
                    if (execData && execData.activities.length > 0) {
                      const act = execData.activities[0];
                      const isRide = /ride|cycling|bike|virtualride/i.test(act.type);
                      const isWeight = /weight|strength|fuerza/i.test(act.type);
                      const isSwimAct = /swim|nataci/i.test(act.type);
                      const disc = isRide ? "Ciclismo" : isWeight ? "Fuerza" : isSwimAct ? "Natacion" : "Carrera";
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

                    return {
                      day: dName,
                      date: itemDate,
                      formattedDate: dateInfo.formattedDate,
                      discipline: isRestPlanned ? "Descanso" : (plannedSession?.discipline || "Carrera"),
                      workoutName: isRestPlanned ? "Descanso Pasivo Realizado" : `Sesión Saltada (${plannedSession?.workoutName || plannedSession?.title || "Entrenamiento"})`,
                      action: "MANTENER",
                      powerTarget: isRestPlanned ? "0W" : "0 TSS",
                      tss: 0,
                      durationMinutes: 0,
                      justification: isRestPlanned ? "Historial inmutable: descanso respetado." : "Historial inmutable: sesión no registrada en Intervals.icu.",
                      workoutStructure: "",
                    };
                  }

                  // 2. DÍAS DE HOY EN ADELANTE: RESPETAR MATRIZ SEMANAL O CONTINUIDAD DEL PLAN
                  const dLower = (dName || "").toLowerCase();
                  const userRequestedChange = allUserText.includes(dLower) && (
                    allUserText.includes("cambia") || allUserText.includes("carrera") || allUserText.includes("bici") ||
                    allUserText.includes("ciclismo") || allUserText.includes("descanso") || allUserText.includes("rodillo") ||
                    allUserText.includes("fuerza") || allUserText.includes("modifica") || allUserText.includes("nado") ||
                    allUserText.includes("natacion")
                  );

                  const plannedSession = Array.isArray(body.currentPlan) ? body.currentPlan[idx] : null;
                  if (isContinuityVerdict && !userRequestedChange && plannedSession && (plannedSession.workoutName || plannedSession.title)) {
                    return {
                      day: dName,
                      date: itemDate,
                      formattedDate: p.formattedDate || dateInfo.formattedDate,
                      discipline: plannedSession.discipline || p.discipline || "Carrera",
                      workoutName: plannedSession.workoutName || plannedSession.title,
                      action: "MANTENER",
                      powerTarget: plannedSession.powerTarget || p.powerTarget || "",
                      tss: plannedSession.tss || p.tss || 0,
                      durationMinutes: plannedSession.durationMinutes || p.durationMinutes || 0,
                      justification: "Plan confirmado: continuidad aprobada sin modificaciones.",
                      workoutStructure: plannedSession.workoutStructure || p.workoutStructure || "",
                      mobilityWarmup: p.mobilityWarmup || plannedSession.mobilityWarmup,
                      fuelingStrategy: p.fuelingStrategy || plannedSession.fuelingStrategy,
                    };
                  }

                  const configuredList = getDayDisciplines(ctx.safeAvailability, dName);
                  let safeDiscipline = p.discipline || p.type || "Carrera";

                  if (!userRequestedChange && configuredList.length > 0) {
                    if (configuredList.length === 1 && configuredList[0] === "Descanso") {
                      safeDiscipline = "Descanso";
                    } else if (configuredList.includes("Natacion") && !configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) {
                      safeDiscipline = "Natacion";
                    } else if (configuredList.includes("Ciclismo") && !configuredList.includes("Carrera")) {
                      safeDiscipline = "Ciclismo";
                    } else if (configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) {
                      safeDiscipline = "Carrera";
                    } else if (configuredList.includes("Fuerza") && !configuredList.includes("Carrera") && !configuredList.includes("Ciclismo")) {
                      safeDiscipline = "Fuerza";
                    } else if (configuredList.includes("Natacion") && (p.discipline === "Natacion" || p.discipline === "Swim")) {
                      safeDiscipline = "Natacion";
                    }
                  }

                  const isRest = safeDiscipline === "Descanso";
                  const isSwim = safeDiscipline === "Natacion";
                  const safeTss = isRest ? 0 : (typeof p.tss === "number" && p.tss > 0 ? p.tss : (safeDiscipline === "Ciclismo" ? 50 : isSwim ? 38 : 45));
                  const safeDuration = isRest ? 0 : (typeof p.durationMinutes === "number" && p.durationMinutes > 0 ? p.durationMinutes : (safeDiscipline === "Ciclismo" ? 60 : isSwim ? 45 : 45));

                  let safePower = p.powerTarget || p.intensity || "";
                  if (safeDiscipline === "Ciclismo" && (!safePower || safePower.includes("CP") || safePower.includes("Stryd"))) {
                    const bikeFtp = ctx.profile.bike_ftp || 250;
                    safePower = `65-72% Bike FTP (${Math.round(bikeFtp * 0.68)}W)`;
                  } else if (safeDiscipline === "Carrera" && (!safePower || safePower.includes("Bike"))) {
                    const runFtp = ctx.profile.run_ftp || 320;
                    safePower = `70-75% Stryd CP (${Math.round(runFtp * 0.72)}W)`;
                  } else if (isSwim && !safePower) {
                    safePower = "Ritmo Aeróbico CSS";
                  }

                  let safeName = p.workoutName || p.title || p.name;
                  if (isRest) {
                    safeName = "Descanso Pasivo Total";
                  } else if (isSwim) {
                    if (!safeName || safeName === "Entrenamiento" || /^(rodaje|sesi[oó]n|entrenamiento)$/i.test(safeName.trim())) {
                      safeName = "Natación Técnica & Resistencia Aeróbica";
                    }
                  } else if (!safeName || safeName === "Entrenamiento" || /^(rodaje|sesi[oó]n|entrenamiento)$/i.test(safeName.trim())) {
                    if (safeDiscipline === "Ciclismo") {
                      safeName = dName === "Sábado"
                        ? "Ciclismo - SweetSpot 2x15m en Rodillo / Resistencia"
                        : "Ciclismo - Resistencia Base Z2 & Cadencia Dinámica";
                    } else if (safeDiscipline === "Fuerza") {
                      safeName = "Fuerza Neuromuscular, Core & Cadena Posterior";
                    } else {
                      if (dName === "Martes") safeName = "Carrera - Series de Umbral 4x1200m @ 98-102% Stryd CP";
                      else if (dName === "Jueves") safeName = "Carrera - Fartlek Progresivo Z2-Z4";
                      else if (dName === "Viernes") safeName = "Carrera - Fartlek Dinámico & Capilarización";
                      else if (dName === "Domingo") safeName = `Carrera - Tirada Larga Progresiva (${safeDuration}m)`;
                      else safeName = `Carrera - Rodaje de Capilarización (${safeDuration}m)`;
                    }
                  }

                  let safeStructure = p.workoutStructure || p.structure || "";
                  if (!safeStructure && !isRest && safeDuration > 0) {
                    if (safeDiscipline === "Carrera") {
                      if (/umbral|series|interval/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 65-70% Stryd CP\n- 4x:\n  - Intervalo Umbral: 6m @ 98-102% Stryd CP\n  - Recuperación: 2m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP`;
                      } else if (/fartlek/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 65% Stryd CP\n- 6x:\n  - Fartlek Cambio: 2m @ 95-98% Stryd CP\n  - Recuperación: 1m @ 60% Stryd CP\n- Enfriamiento: 10m @ 65% Stryd CP`;
                      } else if (/larga|fondo|marat/i.test(safeName)) {
                        safeStructure = `- Fondo Base Aeróbico: 55m @ 70-75% Stryd CP\n- Bloque Progresivo Maratón: 20m @ 80-84% Stryd CP\n- Enfriamiento: 15m @ 65% Stryd CP`;
                      } else {
                        safeStructure = `- Rodaje Continuo Z2: ${safeDuration}m @ ${safePower || "70-75% Stryd CP"}`;
                      }
                    } else if (safeDiscipline === "Ciclismo") {
                      if (/sweetspot/i.test(safeName)) {
                        safeStructure = `- Calentamiento: 15m @ 60% Bike FTP\n- 2x:\n  - SweetSpot: 15m @ 88-93% Bike FTP\n  - Recuperación: 5m @ 55% Bike FTP\n- Enfriamiento: 10m @ 55% Bike FTP`;
                      } else {
                        safeStructure = `- Rodillo / Ciclismo Z2: ${safeDuration}m @ ${safePower || "60-68% Bike FTP"}`;
                      }
                    } else if (safeDiscipline === "Fuerza") {
                      safeStructure = `- Movilidad articular & Core: 10m\n- Fuerza Funcional (Sóleo, Isquios, Glúteos): 25m\n- Vuelta a la calma: 10m`;
                    }
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
                    workoutStructure: safeStructure,
                    mobilityWarmup: p.mobilityWarmup || plannedSession?.mobilityWarmup,
                    fuelingStrategy: p.fuelingStrategy || plannedSession?.fuelingStrategy,
                  };
                });
                if (ctx.targetTssAdjustmentPct && ctx.targetTssAdjustmentPct !== 0 && Array.isArray(parsed.suggestedPlan)) {
                  parsed.suggestedPlan = applyTssAdjustmentToPlan(parsed.suggestedPlan, ctx.targetTssAdjustmentPct);
                }
              }
              return {
                success: true,
                data: parsed,
                successfulModel: model,
              };
            }
          } catch (pErr) {
            const candidate = raw.candidates?.[0];
            console.warn(`Error al parsear JSON devuelto por Gemini (${model}):`, pErr);
            console.warn(`FinishReason: ${candidate?.finishReason} | Longitud texto: ${text.length}`);
            console.warn(`Texto crudo recibido (${model}):`, text.slice(0, 1000));
            if (text.length > 1000) {
              console.warn(`Cola de texto recibido (${model}):`, text.slice(-500));
            }
          }
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn(`Gemini API respondió con status ${response.status} para modelo ${model}:`, errText.slice(0, 300));
      }
    } catch (e) {
      console.warn(`Intento fallido con modelo ${model}:`, e);
    }
  }

  return { success: false };
}
