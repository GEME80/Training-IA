import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_20M_TT } from "./testingProtocols";
import {
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_BLOQUES_3X_2000M,
  RUN_DISTANCE_EXTENSIVO_3X_4KM,
  RUN_DISTANCE_SERIES_5X_1000M,
  RUN_DISTANCE_SERIES_6X_800M,
  RUN_DISTANCE_REPETICIONES_12X_200M,
  RUN_DISTANCE_MILLA_4X_1600M,
} from "./workoutPools/runningDistancePool";
import {
  RUN_TEMPO_CRUISE_4X_2000M,
  RUN_TEMPO_CONTINUO_30M,
  RUN_TEMPO_PROGRESIVO_CANOVA,
  RUN_TEMPO_ALTERNANCIAS_3X_8M,
  RUN_TEMPO_FRACCIONADO_2X_15M,
  RUN_TEMPO_ONDULADO_ESTRUCTURADO,
} from "./workoutPools/runningTempoPool";
import { ALL_RUNNING_AEROBIC_WORKOUTS } from "./workoutPools/runningAerobicPool";
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

export const MARATHON_42K_MODEL: CuratedTrainingModel = {
  modelId: "MARATHON_42K",
  sportCategory: "Running",
  displayName: "PULSE 42K Marathon Mastery (Canova + Pfitzinger + Daniels)",
  scientificAuthors: [
    "Renato Canova (Special Block & Marathon Specific Extension)",
    "Pete Pfitzinger (Advanced Marathoning & Multi-Tier Long Runs)",
    "Jack Daniels & Stryd Team (Critical Power % CP)",
  ],
  description:
    "Modelo científico rector para maratón 42K. Progresión ondulada de tirada larga desde 14 km hasta 34 km y supercompensación en Tapering.",
  targetDistanceKm: 42.2,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1 o 2:1 Preventivo",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Resistencia",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo de resistencia aeróbica, economía de carrera, reactividad del sóleo y acondicionamiento muscular.",
      weeklyTssRange: { min: 280, max: 370 },
      longRunGuideline: "Progresión gradual de 14 km (75m) a 20 km (100m) en Z2 cómoda (68-74% CP).",
      recommendedIntensityZones: ["Z1 Regenerativo (55-65% CP)", "Z2 Base Aeróbica (68-75% CP)", "Fartlek Cuestas (96% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción de Umbral y Potencia Crítica",
      percentageDuration: 0.35,
      focusDescription: "Elevación del umbral anaeróbico, alternancia 50/50 de series de pista en 'mtr' y fartleks por tiempo.",
      weeklyTssRange: { min: 370, max: 480 },
      longRunGuideline: "Fondos progresivos de 22 a 28 km (115 a 145 min) con bloques al 78-83% Stryd CP (Ritmo Maratón).",
      recommendedIntensityZones: ["Series Umbral (98-102% CP)", "Tempo Específico (85-90% CP)", "Ritmo Maratón (78-83% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico Específico & Bloques Canova",
      percentageDuration: 0.18,
      focusDescription: "Simulaciones específicas de maratón, durabilidad muscular y economía glucogénica a ritmo de carrera.",
      weeklyTssRange: { min: 440, max: 540 },
      longRunGuideline: "Tiradas rectoras cumbre de 28 a 34 km (145 a 175 min) con hasta 15-20 km acumulados al 80-83% CP.",
      recommendedIntensityZones: ["Ritmo Maratón Sostenido (80-83% CP)", "Tirada Larga Específica Canova"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto & Tapering",
      percentageDuration: 0.12,
      focusDescription: "Supercompensación, regeneración de glucógeno y elevación de TSB a valores altamente positivos (+10 a +25).",
      weeklyTssRange: { min: 180, max: 280 },
      longRunGuideline: "Reducción escalonada a 22 km (110m) -> 16 km (80m) -> 10 km (50m) previo al maratón.",
      recommendedIntensityZones: ["Activación con Strides Cortos (105% CP)", "Carrera Continua Cómoda Z2 (70% CP)"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 8 },
  ],
  longRunRules: {
    startKm: 16,
    peakKm: 34,
    startMinutes: 85,
    peakMinutes: 165,
    targetIntensityPercentCpOrFtp: "80-84% CP en base y 88-93% CP en bloques específicos",
    description: "Progresión de 16km a 32-34km (máx 165 min / 2h45) con descargas 2:1 o 3:1 y 3 semanas de tapering.",
    taperKmSequence: [24, 18, 10],
    taperMinutesSequence: [115, 85, 45],
  },
  maxLongRunMinutesCap: 165,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 28, maxLongRunMinutes: 145, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 65, maxLongRunKm: 32, maxLongRunMinutes: 155, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 34, maxLongRunMinutes: 165, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 3,
    volumeDropSequencePercent: [0.20, 0.40, 0.65],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 80,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 40,
    notes: "Sustituye una carrera continua aeróbica por rodillo Z2 o aqua-running si el atleta pesa >80kg o su relación es <3.2 W/kg.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural", "water_hydrotherapy_strength"],
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
          name: "Series de Capacidad Aeróbica (4x4m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Estímulo de capilarización y aclaramiento eficiente de lactato.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\n4x\n- 4m 88% CP\n- 2m 65% CP\n\nCooldown\n- 10m 60% CP",
        },
      ],
      build: [
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_FARTLEK_MONEGETTI,
        RUN_DISTANCE_BLOQUES_3X_2000M,
        RUN_FARTLEK_POLACO_FLOTACION,
        RUN_DISTANCE_SERIES_5X_1000M,
        RUN_BILLAT_30_30,
        RUN_DISTANCE_EXTENSIVO_3X_4KM,
        RUN_TEMPO_BLOQUES_3X_10M,
        RUN_DISTANCE_SERIES_6X_800M,
        RUN_TEMPO_CRUISE_4X_2000M,
        RUN_TEMPO_FRACCIONADO_2X_15M,
        RUN_TEMPO_ALTERNANCIAS_3X_8M,
        RUN_DISTANCE_MILLA_4X_1600M,
      ],
      peak: [
        {
          name: "Bloque Específico Canova (2x6km @ 83% CP)",
          powerTarget: "83% CP",
          justification: "Densidad de ritmo maratón con fatiga acumulada.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\n2x\n- 30m 83% CP\n- 7m 68% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Simulación de Ritmo Competitivo (3x5km @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Prueba de ritmo, avituallamiento y control de vatios Stryd.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\n3x\n- 25m 82% CP\n- 5m 68% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Carrera Continua Progresiva con Final Específico (50m Z2 + 20m @ 84% CP)",
          powerTarget: "72% a 84% CP",
          justification: "Simulación de segunda mitad de maratón con depleción glucogénica parcial.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\nMain\n- 35m 72% CP\n- 20m 84% CP\n\nCooldown\n- 5m 60% CP",
        },
        {
          name: "Intervalos Canova Combinados (20m @ 82% + 15m @ 84% + 10m @ 88% CP)",
          powerTarget: "82% a 88% CP",
          justification: "Aceleración final y reclutamiento de fibras rápidas en fatiga.",
          workoutDoc: "Warmup\n- 12m 68% CP\n\nMain\n- 20m 82% CP\n- 5m 65% CP\n- 15m 84% CP\n- 5m 65% CP\n- 10m 88% CP\n\nCooldown\n- 8m 60% CP",
        },
      ],
      taper: [
        {
          name: "Activación Breve con Strides Reactivos (35m)",
          powerTarget: "105% CP",
          justification: "Despertar neuromuscular con mínimo impacto previo a la carrera.",
          workoutDoc: "Warmup\n- 15m 68% CP\n\n4x\n- 30s 105% CP\n- 1m 55% CP\n\nCooldown\n- 10m 60% CP",
        },
        {
          name: "Puesta a Punto a Ritmo de Carrera (30m con 3x4m @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Recordatorio biomecánico de ritmo maratón sin fatiga metabólica.",
          workoutDoc: "Warmup\n- 12m 68% CP\n\n3x\n- 4m 82% CP\n- 2m 55% CP\n\nCooldown\n- 5m 60% CP",
        },
        {
          name: "Rodaje Suave con Toques de Ritmo Maratón (25m con 2x5m @ 80% CP)",
          powerTarget: "80% CP en toques",
          justification: "Afinamiento y confirmación de sensaciones de apoyo y soltura.",
          workoutDoc: "Warmup\n- 10m 68% CP\n\n2x\n- 5m 80% CP\n- 2m 55% CP\n\nCooldown\n- 5m 60% CP",
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
        name: "Tríada S&C: Sóleo Excéntrico + Estabilidad Escapular + Core Anti-Rotación",
        focus: "Sóleo, Escápula y Core",
        justification: "Fortalecimiento tridimensional para absorber el impacto del maratón y mantener la postura.",
        workoutDoc: "Warmup\n- 5m Movilidad Dinámica\n\nMain\n- 12x Sóleo excéntrico en escalón (3s bajada)\n- 12x Face-pulls con banda elástica\n- 12x Press Pallof con banda\n\nCooldown\n- 5m Foam Roller",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Sesión de rodillo Z2 para sumar volumen aeróbico con cero impacto articular.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.0,
  },
};

export { HALF_MARATHON_21K_MODEL } from "./halfMarathonModel";
