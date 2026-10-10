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

export type MetricStructureCategory = "PYRAMID" | "LADDER" | "MIXED" | "REPETITION" | "FARTLEK" | "TEMPO_BLOCKS";

export interface MetricWorkoutStep {
  reps?: number;
  distanceMtr?: number;
  durationSec?: number;
  intensityPct: number;
  restSec: number;
  restIntensityPct: number;
}

export interface MetricStructureDef {
  category: MetricStructureCategory;
  title: string;
  phaseCompatibility: Array<"BASE" | "BUILD" | "PEAK" | "TAPER" | "RACE_WEEK">;
  justification: string;
  steps: MetricWorkoutStep[];
}

const METRIC_STRUCTURES: MetricStructureDef[] = [
  // 1. PIRÁMIDES DE PISTA
  {
    category: "PYRAMID",
    title: "Pirámide Clásica de Pista",
    phaseCompatibility: ["BUILD", "PEAK"],
    justification: "Transición ascendente y descendente de volumen para entrenar reclutamiento neuromuscular y economía en fatiga.",
    steps: [
      { distanceMtr: 400, intensityPct: 105, restSec: 60, restIntensityPct: 55 },
      { distanceMtr: 800, intensityPct: 101, restSec: 90, restIntensityPct: 55 },
      { distanceMtr: 1200, intensityPct: 98, restSec: 120, restIntensityPct: 55 },
      { distanceMtr: 800, intensityPct: 101, restSec: 90, restIntensityPct: 55 },
      { distanceMtr: 400, intensityPct: 106, restSec: 60, restIntensityPct: 55 },
    ],
  },
  // 2. ESCALERAS DESCENDENTES DE RITMO
  {
    category: "LADDER",
    title: "Escalera Descendente de Ritmo",
    phaseCompatibility: ["BUILD", "PEAK"],
    justification: "Cada escalón es más corto y más rápido, enseñando al cuerpo a acelerar progresivamente con ácido láctico acumulado.",
    steps: [
      { distanceMtr: 2000, intensityPct: 92, restSec: 150, restIntensityPct: 55 },
      { distanceMtr: 1600, intensityPct: 95, restSec: 120, restIntensityPct: 55 },
      { distanceMtr: 1200, intensityPct: 98, restSec: 105, restIntensityPct: 55 },
      { distanceMtr: 800, intensityPct: 102, restSec: 90, restIntensityPct: 55 },
    ],
  },
  {
    category: "LADDER",
    title: "Escalera Corta de Velocidad",
    phaseCompatibility: ["BASE", "BUILD", "TAPER"],
    justification: "Dos bloques de aceleración elástica para mejorar la reactividad de tobillo sin agotamiento glucolítico masivo.",
    steps: [
      { reps: 2, distanceMtr: 200, intensityPct: 110, restSec: 60, restIntensityPct: 55 },
      { reps: 2, distanceMtr: 400, intensityPct: 105, restSec: 75, restIntensityPct: 55 },
      { reps: 2, distanceMtr: 600, intensityPct: 101, restSec: 90, restIntensityPct: 55 },
    ],
  },
  // 3. SERIES MIXTAS / COMBINADAS (Fondo + Chispa Final)
  {
    category: "MIXED",
    title: "Series Combinadas (Umbral + Transferencia Rápida)",
    phaseCompatibility: ["BUILD", "PEAK"],
    justification: "Bloque principal de ritmo umbral seguido de series cortas vivas para reclutar fibras rápidas en estado de pre-fatiga.",
    steps: [
      { reps: 4, distanceMtr: 1000, intensityPct: 98, restSec: 105, restIntensityPct: 55 },
      { reps: 4, distanceMtr: 300, intensityPct: 108, restSec: 60, restIntensityPct: 55 },
    ],
  },
  {
    category: "MIXED",
    title: "Series de Milla con Rectas de Cadencia",
    phaseCompatibility: ["BASE", "BUILD"],
    justification: "Volumen aeróbico específico de milla con transferencias cortas a alta frecuencia de zancada (185+ spm).",
    steps: [
      { reps: 3, distanceMtr: 1600, intensityPct: 94, restSec: 120, restIntensityPct: 55 },
      { reps: 4, distanceMtr: 200, intensityPct: 110, restSec: 60, restIntensityPct: 55 },
    ],
  },
  // 4. FARTLEKS ESTRUCTURADOS (Tiempo / Distancia Continua)
  {
    category: "FARTLEK",
    title: "Fartlek Clásico de Cambios de Ritmo",
    phaseCompatibility: ["BASE", "BUILD", "PEAK"],
    justification: "Cambios de ritmo continuos por sensaciones que desarrollan capacidad de acelerar y recuperar sobre la marcha.",
    steps: [
      { reps: 5, durationSec: 120, intensityPct: 98, restSec: 60, restIntensityPct: 70 },
      { reps: 5, durationSec: 60, intensityPct: 105, restSec: 60, restIntensityPct: 70 },
    ],
  },
  // 5. BLOQUES DE TEMPO SOSTENIDO
  {
    category: "TEMPO_BLOCKS",
    title: "Tempo en Bloques a Ritmo Objetivo",
    phaseCompatibility: ["BASE", "BUILD", "PEAK"],
    justification: "Fijación del ritmo específico de carrera con pausa corta al trote para lavado de lactato.",
    steps: [
      { reps: 2, distanceMtr: 3000, intensityPct: 90, restSec: 150, restIntensityPct: 65 },
    ],
  },
  // 6. SERIES RECTORAS CLÁSICAS DE PISTA (VO2max)
  {
    category: "REPETITION",
    title: "Series de Pista (800m VO2max)",
    phaseCompatibility: ["BUILD", "PEAK"],
    justification: "Estímulo clásico de 2 a 3 minutos en VO2max para elevar la potencia aeróbica máxima.",
    steps: [
      { reps: 6, distanceMtr: 800, intensityPct: 101, restSec: 105, restIntensityPct: 55 },
    ],
  },
  {
    category: "REPETITION",
    title: "Series de Pista (1000m Ritmo Umbral)",
    phaseCompatibility: ["BASE", "BUILD", "PEAK"],
    justification: "Intervalos de un kilómetro para expandir el volumen en el umbral anaeróbico funcional.",
    steps: [
      { reps: 5, distanceMtr: 1000, intensityPct: 98, restSec: 105, restIntensityPct: 55 },
    ],
  },
  {
    category: "REPETITION",
    title: "Series de Pista (400m de Economía de Zancada)",
    phaseCompatibility: ["BASE", "TAPER", "RACE_WEEK"],
    justification: "Repeticiones cortas con recuperación completa para afinar la técnica y zancada elástica.",
    steps: [
      { reps: 8, distanceMtr: 400, intensityPct: 105, restSec: 75, restIntensityPct: 55 },
    ],
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

  // 1. Filtrar familias de estímulos según compatibilidad de fase
  const normPhase = (phase || "BASE").toUpperCase() as "BASE" | "BUILD" | "PEAK" | "TAPER" | "RACE_WEEK";
  let eligibleStructures = METRIC_STRUCTURES.filter((s) => s.phaseCompatibility.includes(normPhase));
  if (eligibleStructures.length === 0) eligibleStructures = METRIC_STRUCTURES;

  // Rotación semanal determinista anti-monotonía
  const structIdx = (weekNumber * 2 + 1) % eligibleStructures.length;
  const selected = eligibleStructures[structIdx] || METRIC_STRUCTURES[0];

  const intensityUnit = mode === "POWER" ? "% CP" : "% Pace";
  const restUnit = mode === "POWER" ? "% CP" : "% Pace";

  const isDeload = microcycleType === "DESCARGA" || normPhase === "TAPER" || normPhase === "RACE_WEEK";
  const warmupMins = normPhase === "RACE_WEEK" ? 10 : 15;
  const warmupPct = mode === "POWER" ? "68% CP" : "74% Pace";
  const cooldownMins = 10;
  const cooldownPct = mode === "POWER" ? "60% CP" : "70% Pace";

  // 2. Construcción de bloques del workoutDoc
  const docLines: string[] = ["Warmup", `- ${warmupMins}m ${warmupPct}`, ""];
  let totalWorkSec = 0;
  let weightedIntensitySum = 0;
  let totalStepCount = 0;

  selected.steps.forEach((step, idx) => {
    let effectiveReps = step.reps || 1;
    if (isDeload && effectiveReps > 2) {
      effectiveReps = Math.max(2, Math.round(effectiveReps * 0.7));
    }

    const restStr = formatRestInterval(step.restSec);
    let stepWorkTimeSec = 0;

    if (step.distanceMtr) {
      stepWorkTimeSec = (step.distanceMtr / 1000) * (thresholdPaceSec / (step.intensityPct / 100));
    } else if (step.durationSec) {
      stepWorkTimeSec = step.durationSec;
    }

    totalWorkSec += effectiveReps * (stepWorkTimeSec + step.restSec);
    weightedIntensitySum += effectiveReps * step.intensityPct;
    totalStepCount += effectiveReps;

    const mainText = step.distanceMtr
      ? `- ${step.distanceMtr}mtr ${step.intensityPct}${intensityUnit}`
      : `- ${formatRestInterval(step.durationSec || 60)} ${step.intensityPct}${intensityUnit}`;
    const restText = `- ${restStr} ${step.restIntensityPct}${restUnit}`;

    if (effectiveReps > 1) {
      docLines.push(`Main Set ${effectiveReps}x`, mainText, restText, "");
    } else {
      if (idx === 0) docLines.push("Main Set");
      docLines.push(mainText, restText);
    }
  });

  docLines.push("", "Cooldown", `- ${cooldownMins}m ${cooldownPct}`);

  // 3. Duración total y cálculo dinámico de TSS
  const totalMins = Math.round(warmupMins + cooldownMins + totalWorkSec / 60);
  const avgIntensityPct = totalStepCount > 0 ? weightedIntensitySum / totalStepCount : 100;
  const ifFactor = avgIntensityPct / 100;
  const estimatedTss = Math.round((totalMins * Math.pow(ifFactor, 2) * 100) / 60);

  const powerTarget =
    mode === "POWER"
      ? `${Math.round(runFtp * ifFactor)}W (${Math.round(avgIntensityPct)}% CP Promedio)`
      : `${Math.round(avgIntensityPct)}% Pace`;

  return {
    name: selected.title,
    workoutDoc: docLines.join("\n"),
    durationMinutes: totalMins,
    tss: Math.max(35, Math.min(125, estimatedTss)),
    powerTarget,
    justification: selected.justification,
  };
}
