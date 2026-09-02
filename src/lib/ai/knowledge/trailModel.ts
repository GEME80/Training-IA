import { CuratedTrainingModel } from "./types";
import { RUN_TEST_20M_TT, RUN_TEST_STRYD_3_9 } from "./testingProtocols";

export const TRAIL_ULTRA_MODEL: CuratedTrainingModel = {
  modelId: "TRAIL_ULTRA",
  sportCategory: "Trail",
  displayName: "PULSE Trail & Ultra Endurance Architecture (Jason Koop + Kilian Jornet)",
  scientificAuthors: [
    "Jason Koop (Training Essentials for Ultrarunning)",
    "Kilian Jornet (Training Principles & High Volume Mountain Physiology)",
  ],
  description:
    "Modelo para carreras por montaña y ultra resistencia. Estructura el entrenamiento por tiempo, desnivel positivo (D+) y resistencia excéntrica.",
  targetDistanceKm: 50,
  periodizationStyle: "Periodización por Bloques de Desnivel y Resistencia Muscular",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Volumen Aeróbico por Tiempo & Adaptación D+",
      percentageDuration: 0.40,
      focusDescription: "Desarrollo mitocondrial en terreno mixto, caminata activa en subida (Power Hiking) y fortalecimiento del sóleo.",
      weeklyTssRange: { min: 320, max: 420 },
      longRunGuideline: "Tiradas por montaña de 1h45m a 2h30m a ritmo cómodo Z1-Z2 con 500-1000m D+.",
      recommendedIntensityZones: ["Z2 Carrera Continua", "Caminata Eficiente Cuestas", "Ciclismo Z2 Cruzado"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Fuerza Específica en Cuestas & Descensos Excéntricos",
      percentageDuration: 0.35,
      focusDescription: "Intervalos en subida prolongada (Uphill Tempo), fuerza excéntrica en bajada y resistencia neuromuscular.",
      weeklyTssRange: { min: 420, max: 540 },
      longRunGuideline: "Tiradas largas de 2h30m a 3h30m en terreno técnico con 1000-1800m D+.",
      recommendedIntensityZones: ["Uphill Threshold", "Downhill Technique", "Back-to-Back Weekend Runs"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Carrera & Bloques Específicos",
      percentageDuration: 0.15,
      focusDescription: "Fondos dobles de fin de semana simulando el perfil de elevación y nutrición de carrera.",
      weeklyTssRange: { min: 450, max: 550 },
      longRunGuideline: "Tiradas clave de 3h45m a 4h30m en montaña con mochila de hidratación y bastones.",
      recommendedIntensityZones: ["Simulación Ultra", "Z2 Terreno Técnico"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Descarga Articular & Frescura",
      percentageDuration: 0.10,
      focusDescription: "Reducción sustancial de impacto y desnivel para restaurar ligamentos y tendones.",
      weeklyTssRange: { min: 200, max: 280 },
      longRunGuideline: "Rodajes suaves de 45-60m en terreno llano o blando.",
      recommendedIntensityZones: ["Rodaje Regenerativo", "Movilidad Articular"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, testName: "Test Stryd CP en Cuesta (3/9m)", recommendedWeekIndex: 2 },
    { ...RUN_TEST_20M_TT, testName: "Test 20m en Subida Continua", recommendedWeekIndex: 8 },
  ],
  longRunRules: {
    startKm: 14,
    peakKm: 36,
    startMinutes: 90,
    peakMinutes: 240,
    targetIntensityPercentCpOrFtp: "65-75% CP / RPE 4-6 en subidas",
    description: "Progresión por tiempo y desnivel desde 1h30m (+500m) hasta 4h00m (+1700m D+) con 3 semanas de tapering.",
    taperKmSequence: [20, 12, 6],
    taperMinutesSequence: [120, 75, 45],
  },
  maxLongRunMinutesCap: 240,
  taperingRules: {
    taperingWeeks: 3,
    volumeDropSequencePercent: [0.20, 0.45, 0.65],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 30, maxLongRunKm: 18, maxLongRunMinutes: 135, tssScaleFactor: 0.80 },
    INTERMEDIATE: { ctlThresholdMax: 60, maxLongRunKm: 28, maxLongRunMinutes: 180, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 36, maxLongRunMinutes: 240, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_downhill_eccentric", "strength_spring_ankle_soleus", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Fartlek de Cuestas y Power Hiking (50m)",
          powerTarget: "95% CP en subida",
          justification: "Reclutamiento de potencia de piernas y zancada corta eficiente.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n6x\n- 1m 95% FTP (Subida)\n- 1m30s 55% FTP (Bajada suave)\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      build: [
        {
          name: "Intervalos de Umbral en Subida Continua (3x8m @ 98% CP)",
          powerTarget: "98% CP",
          justification: "Capacidad glucolítica y potencia sostenible en desniveles prolongados.",
          workoutDoc: "Warmup\n- 15m 68% FTP\n\n3x (Cuesta Continua)\n- 8m 98% FTP\n- 3m 50% FTP (Trote regreso)\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Ritmo de Trail con Cambios de Pendiente (1h15m)",
          powerTarget: "75-85% CP",
          justification: "Gestión de esfuerzo y transición entre trote y caminata con bastones.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\nMain (Terreno Mixto)\n- 45m 80% FTP\n\nCooldown\n- 15m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Rodaje Suave en Llano con Strides (35m)",
          powerTarget: "70% CP",
          justification: "Soltura articular sin carga excéntrica.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 20m 70% FTP\n\nCooldown\n- 5m 60% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo sin Impacto (55m)",
        powerTarget: "60% FTP",
        justification: "Volumen cardiovascular protegiendo rodillas y tobillos de los descensos.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 35m 60% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 55,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Trote Regenerativo en Césped / Blando (40m)",
        powerTarget: "68% CP",
        justification: "Oxigenación miofascial sobre superficie amortiguada.",
        workoutDoc: "Warmup\n- 10m 60% FTP\n\nMain\n- 25m 68% FTP\n\nCooldown\n- 5m 55% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Excéntrica de Cuádriceps & Propiocepción de Tobillo",
        focus: "Cuádriceps, Tobillo y Estabilidad",
        justification: "Prevención del daño muscular inducido por las bajadas de montaña.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Sentadillas Excéntricas, Bosu & Sóleo",
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
    recommendedStrengthSessionsPerWeek: 2,
    recommendedBikeZ2WeeklyMin: 90,
    notes: "Fuerza excéntrica de cuádriceps, estabilidad de tobillo (propiocepción) y rodillo para sumar horas sin impacto.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 4.0,
  },
};
