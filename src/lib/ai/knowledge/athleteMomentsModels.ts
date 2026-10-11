import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_5K_VAM } from "./testingProtocols";
import { ALL_RUNNING_AEROBIC_WORKOUTS } from "./workoutPools/runningAerobicPool";
import {
  RUN_FARTLEK_MONEGETTI, RUN_FARTLEK_SUECO_PIRAMIDAL, RUN_FARTLEK_CUESTAS_NEUROMUSCULAR, RUN_PIRAMIDE_CONTINUA_Z2_Z3,
} from "./workoutPools/runningFartlekPool";
import {
  RUN_TEMPO_CONTINUO_30M, RUN_TEMPO_CRUISE_4X_2000M, RUN_TEMPO_PROGRESIVO_CANOVA,
} from "./workoutPools/runningTempoPool";

export { SPEED_BLOCK_MODEL, POST_RACE_DELOAD_MODEL, INJURY_REHAB_MODEL } from "./athleteMomentsSpecializedModels";

/**
 * 1. Base Aeróbica y Preparación General (GPP) — Seiler 80/20 + Attia
 */
export const BASE_GPP_MODEL: CuratedTrainingModel = {
  modelId: "BASE_GPP",
  sportCategory: "General",
  displayName: "PULSE Base Aeróbica y Preparación General",
  scientificAuthors: [
    "Dr. Stephen Seiler (Polarized Training 80/20 & Zone 2)",
    "Dr. Peter Attia (Mitochondrial Health & Connective Tissue Durability)",
  ],
  description:
    "Construye una base aeróbica sólida, fortalece tendones y articulaciones, y prepara el cuerpo antes de un plan específico de competición.",
  targetDistanceKm: 16,
  periodizationStyle: "Periodización Polarizada Continua 2:1 Preventiva",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Mitocondrial y Capilarización",
      percentageDuration: 0.60,
      focusDescription: "80% del tiempo en Zona 2 cómoda y conversacional, fortaleciendo el sóleo y tendón de Aquiles.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Tirada suave y progresiva de 45 a 60 min en Zona 2 pura (68-74% CP).",
      recommendedIntensityZones: ["Zona 2 Cómoda", "Cuestas Cortas de Fuerza"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Fuerza en Subida y Potencia Aeróbica",
      percentageDuration: 0.40,
      focusDescription: "Añadir cuestas cortas y tramos de ritmo alegre sin acumular fatiga excesiva.",
      weeklyTssRange: { min: 280, max: 370 },
      longRunGuideline: "Tiradas de 50 a 65 min con sensaciones ligeras.",
      recommendedIntensityZones: ["Cuestas de Potencia (95% CP)", "Carrera Continua Z2"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Consolidación de la Base",
      percentageDuration: 0.0,
      focusDescription: "Fase de consolidación continua.",
      weeklyTssRange: { min: 280, max: 360 },
      longRunGuideline: "Fondo cómodo de 60 min.",
      recommendedIntensityZones: ["Zona 2"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Asimilación",
      percentageDuration: 0.0,
      focusDescription: "Asimilación 2:1.",
      weeklyTssRange: { min: 180, max: 240 },
      longRunGuideline: "Carrera continua suave de 40 min.",
      recommendedIntensityZones: ["Regenerativo"],
    },
  ],
  mandatoryTests: [{ ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 }],
  maxLongRunMinutesCap: 65,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 10, maxLongRunMinutes: 55, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 65, maxLongRunKm: 12, maxLongRunMinutes: 65, tssScaleFactor: 1.0 },
    ADVANCED_ELITE: { ctlThresholdMax: 999, maxLongRunKm: 14, maxLongRunMinutes: 70, tssScaleFactor: 1.1 },
  },
  longRunRules: {
    startKm: 8,
    peakKm: 12,
    startMinutes: 45,
    peakMinutes: 65,
    targetIntensityPercentCpOrFtp: "68-74% CP (Zona 2 conversacional)",
    description: "Progresión suave de 8 km a 12 km sin sobrecargas articulares.",
    taperKmSequence: [8, 6],
    taperMinutesSequence: [45, 35],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Cuestas Cortas para Fuerza y Técnica (45m)",
          powerTarget: "95% CP en cuesta",
          justification: "Fortalece los tobillos y la impulsión sin impacto lesivo.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nCuestas Cortas con Bajada al Trote\n6x\n- 40s 95% FTP\n- 1m20s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
        RUN_PIRAMIDE_CONTINUA_Z2_Z3,
        RUN_TEMPO_CONTINUO_30M,
      ],
      build: [
        {
          name: "Carrera Continua Progresiva Cómoda con 5 Rectas (50m)",
          powerTarget: "72% CP + Rectas @ 105% CP",
          justification: "Aporta chispa y reactividad al pie.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nCarrera Continua\n- 30m 72% FTP\n\nRectas de Activación\n5x\n- 20s 105% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
        },
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        RUN_TEMPO_PROGRESIVO_CANOVA,
        RUN_FARTLEK_MONEGETTI,
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Volumen Aeróbico (55m)",
        powerTarget: "62% FTP",
        justification: "Suma minutos de trabajo aeróbico sin impacto en articulaciones.",
        workoutDoc: "Pedaleo Suave Continuo\n- 55m 62% FTP",
        durationMin: 55,
      },
    ],
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
    strengthWorkouts: [
      {
        name: "Fuerza Funcional de Piernas, Sóleo y Core",
        focus: "Sóleo, Tobillo y Abdomen",
        justification: "Acondiciona tendones para absorber el volumen futuro.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 15m Elevaciones de sóleo, sentadillas y planchas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.90, peakTssRatio: 1.22, recoveryDropPercent: 0.25, weeklyLoadStepTss: 10 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 60, recommendedStrengthSessionsPerWeek: 2, notes: "Fuerza y bici para base sólida." },
  banisterRampRateLimits: { minCtlPerWeek: 1.0, maxCtlPerWeek: 2.5 },
};

/**
 * 2. Construcción de Fuerza y Potencia General (Build Sin Carrera)
 */
export const GENERAL_BUILD_MODEL: CuratedTrainingModel = {
  modelId: "GENERAL_BUILD",
  sportCategory: "Running",
  displayName: "PULSE Construcción de Fuerza y Potencia (Sin Carrera)",
  scientificAuthors: ["Jack Daniels", "Pete Pfitzinger"],
  description: "Para ponerse más fuerte, rápido y resistente en temporada media sin el estrés de una competición específica.",
  targetDistanceKm: 18,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Acondicionamiento y Umbral Progresivo",
      percentageDuration: 0.40,
      focusDescription: "Elevar la velocidad de crucero con series de umbral suaves.",
      weeklyTssRange: { min: 280, max: 380 },
      longRunGuideline: "Tiradas de 12 a 15 km en Zona 2.",
      recommendedIntensityZones: ["Series de Umbral Suave (95% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia y Resistencia de Ritmo",
      percentageDuration: 0.60,
      focusDescription: "Intervalos de 1.000m y cuestas largas para consolidar la potencia.",
      weeklyTssRange: { min: 360, max: 460 },
      longRunGuideline: "Tiradas de 15 a 18 km con tramos a ritmo alegre.",
      recommendedIntensityZones: ["Series de Potencia (100% CP)"],
    },
    { phaseKey: "PEAK", phaseName: "Consolidación", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 300, max: 400 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "TAPER", phaseName: "Descarga", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 200, max: 280 }, longRunGuideline: "", recommendedIntensityZones: [] },
  ],
  mandatoryTests: [{ ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 }, { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 6 }],
  longRunRules: {
    startKm: 12,
    peakKm: 18,
    startMinutes: 65,
    peakMinutes: 100,
    targetIntensityPercentCpOrFtp: "70-76% CP en base con tramos de 85% CP",
    description: "Progresión controlada hasta 18 km.",
    taperKmSequence: [12, 8],
    taperMinutesSequence: [65, 45],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Bloques de Umbral Cómodo (3x 8m)",
          powerTarget: "95% CP",
          justification: "Eleva el umbral de crucero sin generar agotamiento.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloques de Umbral\n3x\n- 8m 95% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        RUN_TEMPO_CRUISE_4X_2000M,
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        RUN_TEMPO_CONTINUO_30M,
      ],
      build: [
        {
          name: "Series de 1.000m de Potencia de Ritmo (4x 1.000m)",
          powerTarget: "100% CP",
          justification: "Mejora la soltura para correr a ritmos rápidos.",
          workoutDoc: "Calentamiento\n- 15m 68% CP\n\nMain (Series de 1000m)\n4x\n- 1000mtr 100% CP\n- 2m 55% CP\n\nEnfriamiento\n- 10m 60% CP",
        },
        RUN_FARTLEK_MONEGETTI,
        RUN_TEMPO_PROGRESIVO_CANOVA,
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo (50m)",
        powerTarget: "62% FTP",
        justification: "Descarga de impacto.",
        workoutDoc: "Pedaleo Suave\n- 50m 62% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
    strengthWorkouts: [
      {
        name: "Fuerza Funcional y Resistencia Muscular",
        focus: "Piernas y Core",
        justification: "Mantiene la estabilidad y fuerza general.",
        workoutDoc: "Movilidad\n- 5m\n\nFuerza\n- 15m Sentadillas, zancadas y planchas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.88, peakTssRatio: 1.28, recoveryDropPercent: 0.26, weeklyLoadStepTss: 12 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 60, recommendedStrengthSessionsPerWeek: 1, notes: "Fuerza y bici complementarias." },
  banisterRampRateLimits: { minCtlPerWeek: 1.2, maxCtlPerWeek: 3.0 },
};
