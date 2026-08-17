import { AthleteProfile } from "../intervals/types";
import { PhysiologicalStatus } from "../physiology/engine";
import { MacrocycleBlueprint } from "../physiology/macrocycle";
import { WizardPlanConfig, generateWizardMacrocycle } from "../physiology/macrocycleWizard";

export interface AIMacrocycleResponse {
  success: boolean;
  reasoningHeadline: string;
  reasoningNotes: string[];
  projectedPeakCtl: number;
  recommendedRampRate: number;
  blueprint: MacrocycleBlueprint;
  modelUsed: string;
}

export class MacrocycleAIEngine {
  /**
   * Genera o personaliza un macrociclo completo utilizando la IA de Gemini
   * cruzando la telemetría viva de Intervals.icu con el objetivo de competición o momento del atleta.
   */
  static async generatePersonalizedMacrocycle(
    profile: AthleteProfile,
    physioStatus: PhysiologicalStatus,
    config: WizardPlanConfig,
    options?: {
      geminiApiKey?: string;
      selectedModel?: string;
      customPrompt?: string;
    }
  ): Promise<AIMacrocycleResponse> {
    const apiKey = options?.geminiApiKey || process.env.GEMINI_API_KEY;
    const baseBlueprint = generateWizardMacrocycle(config);

    // Si no hay API Key o falla la llamada externa, retornamos el cálculo fisiológico determinístico
    if (!apiKey) {
      return {
        success: true,
        reasoningHeadline: `Periodización Fisiológica Calculada para ${config.raceName || "Temporada"}`,
        reasoningNotes: [
          `CTL Inicial del Atleta: ${physioStatus.ctl.toFixed(1)} | ATL: ${physioStatus.atl.toFixed(1)} | TSB: ${physioStatus.tsb.toFixed(1)}`,
          `Rampa de progresión controlada (+4 a +6 CTL/semana) con descarga biológica 3:1 cada 4ª semana.`,
          config.hasRace
            ? `Detección de evento objetivo para el ${config.raceDate}. Ciclo específico de 16 semanas con fondos de hasta 34 km y bloques a potencia Stryd.`
            : `Foco en mantenimiento adaptativo y salud articular de sóleo/Aquiles con TSB neutro.`,
        ],
        projectedPeakCtl: Math.min(105, Math.round(physioStatus.ctl + 25)),
        recommendedRampRate: 4.8,
        blueprint: baseBlueprint,
        modelUsed: "Motor Fisiológico SGEA (Algorítmico)",
      };
    }

    try {
      const prompt = `
Actúas como el Head Coach Fisiológico Digital (SGEA) de un atleta de alto rendimiento.
Debes analizar su telemetría actual y personalizar el Plan Rector del Macrociclo para su objetivo de temporada.

DATOS FISIOLÓGICOS DEL ATLETA (INTERVALS.ICU):
- Nombre: ${profile.name || "Atleta"}
- CTL Actual (Fitness Crónico): ${physioStatus.ctl.toFixed(1)}
- ATL Actual (Fatiga Aguda): ${physioStatus.atl.toFixed(1)}
- TSB Actual (Forma / Balance): ${physioStatus.tsb.toFixed(1)}
- Ramp Rate Actual: ${physioStatus.rampRate.toFixed(1)} CTL/semana
- Potencia Crítica de Carrera (Stryd CP / Run FTP): ${profile.run_ftp || 285} W
- Potencia Umbral de Ciclismo (Bike FTP): ${profile.bike_ftp || 260} W
- FC en Reposo: ${profile.restingHR || 46} bpm

OBJETIVO CONFIGURADO POR EL ATLETA:
- Tipo: ${config.hasRace ? `Competición Oficial (${config.raceName}, Distancia: ${config.raceDistance}, Fecha: ${config.raceDate}, Meta: ${config.raceGoal})` : `Momento del Atleta (${config.athleteMoment})`}
- Macrociclo Rector Activo: ${baseBlueprint.mode === "PRE_SEASON_MAINTENANCE" ? `Fase Puente de Mantenimiento Adaptativo & Consolidación (${baseBlueprint.totalWeeks} semanas) hasta el Kickoff del ciclo específico de 16 semanas.` : `${baseBlueprint.cycleTitle} (${baseBlueprint.totalWeeks} semanas)`}

DIRECTIVAS FISIOLÓGICAS:
1. ${baseBlueprint.mode === "PRE_SEASON_MAINTENANCE" ? `Estructurar las ${baseBlueprint.totalWeeks} semanas de mantenimiento con consistencia aeróbica, TSB neutro, tests de calibración (Test Stryd CP en S4 y Test Bike FTP en S8) y semanas de asimilación 3:1 sin fatiga residual acumulada.` : `Asegurar que la tasa de incremento de carga (Ramp Rate) no supere +6.0 CTL/semana para prevenir lesiones y sobreentrenamiento.`}
2. Garantizar semanas de descarga de asimilación biológica bajo la regla 3:1 (reducción del 25-35% de TSS y volumen).
3. Prescribir las sesiones clave calculadas exactamente a los vatios reales del atleta (% CP Stryd y % FTP Ciclismo).

Responde ÚNICAMENTE con un JSON válido con la siguiente estructura:
{
  "reasoningHeadline": "Breve titular de 1 línea sobre la estrategia del macrociclo",
  "reasoningNotes": [
    "Punto clave 1 sobre cómo se adapta el plan al CTL actual del atleta",
    "Punto clave 2 sobre la distribución de las fases y semanas de descarga 3:1",
    "Punto clave 3 sobre los picos de volumen y vatios Stryd específicos"
  ],
  "projectedPeakCtl": 88,
  "recommendedRampRate": 5.2
}
`;

      const model = options?.selectedModel || "gemini-2.5-flash";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Error API Gemini: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          success: true,
          reasoningHeadline: parsed.reasoningHeadline || `Macrociclo Personalizado con IA`,
          reasoningNotes: parsed.reasoningNotes || [],
          projectedPeakCtl: parsed.projectedPeakCtl || Math.round(physioStatus.ctl + 20),
          recommendedRampRate: parsed.recommendedRampRate || 5.0,
          blueprint: baseBlueprint,
          modelUsed: model,
        };
      }
    } catch (aiErr) {
      console.warn("Fallo en inferencia IA del macrociclo, recurriendo a modelo determinístico:", aiErr);
    }

    return {
      success: true,
      reasoningHeadline: `Periodización Fisiológica para ${config.raceName || "Temporada"}`,
      reasoningNotes: [
        `CTL Inicial: ${physioStatus.ctl.toFixed(1)} | Stryd CP: ${profile.run_ftp || 285}W`,
        `Progresión 3:1 adaptada a la distancia ${config.raceDistance || "42k"}.`,
      ],
      projectedPeakCtl: Math.round(physioStatus.ctl + 20),
      recommendedRampRate: 5.0,
      blueprint: baseBlueprint,
      modelUsed: "Motor Fisiológico SGEA",
    };
  }
}
