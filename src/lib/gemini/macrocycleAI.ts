import { AthleteProfile } from "../intervals/types";
import { PhysiologicalStatus } from "../physiology/engine";
import { MacrocycleBlueprint } from "../physiology/macrocycle";
import { WizardPlanConfig } from "../physiology/macrocycleWizard";
import { generateCustomMacrocycleBlueprint } from "../physiology/macrocycleGenerator";
import { trackGeminiUsage } from "../ai/telemetry";
import { buildMacrocycleArchitectSystemPrompt, DEFAULT_PROMPTS } from "../ai/prompts";
import { resolveTrainingModel, computePhaseWeeksDistribution } from "../ai/knowledge";

export interface AIMacrocycleResponse {
  success: boolean;
  reasoningHeadline: string;
  reasoningNotes: string[];
  projectedPeakCtl: number;
  recommendedRampRate: number;
  blueprint: MacrocycleBlueprint;
  modelUsed: string;
  trainingModelApplied?: string;
}

export class MacrocycleAIEngine {
  /**
   * Genera o personaliza un macrociclo completo utilizando la IA de Gemini
   * cruzando la telemetría viva de Intervals.icu con el objetivo, modelo curado rector y tests programados.
   */
  static async generatePersonalizedMacrocycle(
    profile: AthleteProfile,
    physioStatus: PhysiologicalStatus,
    config: WizardPlanConfig & { periodization?: string; trainingApproach?: string; targetDistance?: string; weeklyAvailability?: Record<string, any> },
    options?: {
      geminiApiKey?: string;
      selectedModel?: string;
      customPrompt?: string;
    }
  ): Promise<AIMacrocycleResponse> {
    const rawApiKey = options?.geminiApiKey || process.env.GEMINI_API_KEY;
    const apiKey = (rawApiKey || "").toString().replace(/^[\"']|[\"']$/g, "").trim();

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() + (day === 0 ? 1 : 8 - day);
    const startDate = config.startDate || new Date(today.setDate(diff)).toISOString().split("T")[0];

    const distType = (config.targetDistance || config.raceDistance || "42k") as any;
    const requestedWeeks = config.weeksCount || 16;

    // 1. Resolver modelo científico rector (Canova / Coggan / Friel / Koop / Seiler)
    const curatedModel = resolveTrainingModel({
      targetDistance: config.targetDistance,
      raceDistance: config.raceDistance,
      athleteMoment: config.athleteMoment,
      trainingApproach: config.trainingApproach,
      raceName: config.raceName,
    });

    const isPreventive = config.periodization === "2:1" || !config.periodization;

    const baseBlueprint = generateCustomMacrocycleBlueprint({
      distanceType: distType,
      startDate,
      weeksCount: requestedWeeks,
      customGoal: `${config.raceName || "Macrociclo de Temporada"}. Metodología: ${curatedModel.displayName}`,
      periodization: (config.periodization as any) || "2:1",
      primaryRace: config.hasRace || config.raceName ? {
        id: `race-${Date.now()}`,
        name: config.raceName || "Competición Objetivo",
        date: config.raceDate || "",
        distance: distType,
        priority: "A",
        goalTarget: config.raceGoal || "Pico de Forma",
      } : undefined,
      athleteMetrics: {
        ctl: profile.ctl || physioStatus.ctl,
        runFtp: profile.run_ftp,
        bikeFtp: profile.bike_ftp,
        weightKg: profile.weight,
        lthr: profile.lthr,
        // ✅ Matriz Semanal del Atleta propagada al motor generador
        weeklyAvailability: config.weeklyAvailability as any,
      },


    });

    // Anotar los tests fisiológicos programados en los focusDescription de las semanas correspondientes
    curatedModel.mandatoryTests.forEach((test) => {
      const targetWk = baseBlueprint.weeks.find((w) => w.weekNumber === test.recommendedWeekIndex);
      if (targetWk) {
        targetWk.focusDescription = `🧪 ${test.testName} • ${targetWk.focusDescription}`;
      }
    });

    const defaultNotes = [
      `Metodología oficial aplicada: ${curatedModel.displayName} (${curatedModel.scientificAuthors.join(", ")}).`,
      `Periodización en ${baseBlueprint.weeks.length} semanas estructuradas con ratio ${isPreventive ? "Preventivo (2:1)" : "Estándar (3:1)"} para asimilación biológica.`,
      `Pauta de Tirada Larga: ${curatedModel.longRunRules.description} (${curatedModel.longRunRules.targetIntensityPercentCpOrFtp}).`,
      `Tests de Campo Fisiológicos programados: ${curatedModel.mandatoryTests.map((t) => `Sem ${t.recommendedWeekIndex} (${t.testName})`).join(", ") || "Calibración continua"}.`,
      `Calibración por vatios: Stryd CP ${profile.run_ftp || 327}W y Bike FTP ${profile.bike_ftp || 240}W.`,
    ];

    if (!apiKey) {
      return {
        success: true,
        reasoningHeadline: `Periodización Científica (${curatedModel.displayName}) • ${baseBlueprint.weeks.length} Semanas`,
        reasoningNotes: defaultNotes,
        projectedPeakCtl: Math.min(105, Math.round((profile.ctl || physioStatus.ctl || 42) + baseBlueprint.weeks.length * 1.5)),
        recommendedRampRate: curatedModel.banisterRampRateLimits.maxCtlPerWeek,
        blueprint: baseBlueprint,
        modelUsed: "Motor Fisiológico PULSE (Algorítmico)",
        trainingModelApplied: curatedModel.displayName,
      };
    }

    try {
      const prompt = buildMacrocycleArchitectSystemPrompt(
        options?.customPrompt || DEFAULT_PROMPTS.macrocyclePrompt,
        {
          profile,
          physioStatus,
          config: {
            ...config,
            weeksCount: baseBlueprint.weeks.length,
          },
          customPromptDirective: options?.customPrompt,
        }
      );

      const model = options?.selectedModel && !options.selectedModel.includes("3.5")
        ? options.selectedModel
        : "gemini-2.5-flash";

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.usageMetadata) {
          const pTokens = Number(data.usageMetadata.promptTokenCount) || 0;
          const cTokens = Number(data.usageMetadata.candidatesTokenCount) || 0;
          trackGeminiUsage(model, pTokens, cTokens, "MACROCYCLE_GENERATOR").catch(() => {});
        }
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            success: true,
            reasoningHeadline: parsed.reasoningHeadline || `Periodización Científica (${curatedModel.displayName})`,
            reasoningNotes: Array.isArray(parsed.reasoningNotes) && parsed.reasoningNotes.length > 0 ? parsed.reasoningNotes : defaultNotes,
            projectedPeakCtl: parsed.projectedPeakCtl || Math.round((profile.ctl || physioStatus.ctl || 42) + baseBlueprint.weeks.length * 1.5),
            recommendedRampRate: parsed.recommendedRampRate || curatedModel.banisterRampRateLimits.maxCtlPerWeek,
            blueprint: baseBlueprint,
            modelUsed: model,
            trainingModelApplied: curatedModel.displayName,
          };
        }
      }
    } catch (aiErr) {
      console.warn("Fallo en inferencia IA del macrociclo, recurriendo a modelo determinístico:", aiErr);
    }

    return {
      success: true,
      reasoningHeadline: `Periodización Científica (${curatedModel.displayName}) • ${baseBlueprint.weeks.length} Semanas`,
      reasoningNotes: defaultNotes,
      projectedPeakCtl: Math.round((profile.ctl || physioStatus.ctl || 42) + baseBlueprint.weeks.length * 1.5),
      recommendedRampRate: curatedModel.banisterRampRateLimits.maxCtlPerWeek,
      blueprint: baseBlueprint,
      modelUsed: "Motor Fisiológico PULSE",
      trainingModelApplied: curatedModel.displayName,
    };
  }
}
