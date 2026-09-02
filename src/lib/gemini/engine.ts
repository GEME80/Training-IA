import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";
import {
  DisciplineType,
  WeeklyAvailabilityMap,
  PlanItem,
  AgentDecisionOutput,
  DEFAULT_WEEKLY_AVAILABILITY,
  getWeekDates,
  normalizeDisciplines,
} from "./types";
import { generateDeterministicAnalysis } from "./deterministicPlanGenerator";

export * from "./types";
export { generateDeterministicAnalysis };

/**
 * Motor de Inteligencia Fisiológica con Descubrimiento Dinámico de Modelos Google Gemini API.
 */
export class GeminiPhysiologicalAgent {
  /**
   * Genera un análisis adaptativo del microciclo semanal a partir de los datos biométricos, directrices y matriz personalizada.
   */
  static async analyzeMicrocycle(
    profile: AthleteProfile,
    wellness: AthleteWellness[],
    events: CalendarEvent[],
    physioStatus: PhysiologicalStatus,
    weekOffset: number = 0,
    options?: {
      customApiKey?: string;
      preferredModel?: string;
      customDirectives?: string;
      macrocyclePhase?: MacrocyclePhaseInfo | null;
      weeklyAvailability?: WeeklyAvailabilityMap;
      skipAI?: boolean;
    }
  ): Promise<AgentDecisionOutput> {
    const rawApiKey = options?.customApiKey || process.env.GEMINI_API_KEY;
    const apiKey = (rawApiKey || "").toString().replace(/^["']|["']$/g, "").trim();
    const weekDates = getWeekDates(weekOffset);
    const availability = options?.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY;

    if (options?.skipAI || !apiKey) {
      return generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
    }

    const preferred = (options as any)?.selectedModel && !(options as any).selectedModel.includes("2.5-flash")
      ? (options as any).selectedModel
      : "gemini-3.5-flash";

    const candidateModels = Array.from(
      new Set([
        preferred,
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3-flash-preview",
        "gemma-4-26b-a4b-it",
      ].filter(Boolean) as string[])
    );

    const customDirectivesText = options?.customDirectives
      ? `\nDIRECTRICES ESPECÍFICAS DEL ATLETA:\n${options.customDirectives}\n`
      : "";

    const macroInfo = options?.macrocyclePhase;

    const macrocycleText = macroInfo?.primaryRace
      ? `\nCONTEXTO DE MACROCICLO & CARRERA OBJETIVO:
- Carrera Principal (Prioridad A): ${macroInfo.primaryRace.name} (${macroInfo.primaryRace.distance}) el ${macroInfo.primaryRace.date}
- Conteo regresivo: ${macroInfo.weeksRemaining} semanas restantes (${macroInfo.daysRemaining} días)
- Fase Actual del Macrociclo: ${macroInfo.phaseLabel} (${macroInfo.phase})
- Enfoque Sugerido: ${macroInfo.suggestedFocus}
- Pauta Metodológica: ${macroInfo.guideline}
- Límite Máximo de Tirada Larga: ${macroInfo.maxLongRunMinutes} minutos
- Fase Específica de Maratón Activa: ${macroInfo.isSpecificMarathonPhase ? "SÍ" : "NO"}
- Carga Semanal Sugerida: ${macroInfo.weeklyTssTarget}\n`
      : `\nCONTEXTO DE MACROCICLO:
- Fase Actual: Mantenimiento General Adaptativo
- Enfoque: Estabilidad de CTL, salud articular (sóleo/Aquiles) y prevención de sobrecargas.
- Límite Máximo de Tirada Larga Dominical: 55-65 minutos.
- Carga Semanal Sugerida: 280 - 360 TSS.\n`;

    const availabilityText = Object.entries(availability)
      .map(
        ([day, disc]) =>
          `- ${day}: ${disc === "Descanso" ? "Descanso total obligatorio" : `${disc} (${disc === "Carrera" ? "Stryd Running Power % FTP" : disc === "Ciclismo" ? "Ciclismo % FTP" : "Fuerza / Prevención"})`}`
      )
      .join("\n");

    const prompt = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia, potenciómetros Stryd, periodización de macrociclos y modelos Banister (CTL, ATL, TSB, Rolling HRV).
Analiza el siguiente atleta y genera un microciclo semanal equilibrado con variedad de estímulos cualitativos (Lunes a Domingo):

PERFIL Y MÉTRICAS BIOMÉTRICAS:
- Atleta: ${profile.name || "Atleta"} (${profile.age ? `${profile.age} años` : "Edad no especificada"} | Género: ${profile.gender === "M" ? "Masculino" : profile.gender === "F" ? "Femenino" : "No especificado"})
- CTL (Fitness): ${physioStatus.ctl} | ATL (Fatiga): ${physioStatus.atl} | TSB (Forma): ${physioStatus.tsb}
- HRV Actual: ${physioStatus.currentHrv ?? "N/A"} ms (Z-Score: ${physioStatus.hrvZScore ?? "N/A"})
- Stryd Run FTP / CP: ${profile.run_ftp ? `${profile.run_ftp} W` : "No configurado"} | Bike FTP: ${profile.bike_ftp ? `${profile.bike_ftp} W` : "No configurado"}
${macrocycleText}${customDirectivesText}
MATRIZ PERSONALIZADA DE DISPONIBILIDAD DEL ATLETA:
${availabilityText}

Responde ÚNICAMENTE en formato JSON con la estructura:
{
  "status": "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED",
  "summaryHeadline": "Diagnóstico conciso en 1 frase",
  "reasoningTree": ["Paso 1 del análisis...", "Paso 2...", "Paso 3...", "Paso 4..."],
  "suggestedPlan": [
    {
      "day": "Lunes",
      "discipline": "Descanso",
      "workoutName": "Descanso Pasivo",
      "action": "MANTENER",
      "justification": "Recuperación biológica y asimilación neurovegetativa"
    },
    ... (hasta Domingo)
  ]
}`;

    for (const modelName of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
            signal: AbortSignal.timeout(20000),
          }
        );

        if (!res.ok) continue;

        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const cleanJson = (str: string) => {
          let cleaned = str.trim();
          if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
          } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
          }
          return cleaned.trim();
        };

        const parsed = JSON.parse(cleanJson(rawText)) as AgentDecisionOutput;
        parsed.modelUsed = modelName;
        parsed.macrocyclePhase = macroInfo?.phaseLabel;

        parsed.suggestedPlan = (parsed.suggestedPlan || []).map((item, idx) => {
          const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };
          const isRest = item.discipline === "Descanso" || item.action === "DESCANSO_ACTIVO";
          const rawDisc = item.discipline || availability[item.day] || "Carrera";
          const disc: DisciplineType = Array.isArray(rawDisc) ? (rawDisc[0] as DisciplineType) : (rawDisc as DisciplineType);

          return {
            ...item,
            discipline: disc,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            isRestDay: isRest,
            workoutDoc:
              item.workoutDoc ||
              (isRest
                ? undefined
                : PhysiologicalEngine.generateWorkoutSyntax(
                    disc === "Ciclismo" ? "Ride" : disc === "Fuerza" ? "WeightTraining" : "Run",
                    item.workoutName || item.title || "Entrenamiento",
                    100,
                    macroInfo?.phase
                  )),
          };
        });

        return parsed;
      } catch (err) {
        console.warn(`Error en inferencia con modelo ${modelName}:`, err);
      }
    }

    return generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
  }
}
