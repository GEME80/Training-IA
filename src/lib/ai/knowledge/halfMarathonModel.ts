import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_20M_TT } from "./testingProtocols";

/**
 * Modelo Científico para Media Maratón 21K (Jack Daniels + Steve Magness + Stryd)
 */
export const HALF_MARATHON_21K_MODEL: CuratedTrainingModel = {
  modelId: "HALF_MARATHON_21K",
  sportCategory: "Running",
  displayName: "PULSE 21K Half-Marathon Mastery (Daniels + Magness + Stryd)",
  scientificAuthors: [
    "Jack Daniels (Daniels Running Formula & Threshold Intervals)",
    "Steve Magness (The Science of Running & Fatigue Resistance)",
    "Stryd Team (Critical Power % CP & Stryd Watts)",
  ],
  description:
    "Modelo científico para medio maratón (21.1 km). Énfasis en elevación de potencia crítica, tolerancia al lactato y ritmo tempo sostenido.",
  targetDistanceKm: 21.1,
  periodizationStyle: "Periodización por Bloques Progresivos de Umbral (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Eficiencia Mecánica",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo mitocondrial, cadencia reactiva y acondicionamiento musculoesquelético.",
      weeklyTssRange: { min: 260, max: 360 },
      longRunGuideline: "Progresión gradual de 10 km (55m) a 16 km (85m) en Z2 cómoda (68-74% CP).",
      recommendedIntensityZones: ["Z1 Regenerativo (55-65% CP)", "Z2 Base Aeróbica (68-75% CP)", "Fartlek Cuestas (96% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción de Umbral y Ritmo 21K",
      percentageDuration: 0.35,
      focusDescription: "Elevación de la potencia crítica, tolerancia al lactato e intervalos a ritmo medio maratón.",
      weeklyTssRange: { min: 350, max: 460 },
      longRunGuideline: "Fondos de 16 a 20 km (85 a 105 min) con bloques al 84-88% Stryd CP.",
      recommendedIntensityZones: ["Series Umbral (98-102% CP)", "Tempo 21K (86-90% CP)", "Ritmo Crucero (82-86% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico Específico & Tolerancia a la Fatiga",
      percentageDuration: 0.18,
      focusDescription: "Simulaciones específicas de ritmo 21K, soltura neuromuscular y economía a potencia objetivo.",
      weeklyTssRange: { min: 400, max: 500 },
      longRunGuideline: "Tirada cumbre de 20 a 22 km (100 a 110 min) con hasta 12 km acumulados al 86-88% CP.",
      recommendedIntensityZones: ["Ritmo Medio Maratón Sostenido (86-88% CP)", "Intervalos Específicos"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto & Supercompensación",
      percentageDuration: 0.12,
      focusDescription: "Reducción de volumen conservando activación neuromuscular para llegar con TSB altamente positivo.",
      weeklyTssRange: { min: 180, max: 260 },
      longRunGuideline: "Reducción escalonada: 14 km (70m) -> 8 km (40m) previo al evento.",
      recommendedIntensityZones: ["Activación Strides (105% CP)", "Rodaje Z2 Cómodo (70% CP)"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 7 },
  ],
  longRunRules: {
    startKm: 10,
    peakKm: 22,
    startMinutes: 55,
    peakMinutes: 110,
    targetIntensityPercentCpOrFtp: "70-76% CP en base y 84-88% CP en ritmo medio maratón",
    description: "Progresión de 10km a 22km (sobredistancia 100%) con tramos de ritmo tempo y 2 semanas de tapering.",
    taperKmSequence: [14, 8],
    taperMinutesSequence: [70, 40],
  },
  maxLongRunMinutesCap: 120,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 14, maxLongRunMinutes: 80, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 18, maxLongRunMinutes: 95, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 22, maxLongRunMinutes: 110, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 80,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 40,
    notes: "Sustituye un rodaje aeróbico por rodillo Z2 si el peso >80kg para cuidar las articulaciones.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Fartlek de Cuestas Cortas Stryd (45m)",
          powerTarget: "96% CP en cuesta",
          justification: "Reclutamiento de unidades motoras rápidas y potencia elástica sin impacto excesivo.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n6x\n- 45s 96% FTP\n- 1m15s 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Carrera Continua Progresiva en Pirámide Aeróbica (45m)",
          powerTarget: "70% a 82% CP",
          justification: "Construcción de eficiencia mitocondrial con aceleración final controlada.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain\n- 20m 78% FTP\n- 5m 83% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Fartlek Sueco Piramidal (45m)",
          powerTarget: "90-94% CP en tramos vivos",
          justification: "Estimulación orgánica de VO2max y elasticidad neuromuscular.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 1m 92% FTP\n- 1m 65% FTP\n- 2m 90% FTP\n- 1m 65% FTP\n- 3m 88% FTP\n- 2m 65% FTP\n- 2m 90% FTP\n- 1m 65% FTP\n- 1m 92% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Series de Capacidad Aeróbica (4x4m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Capilarización periférica y reciclaje temprano de lactato.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 4m 88% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Rodaje Continuo con Progresión a Ritmo Tempo (50m)",
          powerTarget: "72% a 86% CP",
          justification: "Transición de zona aeróbica pura hacia ritmo medio maratón.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain\n- 25m 74% FTP\n- 10m 86% FTP\n\nCooldown\n- 5m 60% FTP",
        },
      ],
      build: [
        {
          name: "Series Umbral Stryd Z4 (4x6m @ 100% CP)",
          powerTarget: "100% CP",
          justification: "Elevación de la potencia crítica y tolerancia neuromuscular a la acidosis.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 6m 100% FTP\n- 2m30s 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Intervalos de Ritmo Medio Maratón (3x10m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Eficiencia biomecánica sostenida a potencia objetivo de 21K.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x\n- 10m 88% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Series Largas de Umbral (3x8m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Sostenimiento metabólico en zona de máximo estado estable de lactato.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x\n- 8m 98% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Tempo Continuo Sub-Umbral (30m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Adaptación metabólica y resiliencia mental a ritmo objetivo de medio maratón.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 30m 88% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Over-Unders de Lactato (3x [3m @ 95% / 2m @ 85% CP])",
          powerTarget: "95% / 85% CP",
          justification: "Entrenamiento del aclaramiento de lactato bajo estrés hemodinámico.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n3x\n- 3m 95% FTP\n- 2m 85% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo 21K (2x15m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Ensayo clave de ritmo competitivo y gestión de pulsaciones y vatios.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n2x\n- 15m 88% FTP\n- 4m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Broken Tempo Daniels (3x8m @ 90% CP)",
          powerTarget: "90% CP",
          justification: "Densidad de ritmo de carrera con recuperación incompleta.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n3x\n- 8m 90% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Carrera Progresiva con Final Específico 21K (40m Z2 + 15m @ 88% CP)",
          powerTarget: "72% a 88% CP",
          justification: "Simulación del tercio final de carrera con fatiga previa.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 28m 72% FTP\n- 15m 88% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Intervalos de Potencia Crítica (5x3m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Toque de potencia y velocidad terminal previo a la fase de descarga.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n5x\n- 3m 98% FTP\n- 2m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Breve con Strides Reactivos (30m)",
          powerTarget: "105% CP en strides",
          justification: "Despertar neuromuscular y reactividad articular sin gasto metabólico.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n4x\n- 30s 105% FTP\n- 1m 55% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Puesta a Punto Ritmo 21K (25m con 3x3m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Recordatorio neural de ritmo de carrera sin acumulación de fatiga.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\n3x\n- 3m 88% FTP\n- 2m 55% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Rodaje Suave con Toques de Ritmo (25m con 2x4m @ 86% CP)",
          powerTarget: "86% CP en toques",
          justification: "Afinamiento y soltura muscular previa a la competición.",
          workoutDoc: "Warmup\n- 10m 68% FTP\n\n2x\n- 4m 86% FTP\n- 2m 55% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Soltura Regenerativa y Cadencia 180 spm (20m @ 68% CP)",
          powerTarget: "68% CP",
          justification: "Activación ligera y contacto breve con el suelo en semana de carrera.",
          workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 12m 68% FTP\n\nCooldown\n- 3m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 con Variaciones de Cadencia 95-105 rpm (50m)",
        powerTarget: "70% FTP",
        justification: "Eficiencia biomecánica y cadencia fluida sin impacto articular.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 50,
      },
      {
        name: "Sweetspot Progresivo Ciclismo (3x8m @ 85% FTP)",
        powerTarget: "85% FTP",
        justification: "Estímulo de potencia aeróbica y densidad mitocondrial sin fatiga excéntrica.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 8m 85% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 55,
      },
      {
        name: "Micro-Aceleraciones Neuromusculares Ciclismo (45m con 6x20s @ 110% FTP)",
        powerTarget: "110% FTP en sprints",
        justification: "Reclutamiento de unidades motoras y reactividad de piernas sin impacto.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n6x\n- 20s 110% FTP\n- 1m40s 60% FTP\n\nMain\n- 10m 68% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Z2 Regenerativo Suave (45m)",
        powerTarget: "60% FTP",
        justification: "Recuperación activa y lavado de metabolitos.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 60% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Over-Unders Umbral Suaves Ciclismo (3x [2m @ 95% / 2m @ 80% FTP])",
        powerTarget: "95% / 80% FTP",
        justification: "Mejora de la capacidad de aclaramiento de lactato sobre la bicicleta.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 2m 95% FTP\n- 2m 80% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Carrera Continua Z1-Z2 + 5 Strides Reactivos (45m)",
        powerTarget: "72% CP + Strides @ 115% CP",
        justification: "Reactividad elástica del tendón de Aquiles y economía de zancada.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 72% FTP\n\n5x\n- 20s 115% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 45,
      },
      {
        name: "Carrera Continua Aeróbica Z2 (40m)",
        powerTarget: "70% CP",
        justification: "Consistencia aeróbica y volumen mitocondrial.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua Progresiva Suave (40m)",
        powerTarget: "68% a 76% CP",
        justification: "Estimulación hemodinámica gradual y aclimatación de ritmo.",
        workoutDoc: "Warmup\n- 12m 65% FTP\n\nMain\n- 20m 72% FTP\n- 5m 76% FTP\n\nCooldown\n- 3m 60% FTP",
        durationMin: 40,
      },
      {
        name: "Carrera Continua de Asimilación & Cadencia 180 spm (35m)",
        powerTarget: "68% CP",
        justification: "Eficiencia biomecánica, contacto de suelo breve y recuperación activa.",
        workoutDoc: "Warmup\n- 8m 65% FTP\n\nMain\n- 22m 68% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 35,
      },
      {
        name: "Trote Regenerativo Suave Z1 (30m)",
        powerTarget: "65% CP",
        justification: "Lavado neuromuscular y oxigenación celular sin estrés biológico.",
        workoutDoc: "Warmup\n- 6m 60% FTP\n\nMain\n- 20m 65% FTP\n\nCooldown\n- 4m 55% FTP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Sóleo & Pliometría Reactiva (Drop Jumps & Tobillo)",
        focus: "Sóleo y Tobillo",
        justification: "Fortalecimiento del tendón de Aquiles para absorber el impacto de media maratón.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 15m Pliometría Sóleo, Gemelo & Core\n\nCooldown\n- 5m Stretch",
      },
      {
        name: "Fuerza Isométrica de Cadena Posterior & Glúteo Medio",
        focus: "Glúteo y Cadera",
        justification: "Estabilidad pélvica para evitar oscilaciones innecesarias a ritmo de carrera.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 15m Puentes, Abductores & Planchas\n\nCooldown\n- 5m Stretch",
      },
      {
        name: "Fuerza Máxima & Potencia de Pierna (Sentadilla Búlgara & Core)",
        focus: "Cuádriceps y Cadera",
        justification: "Desarrollo de fuerza propulsiva y estabilidad articular.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 15m Sentadillas Búlgaras, Peso Muerto & Core\n\nCooldown\n- 5m Stretch",
      },
      {
        name: "Movilidad Articular Dinámica & Descarga Miofascial (25m)",
        focus: "Recuperación y Core",
        justification: "Alivio de tensiones miofasciales y mantenimiento del rango de movimiento.",
        workoutDoc: "Warmup\n- 5m Foam Roller\n\nMain\n- 15m Movilidad Dinámica, Cadera y Tobillo\n\nCooldown\n- 5m Respiración",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.25,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 10,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Sesión de rodillo Z2 para sumar volumen mitocondrial con cero impacto.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.2,
  },
};
