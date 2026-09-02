import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, BIKE_TEST_20M_FTP } from "./testingProtocols";

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
      longRunGuideline: "Brick de fin de semana: 2h30m-3h Ciclismo @ 75% FTP + 25-35m Carrera @ 82% CP.",
      recommendedIntensityZones: ["Brick Race Pace", "Sweetspot Bici", "Tempo Carrera"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera 70.3",
      percentageDuration: 0.16,
      focusDescription: "Simulación de transiciones T1 y T2, estrategia nutricional y puesta a punto de ritmo.",
      weeklyTssRange: { min: 480, max: 600 },
      longRunGuideline: "Tiradas clave y ensayo de ritmos de carrera con nutrición programada.",
      recommendedIntensityZones: ["Simulación 70.3", "Zonas Específicas"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Tapering Progresivo Multideporte",
      percentageDuration: 0.10,
      focusDescription: "Descarga de volumen manteniendo frecuencia de sesiones para preservar la sensibilidad acuática y tono muscular.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Reducción al 50% de volumen en los 3 deportes con toques de ritmo.",
      recommendedIntensityZones: ["Activaciones Cortas", "Descanso Activo"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 2 },
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 3 },
  ],
  longRunRules: {
    startKm: 10,
    peakKm: 18,
    startMinutes: 60,
    peakMinutes: 105,
    targetIntensityPercentCpOrFtp: "75-80% Bike FTP + 80-84% Stryd CP en Brick",
    description: "Progresión de carrera a pie hasta 18km (85% de los 21k) con bloques de transición brick y 2 semanas de tapering.",
    taperKmSequence: [12, 7],
    taperMinutesSequence: [65, 38],
  },
  maxLongRunMinutesCap: 105,
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 12, maxLongRunMinutes: 75, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 65, maxLongRunKm: 16, maxLongRunMinutes: 95, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 18, maxLongRunMinutes: 105, tssScaleFactor: 1.10 },
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 82,
    triggerMinWKgThreshold: 3.1,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Preserva articulaciones alternando rodaje aeróbico con natación técnica o rodillo Z2.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_pelvic_core_prehab", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run", "cross_bike_hiit_vo2"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Natación CSS Aeróbica Específica (1.800m)",
          powerTarget: "CSS Aeróbico (CSS + 3s/100m)",
          justification: "Fondo de brazos e hidrodinámica a ritmo de crucero de medio maratón de agua.",
          workoutDoc: "Warmup\n- 300m Nado Suave Z1\n- 4x 50m Técnica (Punto muerto c/15s desc)\n\nMain\n- 4x 300m Ritmo CSS + 3s/100m c/20s desc\n\nCooldown\n- 100m Suave Espalda / Pecho",
        },
        {
          name: "Series de Umbral en Rodillo / Bici (3x10m @ 88% FTP)",
          powerTarget: "88% FTP",
          justification: "Desarrollo de potencia aeróbica específica sin impacto osteoarticular.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 10m 88% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Series de Capacidad Aeróbica en Carrera (5x3m @ 90% CP)",
          powerTarget: "90% CP",
          justification: "Aclaramiento eficiente de lactato y soltura neuromuscular.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n5x\n- 3m 90% FTP\n- 2m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Transición Brick Específica 70.3 (1h30m Bici @ 78% FTP + 25m Run @ 82% CP)",
          powerTarget: "78% FTP Bici + 82% CP Carrera",
          justification: "Transición T2 rápida (< 5m). Adaptación neuromuscular a la carrera con pre-fatiga de pedaleo.",
          workoutDoc: "Bloque 1: Ciclismo 70.3 Pace\n- 1h30m 78% FTP\n\nTransición T2 Expres (< 5 min)\n\nBloque 2: Carrera de Transición (Primeros 10m @ 180 spm)\n- 25m 82% FTP",
        },
        {
          name: "Sweetspot Bike (3x12m @ 88% FTP) + Trote Transición (20m)",
          powerTarget: "88% FTP + 78% CP",
          justification: "Construcción de potencia aeróbica sostenible con adaptación biomecánica de carrera.",
          workoutDoc: "Bloque 1: Ciclismo Sweetspot\n- 15m 55% FTP\n3x\n- 12m 88% FTP\n- 3m 55% FTP\n\nTransición T2 (< 5 min)\n\nBloque 2: Carrera Inmediata\n- 20m 78% FTP",
        },
        {
          name: "Tempo Específico 70.3 en Carrera (35m @ 83% CP)",
          powerTarget: "83% CP",
          justification: "Eficiencia de zancada a ritmo de crucero de medio maratón de triatlón.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 35m 83% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Transición Brick Progresiva (1h45m Bici @ 76% + 30m Run @ 82% CP)",
          powerTarget: "76% FTP + 82% CP",
          justification: "Simulación de fatiga acumulada en tren inferior previa a la carrera.",
          workoutDoc: "Bloque 1: Ciclismo Fondo Z2\n- 1h45m 76% FTP\n\nTransición T2 (< 5 min)\n\nBloque 2: Carrera Transición 70.3\n- 30m 82% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 70.3 (2h Bici @ 80% FTP + 35m Run @ 83% CP)",
          powerTarget: "80% FTP + 83% CP",
          justification: "Ensayo general de potencia de pedaleo (80% FTP max), nutrición (60g CHO/h) y ritmo de carrera.",
          workoutDoc: "Bloque 1: Ciclismo 70.3 Race Pace\n- 2h00m 80% FTP\n\nTransición T2 Expres (< 5 min)\n\nBloque 2: Carrera Ritmo 70.3\n- 35m 83% FTP",
        },

        {
          name: "Brick de Alta Intensidad (1h15m Bici con 3x8m @ 88% + 25m Run @ 84% CP)",
          powerTarget: "88% FTP + 84% CP",
          justification: "Afinamiento de potencia y tolerancia al esfuerzo en transición.",
          workoutDoc: "Bloque 1: Bici Sweetspot\n- 15m 55% FTP\n3x\n- 8m 88% FTP\n- 2m 55% FTP\n- 15m 65% FTP\n\nBloque 2: Carrera\n- 25m 84% FTP",
        },
        {
          name: "Simulación Específica de Transición T2 & Nutrición (1h30m Bici + 25m Run)",
          powerTarget: "78% FTP + 83% CP",
          justification: "Último ajuste de calzado, calcetines, hidratación y sensación de piernas.",
          workoutDoc: "Bloque 1: Ciclismo Estable\n- 1h30m 78% FTP\n\nBloque 2: Carrera Viva\n- 25m 83% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Multideporte Corta (30m Bici + 15m Run)",
          powerTarget: "85% FTP + 85% CP",
          justification: "Frescura y reactividad pre-competición.",
          workoutDoc: "Bloque 1: Bici\n- 20m 60% FTP\n3x\n- 1m 85% FTP\n- 2m 50% FTP\n\nBloque 2: Carrera\n- 10m 68% FTP\n3x\n- 30s 85% FTP\n- 1m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 con Variaciones de Cadencia 95-105 rpm (50m)",
        powerTarget: "68% FTP",
        justification: "Eficiencia biomecánica y cadencia fluida sin impacto articular.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain (Z2 Ágil)\n- 25m 68% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 50,
      },
      {
        name: "Ciclismo Sweetspot Sub-Umbral (45m con 2x10m @ 88% FTP)",
        powerTarget: "88% FTP",
        justification: "Estímulo de alta densidad mitocondrial con baja fatiga residual.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n2x\n- 10m 88% FTP\n- 3m 50% FTP\n\nCooldown\n- 7m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Z2 Continuo & Aceleraciones Cortas (55m)",
        powerTarget: "65% FTP + Toques @ 95% FTP",
        justification: "Mantenimiento del tono neuromuscular y volumen aeróbico.",
        workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain\n- 35m 65% FTP\n4x\n- 30s 95% FTP\n- 1m30s 50% FTP\n\nCooldown\n- 5m 50% FTP",
        durationMin: 55,
      },
      {
        name: "Ciclismo Z1-Z2 Regenerativo de Soltura (40m)",
        powerTarget: "60% FTP",
        justification: "Lavado muscular activo y recuperación de articulaciones.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 20m 60% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 40,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Rodaje Z1-Z2 Aeróbico de Soltura (40m)",
        powerTarget: "70% CP",
        justification: "Oxigenación celular y soltura de piernas sin impacto excesivo.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua Z2 + 4 Strides Reactivos (45m)",
        powerTarget: "72% CP + Strides @ 105% CP",
        justification: "Reactividad neuromuscular tras el pedaleo sin fatiga metabólica.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 72% FTP\n\n4x\n- 20s 105% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 45,
      },
      {
        name: "Fartlek Aeróbico Suave por Sensaciones (40m)",
        powerTarget: "68-78% CP",
        justification: "Variabilidad de zancada sin acumular lactato.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\n5x\n- 2m 78% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        durationMin: 40,
      },
      {
        name: "Rodaje Regenerativo Suave (35m Z1)",
        powerTarget: "65% CP",
        justification: "Lavado muscular y recuperación activa entre sesiones clave.",
        workoutDoc: "Warmup\n- 8m 60% FTP\n\nMain\n- 22m 65% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza y Estabilidad Escapular / Cadera para Triatletas",
        focus: "Hombro, Core y Cadera",
        justification: "Protección articular para natación y posición aerodinámica.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Rotadores, Core y Pliometría Suave",
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
