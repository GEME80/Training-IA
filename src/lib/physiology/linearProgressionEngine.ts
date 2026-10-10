/**
 * linearProgressionEngine.ts
 * Motor de Progresión Pedagógica Continua y Sobrecarga Escalonada.
 * 
 * Genera progresiones reales semana a semana en repeticiones y metros
 * (ej. 10x 100m -> 8x 200m -> 6x 300m en Base; 6x 1000m -> 7x 1000m -> 4x 2000m en Build),
 * erradicando la paridad alterna 50/50 y los bucles estáticos repetitivos.
 */

import { formatPaceSecToStr } from "./goalFeasibilityEngine";

export interface LinearWorkoutParams {
  phase: string;
  weekNumber: number;
  isRecovery?: boolean;
  mode?: "POWER" | "PACE";
  runFtp?: number;
  bikeFtp?: number;
  thresholdPaceSec?: number;
  stagedRacePaceSec?: number;
  distanceType?: string;
}

export interface LinearQualityWorkoutResult {
  name: string;
  workoutDoc: string;
  durationMinutes: number;
  tss: number;
  powerTarget: string;
  justification: string;
}

export function generateLinearRunningWorkout(params: LinearWorkoutParams): LinearQualityWorkoutResult {
  const {
    phase = "BASE",
    weekNumber,
    isRecovery = false,
    mode = "POWER",
    runFtp = 280,
    thresholdPaceSec = 270,
    stagedRacePaceSec,
  } = params;

  const isPower = mode === "POWER" && runFtp > 0;
  const mesocycleStep = ((weekNumber - 1) % 4) + 1; // 1, 2, 3 o 4 (descarga)
  const normPhase = phase.toUpperCase();

  // Helper para vatios / ritmos
  const fmtTarget = (pctCp: number, pacePct: number, note?: string): string => {
    if (isPower) {
      const w = Math.round(runFtp * (pctCp / 100));
      return `${w}W (${pctCp}% CP${note ? ` • ${note}` : ""})`;
    }
    const sec = Math.round(thresholdPaceSec / (pacePct / 100));
    return `${formatPaceSecToStr(sec)} (${pacePct}% Pace${note ? ` • ${note}` : ""})`;
  };

  // 1. FASE BASE: Progresión Neuromuscular de Zancada y Cuestas (100m -> 200m -> 300m)
  if (normPhase.includes("BASE") || normPhase === "MAINTENANCE") {
    if (isRecovery || mesocycleStep === 4) {
      const warmupM = 15;
      const coolM = 10;
      const doc = [
        "Warmup",
        `- ${warmupM}m ${isPower ? "65% CP" : "70% Pace"}`,
        "",
        "Main Set 4x",
        `- 100m ${isPower ? "105% CP" : "105% Pace"}`,
        `- 60s ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- ${coolM}m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: "Progresión Base: Soltura Neuromuscular & Reactividad (4x 100m)",
        workoutDoc: doc,
        durationMinutes: 32,
        tss: 34,
        powerTarget: fmtTarget(105, 105, "Soltura Técnica"),
        justification: "Descarga 3:1: volumen reducido al 40% con rectas suaves para preservar la economía elástica sin fatiga muscular.",
      };
    }

    if (mesocycleStep === 1) {
      const doc = [
        "Warmup",
        `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
        "",
        "Main Set 10x",
        `- 100m ${isPower ? "115% CP" : "110% Pace"} en Cuesta`,
        `- 60s Trote Suave Bajada ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: "Progresión Base Sem 1: Cuestas Cortas & Potencia Elástica (10x 100m)",
        workoutDoc: doc,
        durationMinutes: 45,
        tss: 52,
        powerTarget: fmtTarget(115, 110, "Cuesta 6-8%"),
        justification: "Paso 1 del mesociclo: estímulo de fuerza específica de sóleo y tobillo sin impacto articular excesivo.",
      };
    }

    if (mesocycleStep === 2) {
      const doc = [
        "Warmup",
        `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
        "",
        "Main Set 8x",
        `- 200m ${isPower ? "112% CP" : "108% Pace"}`,
        `- 60s ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: "Progresión Base Sem 2: Zancada Fluida & Cadencia (8x 200m)",
        workoutDoc: doc,
        durationMinutes: 48,
        tss: 56,
        powerTarget: fmtTarget(112, 108, "Zancada Rápida"),
        justification: "Paso 2 del mesociclo: extensión de la distancia a 200m para fijar biomecánica fluida y frecuencia de paso.",
      };
    }

    // mesocycleStep === 3 (Sobrecarga cumbre del mesociclo)
    const doc = [
      "Warmup",
      `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
      "",
      "Main Set 6x",
      `- 300m ${isPower ? "108% CP" : "105% Pace"}`,
      `- 90s ${isPower ? "55% CP" : "60% Pace"}`,
      "",
      "Cooldown",
      `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
    ].join("\n");

    return {
      name: "Progresión Base Sem 3: Potencia Aláctica & Ritmo Rápido (6x 300m)",
      workoutDoc: doc,
      durationMinutes: 52,
      tss: 62,
      powerTarget: fmtTarget(108, 105, "Ritmo Rápido"),
      justification: "Paso 3 del mesociclo: culminación del bloque base alcanzando 300m para conectar potencia con resistencia.",
    };
  }

  // 2. FASE BUILD: Progresión de Capacidad Aeróbica y Ritmo Umbral (6x 1000m -> 7x 1000m -> 4x 2000m)
  if (normPhase.includes("BUILD")) {
    if (isRecovery || mesocycleStep === 4) {
      const doc = [
        "Warmup",
        `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
        "",
        "Main Set 4x",
        `- 800m ${isPower ? "96% CP" : "96% Pace"}`,
        `- 90s ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: "Progresión Build: Asimilación & Mantenimiento Aeróbico (4x 800m)",
        workoutDoc: doc,
        durationMinutes: 44,
        tss: 48,
        powerTarget: fmtTarget(96, 96, "Ritmo Asimilación"),
        justification: "Descarga 3:1: volumen reducido al 60% manteniendo velocidad para drenar fatiga y absorber la carga de Build.",
      };
    }

    if (mesocycleStep === 1) {
      const reps = 6;
      const doc = [
        "Warmup",
        `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
        "",
        `Main Set ${reps}x`,
        `- 1000m ${isPower ? "100% CP" : "100% Pace"}`,
        `- 90s ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: `Progresión Build Sem 1: Intervalos Umbral Daniels (${reps}x 1000m)`,
        workoutDoc: doc,
        durationMinutes: 55,
        tss: 68,
        powerTarget: fmtTarget(100, 100, "Umbral Funcional"),
        justification: `Paso 1 del mesociclo de Build: 6 km totales a ritmo umbral para elevar el umbral anaeróbico.`,
      };
    }

    if (mesocycleStep === 2) {
      const reps = 7;
      const doc = [
        "Warmup",
        `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
        "",
        `Main Set ${reps}x`,
        `- 1000m ${isPower ? "100% CP" : "100% Pace"}`,
        `- 90s ${isPower ? "55% CP" : "60% Pace"}`,
        "",
        "Cooldown",
        `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
      ].join("\n");

      return {
        name: `Progresión Build Sem 2: Sobrecarga de Volumen Umbral (${reps}x 1000m)`,
        workoutDoc: doc,
        durationMinutes: 62,
        tss: 78,
        powerTarget: fmtTarget(100, 100, "Umbral Funcional"),
        justification: `Paso 2 del mesociclo de Build: sobrecarga progresiva a 7 km totales sosteniendo el mismo ritmo umbral.`,
      };
    }

    // mesocycleStep === 3 (Sobrecarga de resistencia a la velocidad: 4x 2000m)
    const doc = [
      "Warmup",
      `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
      "",
      "Main Set 4x",
      `- 2000m ${isPower ? "96% CP" : "96% Pace"}`,
      `- 2m ${isPower ? "55% CP" : "60% Pace"}`,
      "",
      "Cooldown",
      `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
    ].join("\n");

    const targetNote = stagedRacePaceSec ? `Ritmo Meta: ${formatPaceSecToStr(stagedRacePaceSec)}` : "Ritmo Umbral Extendido";

    return {
      name: "Progresión Build Sem 3: Bloques Largos de Resistencia a la Velocidad (4x 2000m)",
      workoutDoc: doc,
      durationMinutes: 68,
      tss: 85,
      powerTarget: fmtTarget(96, 96, targetNote),
      justification: "Paso 3 del mesociclo de Build: 8 km totales en bloques largos de 2 km simulando la demanda metabólica de carrera.",
    };
  }

  // 3. FASE PEAK: Especificidad Canova a Ritmo Objetivo
  if (normPhase.includes("PEAK")) {
    const doc = [
      "Warmup",
      `- 15m ${isPower ? "68% CP" : "72% Pace"}`,
      "",
      "Main Set 3x",
      `- 3000m ${isPower ? "93% CP" : "93% Pace"}`,
      `- 2m30s ${isPower ? "55% CP" : "60% Pace"}`,
      "",
      "Cooldown",
      `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
    ].join("\n");

    return {
      name: "Especificidad Peak Canova: Bloques Extensos a Ritmo de Competición (3x 3000m)",
      workoutDoc: doc,
      durationMinutes: 72,
      tss: 88,
      powerTarget: fmtTarget(93, 93, "Ritmo Objetivo Maratón"),
      justification: "Bloque cumbre de Renato Canova: economía específica a ritmo de carrera para calibrar el consumo de glucógeno.",
    };
  }

  // 4. FASE TAPER / PUESTA A PUNTO
  const doc = [
    "Warmup",
    `- 15m ${isPower ? "65% CP" : "70% Pace"}`,
    "",
    "Main Set 4x",
    `- 400m ${isPower ? "102% CP" : "100% Pace"}`,
    `- 60s ${isPower ? "55% CP" : "60% Pace"}`,
    "",
    "Cooldown",
    `- 10m ${isPower ? "60% CP" : "65% Pace"}`,
  ].join("\n");

  return {
    name: "Afinamiento Taper: Chispa Neuromuscular & Activación Rápida (4x 400m)",
    workoutDoc: doc,
    durationMinutes: 35,
    tss: 38,
    powerTarget: fmtTarget(102, 100, "Activación Rápida"),
    justification: "Tapering previo a competición: volumen bajo para supercompensar glucógeno con aceleraciones cortas para tono muscular.",
  };
}
