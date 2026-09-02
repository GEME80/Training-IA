import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_20M_TT } from "./testingProtocols";

export const MARATHON_42K_MODEL: CuratedTrainingModel = {
  modelId: "MARATHON_42K",
  sportCategory: "Running",
  displayName: "PULSE 42K Marathon Mastery (Canova + Pfitzinger + Daniels)",
  scientificAuthors: [
    "Renato Canova (Special Block & Marathon Specific Extension)",
    "Pete Pfitzinger (Advanced Marathoning & Multi-Tier Long Runs)",
    "Jack Daniels & Stryd Team (Critical Power % CP)",
  ],
  description:
    "Modelo científico rector para maratón 42K. Progresión ondulada de tirada larga desde 14 km hasta 34 km (85% de la distancia) y supercompensación en Tapering.",
  targetDistanceKm: 42.2,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1 o 2:1 Preventivo",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Capilarización",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo mitocondrial, economía de carrera, reactividad del sóleo y acondicionamiento musculoesquelético.",
      weeklyTssRange: { min: 280, max: 370 },
      longRunGuideline: "Progresión gradual de 14 km (75m) a 20 km (100m) en Z2 cómoda (68-74% CP).",
      recommendedIntensityZones: ["Z1 Regenerativo (55-65% CP)", "Z2 Base Aeróbica (68-75% CP)", "Fartlek Cuestas (96% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Construcción de Umbral y Potencia Crítica",
      percentageDuration: 0.35,
      focusDescription: "Elevación del umbral anaeróbico, series extensivas de umbral y tolerancia al lactato.",
      weeklyTssRange: { min: 370, max: 480 },
      longRunGuideline: "Fondos progresivos de 22 a 28 km (115 a 145 min) con bloques al 78-83% Stryd CP (Ritmo Maratón).",
      recommendedIntensityZones: ["Series Umbral (98-102% CP)", "Tempo Específico (85-90% CP)", "Ritmo Maratón (78-83% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico Específico & Bloques Canova",
      percentageDuration: 0.18,
      focusDescription: "Simulaciones específicas de maratón, durabilidad muscular y economía glucogénica a ritmo de carrera.",
      weeklyTssRange: { min: 440, max: 540 },
      longRunGuideline: "Tiradas rectoras cumbre de 28 a 34 km (145 a 175 min) con hasta 15-20 km acumulados al 80-83% CP.",
      recommendedIntensityZones: ["Ritmo Maratón Sostenido (80-83% CP)", "Tirada Larga Específica Canova"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto & Tapering",
      percentageDuration: 0.12,
      focusDescription: "Supercompensación, regeneración de glucógeno y elevación de TSB a valores altamente positivos (+10 a +25).",
      weeklyTssRange: { min: 180, max: 280 },
      longRunGuideline: "Reducción escalonada a 22 km (110m) -> 16 km (80m) -> 10 km (50m) previo al maratón.",
      recommendedIntensityZones: ["Activación con Strides Cortos (105% CP)", "Rodajes Cómodos Z2 (70% CP)"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, recommendedWeekIndex: 8 },
  ],
  longRunRules: {
    startKm: 14,
    peakKm: 34,
    startMinutes: 75,
    peakMinutes: 150, // Cap estricto de 2h30m (150 min)
    targetIntensityPercentCpOrFtp: "68-74% CP en base y 78-83% CP en bloques específicos",
    description: "Progresión de 14km a 34km (máximo 150 min) en semana cumbre -4, con descargas 3:1 y 3 semanas de tapering conservando ritmo maratón.",
    taperKmSequence: [22, 16, 10],
    taperMinutesSequence: [110, 80, 50],
  },
  maxLongRunMinutesCap: 150,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 18, maxLongRunMinutes: 110, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 26, maxLongRunMinutes: 135, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 34, maxLongRunMinutes: 150, tssScaleFactor: 1.10 },
  },
  taperingRules: {
    taperingWeeks: 3,
    volumeDropSequencePercent: [0.20, 0.40, 0.65],
    maintainRacePaceIntensity: true,
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 80,
    triggerMinWKgThreshold: 3.2,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 40,
    notes: "Sustituye un rodaje aeróbico por rodillo Z2 o aqua-running si el atleta pesa >80kg o su relación es <3.2 W/kg.",
  },
  recommendedStrengthModelIds: ["strength_spring_ankle_soleus", "strength_heavy_neural", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Fartlek de Cuestas Cortas Stryd (45m)",
          powerTarget: "96% CP en cuesta",
          justification: "Reclutamiento de unidades motoras rápidas y fuerza reactiva sin acidosis láctica.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n6x\n- 45s 96% FTP\n- 1m15s 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Rodaje Progresivo en Pirámide Aeróbica (45m)",
          powerTarget: "70% a 82% CP",
          justification: "Construcción de eficiencia mitocondrial con aceleración final controlada.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain\n- 20m 78% FTP\n- 5m 83% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Fartlek Sueco Piramidal (45m)",
          powerTarget: "90-94% CP en tramos rápidos",
          justification: "Cambios de ritmo orgánicos para estimular el VO2max y la soltura neuromuscular.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 1m 92% FTP\n- 1m 65% FTP\n- 2m 90% FTP\n- 1m 65% FTP\n- 3m 88% FTP\n- 2m 65% FTP\n- 2m 90% FTP\n- 1m 65% FTP\n- 1m 92% FTP\n\nCooldown\n- 8m 60% FTP",
        },
        {
          name: "Series de Capacidad Aeróbica (4x4m @ 88% CP)",
          powerTarget: "88% CP",
          justification: "Estímulo de capilarización y aclaramiento eficiente de lactato.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 4m 88% FTP\n- 2m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Series Umbral Stryd Z4 (4x8m @ 100% CP)",
          powerTarget: "100% CP",
          justification: "Elevación de la potencia crítica y tolerancia al lactato.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 8m 100% FTP\n- 2m30s 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Intervalos de Ritmo Maratón Extensivo (3x4km @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Automatización biomecánica a potencia específica de competición.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x\n- 20m 82% FTP\n- 5m 68% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Series Largas de Umbral (3x10m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Sostenimiento metabólico en zona de máximo estado estable de lactato.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x\n- 10m 98% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Tempo Continuo de Resistencia (35m @ 84% CP)",
          powerTarget: "84% CP",
          justification: "Adaptación neuromuscular y eficiencia energética a ritmo sub-umbral.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 35m 84% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Bloque Específico Canova (2x6km @ 83% CP)",
          powerTarget: "83% CP",
          justification: "Densidad de ritmo maratón con fatiga acumulada.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n2x\n- 30m 83% FTP\n- 7m 68% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Simulación de Ritmo Competitivo (3x5km @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Prueba de ritmo, avituallamiento y control de vatios Stryd.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x\n- 25m 82% FTP\n- 5m 68% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Rodaje Progresivo con Final Específico (50m Z2 + 20m @ 84% CP)",
          powerTarget: "72% a 84% CP",
          justification: "Simulación de segunda mitad de maratón con depleción glucogénica parcial.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\nMain\n- 35m 72% FTP\n- 20m 84% FTP\n\nCooldown\n- 5m 60% FTP",
        },
        {
          name: "Intervalos Canova Combinados (4km @ 82% + 3km @ 84% + 2km @ 88% CP)",
          powerTarget: "82% a 88% CP",
          justification: "Aceleración final y reclutamiento de fibras rápidas en fatiga.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\nMain\n- 20m 82% FTP\n- 5m 65% FTP\n- 15m 84% FTP\n- 5m 65% FTP\n- 10m 88% FTP\n\nCooldown\n- 8m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Breve con Strides Reactivos (35m)",
          powerTarget: "105% CP",
          justification: "Despertar neuromuscular con mínimo impacto previo a la carrera.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n4x\n- 30s 105% FTP\n- 1m 55% FTP\n\nCooldown\n- 10m 60% FTP",
        },
        {
          name: "Puesta a Punto a Ritmo de Carrera (30m con 3x1000m @ 82% CP)",
          powerTarget: "82% CP",
          justification: "Recordatorio biomecánico de ritmo maratón sin fatiga metabólica.",
          workoutDoc: "Warmup\n- 12m 68% FTP\n\n3x\n- 5m 82% FTP\n- 2m 55% FTP\n\nCooldown\n- 5m 60% FTP",
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
        justification: "Estímulo de potencia aeróbica y densidad mitocondrial sin acidosis.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 8m 85% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 55,
      },
      {
        name: "Micro-Aceleraciones Neuromusculares (45m con 6x20s @ 110% FTP)",
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
        name: "Over-Unders Umbral Suaves (3x [2m @ 95% / 2m @ 80% FTP])",
        powerTarget: "95% / 80% FTP",
        justification: "Mejora de la capacidad de aclaramiento de lactato pedaleando.",
        workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 2m 95% FTP\n- 2m 80% FTP\n- 2m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 50,
      },
      {
        name: "Fuerza Resistencia Ciclismo (45m @ 60 rpm 76% FTP)",
        powerTarget: "76% FTP @ baja cadencia",
        justification: "Fuerza específica de cuádriceps y glúteo sin sobrecarga articular.",
        workoutDoc: "Warmup\n- 12m 55% FTP\n\n3x\n- 6m 76% FTP (60 rpm)\n- 3m 60% FTP (95 rpm)\n\nCooldown\n- 6m 50% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Rodaje Z1-Z2 + 5 Strides Reactivos (45m)",
        powerTarget: "72% CP + Strides @ 115% CP",
        justification: "Reactividad elástica del tendón de Aquiles y economía de zancada.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 72% FTP\n\n5x\n- 20s 115% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 45,
      },
      {
        name: "Rodaje Continuo Aeróbico Z2 (45m)",
        powerTarget: "70% CP",
        justification: "Consistencia aeróbica y volumen mitocondrial.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 30m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 45,
      },
      {
        name: "Rodaje Progresivo Suave (45m)",
        powerTarget: "68% a 76% CP",
        justification: "Estimulación hemodinámica gradual y aclimatación de ritmo.",
        workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain\n- 20m 72% FTP\n- 5m 76% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 45,
      },
      {
        name: "Rodaje de Asimilación & Cadencia 180 spm (40m)",
        powerTarget: "68% CP",
        justification: "Eficiencia biomecánica, contacto de suelo breve y recuperación activa.",
        workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 68% FTP\n\nCooldown\n- 5m 60% FTP",
        durationMin: 40,
      },
      {
        name: "Rodaje Regenerativo Suave Z1 (35m)",
        powerTarget: "65% CP",
        justification: "Lavado neuromuscular y oxigenación celular sin estrés biológico.",
        workoutDoc: "Warmup\n- 8m 60% FTP\n\nMain\n- 22m 65% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Sóleo & Pliometría Reactiva (Drop Jumps & Tobillo)",
        focus: "Sóleo y Tobillo",
        justification: "Fortalecimiento del tendón de Aquiles para absorber el impacto de maratón.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 15m Pliometría Sóleo, Gemelo & Core\n\nCooldown\n- 5m Stretch",
      },
      {
        name: "Fuerza Isométrica de Cadena Posterior & Glúteo Medio",
        focus: "Glúteo y Cadera",
        justification: "Estabilidad pélvica para evitar colapso de rodilla en fatiga.",
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
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 1,
    notes: "Sesión de rodillo Z2 para sumar volumen mitocondrial con cero impacto en sóleo/Aquiles. Sesión de fuerza para cadena posterior.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.0,
  },
};

export const HALF_MARATHON_21K_MODEL: CuratedTrainingModel = {
  ...MARATHON_42K_MODEL,
  modelId: "HALF_MARATHON_21K",
  displayName: "PULSE 21K Half-Marathon Elite (Daniels + Magness)",
  targetDistanceKm: 21.1,
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
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 14, maxLongRunMinutes: 80, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 18, maxLongRunMinutes: 95, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 22, maxLongRunMinutes: 110, tssScaleFactor: 1.10 },
  },
};

