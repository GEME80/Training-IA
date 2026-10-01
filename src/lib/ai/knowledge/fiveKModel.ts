import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM } from "./testingProtocols";
import {
  RUN_DISTANCE_SERIES_8X_400M,
  RUN_DISTANCE_REPETICIONES_12X_200M,
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
  RUN_DISTANCE_SERIES_6X_800M,
} from "./workoutPools/runningDistancePool";
import {
  RUN_BILLAT_30_30,
  RUN_FARTLEK_MONEGETTI,
  RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
  RUN_FARTLEK_SUECO_PIRAMIDAL,
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

export const FIVE_K_SPEED_MODEL: CuratedTrainingModel = {
  modelId: "FIVE_K_SPEED",
  sportCategory: "Running",
  displayName: "PULSE 5K — Velocidad y Agilidad",
  scientificAuthors: [
    "Dr. Véronique Billat (Micro-intervalos 30-30 y VAM)",
    "Jack Daniels (Intervalos VO2max y Potencia Neuromuscular)",
  ],
  description:
    "Diseñado para ganar velocidad, mejorar la potencia aeróbica y correr con soltura y zancada eficiente.",
  targetDistanceKm: 5.0,
  periodizationStyle: "Periodización Ondulada con Énfasis en Potencia Aeróbica y Velocidad (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Técnica de Carrera",
      percentageDuration: 0.30,
      focusDescription: "Construir resistencia cómoda, zancada ligera y fuerza reactiva en tobillos y gemelos.",
      weeklyTssRange: { min: 200, max: 280 },
      longRunGuideline: "Tirada suave de 8 a 10 km en ritmo cómodo y conversacional.",
      recommendedIntensityZones: ["Zona 2 Cómoda (68-75% CP)", "Rectas Rápidas de Activación (105% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción de Velocidad y Potencia",
      percentageDuration: 0.45,
      focusDescription: "Alternancia de series de velocidad en pista en 'mtr' (200m, 400m) y micro-intervalos Billat.",
      weeklyTssRange: { min: 260, max: 340 },
      longRunGuideline: "Tirada continua de 10 a 12 km con cambios de ritmo en la segunda mitad.",
      recommendedIntensityZones: ["Series de Velocidad (105-110% CP)", "Ritmo Rápido Sostenido (98-102% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Puesta a Punto y Ritmo de Carrera",
      percentageDuration: 0.15,
      focusDescription: "Simulaciones de ritmo objetivo de 5K para afinar la zancada y ganar chispa.",
      weeklyTssRange: { min: 240, max: 300 },
      longRunGuideline: "Tirada ágil de 10 km con tramos a ritmo de competición.",
      recommendedIntensityZones: ["Ritmo de Carrera 5K (100-105% CP)", "Aceleraciones Cortas"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Afinamiento y Descarga",
      percentageDuration: 0.10,
      focusDescription: "Llegar a la prueba con las piernas descansadas, frescas y con máxima reactividad.",
      weeklyTssRange: { min: 140, max: 200 },
      longRunGuideline: "Carrera continua muy suave de 6 a 8 km con 3 rectas progresivas.",
      recommendedIntensityZones: ["Activación Suave", "Trote Regenerativo"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 2 },
  ],
  longRunRules: {
    startKm: 8,
    peakKm: 12,
    startMinutes: 45,
    peakMinutes: 65,
    targetIntensityPercentCpOrFtp: "70-76% CP en base y 95-102% CP en bloques de ritmo",
    description: "Progresión suave de 8 km a 12 km con rectas dinámicas y 1 semana de tapering.",
    taperKmSequence: [6],
    taperMinutesSequence: [35],
  },
  maxLongRunMinutesCap: 75,
  taperingRules: {
    taperingWeeks: 1,
    volumeDropSequencePercent: [0.35],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 8, maxLongRunMinutes: 50, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 10, maxLongRunMinutes: 60, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 12, maxLongRunMinutes: 75, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
        RUN_PIRAMIDE_CONTINUA_Z2_Z3,
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        {
          name: "Carrera Continua Suave + Rectas Progresivas de Zancada (45m)",
          powerTarget: "72% CP + Rectas @ 105% CP",
          justification: "Mejora la elasticidad del pie y la cadencia sin fatiga acumulada.",
          workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 25m 72% CP\n\nRectas de Activación\n5x\n- 100mtr 105% CP\n- 45s 55% CP\n\nCooldown\n- 5m 60% CP",
        },
      ],
      build: [
        RUN_BILLAT_30_30,
        RUN_DISTANCE_SERIES_8X_400M,
        RUN_FARTLEK_MONEGETTI,
        RUN_DISTANCE_REPETICIONES_12X_200M,
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
        RUN_DISTANCE_SERIES_6X_800M,
      ],
      peak: [
        {
          name: "Simulación de Ritmo 5K (3x 1200mtr @ 102% CP)",
          powerTarget: "102% CP",
          justification: "Ajusta la sensación de paso y la confianza de cara a la competición.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n3x\n- 1200mtr 102% CP\n- 2m 55% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Micro-Series de Afinamiento 5K (8x 300mtr @ 108% CP)",
          powerTarget: "108% CP",
          justification: "Velocidad limpia y zancada suelta sin impacto estructural.",
          workoutDoc: "Warmup\n- 15m 65% CP\n\nMain\n8x\n- 300mtr 108% CP\n- 1m15s 50% CP\n\nCooldown\n- 10m 55% CP",
        },
        {
          name: "Series de 6x 600mtr a Ritmo VO2max (6x 600mtr @ 104% CP)",
          powerTarget: "104% CP",
          justification: "Potencia aeróbica máxima con descansos de 1m30s.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n6x\n- 600mtr 104% CP\n- 1m30s 55% CP\n\nCooldown\n- 10m 55% CP",
        },
      ],
      taper: [
        {
          name: "Despertar Muscular Rápido (30m con 4 rectas de 80mtr)",
          powerTarget: "105% CP en rectas",
          justification: "Mantiene el tono muscular y la frescura 2 días antes de la carrera.",
          workoutDoc: "Warmup\n- 15m 65% CP\n\nMain\n4x\n- 80mtr 105% CP\n- 1m 50% CP\n\nCooldown\n- 10m 55% CP",
        },
        {
          name: "Activación Suave Pre-Competición (20m con 3 rectas @ 95% CP)",
          powerTarget: "95% CP en cambios",
          justification: "Eliminación de la pesadez muscular previa a la prueba.",
          workoutDoc: "Warmup\n- 12m 65% CP\n\n3x\n- 100mtr 95% CP\n- 1m 50% CP\n\nCooldown\n- 5m 55% CP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      BIKE_RONNESTAD_30_15,
      BIKE_TABATA_40_20,
      BIKE_ESCALERA_PIRAMIDAL_VAM,
      BIKE_OVER_UNDERS_SHUTTLING,
      BIKE_TORQUE_BAJA_CADENCIA,
      BIKE_SWEETSPOT_EXTENSIVO,
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Z2 Suave (30m)",
        powerTarget: "70% CP",
        justification: "Oxigenación y soltura con impacto mínimo.",
        workoutDoc: "Warmup\n- 5m 60% CP\n\nMain\n- 20m 70% CP\n\nCooldown\n- 5m 55% CP",
        durationMin: 30,
      },
      {
        name: "Trote Regenerativo Suave Z1 (25m)",
        powerTarget: "65% CP",
        justification: "Lavado neuromuscular y relajación.",
        workoutDoc: "Main\n- 25m 65% CP",
        durationMin: 25,
      },
    ],
    strengthWorkouts: [
      {
        name: "Tríada S&C: Sóleo Reactivo + Manguito Rotador + Core Anti-Rotación",
        focus: "Sóleo, Hombro y Core",
        justification: "Desarrollo de reactividad rápida y rigidez de tobillo para sostener cadencia >185 spm.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 12x Pogo hops elásticos\n- 10x Face-pulls con banda\n- 12x Press Pallof\n\nCooldown\n- 5m Stretch",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.25,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 8,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 50,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Sesión de rodillo Z2 para sumar volumen aeróbico con cero impacto articular.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.2,
  },
};
