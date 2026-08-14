import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";

export interface PlanItem {
  day: string; // "Lunes", "Martes", etc.
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "18 Ago"
  discipline: "Descanso" | "Carrera" | "Ciclismo" | "Fuerza";
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
   * Genera un análisis adaptativo del microciclo semanal a partir de los datos biométricos y directrices de IA.
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
      skipAI?: boolean;
    }
  ): Promise<AgentDecisionOutput> {
    const apiKey = options?.customApiKey || process.env.GEMINI_API_KEY;
    const weekDates = getWeekDates(weekOffset);

    // Si se solicita omitir la IA (para actualización rápida de telemetría) o no hay clave:
    if (options?.skipAI || !apiKey) {
      return this.generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase);
    }

    // Cascada de modelos dinámicos (sin fijar un único agente estático)
    const preferred = options?.preferredModel;
    const candidateModels = Array.from(
      new Set([
        preferred,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-pro",
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
MATRIZ BASE DE DISPONIBILIDAD:
- Lunes: Descanso total
- Martes: Carrera (Calidad / Umbral Stryd % FTP según fase)
- Miércoles: Ciclismo (Z2 Base % Bike FTP)
- Jueves: Fuerza / Prevención Sóleo
- Domingo: Carrera (Tirada Larga Progresiva Stryd)

REGLAS FISIOLÓGICAS DE REAJUSTE:
- Si TSB < -25 o HRV Z-Score < -1.5: Reducir carga drásticamente (convertir calidad en rodaje suave Z1 o descanso activo).
- Si Ramp Rate > +8: No aumentar volumen, consolidar meseta.
- Si -10 <= TSB <= +5 y HRV estable: Progresión nominal óptima.

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

        // Asignar fechas y documentos de sintaxis con formato estructurado
        parsed.suggestedPlan = parsed.suggestedPlan.map((item, idx) => {
          const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };
          const isRest = item.discipline === "Descanso" || item.action === "DESCANSO_ACTIVO";
          return {
            ...item,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            isRestDay: isRest,
            workoutDoc:
              item.workoutDoc ||
              (isRest
                ? undefined
                : PhysiologicalEngine.generateWorkoutSyntax(
                    item.discipline === "Ciclismo"
                      ? "Ride"
                      : item.discipline === "Fuerza"
                      ? "WeightTraining"
                      : "Run",
                    item.day === "Martes"
                      ? "THRESHOLD_INTERVALS"
                      : item.day === "Domingo"
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
    return this.generateDeterministicAnalysis(profile, physioStatus, weekDates);
  }

  /**
   * Generador determinístico de alta precisión en caso de desconexión con Gemini o modo rápido.
   */
  private static generateDeterministicAnalysis(
    profile: AthleteProfile,
    status: PhysiologicalStatus,
    weekDates: Array<{ day: string; date: string; formattedDate: string }>,
    macrocyclePhase?: MacrocyclePhaseInfo
  ): AgentDecisionOutput {
    const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
    const runFtp = profile.run_ftp ?? 285;
    const bikeFtp = profile.bike_ftp ?? 260;

    const macroTitle = macrocyclePhase?.primaryRace
      ? `Macrociclo: ${macrocyclePhase.phaseLabel} (${macrocyclePhase.weeksRemaining} sem para ${macrocyclePhase.primaryRace.name}).`
      : `Macrociclo: Mantenimiento General Adaptativo.`;

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
        `5. Decisión del Head Coach: ${
          isFatigued
            ? "Atenuar sesión de calidad del martes a rodaje Z1 suave y añadir descanso activo para asimilar la carga."
            : "Microciclo estándar de sobrecarga progresiva respetando el descanso del lunes."
        }`,
      ],
      modelUsed: "Motor Fisiológico Determinístico",
      suggestedPlan: [
        {
          day: "Lunes",
          date: weekDates[0]?.date ?? "",
          formattedDate: weekDates[0]?.formattedDate ?? "",
          discipline: "Descanso",
          workoutName: "Descanso Pasivo Total",
          action: "MANTENER",
          justification: "Recuperación pasiva y equilibrio del sistema nervioso autónomo.",
          isRestDay: true,
        },
        {
          day: "Martes",
          date: weekDates[1]?.date ?? "",
          formattedDate: weekDates[1]?.formattedDate ?? "",
          discipline: "Carrera",
          workoutName: isFatigued
            ? "Rodaje Suave Z1 Regenerativo Stryd"
            : "Series Umbral Stryd (4x8m @ 100% FTP)",
          action: isFatigued ? "MODIFICAR" : "MANTENER",
          powerTarget: isFatigued
            ? `${Math.round(runFtp * 0.7)}W (70% CP)`
            : `${runFtp}W (100% CP)`,
          justification: isFatigued
            ? "Modulación a Z1 para proteger tono parasimpático y evitar fatiga periférica."
            : "Estímulo de potencia crítica y tolerancia al lactato.",
          workoutDoc: isFatigued
            ? PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70)
            : PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100),
          isRestDay: false,
        },
        {
          day: "Miércoles",
          date: weekDates[2]?.date ?? "",
          formattedDate: weekDates[2]?.formattedDate ?? "",
          discipline: "Ciclismo",
          workoutName: "Ciclismo Z2 Base Aeróbica",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Volumen aeróbico mitocondrial sin impacto articular.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "Z2_BASE", 65),
          isRestDay: false,
        },
        {
          day: "Jueves",
          date: weekDates[3]?.date ?? "",
          formattedDate: weekDates[3]?.formattedDate ?? "",
          discipline: "Fuerza",
          workoutName: "Fuerza Sóleo / Pliometría Reactiva",
          action: "MANTENER",
          justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
          isRestDay: false,
        },
        {
          day: "Viernes",
          date: weekDates[4]?.date ?? "",
          formattedDate: weekDates[4]?.formattedDate ?? "",
          discipline: "Carrera",
          workoutName: "Rodaje Suave Z1-Z2 Stryd (40m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W (72% CP)`,
          justification: "Descarga activa previa al bloque de fin de semana.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 72),
          isRestDay: false,
        },
        {
          day: "Sábado",
          date: weekDates[5]?.date ?? "",
          formattedDate: weekDates[5]?.formattedDate ?? "",
          discipline: "Ciclismo",
          workoutName: "Fondo Resistencia Ciclismo (2h Z2)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Estímulo lipolítico de resistencia cardiovascular profunda.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "LONG_RUN", 65),
          isRestDay: false,
        },
        {
          day: "Domingo",
          date: weekDates[6]?.date ?? "",
          formattedDate: weekDates[6]?.formattedDate ?? "",
          discipline: "Carrera",
          workoutName: "Tirada Larga Progresiva Stryd (22km)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: "Desarrollo de durabilidad y economía de carrera.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 88),
          isRestDay: false,
        },
      ],
    };
  }
}
