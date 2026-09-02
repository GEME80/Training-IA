import { CuratedTrainingModel, SportDisciplineGoal } from "./types";
import { MARATHON_42K_MODEL, HALF_MARATHON_21K_MODEL } from "./marathonModel";
import { FIVE_K_SPEED_MODEL, TEN_K_ROAD_MODEL } from "./fiveAndTenKModels";
import { CYCLING_GRAN_FONDO_MODEL } from "./cyclingModel";
import { CYCLING_CLIMBING_MODEL, CYCLING_CRITERIUM_MODEL } from "./cyclingSpecialtyModels";
import { TRIATHLON_70_3_MODEL } from "./triathlonModel";
import { TRIATHLON_SHORT_MODEL, TRIATHLON_140_6_MODEL } from "./triathlonFullAndShortModels";
import { TRAIL_ULTRA_MODEL } from "./trailModel";
import { BASE_LONGEVITY_MODEL } from "./longevityModel";
import {
  BASE_GPP_MODEL,
  GENERAL_BUILD_MODEL,
  SPEED_BLOCK_MODEL,
  POST_RACE_DELOAD_MODEL,
  INJURY_REHAB_MODEL,
} from "./athleteMomentsModels";

export * from "./types";
export * from "./testingProtocols";
export * from "./marathonModel";
export * from "./fiveAndTenKModels";
export * from "./cyclingModel";
export * from "./cyclingSpecialtyModels";
export * from "./triathlonModel";
export * from "./triathlonFullAndShortModels";
export * from "./trailModel";
export * from "./longevityModel";
export * from "./athleteMomentsModels";
export * from "./strengthAndCrossModels";


export const ALL_CURATED_TRAINING_MODELS: Record<SportDisciplineGoal, CuratedTrainingModel> = {
  MARATHON_42K: MARATHON_42K_MODEL,
  HALF_MARATHON_21K: HALF_MARATHON_21K_MODEL,
  TEN_K_ROAD: TEN_K_ROAD_MODEL,
  FIVE_K_SPEED: FIVE_K_SPEED_MODEL,
  CYCLING_GRAN_FONDO: CYCLING_GRAN_FONDO_MODEL,
  CYCLING_CLIMBING: CYCLING_CLIMBING_MODEL,
  CYCLING_CRITERIUM: CYCLING_CRITERIUM_MODEL,
  TRIATHLON_70_3: TRIATHLON_70_3_MODEL,
  TRIATHLON_SHORT: TRIATHLON_SHORT_MODEL,
  TRIATHLON_140_6: TRIATHLON_140_6_MODEL,
  TRAIL_ULTRA: TRAIL_ULTRA_MODEL,
  BASE_GPP: BASE_GPP_MODEL,
  GENERAL_BUILD: GENERAL_BUILD_MODEL,
  SPEED_BLOCK: SPEED_BLOCK_MODEL,
  POST_RACE_DELOAD: POST_RACE_DELOAD_MODEL,
  INJURY_REHAB: INJURY_REHAB_MODEL,
  BASE_LONGEVITY: BASE_LONGEVITY_MODEL,
};

/**
 * Resuelve el modelo científico de entrenamiento rector a partir de los parámetros del atleta
 */
export function resolveTrainingModel(params: {
  targetDistance?: string;
  raceDistance?: string;
  athleteMoment?: string;
  trainingApproach?: string;
  raceName?: string;
  customGoal?: string;
}): CuratedTrainingModel {
  const dist = (params.targetDistance || params.raceDistance || "").toLowerCase();
  const moment = (params.athleteMoment || "").toLowerCase();
  const approach = (params.trainingApproach || "").toLowerCase();
  const name = (params.raceName || params.customGoal || "").toLowerCase();

  const combined = `${dist} ${moment} ${approach} ${name}`;

  // 1. Momentos del Atleta / Fuera de Competición
  if (combined.includes("rehab") || combined.includes("lesion") || combined.includes("caco") || combined.includes("injury") || combined.includes("reacondicionamiento")) {
    return INJURY_REHAB_MODEL;
  }
  if (combined.includes("post_race") || combined.includes("post-race") || combined.includes("recupera") || combined.includes("descarga") || combined.includes("deload")) {
    return POST_RACE_DELOAD_MODEL;
  }
  if (combined.includes("speed_block") || combined.includes("velocidad_pura") || combined.includes("zancada") || combined.includes("biomecanica")) {
    return SPEED_BLOCK_MODEL;
  }
  if (combined.includes("general_build") || combined.includes("build_sin_carrera") || combined.includes("fuerza_potencia") || combined.includes("construccion_general")) {
    return GENERAL_BUILD_MODEL;
  }
  if (combined.includes("base_gpp") || combined.includes("base_building") || combined.includes("pretemporada") || combined.includes("pre-ciclo") || combined.includes("gpp")) {
    return BASE_GPP_MODEL;
  }

  // 2. Triatlón
  if (combined.includes("140.6") || combined.includes("1406") || combined.includes("full_iron") || combined.includes("ironman full") || combined.includes("triathlon_1406")) {
    return TRIATHLON_140_6_MODEL;
  }
  if (combined.includes("sprint") || combined.includes("olimp") || combined.includes("triathlon_short") || combined.includes("triathlon_sprint") || combined.includes("triathlon_olympic")) {
    return TRIATHLON_SHORT_MODEL;
  }
  if (combined.includes("triatl") || combined.includes("70.3") || combined.includes("703") || combined.includes("triathlon_703") || combined.includes("ironman")) {
    return TRIATHLON_70_3_MODEL;
  }

  // 3. Trail & Montaña
  if (combined.includes("trail") || combined.includes("ultra") || combined.includes("montaña") || combined.includes("utmb") || combined.includes("trail_50k")) {
    return TRAIL_ULTRA_MODEL;
  }

  // 4. Ciclismo
  if (combined.includes("escalada") || combined.includes("climb") || combined.includes("puertos") || combined.includes("cycling_climbing") || combined.includes("montaña_bici")) {
    return CYCLING_CLIMBING_MODEL;
  }
  if (combined.includes("crit") || combined.includes("criterium") || combined.includes("cycling_criterium") || combined.includes("sprint_bici") || combined.includes("arrancadas")) {
    return CYCLING_CRITERIUM_MODEL;
  }
  if (combined.includes("bici") || combined.includes("cicli") || combined.includes("fondo") || combined.includes("gravel") || combined.includes("gran fondo") || combined.includes("cycling_fondo")) {
    return CYCLING_GRAN_FONDO_MODEL;
  }

  // 5. Running
  if (combined.includes("5k") || combined.includes("five_k") || combined.includes("velocidad 5")) {
    return FIVE_K_SPEED_MODEL;
  }
  if (combined.includes("10k") || combined.includes("ten_k") || combined.includes("diez")) {
    return TEN_K_ROAD_MODEL;
  }
  if (combined.includes("21k") || combined.includes("media") || combined.includes("half") || combined.includes("medio marat")) {
    return HALF_MARATHON_21K_MODEL;
  }
  if (combined.includes("42k") || combined.includes("marat") || combined.includes("42.2")) {
    return MARATHON_42K_MODEL;
  }

  // 6. Salud / Longevidad / Mantenimiento
  if (combined.includes("salud") || combined.includes("manten") || combined.includes("longev") || combined.includes("maintenance")) {
    return BASE_LONGEVITY_MODEL;
  }

  return MARATHON_42K_MODEL;
}

/**
 * Calcula la progresión matemática y fisiológica de la tirada larga dominical.
 * volumeScaleFactor ajusta el volumen según el CTL real del atleta (anti-lesión).
 */
export function calculateProgressiveLongRun(
  model: CuratedTrainingModel,
  weekNumber: number,
  totalWeeks: number,
  isRecoveryWeek: boolean,
  phase: string,
  countdown: number,
  volumeScaleFactor: number = 1.0,
  athleteCtl?: number
): {
  km: number;
  minutes: number;
  workoutName: string;
  powerTarget: string;
  workoutDoc: string;
  isPeakBlock: boolean;
} {
  const rules = model.longRunRules;
  const maxCapMins = model.maxLongRunMinutesCap || 150; // Cap estricto por defecto (150m / 2h30m)

  // Determinar límites por Nivel de Atleta (Debutante vs Intermedio vs Élite)
  let levelMaxKm = rules.peakKm;
  let levelMaxMins = Math.min(rules.peakMinutes, maxCapMins);

  if (athleteCtl !== undefined && model.athleteLevelCaps) {
    if (athleteCtl < 30) {
      levelMaxKm = model.athleteLevelCaps.BEGINNER.maxLongRunKm;
      levelMaxMins = model.athleteLevelCaps.BEGINNER.maxLongRunMinutes;
    } else if (athleteCtl <= 60) {
      levelMaxKm = model.athleteLevelCaps.INTERMEDIATE.maxLongRunKm;
      levelMaxMins = model.athleteLevelCaps.INTERMEDIATE.maxLongRunMinutes;
    } else {
      levelMaxKm = model.athleteLevelCaps.ADVANCED_ELITE.maxLongRunKm;
      levelMaxMins = model.athleteLevelCaps.ADVANCED_ELITE.maxLongRunMinutes;
    }
  }

  // Aplicar factor de escala al modelo canónico respetando los caps
  const scaledStartKm = Math.round(rules.startKm * volumeScaleFactor);
  const scaledPeakKm = Math.min(levelMaxKm, Math.round(rules.peakKm * volumeScaleFactor));
  const scaledStartMins = Math.round(rules.startMinutes * volumeScaleFactor);
  const scaledPeakMins = Math.min(levelMaxMins, Math.round(rules.peakMinutes * volumeScaleFactor));

  // 1. Fase de Competición Oficial
  if (phase === "RACE_WEEK" || countdown === 1) {
    const raceDist = model.targetDistanceKm || 42.2;
    const raceMins = raceDist >= 40 ? 210 : raceDist >= 20 ? 105 : raceDist >= 10 ? 50 : 25;
    return {
      km: Math.round(raceDist * 10) / 10,
      minutes: raceMins,
      workoutName: `🏆 COMPETICIÓN OBJETIVO: ${model.displayName.split("(")[0].trim()} (${raceDist} km)`,
      powerTarget: rules.targetIntensityPercentCpOrFtp,
      workoutDoc: `Warmup\n- 15m 65% FTP Activación & Movilidad\n\nMain (Competición Oficial)\n- ${raceDist} km @ Ritmo Objetivo de Carrera\n- Control nutricional: 60-80g CHO/h e hidratación\n\nCooldown\n- 10m Caminata de Recuperación`,
      isPeakBlock: true,
    };
  }

  // 2. Fase de Tapering
  if (phase === "TAPER") {
    const taperIdx = Math.max(0, Math.min(rules.taperKmSequence.length - 1, countdown - 2));
    const taperKm = Math.round((rules.taperKmSequence[taperIdx] || rules.startKm) * volumeScaleFactor);
    const taperMins = Math.min(maxCapMins, Math.round((rules.taperMinutesSequence[taperIdx] || rules.startMinutes) * volumeScaleFactor));

    return {
      km: taperKm,
      minutes: taperMins,
      workoutName: `Rodaje de Puesta a Punto Tapering (${taperKm} km / ${taperMins}m Z1-Z2)`,
      powerTarget: "70-74% CP (Z2 Suave conservando ritmo de carrera)",
      workoutDoc: `Warmup\n- 15m 65% FTP\n\nMain\n- ${Math.max(10, taperMins - 25)}m 72% FTP\n\nCooldown\n- 10m 60% FTP`,
      isPeakBlock: false,
    };
  }

  // 3. Progresión Aritmética Continua (Base → Build → Peak) con Cap Absoluto
  const peakTargetWeek = Math.max(3, totalWeeks - (model.taperingRules?.taperingWeeks || 3));
  const progressRatio = Math.min(1, Math.max(0, (weekNumber - 1) / (peakTargetWeek - 1)));

  let baseKm = Math.round(scaledStartKm + progressRatio * (scaledPeakKm - scaledStartKm));
  let baseMins = Math.min(maxCapMins, Math.round(scaledStartMins + progressRatio * (scaledPeakMins - scaledStartMins)));

  // Modulador en semanas de descarga biológica
  if (isRecoveryWeek) {
    baseKm = Math.max(scaledStartKm, Math.round(baseKm * 0.78));
    baseMins = Math.max(scaledStartMins, Math.round(baseMins * 0.78));
    return {
      km: baseKm,
      minutes: baseMins,
      workoutName: `Tirada Larga de Asimilación (${baseKm} km / ${baseMins}m Z2)`,
      powerTarget: "70% CP (Asimilación Biológica)",
      workoutDoc: `Warmup\n- 15m 65% FTP\n\nMain\n- ${Math.max(10, baseMins - 25)}m 70% FTP\n\nCooldown\n- 10m 60% FTP`,
      isPeakBlock: false,
    };
  }

  const isPeak = baseKm >= scaledPeakKm - 2 && (phase === "PEAK" || countdown <= 5);

  // PEAK diferencial: cuando countdown <= 3 y en pico, aplicar descenso suave -10% previo al tapering
  if (isPeak && countdown <= 3 && countdown > 1) {
    baseKm = Math.round(baseKm * 0.90);
    baseMins = Math.round(baseMins * 0.90);
  }

  const workoutName = isPeak
    ? (countdown <= 3 && countdown > 1)
      ? `📉 DESCENSO PICO — Transición a Tapering (${baseKm} km / ${baseMins}m @ Ritmo Carrera)`
      : `🔥 FONDO CUMBRE ESPECÍFICO (${baseKm} km / ${baseMins}m con Ritmo de Carrera)`
    : phase === "BUILD"
    ? `Tirada Larga Progresiva (${baseKm} km / ${baseMins}m Z2-Z3)`
    : `Tirada Larga de Construcción Aeróbica (${baseKm} km / ${baseMins}m Z2)`;

  const doc = isPeak
    ? `Warmup\n- 20m 68% FTP\n\n2x (Ritmo Específico)\n- 25m 82% FTP\n- 5m 68% FTP\n\nMain (Z2)\n- ${Math.max(10, baseMins - 60)}m 74% FTP\n\nCooldown\n- 10m 60% FTP`
    : `Warmup\n- 15m 68% FTP\n\nMain\n- ${Math.max(10, baseMins - 25)}m 74% FTP\n\nCooldown\n- 10m 60% FTP`;

  return {
    km: baseKm,
    minutes: baseMins,
    workoutName,
    powerTarget: isPeak ? "78-83% CP (Ritmo de Carrera)" : "72-76% CP (Z2 Base)",
    workoutDoc: doc,
    isPeakBlock: isPeak,
  };
}



/**
 * Calcula el TSS semanal con progresión aritmética continua sin escalones planos
 */
export function calculateProgressiveWeeklyTss(
  model: CuratedTrainingModel,
  weekNumber: number,
  totalWeeks: number,
  isRecoveryWeek: boolean,
  phase: string,
  baselineTss: number = 320
): number {
  if (phase === "RACE_WEEK") {
    return Math.round(baselineTss * 0.45);
  }

  if (phase === "TAPER") {
    const taperProgress = (totalWeeks - weekNumber) / 3;
    return Math.round(baselineTss * (0.55 + taperProgress * 0.20));
  }

  const peakTargetWeek = Math.max(3, totalWeeks - 3);
  const progressRatio = Math.min(1, Math.max(0, (weekNumber - 1) / (peakTargetWeek - 1)));
  const targetPeakTss = baselineTss * model.tssProgressionRules.peakTssRatio;
  const startTss = baselineTss * model.tssProgressionRules.startTssRatio;

  let weekTss = Math.round(startTss + progressRatio * (targetPeakTss - startTss));

  if (isRecoveryWeek) {
    weekTss = Math.round(weekTss * (1 - model.tssProgressionRules.recoveryDropPercent));
  }

  return Math.max(160, weekTss);
}

/**
 * Calcula la distribución exacta de semanas por fase para un macrociclo
 */
export function computePhaseWeeksDistribution(
  totalWeeks: number,
  model: CuratedTrainingModel
): Array<{ phaseKey: "BASE" | "BUILD" | "PEAK" | "TAPER"; phaseName: string; weekCount: number; startWeek: number; endWeek: number }> {
  const safeTotal = Math.max(4, Math.round(totalWeeks));
  let remaining = safeTotal;
  const result: Array<{ phaseKey: "BASE" | "BUILD" | "PEAK" | "TAPER"; phaseName: string; weekCount: number; startWeek: number; endWeek: number }> = [];

  let currentStart = 1;

  model.phaseDistributions.forEach((p, idx) => {
    let count: number;
    if (idx === model.phaseDistributions.length - 1) {
      count = Math.max(1, remaining);
    } else {
      count = Math.max(1, Math.round(safeTotal * p.percentageDuration));
      remaining -= count;
    }

    result.push({
      phaseKey: p.phaseKey,
      phaseName: p.phaseName,
      weekCount: count,
      startWeek: currentStart,
      endWeek: currentStart + count - 1,
    });
    currentStart += count;
  });

  return result;
}
