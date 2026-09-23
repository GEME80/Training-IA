import { MacrocycleBlueprint, MacrocycleWeek, TargetRace } from "./macrocycle";
import { getMondayOfWeekStr, formatLocalDateToYMD } from "../dateUtils";

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

export interface BlueprintCalibrationOptions {
  goalType?: string;
  planName?: string;
  athleteMetrics?: {
    ctl?: number;
    runFtp?: number;
    bikeFtp?: number;
    lthr?: number;
    weightKg?: number;
    heightCm?: number;
    gender?: string;
    restingHR?: number;
    maxHR?: number;
    weeklyAvailability?: any;
    historicalMetrics?: any;
  };
  primaryRace?: TargetRace | null;
}

/**
 * Evalúa si un blueprint guardado presenta desfasaje metodológico o fisiológico
 * (ej. fondos de maratón > 165 min, semana de carrera de 210 min rotulada como tirada dominical,
 * o TSS no adaptado a atletas de alto volumen) y lo recalibra con el motor vigente.
 */
export function syncAndCalibrateBlueprint(
  blueprint: MacrocycleBlueprint,
  options: BlueprintCalibrationOptions = {}
): { blueprint: MacrocycleBlueprint; upgraded: boolean } {
  if (!blueprint) return { blueprint, upgraded: false };

  const syncedBp = syncBlueprintToCurrentDate(blueprint);
  const weeks = syncedBp.weeks || [];
  if (weeks.length === 0) return { blueprint: syncedBp, upgraded: false };

  const isMarathonOrRunning =
    syncedBp.mode === "MARATHON_SPECIFIC" ||
    options.goalType === "MARATON_42K" ||
    syncedBp.primaryRace?.distance === "42k" ||
    options.primaryRace?.distance === "42k";

  // Detección de fondos obsoletos o violaciones a límites fisiológicos:
  // 1. Cualquier fondo de entrenamiento en running > 165 min (incompatible con Canova/Daniels/Pfitzinger)
  // 2. Semana de carrera con 210 min o rotulada como "Tirada dominical"
  // 3. Fondo cumbre en maratón > 155 min para atleta intermedio/máster
  const hasOutdatedLongRuns = weeks.some((w) => {
    const isRaceWeek = w.microcycleType === "COMPETICION" || w.phase === "RACE_WEEK" || w.countdownWeeks === 1;
    if (isRaceWeek) {
      const workoutText = (w as any).keyWorkout || w.focusDescription || "";
      return w.maxLongRunMinutes === 210 || workoutText.includes("Tirada dominical");
    }
    return isMarathonOrRunning && w.maxLongRunMinutes > 165;
  });

  const hist = options.athleteMetrics?.historicalMetrics;
  const currentMaxTss = Math.max(...weeks.map((w) => w.targetTss || 0));
  const expectedMinPeakTss = hist?.peakCtlLastYear ? Math.round((hist.peakCtlLastYear * 7) / 0.95) : 600;

  // Actualizar si:
  // 1. El atleta tiene historial de alto rendimiento (peakCtl >= 60) pero su plan actual no alcanza el TSS cumbre esperado
  // 2. El blueprint carece de targetPeakCtl (generado con versión previa del motor)
  // 3. El blueprint quedó guardado con periodización 2:1 o sin especificar cuando corresponde 3:1 estándar
  const needsCtlUpgrade = !!(
    (hist?.peakCtlLastYear && hist.peakCtlLastYear >= 60 && currentMaxTss < expectedMinPeakTss) ||
    !syncedBp.targetPeakCtl ||
    syncedBp.periodization === "2:1" ||
    !syncedBp.periodization
  );

  if (hasOutdatedLongRuns || needsCtlUpgrade) {
    try {
      const { generateCustomMacrocycleBlueprint } = require("./macrocycleGenerator");
      const distanceType =
        syncedBp.primaryRace?.distance ||
        options.primaryRace?.distance ||
        (options.goalType === "TRIATLON_703" ? "triathlon_703" : "42k");

      const resolvedPeriodization =
        syncedBp.periodization === "2:1" || !syncedBp.periodization
          ? "3:1"
          : syncedBp.periodization;

      const upgradedBp = generateCustomMacrocycleBlueprint({
        distanceType: distanceType as any,
        startDate: syncedBp.startDate,
        endDate: weeks[weeks.length - 1]?.endDate,
        weeksCount: weeks.length || syncedBp.totalWeeks || 16,
        customGoal: syncedBp.cycleTitle || options.planName,
        primaryRace: options.primaryRace || syncedBp.primaryRace || undefined,
        periodization: resolvedPeriodization as any,
        athleteMetrics: options.athleteMetrics,
      });

      return {
        blueprint: syncBlueprintToCurrentDate(upgradedBp),
        upgraded: true,
      };
    } catch (e) {
      console.warn("Aviso al recalibrar blueprint de macrociclo:", e);
    }
  }

  return { blueprint: syncedBp, upgraded: false };
}

