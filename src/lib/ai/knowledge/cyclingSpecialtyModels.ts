import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, BIKE_TEST_RAMP } from "./testingProtocols";

/**
 * Modelo Científico para Ciclismo — Escalada y Puertos (Hunter Allen)
 */
export const CYCLING_CLIMBING_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_CLIMBING",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Escalada y Puertos",
  scientificAuthors: [
    "Hunter Allen (Power Training for Climbing & Over-Unders)",
    "Dr. Andrew Coggan (Watts per Kilogram W/kg Optimization)",
  ],
  description:
    "Especializado en desarrollar fuerza resistente y potencia sostenida en subidas largas, puertos de montaña y desniveles.",
  targetDistanceKm: 90,
  periodizationStyle: "Periodización por Bloques de Resistencia a la Fatiga en Subida (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Fuerza de Pedaleo",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar fondo cardiovascular y eficiencia de pedaleo a cadencia media en terreno ondulado.",
      weeklyTssRange: { min: 320, max: 440 },
      longRunGuideline: "Salida de 2h30m a 3h30m en terreno con repechos suaves en Zona 2.",
      recommendedIntensityZones: ["Zona 2 Cómoda (60-70% FTP)", "Repechos Suaves"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Fuerza en Subida y Umbral en Puerto",
      percentageDuration: 0.40,
      focusDescription: "Subidas de 10 a 20 minutos a ritmo de umbral y series de fuerza a baja cadencia (55-65 rpm).",
      weeklyTssRange: { min: 420, max: 560 },
      longRunGuideline: "Salidas de montaña de 3h30m a 4h30m con varios puertos continuos.",
      recommendedIntensityZones: ["Subidas a Umbral (95-102% FTP)", "Fuerza y Cadencia Baja"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Puertos y Over-Unders",
      percentageDuration: 0.15,
      focusDescription: "Intervalos Over-Under para aprender a cambiar de ritmo en las rampas más empinadas.",
      weeklyTssRange: { min: 450, max: 580 },
      longRunGuideline: "Fondo de montaña de 4h a 5h simulando el desnivel del evento.",
      recommendedIntensityZones: ["Over-Unders (95%/105% FTP)", "Ritmo de Ascensión"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto y Frescura Muscular",
      percentageDuration: 0.10,
      focusDescription: "Llegar con las piernas ligeras y llenas de energía.",
      weeklyTssRange: { min: 200, max: 300 },
      longRunGuideline: "Salida suave de 1h45m a 2h15m con aceleraciones cortas.",
      recommendedIntensityZones: ["Activación Suave", "Pedaleo Ágil"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 7 },
  ],
  longRunRules: {
    startKm: 50,
    peakKm: 130,
    startMinutes: 120,
    peakMinutes: 270,
    targetIntensityPercentCpOrFtp: "65-75% FTP en llano y 85-95% FTP en ascensiones",
    description: "Progresión de 2h a 4h30m con incremento de puertos y metros de desnivel con 2 semanas de tapering.",
    taperKmSequence: [75, 45],
    taperMinutesSequence: [150, 90],
  },
  maxLongRunMinutesCap: 270,
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 65, maxLongRunMinutes: 150, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 100, maxLongRunMinutes: 210, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 130, maxLongRunMinutes: 270, tssScaleFactor: 1.10 },
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 85,
    triggerMinWKgThreshold: 3.0,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Ajuste de desarrollo y piñonera para mantener cadencia >75 rpm en rampas >8% y evitar sobrecarga patelar.",
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_hydrotherapy_strength"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Series de Fuerza en Subida a Cadencia Controlada (3x 8m)",
          powerTarget: "85% FTP a 60 rpm",
          justification: "Fortalece los cuádriceps y glúteos para empujar vatios en rampas duras.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nSubidas de Fuerza (60 rpm)\n3x\n- 8m 85% FTP\n- 4m 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      build: [
        {
          name: "Ascensiones Continuas a Ritmo de Umbral (3x 12m)",
          powerTarget: "98% FTP",
          justification: "Enseña a mantener un ritmo fuerte y constante durante subidas largas.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nPuertos de Umbral\n3x\n- 12m 98% FTP\n- 5m 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      peak: [
        {
          name: "Over-Unders en Subida para Cambio de Pendiente (4x 9m)",
          powerTarget: "95% / 105% FTP alternado",
          justification: "Aumenta la tolerancia cuando la pendiente se empina bruscamente.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nBloques Over-Under\n4x (9m)\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 4m 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Suave con Toques de Ritmo (40m)",
          powerTarget: "95% FTP en toques",
          justification: "Despertar neuromuscular sin acumular fatiga residual.",
          workoutDoc: "Calentamiento\n- 15m 50% FTP\n\nToques de Ritmo\n3x\n- 1m30s 95% FTP\n- 2m 50% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Pedaleo Suave Regenerativo y Cadencia Ágil (45m)",
        powerTarget: "60% FTP",
        justification: "Suaviza las piernas y favorece la asimilación del esfuerzo.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Cómodo\n- 25m 60% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Rodaje Muy Suave de Recuperación (35m)",
        powerTarget: "52% FTP",
        justification: "Mueve las piernas con mínimo estrés.",
        workoutDoc: "Pedaleo Suave\n- 35m 52% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza de Core y Estabilidad Lumbar para Subidas",
        focus: "Zona Lumbar, Glúteos y Abdomen",
        justification: "Mantiene la posición firme en el sillín y evita sobrecargas lumbares.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nFuerza Funcional\n- 20m Planchas, puentes de cadera y sentadillas isométricas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.35,
    recoveryDropPercent: 0.28,
    weeklyLoadStepTss: 15,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 2,
    notes: "Fuerza de glúteos y lumbares para proteger la espalda en ascensiones duras.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.8,
    maxCtlPerWeek: 4.2,
  },
};

/**
 * Modelo Científico para Ciclismo — Potencia y Cambios de Ritmo (Coggan)
 */
export const CYCLING_CRITERIUM_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_CRITERIUM",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Potencia y Cambios de Ritmo",
  scientificAuthors: [
    "Dr. Andrew Coggan (Anaerobic Capacity & Sprints)",
    "Joe Friel (Crit Power & Micro-Intervals)",
  ],
  description:
    "Enfocado en aceleraciones explosivas, arrancadas tras curvas y alta potencia en esfuerzos de 1 a 3 minutos.",
  targetDistanceKm: 70,
  periodizationStyle: "Periodización Dinámica con Énfasis en Capacidad Anaeróbica y Potencia Rápida (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Cadencia Rápida",
      percentageDuration: 0.35,
      focusDescription: "Desarrollar una base de pedaleo ágil (95-105 rpm) y buena resistencia cardiovascular.",
      weeklyTssRange: { min: 280, max: 380 },
      longRunGuideline: "Salida continua de 2h a 3h en Zona 2.",
      recommendedIntensityZones: ["Zona 2 (60-70% FTP)", "Aceleraciones Cortas"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Ataque e Intervalos Cortos",
      percentageDuration: 0.40,
      focusDescription: "Series de 1 a 3 minutos a potencia muy viva para responder a cambios de ritmo.",
      weeklyTssRange: { min: 380, max: 490 },
      longRunGuideline: "Salidas de 2h30m a 3h30m con arrancadas de velocidad.",
      recommendedIntensityZones: ["Series de Potencia (115-130% FTP)", "Sweetspot Dinámico"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Ritmo Vivo y Sprints",
      percentageDuration: 0.15,
      focusDescription: "Simulación de salidas rápidas de curvas y aceleraciones repetidas.",
      weeklyTssRange: { min: 400, max: 500 },
      longRunGuideline: "Salida rápida de 2h30m con bloques continuos de cambios de ritmo.",
      recommendedIntensityZones: ["Sprints Repetidos (130-150% FTP)"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Puesta a Punto Rápida",
      percentageDuration: 0.10,
      focusDescription: "Máxima frescura y reactividad en las piernas.",
      weeklyTssRange: { min: 180, max: 260 },
      longRunGuideline: "Salida ligera de 1h30m con 3 aceleraciones de 20 segundos.",
      recommendedIntensityZones: ["Activación Corta", "Pedaleo Suave"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 6 },
  ],
  longRunRules: {
    startKm: 45,
    peakKm: 95,
    startMinutes: 105,
    peakMinutes: 210,
    targetIntensityPercentCpOrFtp: "65-72% FTP con aceleraciones de 120-130% FTP",
    description: "Salidas de 1h45m a 3h30m con arrancadas dinámicas y 1 semana de tapering.",
    taperKmSequence: [50],
    taperMinutesSequence: [100],
  },
  maxLongRunMinutesCap: 210,
  taperingRules: {
    taperingWeeks: 1,
    volumeDropSequencePercent: [0.35],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 50, maxLongRunMinutes: 120, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 75, maxLongRunMinutes: 165, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 95, maxLongRunMinutes: 210, tssScaleFactor: 1.10 },
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab"],
  recommendedCrossTrainingModelIds: ["cross_bike_hiit_vo2", "water_regenerative_aqua_run"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Rodaje Ágil con Aceleraciones de Cadencia (50m)",
          powerTarget: "70% FTP + Aceleraciones @ 110% FTP",
          justification: "Mejora la velocidad de pedaleo sin fatigar en exceso.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nRodaje Principal\n- 20m 70% FTP\n\nAceleraciones\n5x\n- 30s 110% FTP (100+ rpm)\n- 1m30s 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      build: [
        {
          name: "Micro-Intervalos de Ataque (40s a fondo / 20s suave)",
          powerTarget: "125% FTP en ataques",
          justification: "Entrena la capacidad de responder a tirones de ritmo y recuperar pedaleando.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nBloque 1 (6x 40s/20s)\n6x\n- 40s 125% FTP\n- 20s 50% FTP\n\nRecuperación\n- 5m 50% FTP\n\nBloque 2 (6x 40s/20s)\n6x\n- 40s 125% FTP\n- 20s 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      peak: [
        {
          name: "Simulación de Cambios de Ritmo Repetidos (1h00m)",
          powerTarget: "120% FTP en arrancadas",
          justification: "Ajusta la respuesta rápida y la confianza para acelerar.",
          workoutDoc: "Calentamiento\n- 15m 55% FTP\n\nSeries de 2 Minutos Fuertes\n5x\n- 2m 115% FTP\n- 2m 50% FTP\n\nEnfriamiento\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Rápida con 3 Sprints Cortos (35m)",
          powerTarget: "130% FTP en sprints",
          justification: "Prepara la respuesta neuromuscular para el evento.",
          workoutDoc: "Calentamiento\n- 15m 50% FTP\n\nSprints Cortos\n3x\n- 15s 130% FTP\n- 2m 45% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Pedaleo Suave de Soltura (45m)",
        powerTarget: "60% FTP",
        justification: "Oxigena las piernas sin generar cansancio residual.",
        workoutDoc: "Calentamiento\n- 10m 50% FTP\n\nPedaleo Suave\n- 25m 60% FTP\n\nEnfriamiento\n- 10m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Recuperación Activa en Bicicleta (35m)",
        powerTarget: "50% FTP",
        justification: "Favorece el descanso muscular.",
        workoutDoc: "Pedaleo Relajado\n- 35m 50% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Explosiva y Potencia de Piernas",
        focus: "Cuádriceps, Isquiotibiales y Core",
        justification: "Aporta chispa y fuerza en cada arrancada.",
        workoutDoc: "Movilidad\n- 5m Articular\n\nPotencia y Saltos Suaves\n- 15m Sentadillas con salto controlado, zancadas dinámicas y planchas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.85,
    peakTssRatio: 1.30,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 12,
  },
  crossTrainingRules: {
    recommendedStrengthSessionsPerWeek: 2,
    notes: "Fuerza explosiva y estabilizadores para soportar arrancadas fuertes.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 1.5,
    maxCtlPerWeek: 3.8,
  },
};
