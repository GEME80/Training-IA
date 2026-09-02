import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export interface TokenUsageRecord {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  model: string;
  feature: "CHAT_HEADCOACH" | "MACROCYCLE_GENERATOR" | "WORKOUT_EVALUATOR" | "OTHER";
  estimatedCostUsd: number;
  timestamp: string;
}

export interface DailyTokenSummary {
  date: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  requests: number;
  estimatedCostUsd: number;
}

export interface MonthlyTokenDocument {
  year: number;
  month: number;
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalTokens: number;
  totalRequests: number;
  totalEstimatedCostUsd: number;
  byModel: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }>;
  byFeature: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }>;
  daily: Record<string, DailyTokenSummary>;
  updatedAt: string;
}

// Tarifas oficiales de Google Cloud Gemini API (por 1M de tokens)
const GEMINI_PRICING: Record<string, { promptPer1M: number; candidatePer1M: number }> = {
  "gemini-2.5-flash": { promptPer1M: 0.075, candidatePer1M: 0.30 },
  "gemini-2.0-flash": { promptPer1M: 0.10, candidatePer1M: 0.40 },
  "gemini-1.5-flash": { promptPer1M: 0.075, candidatePer1M: 0.30 },
  "gemini-1.5-pro": { promptPer1M: 1.25, candidatePer1M: 5.00 },
  "gemini-flash-latest": { promptPer1M: 0.075, candidatePer1M: 0.30 },
};

export function calculateGeminiCost(model: string, promptTokens: number, candidatesTokens: number): number {
  const cleanModel = model.replace(/^models\//, "");
  const pricing = GEMINI_PRICING[cleanModel] || GEMINI_PRICING["gemini-2.5-flash"];
  const promptCost = (promptTokens / 1_000_000) * pricing.promptPer1M;
  const candidateCost = (candidatesTokens / 1_000_000) * pricing.candidatePer1M;
  return Number((promptCost + candidateCost).toFixed(6));
}

/**
 * Registra el consumo de tokens en Firestore usando el esquema de 1 documento por mes (YYYY-MM)
 * Máxima eficiencia: $0.00 en capa Always Free.
 */
export async function trackGeminiUsage(
  model: string,
  promptTokens: number,
  candidatesTokens: number,
  feature: "CHAT_HEADCOACH" | "MACROCYCLE_GENERATOR" | "WORKOUT_EVALUATOR" | "OTHER" = "CHAT_HEADCOACH"
): Promise<void> {
  try {
    const totalTokens = promptTokens + candidatesTokens;
    const cost = calculateGeminiCost(model, promptTokens, candidatesTokens);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const monthDocId = `${year}-${month}`;
    const dateKey = `${year}-${month}-${day}`;

    const docRef = doc(db, "ai_token_usage", monthDocId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Crear documento mensual inicial
      const initialDoc: MonthlyTokenDocument = {
        year,
        month: Number(month),
        totalPromptTokens: promptTokens,
        totalCandidatesTokens: candidatesTokens,
        totalTokens,
        totalRequests: 1,
        totalEstimatedCostUsd: cost,
        byModel: {
          [model]: { promptTokens, candidatesTokens, totalTokens, requests: 1, costUsd: cost },
        },
        byFeature: {
          [feature]: { promptTokens, candidatesTokens, totalTokens, requests: 1, costUsd: cost },
        },
        daily: {
          [dateKey]: {
            date: dateKey,
            promptTokens,
            candidatesTokens,
            totalTokens,
            requests: 1,
            estimatedCostUsd: cost,
          },
        },
        updatedAt: now.toISOString(),
      };
      await setDoc(docRef, initialDoc);
    } else {
      // Actualizar documento mensual existente
      const data = docSnap.data() as MonthlyTokenDocument;
      const currentDaily = data.daily?.[dateKey] || {
        date: dateKey,
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        requests: 0,
        estimatedCostUsd: 0,
      };

      const currentModel = data.byModel?.[model] || {
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        requests: 0,
        costUsd: 0,
      };

      const currentFeature = data.byFeature?.[feature] || {
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        requests: 0,
        costUsd: 0,
      };

      const updatedDaily: DailyTokenSummary = {
        date: dateKey,
        promptTokens: currentDaily.promptTokens + promptTokens,
        candidatesTokens: currentDaily.candidatesTokens + candidatesTokens,
        totalTokens: currentDaily.totalTokens + totalTokens,
        requests: currentDaily.requests + 1,
        estimatedCostUsd: Number((currentDaily.estimatedCostUsd + cost).toFixed(6)),
      };

      const updatedModel = {
        promptTokens: currentModel.promptTokens + promptTokens,
        candidatesTokens: currentModel.candidatesTokens + candidatesTokens,
        totalTokens: currentModel.totalTokens + totalTokens,
        requests: currentModel.requests + 1,
        costUsd: Number((currentModel.costUsd + cost).toFixed(6)),
      };

      const updatedFeature = {
        promptTokens: currentFeature.promptTokens + promptTokens,
        candidatesTokens: currentFeature.candidatesTokens + candidatesTokens,
        totalTokens: currentFeature.totalTokens + totalTokens,
        requests: currentFeature.requests + 1,
        costUsd: Number((currentFeature.costUsd + cost).toFixed(6)),
      };

      await updateDoc(docRef, {
        totalPromptTokens: increment(promptTokens),
        totalCandidatesTokens: increment(candidatesTokens),
        totalTokens: increment(totalTokens),
        totalRequests: increment(1),
        totalEstimatedCostUsd: Number(((data.totalEstimatedCostUsd || 0) + cost).toFixed(6)),
        [`daily.${dateKey}`]: updatedDaily,
        [`byModel.${model}`]: updatedModel,
        [`byFeature.${feature}`]: updatedFeature,
        updatedAt: now.toISOString(),
      });
    }
  } catch (err) {
    console.warn("No se pudo registrar la telemetría de tokens en Firestore:", err);
  }
}

/**
 * Consulta el resumen de consumo de tokens (diario, mensual, anual)
 */
export async function getAggregatedTokenUsage(period: "daily" | "monthly" | "yearly" = "monthly") {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const monthStr = String(currentMonthNum).padStart(2, "0");
  const dayStr = String(now.getDate()).padStart(2, "0");
  const todayKey = `${currentYear}-${monthStr}-${dayStr}`;
  const currentMonthDocId = `${currentYear}-${monthStr}`;

  try {
    if (period === "daily") {
      const docRef = doc(db, "ai_token_usage", currentMonthDocId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as MonthlyTokenDocument;
        const todayData = data.daily?.[todayKey];
        if (todayData) {
          return {
            period: "daily",
            date: todayKey,
            promptTokens: todayData.promptTokens,
            candidatesTokens: todayData.candidatesTokens,
            totalTokens: todayData.totalTokens,
            requests: todayData.requests,
            estimatedCostUsd: todayData.estimatedCostUsd,
            byModel: data.byModel || {},
            byFeature: data.byFeature || {},
            timeline: [todayData],
          };
        }
      }
      return {
        period: "daily",
        date: todayKey,
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        requests: 0,
        estimatedCostUsd: 0,
        byModel: {},
        byFeature: {},
        timeline: [],
      };
    }

    if (period === "monthly") {
      const docRef = doc(db, "ai_token_usage", currentMonthDocId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as MonthlyTokenDocument;
        const dailyArray = Object.values(data.daily || {}).sort((a, b) => a.date.localeCompare(b.date));

        return {
          period: "monthly",
          month: currentMonthDocId,
          promptTokens: data.totalPromptTokens || 0,
          candidatesTokens: data.totalCandidatesTokens || 0,
          totalTokens: data.totalTokens || 0,
          requests: data.totalRequests || 0,
          estimatedCostUsd: data.totalEstimatedCostUsd || 0,
          byModel: data.byModel || {},
          byFeature: data.byFeature || {},
          timeline: dailyArray,
        };
      }
      return {
        period: "monthly",
        month: currentMonthDocId,
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        requests: 0,
        estimatedCostUsd: 0,
        byModel: {},
        byFeature: {},
        timeline: [],
      };
    }

    // Yearly: Sumar los 12 meses del año actual
    let yearPrompt = 0;
    let yearCandidates = 0;
    let yearTotal = 0;
    let yearRequests = 0;
    let yearCost = 0;
    const yearByModel: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }> = {};
    const yearByFeature: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }> = {};
    const monthlyTimeline: { month: string; totalTokens: number; requests: number; costUsd: number }[] = [];

    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, "0");
      const mDocId = `${currentYear}-${mStr}`;
      const docRef = doc(db, "ai_token_usage", mDocId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const d = docSnap.data() as MonthlyTokenDocument;
        yearPrompt += d.totalPromptTokens || 0;
        yearCandidates += d.totalCandidatesTokens || 0;
        yearTotal += d.totalTokens || 0;
        yearRequests += d.totalRequests || 0;
        yearCost += d.totalEstimatedCostUsd || 0;

        monthlyTimeline.push({
          month: mDocId,
          totalTokens: d.totalTokens || 0,
          requests: d.totalRequests || 0,
          costUsd: d.totalEstimatedCostUsd || 0,
        });

        // Sumar byModel
        for (const [modKey, modVal] of Object.entries(d.byModel || {})) {
          if (!yearByModel[modKey]) {
            yearByModel[modKey] = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, requests: 0, costUsd: 0 };
          }
          yearByModel[modKey].promptTokens += modVal.promptTokens;
          yearByModel[modKey].candidatesTokens += modVal.candidatesTokens;
          yearByModel[modKey].totalTokens += modVal.totalTokens;
          yearByModel[modKey].requests += modVal.requests;
          yearByModel[modKey].costUsd = Number((yearByModel[modKey].costUsd + modVal.costUsd).toFixed(6));
        }

        // Sumar byFeature
        for (const [featKey, featVal] of Object.entries(d.byFeature || {})) {
          if (!yearByFeature[featKey]) {
            yearByFeature[featKey] = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, requests: 0, costUsd: 0 };
          }
          yearByFeature[featKey].promptTokens += featVal.promptTokens;
          yearByFeature[featKey].candidatesTokens += featVal.candidatesTokens;
          yearByFeature[featKey].totalTokens += featVal.totalTokens;
          yearByFeature[featKey].requests += featVal.requests;
          yearByFeature[featKey].costUsd = Number((yearByFeature[featKey].costUsd + featVal.costUsd).toFixed(6));
        }
      }
    }

    return {
      period: "yearly",
      year: currentYear,
      promptTokens: yearPrompt,
      candidatesTokens: yearCandidates,
      totalTokens: yearTotal,
      requests: yearRequests,
      estimatedCostUsd: Number(yearCost.toFixed(6)),
      byModel: yearByModel,
      byFeature: yearByFeature,
      timeline: monthlyTimeline,
    };
  } catch (err) {
    console.error("Error al consultar telemetría de tokens agregada:", err);
    return {
      period,
      promptTokens: 0,
      candidatesTokens: 0,
      totalTokens: 0,
      requests: 0,
      estimatedCostUsd: 0,
      byModel: {},
      byFeature: {},
      timeline: [],
    };
  }
}
