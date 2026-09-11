import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP } from "./testingProtocols";

/**
 * Modelo Científico para Ciclismo de Fondo y Gran Fondo (Coggan + Seiler)
 */
export const CYCLING_GRAN_FONDO_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_GRAN_FONDO",
  sportCategory: "Cycling",
  displayName: "PULSE Ciclismo — Gran Fondo & Resistencia",
  scientificAuthors: [
    "Dr. Andrew Coggan (Potencia por Vatios, Zonas FTP y Sweetspot)",
    "Dr. Stephen Seiler (Entrenamiento Polarizado y Capacidad Mitocondrial)",
  ],
  description:
    "Estructurado para construir gran resistencia aeróbica, tolerancia al lactato y potencia sostenida en puertos y fondos largos.",
  targetDistanceKm: 120.0,
  periodizationStyle: "Periodización Polarizada 80/20 con Bloques de SweetSpot y Umbral (3:1)",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica y Eficiencia Mecánica",
      percentageDuration: 0.35,
      focusDescription: "Desarrollo mitocondrial en Zona 2 y optimización del pedaleo fluido (85-95 rpm).",
      weeklyTssRange: { min: 350, max: 480 },
      longRunGuideline: "Fondo de fin de semana: 2h30m a 3h30m en Zona 2 continua con cadencia ágil.",
      recommendedIntensityZones: ["Zona 2 Aeróbica (60-70% FTP)", "SweetSpot Base (85-90% FTP)"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia de Umbral Funcional (FTP)",
      percentageDuration: 0.40,
      focusDescription: "Series en SweetSpot y Umbral Anaeróbico para elevar los vatios sostenibles.",
      weeklyTssRange: { min: 460, max: 620 },
      longRunGuideline: "Fondo específico: 3h30m a 4h30m con bloques en subida a ritmo de tempo/umbral.",
      recommendedIntensityZones: ["Umbral Funcional (95-105% FTP)", "SweetSpot Extensivo (88-93% FTP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Simulación de Gran Fondo y Tolerancia Láctica",
      percentageDuration: 0.15,
      focusDescription: "Ensayos de ritmo de marcha, gestión de energía en puertos y tolerancia al esfuerzo sostenido.",
      weeklyTssRange: { min: 420, max: 560 },
      longRunGuideline: "Fondo cumbre: 4h a 5h con repechos a ritmo de carrera y nutrición programada.",
      recommendedIntensityZones: ["Ritmo de Competición (75-85% FTP)", "Over-Unders Lácticos"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Descarga, Afinamiento y Soltura",
      percentageDuration: 0.10,
      focusDescription: "Reducción exponencial del volumen manteniendo intensidad neuromuscular breve.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Fondo de puesta a punto: 1h45m a 2h suave con 3 aceleraciones cortas.",
      recommendedIntensityZones: ["Activación Corta", "Zona 1-2 Descarga"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 2 },
  ],
  longRunRules: {
    startKm: 60,
    peakKm: 130,
    startMinutes: 120,
    peakMinutes: 270,
    targetIntensityPercentCpOrFtp: "65-75% FTP en llano / 85-90% FTP en puertos",
    description: "Progresión de 2h a 4h30m de fondo continuo con semanas de descarga intermedias.",
    taperKmSequence: [80, 50],
    taperMinutesSequence: [150, 90],
  },
  maxLongRunMinutesCap: 300,
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.30, 0.55],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 75, maxLongRunMinutes: 180, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 105, maxLongRunMinutes: 225, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 135, maxLongRunMinutes: 270, tssScaleFactor: 1.10 },
  },
  biotypeCrossTrainingRule: {
    triggerWeightKgThreshold: 85,
    triggerMinWKgThreshold: 3.0,
    substituteBikeZ2WeeklyMin: 60,
    waterSessionWeeklyMin: 45,
    notes: "Optimiza la cadencia de pedaleo (90-100 rpm) para reducir tensión en rótula y ligamentos lumbares.",
  },
  recommendedStrengthModelIds: ["strength_heavy_neural", "strength_pelvic_core_prehab", "water_hydrotherapy_strength"],
  recommendedCrossTrainingModelIds: ["cross_bike_z2_mito", "water_regenerative_aqua_run", "cross_bike_hiit_vo2"],

  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Ciclismo Sweetspot Controlado (3x8m @ 85% FTP)",
          powerTarget: "85% FTP",
          justification: "Densidad mitocondrial sin fatiga excesiva.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 8m 85% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Ciclismo Tempo Aeróbico Z3 (2x15m @ 80% FTP)",
          powerTarget: "80% FTP",
          justification: "Eficiencia glucolítica moderada a ritmo submáximo.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n2x\n- 15m 80% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Ciclismo Pirámide Aeróbica Z2-Z3 (50m progresivo)",
          powerTarget: "65-85% FTP",
          justification: "Transición progresiva de fibras lentas a mixtas.",
          workoutDoc: "Warmup\n- 10m 55% FTP\n\nMain\n- 15m 70% FTP\n- 15m 80% FTP\n- 5m 85% FTP\n\nCooldown\n- 5m 50% FTP",
        },
        {
          name: "Ciclismo Cadencia Ágil & Eficiencia (45m con 4x4m a 100 rpm)",
          powerTarget: "75% FTP a 100 rpm",
          justification: "Reducción del costo neuromuscular y economía de pedaleo.",
          workoutDoc: "Warmup\n- 12m 55% FTP\n\n4x\n- 4m 75% FTP (100 rpm)\n- 2m 55% FTP (85 rpm)\n\nCooldown\n- 9m 50% FTP",
        },
        {
          name: "Ciclismo Fuerza Submáxima a Bajas Revoluciones (4x5m @ 60 rpm)",
          powerTarget: "82% FTP a 60 rpm",
          justification: "Reclutamiento de unidades motoras para puertos empinados.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n4x\n- 5m 82% FTP (60 rpm)\n- 3m 55% FTP (90 rpm)\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      build: [
        {
          name: "Series de Umbral Funcional FTP (3x12m @ 98% FTP)",
          powerTarget: "98% FTP",
          justification: "Elevación del umbral anaeróbico funcional en bicicleta.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 12m 98% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Series de Sweetspot Extensivo (3x15m @ 90% FTP)",
          powerTarget: "90% FTP",
          justification: "Aumento de la capacidad de sostener potencia alta con mínimo glucógeno.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 15m 90% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Bloques Continuos de Umbral (2x20m @ 96% FTP)",
          powerTarget: "96% FTP",
          justification: "Sostenimiento metabólico en contrarreloj y puertos prolongados.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n2x\n- 20m 96% FTP\n- 5m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Micro-Intervalos de Potencia VO2max (15x 40s/20s @ 115% FTP)",
          powerTarget: "115% FTP en picos",
          justification: "Tolerancia a cambios de ritmo en repechos de grupo.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n15x\n- 40s 115% FTP\n- 20s 50% FTP\n\nCooldown\n- 15m 50% FTP",
        },
        {
          name: "Umbral Escalonado Progresivo (4x8m @ 95-102% FTP)",
          powerTarget: "95-102% FTP",
          justification: "Capacidad de sobrepasar el umbral en tramos decisivos.",
          workoutDoc: "Warmup\n- 12m 55% FTP\n\n4x\n- 8m 98% FTP\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      peak: [
        {
          name: "Over-Unders de Tolerancia Láctica (4x9m @ 95%/105% FTP)",
          powerTarget: "95-105% FTP",
          justification: "Capacidad de aclaramiento de lactato bajo tensión de carrera.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n4x (9m Over-Under)\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 3m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Simulación de Ritmo de Gran Fondo (1h20m con 3x12m @ 88% FTP)",
          powerTarget: "88% FTP",
          justification: "Ensayo de la potencia objetivo de competición con fatiga previa.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 12m 88% FTP\n- 4m 55% FTP\n\nCooldown\n- 15m 50% FTP",
        },
        {
          name: "Ascensiones Repetidas a Potencia Pico (5x4m @ 105% FTP)",
          powerTarget: "105% FTP",
          justification: "Fuerza reactiva y chispa final para rampas decisivas.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n5x\n- 4m 105% FTP\n- 3m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
        {
          name: "Afinamiento Neuromuscular de Pelotón (50m con 4 aceleraciones)",
          powerTarget: "100-110% FTP",
          justification: "Mantenimiento del tono de contracción rápida sin acidosis.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n4x\n- 1m30s 105% FTP\n- 2m30s 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Breve con Cambios de Ritmo (40m)",
          powerTarget: "100% FTP en aceleraciones",
          justification: "Puesta a punto neuromuscular para la prueba.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n4x\n- 1m 100% FTP\n- 2m 50% FTP\n\nCooldown\n- 10m 45% FTP",
        },
        {
          name: "Pedaleo Ágil de Soltura Pre-Competición (35m a 95 rpm)",
          powerTarget: "60% FTP",
          justification: "Favorece el flujo sanguíneo y el lavado de tensiones musculares.",
          workoutDoc: "Main\n- 35m 60% FTP (95 rpm)",
        },
        {
          name: "Activación del Día Previo (30m con 3 toques de ritmo)",
          powerTarget: "60-95% FTP",
          justification: "Comprobación de la bicicleta y ajuste de sensaciones de piernas.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n3x\n- 45s 95% FTP\n- 1m15s 50% FTP\n\nCooldown\n- 8m 45% FTP",
        },
        {
          name: "Descarga Suave Regenerativa Z1 (25m)",
          powerTarget: "50% FTP",
          justification: "Recuperación biológica activa con cero costo energético.",
          workoutDoc: "Main\n- 25m 50% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo y Cadencia (50m)",
        powerTarget: "62% FTP",
        justification: "Soltura neuromuscular y lavado de fatiga.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 30m 62% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 50,
      },
      {
        name: "Ciclismo Sweetspot de Mantenimiento (45m con 2x10m @ 88% FTP)",
        powerTarget: "88% FTP",
        justification: "Estímulo aeróbico concentrado sin impacto en el descanso semanal.",
        workoutDoc: "Warmup\n- 10m 55% FTP\n\n2x\n- 10m 88% FTP\n- 3m 55% FTP\n\nCooldown\n- 9m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo de Cadencia Fluida a 100 rpm (45m)",
        powerTarget: "65% FTP",
        justification: "Mejora la eficiencia de pedaleo y la velocidad de contracción.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 65% FTP (100 rpm)\n\nCooldown\n- 10m 45% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Over-Under Suave de Aclaramiento (45m)",
        powerTarget: "80-95% FTP",
        justification: "Flexibilidad metabólica y utilización eficiente de grasas.",
        workoutDoc: "Warmup\n- 10m 55% FTP\n\n3x\n- 2m 80% FTP\n- 1m 95% FTP\n\nCooldown\n- 10m 50% FTP",
        durationMin: 45,
      },
      {
        name: "Ciclismo Progresivo de Activación (45m Z1-Z3)",
        powerTarget: "55-85% FTP",
        justification: "Despertar del sistema cardiovascular con final controlado.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 15m 65% FTP\n- 12m 82% FTP\n\nCooldown\n- 8m 45% FTP",
        durationMin: 45,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Ciclismo Suave Z1 de Recuperación (35m)",
        powerTarget: "52% FTP",
        justification: "Recuperación pasiva activa.",
        workoutDoc: "Warmup\n- 5m 45% FTP\n\nMain\n- 25m 52% FTP\n\nCooldown\n- 5m 40% FTP",
        durationMin: 35,
      },
      {
        name: "Pedaleo Suave de Soltura Articular (40m Z1)",
        powerTarget: "50% FTP",
        justification: "Lavado muscular y retorno venoso sin elevación del pulso.",
        workoutDoc: "Main\n- 40m 50% FTP",
        durationMin: 40,
      },
      {
        name: "Descarga Activa en Rodillo (30m muy suave)",
        powerTarget: "48% FTP",
        justification: "Eliminación de toxinas musculares y relajación del tren inferior.",
        workoutDoc: "Main\n- 30m 48% FTP",
        durationMin: 30,
      },
      {
        name: "Pedaleo Regenerativo con Cadencia Libre (35m)",
        powerTarget: "52% FTP",
        justification: "Mantenimiento del tono de pedaleo sin fatiga.",
        workoutDoc: "Main\n- 35m 52% FTP",
        durationMin: 35,
      },
      {
        name: "Ciclismo de Asimilación Biológica (40m)",
        powerTarget: "54% FTP",
        justification: "Favorece la recuperación neuromuscular post-fondo.",
        workoutDoc: "Main\n- 40m 54% FTP",
        durationMin: 40,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Core & Estabilidad Lumbar para Ciclistas",
        focus: "Core y Glúteo",
        justification: "Prevención de dolor lumbar en tiradas largas sobre la bicicleta.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Planchas, Isométricos y Foam Roller",
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
    notes: "Fuerza de core, glúteos y cadena posterior para estabilidad en la posición de pedaleo.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 2.0,
    maxCtlPerWeek: 4.5,
  },
};
