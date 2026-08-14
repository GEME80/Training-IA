import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus } from "../physiology/engine";

export interface AgentDecisionOutput {
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  summaryHeadline: string;
  reasoningTree: string[];
  suggestedPlan: Array<{
    day: string; // "Lunes", "Martes", etc.
    discipline: "Descanso" | "Carrera" | "Ciclismo" | "Fuerza";
    workoutName: string;
    action: "MANTENER" | "MODIFICAR" | "REDUCIR_INTENSIDAD" | "DESCANSO_ACTIVO";
    powerTarget?: string;
    justification: string;
    workoutDoc?: string;
  }>;
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
    physioStatus: PhysiologicalStatus
  ): Promise<AgentDecisionOutput> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API Key de Gemini configurada, generamos el análisis determinístico basado en las reglas del motor fisiológico
    if (!apiKey) {
      return this.generateDeterministicAnalysis(profile, physioStatus);
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

      return JSON.parse(rawText) as AgentDecisionOutput;
    } catch (err) {
      console.warn("Fallo en Gemini API, utilizando motor fisiológico determinístico:", err);
      return this.generateDeterministicAnalysis(profile, physioStatus);
    }
  }

  /**
   * Generador determinístico de alta precisión en caso de desconexión con Gemini.
   */
  private static generateDeterministicAnalysis(
    profile: AthleteProfile,
    status: PhysiologicalStatus
  ): AgentDecisionOutput {
    const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
    const runFtp = profile.run_ftp ?? 280;

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
          discipline: "Descanso",
          workoutName: "Descanso Total",
          action: "MANTENER",
          justification: "Recuperación pasiva y equilibrio del sistema nervioso autónomo.",
        },
        {
          day: "Martes",
          discipline: "Carrera",
          workoutName: isFatigued ? "Rodaje Regenerativo Stryd Z1" : "Series Umbral Stryd (4x8m @ 100% FTP)",
          action: isFatigued ? "MODIFICAR" : "MANTENER",
          powerTarget: isFatigued ? `${Math.round(runFtp * 0.7)}W (70% CP)` : `${runFtp}W (100% CP)`,
          justification: isFatigued
            ? "Sustitución preventiva de calidad por rodaje suave debido a fatiga aguda."
            : "Estímulo de potencia crítica y tolerancia al lactato.",
        },
        {
          day: "Miércoles",
          discipline: "Ciclismo",
          workoutName: "Ciclismo Z2 Base Aeróbica",
          action: "MANTENER",
          powerTarget: `${Math.round((profile.bike_ftp ?? 250) * 0.65)}W (65% FTP)`,
          justification: "Volumen aeróbico mitocondrial sin impacto articular.",
        },
        {
          day: "Jueves",
          discipline: "Fuerza",
          workoutName: "Fuerza y Prevención Sóleo / Pliometría",
          action: "MANTENER",
          justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
        },
        {
          day: "Viernes",
          discipline: "Carrera",
          workoutName: "Rodaje Suave Z1-Z2 Stryd (40m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.72)}W (72% CP)`,
          justification: "Descarga activa previa al bloque de fin de semana.",
        },
        {
          day: "Sábado",
          discipline: "Ciclismo",
          workoutName: "Fondo Resistencia Ciclismo (2h Z2)",
          action: "MANTENER",
          powerTarget: `${Math.round((profile.bike_ftp ?? 250) * 0.65)}W (65% FTP)`,
          justification: "Estímulo lipolítico de resistencia cardiovascular profunda.",
        },
        {
          day: "Domingo",
          discipline: "Carrera",
          workoutName: isFatigued ? "Tirada Aeróbica Moderada (16km Z2)" : "Tirada Larga Progresiva Stryd (22km)",
          action: isFatigued ? "REDUCIR_INTENSIDAD" : "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: isFatigued
            ? "Ajuste de volumen dominical para evitar sobreentrenamiento."
            : "Desarrollo de durabilidad y economía de carrera.",
        },
      ],
    };
  }
}
