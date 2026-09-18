import { MacrocycleWeek, MacrocycleBlueprint } from "./macrocycle";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { getMondayOfWeekStr, getLocalTodayStr, formatLocalDateToYMD } from "@/lib/dateUtils";

export interface HistoricalWeeksOptions {
  blueprintStartDate?: string;
  dailyExecutedActivities?: DailyExecutedMap;
  maxWeeksBack?: number;
}

function getMonday(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildHistoricalCalendarWeeks(options: HistoricalWeeksOptions): MacrocycleWeek[] {
  const {
    blueprintStartDate,
    dailyExecutedActivities = {},
    maxWeeksBack = 16,
  } = options;

  const todayStr = getLocalTodayStr();
  const currentMondayStr = getMondayOfWeekStr();
  const referenceMondayStr = blueprintStartDate || currentMondayStr;
  const refMondayDate = getMonday(referenceMondayStr);

  const activityDates = Object.keys(dailyExecutedActivities).filter((d) => {
    const actData = dailyExecutedActivities[d];
    return actData && actData.activities && actData.activities.length > 0;
  }).sort();

  if (activityDates.length === 0) {
    return [];
  }

  const earliestActDate = activityDates[0];
  const earliestMonday = getMonday(earliestActDate);

  // Calcular cuántas semanas completas hay entre el lunes más antiguo y el lunes del plan
  const diffMs = refMondayDate.getTime() - earliestMonday.getTime();
  if (diffMs <= 0) {
    return [];
  }

  const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  const effectiveWeeksBack = Math.min(diffWeeks, maxWeeksBack);

  const historicalWeeks: MacrocycleWeek[] = [];

  for (let i = effectiveWeeksBack; i >= 1; i--) {
    const weekMon = new Date(refMondayDate);
    weekMon.setDate(refMondayDate.getDate() - i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const monStr = formatLocalDateToYMD(weekMon);
    const sunStr = formatLocalDateToYMD(weekSun);

    // Calcular TSS y minutos reales ejecutados en los 7 días de esta semana
    let weekExecutedTss = 0;
    let weekTotalMins = 0;
    const sportsFound = new Set<string>();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const curDay = new Date(weekMon);
      curDay.setDate(weekMon.getDate() + dayOffset);
      const dayStr = formatLocalDateToYMD(curDay);
      const dayData = dailyExecutedActivities[dayStr];
      if (dayData && dayData.activities) {
        weekExecutedTss += dayData.totalTss || 0;
        dayData.activities.forEach((a) => {
          weekTotalMins += a.movingTimeMin || 0;
          if (a.type) sportsFound.add(a.type);
        });
      }
    }

    const volumeHours = Number((weekTotalMins / 60).toFixed(1));
    const sportSummary = sportsFound.size > 0 ? Array.from(sportsFound).join(", ") : "Completada";

    const isPast = sunStr < todayStr;

    historicalWeeks.push({
      weekNumber: -i,
      countdownWeeks: 0,
      startDate: monStr,
      endDate: sunStr,
      formattedRange: `${monStr.slice(5)} - ${sunStr.slice(5)}`,
      phase: "BASE_1",
      phaseLabel: "Historial de Carga",
      microcycleType: "CARGA",
      microcycleLabel: `Semana Ejecutada (${weekExecutedTss} TSS)`,
      microcycleBadgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      targetTss: weekExecutedTss > 0 ? weekExecutedTss : 150,
      maxLongRunMinutes: 0,
      focusDescription: weekExecutedTss > 0
        ? `${weekExecutedTss} TSS registrados • ${volumeHours}h ejecutadas (${sportSummary})`
        : "Semana histórica registrada en Intervals.icu",
      isCurrentWeek: false,
      isRecoveryWeek: false,
      isPastWeek: isPast,
      isHistorical: true,
      volumeHours,
    } as any);
  }

  return historicalWeeks;
}

export function buildHistoricalBlueprint(
  dailyExecutedActivities: DailyExecutedMap = {},
  athleteProfile?: any
): MacrocycleBlueprint {
  const currentMondayStr = getMondayOfWeekStr();
  const todayStr = getLocalTodayStr();
  const pastWeeks = buildHistoricalCalendarWeeks({
    blueprintStartDate: currentMondayStr,
    dailyExecutedActivities,
    maxWeeksBack: 12,
  });

  const nowMonday = getMonday(currentMondayStr);
  const nowSunday = new Date(nowMonday);
  nowSunday.setDate(nowMonday.getDate() + 6);

  const currentWeek: MacrocycleWeek = {
    weekNumber: 1,
    countdownWeeks: 1,
    startDate: currentMondayStr,
    endDate: formatLocalDateToYMD(nowSunday),
    formattedRange: `${currentMondayStr.slice(5)} - ${formatLocalDateToYMD(nowSunday).slice(5)}`,
    phase: "BASE_1",
    phaseLabel: "Semana en Curso",
    microcycleType: "CARGA",
    microcycleLabel: "Semana Actual",
    microcycleBadgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    targetTss: 300,
    maxLongRunMinutes: 60,
    focusDescription: "Semana actual activa con telemetría viva de Intervals.icu",
    isCurrentWeek: true,
    isRecoveryWeek: false,
    isPastWeek: false,
  };

  const allWeeks = [...pastWeeks, currentWeek];

  return {
    id: "historical-timeline-blueprint",
    cycleTitle: "Historial de Carga & Entrenamientos Realizados",
    distanceType: "42k",
    startDate: allWeeks[0]?.startDate || currentMondayStr,
    totalWeeks: allWeeks.length,
    weeks: allWeeks,
    currentWeekIndex: allWeeks.length - 1,
    athleteCtlAtCreation: athleteProfile?.ctl || 40,
    availabilitySnapshot: undefined,
  } as any;
}
