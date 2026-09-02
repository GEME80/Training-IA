import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM, RUN_TEST_20M_TT } from "./testingProtocols";

/**
 * Modelo Científico para 5K — Velocidad y Agilidad (Billat + Daniels)
 */
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
      focusDescription: "Series cortas y micro-intervalos dinámicos para tolerar ritmos vivos.",
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
      longRunGuideline: "Rodaje muy suave de 6 a 8 km con 3 rectas progresivas.",
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
        {
          name: "Rodaje Suave + Rectas Progresivas de Zancada (45m)",
          powerTarget: "72% CP + Rectas @ 105% CP",
          justification: "Mejora la elasticidad del pie y la cadencia sin fatiga acumulada.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nRodaje Principal\n- 25m 72% FTP\n\nRectas de Activación\n5x\n- 25s 105% FTP\n- 45s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
        },
      ],
      build: [
        {
          name: "Micro-Intervalos Dinámicos de Velocidad (30s rápido / 30s suave)",
          powerTarget: "108% CP en intervalos",
          justification: "Aumenta la potencia aeróbica y la resistencia a ritmos rápidos.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloque 1 (10x 30s/30s)\n10x\n- 30s 108% FTP\n- 30s 55% FTP\n\nRecuperación\n- 3m 55% FTP\n\nBloque 2 (10x 30s/30s)\n10x\n- 30s 108% FTP\n- 30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Series de Potencia (6x 500m con recuperación completa)",
          powerTarget: "105% CP",
          justification: "Desarrolla la capacidad de sostener un ritmo exigente con buena técnica.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Principales\n6x\n- 1m45s 105% FTP\n- 1m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 5K (3x 1.200m a ritmo objetivo)",
          powerTarget: "102% CP",
          justification: "Ajusta la sensación de paso y la confianza de cara a la competición.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Específicas\n3x\n- 4m15s 102% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Despertar Muscular Rápido (30m con 4 rectas)",
          powerTarget: "105% CP en rectas",
          justification: "Mantiene el tono muscular y la frescura 2-3 días antes de la carrera.",
          workoutDoc: "Calentamiento\n- 15m 65% FTP\n\nRectas de Puesta a Punto\n4x\n- 20s 105% FTP\n- 40s 50% FTP\n\nEnfriamiento\n- 10m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Descarga de Piernas (45m)",
        powerTarget: "60% FTP",
        justification: "Oxigena la musculatura sin impacto en las articulaciones.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Ágil\n- 25m 60% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Muy Suave Regenerativo (35m)",
        powerTarget: "65% CP",
        justification: "Favorece la recuperación y asimilación del entrenamiento previo.",
        workoutDoc: "Rodaje Continuo Cómodo\n- 35m 65% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Reactiva de Tobillos, Sóleo y Core",
        focus: "Sóleo, Tobillo y Abdomen",
        justification: "Proporciona estabilidad y empuje elástico en cada zancada.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza y Saltos Suaves\n- 15m Elevaciones en escalón, planchas y puentes de glúteo\n\nEstiramientos\n- 5m Suaves",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.25,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 10,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 45,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Bicicleta suave para sumar fondo aeróbico sin fatiga mecánica.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.0,
    maxCtlPerWeek: 2.5,
  },
};

/**
 * Modelo Científico para 10K — Ritmo y Resistencia (Pfitzinger + Daniels)
 */
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
      focusDescription: "Desarrollar una base de carrera sólida y eficiente.",
      weeklyTssRange: { min: 240, max: 320 },
      longRunGuideline: "Tirada cómoda de 10 a 13 km en ritmo relajado.",
      recommendedIntensityZones: ["Zona 2 Cómoda (68-75% CP)", "Fartlek Suave"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Series Largas",
      percentageDuration: 0.40,
      focusDescription: "Series de 1.000m a 2.000m para aprender a correr rápido con comodidad.",
      weeklyTssRange: { min: 320, max: 410 },
      longRunGuideline: "Tiradas de 13 a 16 km con tramos a ritmo de medio maratón o 10K.",
      recommendedIntensityZones: ["Series de Umbral (96-100% CP)", "Series de 1.000m (102-105% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico de Forma y Ritmo de Carrera",
      percentageDuration: 0.15,
      focusDescription: "Intervalos específicos a ritmo objetivo de 10K con descansos cortos.",
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
      longRunGuideline: "Rodaje cómodo de 8 a 10 km con toques de ritmo.",
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
  taperingRules: {
    taperingWeeks: 1.5,
    volumeDropSequencePercent: [0.25, 0.45],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 10, maxLongRunMinutes: 60, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 13, maxLongRunMinutes: 75, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 16, maxLongRunMinutes: 90, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Fartlek Progresivo por Sensaciones (45m)",
          powerTarget: "85% CP en cambios",
          justification: "Despierta el ritmo de piernas de forma progresiva y natural.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nCambios de Ritmo\n5x\n- 2m 85% FTP\n- 2m 65% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Series de 1.000m para Ritmo y Potencia (5x 1.000m)",
          powerTarget: "102% CP",
          justification: "Mejora la capacidad de sostener un ritmo fuerte sin acumular fatiga excesiva.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries de 1000m\n5x\n- 3m30s 102% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Bloques de Umbral Continuo (3x 2.000m)",
          powerTarget: "98% CP",
          justification: "Eleva el umbral de crucero y enseña a gestionar la energía en la segunda mitad del 10K.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloques de Umbral\n3x\n- 7m30s 98% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 10K (3x 3.000m a ritmo constante)",
          powerTarget: "98% CP",
          justification: "Consolida la confianza y la regularidad de paso de cara a la carrera.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Largas\n3x\n- 12m 98% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Suave con Cambios de Ritmo Cortos (35m)",
          powerTarget: "100% CP en cambios",
          justification: "Mantener el tono neuromuscular sin gastar reservas de glucógeno.",
          workoutDoc: "Calentamiento\n- 15m 65% FTP\n\nCambios Cortos\n3x\n- 1m 100% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Recuperación Activa (50m)",
        powerTarget: "62% FTP",
        justification: "Estimula la circulación y acelera la recuperación de las piernas.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Cómodo\n- 30m 62% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Rodaje Regenerativo Cómodo (40m)",
        powerTarget: "68% CP",
        justification: "Suma minutos de trabajo aeróbico con mínimo impacto.",
        workoutDoc: "Rodaje Suave Continuo\n- 40m 68% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Funcional de Piernas, Cadera y Core",
        focus: "Glúteos, Cadera y Abdomen",
        justification: "Evita la pérdida de postura cuando aparece el cansancio.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 15m Zancadas, sentadillas controladas y planchas\n\nEstiramientos\n- 5m Suaves",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.26,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Bicicleta suave para sumar volumen cardiovascular sin fatiga articular.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.2,
    maxCtlPerWeek: 3.0,
  },
};
