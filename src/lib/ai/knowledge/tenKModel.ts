import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM, RUN_TEST_20M_TT } from "./testingProtocols";
import {
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_BLOQUES_3X_2000M,
  RUN_DISTANCE_SERIES_5X_1000M,
  RUN_DISTANCE_SERIES_6X_800M,
  RUN_DISTANCE_SERIES_8X_400M,
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
  RUN_TEMPO_CRUISE_4X_2000M,
  RUN_TEMPO_CONTINUO_30M,
  RUN_TEMPO_PROGRESIVO_CANOVA,
  RUN_TEMPO_ALTERNANCIAS_3X_8M,
  RUN_TEMPO_FRACCIONADO_2X_15M,
  RUN_TEMPO_ONDULADO_ESTRUCTURADO,
} from "./workoutPools/runningTempoPool";
import { RUN_DISTANCE_REPETICIONES_12X_200M } from "./workoutPools/runningDistancePool";
import { ALL_RUNNING_AEROBIC_WORKOUTS } from "./workoutPools/runningAerobicPool";
import {
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
} from "./workoutPools/cyclingIntervalPool";

export const TEN_K_ROAD_MODEL: CuratedTrainingModel = {
  modelId: "TEN_K_ROAD",
  sportCategory: "Running",
  displayName: "PULSE 10K — Ritmo y Resistencia",
  scientificAuthors: [
    "Pete Pfitzinger (Faster Road Racing & Lactate Threshold)",
    "Jack Daniels (Intervalos VO2max y Umbral Funcional)",
  ],
  description:
    "Estructurado para aprender a mantener un ritmo fuerte y estable en 10K, combinando velocidad y resistencia.",
  targetDistanceKm: 10.0,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1 con Énfasis en Umbral",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Capilarización",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar una base de carrera sólida, fartleks de crucero y elasticidad.",
      weeklyTssRange: { min: 240, max: 320 },
      longRunGuideline: "Tirada cómoda de 10 a 13 km en ritmo relajado.",
      recommendedIntensityZones: ["Zona 2 Cómoda (68-75% CP)", "Fartlek Suave"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Series Largas",
      percentageDuration: 0.40,
      focusDescription: "Alternancia 50/50 de series de pista en 'mtr' (400m, 800m, 1000m) y fartleks por tiempo.",
      weeklyTssRange: { min: 320, max: 410 },
      longRunGuideline: "Tiradas de 13 a 16 km con tramos a ritmo de medio maratón o 10K.",
      recommendedIntensityZones: ["Series de Umbral (96-100% CP)", "Series de 1.000m (102-105% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico de Forma y Ritmo de Carrera",
      percentageDuration: 0.15,
      focusDescription: "Intervalos específicos a ritmo objetivo de 10K con descansos controlados.",
      weeklyTssRange: { min: 300, max: 380 },
      longRunGuideline: "Tirada controlada de 14 km con los últimos 3 km progresivos.",
      recommendedIntensityZones: ["Ritmo Objetivo 10K (98-102% CP)"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Frescura",
      percentageDuration: 0.10,
      focusDescription: "Reducir la fatiga para llegar con máxima chispa y ligereza al día de la prueba.",
      weeklyTssRange: { min: 160, max: 240 },
      longRunGuideline: "Carrera continua cómoda de 8 a 10 km con toques de ritmo.",
      recommendedIntensityZones: ["Activación Corta", "Trote Suave"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 6 },
  ],
  longRunRules: {
    startKm: 10,
    peakKm: 16,
    startMinutes: 55,
    peakMinutes: 85,
    targetIntensityPercentCpOrFtp: "70-76% CP en base y 90-95% CP en tramos progresivos",
    description: "Progresión escalonada de 10 km a 16 km con descargas intermedias y 1.5 semanas de tapering.",
    taperKmSequence: [10, 6],
    taperMinutesSequence: [55, 35],
  },
  maxLongRunMinutesCap: 90,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 10, maxLongRunMinutes: 60, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 13, maxLongRunMinutes: 75, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 16, maxLongRunMinutes: 90, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 1.5,
    volumeDropSequencePercent: [0.25, 0.45],
    maintainRacePaceIntensity: true,
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
        RUN_PIRAMIDE_CONTINUA_Z2_Z3,
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        RUN_TEMPO_CONTINUO_30M,
        RUN_TEMPO_PROGRESIVO_CANOVA,
        RUN_DISTANCE_REPETICIONES_12X_200M,
        RUN_TEMPO_ONDULADO_ESTRUCTURADO,
        {
          name: "Fartlek Progresivo por Sensaciones (45m)",
          powerTarget: "85% CP en cambios",
          justification: "Despierta el ritmo de piernas de forma progresiva y natural.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\n5x\n- 2m 85% CP\n- 2m 65% CP\n\nCooldown\n- 10m 60% CP",
        },
      ],
      build: [
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_FARTLEK_MONEGETTI,
        RUN_DISTANCE_SERIES_5X_1000M,
        RUN_FARTLEK_POLACO_FLOTACION,
        RUN_DISTANCE_SERIES_6X_800M,
        RUN_BILLAT_30_30,
        RUN_DISTANCE_BLOQUES_3X_2000M,
        RUN_TEMPO_BLOQUES_3X_10M,
        RUN_DISTANCE_SERIES_8X_400M,
        RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
      ],
      peak: [
        {
          name: "Simulación de Ritmo 10K en Pista (3x 2000mtr @ 100% CP)",
          powerTarget: "100% CP",
          justification: "Fijación exacta del ritmo de paso con descansos de 2 minutos.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain (Simulación 10K)\n3x\n- 2000mtr 100% CP\n- 2m 55% CP\n\nCooldown\n- 10m 55% CP",
        },
        {
          name: "Series de Afinamiento 10K (6x 1000mtr @ 102% CP)",
          powerTarget: "102% CP",
          justification: "Velocidad sostenida y tolerancia neuromuscular a ritmo vivo.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n6x\n- 1000mtr 102% CP\n- 1m45s 55% CP\n\nCooldown\n- 10m 55% CP",
        },
        {
          name: "Series de 12x 400mtr a Ritmo VO2max (12x 400mtr @ 106% CP)",
          powerTarget: "106% CP",
          justification: "Capacidad de aceleración y reactividad para el sprint final.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n12x\n- 400mtr 106% CP\n- 1m 55% CP\n\nCooldown\n- 10m 55% CP",
        },
      ],
      taper: [
        {
          name: "Despertar Muscular Rápido (30m con 4 rectas de 100mtr)",
          powerTarget: "105% CP en rectas",
          justification: "Mantiene el tono muscular y la frescura 3 días antes de la prueba.",
          workoutDoc: "Warmup\n- 15m 65% CP\n\nMain\n4x\n- 100mtr 105% CP\n- 1m 50% CP\n\nCooldown\n- 10m 55% CP",
        },
        {
          name: "Puesta a Punto a Ritmo 10K (25m con 3x 500mtr @ 100% CP)",
          powerTarget: "100% CP",
          justification: "Recordatorio de ritmo sin producir fatiga neuromuscular.",
          workoutDoc: "Warmup\n- 12m 65% CP\n\n3x\n- 500mtr 100% CP\n- 1m30s 50% CP\n\nCooldown\n- 8m 55% CP",
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
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
    strengthWorkouts: [
      {
        name: "Tríada S&C: Fuerza Unipodal Búlgara + Hombro Libre + Estabilidad Pélvica",
        focus: "Pierna, Escápula y Core",
        justification: "Estabilidad de zancada en fatiga para evitar la pérdida de técnica en los kilómetros finales del 10K.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 8x Sentadilla búlgara por pierna (pausa 2s)\n- 12x Face-pulls con banda\n- 12x Monster walks laterales con banda\n\nCooldown\n- 5m Stretch",
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
