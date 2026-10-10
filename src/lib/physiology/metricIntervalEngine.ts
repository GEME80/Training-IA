/**
 * metricIntervalEngine.ts
 * 
 * Motor Paramétrico de Intervalos de Running por Distancia Métrica Canónica (Renato Canova / Jack Daniels).
 * Emite directamente la sintaxis oficial de Intervals.icu y Garmin Connect:
 * - Distancia: 'mtr' para metros (ej. - 400mtr 102% Pace) o 'km' para kilómetros (ej. - 2km 90% Pace).
 * - Recuperación / Pausa: 'm' o 's' para tiempo (ej. - 1m30s 65% Pace).
 * - Cero código quemado: calcula dinámicamente duraciones, TSS y ritmos en tiempo de ejecución.
 */

import { RunningTrainingMode } from "../db/types";

export interface MetricWorkoutParams {
  weekNumber: number;
  phase: string;
  microcycleType?: string;
  mode?: RunningTrainingMode;
  targetTss?: number;
  thresholdPaceSec?: number;
  runFtp?: number;
  distanceGoal?: string;
}

export interface MetricWorkoutResult {
  name: string;
  workoutDoc: string;
  durationMinutes: number;
  tss: number;
  powerTarget: string;
  justification: string;
}

interface IntervalStepConfig {
  distanceMtr: number;
  intensityPct: number;
  restSec: number;
  restIntensityPct: number;
}

/**
 * Catálogo paramétrico de estructuras de intervalos por distancia.
 * Cubre series cortas (velocidad), medias (VO2max), escaleras y bloques de umbral extenso.
 */
const METRIC_STRUCTURES = [
  // 1. Series Cortas (Velocidad & Neuromuscular)
  {
    type: "SHORT_SPEED",
    title: "Series de Velocidad Pura en Pista",
    reps: 8,
    distanceMtr: 200,
    intensityPct: 110,
    restSec: 60,
    restIntensityPct: 55,
    justification: "Reclutamiento elástico de unidades motoras rápidas, cadencia ágil y economía de zancada.",
  },
  {
    type: "ANAEROBIC_POWER",
    title: "Intervalos Cortos de Potencia Anaeróbica",
    reps: 6,
    distanceMtr: 300,
    intensityPct: 108,
    restSec: 75,
    restIntensityPct: 55,
    justification: "Desarrollo de potencia láctica y tolerancia a la acidosis con recuperación completa.",
  },
  {
    type: "CLASSIC_400",
    title: "Series Rectoras de 400m en Pista",
    reps: 8,
    distanceMtr: 400,
    intensityPct: 105,
    restSec: 90,
    restIntensityPct: 55,
    justification: "Clásico estímulo de pista para capacidad glucolítica y ritmo de carrera fraccionado.",
  },
  {
    type: "SPEED_ENDURANCE_500",
    title: "Series Fraccionadas de 500m",
    reps: 6,
    distanceMtr: 500,
    intensityPct: 103,
    restSec: 90,
    restIntensityPct: 55,
    justification: "Transición entre velocidad pura y resistencia aeróbica de alta intensidad.",
  },
  // 2. Series Medias (VO2max & Tolerancia al Lactato)
  {
    type: "VO2MAX_600",
    title: "Series de Capacidad Aeróbica (600m)",
    reps: 6,
    distanceMtr: 600,
    intensityPct: 102,
    restSec: 105,
    restIntensityPct: 55,
    justification: "Sostenimiento del consumo máximo de oxígeno con aclaramiento eficiente de lactato.",
  },
  {
    type: "VO2MAX_800",
    title: "Series de Consumo Máximo de Oxígeno (800m)",
    reps: 5,
    distanceMtr: 800,
    intensityPct: 101,
    restSec: 120,
    restIntensityPct: 55,
    justification: "Estímulo de 2 a 3 minutos en VO2max para elevar el techo cardiovascular.",
  },
  {
    type: "THRESHOLD_1000",
    title: "Series de Umbral Funcional Daniels (1000m)",
    reps: 5,
    distanceMtr: 1000,
    intensityPct: 98,
    restSec: 120,
    restIntensityPct: 55,
    justification: "Elevación del ritmo umbral en intervalos métricos clásicos de un kilómetro.",
  },
  {
    type: "CRUISE_1200",
    title: "Intervalos de Ritmo Crucero Daniels (1200m)",
    reps: 4,
    distanceMtr: 1200,
    intensityPct: 96,
    restSec: 150,
    restIntensityPct: 55,
    justification: "Tolerancia a la fatiga en distancias intermedias de umbral anaeróbico.",
  },
  // 3. Bloques Largos & Ritmo Competitivo (Canova Special Blocks)
  {
    type: "CANOVA_1600",
    title: "Intervalos de Milla Canova (1600m)",
    reps: 4,
    distanceMtr: 1600,
    intensityPct: 94,
    restSec: 150,
    restIntensityPct: 55,
    justification: "Resistencia específica a ritmo de competición con densidad de volumen alta.",
  },
  {
    type: "THRESHOLD_2000",
    title: "Bloques Extensivos de Umbral (2000m)",
    reps: 3,
    distanceMtr: 2000,
    intensityPct: 92,
    restSec: 180,
    restIntensityPct: 60,
    justification: "Máximo estado estable de lactato en bloques de dos kilómetros con recuperación activa.",
  },
  {
    type: "TEMPO_3000",
    title: "Series Largas a Ritmo de Medio Maratón (3000m)",
    reps: 2,
    distanceMtr: 3000,
    intensityPct: 90,
    restSec: 180,
    restIntensityPct: 65,
    justification: "Automatización biomecánica y eficiencia metabólica en distancias de 3 km.",
  },
];

/**
 * Formatea segundos a string de descanso Intervals.icu:
 * 60s -> '1m', 90s -> '1m30s', 120s -> '2m', 150s -> '2m30s'
 */
function formatRestInterval(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m}m`;
  if (m === 0) return `${s}s`;
  return `${m}m${s}s`;
}

/**
 * Genera dinámicamente un entrenamiento de running por distancia métrica.
 */
export function generateMetricRunningWorkout(params: MetricWorkoutParams): MetricWorkoutResult {
  const {
    weekNumber,
    phase,
    microcycleType = "CARGA",
    mode = "PACE",
    thresholdPaceSec = 270,
    runFtp = 300,
  } = params;

  // 1. Selección de estructura según fase de periodización
  let eligibleStructures = METRIC_STRUCTURES;
  if (phase === "BASE") {
    // En Base: predominio de series cortas neuromusculares y primeras series de 800-1000m
    eligibleStructures = METRIC_STRUCTURES.filter(
      (s) => s.distanceMtr <= 1000 && (s.type.includes("SHORT") || s.distanceMtr <= 800)
    );
  } else if (phase === "BUILD") {
    // En Build: VO2max de 600m a 1600m y bloques de 1000-2000m
    eligibleStructures = METRIC_STRUCTURES.filter((s) => s.distanceMtr >= 400 && s.distanceMtr <= 2000);
  } else if (phase === "PEAK") {
    // En Peak: Ritmo específico Canova de 1000m a 3000m
    eligibleStructures = METRIC_STRUCTURES.filter((s) => s.distanceMtr >= 800);
  } else if (phase === "TAPER" || phase === "RACE_WEEK") {
    // En Taper: Series cortas de activación ágil
    eligibleStructures = METRIC_STRUCTURES.filter((s) => s.distanceMtr <= 400);
  }

  if (eligibleStructures.length === 0) eligibleStructures = METRIC_STRUCTURES;

  // Rotación semanal determinista coprima
  const structIdx = (weekNumber * 3) % eligibleStructures.length;
  const selected = eligibleStructures[structIdx] || METRIC_STRUCTURES[0];

  // 2. Modulación de repeticiones por microciclo
  let reps = selected.reps;
  if (microcycleType === "DESCARGA" || phase === "TAPER" || phase === "RACE_WEEK") {
    reps = Math.max(3, Math.round(selected.reps * 0.6));
  } else if (microcycleType === "IMPACTO") {
    reps = selected.reps + 1;
  }

  // 3. Formateo de targets e intensidades
  const intensityUnit = mode === "POWER" ? "% CP" : "% Pace";
  const restUnit = mode === "POWER" ? "% CP" : "% Pace";
  const restStr = formatRestInterval(selected.restSec);

  const mainStep = `- ${selected.distanceMtr}mtr ${selected.intensityPct}${intensityUnit}`;
  const restStep = `- ${restStr} ${selected.restIntensityPct}${restUnit}`;

  const warmupMins = phase === "RACE_WEEK" ? 10 : 15;
  const warmupPct = mode === "POWER" ? "68% CP" : "74% Pace";
  const cooldownMins = 10;
  const cooldownPct = mode === "POWER" ? "60% CP" : "70% Pace";

  const workoutDoc = [
    "Warmup",
    `- ${warmupMins}m ${warmupPct}`,
    "",
    `Main Set ${reps}x`,
    mainStep,
    restStep,
    "",
    "Cooldown",
    `- ${cooldownMins}m ${cooldownPct}`,
  ].join("\n");

  // 4. Cálculo dinámico de duración y TSS
  // Tiempo de cada repetición en segundos = (distancia / 1000) * (ritmo_umbral / (intensidad / 100))
  const stepTimeSec = (selected.distanceMtr / 1000) * (thresholdPaceSec / (selected.intensityPct / 100));
  const totalWorkSec = reps * (stepTimeSec + selected.restSec);
  const totalMins = Math.round(warmupMins + cooldownMins + totalWorkSec / 60);

  // Estimación de TSS según factor de intensidad
  const ifFactor = selected.intensityPct / 100;
  const estimatedTss = Math.round((totalMins * Math.pow(ifFactor, 2) * 100) / 60);

  const powerTarget =
    mode === "POWER"
      ? `${Math.round(runFtp * (selected.intensityPct / 100))}W (${selected.intensityPct}% CP)`
      : `${selected.intensityPct}% Pace`;

  const workoutName = `${selected.title} (${reps}x ${selected.distanceMtr}m @ ${selected.intensityPct}${intensityUnit})`;

  return {
    name: workoutName,
    workoutDoc,
    durationMinutes: totalMins,
    tss: Math.max(35, Math.min(120, estimatedTss)),
    powerTarget,
    justification: selected.justification,
  };
}
