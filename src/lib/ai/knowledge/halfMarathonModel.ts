import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_20M_TT } from "./testingProtocols";
import {
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_BLOQUES_3X_2000M,
  RUN_DISTANCE_SERIES_5X_1000M,
  RUN_DISTANCE_SERIES_6X_800M,
  RUN_DISTANCE_MILLA_4X_1600M,
  RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
} from "./workoutPools/runningDistancePool";
import {
  RUN_FARTLEK_MONEGETTI,
  RUN_FARTLEK_POLACO_FLOTACION,
  RUN_FARTLEK_SUECO_PIRAMIDAL,
  RUN_BILLAT_30_30,
  RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
  RUN_TEMPO_BLOQUES_3X_10M,
  RUN_PIRAMIDE_CONTINUA_Z2_Z3,
} from "./workoutPools/runningFartlekPool";
import {
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
} from "./workoutPools/cyclingIntervalPool";

export const HALF_MARATHON_21K_MODEL: CuratedTrainingModel = {
  modelId: "HALF_MARATHON_21K",
  sportCategory: "Running",
  displayName: "PULSE 21K Half Marathon Mastery (Canova + Daniels)",
  scientificAuthors: [
    "Renato Canova (Specific Block & Threshold Extension)",
    "Jack Daniels (Vam & Critical Power Running)",
    "Pete Pfitzinger (Faster Road Racing 21K)",
  ],
  description:
    "Modelo científico para medio maratón 21.1K. Énfasis en potencia aeróbica, umbral anaeróbico funcional y tirada larga progresiva hasta 22 km.",
  targetDistanceKm: 21.1,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1 o 2:1",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Capacidad Mitocondrial",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo de volumen aeróbico Z2, fartleks de crucero y fortalecimiento de sóleo.",
      weeklyTssRange: { min: 250, max: 340 },
      longRunGuideline: "Progresión de 12 km (65m) a 16 km (85m) en Zona 2 (68-74% CP).",
      recommendedIntensityZones: ["Z1 Regenerativo (55-65% CP)", "Z2 Base Aeróbica (68-75% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Capacidad Láctica",
      percentageDuration: 0.38,
      focusDescription: "Alternancia de series de pista en 'mtr' y fartleks por tiempo para elevar el ritmo de crucero.",
      weeklyTssRange: { min: 340, max: 440 },
      longRunGuideline: "Fondos progresivos de 16 a 22 km (85 a 115 min) con bloques al 84-88% CP.",
      recommendedIntensityZones: ["Series Umbral (98-102% CP)", "Ritmo 21K (85-89% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico Específico & Ritmo de Competición",
      percentageDuration: 0.17,
      focusDescription: "Intervalos específicos a ritmo de medio maratón y simulaciones de ritmo sostenido.",
      weeklyTssRange: { min: 380, max: 470 },
      longRunGuideline: "Tirada cumbre de 20-22 km (100-115 min) con 10-12 km al 85-88% CP.",
      recommendedIntensityZones: ["Ritmo Medio Maratón Sostenido (85-88% CP)"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto & Frescura Muscular",
      percentageDuration: 0.10,
      focusDescription: "Reducción progresiva de volumen conservando toques de ritmo competitivo y strides reactivos.",
      weeklyTssRange: { min: 180, max: 260 },
      longRunGuideline: "Descenso a 15 km (75m) -> 10 km (50m) en las 2 semanas finales.",
      recommendedIntensityZones: ["Strides Cortos (105% CP)", "Trote Suave Z2 (70% CP)"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 7 },
  ],
  longRunRules: {
    startKm: 12,
    peakKm: 22,
    startMinutes: 65,
    peakMinutes: 115,
    targetIntensityPercentCpOrFtp: "70-75% CP en base y 85-89% CP en bloques específicos",
    description: "Progresión de 12km a 22km con descargas 2:1 o 3:1 y 2 semanas de tapering.",
    taperKmSequence: [15, 10],
    taperMinutesSequence: [75, 50],
  },
  maxLongRunMinutesCap: 120,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 18, maxLongRunMinutes: 100, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 20, maxLongRunMinutes: 110, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 22, maxLongRunMinutes: 120, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 80,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 40,
    notes: "Sustituye un rodaje aeróbico por rodillo Z2 si el peso >80kg para cuidar las articulaciones.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
        RUN_PIRAMIDE_CONTINUA_Z2_Z3,
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        {
          name: "Rodaje Continuo con Progresión a Ritmo Tempo (50m)",
          powerTarget: "72% a 86% CP",
          justification: "Transición de zona aeróbica pura hacia ritmo medio maratón.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n- 25m 74% CP\n- 10m 86% CP\n\nCooldown\n- 5m 60% CP",
        },
      ],
      build: [
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_FARTLEK_MONEGETTI,
        RUN_DISTANCE_BLOQUES_3X_2000M,
        RUN_FARTLEK_POLACO_FLOTACION,
        RUN_DISTANCE_SERIES_5X_1000M,
        RUN_BILLAT_30_30,
        RUN_DISTANCE_MILLA_4X_1600M,
        RUN_TEMPO_BLOQUES_3X_10M,
        RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
        RUN_DISTANCE_SERIES_6X_800M,
      ],
      peak: [
        {
          name: "Simulación de Ritmo 21K (3x 4km @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Ritmo específico de medio maratón con descansos controlados.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n3x\n- 4km 88% CP\n- 3m 65% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Bloques Continuos Canova 21K (2x 6km @ 86% CP)",
          powerTarget: "86% CP",
          justification: "Durabilidad muscular y economía glucogénica a ritmo objetivo.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n2x\n- 6km 86% CP\n- 4m 65% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Series Largas de Umbral (3x 3000mtr @ 94% CP)",
          powerTarget: "94% CP",
          justification: "Sostenimiento metabólico prolongado previo a la competición.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n3x\n- 3000mtr 94% CP\n- 3m 60% CP\n\nCooldown\n- 10m 60% CP",
        },
      ],
      taper: [
        {
          name: "Activación Suave con 4 Strides (30m)",
          powerTarget: "105% CP",
          justification: "Toque neuromuscular sin desgaste a 5 días de la carrera.",
          workoutDoc: "Warmup\n- 12m 68% CP\n\n4x\n- 25s 105% CP\n- 1m 55% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Puesta a Punto a Ritmo 21K (25m con 2x 1500mtr @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Confirmación de cadencia y sensaciones a ritmo objetivo.",
          workoutDoc: "Warmup\n- 10m 68% CP\n\nMain\n2x\n- 1500mtr 88% CP\n- 2m 55% CP\n\nCooldown\n- 5m 60% CP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      BIKE_RONNESTAD_30_15,
      BIKE_SWEETSPOT_EXTENSIVO,
      BIKE_ESCALERA_PIRAMIDAL_VAM,
      BIKE_OVER_UNDERS_SHUTTLING,
      BIKE_TORQUE_BAJA_CADENCIA,
      BIKE_TABATA_40_20,
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Z2 Base + Strides (40m)",
        powerTarget: "74% CP",
        justification: "Consistencia aeróbica y zancada elástica.",
        workoutDoc: "Warmup\n- 10m 68% CP\n\nMain\n- 22m 74% CP\n\n4x\n- 20s 110% CP\n- 40s 60% CP\n\nCooldown\n- 5m 60% CP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua Suave Z2 (40m)",
        powerTarget: "72% CP",
        justification: "Recuperación activa y asimilación biológica.",
        workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 25m 72% CP\n\nCooldown\n- 5m 60% CP",
        durationMin: 40,
      },
      {
        name: "Trote Regenerativo Suave Z1 (30m)",
        powerTarget: "65% CP",
        justification: "Lavado neuromuscular y oxigenación celular sin estrés biológico.",
        workoutDoc: "Warmup\n- 6m 60% CP\n\nMain\n- 20m 65% CP\n\nCooldown\n- 4m 55% CP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Tríada S&C: Cadena Posterior + Remo Dorsal + Core Anti-Extensión",
        focus: "Cadena Posterior, Dorsal y Core",
        justification: "Fuerza propulsiva para medio maratón y estabilidad postural.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 8x Hip Thrust pesado (pausa 2s)\n- 10x Remo dorsal con banda\n- 30s Hollow body hold\n\nCooldown\n- 5m Foam Roller",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.25,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 10,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Sesión de rodillo Z2 para sumar volumen aeróbico con cero impacto articular.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.2,
  },
};
