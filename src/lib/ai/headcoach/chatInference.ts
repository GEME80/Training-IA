import { buildHeadCoachSystemPrompt } from "@/lib/ai/prompts";
import { trackGeminiUsage } from "@/lib/ai/telemetry";
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
    ? `Realiza el Dictamen Fisiológico de Cierre de la Semana ${body.weekNumber || 1} y presenta la propuesta estructurada de microciclo para la SEMANA ${ctx.targetPlanningWeekNum} (${ctx.planningStartDateStr} al ${ctx.planningEndDateStr}). Pregúntame si apruebo la semana o si deseamos calibrar algo más.`
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
                parsed.suggestedPlan = parsed.suggestedPlan.map((p: any, idx: number) => {
                  const dateInfo = ctx.planningWeekDates[idx] || { day: dayNamesList[idx], date: "", formattedDate: "" };
                  return {
                    day: p.day || p.dayOfWeek || dateInfo.day || dayNamesList[idx],
                    date: p.date || dateInfo.date,
                    formattedDate: p.formattedDate || dateInfo.formattedDate,
                    discipline: p.discipline || p.type || "Carrera",
                    workoutName: p.workoutName || p.title || p.name || (p.discipline === "Descanso" ? "Descanso Pasivo Total" : "Entrenamiento"),
                    action: p.action || "MANTENER",
                    powerTarget: p.powerTarget || p.intensity || "",
                    tss: typeof p.tss === "number" ? p.tss : (p.discipline === "Descanso" ? 0 : 40),
                    durationMinutes: typeof p.durationMinutes === "number" ? p.durationMinutes : (p.discipline === "Descanso" ? 0 : 45),
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
