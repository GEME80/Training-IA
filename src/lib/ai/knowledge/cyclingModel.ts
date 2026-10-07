import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, BIKE_TEST_RAMP } from "./testingProtocols";
import {
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
  BIKE_VO2MAX_COGGAN_5X3,
} from "./workoutPools/cyclingIntervalPool";
import {
  BIKE_OUTDOOR_REPECHOS_LIBRES,
  BIKE_OUTDOOR_CADENCIA_FLUIDEZ,
  BIKE_OUTDOOR_FAST_FINISH,
  BIKE_OUTDOOR_ASIMILACION_SOCIAL,
  BIKE_OUTDOOR_GRAN_FONDO_MONTAÑA,
} from "./workoutPools/cyclingOutdoorPool";

export const CYCLING_GRAN_FONDO_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_GRAN_FONDO",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Gran Fondo y Resistencia",
  scientificAuthors: [
    "Dr. Andrew Coggan (Power Training & W/kg)",
    "Hunter Allen (Sweetspot & Fatigue Resistance)",
    "Dr. Bent Rønnestad (Micro-Intervalos VO2max)",
  ],
  description:
    "Estructurado para pruebas de fondo, marchas cicloturistas y rutas largas, combinando resistencia aeróbica, torque y potencia en subida.",
  targetDistanceKm: 120,
  periodizationStyle: "Periodización por Bloques de Densidad Mitocondrial (3:1 o 2:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Capacidad Mitocondrial",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo de fondo cardiovascular, cadencia fluida y fuerza de pedaleo sin fatiga excesiva.",
      weeklyTssRange: { min: 300, max: 420 },
      longRunGuideline: "Salida de 2h30m a 3h30m en Zona 2 continua con repechos suaves.",
      recommendedIntensityZones: ["Zona 2 Cómoda (60-70% FTP)", "Fondo Libre de Cadencia"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Sweetspot Extensivo",
      percentageDuration: 0.40,
      focusDescription: "Alternancia de micro-intervalos Rønnestad, escaleras piramidales de vatios y sweetspot extensivo.",
      weeklyTssRange: { min: 400, max: 550 },
      longRunGuideline: "Fondos de 3h30m a 4h30m libres con repechos y final vivo progresivo.",
      recommendedIntensityZones: ["Sweetspot (88-92% FTP)", "Umbral Funcional (95-102% FTP)", "VO2max Rønnestad (120% FTP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico de Forma y Resistencia Específica",
      percentageDuration: 0.15,
      focusDescription: "Over-unders de aclaramiento de lactato, ritmo de ascensión y simulaciones de gran fondo.",
      weeklyTssRange: { min: 420, max: 560 },
      longRunGuideline: "Simulación de marcha de 4h a 5h con desnivel acumulado y nutrición en ruta.",
      recommendedIntensityZones: ["Ritmo de Prueba (75-85% FTP)", "Over-Unders Dinámicos"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Frescura de Piernas",
      percentageDuration: 0.10,
      focusDescription: "Llegar a la prueba con las piernas sueltas, energía al máximo y frescura cardiovascular.",
      weeklyTssRange: { min: 180, max: 280 },
      longRunGuideline: "Salida suave de 1h45m a 2h15m en Zona 1-2 con 3 aceleraciones de soltura.",
      recommendedIntensityZones: ["Activación Suave", "Pedaleo Regenerativo"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 7 },
  ],
  longRunRules: {
    startKm: 60,
    peakKm: 140,
    startMinutes: 135,
    peakMinutes: 270,
    targetIntensityPercentCpOrFtp: "65-72% FTP en llano y 82-90% FTP en subidas libres",
    description: "Progresión de 2h15m a 4h30m con fondos libres outdoor y 2 semanas de tapering.",
    taperKmSequence: [80, 50],
    taperMinutesSequence: [160, 105],
  },
  maxLongRunMinutesCap: 270,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 70, maxLongRunMinutes: 160, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 110, maxLongRunMinutes: 220, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 140, maxLongRunMinutes: 270, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 85,
    triggerMinWKgThreshold: 3.0,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Optimiza la cadencia de pedaleo (90-100 rpm) para reducir tensión en rótula y ligamentos lumbares.",
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run", "cross_bike_hiit_vo2"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        BIKE_SWEETSPOT_EXTENSIVO,
        BIKE_TORQUE_BAJA_CADENCIA,
        {
          name: "Ciclismo Tempo Aeróbico Z3 (2x15m @ 80% FTP)",
          powerTarget: "80% FTP",
          justification: "Eficiencia glucolítica moderada a ritmo submáximo.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n2x\n- 15m 80% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Ciclismo Pirámide Aeróbica Z2-Z3 (50m progresivo)",
          powerTarget: "65-85% FTP",
          justification: "Transición progresiva de fibras lentas a mixtas.",
          workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain\n- 15m 70% FTP\n- 15m 80% FTP\n- 5m 85% FTP\n\nCooldown\n- 5m 50% FTP",
        },
      ],
      build: [
        BIKE_RONNESTAD_30_15,
        BIKE_ESCALERA_PIRAMIDAL_VAM,
        BIKE_OVER_UNDERS_SHUTTLING,
        BIKE_VO2MAX_COGGAN_5X3,
        BIKE_TABATA_40_20,
        BIKE_SWEETSPOT_EXTENSIVO,
        BIKE_TORQUE_BAJA_CADENCIA,
      ],
      peak: [
        BIKE_OVER_UNDERS_SHUTTLING,
        BIKE_VO2MAX_COGGAN_5X3,
        {
          name: "Simulación de Marcha Gran Fondo (3x 20m @ 88% FTP con descansos cortos)",
          powerTarget: "88% FTP",
          justification: "Potencia sostenible en terreno ondulado simulando la exigencia competitiva.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 20m 88% FTP\n- 4m 50% FTP\n\nCooldown\n- 15m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Suave de Piernas (35m con 3 aceleraciones)",
          powerTarget: "95% FTP en aceleraciones",
          justification: "Soltura de piernas y activación neuromuscular sin fatiga residual.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n3x\n- 45s 95% FTP\n- 1m15s 50% FTP\n\nCooldown\n- 8m 45% FTP",
        },
        {
          name: "Descarga Suave Regenerativa Z1 (25m)",
          powerTarget: "50% FTP",
          justification: "Recuperación biológica activa con cero costo energético.",
          workoutDoc: "Main\n- 25m 50% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      BIKE_RONNESTAD_30_15,
      BIKE_ESCALERA_PIRAMIDAL_VAM,
      BIKE_OVER_UNDERS_SHUTTLING,
      BIKE_TORQUE_BAJA_CADENCIA,
      BIKE_SWEETSPOT_EXTENSIVO,
      BIKE_TABATA_40_20,
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Ciclismo Suave Z1 de Recuperación (35m)",
        powerTarget: "52% FTP",
        justification: "Recuperación pasiva activa.",
        workoutDoc: "Warmup\n- 5m 45% FTP\n\nMain\n- 25m 52% FTP\n\nCooldown\n- 5m 40% FTP",
        durationMin: 35,
      },
      {
        name: "Pedaleo Suave de Soltura Articular (40m Z1)",
        powerTarget: "50% FTP",
        justification: "Lavado muscular y retorno venoso sin elevación del pulso.",
        workoutDoc: "Main\n- 40m 50% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Tríada S&C Ciclismo: Torque Cuádriceps + Estabilidad Aero Escapular + Core Lumbar",
        focus: "Pierna, Escápula y Core",
        justification: "Fuerza propulsiva para pedaleo y postura aerodinámica sin dolor lumbar.",
        workoutDoc: "Warmup\n- 5m Movilidad\n\nMain\n- 8x Sentadilla pesada controlada\n- 12x Face-pulls para trapecio y romboides\n- 35s Plancha prona en acoples aero\n\nCooldown\n- 5m Descompresión Espinal",
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
    notes: "Fuerza de core, glúteos y cadena posterior para estabilidad en la posición de pedaleo.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 2.0,
    maxCtlPerWeek: 4.5,
  },
};
