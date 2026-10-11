import { CuratedTrainingModel } from "./types";
import { RUN_TEST_5K_VAM } from "./testingProtocols";
import { ALL_RUNNING_AEROBIC_WORKOUTS } from "./workoutPools/runningAerobicPool";

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
          name: "Carrera Continua Ágil + 6 Rectas Progresivas (40m)",
          powerTarget: "72% CP + Rectas @ 108% CP",
          justification: "Estimula la cadencia rápida sin fatiga.",
          workoutDoc: "Calentamiento\n- 10m 65% FTP\n\nCarrera Continua\n- 20m 72% FTP\n\nRectas de Activación\n6x\n- 20s 108% FTP\n- 40s 55% FTP\n\nEnfriamiento\n- 5m 60% FTP",
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
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
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
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
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
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
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
