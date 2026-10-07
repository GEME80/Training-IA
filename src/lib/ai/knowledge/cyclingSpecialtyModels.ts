import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, BIKE_TEST_RAMP } from "./testingProtocols";
import {
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
} from "./workoutPools/cyclingIntervalPool";

/**
 * Modelo Científico para Ciclismo — Escalada y Puertos (Hunter Allen)
 */
export const CYCLING_CLIMBING_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_CLIMBING",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Escalada y Puertos",
  scientificAuthors: [
    "Hunter Allen (Power Training for Climbing & Over-Unders)",
    "Dr. Andrew Coggan (Watts per Kilogram W/kg Optimization)",
  ],
  description:
    "Especializado en desarrollar fuerza resistente y potencia sostenida en subidas largas, puertos de montaña y desniveles.",
  targetDistanceKm: 90,
  periodizationStyle: "Periodización por Bloques de Resistencia a la Fatiga en Subida (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Fuerza de Pedaleo",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar fondo cardiovascular y eficiencia de pedaleo a cadencia media en terreno ondulado.",
      weeklyTssRange: { min: 320, max: 440 },
      longRunGuideline: "Salida de 2h30m a 3h30m en terreno con repechos suaves en Zona 2.",
      recommendedIntensityZones: ["Zona 2 Cómoda (60-70% FTP)", "Repechos Suaves"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Fuerza en Subida y Umbral en Puerto",
      percentageDuration: 0.40,
      focusDescription: "Subidas de 10 a 20 minutos a ritmo de umbral y series de fuerza a baja cadencia (55-65 rpm).",
      weeklyTssRange: { min: 420, max: 560 },
      longRunGuideline: "Salidas de montaña de 3h30m a 4h30m con varios puertos continuos.",
      recommendedIntensityZones: ["Subidas a Umbral (95-102% FTP)", "Fuerza y Cadencia Baja"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Puertos y Over-Unders",
      percentageDuration: 0.15,
      focusDescription: "Intervalos Over-Under para aprender a cambiar de ritmo en las rampas más empinadas.",
      weeklyTssRange: { min: 450, max: 580 },
      longRunGuideline: "Fondo de montaña de 4h a 5h simulando el desnivel del evento.",
      recommendedIntensityZones: ["Over-Unders (95%/105% FTP)", "Ritmo de Ascensión"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Frescura Muscular",
      percentageDuration: 0.10,
      focusDescription: "Llegar con las piernas ligeras y llenas de energía.",
      weeklyTssRange: { min: 200, max: 300 },
      longRunGuideline: "Salida suave de 1h45m a 2h15m con aceleraciones cortas.",
      recommendedIntensityZones: ["Activación Suave", "Pedaleo Ágil"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 7 },
  ],
  longRunRules: {
    startKm: 50,
    peakKm: 130,
    startMinutes: 120,
    peakMinutes: 270,
    targetIntensityPercentCpOrFtp: "65-75% FTP en llano y 85-95% FTP en ascensiones",
    description: "Progresión de 2h a 4h30m con incremento de puertos y metros de desnivel con 2 semanas de tapering.",
    taperKmSequence: [75, 45],
    taperMinutesSequence: [150, 90],
  },
  maxLongRunMinutesCap: 270,
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 65, maxLongRunMinutes: 150, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 100, maxLongRunMinutes: 210, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 130, maxLongRunMinutes: 270, tssScaleFactor: 1.10 },
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 85,
    triggerMinWKgThreshold: 3.0,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Ajuste de desarrollo y piñonera para mantener cadencia >75 rpm en rampas >8% y evitar sobrecarga patelar.",
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_hydrotherapy_strength"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        BIKE_TORQUE_BAJA_CADENCIA,
        BIKE_SWEETSPOT_EXTENSIVO,
      ],
      build: [
        BIKE_OVER_UNDERS_SHUTTLING,
        BIKE_ESCALERA_PIRAMIDAL_VAM,
        BIKE_TORQUE_BAJA_CADENCIA,
        BIKE_RONNESTAD_30_15,
      ],
      peak: [
        BIKE_OVER_UNDERS_SHUTTLING,
        {
          name: "Over-Unders en Subida para Cambio de Pendiente (4x 9m)",
          powerTarget: "95% / 105% FTP alternado",
          justification: "Aumenta la tolerancia cuando la pendiente se empina bruscamente.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n4x\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 4m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Suave con Toques de Ritmo (40m)",
          powerTarget: "95% FTP en toques",
          justification: "Despertar neuromuscular sin acumular fatiga residual.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n3x\n- 1m30s 95% FTP\n- 2m 50% FTP\n\nCooldown\n- 10m 45% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      BIKE_TORQUE_BAJA_CADENCIA,
      BIKE_ESCALERA_PIRAMIDAL_VAM,
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Pedaleo Suave de Recuperación (35m)",
        powerTarget: "52% FTP",
        justification: "Mueve las piernas con mínimo estrés.",
        workoutDoc: "Main\n- 35m 52% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Tríada S&C Ciclismo: Torque Cuádriceps + Estabilidad Aero Escapular + Core Lumbar",
        focus: "Pierna, Escápula y Core",
        justification: "Mantiene la posición firme en el sillín y evita sobrecargas lumbares.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 8x Sentadilla pesada controlada\n- 12x Face-pulls escapulares\n- 35s Plancha prona en acoples aero\n\nCooldown\n- 5m Descompresión",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.35,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 15,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 2,
    notes: "Fuerza específica para escalada (cuádriceps, glúteos y lumbares).",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 2.0,
    maxCtlPerWeek: 4.5,
  },
};

/**
 * Modelo Científico para Ciclismo — Criterium y Explosividad (Hunter Allen)
 */
export const CYCLING_CRITERIUM_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_CRITERIUM",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Criterium y Circuitos Cortos",
  scientificAuthors: [
    "Hunter Allen (Training and Racing with a Power Meter)",
    "Dr. Andrew Coggan (Anaerobic Capacity and Neuromuscular Power)",
  ],
  description:
    "Especializado en carreras en circuito cerrado, cambios bruscos de ritmo, curvas técnicas y sprints.",
  targetDistanceKm: 60,
  periodizationStyle: "Periodización Ondulada con Énfasis Anaeróbico (2:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Fuerza Rápida",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar fondo aeróbico, cadencia ágil y tolerancia a cambios de velocidad.",
      weeklyTssRange: { min: 280, max: 380 },
      longRunGuideline: "Salida de 2h a 2h45m con aceleraciones cortas cada 20 minutos.",
      recommendedIntensityZones: ["Zona 2 Cómoda (60-70% FTP)", "Aceleraciones Ágiles"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Capacidad Anaeróbica y Arrancadas",
      percentageDuration: 0.40,
      focusDescription: "Micro-intervalos Tabata y Rønnestad para tolerar ataques y frenadas repetidas.",
      weeklyTssRange: { min: 380, max: 480 },
      longRunGuideline: "Fondo de 2h30m a 3h15m en circuito con cambios constantes.",
      recommendedIntensityZones: ["Capacidad Anaeróbica (115-130% FTP)", "VO2max Rønnestad"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico de Forma y Simulación de Carrera",
      percentageDuration: 0.15,
      focusDescription: "Simulaciones de criterium a ritmo de competición y sprints máximos.",
      weeklyTssRange: { min: 360, max: 460 },
      longRunGuideline: "Salida de 2h con arrancadas a salida de curva.",
      recommendedIntensityZones: ["Potencia Neuromuscular", "Ritmo de Criterium"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Máxima Chispa",
      percentageDuration: 0.10,
      focusDescription: "Llegar con las piernas frescas, reactivas y explosivas.",
      weeklyTssRange: { min: 160, max: 240 },
      longRunGuideline: "Salida muy suave de 1h15m a 1h45m con 3 sprints de 15 segundos.",
      recommendedIntensityZones: ["Activación Explosiva", "Descarga Suave"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
  ],
  longRunRules: {
    startKm: 40,
    peakKm: 95,
    startMinutes: 90,
    peakMinutes: 195,
    targetIntensityPercentCpOrFtp: "68-75% FTP en rodaje y 110-130% FTP en arrancadas",
    description: "Progresión de 1h30m a 3h15m con arrancadas de curva y 1 semana de tapering.",
    taperKmSequence: [45],
    taperMinutesSequence: [90],
  },
  maxLongRunMinutesCap: 210,
  taperingRules: {
    taperingWeeks: 1,
    volumeDropSequencePercent: [0.35],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 50, maxLongRunMinutes: 120, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 75, maxLongRunMinutes: 165, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 95, maxLongRunMinutes: 210, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        BIKE_TABATA_40_20,
        BIKE_SWEETSPOT_EXTENSIVO,
      ],
      build: [
        BIKE_RONNESTAD_30_15,
        BIKE_TABATA_40_20,
        BIKE_ESCALERA_PIRAMIDAL_VAM,
      ],
      peak: [
        BIKE_RONNESTAD_30_15,
        {
          name: "Simulación de Cambios de Ritmo Repetidos (1h00m)",
          powerTarget: "120% FTP en arrancadas",
          justification: "Ajusta la respuesta rápida y la confianza para acelerar.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n5x\n- 2m 115% FTP\n- 2m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Rápida con 3 Sprints Cortos (35m)",
          powerTarget: "130% FTP en sprints",
          justification: "Prepara la respuesta neuromuscular para el evento.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n3x\n- 15s 130% FTP\n- 2m 45% FTP\n\nCooldown\n- 10m 45% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      BIKE_TABATA_40_20,
      BIKE_RONNESTAD_30_15,
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Recuperación Activa en Bicicleta (35m)",
        powerTarget: "50% FTP",
        justification: "Favorece el descanso muscular.",
        workoutDoc: "Main\n- 35m 50% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Explosiva y Potencia de Piernas",
        focus: "Cuádriceps, Isquiotibiales y Core",
        justification: "Aporta chispa y fuerza en cada arrancada.",
        workoutDoc: "Warmup\n- 5m Articular\n\nMain\n- 15m Sentadillas con salto controlado, zancadas dinámicas y planchas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 2,
    notes: "Fuerza explosiva y estabilizadores para soportar arrancadas fuertes.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.8,
  },
};
