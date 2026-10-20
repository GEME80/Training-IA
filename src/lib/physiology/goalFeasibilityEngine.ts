/**
 * goalFeasibilityEngine.ts
 * Motor Fisiológico Soberano de Evaluación de Factibilidad del Objetivo.
 * 
 * Evalúa cualquier meta ingresada por el atleta (ej. 3h05, 2h30, 1h25, 38:00)
 * contrastándola contra su telemetría viva de Intervals.icu (Stryd CP W/kg, FTP, CTL, Pace).
 * 
 * Principios:
 * 1. Zero Hardcoding: Cálculos continuos basados en Peter Riegel, Jack Daniels y Stryd CP W/kg.
 * 2. Protección Biomecánica: Si la meta es hiper-ambiciosa, construye una escalera
 *    progresiva segura (Stepping Stones) para evitar desgarros y sobreentrenamiento.
 */

import { parseGoalTimeToMinutes, formatGoalMinutes } from "./raceGoalParser";
export { formatGoalMinutes, parseGoalTimeToMinutes };

export interface AthleteBiometricsInput {
  runFtp?: number; // Stryd CP en W
  bikeFtp?: number; // Ciclismo FTP en W
  weightKg?: number;
  ctl?: number;
  thresholdPaceSec?: number; // Ritmo umbral en s/km (ej. 270 para 4:30/km)
  lthr?: number;
}

export type GoalFeasibilityStatus = "REALISTIC" | "CHALLENGING" | "HIGHLY_ASPIRATIONAL";

export interface GoalFeasibilityResult {
  targetGoalMinutes: number;
  predictedGoalMinutes: number;
  gapPercentage: number;
  status: GoalFeasibilityStatus;
  targetRacePaceKmStr: string;
  targetRacePaceSec: number;
  currentSafePaceKmStr: string;
  currentSafePaceSec: number;
  stagedRacePaceKmStr: string;
  stagedRacePaceSec: number;
  targetPowerWatts?: number;
  targetPowerPctCp?: number;
  coachAdvice: string;
  distanceKm: number;
  cappedByProtection?: boolean;
  maxSafeGoalMinutes?: number;
  maxSafeGoalStr?: string;
  sportCategory?: "Running" | "Triathlon" | "Cycling";
  multisportBreakdown?: {
    swimMinutes: number;
    bikeMinutes: number;
    runMinutes: number;
    bikeWattsEstimate?: number;
    runPaceStr?: string;
  };
}

/**
 * Normaliza la distancia de competición a kilómetros reales continuos.
 */
export function resolveDistanceKm(distanceType?: string): number {
  if (!distanceType) return 42.195;
  const norm = distanceType.toLowerCase();
  if (norm.includes("42k") || norm.includes("marat") || norm.includes("marathon")) return 42.195;
  if (norm.includes("21k") || norm.includes("media") || norm.includes("half")) return 21.097;
  if (norm.includes("10k")) return 10.0;
  if (norm.includes("5k")) return 5.0;
  if (norm.includes("70_3") || norm.includes("70.3")) return 21.097; // Run leg
  if (norm.includes("140_6") || norm.includes("140.6") || norm.includes("ironman")) return 42.195; // Run leg
  return 42.195;
}

/**
 * Formatea segundos por km en string mm:ss/km
 */
export function formatPaceSecToStr(paceSec: number): string {
  if (!paceSec || paceSec <= 0 || !Number.isFinite(paceSec)) return "4:45/km";
  const m = Math.floor(paceSec / 60);
  const s = Math.round(paceSec % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

/**
 * Predice el tiempo de carrera fisiológico actual a partir de la telemetría viva.
 */
export function predictCurrentFitnessTimeMinutes(
  metrics: AthleteBiometricsInput,
  distanceKm: number
): number {
  const { runFtp, weightKg, thresholdPaceSec } = metrics;

  // 1. Vía Ritmo Umbral Daniels (T-Pace) usando exponente de fatiga de Peter Riegel (1.06)
  if (thresholdPaceSec && thresholdPaceSec > 150 && thresholdPaceSec < 600) {
    const tPaceSec = thresholdPaceSec;
    // T-Pace de Daniels equivale a ritmo sostenible en ~60 min (~13-14 km para la mayoría)
    const baseDistanceKm = 10.0;
    const baseTimeSec = tPaceSec * baseDistanceKm * 0.96; // 10K es ~4% más rápido que T-Pace puro
    const riegelFactor = Math.pow(distanceKm / baseDistanceKm, 1.06);
    const predictedSec = baseTimeSec * riegelFactor;
    return Math.round(predictedSec / 60);
  }

  // 2. Vía Stryd Critical Power (W/kg)
  if (runFtp && weightKg && weightKg > 35 && weightKg < 150) {
    const wKg = runFtp / weightKg;
    // Curva empírica Stryd: W/kg vs velocidad en m/s (Coste energético ~1.0 J/kg/m)
    // Velocidad Umbral (m/s) ~= (W/kg) / 1.03
    const vThresholdMps = wKg / 1.03;
    const tPaceSec = 1000 / Math.max(2.0, vThresholdMps);
    const baseTimeSec = tPaceSec * 10.0 * 0.96;
    const riegelFactor = Math.pow(distanceKm / 10.0, 1.06);
    return Math.round((baseTimeSec * riegelFactor) / 60);
  }

  // 3. Fallback genérico conservador si no hay telemetría
  const defaultPaceSec = distanceKm >= 40 ? 315 : distanceKm >= 20 ? 300 : 285; // 5:15 / 5:00 / 4:45
  return Math.round((defaultPaceSec * distanceKm) / 60);
}

/**
 * Motor central de evaluación de factibilidad y diseño de escalera adaptativa (Stepping Stones).
 * Incluye soporte multideporte (Triatlón 70.3 / 140.6) y tope de mejora seguro del 10%.
 */
export function evaluateGoalFeasibility(
  goalCandidate: string | number | undefined,
  distanceType: string | undefined,
  metrics: AthleteBiometricsInput
): GoalFeasibilityResult {
  const normDist = (distanceType || "").toLowerCase();
  const isTri703 = normDist.includes("70_3") || normDist.includes("70.3") || normDist.includes("703");
  const isTri1406 = normDist.includes("140_6") || normDist.includes("140.6") || normDist.includes("1406") || normDist.includes("ironman");
  const isTriathlon = isTri703 || isTri1406 || normDist.includes("triathlon");
  const isCycling = normDist.includes("cycling") || normDist.includes("fondo");

  const runDistanceKm = isTri703 ? 21.097 : isTri1406 ? 42.195 : resolveDistanceKm(distanceType);
  const totalEventKm = isTri703 ? 113 : isTri1406 ? 226 : isCycling ? (metrics.ctl ? 120 : 100) : runDistanceKm;

  const parsedTargetMins = typeof goalCandidate === "number"
    ? goalCandidate
    : parseGoalTimeToMinutes(goalCandidate) || null;

  // Predicción global y específica de carrera
  let predictedMins: number;
  let predictedRunMins: number;
  let multisportBreakdown: GoalFeasibilityResult["multisportBreakdown"] | undefined;

  if (isTri703) {
    const runPred = predictCurrentFitnessTimeMinutes(metrics, 21.097);
    const bikeWatts = metrics.bikeFtp ? Math.round(metrics.bikeFtp * 0.80) : undefined;
    const bikePred = metrics.bikeFtp && metrics.weightKg
      ? Math.round((90 / Math.max(26, Math.min(42, 16 + (metrics.bikeFtp / metrics.weightKg) * 5.8))) * 60)
      : 155;
    const swimPred = 34; // Ritmo típico 1:47/100m
    const t1t2 = 5;
    predictedMins = swimPred + bikePred + runPred + t1t2;
    predictedRunMins = runPred;
    multisportBreakdown = {
      swimMinutes: swimPred,
      bikeMinutes: bikePred,
      runMinutes: runPred,
      bikeWattsEstimate: bikeWatts,
      runPaceStr: formatPaceSecToStr((runPred * 60) / 21.097),
    };
  } else if (isTri1406) {
    const runPred = predictCurrentFitnessTimeMinutes(metrics, 42.195);
    const bikeWatts = metrics.bikeFtp ? Math.round(metrics.bikeFtp * 0.70) : undefined;
    const bikePred = metrics.bikeFtp && metrics.weightKg
      ? Math.round((180 / Math.max(25, Math.min(38, 15 + (metrics.bikeFtp / metrics.weightKg) * 5.2))) * 60)
      : 330;
    const swimPred = 75;
    const t1t2 = 12;
    predictedMins = swimPred + bikePred + runPred + t1t2;
    predictedRunMins = runPred;
    multisportBreakdown = {
      swimMinutes: swimPred,
      bikeMinutes: bikePred,
      runMinutes: runPred,
      bikeWattsEstimate: bikeWatts,
      runPaceStr: formatPaceSecToStr((runPred * 60) / 42.195),
    };
  } else {
    predictedMins = predictCurrentFitnessTimeMinutes(metrics, runDistanceKm);
    predictedRunMins = predictedMins;
  }

  const targetMins = parsedTargetMins && parsedTargetMins > 0 ? parsedTargetMins : predictedMins;

  // Cálculo de minutos de carrera pedestre asignados a la meta
  let targetRunMins = targetMins;
  if (isTri703) {
    targetRunMins = Math.round(targetMins * 0.355);
  } else if (isTri1406) {
    targetRunMins = Math.round(targetMins * 0.380);
  }

  // Cálculo del Gap Fisiológico
  const gapPercentage = ((predictedMins - targetMins) / predictedMins) * 100;

  // Clasificación del gap (Tope de seguridad fijado al 10%)
  let status: GoalFeasibilityStatus = "REALISTIC";
  if (gapPercentage > 10) {
    status = "HIGHLY_ASPIRATIONAL";
  } else if (gapPercentage > 5) {
    status = "CHALLENGING";
  }

  const targetRacePaceSec = (targetRunMins * 60) / runDistanceKm;
  const currentSafePaceSec = (predictedRunMins * 60) / runDistanceKm;

  // Staged Pace (Ritmo de Trabajo del Mesociclo Actual)
  // Tope estricto de mejora fisiológica del 10% máximo por macrociclo para prevención de lesiones
  let stagedRacePaceSec = targetRacePaceSec;
  let cappedByProtection = false;
  const maxSafeGoalMins = Math.round(predictedMins * 0.90);

  if (status === "HIGHLY_ASPIRATIONAL") {
    // Si la meta supera el 10% de brecha (ej. 2h10 cuando el cuerpo está para 3h10 = gap +31.6%),
    // aplicamos el tope protector de seguridad del 10% de mejora máxima
    stagedRacePaceSec = Math.round(currentSafePaceSec * 0.90);
    cappedByProtection = true;
  } else if (status === "CHALLENGING") {
    // Si es un reto exigente (5-10%), trabajamos en un ritmo puente (65% del gap cerrado)
    stagedRacePaceSec = Math.round(currentSafePaceSec - (currentSafePaceSec - targetRacePaceSec) * 0.65);
  }

  // Potencia Stryd Objetivo en Watts
  let targetPowerWatts: number | undefined;
  let targetPowerPctCp: number | undefined;
  if (metrics.runFtp && metrics.runFtp > 0) {
    const isMarathon = runDistanceKm >= 40;
    const isHalf = runDistanceKm >= 20 && runDistanceKm < 40;
    const is10k = runDistanceKm >= 9 && runDistanceKm < 20;

    targetPowerPctCp = isMarathon ? 89 : isHalf ? 95 : is10k ? 100 : 105;
    targetPowerWatts = Math.round(metrics.runFtp * (targetPowerPctCp / 100));
  }

  // Diagnóstico pedagógico del Head Coach
  let coachAdvice = "";
  const targetStr = formatGoalMinutes(targetMins);
  const predStr = formatGoalMinutes(predictedMins);
  const stagedPaceStr = formatPaceSecToStr(stagedRacePaceSec);

  if (status === "REALISTIC") {
    coachAdvice = `Meta alineada con tu telemetría biológica actual (${predStr} predicho vs ${targetStr} objetivo). Entrenaremos con especificidad directa a ritmo objetivo (${formatPaceSecToStr(targetRacePaceSec)}).`;
  } else if (status === "CHALLENGING") {
    coachAdvice = `Meta desafiante pero viable (+${gapPercentage.toFixed(1)}% sobre tu fitness de partida ${predStr}). Aplicaremos una escalera bietápica: construiremos base a ${stagedPaceStr} y afinaremos con bloques específicos en las semanas pico.`;
  } else {
    coachAdvice = `Aviso Fisiológico: Tu fitness actual predice ~${predStr}. Buscar un salto directo a ${targetStr} (brecha +${gapPercentage.toFixed(1)}%) eleva drásticamente el riesgo de sobreentrenamiento o lesión. Para proteger tu salud, este macrociclo graduará tus entrenamientos con el tope de mejora seguro del 10% (~${formatGoalMinutes(maxSafeGoalMins)} con ritmo puente ${stagedPaceStr}), preparándote para seguir progresando en futuros ciclos.`;
  }

  return {
    targetGoalMinutes: targetMins,
    predictedGoalMinutes: predictedMins,
    gapPercentage: Math.round(gapPercentage * 10) / 10,
    status,
    targetRacePaceKmStr: formatPaceSecToStr(targetRacePaceSec),
    targetRacePaceSec: Math.round(targetRacePaceSec),
    currentSafePaceKmStr: formatPaceSecToStr(currentSafePaceSec),
    currentSafePaceSec: Math.round(currentSafePaceSec),
    stagedRacePaceKmStr: stagedPaceStr,
    stagedRacePaceSec: Math.round(stagedRacePaceSec),
    targetPowerWatts,
    targetPowerPctCp,
    coachAdvice,
    distanceKm: totalEventKm,
    cappedByProtection,
    maxSafeGoalMinutes: maxSafeGoalMins,
    maxSafeGoalStr: formatGoalMinutes(maxSafeGoalMins),
    sportCategory: isTriathlon ? "Triathlon" : isCycling ? "Cycling" : "Running",
    multisportBreakdown,
  };
}
