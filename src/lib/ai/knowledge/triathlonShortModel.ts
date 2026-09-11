import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, RUN_TEST_5K_VAM, SWIM_TEST_CSS_400_200 } from "./testingProtocols";

/**
 * Modelo Científico para Triatlón — Distancia Corta (Sprint y Olímpico)
 * Joe Friel (Your Best Triathlon) + Jan Olbrecht (Aerobic Power in Triathlon)
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
      longRunGuideline: "Sábado: Bici 1h30m a 2h en Zona 2 + Domingo: Carrera 50-60m suave.",
      recommendedIntensityZones: ["Natación Técnica", "Bici Z2 (65% FTP)", "Carrera Suave (70% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral y Transiciones Brick",
      percentageDuration: 0.40,
      focusDescription: "Series de nado a ritmo CSS, ciclismo vivo (85-95% FTP) y transiciones de 15 a 20 min corriendo rápido.",
      weeklyTssRange: { min: 420, max: 540 },
      longRunGuideline: "Transición Brick: 1h15m-1h30m Bici @ 85% FTP + 20m Carrera rápida @ 90% CP.",
      recommendedIntensityZones: ["Brick Dinámico", "Sweetspot Bici", "Series Nado"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera Rápida",
      percentageDuration: 0.15,
      focusDescription: "Ensayos completos de ritmo olímpico, salida del agua y transiciones veloces T1 y T2.",
      weeklyTssRange: { min: 400, max: 510 },
      longRunGuideline: "Simulación: 1h15m Bici @ ritmo de carrera + 20m Carrera @ 92% CP.",
      recommendedIntensityZones: ["Ritmo Olímpico Sostenido"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Soltura",
      percentageDuration: 0.10,
      focusDescription: "Descarga de fatiga manteniendo buenas sensaciones en el agua y chispa en las piernas.",
      weeklyTssRange: { min: 190, max: 270 },
      longRunGuideline: "Entrenamiento combinado muy corto (30m bici suave + 10m carrera ágil).",
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
        {
          name: "Series de Umbral Aeróbico Fraccionado (4x4m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Desarrollo de capacidad de aclaramiento de lactato sin fatiga neuromuscular.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n4x\n- 4m 88% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Carrera Continua con Bloque Tempo Sub-Umbral (40m con 15m @ 86% CP)",
          powerTarget: "86% CP",
          justification: "Adaptación metabólica continua a ritmo de crucero olímpico.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain\n- 15m 86% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Cuestas Aeróbicas de Fuerza-Velocidad (40m con 6x45s @ 95% CP)",
          powerTarget: "95% CP",
          justification: "Impulso de fuerza reactiva y stiffness de tobillo.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n6x\n- 45s 95% FTP\n- 1m30s 55% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Fartlek Piramidal 3-2-1m @ 88-94% CP (42m)",
          powerTarget: "88-94% CP",
          justification: "Variabilidad de zancada en fatiga controlada.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n2x\n- 3m 88% FTP\n- 2m 60% FTP\n- 2m 92% FTP\n- 2m 60% FTP\n- 1m 95% FTP\n- 2m 55% FTP\n\nCooldown\n- 6m 60% FTP",
        },
      ],
      build: [
        {
          name: "Transición Rápida Brick Olímpico (1h15m Bici @ 86% FTP + 20m Run @ 90% CP)",
          powerTarget: "86% FTP Bici + 90% CP Carrera",
          justification: "Transición T2 Exprés (< 3m). Acostumbra las piernas a correr rápido inmediatamente tras pedalear a ritmo olímpico.",
          workoutDoc: "Bloque 1: Ciclismo a Ritmo Olímpico\n- 15m Calentamiento 55% FTP\n- 45m 86% FTP\n- 15m 60% FTP\n\nTransición T2 Exprés (< 3 min)\n\nBloque 2: Carrera Inmediata (Primeros 5m @ 185 spm)\n- 20m 90% FTP",
        },
        {
          name: "Series Específicas de Ritmo Olímpico en Carrera (4x 6m @ 92% CP)",
          powerTarget: "92% CP",
          justification: "Automatización del ritmo de 10 km en triatlón con 2m de recuperación.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n4x\n- 6m 92% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Brick de Ritmo Vivo Sprint (50m Bici con 3x6m @ 92% FTP + 15m Run @ 92% CP)",
          powerTarget: "92% FTP Bici + 92% CP Carrera",
          justification: "Capacidad anaeróbica láctica y velocidad en transición corta.",
          workoutDoc: "Bloque 1: Bici Fraccionada\n- 15m 55% FTP\n3x\n- 6m 92% FTP\n- 2m 55% FTP\n- 11m 65% FTP\n\nTransición T2 Exprés (< 2 min)\n\nBloque 2: Carrera Viva\n- 15m 92% FTP",
        },
        {
          name: "Series de Potencia Aeróbica Fraccionada (5x 3m @ 95% CP)",
          powerTarget: "95% CP",
          justification: "Densidad de VO2max en carrera a pie con 90s de trote suave.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 3m 95% FTP\n- 1m30s 55% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Brick Progresivo Dinámico (1h10m Bici @ 84% FTP + 20m Run @ 90% CP)",
          powerTarget: "84% FTP Bici + 90% CP Carrera",
          justification: "Construcción de tolerancia a la fatiga antes del sector a pie.",
          workoutDoc: "Bloque 1: Ciclismo Progresivo\n- 15m 55% FTP\n- 40m 84% FTP\n- 15m 60% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera\n- 20m 90% FTP",
        },
        {
          name: "Intervalos Mixtos de Umbral y Salida T2 (6x 2m30s @ 94% CP)",
          powerTarget: "94% CP",
          justification: "Cadencia rápida (185 spm) y adaptación a cambios de ritmo.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n6x\n- 2m30s 94% FTP\n- 1m30s 55% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo Olímpico (1h20m Bici @ 88% FTP + 25m Run @ 92% CP)",
          powerTarget: "88% FTP Bici + 92% CP Carrera",
          justification: "Transición T2 Exprés (< 3m). Ajusta la sensación de esfuerzo y el cambio de marcha neuromuscular en la T2.",
          workoutDoc: "Bloque 1: Ciclismo Específico Olímpico\n- 15m Calentamiento 55% FTP\n- 50m 88% FTP\n- 15m 60% FTP\n\nTransición T2 Exprés (< 3 min)\n\nBloque 2: Carrera de Transición\n- 25m 92% FTP",
        },
        {
          name: "Simulación Específica Triatlón Sprint (45m Bici @ 92% FTP + 15m Run @ 94% CP)",
          powerTarget: "92% FTP + 94% CP",
          justification: "Velocidad sostenida y salida reactiva sin deuda de oxígeno excesiva.",
          workoutDoc: "Bloque 1: Ciclismo Sprint\n- 10m 55% FTP\n- 25m 92% FTP\n- 10m 60% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera Sprint\n- 15m 94% FTP",
        },
        {
          name: "Series de Afinamiento Rápido en Pista (5x 2m15s @ 94% CP)",
          powerTarget: "94% CP",
          justification: "Toque de chispa neuromuscular con descanso completo para preservar frescura.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 2m15s 94% FTP\n- 2m 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Brick de Activación y Agilidad de Boxes (40m Bici con arrancadas + 12m Run)",
          powerTarget: "88% FTP + 92% CP",
          justification: "Ajuste de zapatillas, casco y transición a ritmo de competición.",
          workoutDoc: "Bloque 1: Bici Dinámica\n- 20m 60% FTP\n4x\n- 30s 95% FTP\n- 1m30s 50% FTP\n- 12m 65% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera Ágil\n- 12m 92% FTP",
        },
        {
          name: "Afinamiento de Ritmo de Competición (3x 4m @ 92% CP)",
          powerTarget: "92% CP",
          justification: "Sensación de paso de carrera sin fatiga a 7-10 días del evento.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 4m 92% FTP\n- 2m30s 50% FTP\n\nCooldown\n- 8m 55% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Multideporte Ligera (30m Bici + 10m Carrera)",
          powerTarget: "85% FTP en toques",
          justification: "Mantiene la fluidez neuromuscular antes del fin de semana de carrera.",
          workoutDoc: "Bloque 1: Bici Suave\n- 20m 60% FTP\n3x\n- 1m 85% FTP\n- 2m 50% FTP\n\nBloque 2: Carrera Ligera\n- 6m 65% FTP\n3x\n- 30s 90% FTP\n- 1m 50% FTP",
        },
        {
          name: "Trote Ligero con Rectas de Soltura (20m con 4 Strides @ 90% CP)",
          powerTarget: "90% CP en rectas",
          justification: "Activación refleja y despertar neuromuscular con cero fatiga.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n4x\n- 20s 90% FTP\n- 40s 50% FTP\n\nCooldown\n- 4m 55% FTP",
        },
        {
          name: "Pedaleo Suave con Toques Ágiles (30m Bici @ 60% FTP)",
          powerTarget: "60% FTP con toques",
          justification: "Verificación mecánica y lavado articular de piernas.",
          workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 15m 60% FTP con 2x30s 80% FTP\n\nCooldown\n- 5m 45% FTP",
        },
        {
          name: "Activación Despertar Pre-Competición (15m Run suave)",
          powerTarget: "65% CP",
          justification: "Reactividad articular el día previo al triatlón.",
          workoutDoc: "Warmup\n- 10m 62% FTP\n\n2x\n- 20s 85% FTP\n- 40s 50% FTP\n\nCooldown\n- 3m 50% FTP",
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
      {
        name: "Ciclismo Sweetspot con Cadencia Ágil (45m con 2x10m @ 88% FTP)",
        powerTarget: "88% FTP",
        justification: "Estímulo de alta densidad mitocondrial a 95 rpm.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n2x\n- 10m 88% FTP (95 rpm)\n- 3m 50% FTP\n\nCooldown\n- 7m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Series de Umbral Olímpico (50m con 3x7m @ 95% FTP)",
        powerTarget: "95% FTP",
        justification: "Tolerancia a la potencia de competición en el sector ciclista.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n3x\n- 7m 95% FTP\n- 3m 50% FTP\n\nCooldown\n- 8m 50% FTP",
        durationMin: 50,
      },
      {
        name: "Ciclismo Over-Under de Lactato (45m con 3x (2m @ 90% + 1m @ 105% FTP))",
        powerTarget: "90-105% FTP",
        justification: "Simulación de repechos y cambios de ritmo en circuito olímpico.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n3x\n- 2m 90% FTP\n- 1m 105% FTP\n- 2m 50% FTP\n\nCooldown\n- 9m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Z2 Dinámico con Aceleraciones (45m con 4x30s @ 110% FTP)",
        powerTarget: "68% FTP + Toques",
        justification: "Mantenimiento del tono neuromuscular y reactividad sin fatiga.",
        workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain\n- 25m 68% FTP\n4x\n- 30s 110% FTP\n- 1m30s 50% FTP\n\nCooldown\n- 5m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Posición Aero & Fuerza Resistencia (45m @ 75% FTP)",
        powerTarget: "75% FTP",
        justification: "Adaptación postural y eficiencia biomecánica en acoples aero.",
        workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain (Posición Aero)\n- 28m 75% FTP (85 rpm)\n\nCooldown\n- 7m 50% FTP",
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
      {
        name: "Trote Regenerativo en Césped (30m @ 65% CP)",
        powerTarget: "65% CP",
        justification: "Descarga de impacto articular sobre superficie blanda.",
        workoutDoc: "Warmup\n- 5m Caminata y trote suave 55% FTP\n\nMain\n- 20m 65% FTP\n\nCooldown\n- 5m Caminata suave",
        durationMin: 30,
      },
      {
        name: "Carrera Aeróbica Ligera con Cambios Suaves (35m @ 68-75% CP)",
        powerTarget: "68-75% CP",
        justification: "Variabilidad de apoyo sin elevar lactato.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\n5x\n- 2m 75% FTP\n- 2m 65% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Carrera Progresiva de Soltura Z1 a Z2 (35m)",
        powerTarget: "64-74% CP",
        justification: "Activación circulatoria progresiva y relajación de hombros.",
        workoutDoc: "Warmup\n- 10m 62% FTP\n\nMain\n- 15m 70% FTP\n- 5m 74% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
      {
        name: "Trote Corto de Oxigenación y Movilidad (25m @ 64% CP)",
        powerTarget: "64% CP",
        justification: "Lavado neuromuscular activo entre días de calidad.",
        workoutDoc: "Warmup\n- 5m 55% FTP\n\nMain\n- 15m 64% FTP\n\nCooldown\n- 5m Caminata y movilidad",
        durationMin: 25,
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
