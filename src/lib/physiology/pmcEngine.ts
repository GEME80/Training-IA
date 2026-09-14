import { AthleteWellness } from "../intervals/types";
import { MacrocycleBlueprint } from "./macrocycle";

export interface PMCDataPoint {
  date: string; // YYYY-MM-DD
  ctl: number;
  atl: number;
  tsb: number;
  isProjected: boolean;
  tss?: number;
  label?: string;
}

export interface PMCHistoricalSummary {
  peakCtlLastYear: number;
  minTsbRecorded: number;
  maxAtlRecorded: number;
  avgRampRate: number;
  annualVolumeTss: number;
  recordedDaysCount: number;
  lastKnownCtl: number;
  lastKnownAtl: number;
  lastKnownTsb: number;
}

export type PMCTimeframe = "3m" | "6m" | "1y";

/**
 * Computa la síntesis histórica de 365 días en memoria (< 150 bytes para la IA, $0 en Firestore)
 */
export function computePMCHistoricalSummary(wellness: AthleteWellness[]): PMCHistoricalSummary {
  if (!wellness || wellness.length === 0) {
    return {
      peakCtlLastYear: 0,
      minTsbRecorded: 0,
      maxAtlRecorded: 0,
      avgRampRate: 0,
      annualVolumeTss: 0,
      recordedDaysCount: 0,
      lastKnownCtl: 0,
      lastKnownAtl: 0,
      lastKnownTsb: 0,
    };
  }

  let peakCtl = 0;
  let minTsb = 0;
  let maxAtl = 0;
  let totalTss = 0;
  let rampRateSum = 0;
  let rampRateCount = 0;

  wellness.forEach((w) => {
    const ctl = typeof w.ctl === "number" ? w.ctl : 0;
    const atl = typeof w.atl === "number" ? w.atl : 0;
    const tsb = typeof w.tsb === "number" ? w.tsb : (ctl - atl);
    const tss = typeof w.ctlLoad === "number" ? w.ctlLoad : 0;

    if (ctl > peakCtl) peakCtl = ctl;
    if (tsb < minTsb) minTsb = tsb;
    if (atl > maxAtl) maxAtl = atl;
    totalTss += tss;

    if (typeof w.rampRate === "number" && w.rampRate > 0) {
      rampRateSum += w.rampRate;
      rampRateCount++;
    }
  });

  const lastW = wellness[wellness.length - 1];
  const lastCtl = typeof lastW.ctl === "number" ? lastW.ctl : 0;
  const lastAtl = typeof lastW.atl === "number" ? lastW.atl : 0;
  const lastTsb = typeof lastW.tsb === "number" ? lastW.tsb : (lastCtl - lastAtl);

  return {
    peakCtlLastYear: Math.round(peakCtl * 10) / 10,
    minTsbRecorded: Math.round(minTsb * 10) / 10,
    maxAtlRecorded: Math.round(maxAtl * 10) / 10,
    avgRampRate: rampRateCount > 0 ? Math.round((rampRateSum / rampRateCount) * 10) / 10 : 0,
    annualVolumeTss: Math.round(totalTss),
    recordedDaysCount: wellness.length,
    lastKnownCtl: Math.round(lastCtl * 10) / 10,
    lastKnownAtl: Math.round(lastAtl * 10) / 10,
    lastKnownTsb: Math.round(lastTsb * 10) / 10,
  };
}

/**
 * Genera la serie temporal combinada de Pasado Real + Proyección Futura de Banister
 */
export function generatePMCSeries(
  wellness: AthleteWellness[],
  blueprint: MacrocycleBlueprint | null,
  timeframe: PMCTimeframe = "6m",
  includeProjection: boolean = true
): { points: PMCDataPoint[]; summary: PMCHistoricalSummary } {
  const summary = computePMCHistoricalSummary(wellness);

  // 1. Filtrar histórico según ventana temporal seleccionada
  const today = new Date();
  const daysBack = timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : 365;
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const historicalPoints: PMCDataPoint[] = (wellness || [])
    .filter((w) => w.date >= cutoffStr)
    .map((w) => {
      const ctl = typeof w.ctl === "number" ? w.ctl : 0;
      const atl = typeof w.atl === "number" ? w.atl : 0;
      const tsb = typeof w.tsb === "number" ? w.tsb : (ctl - atl);
      return {
        date: w.date,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
        isProjected: false,
        tss: w.ctlLoad,
      };
    });

  if (historicalPoints.length > 0) {
    historicalPoints[historicalPoints.length - 1].label = "Hoy";
  }

  if (!includeProjection || !blueprint || !blueprint.weeks || blueprint.weeks.length === 0) {
    return { points: historicalPoints, summary };
  }

  // 2. Proyección Futura aplicando modelo de Banister (tau1=42, tau2=7)
  const projectedPoints: PMCDataPoint[] = [];
  let currentCtl = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].ctl
    : summary.lastKnownCtl;
  let currentAtl = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].atl
    : summary.lastKnownAtl;

  const lastDateStr = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].date
    : today.toISOString().split("T")[0];
  
  const cursorDate = new Date(lastDateStr);

  blueprint.weeks.forEach((week, wIdx) => {
    const weeklyTargetTss = week.targetTss || 350;
    // Distribución representativa semanal (más carga fin de semana y midweek)
    const dayTssWeights = [0.10, 0.15, 0.15, 0.05, 0.15, 0.25, 0.15];

    for (let d = 0; d < 7; d++) {
      cursorDate.setDate(cursorDate.getDate() + 1);
      const dateStr = cursorDate.toISOString().split("T")[0];
      const dailyTss = Math.round(weeklyTargetTss * dayTssWeights[d]);

      // Ecuaciones de Banister / Coggan
      currentCtl = currentCtl + (dailyTss - currentCtl) / 42;
      currentAtl = currentAtl + (dailyTss - currentAtl) / 7;
      const currentTsb = currentCtl - currentAtl;

      const isLastDay = wIdx === blueprint.weeks.length - 1 && d === 6;

      projectedPoints.push({
        date: dateStr,
        ctl: Math.round(currentCtl * 10) / 10,
        atl: Math.round(currentAtl * 10) / 10,
        tsb: Math.round(currentTsb * 10) / 10,
        isProjected: true,
        tss: dailyTss,
        label: isLastDay ? (blueprint.primaryRace?.name || "Carrera") : undefined,
      });
    }
  });

  return {
    points: [...historicalPoints, ...projectedPoints],
    summary,
  };
}
