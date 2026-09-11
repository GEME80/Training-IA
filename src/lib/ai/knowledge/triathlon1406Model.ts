import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, RUN_TEST_STRYD_3_9, SWIM_TEST_CSS_400_200 } from "./testingProtocols";

/**
 * Modelo Científico para Triatlón — Larga Distancia (Full IRONMAN 140.6)
 * Joe Friel (The Triathlete's Training Bible) + Jan Olbrecht (Aerobic Capacity in Full Distance)
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
          name: "Series de Ritmo Maratón en Carrera (4x 2.000m @ 80-82% CP)",
          powerTarget: "80-82% CP",
          justification: "Economía de carrera continua y eficiencia mecánica en ritmo objetivo.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 10m 82% FTP\n- 3m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Carrera Progresiva Controlada en Zona 2 (50m)",
          powerTarget: "70-76% CP",
          justification: "Construcción de fondo aeróbico sin fatiga neuromuscular excesiva.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\nMain\n- 30m 75% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Series Extensivas de Capacidad Aeróbica (3x 3.000m @ 78-80% CP)",
          powerTarget: "78-80% CP",
          justification: "Volumen a ritmo de maratón Ironman con descansos de 3m.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n3x\n- 15m 79% FTP\n- 3m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Fartlek Aeróbico Extensivo en Cuestas Ligeras (50m)",
          powerTarget: "72-80% CP",
          justification: "Fuerza específica sin sobrecarga articular excéntrica.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n6x\n- 3m 80% FTP\n- 2m 65% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Carrera Continua Z2 con Bloque Sub-Tempo (55m con 20m @ 78% CP)",
          powerTarget: "78% CP",
          justification: "Estabilidad postural y eficiencia metabólica continua.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain\n- 20m 78% FTP\n- 15m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Intervalos Largos de Control de Cadena Posterior (4x 7m30s @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Frecuencia de zancada constante (180 spm) en fatiga.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 7m30s 82% FTP\n- 2m30s 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      build: [
        {
          name: "Fondo Específico Iron con Nutrición Programada (4h30m Bici @ 70% + 20m Run)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Dosificación de bici controlada (70% FTP máx). Entrena procesar 60-80g CHO/h en posición aero. T2 exprés (< 5m).",
          workoutDoc: "Bloque 1: Ciclismo Iron Pace (Nutrición de 60-80g CHO/h)\n- 30m 58% FTP\n- 3h30m 70% FTP\n- 30m 55% FTP\n\nTransición T2 Exprés (< 5 min)\n\nBloque 2: Carrera de Transición Suave (Cadencia 180 spm)\n- 20m 74% FTP",
        },
        {
          name: "Series de Ritmo Maratón Iron Específico (3x 3.000m @ 76-78% CP)",
          powerTarget: "76-78% CP",
          justification: "Automatización de la zancada de maratón en estado de depleción.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n3x\n- 15m 77% FTP\n- 3m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Transición Brick de Fondo Iron (3h30m Bici @ 70% + 20m Run @ 74% CP)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Asimilación de fatiga acumulada en tren inferior y salida rápida T2.",
          workoutDoc: "Bloque 1: Ciclismo Fondo Z2\n- 3h30m 70% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera Viva\n- 20m 74% FTP",
        },
        {
          name: "Tempo Controlado Iron Marathon (45m @ 76% CP continuo)",
          powerTarget: "76% CP",
          justification: "Paso regular y respiración rítmica relajada.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\nMain\n- 45m 76% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Transición Brick Progresivo Iron (4h00m Bici @ 70% + 25m Run @ 74% CP)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Simulación de volumen mayor con hidratación de 700ml/hora.",
          workoutDoc: "Bloque 1: Ciclismo Gran Fondo\n- 4h00m 70% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera\n- 25m 74% FTP",
        },
        {
          name: "Carrera Continua Iron con Final Progresivo (60m @ 72% CP + 15m @ 76% CP)",
          powerTarget: "72-76% CP",
          justification: "Gestión mental y física de la fatiga en el último tercio.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain\n- 45m 72% FTP\n- 15m 76% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación Cumbre de Ritmo Full Iron (5h00m Bici @ 70% + 30m Run @ 74% CP)",
          powerTarget: "70% FTP Bici + 74% CP Carrera",
          justification: "Ensayo general de estrategia de carrera, ritmo medido (70% FTP), hidratación y transición T2.",
          workoutDoc: "Bloque 1: Ciclismo Largo con Avituallamiento Oficial de Carrera\n- 5h00m @ 70% FTP\n\nTransición T2 Exprés (< 5 min)\n\nBloque 2: Carrera a Pie de Transición\n- 30m @ 74% FTP",
        },
        {
          name: "Series de Afinamiento a Ritmo de Maratón Iron (3x 10m @ 76% CP)",
          powerTarget: "76% CP",
          justification: "Memorización del paso de carrera sin desgaste mitocondrial.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n3x\n- 10m 76% FTP\n- 3m 55% FTP\n\nCooldown\n- 8m 55% FTP",
        },
        {
          name: "Mini-Brick de Ritmo y Sensaciones (2h00m Bici @ 70% + 20m Run @ 74% CP)",
          powerTarget: "70% FTP + 74% CP",
          justification: "Último ensayo de transición rápida y calzado previo al tapering.",
          workoutDoc: "Bloque 1: Bici Z2 Estable\n- 2h00m 70% FTP\n\nTransición T2 Exprés\n\nBloque 2: Carrera Ligera\n- 20m 74% FTP",
        },
        {
          name: "Carrera Continua de Puesta a Punto Específica (40m @ 74% CP)",
          powerTarget: "74% CP",
          justification: "Sensación de ligereza y zancada elástica a 14 días del evento.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\nMain\n- 22m 74% FTP\n\nCooldown\n- 6m 55% FTP",
        },
        {
          name: "Afinamiento de Transición T2 (1h15m Bici @ 68% + 15m Run @ 74% CP)",
          powerTarget: "68% FTP + 74% CP",
          justification: "Tono neuromuscular y ajuste de posición en acoples.",
          workoutDoc: "Bloque 1: Bici Suave\n- 1h15m 68% FTP\n\nTransición T2 Exprés\n\nBloque 2: Trote Ágil\n- 15m 74% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Ligera de Carrera Iron (30m con 3x2m @ 75% CP)",
          powerTarget: "75% CP en toques",
          justification: "Mantiene la fluidez neuromuscular de carrera sin gastar glucógeno.",
          workoutDoc: "Warmup\n- 12m 65% FTP\n\n3x\n- 2m 75% FTP\n- 2m 55% FTP\n\nCooldown\n- 6m 55% FTP",
        },
        {
          name: "Trote de Descarga y Soltura Neuromuscular (25m con 3 Strides @ 85% CP)",
          powerTarget: "85% CP en rectas",
          justification: "Reactividad muscular sin fatiga residual.",
          workoutDoc: "Warmup\n- 15m 62% FTP\n\n3x\n- 20s 85% FTP\n- 40s 50% FTP\n\nCooldown\n- 4m 50% FTP",
        },
        {
          name: "Pedaleo Ágil de Afinamiento con Toques de Ritmo (1h00m Bici @ 65% FTP)",
          powerTarget: "65% FTP con toques",
          justification: "Mantiene la soltura sobre la bicicleta y el tono muscular.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nPedaleo Cómodo con 3x 2m @ 72% FTP\n- 35m 65% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
        {
          name: "Activación Despertar Pre-Ironman (15m Run suave)",
          powerTarget: "65% CP",
          justification: "Despertar del arco plantar y elasticidad el día previo.",
          workoutDoc: "Warmup\n- 10m 60% FTP\n\n2x\n- 20s 75% FTP\n- 40s 50% FTP\n\nCooldown\n- 3m 50% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Regeneración (1h00m @ 60% FTP)",
        powerTarget: "60% FTP",
        justification: "Volumen no impactante para favorecer la recuperación activa.",
        workoutDoc: "Pedaleo Suave Continuo\n- 1h00m 60% FTP",
        durationMin: 60,
      },
      {
        name: "Ciclismo Sweetspot Sub-Umbral Controlado (55m con 2x12m @ 85% FTP)",
        powerTarget: "85% FTP",
        justification: "Estímulo de densidad mitocondrial con baja fatiga central.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n2x\n- 12m 85% FTP\n- 3m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 55,
      },
      {
        name: "Ciclismo en Posición Aero Z2 Mitocondrial (1h05m @ 68% FTP)",
        powerTarget: "68% FTP",
        justification: "Adaptación postural continua a la posición de contrarreloj.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain (Posición Aero)\n- 40m 68% FTP (85 rpm)\n\nCooldown\n- 10m 50% FTP",
        durationMin: 65,
      },
      {
        name: "Ciclismo con Bloques de Ritmo Iron y Cadencia (1h00m con 3x10m @ 72% FTP)",
        powerTarget: "72% FTP",
        justification: "Eficiencia de pedaleo a 85-90 rpm a ritmo de carrera.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n3x\n- 10m 72% FTP\n- 2m 55% FTP\n\nCooldown\n- 12m 50% FTP",
        durationMin: 60,
      },
      {
        name: "Ciclismo Z2 Ágil & Aceleraciones Suaves (55m @ 65% FTP)",
        powerTarget: "65% FTP + Toques",
        justification: "Mantenimiento del reclutamiento neuromuscular sin lactato.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\nMain\n- 30m 65% FTP\n4x\n- 30s 90% FTP\n- 1m30s 50% FTP\n\nCooldown\n- 7m 50% FTP",
        durationMin: 55,
      },
      {
        name: "Ciclismo Regenerativo con Pedaleo Unipodal (45m @ 58% FTP)",
        powerTarget: "58% FTP",
        justification: "Lavado muscular y equilibrio de fuerza entre piernas.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 58% FTP con 4x 1m pedaleo una pierna\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Aeróbica de Soltura (45m @ 68% CP)",
        powerTarget: "68% CP",
        justification: "Oxigenación celular y soltura muscular suave.",
        workoutDoc: "Calentamiento\n- 10m 60% FTP\n\nCarrera Continua\n- 30m 68% FTP\n\nEnfriamiento\n- 5m 55% FTP",
        durationMin: 45,
      },
      {
        name: "Carrera Continua Z2 + 4 Strides Ligeros (50m)",
        powerTarget: "70% CP + Strides @ 100% CP",
        justification: "Mantiene la elasticidad del tendón de Aquiles sin fatiga glucogénica.",
        workoutDoc: "Calentamiento\n- 12m 60% FTP\n\nCarrera Cómoda\n- 30m 70% FTP\n\n4x\n- 20s 100% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 4m 55% FTP",
        durationMin: 50,
      },
      {
        name: "Trote Regenerativo en Terreno Blando (35m @ 64% CP)",
        powerTarget: "64% CP",
        justification: "Descarga de impacto sobre articulaciones.",
        workoutDoc: "Warmup\n- 5m 55% FTP\n\nMain\n- 25m 64% FTP\n\nCooldown\n- 5m Caminata",
        durationMin: 35,
      },
      {
        name: "Carrera Aeróbica Fácil por Sensaciones (40m @ 68% CP)",
        powerTarget: "68% CP",
        justification: "Carrera relajada con respiración nasal cómoda.",
        workoutDoc: "Warmup\n- 10m 62% FTP\n\nMain\n- 25m 68% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua Progresiva Suave Z1-Z2 (45m de 62% a 72% CP)",
        powerTarget: "62-72% CP",
        justification: "Activación mitocondrial progresiva.",
        workoutDoc: "Warmup\n- 10m 60% FTP\n\nMain\n- 25m 68% FTP\n- 5m 72% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 45,
      },
      {
        name: "Trote Corto de Oxigenación y Descarga (30m @ 62% CP)",
        powerTarget: "62% CP",
        justification: "Lavado muscular tras salidas largas de ciclismo.",
        workoutDoc: "Warmup\n- 5m 55% FTP\n\nMain\n- 20m 62% FTP\n\nCooldown\n- 5m 50% FTP",
        durationMin: 30,
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
