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
 */
export function evaluateGoalFeasibility(
  goalCandidate: string | number | undefined,
  distanceType: string | undefined,
  metrics: AthleteBiometricsInput
): GoalFeasibilityResult {
  const distanceKm = resolveDistanceKm(distanceType);
  const parsedTargetMins = typeof goalCandidate === "number"
    ? goalCandidate
    : parseGoalTimeToMinutes(goalCandidate) || null;

  const predictedMins = predictCurrentFitnessTimeMinutes(metrics, distanceKm);
  const targetMins = parsedTargetMins && parsedTargetMins > 0 ? parsedTargetMins : predictedMins;

  // Cálculo del Gap Fisiológico
  // delta > 0 significa que la meta es más rápida que el fitness actual
  const gapPercentage = ((predictedMins - targetMins) / predictedMins) * 100;

  let status: GoalFeasibilityStatus = "REALISTIC";
  if (gapPercentage > 15) {
    status = "HIGHLY_ASPIRATIONAL";
  } else if (gapPercentage > 5) {
    status = "CHALLENGING";
  }

  const targetRacePaceSec = (targetMins * 60) / distanceKm;
  const currentSafePaceSec = (predictedMins * 60) / distanceKm;

  // Staged Pace (Ritmo de Trabajo del Mesociclo Actual)
  let stagedRacePaceSec = targetRacePaceSec;
  if (status === "HIGHLY_ASPIRATIONAL") {
    // Si la meta es hiper-ambiciosa (ej. 2h30 cuando el cuerpo está para 3h30),
    // limitamos la progresión máxima del macrociclo al 8% de mejora para evitar desgarros
    stagedRacePaceSec = Math.round(currentSafePaceSec * 0.92);
  } else if (status === "CHALLENGING") {
    // Si es un reto exigente (5-15%), trabajamos en un ritmo puente (60% del gap cerrado)
    stagedRacePaceSec = Math.round(currentSafePaceSec - (currentSafePaceSec - targetRacePaceSec) * 0.65);
  }

  // Potencia Stryd Objetivo en Watts
  let targetPowerWatts: number | undefined;
  let targetPowerPctCp: number | undefined;
  if (metrics.runFtp && metrics.runFtp > 0) {
    const isMarathon = distanceKm >= 40;
    const isHalf = distanceKm >= 20 && distanceKm < 40;
    const is10k = distanceKm >= 9 && distanceKm < 20;

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
    coachAdvice = `Tu aspiración de ${targetStr} es excelente como visión a largo plazo. Sin embargo, tu fitness actual predice ~${predStr}. Para evitar lesiones miofibrilares y sobreentrenamiento, este macrociclo construirá la plataforma para romper ${formatGoalMinutes(Math.round((stagedRacePaceSec * distanceKm) / 60))} con ritmo puente seguro (${stagedPaceStr}), evaluando tu progreso en los tests de control.`;
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
    distanceKm,
  };
}
