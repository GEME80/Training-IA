import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9, RUN_TEST_5K_VAM } from "./testingProtocols";

/**
 * 1. Base Aeróbica y Preparación General (GPP) — Seiler 80/20 + Attia
 */
export const BASE_GPP_MODEL: CuratedTrainingModel = {
  modelId: "BASE_GPP",
  sportCategory: "General",
  displayName: "PULSE Base Aeróbica y Preparación General",
  scientificAuthors: [
    "Dr. Stephen Seiler (Polarized Training 80/20 & Zone 2)",
    "Dr. Peter Attia (Mitochondrial Health & Connective Tissue Durability)",
  ],
  description:
    "Construye una base aeróbica sólida, fortalece tendones y articulaciones, y prepara el cuerpo antes de un plan específico de competición.",
  targetDistanceKm: 16,
  periodizationStyle: "Periodización Polarizada Continua 2:1 Preventiva",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Mitocondrial y Capilarización",
      percentageDuration: 0.60,
      focusDescription: "80% del tiempo en Zona 2 cómoda y conversacional, fortaleciendo el sóleo y tendón de Aquiles.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Tirada suave y progresiva de 60 a 90 min en Zona 2 pura (68-74% CP).",
      recommendedIntensityZones: ["Zona 2 Cómoda", "Cuestas Cortas de Fuerza"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Fuerza en Subida y Potencia Aeróbica",
      percentageDuration: 0.40,
      focusDescription: "Añadir cuestas cortas y tramos de ritmo alegre sin acumular fatiga excesiva.",
      weeklyTssRange: { min: 280, max: 370 },
      longRunGuideline: "Tiradas de 75 a 105 min con sensaciones ligeras.",
      recommendedIntensityZones: ["Cuestas de Potencia (95% CP)", "Rodaje Z2"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Consolidación de la Base",
      percentageDuration: 0.0,
      focusDescription: "Fase de consolidación continua.",
      weeklyTssRange: { min: 280, max: 360 },
      longRunGuideline: "Fondo cómodo de 90 min.",
      recommendedIntensityZones: ["Zona 2"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Asimilación",
      percentageDuration: 0.0,
      focusDescription: "Asimilación 2:1.",
      weeklyTssRange: { min: 180, max: 240 },
      longRunGuideline: "Rodaje suave de 50 min.",
      recommendedIntensityZones: ["Regenerativo"],
    },
  ],
  mandatoryTests: [{ ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 }],
  longRunRules: {
    startKm: 10,
    peakKm: 18,
    startMinutes: 55,
    peakMinutes: 100,
    targetIntensityPercentCpOrFtp: "68-74% CP (Zona 2 conversacional)",
    description: "Progresión suave de 10 km a 18 km sin exigencia de ritmos rápidos.",
    taperKmSequence: [10, 7],
    taperMinutesSequence: [55, 40],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Cuestas Cortas para Fuerza y Técnica (45m)",
          powerTarget: "95% CP en cuesta",
          justification: "Fortalece los tobillos y la impulsión sin impacto lesivo.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nCuestas Cortas con Bajada al Trote\n6x\n- 40s 95% FTP\n- 1m20s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Rodaje Progresivo Cómodo con 5 Rectas (50m)",
          powerTarget: "72% CP + Rectas @ 105% CP",
          justification: "Aporta chispa y reactividad al pie.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nRodaje Continuo\n- 30m 72% FTP\n\nRectas de Activación\n5x\n- 20s 105% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
        },
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Volumen Aeróbico (55m)",
        powerTarget: "62% FTP",
        justification: "Suma minutos de trabajo aeróbico sin impacto en articulaciones.",
        workoutDoc: "Pedaleo Suave Continuo\n- 55m 62% FTP",
        durationMin: 55,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Suave Regenerativo (40m)",
        powerTarget: "66% CP",
        justification: "Favorece la recuperación activa.",
        workoutDoc: "Trote Muy Cómodo\n- 40m 66% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Funcional de Piernas, Sóleo y Core",
        focus: "Sóleo, Tobillo y Abdomen",
        justification: "Acondiciona tendones para absorber el volumen futuro.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 15m Elevaciones de sóleo, sentadillas y planchas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.90, peakTssRatio: 1.22, recoveryDropPercent: 0.25, weeklyLoadStepTss: 10 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 60, recommendedStrengthSessionsPerWeek: 2, notes: "Fuerza y bici para base sólida." },
  banisterRampRateLimits: { minCtlPerWeek: 1.0, maxCtlPerWeek: 2.5 },
};

/**
 * 2. Construcción de Fuerza y Potencia General (Build Sin Carrera)
 */
export const GENERAL_BUILD_MODEL: CuratedTrainingModel = {
  modelId: "GENERAL_BUILD",
  sportCategory: "Running",
  displayName: "PULSE Construcción de Fuerza y Potencia (Sin Carrera)",
  scientificAuthors: ["Jack Daniels", "Pete Pfitzinger"],
  description: "Para ponerse más fuerte, rápido y resistente en temporada media sin el estrés de una competición específica.",
  targetDistanceKm: 18,
  periodizationStyle: "Periodización por Bloques Progresivos 3:1",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Acondicionamiento y Umbral Progresivo",
      percentageDuration: 0.40,
      focusDescription: "Elevar la velocidad de crucero con series de umbral suaves.",
      weeklyTssRange: { min: 280, max: 380 },
      longRunGuideline: "Tiradas de 12 a 15 km en Zona 2.",
      recommendedIntensityZones: ["Series de Umbral Suave (95% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia y Resistencia de Ritmo",
      percentageDuration: 0.60,
      focusDescription: "Intervalos de 1.000m y cuestas largas para consolidar la potencia.",
      weeklyTssRange: { min: 360, max: 460 },
      longRunGuideline: "Tiradas de 15 a 18 km con tramos a ritmo alegre.",
      recommendedIntensityZones: ["Series de Potencia (100% CP)"],
    },
    { phaseKey: "PEAK", phaseName: "Consolidación", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 300, max: 400 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "TAPER", phaseName: "Descarga", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 200, max: 280 }, longRunGuideline: "", recommendedIntensityZones: [] },
  ],
  mandatoryTests: [{ ...RUN_TEST_STRYD_3_9, recommendedWeekIndex: 2 }, { ...RUN_TEST_5K_VAM, recommendedWeekIndex: 6 }],
  longRunRules: {
    startKm: 12,
    peakKm: 18,
    startMinutes: 65,
    peakMinutes: 100,
    targetIntensityPercentCpOrFtp: "70-76% CP en base con tramos de 85% CP",
    description: "Progresión controlada hasta 18 km.",
    taperKmSequence: [12, 8],
    taperMinutesSequence: [65, 45],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Bloques de Umbral Cómodo (3x 8m)",
          powerTarget: "95% CP",
          justification: "Eleva el umbral de crucero sin generar agotamiento.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nBloques de Umbral\n3x\n- 8m 95% FTP\n- 2m30s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Series de 1.000m de Potencia de Ritmo (4x 1.000m)",
          powerTarget: "100% CP",
          justification: "Mejora la soltura para correr a ritmos rápidos.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries de 1000m\n4x\n- 1000mtr 100% FTP\n- 2m 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo (50m)",
        powerTarget: "62% FTP",
        justification: "Descarga de impacto.",
        workoutDoc: "Pedaleo Suave\n- 50m 62% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Rodaje Suave de Asimilación (40m)",
        powerTarget: "68% CP",
        justification: "Oxigena la musculatura.",
        workoutDoc: "Rodaje Continuo\n- 40m 68% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Funcional y Resistencia Muscular",
        focus: "Piernas y Core",
        justification: "Mantiene la estabilidad y fuerza general.",
        workoutDoc: "Movilidad\n- 5m\n\nFuerza\n- 15m Sentadillas, zancadas y planchas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.88, peakTssRatio: 1.28, recoveryDropPercent: 0.26, weeklyLoadStepTss: 12 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 60, recommendedStrengthSessionsPerWeek: 1, notes: "Fuerza y bici complementarias." },
  banisterRampRateLimits: { minCtlPerWeek: 1.2, maxCtlPerWeek: 3.0 },
};

/**
 * 3. Optimización de Zancada y Velocidad (Speed & Biomechanics Block)
 */
export const SPEED_BLOCK_MODEL: CuratedTrainingModel = {
  modelId: "SPEED_BLOCK",
  sportCategory: "Running",
  displayName: "PULSE Optimización de Zancada y Velocidad",
  scientificAuthors: ["Dr. Véronique Billat", "Jack Daniels"],
  description: "Bloque de 4 a 6 semanas para ganar ligereza, zancada eficiente, cadencia rápida y potencia neuromuscular.",
  targetDistanceKm: 12,
  periodizationStyle: "Periodización Ondulada de Alta Frecuencia y Bajo Volumen",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Técnica, Cadencia y Rectas",
      percentageDuration: 0.50,
      focusDescription: "Mejorar la cadencia (175-185 ppm) y la reactividad elástica del pie.",
      weeklyTssRange: { min: 200, max: 270 },
      longRunGuideline: "Tirada corta de 8 a 10 km con rectas de zancada.",
      recommendedIntensityZones: ["Rectas de Zancada (105-110% CP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Micro-Intervalos y Potencia Rápida",
      percentageDuration: 0.50,
      focusDescription: "Intervalos cortos de 200m a 400m para correr con fluidez a ritmos vivos.",
      weeklyTssRange: { min: 240, max: 310 },
      longRunGuideline: "Tirada ágil de 10 a 12 km.",
      recommendedIntensityZones: ["Series Cortas de Velocidad (108% CP)"],
    },
    { phaseKey: "PEAK", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 200, max: 260 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "TAPER", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 140, max: 200 }, longRunGuideline: "", recommendedIntensityZones: [] },
  ],
  mandatoryTests: [{ ...RUN_TEST_5K_VAM, recommendedWeekIndex: 2 }],
  longRunRules: {
    startKm: 8,
    peakKm: 12,
    startMinutes: 45,
    peakMinutes: 65,
    targetIntensityPercentCpOrFtp: "70-76% CP con rectas progresivas",
    description: "Tiradas cortas y ágiles para no perder frescura neuromuscular.",
    taperKmSequence: [8, 5],
    taperMinutesSequence: [45, 30],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Rodaje Ágil + 6 Rectas Progresivas (40m)",
          powerTarget: "72% CP + Rectas @ 108% CP",
          justification: "Estimula la cadencia rápida sin fatiga.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nRodaje Continuo\n- 20m 72% FTP\n\nRectas de Activación\n6x\n- 20s 108% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
        },
      ],
      build: [
        {
          name: "Micro-Series de Velocidad (8x 300m rápidos)",
          powerTarget: "108% CP",
          justification: "Enseña a correr rápido con postura relajada y eficiente.",
          workoutDoc: "Calentamiento\n- 15m 68% FTP\n\nSeries de 300m\n8x\n- 50s 108% FTP\n- 1m15s 55% FTP\n\nEnfriamiento\n- 10m 60% FTP",
        },
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave Regenerativo (45m)",
        powerTarget: "60% FTP",
        justification: "Soltura de piernas.",
        workoutDoc: "Pedaleo Ágil\n- 45m 60% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Suave Relajado (30m)",
        powerTarget: "65% CP",
        justification: "Recuperación ligera.",
        workoutDoc: "Trote Continuo\n- 30m 65% FTP",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Pliometría Suave y Fuerza Reactiva de Tobillos",
        focus: "Tobillo, Sóleo y Gemelo",
        justification: "Aporta muelle y reactividad al apoyar el pie.",
        workoutDoc: "Movilidad\n- 5m\n\nPliometría y Saltos Controlados\n- 15m Saltos a la comba, escalón y elevaciones rápidas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.85, peakTssRatio: 1.20, recoveryDropPercent: 0.22, weeklyLoadStepTss: 8 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 45, recommendedStrengthSessionsPerWeek: 1, notes: "Fuerza reactiva y bici de soltura." },
  banisterRampRateLimits: { minCtlPerWeek: 0.8, maxCtlPerWeek: 2.0 },
};

/**
 * 4. Recuperación Post-Competición (Post-Race Deload)
 */
export const POST_RACE_DELOAD_MODEL: CuratedTrainingModel = {
  modelId: "POST_RACE_DELOAD",
  sportCategory: "General",
  displayName: "PULSE Recuperación Post-Competición",
  scientificAuthors: ["Pete Pfitzinger", "Joe Friel"],
  description: "Bloque de 2 a 4 semanas para reparar tejidos, restaurar la energía y descansar la mente tras una carrera exigente.",
  targetDistanceKm: 8,
  periodizationStyle: "Descarga y Regeneración Biológica Progresiva",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Regeneración Celular y Cero Impacto",
      percentageDuration: 1.0,
      focusDescription: "Paseos, bicicleta muy suave, movilidad y reintroducción de trotes cortos sin prisa.",
      weeklyTssRange: { min: 100, max: 180 },
      longRunGuideline: "Paseo activo o salida suave de 35 a 45 min en bicicleta.",
      recommendedIntensityZones: ["Zona 1 Regenerativo (<60% FTP/CP)"],
    },
    { phaseKey: "BUILD", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 100, max: 180 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "PEAK", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 100, max: 180 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "TAPER", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 100, max: 180 }, longRunGuideline: "", recommendedIntensityZones: [] },
  ],
  mandatoryTests: [],
  longRunRules: {
    startKm: 5,
    peakKm: 8,
    startMinutes: 30,
    peakMinutes: 45,
    targetIntensityPercentCpOrFtp: "60-65% CP (Trote muy suave y relajado)",
    description: "Caminar o trotar muy suave según sensaciones.",
    taperKmSequence: [6, 5],
    taperMinutesSequence: [35, 30],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Paseo Activo o Trote Regenerativo Muy Corto (30m)",
          powerTarget: "60% CP",
          justification: "Activa la circulación y reduce la rigidez sin estresar el cuerpo.",
          workoutDoc: "Regenerativo Suave\n- 30m 60% FTP con total libertad de caminar si hay rigidez",
        },
      ],
      build: [],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Suave de Paseo (40m)",
        powerTarget: "50% FTP",
        justification: "Mueve las piernas con cero impacto articular.",
        workoutDoc: "Pedaleo Muy Relajado\n- 40m 50% FTP",
        durationMin: 40,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Movilidad Articular y Estiramientos Suaves (30m)",
        powerTarget: "RPE 1-2 Muy Ligero",
        justification: "Restaura el rango articular y relaja la fascia muscular.",
        workoutDoc: "Movilidad y Respiración\n- 30m Estiramientos suaves, foam roller y paseos",
        durationMin: 30,
      },
    ],
    strengthWorkouts: [
      {
        name: "Movilidad de Cadera y Espalda",
        focus: "Espalda, Caderas y Relajación",
        justification: "Alivia tensiones posturales.",
        workoutDoc: "Movilidad Suave\n- 20m Yoga suave, estiramientos de glúteo y respiración",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.60, peakTssRatio: 0.85, recoveryDropPercent: 0.15, weeklyLoadStepTss: 5 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 60, recommendedStrengthSessionsPerWeek: 1, notes: "Solo movilidad y bici suave." },
  banisterRampRateLimits: { minCtlPerWeek: -2.0, maxCtlPerWeek: 1.0 },
};

/**
 * 5. Retorno Seguro / Reacondicionamiento Mecánico (CaCo / Tim Gabbett)
 */
export const INJURY_REHAB_MODEL: CuratedTrainingModel = {
  modelId: "INJURY_REHAB",
  sportCategory: "General",
  displayName: "PULSE Retorno Seguro / Reacondicionamiento",
  scientificAuthors: ["Tim Gabbett (Acute:Chronic Workload Ratio)", "Dr. Jill Cook (Tendinopathy Protocols)"],
  description: "Protocolo progresivo de Caminar-Correr (CaCo) para volver a la actividad con seguridad tras molestias o lesiones.",
  targetDistanceKm: 10,
  periodizationStyle: "Progresión de Carga Mecánica Controlada por Sensaciones",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Caminar-Correr (CaCo) y Fuerza Isométrica",
      percentageDuration: 0.70,
      focusDescription: "Intervalos de caminar y trotar muy suave para adaptar huesos y tendones al impacto.",
      weeklyTssRange: { min: 140, max: 220 },
      longRunGuideline: "CaCo suave de 40 a 55 min alternando trote y caminata.",
      recommendedIntensityZones: ["CaCo (Caminar-Correr)", "Fuerza Isométrica"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Consolidación de Carrera Continua",
      percentageDuration: 0.30,
      focusDescription: "Aumentar el tiempo de carrera continua siempre que no haya molestias en las 24 horas siguientes.",
      weeklyTssRange: { min: 200, max: 280 },
      longRunGuideline: "Trote continuo de 45 a 55 min en terreno blando.",
      recommendedIntensityZones: ["Trote Suave Z1-Z2"],
    },
    { phaseKey: "PEAK", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 200, max: 260 }, longRunGuideline: "", recommendedIntensityZones: [] },
    { phaseKey: "TAPER", phaseName: "", percentageDuration: 0.0, focusDescription: "", weeklyTssRange: { min: 140, max: 200 }, longRunGuideline: "", recommendedIntensityZones: [] },
  ],
  mandatoryTests: [],
  longRunRules: {
    startKm: 6,
    peakKm: 10,
    startMinutes: 40,
    peakMinutes: 55,
    targetIntensityPercentCpOrFtp: "60-68% CP en intervalos de trote",
    description: "Método CaCo con incrementos graduales menores al 10% semanal.",
    taperKmSequence: [6, 4],
    taperMinutesSequence: [35, 25],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Sesión CaCo (5x 3m Trote Suave + 2m Caminata)",
          powerTarget: "65% CP en trote",
          justification: "Reeduca la absorción de impactos con pausas de descarga articular.",
          workoutDoc: "Calentamiento\n- 5m Caminata Rápida\n\nBloque CaCo\n5x\n- 3m Trote Suave 65% FTP\n- 2m Caminata Relajada\n\nEnfriamiento\n- 5m Caminata Suave",
        },
      ],
      build: [
        {
          name: "Trote Continuo Progresivo en Superficie Blanda (40m)",
          powerTarget: "68% CP",
          justification: "Consolida la tolerancia al impacto continuo.",
          workoutDoc: "Caminata\n- 5m Calentamiento\n\nTrote Cómodo\n- 30m 68% FTP en césped o tierra\n\nCaminata\n- 5m Enfriamiento",
        },
      ],
      peak: [],
      taper: [],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 para Mantener la Forma (50m)",
        powerTarget: "62% FTP",
        justification: "Mantiene la capacidad cardiovascular sin impacto en la zona lesionada.",
        workoutDoc: "Pedaleo Cómodo\n- 50m 62% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Caminata Ágil al Aire Libre (40m)",
        powerTarget: "Caminata Activa",
        justification: "Moviliza la circulación con mínimo estrés.",
        workoutDoc: "Caminata Continua\n- 40m Paso Firme y Cómodo",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Isométrica y Excéntrica para Tendones",
        focus: "Sóleo, Aquiles y Glúteo Medio",
        justification: "Aumenta la capacidad de carga del tejido conectivo.",
        workoutDoc: "Fuerza Isométrica\n- 20m Elevaciones de sóleo en escalón (aguantar 5s arriba), puentes de glúteo y planchas",
      },
    ],
  },
  tssProgressionRules: { startTssRatio: 0.70, peakTssRatio: 1.05, recoveryDropPercent: 0.20, weeklyLoadStepTss: 6 },
  crossTrainingRules: { recommendedBikeZ2WeeklyMin: 90, recommendedStrengthSessionsPerWeek: 2, notes: "Bicicleta para fitness y fuerza isométrica." },
  banisterRampRateLimits: { minCtlPerWeek: 0.5, maxCtlPerWeek: 1.8 },
};
