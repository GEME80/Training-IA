import { MacrocycleWeek, MacrocycleBlueprint } from "./macrocycle";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { getMondayOfWeekStr, getLocalTodayStr, formatLocalDateToYMD } from "@/lib/dateUtils";

export interface HistoricalWeeksOptions {
  blueprintStartDate?: string;
  dailyExecutedActivities?: DailyExecutedMap;
  /** Cuántas semanas hacia atrás construir. Por defecto 52 (1 año completo). */
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

/**
 * Construye las semanas históricas ejecutadas ANTERIORES al inicio del blueprint
 * (o de la semana actual si no hay blueprint).
 *
 * El arreglo devuelto está ordenado de **MÁS RECIENTE a MÁS ANTIGUA**, de modo
 * que al renderizarlo debajo de la semana actual en el scroll continuo, el
 * atleta ve primero las semanas más cercanas al presente.
 */
export function buildHistoricalCalendarWeeks(options: HistoricalWeeksOptions): MacrocycleWeek[] {
  const {
    blueprintStartDate,
    dailyExecutedActivities = {},
    maxWeeksBack = 52,
  } = options;

  const todayStr = getLocalTodayStr();
  const currentMondayStr = getMondayOfWeekStr();
  // La referencia es el lunes actual o el inicio del plan (lo que sea más temprano)
  const referenceMondayStr = blueprintStartDate
    ? (blueprintStartDate <= currentMondayStr ? blueprintStartDate : currentMondayStr)
    : currentMondayStr;
  const refMondayDate = getMonday(referenceMondayStr);

  // Encontrar la semana más antigua con actividades
  const activityDates = Object.keys(dailyExecutedActivities)
    .filter((d) => {
      const actData = dailyExecutedActivities[d];
      return actData && actData.activities && actData.activities.length > 0;
    })
    .sort();

  // Calcular cuántas semanas reales hay disponibles hacia atrás
  let effectiveWeeksBack = maxWeeksBack;
  if (activityDates.length > 0) {
    const earliestActDate = activityDates[0];
    const earliestMonday = getMonday(earliestActDate);
    const diffMs = refMondayDate.getTime() - earliestMonday.getTime();
    if (diffMs > 0) {
      const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
      effectiveWeeksBack = Math.min(diffWeeks, maxWeeksBack);
    } else {
      // No hay semanas anteriores a la referencia
      effectiveWeeksBack = 0;
    }
  }

  if (effectiveWeeksBack <= 0) return [];

  const historicalWeeks: MacrocycleWeek[] = [];

  // Generar en orden RECIENTE→ANTIGUO (i=1 es la semana inmediatamente anterior)
  for (let i = 1; i <= effectiveWeeksBack; i++) {
    const weekMon = new Date(refMondayDate);
    weekMon.setDate(refMondayDate.getDate() - i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const monStr = formatLocalDateToYMD(weekMon);
    const sunStr = formatLocalDateToYMD(weekSun);

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
    const sportSummary =
      sportsFound.size > 0 ? Array.from(sportsFound).join(", ") : "Completada";
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
      targetTss: weekExecutedTss > 0 ? weekExecutedTss : 0,
      maxLongRunMinutes: 0,
      focusDescription:
        weekExecutedTss > 0
          ? `${weekExecutedTss} TSS · ${volumeHours}h ejecutadas (${sportSummary})`
          : "Semana registrada en Intervals.icu",
      isCurrentWeek: false,
      isRecoveryWeek: false,
      isPastWeek: isPast,
      isHistorical: true,
      volumeHours,
    } as any);
  }

  // El arreglo ya está ordenado de más reciente (i=1) a más antigua (i=N)
  return historicalWeeks;
}

/** Construye un blueprint de respaldo usando sólo el historial ejecutado (sin plan activo). */
export function buildHistoricalBlueprint(
  dailyExecutedActivities: DailyExecutedMap = {},
  athleteProfile?: any
): MacrocycleBlueprint {
  const currentMondayStr = getMondayOfWeekStr();
  const todayStr = getLocalTodayStr();

  // Pasadas en orden reciente→antiguo para el array de weeks
  const pastWeeks = buildHistoricalCalendarWeeks({
    blueprintStartDate: currentMondayStr,
    dailyExecutedActivities,
    maxWeeksBack: 52,
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

  // Para el blueprint: histórico (antiguo→reciente) + semana actual
  const allWeeks = [...[...pastWeeks].reverse(), currentWeek];

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
