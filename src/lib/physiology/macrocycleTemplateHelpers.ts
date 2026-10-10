import { PlanItem, WeeklyAvailabilityMap, getDayDisciplines } from "../gemini/engine";
import { resolveTrainingModel } from "../ai/knowledge";
import { resolveWeekendRide, resolveTriathlonBrick, WeekendRideParams, WeekendRideResult } from "./weekendRideResolver";
import { applyParametricProgression, AntiMonotonyMemoryBuffer } from "./workoutProgressionEngine";
import { MacrocycleDistanceType } from "./macrocycleLibrary";
import { interpolateWorkoutTarget } from "./runningWorkoutAdapter";
import { resolveFridayWorkout, FridayWorkoutParams } from "./fridayWorkoutResolver";
import { generateMetricRunningWorkout } from "./metricIntervalEngine";

export function gcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b);
  while (y !== 0) { const t = y; y = x % y; x = t; }
  return x;
}

export function getCoprimeStride(length: number, preferred: number = 2): number {
  if (length <= 1) return 1;
  let s = preferred;
  while (gcd(s, length) !== 1) s++;
  return s;
}

export function buildRestDay(day: string, dateStr: string, formattedDate: string): PlanItem {
  return { day, date: dateStr, formattedDate, discipline: "Descanso", workoutName: "Descanso Pasivo Total", action: "MANTENER", durationMinutes: 0, tss: 0, justification: "Recuperación biológica y descanso neuromuscular absoluto.", isRestDay: true };
}

export function interpolatePowerTarget(
  rawTarget: string, runFtp?: number, bikeFtp?: number,
  opts?: { discipline?: string; mode?: "POWER" | "HYBRID"; thresholdPaceSec?: number; lthr?: number; isQuality?: boolean; }
): string {
  if (!rawTarget) return rawTarget;
  return interpolateWorkoutTarget(rawTarget, {
    runFtp, bikeFtp, discipline: opts?.discipline || (bikeFtp && !runFtp ? "Ciclismo" : "Carrera"),
    mode: opts?.mode || (runFtp && runFtp > 0 ? "POWER" : "HYBRID"),
    thresholdPaceSec: opts?.thresholdPaceSec, lthr: opts?.lthr, isQuality: opts?.isQuality,
  });
}

export function selectQualityWorkout(
  phase: string,
  weekNumber: number,
  curatedModel: ReturnType<typeof resolveTrainingModel>,
  runFtp?: number,
  bikeFtp?: number,
  opts?: {
    isRecovery?: boolean;
    memoryBuffer?: AntiMonotonyMemoryBuffer;
    recentWorkoutNames?: string[];
    mode?: "PACE" | "POWER";
    thresholdPaceSec?: number;
    microcycleType?: string;
  }
): { name: string; powerTarget: string; justification: string; workoutDoc: string; durationMin?: number; tss?: number } {
  const vars = curatedModel.workoutVariations.qualityWorkouts;
  let rawList = vars.base;
  if (phase === "PEAK") {
    rawList = vars.peak && vars.peak.length > 0 ? vars.peak : vars.build;
  } else if (phase === "BUILD") {
    rawList = vars.build && vars.build.length > 0 ? vars.build : vars.base;
  } else if (phase === "TAPER" || phase === "RACE_WEEK") {
    rawList = vars.taper && vars.taper.length > 0 ? vars.taper : vars.base;
  }

  const runOnly = (rawList || []).filter((w) => {
    const txt = (w.name + " " + w.justification + " " + w.workoutDoc).toLowerCase();
    const isSwim = txt.includes("nataci") || txt.includes("nado") || txt.includes("swim") || txt.includes("brazada") || txt.includes("css ");
    const hasBikeOrBrick = txt.includes("ciclismo") || txt.includes("bici") || txt.includes("pedaleo") || txt.includes("bike") || txt.includes("brick") || txt.includes("transición");
    return !isSwim && !hasBikeOrBrick;
  });

  // Generador paramétrico de intervalos métricos en distancia (mtr):
  // Permite un mix fisiológico real (series en pista por distancia vs fartleks/tempos por tiempo)
  const metricInterval = generateMetricRunningWorkout({
    weekNumber,
    phase,
    microcycleType: opts?.microcycleType || (opts?.isRecovery ? "DESCARGA" : "CARGA"),
    mode: opts?.mode || (runFtp && runFtp > 0 ? "POWER" : "PACE"),
    thresholdPaceSec: opts?.thresholdPaceSec,
    runFtp,
  });

  // PARIDAD 50/50 ANTI-MONOTONÍA:
  // Alterna semanas pares e impares entre el motor dinámico métrico (pirámides, escaleras, repeticiones)
  // y las sesiones curadas de autor (Canova, Daniels, Pfitzinger), garantizando máxima variedad.
  const isMetricWeek = weekNumber % 2 === 0;
  let baseWorkout: {
    name: string;
    powerTarget: string;
    justification: string;
    workoutDoc: string;
    durationMin?: number;
    tss?: number;
  };

  if (isMetricWeek || runOnly.length === 0) {
    baseWorkout = {
      name: metricInterval.name,
      powerTarget: metricInterval.powerTarget,
      justification: metricInterval.justification,
      workoutDoc: metricInterval.workoutDoc,
      durationMin: metricInterval.durationMinutes,
      tss: metricInterval.tss,
    };
  } else {
    const stride = getCoprimeStride(runOnly.length, 2);
    const preferredIdx = ((weekNumber - 1) * stride) % runOnly.length;

    if (opts?.memoryBuffer) {
      baseWorkout = opts.memoryBuffer.selectDiverseCandidate(runOnly, preferredIdx);
    } else if (opts?.recentWorkoutNames && opts.recentWorkoutNames.length > 0) {
      const tempBuffer = new AntiMonotonyMemoryBuffer(6);
      opts.recentWorkoutNames.forEach((n) => tempBuffer.record(n));
      baseWorkout = tempBuffer.selectDiverseCandidate(runOnly, preferredIdx);
    } else {
      baseWorkout = runOnly[preferredIdx >= 0 ? preferredIdx : 0] || metricInterval;
    }
  }

  const dynPowerTarget = interpolatePowerTarget(baseWorkout.powerTarget, runFtp, bikeFtp);
  const targetWorkout = {
    ...baseWorkout,
    powerTarget: dynPowerTarget,
  };

  // Sobrecarga progresiva paramétrica (4x -> 5x -> 6x -> deload 3x)
  return applyParametricProgression(targetWorkout, {
    weekNumber,
    phase,
    isRecovery: opts?.isRecovery,
  });
}

export function resolveRaceWorkout(params: {
  curatedModel: ReturnType<typeof resolveTrainingModel>; longRun: any; dateStr: string; formattedDate: string; day?: string; runFtp?: number; bikeFtp?: number;
}): PlanItem {
  const { curatedModel, longRun, dateStr, formattedDate, day = "Domingo", runFtp, bikeFtp } = params;
  const sportCat = curatedModel.sportCategory;

  if (sportCat === "Triathlon") {
    const triKm = curatedModel.targetDistanceKm || (curatedModel.modelId === "TRIATHLON_SHORT" ? 51.5 : 113);
    const isShort = triKm <= 60, isIron = triKm > 150;
    const durMins = isIron ? 660 : isShort ? 150 : 310;
    const raceTss = isIron ? 520 : isShort ? 210 : 305;
    const pwrTarget = bikeFtp && runFtp ? `Bike ${Math.round(bikeFtp * 0.78)}W / Run ${Math.round(runFtp * 0.84)}W` : "Ritmo Objetivo Triatlón";

    return {
      day, date: dateStr, formattedDate, discipline: "Carrera", activityType: "Triatlón",
      workoutName: `🏆 COMPETICIÓN OBJETIVO: ${curatedModel.displayName.split("(")[0].trim()} (${triKm} km)`,
      action: "MANTENER", durationMinutes: durMins, tss: raceTss, powerTarget: pwrTarget,
      justification: `🏆 DÍA DE COMPETICIÓN TRIATLÓN (${triKm} km). Transiciones T1/T2 fluidas y nutrición programada.`,
      workoutDoc: isIron
        ? "Sector 1: Natación\n- 3.8 km Aguas Abiertas @ Ritmo Medido\n\nTransición T1 (< 6 min)\n\nSector 2: Ciclismo 180 km\n- 180 km @ 68-72% FTP (60-80g CHO/h)\n\nTransición T2 (< 4 min)\n\nSector 3: Maratón Final\n- 42.2 km @ 72-76% CP"
        : isShort
        ? "Sector 1: Natación\n- 1.5 km Aguas Abiertas @ Ritmo Objetivo\n\nTransición T1 (< 3 min)\n\nSector 2: Ciclismo\n- 40 km @ 85% FTP\n\nTransición T2 (< 2 min)\n\nSector 3: Carrera a pie\n- 10 km @ 88-90% CP"
        : "Sector 1: Natación\n- 1.9 km Aguas Abiertas @ Ritmo Constante\n\nTransición T1 (< 4 min)\n\nSector 2: Ciclismo 70.3\n- 90 km @ 76-80% FTP\n\nTransición T2 (< 3 min)\n\nSector 3: Medio Maratón\n- 21.1 km @ 82-84% CP",
      isRestDay: false,
    };
  }

  if (sportCat === "Cycling") {
    const bikeKm = curatedModel.targetDistanceKm || 120;
    return {
      day, date: dateStr, formattedDate, discipline: "Ciclismo",
      workoutName: `🏆 COMPETICIÓN CICLISMO: ${curatedModel.displayName.split("(")[0].trim()} (${bikeKm} km)`,
      action: "MANTENER", durationMinutes: Math.round(bikeKm * 2.1), tss: Math.round(bikeKm * 1.8),
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.75)}W (75% FTP)` : "75-80% FTP",
      justification: `🏆 DÍA DE PRUEBA CICLISTA (${bikeKm} km). Gestión de potencia en repechos y nutrición en ruta.`,
      workoutDoc: `Warmup\n- 15m 60% FTP Activación\n\nMain (Prueba Ciclista Oficial)\n- ${bikeKm} km @ Ritmo de Carrera (75-82% FTP)\n\nCooldown\n- 10m 50% FTP`,
      isRestDay: false,
    };
  }

  if (sportCat === "Trail") {
    const trailKm = curatedModel.targetDistanceKm || 50;
    const durMins = Math.min(360, Math.round(trailKm * 5.5));
    const raceTss = Math.min(380, Math.round(trailKm * 5.0));
    return {
      day, date: dateStr, formattedDate, discipline: "Carrera", activityType: "Trail",
      workoutName: `🏆 COMPETICIÓN TRAIL: ${curatedModel.displayName.split("(")[0].trim()} (${trailKm} km)`,
      action: "MANTENER", durationMinutes: durMins, tss: raceTss,
      powerTarget: runFtp ? `${Math.round(runFtp * 0.76)}W (76% CP)` : "72-78% CP (RPE 5-6 en subidas)",
      justification: `🏆 DÍA DE COMPETICIÓN TRAIL (${trailKm} km). Gestión de esfuerzo en desniveles y nutrición programada cada 45m.`,
      workoutDoc: `Sector 1: Salida y Primer Ascenso\n- Ritmo controlado (68-75% CP), caminar rampas >15%\n\nSector 2: Terreno Mixto y Crestas\n- Ritmo de crucero (75-80% CP), avituallamiento constante 50-70g CHO/h\n\nSector 3: Bajada Final y Meta\n- Agilidad técnica y zancada corta hasta cruzar meta`,
      isRestDay: false,
    };
  }

  const raceDist = curatedModel.targetDistanceKm || longRun.km || 42.2;
  const is5K = raceDist <= 6, is10K = raceDist > 6 && raceDist <= 12, is21K = raceDist > 12 && raceDist <= 25;
  const durMins = is5K ? 25 : is10K ? 50 : is21K ? 105 : 195;
  const raceTss = is5K ? 45 : is10K ? 85 : is21K ? 160 : 260;

  return {
    day, date: dateStr, formattedDate, discipline: "Carrera", workoutName: longRun.workoutName,
    action: "MANTENER", durationMinutes: durMins, tss: raceTss, powerTarget: longRun.powerTarget,
    justification: `🏆 DÍA DE COMPETICIÓN (${raceDist} km). Ejecutar estrategia de nutrición y ritmo objetivo.`,
    workoutDoc: longRun.workoutDoc, isRestDay: false,
  };
}

export const resolveRaceSundayWorkout = resolveRaceWorkout;

export { resolveWeekendRide, resolveTriathlonBrick, type WeekendRideParams, type WeekendRideResult };

/**
 * Resuelve dinámicamente el día óptimo para la Tirada Larga de Carrera
 * respetando la matriz semanal del atleta (fin de semana o último día disponible).
 */
export function resolveLongRunDay(availability: WeeklyAvailabilityMap = {}): string {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const runDays = days.filter((d) => getDayDisciplines(availability, d).includes("Carrera"));
  if (runDays.includes("Domingo")) return "Domingo";
  if (runDays.includes("Sábado")) return "Sábado";
  return runDays[runDays.length - 1] || "Domingo";
}

/**
 * Resuelve dinámicamente el día óptimo para el Fondo de Ciclismo
 * coordinando con la Tirada Larga para prevenir interferencias concurrentes.
 */
export function resolveLongRideDay(availability: WeeklyAvailabilityMap = {}): string {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const bikeDays = days.filter((d) => getDayDisciplines(availability, d).includes("Ciclismo"));
  const runsSunday = getDayDisciplines(availability, "Domingo").includes("Carrera");
  if (bikeDays.includes("Sábado") && runsSunday) return "Sábado";
  if (bikeDays.includes("Domingo")) return "Domingo";
  if (bikeDays.includes("Sábado")) return "Sábado";
  return bikeDays[bikeDays.length - 1] || "Sábado";
}

export function resolveEveRide(bikeFtp?: number) {
  return {
    workoutName: "Ciclismo de Soltura & Cadencia Pre-Tirada (45m Z2)",
    durationMinutes: 45, tss: 28, powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.62)}W (62% FTP)` : "62% FTP",
    justification: "Pedaleo ágil de cadencia y oxigenación para llegar con piernas frescas a la tirada larga.",
    workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain\n- 25m 62% FTP (90-95 rpm)\n- 3x 30s aceleración 100 rpm (recup 1m)\n\nCooldown\n- 7m 50% FTP",
  };
}

export function resolveFridayFartlek(
  runFtpOrOpts?: number | FridayWorkoutParams,
  maybeMulti: boolean = false,
  targetDistance?: string
) {
  if (typeof runFtpOrOpts === "object" && runFtpOrOpts !== null) {
    return resolveFridayWorkout(runFtpOrOpts);
  }
  return resolveFridayWorkout({
    runFtp: runFtpOrOpts,
    isMultisport: maybeMulti,
    targetDistance,
  });
}

export function resolveMidweekRide({
  phase, isRecovery, bikeCount, isTriOrMulti, bikeFtp, selBike,
}: {
  phase: string; isRecovery: boolean; bikeCount: number; isTriOrMulti: boolean;
  bikeFtp?: number; selBike: { name: string; durationMin?: number; powerTarget: string; justification: string; workoutDoc: string };
}) {
  if (phase === "TAPER") {
    return {
      workoutName: "Ciclismo de Puesta a Punto con Chispa (35m con 3x2m @ 80% FTP)",
      durationMinutes: 35, tss: 22, powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.70)}W (70% FTP)` : "70% FTP",
      justification: "Activación neuromuscular aeróbica sin fatiga residual antes de la competición.",
      workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain (Afinamiento Aeróbico Dinámico)\n3x\n- 2m 80% FTP\n- 2m 55% FTP\n\nCooldown\n- 8m 50% FTP",
    };
  }
  if (isRecovery || (bikeCount > 1 && isTriOrMulti)) {
    const dur = isRecovery ? 35 : 45;
    return {
      workoutName: isRecovery ? "Ciclismo de Asimilación & Soltura (35m Z1-Z2)" : "Ciclismo Aeróbico Z2 con Variaciones de Cadencia (45m)",
      durationMinutes: dur, tss: isRecovery ? 20 : 29,
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * (isRecovery ? 0.60 : 0.65))}W (${isRecovery ? "60% FTP" : "65% FTP"})` : "65% FTP",
      justification: isRecovery ? "Regeneración metabólica y asimilación biológica." : "Eficiencia de pedaleo aeróbico Z2 y cadencia sin fatiga concurrente.",
      workoutDoc: isRecovery ? "Warmup\n- 10m 55% FTP\n\nMain\n- 20m 60% FTP\n\nCooldown\n- 5m 50% FTP" : "Warmup\n- 10m 55% FTP\n\nMain\n- 25m 65% FTP (90-95 rpm)\n- 5m 72% FTP\n\nCooldown\n- 5m 50% FTP",
    };
  }
  const dur = selBike.durationMin || 50;
  return {
    workoutName: selBike.name, durationMinutes: dur, tss: Math.round(dur * 0.78),
    powerTarget: interpolatePowerTarget(selBike.powerTarget, undefined, bikeFtp),
    justification: selBike.justification, workoutDoc: selBike.workoutDoc,
  };
}

export function resolveCuratedModelForWeek(
  distanceType: MacrocycleDistanceType | undefined,
  weekFocus: string | undefined,
  safeAvailability: WeeklyAvailabilityMap
) {
  let resolved = distanceType;
  if (!resolved) {
    const f = (weekFocus || "").toLowerCase();
    const hasSwim = Object.values(safeAvailability).some((discs: any) => Array.isArray(discs) && discs.some((d: string) => /natacion|swim/i.test(d)));
    const hasRide = Object.values(safeAvailability).some((discs: any) => Array.isArray(discs) && discs.some((d: string) => /ciclismo|bike|ride/i.test(d)));
    const hasRun = Object.values(safeAvailability).some((discs: any) => Array.isArray(discs) && discs.some((d: string) => /carrera|run/i.test(d)));
    if (/70\.3|703|medio iron/i.test(f)) resolved = "triathlon_703";
    else if (/ironman|140\.6|1406/i.test(f)) resolved = "triathlon_1406";
    else if (hasSwim && hasRide) resolved = "triathlon_short";
    else if (hasRide && !hasRun) resolved = "cycling_fondo";
    else if (/marat|marath|42k|tokio|boston|valencia/i.test(f)) resolved = "42k";
    else if (/media|half|21k/i.test(f)) resolved = "21k";
    else resolved = "10k";
  }
  return resolveTrainingModel({ targetDistance: resolved, raceDistance: resolved, customGoal: weekFocus });
}

