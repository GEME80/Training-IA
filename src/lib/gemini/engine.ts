import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";

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
}

/**
 * Obtiene el array de fechas (ISO y formateada) para los 7 días de la semana (Lunes a Domingo)
 * a partir de un offset de semana (0 = esta semana, 1 = próxima semana) o una fecha base.
 */
export function getWeekDates(weekOffset: number = 0, baseDate?: Date): Array<{ day: string; date: string; formattedDate: string }> {
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
 * Motor de Inteligencia Fisiológica con Google Gemini API.
 */
export class GeminiPhysiologicalAgent {
  /**
   * Genera un análisis adaptativo del microciclo semanal a partir de los datos biométricos.
   */
  static async analyzeMicrocycle(
    profile: AthleteProfile,
    wellness: AthleteWellness[],
    events: CalendarEvent[],
    physioStatus: PhysiologicalStatus,
    weekOffset: number = 0
  ): Promise<AgentDecisionOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    const weekDates = getWeekDates(weekOffset);

    // Si no hay API Key de Gemini configurada, generamos el análisis determinístico basado en las reglas del motor fisiológico
    if (!apiKey) {
      return this.generateDeterministicAnalysis(profile, physioStatus, weekDates);
    }

    try {
      const prompt = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia, potenciómetros Stryd y modelos Banister (CTL, ATL, TSB, Rolling HRV).
Analiza el siguiente atleta y genera un diagnóstico semanal con ajustes para cada día de la semana (Lunes a Domingo):

PERFIL Y MÉTRICAS:
- CTL (Fitness): ${physioStatus.ctl}
- ATL (Fatiga): ${physioStatus.atl}
- TSB (Forma): ${physioStatus.tsb}
- Ramp Rate: ${physioStatus.rampRate}
- HRV Actual (rMSSD): ${physioStatus.currentHrv ?? "N/A"} (Z-Score: ${physioStatus.hrvZScore ?? "N/A"}, Media Base: ${physioStatus.baselineHrvMean})
- FC Reposo: ${physioStatus.restingHR ?? "N/A"} bpm
- Potencia Crítica Carrera (Stryd Run FTP): ${profile.run_ftp ?? 280} W
- FTP Ciclismo: ${profile.bike_ftp ?? 250} W

MATRIZ BASE DISPONIBILIDAD:
- Lunes: Descanso total
- Martes: Carrera (Calidad / Umbral Stryd % FTP)
- Miércoles: Ciclismo (Z2 Base % Bike FTP)
- Jueves: Fuerza / Gym
- Viernes: Carrera (Regenerativo Z1-Z2)
- Sábado: Ciclismo (Fondo Resistencia)
- Domingo: Carrera (Fondo Largo / Bloques a ritmo objetivo)

REGLAS DE REAJUSTE:
- Si TSB < -25 o HRV Z-Score < -1.5: Reducir carga drásticamente (convertir calidad en rodaje Z1 o descanso).
- Si Ramp Rate > +8: No aumentar volumen, consolidar meseta.
- Si -10 <= TSB <= +5 y HRV estable: Progresión nominal óptima.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "status": "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED",
  "summaryHeadline": "Diagnóstico conciso en 1 frase",
  "reasoningTree": ["Paso 1 del análisis...", "Paso 2...", "Paso 3..."],
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

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        throw new Error(`Gemini API Error: ${res.statusText}`);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Respuesta vacía de Gemini");

      const parsed = JSON.parse(rawText) as AgentDecisionOutput;
      
      // Asignar fechas y documentos de sintaxis si no vienen definidos
      parsed.suggestedPlan = parsed.suggestedPlan.map((item, idx) => {
        const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };
        const isRest = item.discipline === "Descanso" || item.action === "DESCANSO_ACTIVO";
        return {
          ...item,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          isRestDay: isRest,
          workoutDoc: item.workoutDoc || (isRest ? undefined : PhysiologicalEngine.generateWorkoutSyntax(
            item.discipline === "Ciclismo" ? "Ride" : item.discipline === "Fuerza" ? "WeightTraining" : "Run",
            item.day === "Martes" ? "THRESHOLD_INTERVALS" : item.day === "Domingo" ? "LONG_RUN" : "RECOVERY"
          )),
        };
      });

      return parsed;
    } catch (err) {
      console.warn("Fallo en Gemini API, utilizando motor fisiológico determinístico:", err);
      return this.generateDeterministicAnalysis(profile, physioStatus, weekDates);
    }
  }

  /**
   * Generador determinístico de alta precisión en caso de desconexión con Gemini.
   */
  private static generateDeterministicAnalysis(
    profile: AthleteProfile,
    status: PhysiologicalStatus,
    weekDates: Array<{ day: string; date: string; formattedDate: string }>
  ): AgentDecisionOutput {
    const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
    const runFtp = profile.run_ftp ?? 285;
    const bikeFtp = profile.bike_ftp ?? 260;

    return {
      status: status.status,
      summaryHeadline: isFatigued
        ? `Fatiga aguda detectada (TSB: ${status.tsb}, HRV Z-Score: ${status.hrvZScore ?? "N/D"}). Se prescribe modulación protectora de intensidad.`
        : `Estado adaptativo óptimo (TSB: ${status.tsb}). Microciclo balanceado para asimilación de potencia Stryd.`,
      reasoningTree: [
        `1. Evaluación del PMC: CTL=${status.ctl}, ATL=${status.atl}, TSB=${status.tsb}.`,
        `2. Análisis autonómico: Rolling HRV Z-Score=${status.hrvZScore ?? "0.0"}, FC Reposo=${status.restingHR ?? "Normal"}.`,
        `3. Tasa de incremento: Ramp Rate Semanal=${status.rampRate} pts/semana (${status.rampRate > 8 ? "Sobrecarga" : "Seguro"}).`,
        `4. Decisión del Head Coach: ${isFatigued ? "Reducción de estímulos glucolíticos y preservación de trabajo regenerativo." : "Microciclo estándar de sobrecarga progresiva respetando el descanso."}`,
      ],
      suggestedPlan: [
        {
          day: "Lunes",
          date: weekDates[0]?.date || "",
          formattedDate: weekDates[0]?.formattedDate || "",
          discipline: "Descanso",
          workoutName: "Descanso Pasivo Total",
          action: "MANTENER",
          isRestDay: true,
          justification: "Recuperación pasiva y equilibrio del sistema nervioso autónomo.",
        },
        {
          day: "Martes",
          date: weekDates[1]?.date || "",
          formattedDate: weekDates[1]?.formattedDate || "",
          discipline: "Carrera",
          workoutName: isFatigued ? "Rodaje Regenerativo Stryd Z1" : "Series Umbral Stryd (4x8m @ 100% FTP)",
          action: isFatigued ? "MODIFICAR" : "MANTENER",
          powerTarget: isFatigued ? `${Math.round(runFtp * 0.7)}W (70% CP)` : `${runFtp}W (100% CP)`,
          justification: isFatigued
            ? "Sustitución preventiva de calidad por rodaje suave debido a fatiga aguda."
            : "Estímulo de potencia crítica y tolerancia al lactato.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", isFatigued ? "RECOVERY" : "THRESHOLD_INTERVALS", 100),
        },
        {
          day: "Miércoles",
          date: weekDates[2]?.date || "",
          formattedDate: weekDates[2]?.formattedDate || "",
          discipline: "Ciclismo",
          workoutName: "Ciclismo Z2 Base Aeróbica",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Volumen aeróbico mitocondrial sin impacto articular.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "Z2_BASE"),
        },
        {
          day: "Jueves",
          date: weekDates[3]?.date || "",
          formattedDate: weekDates[3]?.formattedDate || "",
          discipline: "Fuerza",
          workoutName: "Fuerza Sóleo / Pliometría Reactiva",
          action: "MANTENER",
          justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
        },
        {
          day: "Viernes",
          date: weekDates[4]?.date || "",
          formattedDate: weekDates[4]?.formattedDate || "",
          discipline: "Carrera",
          workoutName: "Rodaje Suave Z1-Z2 Stryd (40m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W (72% CP)`,
          justification: "Descarga activa previa al bloque de fin de semana.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 72),
        },
        {
          day: "Sábado",
          date: weekDates[5]?.date || "",
          formattedDate: weekDates[5]?.formattedDate || "",
          discipline: "Ciclismo",
          workoutName: "Fondo Resistencia Ciclismo (2h Z2)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Estímulo lipolítico de resistencia cardiovascular profunda.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", "LONG_RUN"),
        },
        {
          day: "Domingo",
          date: weekDates[6]?.date || "",
          formattedDate: weekDates[6]?.formattedDate || "",
          discipline: "Carrera",
          workoutName: isFatigued ? "Tirada Aeróbica Moderada (16km Z2)" : "Tirada Larga Progresiva Stryd (22km)",
          action: isFatigued ? "REDUCIR_INTENSIDAD" : "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: isFatigued
            ? "Ajuste de volumen dominical para evitar sobreentrenamiento."
            : "Desarrollo de durabilidad y economía de carrera.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", isFatigued ? "RECOVERY" : "LONG_RUN", 88),
        },
      ],
    };
  }
}
