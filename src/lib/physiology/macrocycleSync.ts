import { MacrocycleBlueprint, MacrocycleWeek } from "./macrocycle";
import { getMondayOfWeekStr, formatLocalDateToYMD } from "@/lib/dateUtils";

/**
 * Resuelve el índice de la semana actual dentro de un array de semanas de macrociclo
 * basándose rigurosamente en la fecha actual local (o refDate proporcionada).
 */
export function resolveCurrentWeekIndex(
  weeks: MacrocycleWeek[],
  refDate: Date = new Date()
): number {
  if (!weeks || weeks.length === 0) return 0;

  const currentMondayStr = getMondayOfWeekStr(refDate);
  const todayStr = formatLocalDateToYMD(refDate);

  // 1. Coincidencia exacta por startDate (el Lunes de la semana en curso)
  const exactMondayIdx = weeks.findIndex((w) => w.startDate === currentMondayStr);
  if (exactMondayIdx !== -1) return exactMondayIdx;

  // 2. Coincidencia por rango inclusivo [startDate, endDate]
  const rangeIdx = weeks.findIndex((w) => w.startDate <= todayStr && todayStr <= w.endDate);
  if (rangeIdx !== -1) return rangeIdx;

  // 3. Si la fecha actual es anterior al inicio del plan -> semana 0 (primera)
  if (todayStr < weeks[0].startDate) return 0;

  // 4. Si la fecha actual es posterior al fin del plan -> última semana
  if (todayStr > weeks[weeks.length - 1].endDate) return weeks.length - 1;

  return 0;
}

/**
 * Sincroniza dinámicamente un MacrocycleBlueprint con la fecha actual local:
 * - Actualiza currentWeekIndex para que apunte a la semana que contiene a 'hoy'.
 * - Actualiza currentWeek.
 * - Actualiza las banderas isCurrentWeek, isPastWeek, isFutureWeek de cada semana.
 */
export function syncBlueprintToCurrentDate(
  blueprint: MacrocycleBlueprint,
  refDate: Date = new Date()
): MacrocycleBlueprint {
  if (!blueprint || !Array.isArray(blueprint.weeks) || blueprint.weeks.length === 0) {
    return blueprint;
  }

  const currentIdx = resolveCurrentWeekIndex(blueprint.weeks, refDate);
  const todayStr = formatLocalDateToYMD(refDate);

  const updatedWeeks: MacrocycleWeek[] = blueprint.weeks.map((w, idx) => {
    const isCurrent = idx === currentIdx;
    const isPast = w.endDate < todayStr;
    const isFuture = w.startDate > todayStr;

    return {
      ...w,
      isCurrentWeek: isCurrent,
      isPastWeek: isPast,
      isFutureWeek: isFuture,
    };
  });

  return {
    ...blueprint,
    currentWeekIndex: currentIdx,
    currentWeek: updatedWeeks[currentIdx] || updatedWeeks[0],
    weeks: updatedWeeks,
  };
}
