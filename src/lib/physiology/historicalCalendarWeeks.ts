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

  const effectiveWeeksBack = Math.max(0, maxWeeksBack);
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

/** Construye un blueprint de respaldo anual unificado cuando el atleta no tiene macrociclo activo */
export function buildHistoricalBlueprint(
  dailyExecutedActivities: DailyExecutedMap = {},
  athleteProfile?: any
): MacrocycleBlueprint {
  const currentMondayStr = getMondayOfWeekStr();
  const nowMonday = getMonday(currentMondayStr);
  const nowSunday = new Date(nowMonday);
  nowSunday.setDate(nowMonday.getDate() + 6);

  // 1. Semanas pasadas (28 semanas en orden cronológico: antigua -> reciente)
  const pastWeeks = buildHistoricalCalendarWeeks({
    blueprintStartDate: currentMondayStr,
    dailyExecutedActivities,
    maxWeeksBack: 28,
  }).reverse();

  // 2. Semana actual en curso
  const currentWeek: MacrocycleWeek = {
    weekNumber: pastWeeks.length + 1,
    countdownWeeks: 0,
    startDate: currentMondayStr,
    endDate: formatLocalDateToYMD(nowSunday),
    formattedRange: `${currentMondayStr.slice(5)} - ${formatLocalDateToYMD(nowSunday).slice(5)}`,
    phase: "RECOVERY",
    phaseLabel: "Sin Plan Activo",
    microcycleType: "DESCARGA_ASIMILACION",
    microcycleLabel: "Semana Actual",
    microcycleBadgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    targetTss: 0,
    maxLongRunMinutes: 0,
    focusDescription: "Historial de entrenamientos registrados en Intervals.icu",
    isCurrentWeek: true,
    isRecoveryWeek: false,
    isPastWeek: false,
  };

  // 3. Ventana futura de 23 semanas para proyectar en el calendario anual continuo (28 + 1 + 23 = 52 semanas)
  const futureWeeksCount = 23;
  const futureWeeks: MacrocycleWeek[] = [];
  for (let i = 1; i <= futureWeeksCount; i++) {
    const fMon = new Date(nowMonday);
    fMon.setDate(nowMonday.getDate() + i * 7);
    const fSun = new Date(fMon);
    fSun.setDate(fMon.getDate() + 6);
    const fMonStr = formatLocalDateToYMD(fMon);
    const fSunStr = formatLocalDateToYMD(fSun);

    futureWeeks.push({
      weekNumber: pastWeeks.length + 1 + i,
      countdownWeeks: 0,
      startDate: fMonStr,
      endDate: fSunStr,
      formattedRange: `${fMonStr.slice(5)} - ${fSunStr.slice(5)}`,
      phase: "RECOVERY",
      phaseLabel: "Sin Plan Activo",
      microcycleType: "DESCARGA_ASIMILACION",
      microcycleLabel: "Disponible",
      microcycleBadgeColor: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      targetTss: 0,
      maxLongRunMinutes: 0,
      focusDescription: "Semana disponible para proyectar macrociclo con IA",
      isCurrentWeek: false,
      isRecoveryWeek: false,
      isPastWeek: false,
      isHistorical: false,
    } as any);
  }

  const allWeeks = [...pastWeeks, currentWeek, ...futureWeeks];

  return {
    id: "historical-timeline-blueprint",
    cycleTitle: "Historial de Carga & Entrenamientos Realizados",
    distanceType: undefined,
    startDate: currentMondayStr,
    totalWeeks: allWeeks.length,
    weeks: allWeeks,
    currentWeekIndex: pastWeeks.length,
    athleteCtlAtCreation: athleteProfile?.ctl || 40,
    availabilitySnapshot: undefined,
    isHistoricalOnly: true,
  } as any;
}
