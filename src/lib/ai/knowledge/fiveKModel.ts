import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM } from "./testingProtocols";

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
        {
          name: "Carrera Continua Suave + Rectas Progresivas de Zancada (45m)",
          powerTarget: "72% CP + Rectas @ 105% CP",
          justification: "Mejora la elasticidad del pie y la cadencia sin fatiga acumulada.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nCarrera Continua Principal\n- 25m 72% FTP\n\nRectas de Activación\n5x\n- 25s 105% FTP\n- 45s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
        },
        {
          name: "Fartlek Sueco de Activación Corta (40m con cambios Z3/Z4)",
          powerTarget: "85-92% CP en cambios",
          justification: "Estímulo de cadencia ágil y reclutamiento motor suave.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n6x\n- 1m30s 90% FTP\n- 1m30s 60% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Cuestas Cortas de Potencia Neuromuscular (40m con 6 cuestas)",
          powerTarget: "100% CP en cuesta",
          justification: "Desarrollo de potencia en sóleo y glúteo sin impacto articular prolongado.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n6x\n- 30s 100% FTP (Cuesta)\n- 1m30s 50% FTP (Descenso trote)\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Tempo Fraccionado de Control Aeróbico (40m con 3x5m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Asimilación de ritmo vivo por debajo del umbral anaeróbico.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 5m 88% FTP\n- 2m 60% FTP\n\nCooldown\n- 7m 55% FTP",
        },
        {
          name: "Carrera Continua en Pirámide Aeróbica (42m progresivo Z1-Z3)",
          powerTarget: "70-84% CP",
          justification: "Eficiencia mitocondrial y gestión de energía sin picos lácticos.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 15m 75% FTP\n- 10m 84% FTP\n\nCooldown\n- 7m 55% FTP",
        },
      ],
      build: [
        {
          name: "Micro-Intervalos Dinámicos de Velocidad Billat (30s/30s)",
          powerTarget: "108% CP en intervalos",
          justification: "Aumenta la potencia aeróbica y la resistencia a ritmos rápidos.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloque 1 (10x 30s/30s)\n10x\n- 30s 108% FTP\n- 30s 55% FTP\n\nRecuperación\n- 3m 55% FTP\n\nBloque 2 (10x 30s/30s)\n10x\n- 30s 108% FTP\n- 30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Series de Potencia Fraccionada (6x 1m45s @ 105% CP)",
          powerTarget: "105% CP",
          justification: "Desarrolla la capacidad de sostener un ritmo exigente con buena técnica.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Principales\n6x\n- 1m45s 105% FTP\n- 1m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Series de VO2max Progresivas (5x 2m30s @ 103% CP)",
          powerTarget: "103% CP",
          justification: "Estímulo de consumo máximo de oxígeno y tolerancia láctica.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n5x\n- 2m30s 103% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Intervalos Mixtos de Velocidad y Umbral (4x 3m @ 98% + 4x 45s @ 108% CP)",
          powerTarget: "98-108% CP",
          justification: "Adaptación neuromuscular a cambios de ritmo dentro de competición.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n4x\n- 3m 98% FTP\n- 1m30s 55% FTP\n\nRecuperación\n- 2m 55% FTP\n\n4x\n- 45s 108% FTP\n- 1m 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Series Largas de Capacidad Láctica (4x 3m30s @ 101% CP)",
          powerTarget: "101% CP",
          justification: "Fijación del ritmo específico de 5K en fatiga controlada.",
          workoutDoc: "Warmup\n- 14m 68% FTP\n\n4x\n- 3m30s 101% FTP\n- 2m 55% FTP\n\nCooldown\n- 8m 55% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 5K (3x 4m15s @ 102% CP)",
          powerTarget: "102% CP",
          justification: "Ajusta la sensación de paso y la confianza de cara a la competición.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries Específicas\n3x\n- 4m15s 102% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
        {
          name: "Series de Chispa y Cambio de Marcha (4x 2m @ 103% + 4x 30s @ 110% CP)",
          powerTarget: "103-110% CP",
          justification: "Afinamiento de la reactividad neuromuscular para la recta final.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 2m 103% FTP\n- 1m30s 55% FTP\n\n4x\n- 30s 110% FTP\n- 1m 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Simulación Fraccionada de Competición (2x 5m @ 100% CP)",
          powerTarget: "100% CP",
          justification: "Comprobación del ritmo de crucero con mínima degradación.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n2x\n- 5m 100% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 55% FTP",
        },
        {
          name: "Micro-Series de Afinamiento 5K (6x 1m15s @ 105% CP con recup completa)",
          powerTarget: "105% CP",
          justification: "Velocidad limpia y zancada suelta sin impacto estructural.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n6x\n- 1m15s 105% FTP\n- 1m45s 50% FTP\n\nCooldown\n- 10m 55% FTP",
        },
      ],
      taper: [
        {
          name: "Despertar Muscular Rápido (30m con 4 rectas progresivas)",
          powerTarget: "105% CP en rectas",
          justification: "Mantiene el tono muscular y la frescura 2-3 días antes de la carrera.",
          workoutDoc: "Calentamiento\n- 15m 65% FTP\n\nRectas de Puesta a Punto\n4x\n- 20s 105% FTP\n- 40s 50% FTP\n\nEnfriamiento\n- 10m 55% FTP",
        },
        {
          name: "Activación Suave Pre-Competición (25m con 3 cambios de 30s)",
          powerTarget: "95% CP en cambios",
          justification: "Eliminación de la pesadez muscular previa a la prueba.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 30s 95% FTP\n- 1m 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Trote Muy Ligero Regenerativo (25m en Z1 pura)",
          powerTarget: "65% CP",
          justification: "Descarga de tensión y circulación sanguínea periférica.",
          workoutDoc: "Main\n- 25m 65% FTP",
        },
        {
          name: "Activación del Día Previo (20m suave + 2 rectas de soltura)",
          powerTarget: "65-90% CP",
          justification: "Puesta a punto final y sensación de soltura en boxes.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n2x\n- 20s 90% FTP\n- 40s 50% FTP\n\nCooldown\n- 6m 55% FTP",
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
      {
        name: "Ciclismo Z2 de Cadencia Dinámica (45m a 95 rpm)",
        powerTarget: "65% FTP",
        justification: "Estimulación neuromuscular y soltura de tobillos.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 65% FTP (95 rpm)\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Regenerativo con Progresiones Cortas (40m)",
        powerTarget: "55-75% FTP",
        justification: "Activación cardiovascular suave sin carga mecánica.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\n4x\n- 1m 75% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 40,
      },
      {
        name: "Ciclismo de Lavado Metabólico (40m Z1 constante)",
        powerTarget: "58% FTP",
        justification: "Descarga biológica y limpieza de metabolitos residuales.",
        workoutDoc: "Main\n- 40m 58% FTP",
        durationMin: 40,
      },
      {
        name: "Ciclismo Suave con Técnica de Pedaleo Redondo (45m)",
        powerTarget: "62% FTP",
        justification: "Equilibrio muscular de flexores de cadera y pedaleo fluido.",
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
        name: "Trote Regenerativo con Ejercicios de Movilidad de Tobillo (35m)",
        powerTarget: "68% CP",
        justification: "Mantenimiento de la elasticidad muscular sin fatiga.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 20m 68% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Carrera Suave de Descarga de Cadera (30m)",
        powerTarget: "66% CP",
        justification: "Estimulación de la circulación y eliminación de contracturas leves.",
        workoutDoc: "Main\n- 30m 66% FTP",
        durationMin: 30,
      },
      {
        name: "Trote Regenerativo en Terreno Blando (35m)",
        powerTarget: "67% CP",
        justification: "Amortiguación natural y relajación del sistema musculoesquelético.",
        workoutDoc: "Main\n- 35m 67% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Reactiva de Tobillo & Sóleo para 5K",
        focus: "Tobillo, Sóleo y Reactividad",
        justification: "Mejora el retorno elástico y la cadencia de zancada rápida.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Pliometría Bipodal, Saltos a Cajón y Sóleo Excéntrico",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.25,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 8,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Bicicleta suave para sumar fondo aeróbico sin fatiga mecánica.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.0,
    maxCtlPerWeek: 2.5,
  },
};
