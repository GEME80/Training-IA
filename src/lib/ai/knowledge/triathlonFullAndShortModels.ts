import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, RUN_TEST_5K_VAM, SWIM_TEST_CSS_400_200, RUN_TEST_STRYD_3_9 } from "./testingProtocols";

/**
 * Modelo Científico para Triatlón — Distancia Corta (Sprint y Olímpico)
 */
export const TRIATHLON_SHORT_MODEL: CuratedTrainingModel = {
  modelId: "TRIATHLON_SHORT",
  sportCategory: "Triathlon",
  displayName: "PULSE Triatlón — Distancia Corta (Sprint y Olímpico)",
  scientificAuthors: [
    "Joe Friel (Your Best Triathlon & Short Course Power)",
    "Jan Olbrecht (Aerobic Power & Lactate Dynamics in Triathlon)",
  ],
  description:
    "Estructurado para nadar con ritmo constante, pedalear con potencia a ritmo de umbral y correr rápido en la transición a pie.",
  targetDistanceKm: 51.5,
  periodizationStyle: "Periodización Concurrente Multideporte con Transiciones Rápidas (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica Multideporte y Técnica",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar soltura en el agua, eficiencia de pedaleo y regularidad de zancada.",
      weeklyTssRange: { min: 320, max: 420 },
      longRunGuideline: "Sábado: Bici 2h en Zona 2 + Domingo: Carrera 50-60m suave.",
      recommendedIntensityZones: ["Natación Técnica", "Bici Z2 (65% FTP)", "Carrera Suave (70% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Transiciones Brick",
      percentageDuration: 0.40,
      focusDescription: "Series de nado a ritmo CSS, ciclismo vivo (85-95% FTP) y transiciones de 15 a 20 min corriendo rápido.",
      weeklyTssRange: { min: 420, max: 540 },
      longRunGuideline: "Transición Brick: 1h45m Bici @ 85% FTP + 20m Carrera rápida @ 90% CP.",
      recommendedIntensityZones: ["Brick Dinámico", "Sweetspot Bici", "Series Nado"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera Rápida",
      percentageDuration: 0.15,
      focusDescription: "Ensayos completos de ritmo olímpico, salida del agua y transiciones veloces T1 y T2.",
      weeklyTssRange: { min: 400, max: 510 },
      longRunGuideline: "Simulación: 1h30m Bici @ ritmo de carrera + 25m Carrera @ 92% CP.",
      recommendedIntensityZones: ["Ritmo Olímpico Sostenido"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Soltura",
      percentageDuration: 0.10,
      focusDescription: "Descarga de fatiga manteniendo buenas sensaciones en el agua y chispa en las piernas.",
      weeklyTssRange: { min: 190, max: 270 },
      longRunGuideline: "Entrenamiento combinado muy corto (35m bici suave + 10m carrera ágil).",
      recommendedIntensityZones: ["Activación Ligera", "Soltura en Agua"],
    },
  ],
  mandatoryTests: [
    { ...SWIM_TEST_CSS_400_200, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 2 },
    { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 3 },
  ],
  longRunRules: {
    startKm: 8, peakKm: 14, startMinutes: 45, peakMinutes: 70,
    targetIntensityPercentCpOrFtp: "70-75% Stryd CP",
    description: "Tirada dominical suave progresiva de 8 a 14 km (45-70 min).",
    taperKmSequence: [9, 5], taperMinutesSequence: [45, 25],
  },
  maxLongRunMinutesCap: 75,
  taperingRules: { taperingWeeks: 2, volumeDropSequencePercent: [0.30, 0.55], maintainRacePaceIntensity: true },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 9, maxLongRunMinutes: 50, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 65, maxLongRunKm: 11, maxLongRunMinutes: 60, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 14, maxLongRunMinutes: 70, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Series de Ritmo Progresivo en Carrera (5x3m @ 90% CP)",
          powerTarget: "90% CP",
          justification: "Eficiencia aeróbica y cadencia de carrera a pie controlada.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 3m 90% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Fartlek de Cambios de Ritmo Aeróbico (40m)",
          powerTarget: "72-88% CP",
          justification: "Aceleraciones controladas y soltura neuromuscular en carrera.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\n5x\n- 2m 88% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Transición Rápida Brick Olímpico (1h15m Bici @ 86% FTP + 20m Run @ 90% CP)",
          powerTarget: "86% FTP Bici + 90% CP Carrera",
          justification: "Transición T2 Expres (< 3m). Acostumbra las piernas a correr rápido inmediatamente tras pedalear a ritmo olímpico (86% FTP).",
          workoutDoc: "Bloque 1: Ciclismo a Ritmo Olímpico\n- 15m Calentamiento 55% FTP\n- 45m 86% FTP\n- 15m 60% FTP\n\nTransición T2 Expres (< 3 min)\n\nBloque 2: Carrera Inmediata (Primeros 5m @ 185 spm)\n- 20m 90% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo Olímpico (1h30m Bici @ 88% FTP + 25m Carrera @ 92% CP)",
          powerTarget: "88% FTP Bici + 92% CP Carrera",
          justification: "Transición T2 Expres (< 3m). Ajusta la sensación de esfuerzo y el cambio de marcha neuromuscular en la T2.",
          workoutDoc: "Bloque 1: Ciclismo Específico Olímpico\n- 15m Calentamiento 55% FTP\n- 1h00m 88% FTP\n- 15m 60% FTP\n\nTransición T2 Expres (< 3 min)\n\nBloque 2: Carrera de Transición\n- 25m 92% FTP",
        },
      ],

      taper: [
        {
          name: "Activación Multideporte Ligera (30m Bici + 10m Carrera)",
          powerTarget: "85% FTP en toques",
          justification: "Mantiene la fluidez neuromuscular antes del fin de semana de carrera.",
          workoutDoc: "Bloque 1: Bici Suave\n- 30m con 3x 1m 85% FTP\n\nBloque 2: Carrera Ligera\n- 10m con 3x 30s 90% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Soltura (45m)",
        powerTarget: "60% FTP",
        justification: "Descarga las piernas manteniendo la circulación activa.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Cómodo\n- 25m 60% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Suave Aeróbica Z1-Z2 (35m)",
        powerTarget: "68% CP",
        justification: "Oxigenación muscular sin impacto excesivo tras las sesiones intensas.",
        workoutDoc: "Calentamiento\n- 8m 60% FTP\n\nCarrera Cómoda\n- 22m 68% FTP\n\nEnfriamiento\n- 5m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Carrera Continua Z2 + 4 Strides (40m)",
        powerTarget: "70% CP + Strides @ 100% CP",
        justification: "Reactividad neuromuscular ligera y soltura de piernas.",
        workoutDoc: "Calentamiento\n- 10m 62% FTP\n\nCarrera Principal\n- 22m 70% FTP\n\n4x\n- 20s 100% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 4m 55% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza de Hombros, Cadera y Core para Triatlón",
        focus: "Manguito Rotador, Abdomen y Glúteos",
        justification: "Protege los hombros al nadar y mantiene la postura sobre la bicicleta.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 15m Rotadores con goma, planchas y zancadas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.88,
    peakTssRatio: 1.28,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Fuerza funcional de estabilizadores de hombro y core.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.8,
    maxCtlPerWeek: 4.5,
  },
};

/**
 * Modelo Científico para Triatlón — Larga Distancia (Full IRONMAN 140.6)
 */
export const TRIATHLON_140_6_MODEL: CuratedTrainingModel = {
  modelId: "TRIATHLON_140_6",
  sportCategory: "Triathlon",
  displayName: "PULSE Triatlón — Larga Distancia (Full 140.6)",
  scientificAuthors: [
    "Joe Friel (The Triathlete's Training Bible & Iron Endurance)",
    "Jan Olbrecht (Aerobic Capacity & Fat Oxidation in Full Distance)",
  ],
  description:
    "Diseñado para dominar los 226 km con eficiencia de combustible (oxidación de grasas), ritmo de bicicleta medido y resistencia para el maratón final.",
  targetDistanceKm: 226.0,
  periodizationStyle: "Periodización Extensiva Polarizada por Bloques de Durabilidad (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Ahorro de Energía",
      percentageDuration: 0.40,
      focusDescription: "Desarrollo del motor aeróbico mitocondrial, adaptación a la posición aero y nado continuo.",
      weeklyTssRange: { min: 420, max: 550 },
      longRunGuideline: "Sábado: Bici 3h30m a 4h30m en Zona 2 + Domingo: Carrera 1h45m a 2h00m en Zona 2.",
      recommendedIntensityZones: ["Ciclismo Z2 (65-70% FTP)", "Carrera Cómoda Z2 (68-74% CP)", "Nado Aeróbico"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción Específica y Nutrición en Marcha",
      percentageDuration: 0.35,
      focusDescription: "Fondos largos de bicicleta (4h30m a 5h30m) seguidos de carrera suave y entrenamiento de nutrición (60-80g CHO/h).",
      weeklyTssRange: { min: 520, max: 680 },
      longRunGuideline: "Fondo de Ciclismo: 4h30m a 5h30m @ 68-72% FTP + Transición corta a pie de 20-30 min.",
      recommendedIntensityZones: ["Ritmo Iron Bici (68-73% FTP)", "Ritmo Iron Carrera (72-76% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulaciones Cumbre de Gran Fondo",
      percentageDuration: 0.15,
      focusDescription: "Ensayos completos de ritmo de competición, avituallamiento, postura sobre la bici y concentración mental.",
      weeklyTssRange: { min: 550, max: 700 },
      longRunGuideline: "Salida cumbre de 5h00m a 5h45m en bicicleta + 30 min de carrera continua a ritmo objetivo.",
      recommendedIntensityZones: ["Simulación Full Iron"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Supercompensación y Afinamiento (3 Semanas)",
      percentageDuration: 0.10,
      focusDescription: "Reducción paulatina de horas para restaurar reservas de glucógeno y asegurar la frescura de carrera.",
      weeklyTssRange: { min: 240, max: 360 },
      longRunGuideline: "Descenso gradual: 3h30m bici ➔ 2h15m bici ➔ 1h15m bici en la semana de carrera.",
      recommendedIntensityZones: ["Activaciones Cortas", "Descanso Activo"],
    },
  ],
  mandatoryTests: [
    { ...SWIM_TEST_CSS_400_200, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 3 },
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 4 },
  ],
  longRunRules: {
    startKm: 14, peakKm: 28, startMinutes: 80, peakMinutes: 150,
    targetIntensityPercentCpOrFtp: "68-73% Bike FTP + 72-76% Stryd CP en carrera",
    description: "Progresión de carrera hasta 28 km (máximo 150 min) con gran volumen previo de ciclismo y 3 semanas de tapering.",
    taperKmSequence: [18, 12, 6], taperMinutesSequence: [95, 65, 35],
  },
  maxLongRunMinutesCap: 150,
  taperingRules: { taperingWeeks: 3, volumeDropSequencePercent: [0.20, 0.40, 0.65], maintainRacePaceIntensity: true },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 18, maxLongRunMinutes: 120, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 75, maxLongRunKm: 24, maxLongRunMinutes: 135, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 28, maxLongRunMinutes: 150, tssScaleFactor: 1.10 },
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 85,
    triggerMinWKgThreshold: 3.0,
    substituteBikeZ2WeeklyMin: 90,
    waterSessionWeeklyMin: 60,
    notes: "Aumenta la proporción de volumen aeróbico en bicicleta Z2 y aqua-running para reducir impacto articular previo al maratón final.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_pelvic_core_prehab", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Series de Ritmo Maratón en Carrera (4x2.000m @ 82-84% CP)",
          powerTarget: "82-84% CP",
          justification: "Economía de carrera continua y eficiencia mecánica en ritmo objetivo.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 10m 83% FTP\n- 3m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Carrera Progresiva Controlada en Zona 2 (50m)",
          powerTarget: "70-78% CP",
          justification: "Construcción de fondo aeróbico sin fatiga neuromuscular excesiva.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\nMain\n- 30m 75% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      build: [
        {
          name: "Fondo Específico Iron con Nutrición Programada (4h30m Bici @ 70% FTP + 20m Run)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Dosificación de bici controlada (70% FTP max, jamás >75% FTP). Entrena el estómago a procesar 60-80g CHO/h en posición aero. Transición T2 Expres (< 5m).",
          workoutDoc: "Bloque 1: Ciclismo Iron Pace (Nutrición de 60-80g CHO/hora)\n- 30m 58% FTP\n- 3h30m 70% FTP\n- 30m 55% FTP\n\nTransición T2 Expres (< 5 min)\n\nBloque 2: Carrera de Transición Suave (Cadencia 180 spm)\n- 20m 74% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación Cumbre de Ritmo Full Iron (5h00m Bici @ 70% FTP + 30m Run @ 74% CP)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Ensayo general de estrategia de carrera, ritmo medido (70% FTP), hidratación y transición T2.",
          workoutDoc: "Bloque 1: Ciclismo Largo con Avituallamiento Oficial de Carrera\n- 5h00m @ 70% FTP\n\nTransición T2 Expres (< 5 min)\n\nBloque 2: Carrera a Pie de Transición\n- 30m @ 74% FTP",
        },
      ],

      taper: [
        {
          name: "Pedaleo Ágil de Afinamiento con Toques de Ritmo (1h15m)",
          powerTarget: "70% FTP con toques",
          justification: "Mantiene la sensación de pedaleo sin gastar energía.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nPedaleo Cómodo con 3x 3m @ 72% FTP\n- 50m 65% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Regeneración (1h00m)",
        powerTarget: "60% FTP",
        justification: "Volumen no impactante para favorecer la recuperación activa.",
        workoutDoc: "Pedaleo Suave Continuo\n- 1h00m 60% FTP",
        durationMin: 60,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Aeróbica de Soltura (45m)",
        powerTarget: "68% CP",
        justification: "Oxigenación celular y soltura muscular suave.",
        workoutDoc: "Calentamiento\n- 10m 60% FTP\n\nCarrera Continua\n- 30m 68% FTP\n\nEnfriamiento\n- 5m 55% FTP",
        durationMin: 45,
      },
      {
        name: "Carrera Continua Z2 + 4 Strides Ligeros (50m)",
        powerTarget: "70% CP + Strides @ 100% CP",
        justification: "Mantiene la elasticidad del tendón de Aquiles sin generar fatiga glucogénica.",
        workoutDoc: "Calentamiento\n- 12m 60% FTP\n\nCarrera Cómoda\n- 30m 70% FTP\n\n4x\n- 20s 100% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 4m 55% FTP",
        durationMin: 50,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Estructural y Estabilidad de Core para Larga Distancia",
        focus: "Cadena Posterior, Core y Estabilizadores",
        justification: "Mantiene el torso firme tras muchas horas sobre la bicicleta y corriendo.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 20m Puentes de glúteo, planchas laterales y sentadillas controladas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.88,
    peakTssRatio: 1.35,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 18,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Fuerza postural para soportar la posición aerodinámica durante horas.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 2.0,
    maxCtlPerWeek: 5.0,
  },
};
