import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, BIKE_TEST_20M_FTP } from "./testingProtocols";
import {
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
} from "./workoutPools/cyclingIntervalPool";
import {
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_SERIES_5X_1000M,
  RUN_DISTANCE_SERIES_6X_800M,
} from "./workoutPools/runningDistancePool";
import {
  RUN_FARTLEK_MONEGETTI,
  RUN_FARTLEK_POLACO_FLOTACION,
  RUN_BILLAT_30_30,
} from "./workoutPools/runningFartlekPool";

export const TRIATHLON_70_3_MODEL: CuratedTrainingModel = {
  modelId: "TRIATHLON_70_3",
  sportCategory: "Triathlon",
  displayName: "PULSE 70.3 Triathlon Engine (Joe Friel + Jan Olbrecht)",
  scientificAuthors: [
    "Joe Friel (The Triathlete's Training Bible)",
    "Jan Olbrecht (The Science of Winning - Aerobic Capacity vs Power)",
  ],
  description:
    "Modelo multisport para media y larga distancia de triatlón. Equilibra la carga tricíclica (Natación, Ciclismo, Carrera) e integra transiciones Brick.",
  targetDistanceKm: 113,
  periodizationStyle: "Periodización Polarizada Multideporte 3:1 con Transiciones Brick",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica Multideporte & Capilarización",
      percentageDuration: 0.38,
      focusDescription: "Desarrollo del motor aeróbico mitocondrial, técnica de nado y adaptación postural sobre la bicicleta.",
      weeklyTssRange: { min: 380, max: 480 },
      longRunGuideline: "Ciclismo Z2 de 2h-2h30m el sábado + Carrera Z2 de 75-90m el domingo.",
      recommendedIntensityZones: ["Natación Técnica", "Ciclismo Z2 (65% FTP)", "Carrera Suave Z2 (70% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción Específica & Transiciones Brick",
      percentageDuration: 0.36,
      focusDescription: "Ritmo de competición 70.3 en bici (75-80% FTP) seguido de carrera a pie en transición (Brick 80-84% CP).",
      weeklyTssRange: { min: 460, max: 580 },
      longRunGuideline: "Brick de fin de semana: 2h15m-2h45m Ciclismo @ 76-80% FTP + 25-35m Carrera @ 82% CP.",
      recommendedIntensityZones: ["Brick Race Pace", "Sweetspot Bici", "Tempo Carrera"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera 70.3",
      percentageDuration: 0.16,
      focusDescription: "Simulación de transiciones T1 y T2, estrategia nutricional y puesta a punto de ritmo.",
      weeklyTssRange: { min: 480, max: 600 },
      longRunGuideline: "Simulación cumbre de fin de semana: 85-90 km bici ritmo objetivo + 8-10 km carrera ritmo 70.3.",
      recommendedIntensityZones: ["Simulación 70.3 Race Pace", "Nutrición en Carrera (60-80g CHO/h)"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Supercompensación & Puesta a Punto",
      percentageDuration: 0.10,
      focusDescription: "Vaciado de fatiga acumulada preservando el tono neuromuscular mediante activaciones cortas.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Ciclismo 60-75m Z1-Z2 + Carrera suave 35-45m con 4 rectas de 100mtr.",
      recommendedIntensityZones: ["Activación Suave", "Trote Regenerativo Z1"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 2 },
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 6 },
  ],
  longRunRules: {
    startKm: 14,
    peakKm: 22,
    startMinutes: 75,
    peakMinutes: 115,
    targetIntensityPercentCpOrFtp: "70-75% CP en carrera / 65-72% FTP en ciclismo base",
    description: "Progresión de tirada larga de carrera y fondos de ciclismo de fin de semana con descargas 3:1.",
    taperKmSequence: [15, 10],
    taperMinutesSequence: [80, 50],
  },
  maxLongRunMinutesCap: 125,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 45, maxLongRunKm: 16, maxLongRunMinutes: 90, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 75, maxLongRunKm: 20, maxLongRunMinutes: 110, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 22, maxLongRunMinutes: 125, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 82,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Aprovecha la natación como descarga biomecánica articular.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_swim_shoulder_dorsal", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["water_regenerative_aqua_run", "cross_bike_z2_mito"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_FARTLEK_MONEGETTI,
        RUN_FARTLEK_POLACO_FLOTACION,
        {
          name: "Series de Ritmo Progresivo en Carrera (4x4m @ 88-90% CP)",
          powerTarget: "88-90% CP",
          justification: "Eficiencia de carrera continua a ritmo medio y economía metabólica.",
          workoutDoc: "Warmup\n- 12m 65% CP\n\n4x\n- 4m 88% CP\n- 2m 60% CP\n\nCooldown\n- 8m 60% CP",
        },
      ],
      build: [
        {
          name: "Transición Brick Específica 70.3 (1h30m Bici @ 78% FTP + 25m Run @ 82% CP)",
          powerTarget: "78% FTP Bici + 82% CP Carrera",
          justification: "Transición T2 rápida (< 5m). Adaptación neuromuscular a la carrera con pre-fatiga de pedaleo.",
          workoutDoc: "Bloque 1: Ciclismo 70.3 Pace\n- 1h30m 78% FTP\n\nTransición T2 Exprés (< 5 min)\n\nBloque 2: Carrera de Transición (Primeros 10m @ 180 spm)\n- 25m 82% CP",
        },
        RUN_DISTANCE_SERIES_5X_1000M,
        RUN_BILLAT_30_30,
        RUN_DISTANCE_SERIES_6X_800M,
        {
          name: "Sweetspot Bike (3x12m @ 88% FTP) + Trote Transición (20m)",
          powerTarget: "88% FTP + 78% CP",
          justification: "Construcción de potencia aeróbica sostenible con adaptación biomecánica de carrera.",
          workoutDoc: "Bloque 1: Ciclismo Sweetspot\n- 15m 55% FTP\n3x\n- 12m 88% FTP\n- 3m 55% FTP\n\nTransición T2 (< 5 min)\n\nBloque 2: Carrera Inmediata\n- 20m 78% CP",
        },
      ],
      peak: [
        {
          name: "Simulación Race Pace 70.3 (4x 20m Bici @ 80% FTP + 15m Run @ 84% CP)",
          powerTarget: "80% FTP Bici + 84% CP Carrera",
          justification: "Fijación del ritmo objetivo y prueba real de avituallamiento intra-sesión.",
          workoutDoc: "Bloque 1: Ciclismo\n- 15m 60% FTP\n4x\n- 20m 80% FTP\n- 3m 55% FTP\n\nTransición T2 (< 4 min)\n\nBloque 2: Carrera a Pie\n- 15m 84% CP",
        },
        {
          name: "Brick de Alta Intensidad (45m Bici con 3x2m @ 85% + 15m Run @ 83% CP)",
          powerTarget: "85% FTP + 83% CP",
          justification: "Reactividad a 10 días de la prueba sin agotar reservas de glucógeno.",
          workoutDoc: "Bloque 1: Bici\n- 25m 60% FTP\n3x\n- 2m 85% FTP\n- 2m 50% FTP\n- 8m 60% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera\n- 15m 83% CP",
        },
      ],
      taper: [
        {
          name: "Activación Multideporte Corta (30m Bici + 15m Run)",
          powerTarget: "85% FTP + 85% CP",
          justification: "Frescura y reactividad pre-competición.",
          workoutDoc: "Bloque 1: Bici\n- 20m 60% FTP\n3x\n- 1m 85% FTP\n- 2m 50% FTP\n\nBloque 2: Carrera\n- 10m 68% CP\n3x\n- 30s 85% CP\n- 1m 55% CP",
        },
        {
          name: "Trote de Chispa Pre-Carrera (25m con 4 Strides @ 90% CP)",
          powerTarget: "90% CP",
          justification: "Activación refleja y despertar neuromuscular con cero fatiga.",
          workoutDoc: "Warmup\n- 15m 65% CP\n\n4x\n- 20s 90% CP\n- 40s 50% CP\n\nCooldown\n- 6m 55% CP",
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
        name: "Carrera Continua Z1-Z2 Aeróbica de Soltura (40m)",
        powerTarget: "70% CP",
        justification: "Oxigenación celular y soltura de piernas sin impacto excesivo.",
        workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 25m 70% CP\n\nCooldown\n- 5m 60% CP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua Z2 + 4 Strides Reactivos (45m)",
        powerTarget: "72% CP + Strides @ 105% CP",
        justification: "Reactividad neuromuscular tras el pedaleo sin fatiga metabólica.",
        workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 25m 72% CP\n\n4x\n- 20s 105% CP\n- 40s 55% CP\n\nCooldown\n- 5m 60% CP",
        durationMin: 45,
      },
      {
        name: "Trote Regenerativo Suave (30m Z1)",
        powerTarget: "65% CP",
        justification: "Lavado muscular y recuperación activa entre sesiones clave.",
        workoutDoc: "Warmup\n- 5m 60% CP\n\nMain\n- 20m 65% CP\n\nCooldown\n- 5m 55% CP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Tríada S&C Triatlón: Sóleo Reactivo + Manguito Escapular + Core Anti-Rotación",
        focus: "Hombro, Core y Cadera",
        justification: "Protección articular para natación y posición aerodinámica sin dolor.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 12x Sóleo excéntrico\n- 12x Face-pulls y 'Y-T-W' prono\n- 12x Press Pallof con banda\n\nCooldown\n- 5m Stretch",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.88,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.26,
    weeklyLoadStepTss: 15,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Fuerza funcional de estabilizadores de cadera y movilidad torácica para natación/ciclismo aero.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 2.0,
    maxCtlPerWeek: 5.0,
  },
};
