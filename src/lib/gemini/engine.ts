import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";

export type DisciplineType = "Descanso" | "Carrera" | "Ciclismo" | "Fuerza";
export type WeeklyAvailabilityMap = Record<string, DisciplineType>;

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMap = {
  Lunes: "Descanso",
  Martes: "Carrera",
  Miércoles: "Ciclismo",
  Jueves: "Fuerza",
  Viernes: "Carrera",
  Sábado: "Ciclismo",
  Domingo: "Carrera",
};

export interface PlanItem {
  day: string; // "Lunes", "Martes", etc.
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "18 Ago"
  discipline: DisciplineType;
  workoutName: string;
  action: "MANTENER" | "MODIFICAR" | "REDUCIR_INTENSIDAD" | "DESCANSO_ACTIVO";
  powerTarget?: string;
  justification: string;
  workoutDoc?: string;
  isRestDay?: boolean;
  isCustomized?: boolean;
}

export interface AgentDecisionOutput {
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  summaryHeadline: string;
  reasoningTree: string[];
  suggestedPlan: PlanItem[];
  modelUsed?: string;
  macrocyclePhase?: string;
}

/**
 * Obtiene el array de fechas (ISO y formateada) para los 7 días de la semana (Lunes a Domingo)
 * a partir de un offset de semana (0 = esta semana, 1 = próxima semana) o una fecha base.
 */
export function getWeekDates(
  weekOffset: number = 0,
  baseDate?: Date
): Array<{ day: string; date: string; formattedDate: string }> {
  const now = baseDate ? new Date(baseDate) : new Date();
  const dayOfWeek = now.getDay(); // 0 = Dom, 1 = Lun ... 6 = Sab
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday + weekOffset * 7);

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return days.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formatted = `${d.getDate()} ${months[d.getMonth()]}`;
    return { day, date: dateStr, formattedDate: formatted };
  });
}

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
      macrocyclePhase?: MacrocyclePhaseInfo;
      weeklyAvailability?: WeeklyAvailabilityMap;
      skipAI?: boolean;
    }
  ): Promise<AgentDecisionOutput> {
    const apiKey = options?.customApiKey || process.env.GEMINI_API_KEY;
    const weekDates = getWeekDates(weekOffset);
    const availability = options?.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY;

    // Si se solicita omitir la IA (para actualización rápida de telemetría) o no hay clave:
    if (options?.skipAI || !apiKey) {
      return this.generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
    }

    // Cascada de modelos dinámicos priorizando los alias oficiales activos de Google AI
    const preferred = options?.preferredModel;
    const candidateModels = Array.from(
      new Set([
        preferred,
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-flash-lite-latest",
        "gemini-3.7-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
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
- Pauta Metodológica: ${macroInfo.guideline}\n`
      : `\nCONTEXTO DE MACROCICLO:
- Fase Actual: Mantenimiento General Adaptativo (Sin carrera A próxima definida)
- Enfoque: Estabilidad de CTL y prevención de lesiones.\n`;

    const availabilityText = Object.entries(availability)
      .map(([day, disc]) => `- ${day}: ${disc === "Descanso" ? "Descanso total obligatorio" : `${disc} (${disc === "Carrera" ? "Stryd Running Power % FTP" : disc === "Ciclismo" ? "Ciclismo % FTP" : "Fuerza / Prevención"})`}`)
      .join("\n");

    const prompt = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia, potenciómetros Stryd, periodización de macrociclos y modelos Banister (CTL, ATL, TSB, Rolling HRV).
Analiza el siguiente atleta y genera un diagnóstico semanal con ajustes para cada día de la semana (Lunes a Domingo):

PERFIL Y MÉTRICAS BIOMÉTRICAS:
- CTL (Fitness): ${physioStatus.ctl}
- ATL (Fatiga): ${physioStatus.atl}
- TSB (Forma): ${physioStatus.tsb}
- Ramp Rate: ${physioStatus.rampRate} pts/semana
- HRV Actual (rMSSD): ${physioStatus.currentHrv ?? "N/A"} ms (Z-Score: ${physioStatus.hrvZScore ?? "N/A"}, Media Base: ${physioStatus.baselineHrvMean})
- FC Reposo: ${physioStatus.restingHR ?? "N/A"} bpm
- Potencia Crítica Carrera (Stryd Run FTP / CP): ${profile.run_ftp ?? 285} W
- FTP Ciclismo: ${profile.bike_ftp ?? 260} W
${macrocycleText}${customDirectivesText}
MATRIZ PERSONALIZADA DE DISPONIBILIDAD DEL ATLETA (Respeta estrictamente esta estructura de días):
${availabilityText}

REGLAS FISIOLÓGICAS DE REAJUSTE:
- Si TSB < -25 o HRV Z-Score < -1.5: Reducir carga drásticamente (convertir calidad en rodaje suave Z1 o descanso activo).
- Si Ramp Rate > +8: No aumentar volumen, consolidar meseta.
- Si -10 <= TSB <= +5 y HRV estable: Progresión nominal óptima según la fase del macrociclo.
- En el campo 'action', indica claramente si el entrenamiento es 'MANTENER', 'MODIFICAR' (ej. atenuado por fatiga o intensificado por pico), 'REDUCIR_INTENSIDAD' o 'DESCANSO_ACTIVO'.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
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

    // Intentar inferencia en la cascada de modelos
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
          }
        );

        if (!res.ok) {
          console.warn(`Modelo ${modelName} no respondió OK (${res.status}), probando siguiente...`);
          continue;
        }

        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const parsed = JSON.parse(rawText) as AgentDecisionOutput;
        parsed.modelUsed = modelName;
        parsed.macrocyclePhase = macroInfo?.phaseLabel;

        // Asignar fechas y documentos de sintaxis con formato estructurado
        parsed.suggestedPlan = parsed.suggestedPlan.map((item, idx) => {
          const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };
          const isRest = item.discipline === "Descanso" || item.action === "DESCANSO_ACTIVO";
          const disc = item.discipline || availability[item.day] || "Carrera";

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
                    item.workoutName.includes("Series") || item.workoutName.includes("Umbral")
                      ? "THRESHOLD_INTERVALS"
                      : item.workoutName.includes("Larga") || item.workoutName.includes("Fondo")
                      ? "LONG_RUN"
                      : "RECOVERY"
                  )),
          };
        });

        return parsed;
      } catch (err) {
        console.warn(`Error en inferencia con modelo ${modelName}:`, err);
      }
    }

    console.warn("Todos los modelos de Gemini fallaron o límite de tasa alcanzado. Usando motor fisiológico determinístico.");
    return this.generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
  }

  /**
   * Generador determinístico de alta precisión en caso de desconexión con Gemini o modo rápido.
   */
  private static generateDeterministicAnalysis(
    profile: AthleteProfile,
    status: PhysiologicalStatus,
    weekDates: Array<{ day: string; date: string; formattedDate: string }>,
    macrocyclePhase?: MacrocyclePhaseInfo,
    availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY
  ): AgentDecisionOutput {
    const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
    const runFtp = profile.run_ftp ?? 285;
    const bikeFtp = profile.bike_ftp ?? 260;

    const macroTitle = macrocyclePhase?.primaryRace
      ? `Macrociclo: ${macrocyclePhase.phaseLabel} (${macrocyclePhase.weeksRemaining} sem para ${macrocyclePhase.primaryRace.name}).`
      : `Macrociclo: Mantenimiento General Adaptativo.`;

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const suggestedPlan: PlanItem[] = days.map((day, idx) => {
      const disc = availability[day] || "Carrera";
      const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };

      if (disc === "Descanso") {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Descanso",
          workoutName: "Descanso Pasivo Total",
          action: "MANTENER",
          justification: "Recuperación pasiva y equilibrio autonómico según matriz de disponibilidad.",
          isRestDay: true,
        };
      }

      if (disc === "Ciclismo") {
        const isLong = day === "Sábado" || day === "Domingo";
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: isLong ? "Fondo Resistencia Ciclismo (2h Z2)" : "Ciclismo Z2 Base Aeróbica",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Volumen aeróbico mitocondrial sin impacto osteoarticular.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", isLong ? "LONG_RUN" : "Z2_BASE", 65),
          isRestDay: false,
        };
      }

      if (disc === "Fuerza") {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Fuerza",
          workoutName: "Fuerza Sóleo / Pliometría Reactiva",
          action: "MANTENER",
          justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
          isRestDay: false,
        };
      }

      // Carrera por defecto
      const isQuality = day === "Martes" || day === "Jueves";
      const isLongRun = day === "Domingo" || day === "Sábado";

      if (isQuality && !isFatigued) {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Carrera",
          workoutName: "Series Umbral Stryd (4x8m @ 100% FTP)",
          action: "MANTENER",
          powerTarget: `${runFtp}W (100% CP)`,
          justification: "Estímulo de potencia crítica y tolerancia al lactato.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100),
          isRestDay: false,
        };
      }

      if (isLongRun && !isFatigued) {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Carrera",
          workoutName: "Tirada Larga Progresiva Stryd (22km)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: "Desarrollo de durabilidad y economía de carrera.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 88),
          isRestDay: false,
        };
      }

      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Carrera",
        workoutName: isFatigued ? "Rodaje Suave Z1 Regenerativo Stryd" : "Rodaje Progresivo Z1-Z2 Stryd (45m)",
        action: isFatigued ? "MODIFICAR" : "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.72)}W (72% CP)`,
        justification: isFatigued ? "Atenuación a Z1 para proteger tono parasimpático." : "Rodaje aeróbico base.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 72),
        isRestDay: false,
      };
    });

    return {
      status: status.status,
      summaryHeadline: isFatigued
        ? `Fatiga aguda detectada (TSB: ${status.tsb}, HRV Z-Score: ${status.hrvZScore ?? "N/D"}). Se prescribe modulación protectora de intensidad.`
        : `Estado adaptativo óptimo (TSB: ${status.tsb}). Microciclo balanceado para asimilación de potencia Stryd.`,
      macrocyclePhase: macrocyclePhase?.phaseLabel,
      reasoningTree: [
        `1. Contexto de Temporada: ${macroTitle}`,
        `2. Evaluación Banister: CTL=${status.ctl.toFixed(1)}, ATL=${status.atl.toFixed(1)}, TSB=${status.tsb.toFixed(1)}.`,
        `3. Análisis autonómico: Rolling HRV Z-Score=${status.hrvZScore ?? "0.0"}, FC Reposo=${status.restingHR ?? "50"} bpm.`,
        `4. Tasa de incremento: Ramp Rate Semanal=${status.rampRate.toFixed(1)} pts/semana (${status.rampRate > 8 ? "Elevado" : "Seguro"}).`,
        `5. Matriz Base: ${Object.entries(availability).map(([d, disc]) => `${d}: ${disc}`).join(", ")}.`,
      ],
      modelUsed: "Motor Fisiológico Determinístico",
      suggestedPlan,
    };
  }
}
