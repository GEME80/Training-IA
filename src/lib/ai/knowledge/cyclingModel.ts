import { CuratedTrainingModel } from "./types";
import { BIKE_TEST_20M_FTP, BIKE_TEST_RAMP } from "./testingProtocols";

export const CYCLING_GRAN_FONDO_MODEL: CuratedTrainingModel = {
  modelId: "CYCLING_GRAN_FONDO",
  sportCategory: "Cycling",
  displayName: "PULSE Cycling & Gran Fondo Power Engine (Coggan + Allen + Friel)",
  scientificAuthors: [
    "Dr. Andrew Coggan & Hunter Allen (Training and Racing with a Power Meter)",
    "Joe Friel (The Cyclist's Training Bible)",
  ],
  description:
    "Modelo de prescripción por vatios basado en % FTP. Optimiza la curva de potencia aeróbica, densidad mitocondrial mediante SweetSpot (88-94% FTP) y fondos de hasta 160km.",
  targetDistanceKm: 120,
  periodizationStyle: "Periodización Polarizada y Bloques de SweetSpot 3:1",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica & Eficiencia de Pedaleo",
      percentageDuration: 0.40,
      focusDescription: "Desarrollo mitocondrial en Zona 2, cadencia eficiente (90-100 rpm) y adaptaciones metabólicas de lípidos.",
      weeklyTssRange: { min: 320, max: 440 },
      longRunGuideline: "Fondos de 2h a 3h en Zona 2 estable (60-70% Bike FTP).",
      recommendedIntensityZones: ["Z1 Recuperación (<55% FTP)", "Z2 Resistencia (56-75% FTP)", "Variaciones de Cadencia"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "SweetSpot & Elevación del FTP",
      percentageDuration: 0.35,
      focusDescription: "Intervalos de SweetSpot (88-94% FTP) y Over-Unders (95-105% FTP) para elevar el umbral funcional.",
      weeklyTssRange: { min: 420, max: 560 },
      longRunGuideline: "Fondos de 3h a 4h con bloques de tempo y subidas a ritmo constante.",
      recommendedIntensityZones: ["SweetSpot (88-94% FTP)", "Umbral Funcional (95-105% FTP)", "VO2max (106-120% FTP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Pico de Resistencia a la Fatiga (TTE)",
      percentageDuration: 0.15,
      focusDescription: "Maximización del Time-to-Exhaustion a ritmo de evento y simulaciones de gran fondo (140-160km).",
      weeklyTssRange: { min: 480, max: 620 },
      longRunGuideline: "Fondos cumbre de 4h30m a 5h15m (140-160km) con tramos al 80-88% FTP.",
      recommendedIntensityZones: ["Simulación de Gran Fondo", "Intervalos de Potencia Crítica"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Afinamiento & Descarga",
      percentageDuration: 0.10,
      focusDescription: "Reducción de volumen manteniendo activaciones cortas de potencia para máxima frescura (TSB positivo).",
      weeklyTssRange: { min: 200, max: 300 },
      longRunGuideline: "Salidas suaves de 1h30m a 2h00m con aceleraciones de 30s.",
      recommendedIntensityZones: ["Activación Neuronal", "Zona 1 Suave"],
    },
  ],
  mandatoryTests: [
    { ...BIKE_TEST_RAMP, recommendedWeekIndex: 2 },
    { ...BIKE_TEST_20M_FTP, recommendedWeekIndex: 8 },
  ],
  longRunRules: {
    startKm: 55,
    peakKm: 160,
    startMinutes: 120,
    peakMinutes: 300,
    targetIntensityPercentCpOrFtp: "60-72% FTP en base y tramos de 85-90% FTP en eventos",
    description: "Progresión de 55km (2h) hasta 160km (5h) con descansos periódicos y 2 semanas de tapering.",
    taperKmSequence: [95, 55],
    taperMinutesSequence: [150, 85],
  },
  maxLongRunMinutesCap: 300,
  taperingRules: {
    taperingWeeks: 2,
    volumeDropSequencePercent: [0.25, 0.50],
    maintainRacePaceIntensity: true,
  },
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 40, maxLongRunKm: 85, maxLongRunMinutes: 180, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 70, maxLongRunKm: 125, maxLongRunMinutes: 240, tssScaleFactor: 0.95 },
    ADVANCED_ELITE: { ctlThresholdMax: Infinity, maxLongRunKm: 160, maxLongRunMinutes: 300, tssScaleFactor: 1.10 },
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
          justification: "Eficiencia glucolítica moderada.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n2x\n- 15m 80% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      build: [
        {
          name: "Series de Umbral Funcional FTP (3x12m @ 98% FTP)",
          powerTarget: "98% FTP",
          justification: "Elevación del umbral anaeróbico funcional en bicicleta.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n3x\n- 12m 98% FTP\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      peak: [
        {
          name: "Over-Unders de Tolerancia Láctica (4x9m @ 95%/105% FTP)",
          powerTarget: "95-105% FTP",
          justification: "Capacidad de aclaramiento de lactato bajo tensión de carrera.",
          workoutDoc: "Warmup\n- 15m 55% FTP\n\n4x (9m Over-Under)\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 2m 95% FTP\n- 1m 105% FTP\n- 3m 50% FTP\n\nCooldown\n- 10m 50% FTP",
        },
      ],
      taper: [
        {
          name: "Activación Breve con Cambios de Ritmo (40m)",
          powerTarget: "100% FTP",
          justification: "Puesta a punto neuromuscular para la prueba.",
          workoutDoc: "Warmup\n- 15m 50% FTP\n\n4x\n- 1m 100% FTP\n- 2m 50% FTP\n\nCooldown\n- 10m 45% FTP",
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
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Ciclismo Suave Z1 de Recuperación (35m)",
        powerTarget: "52% FTP",
        justification: "Recuperación pasiva activa.",
        workoutDoc: "Warmup\n- 5m 45% FTP\n\nMain\n- 25m 52% FTP\n\nCooldown\n- 5m 40% FTP",
        durationMin: 35,
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
