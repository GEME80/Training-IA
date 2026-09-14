import { AthleteWellness } from "../intervals/types";
import { MacrocycleBlueprint } from "./macrocycle";

export interface PMCDataPoint {
  date: string; // YYYY-MM-DD
  ctl: number;
  atl: number;
  tsb: number;
  rampRate: number;
  // Métricas Esperadas / Planificadas por el Macrociclo
  plannedCtl?: number;
  plannedAtl?: number;
  plannedTsb?: number;
  plannedRampRate?: number;
  isInPlanWindow?: boolean;
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
  // Métricas de Comparativa Planificado vs Real
  plannedCtlToday?: number;
  ctlGapToday?: number;
  planCompliancePercent?: number;
  planStartDate?: string;
  raceDate?: string;
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
 * Genera la serie temporal combinada con Histórico Real y Curva Esperada del Plan (Banister)
 */
export function generatePMCSeries(
  wellness: AthleteWellness[],
  blueprint: MacrocycleBlueprint | null,
  timeframe: PMCTimeframe = "1y",
  includeProjection: boolean = true
): { points: PMCDataPoint[]; summary: PMCHistoricalSummary } {
  const summary = computePMCHistoricalSummary(wellness);

  // 1. Filtrar histórico según ventana temporal seleccionada
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const daysBack = timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : 365;
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  // 2. Si hay macrociclo activo, computar la trayectoria planificada día a día desde blueprint.startDate
  const plannedMap = new Map<string, { ctl: number; atl: number; tsb: number; ramp: number }>();
  let plannedStartCtl = summary.lastKnownCtl || 35;

  if (blueprint && blueprint.weeks && blueprint.weeks.length > 0) {
    const planStartStr = blueprint.startDate || blueprint.weeks[0]?.startDate || todayStr;
    summary.planStartDate = planStartStr;
    summary.raceDate = blueprint.raceDate || blueprint.primaryRace?.date || undefined;

    // Buscar el CTL real que tenía el atleta en la fecha de inicio del plan
    const matchStart = wellness.find((w) => w.date === planStartStr);
    if (matchStart && typeof matchStart.ctl === "number") {
      plannedStartCtl = matchStart.ctl;
    }

    let runPlannedCtl = plannedStartCtl;
    let runPlannedAtl = matchStart && typeof matchStart.atl === "number" ? matchStart.atl : plannedStartCtl;
    const planCursor = new Date(planStartStr + "T12:00:00");
    const dayWeights = [0.10, 0.15, 0.15, 0.05, 0.15, 0.25, 0.15];

    blueprint.weeks.forEach((week) => {
      const weeklyTss = week.targetTss || 350;
      for (let d = 0; d < 7; d++) {
        const dStr = planCursor.toISOString().split("T")[0];
        const dayTss = Math.round(weeklyTss * dayWeights[d]);

        const prevPlannedCtl = runPlannedCtl;
        runPlannedCtl = runPlannedCtl + (dayTss - runPlannedCtl) / 42;
        runPlannedAtl = runPlannedAtl + (dayTss - runPlannedAtl) / 7;
        const plannedTsb = runPlannedCtl - runPlannedAtl;
        const plannedRamp = Math.round((runPlannedCtl - prevPlannedCtl) * 7 * 10) / 10;

        plannedMap.set(dStr, {
          ctl: Math.round(runPlannedCtl * 10) / 10,
          atl: Math.round(runPlannedAtl * 10) / 10,
          tsb: Math.round(plannedTsb * 10) / 10,
          ramp: plannedRamp,
        });

        planCursor.setDate(planCursor.getDate() + 1);
      }
    });

    // Comparativa HOY
    const todayPlan = plannedMap.get(todayStr);
    if (todayPlan) {
      summary.plannedCtlToday = todayPlan.ctl;
      summary.ctlGapToday = Math.round((summary.lastKnownCtl - todayPlan.ctl) * 10) / 10;
      summary.planCompliancePercent = todayPlan.ctl > 0 ? Math.min(130, Math.round((summary.lastKnownCtl / todayPlan.ctl) * 100)) : 100;
    }
  }

  // 3. Puntos históricos reales
  const historicalPoints: PMCDataPoint[] = (wellness || [])
    .filter((w) => w.date >= cutoffStr)
    .map((w) => {
      const ctl = typeof w.ctl === "number" ? w.ctl : 0;
      const atl = typeof w.atl === "number" ? w.atl : 0;
      const tsb = typeof w.tsb === "number" ? w.tsb : (ctl - atl);
      const ramp = typeof w.rampRate === "number" ? Math.round(w.rampRate * 10) / 10 : 0;
      const planVal = plannedMap.get(w.date);

      return {
        date: w.date,
        ctl: Math.round(ctl * 10) / 10,
        atl: Math.round(atl * 10) / 10,
        tsb: Math.round(tsb * 10) / 10,
        rampRate: ramp,
        plannedCtl: planVal?.ctl,
        plannedAtl: planVal?.atl,
        plannedTsb: planVal?.tsb,
        plannedRampRate: planVal?.ramp,
        isInPlanWindow: Boolean(planVal),
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

  // 4. Proyección Futura desde HOY hasta el final del macrociclo
  const projectedPoints: PMCDataPoint[] = [];
  let currentCtl = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].ctl
    : summary.lastKnownCtl;
  let currentAtl = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].atl
    : summary.lastKnownAtl;

  const lastDateStr = historicalPoints.length > 0
    ? historicalPoints[historicalPoints.length - 1].date
    : todayStr;
  
  const cursorDate = new Date(lastDateStr + "T12:00:00");
  const remainingWeeks = blueprint.weeks.filter((w) => !w.isPastWeek);
  const weeksToProject = remainingWeeks.length > 0 ? remainingWeeks : blueprint.weeks;

  weeksToProject.forEach((week, wIdx) => {
    const weeklyTargetTss = week.targetTss || 350;
    const dayWeights = [0.10, 0.15, 0.15, 0.05, 0.15, 0.25, 0.15];

    for (let d = 0; d < 7; d++) {
      cursorDate.setDate(cursorDate.getDate() + 1);
      const dateStr = cursorDate.toISOString().split("T")[0];
      const dailyTss = Math.round(weeklyTargetTss * dayWeights[d]);

      const prevCtl = currentCtl;
      currentCtl = currentCtl + (dailyTss - currentCtl) / 42;
      currentAtl = currentAtl + (dailyTss - currentAtl) / 7;
      const currentTsb = currentCtl - currentAtl;

      const refPoint = projectedPoints[projectedPoints.length - 7] || historicalPoints[historicalPoints.length - 1];
      const projectedRamp = refPoint ? Math.round((currentCtl - refPoint.ctl) * 10) / 10 : Math.round((currentCtl - prevCtl) * 7 * 10) / 10;
      const planVal = plannedMap.get(dateStr);
      const isLastDay = wIdx === weeksToProject.length - 1 && d === 6;

      projectedPoints.push({
        date: dateStr,
        ctl: Math.round(currentCtl * 10) / 10,
        atl: Math.round(currentAtl * 10) / 10,
        tsb: Math.round(currentTsb * 10) / 10,
        rampRate: projectedRamp,
        plannedCtl: planVal?.ctl ?? Math.round(currentCtl * 10) / 10,
        plannedAtl: planVal?.atl ?? Math.round(currentAtl * 10) / 10,
        plannedTsb: planVal?.tsb ?? Math.round(currentTsb * 10) / 10,
        plannedRampRate: planVal?.ramp ?? projectedRamp,
        isInPlanWindow: true,
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
