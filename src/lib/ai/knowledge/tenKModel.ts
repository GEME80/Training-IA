import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM, RUN_TEST_20M_TT } from "./testingProtocols";

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
        {
          name: "Carrera Continua Progresiva en Zona 2-3 (45m)",
          powerTarget: "72-84% CP",
          justification: "Construcción de base mitocondrial con acabado ágil.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain\n- 20m 78% FTP\n- 5m 84% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Series de Umbral Aeróbico Fraccionado (4x 4m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Capilarización muscular y aclaramiento de lactato sub-umbral.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 4m 88% FTP\n- 2m 60% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Cuestas de Fuerza-Resistencia (45m con 6x 1m @ 94% CP)",
          powerTarget: "94% CP en cuesta",
          justification: "Fuerza reactiva y estabilidad de zancada en terreno inclinado.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n6x\n- 1m 94% FTP (Subida)\n- 1m30s 50% FTP (Trote suave)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Fartlek Sueco de Ritmo de Crucero (45m con 6x 2m @ 90% CP)",
          powerTarget: "90% CP en cambios",
          justification: "Transición neuromuscular fluida entre ritmo Z2 y Z4.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n6x\n- 2m 90% FTP\n- 1m30s 65% FTP\n\nCooldown\n- 9m 55% FTP",
        },
      ],
      build: [
        {
          name: "Series de Potencia Específica (5x 3m30s @ 102% CP)",
          powerTarget: "102% CP",
          justification: "Mejora la capacidad de sostener un ritmo fuerte sin acumular fatiga excesiva.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Principales\n5x\n- 3m30s 102% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Bloques de Umbral Continuo (3x 7m30s @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Eleva el umbral de crucero y enseña a gestionar la energía en la segunda mitad del 10K.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloques de Umbral\n3x\n- 7m30s 98% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Tempo Run de Resistencia a Ritmo de Medio Maratón (25m @ 92% CP)",
          powerTarget: "92% CP",
          justification: "Eficiencia glucolítica moderada a ritmo submáximo continuo.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain (Tempo Sostenido)\n- 25m 92% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Series Escalonadas de Umbral y VO2max (3x 5m @ 97% + 3x 1m30s @ 105% CP)",
          powerTarget: "97-105% CP",
          justification: "Tolerancia neuromuscular ante incrementos bruscos de ritmo.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n3x\n- 5m 97% FTP\n- 2m 55% FTP\n\n3x\n- 1m30s 105% FTP\n- 1m30s 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Series de 4x 6m en Umbral de Lactato (4x 6m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Sostenimiento de potencia en el umbral anaeróbico funcional.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 6m 98% FTP\n- 2m 55% FTP\n\nCooldown\n- 8m 55% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 10K (3x 12m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Consolida la confianza y la regularidad de paso de cara a la carrera.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Largas\n3x\n- 12m 98% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Bloques Rotos de Ritmo de Competición (4x 5m @ 100% CP con recup corta)",
          powerTarget: "100% CP",
          justification: "Automatización biomecánica a ritmo exacto de carrera 10K.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 5m 100% FTP\n- 1m30s 55% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Tempo Progresivo con Final Específico (20m @ 92% + 10m @ 99% CP)",
          powerTarget: "92-99% CP",
          justification: "Simula la fatiga de los últimos 3 km de la prueba.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 20m 92% FTP\n- 10m 99% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Series de Afinamiento de Zancada (5x 2m @ 102% CP con recup completa)",
          powerTarget: "102% CP",
          justification: "Afinamiento de la cadencia y chispa muscular previa al tapering.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n5x\n- 2m 102% FTP\n- 2m 50% FTP\n\nCooldown\n- 10m 55% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Suave con Cambios de Ritmo Cortos (35m)",
          powerTarget: "100% CP en cambios",
          justification: "Mantener el tono neuromuscular sin gastar reservas de glucógeno.",
          workoutDoc: "Calentamiento\n- 15m 65% FTP\n\nCambios Cortos\n3x\n- 1m 100% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 55% FTP",
        },
        {
          name: "Puesta a Punto de Cadena Posterior (30m con 4 rectas ágiles)",
          powerTarget: "102% CP en rectas",
          justification: "Reactividad muscular sin fatiga cardiovascular.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 25s 102% FTP\n- 45s 50% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Trote Regenerativo de Soltura (25m en Z1 suave)",
          powerTarget: "66% CP",
          justification: "Lavado muscular y calma parasimpática pre-competición.",
          workoutDoc: "Main\n- 25m 66% FTP",
        },
        {
          name: "Activación del Día Previo (20m con 3 aceleraciones progresivas)",
          powerTarget: "65-95% CP",
          justification: "Ajuste de sensaciones de zancada y zapatillas de carrera.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 20s 95% FTP\n- 40s 50% FTP\n\nCooldown\n- 6m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Descarga de Piernas (50m)",
        powerTarget: "60% FTP",
        justification: "Oxigena la musculatura sin impacto en las articulaciones.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Cómodo\n- 30m 60% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 50,
      },
      {
        name: "Ciclismo Z2 de Cadencia Fluida (45m a 90-100 rpm)",
        powerTarget: "65% FTP",
        justification: "Estimulación neuromuscular y soltura de tobillos y rodillas.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 65% FTP (95 rpm)\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Regenerativo con Progresiones Cortas (45m)",
        powerTarget: "58-75% FTP",
        justification: "Activación metabólica suave sin estrés mecánico.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\n4x\n- 1m 75% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo de Lavado Metabólico (40m Z1)",
        powerTarget: "58% FTP",
        justification: "Favorece la síntesis de colágeno y el descanso osteoarticular.",
        workoutDoc: "Main\n- 40m 58% FTP",
        durationMin: 40,
      },
      {
        name: "Ciclismo Suave con Trabajo de Pedaleo Redondo (45m)",
        powerTarget: "62% FTP",
        justification: "Compensación de cuádriceps y glúteos sin fatiga.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 62% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Suave Regenerativo Z1 (35m)",
        powerTarget: "68% CP",
        justification: "Asimilación biológica activa con mínimo estrés mecánico.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 20m 68% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 35,
      },
      {
        name: "Carrera Aeróbica Ligera de Recuperación (30m)",
        powerTarget: "65% CP",
        justification: "Lavado muscular y retorno venoso activo.",
        workoutDoc: "Main\n- 30m 65% FTP",
        durationMin: 30,
      },
      {
        name: "Trote Regenerativo con Ejercicios de Movilidad de Cadera (35m)",
        powerTarget: "67% CP",
        justification: "Mantenimiento de la elasticidad muscular sin fatiga.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 20m 67% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Carrera Suave en Terreno Blando (35m)",
        powerTarget: "66% CP",
        justification: "Absorción de impacto en césped y relajación miofascial.",
        workoutDoc: "Main\n- 35m 66% FTP",
        durationMin: 35,
      },
      {
        name: "Trote Regenerativo de Descarga Articular (30m)",
        powerTarget: "65% CP",
        justification: "Oxigenación celular sin elevar la temperatura muscular ni el cortisol.",
        workoutDoc: "Main\n- 30m 65% FTP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Estructural & Estabilidad de Cadera para 10K",
        focus: "Glúteo Medio, Isquios y Core",
        justification: "Prevención del colapso medial de rodilla en tramos finales del 10K.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Peso Muerto Rumano, Zancadas y Plancha Lateral",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 10,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Ciclismo suave regenerativo y fuerza funcional de sóleo y glúteo.",
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 82,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Sustituir una sesión aeróbica por ciclismo suave si el atleta presenta sobrecarga tibial.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.0,
    maxCtlPerWeek: 3.0,
  },
};
