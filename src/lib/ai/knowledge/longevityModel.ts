import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9 } from "./testingProtocols";

export const BASE_LONGEVITY_MODEL: CuratedTrainingModel = {
  modelId: "BASE_LONGEVITY",
  sportCategory: "General",
  displayName: "PULSE Longevity & Aerobic Base (Stephen Seiler 80/20 + Peter Attia)",
  scientificAuthors: [
    "Dr. Stephen Seiler (Polarized Training Model 80/20)",
    "Dr. Peter Attia (Zone 2 Cardio & Musculoskeletal Longevity)",
  ],
  description:
    "Modelo centrado en la salud cardiovascular a largo plazo, biogénesis mitocondrial, estabilidad de sóleo y tendón de Aquiles, y prevención de sobrecargas.",
  targetDistanceKm: 12,
  periodizationStyle: "Periodización Continua Polarizada 2:1 Preventiva",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Mitocondrial Zona 2",
      percentageDuration: 0.50,
      focusDescription: "80% del tiempo en Zona 2 mitocondrial cómoda (<2 mmol lactato, conversación fluida) + fuerza funcional.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Tirada dominical suave de 50 a 65 min en Zona 2 pura (65-72% Stryd CP).",
      recommendedIntensityZones: ["Z1-Z2 Aeróbico Mitocondrial", "Fuerza Pliométrica Sóleo"],
    },
    {
      phaseKey: "BUILD",
      phaseName: "Potencia Aeróbica & Micro-Intervalos",
      percentageDuration: 0.35,
      focusDescription: "Toques breves de potencia (Strides reactivos) manteniendo el 80% en Zona 2.",
      weeklyTssRange: { min: 260, max: 350 },
      longRunGuideline: "Tiradas de 55 a 65 min con progresión controlada.",
      recommendedIntensityZones: ["Z2 Base", "Strides Neuromusculares (110% CP)"],
    },
    {
      phaseKey: "PEAK",
      phaseName: "Consolidación de Aptitud & Fitness Saludable",
      percentageDuration: 0.15,
      focusDescription: "Mantenimiento del CTL en meseta óptima (+45 a +65 CTL) con frescura neuromuscular.",
      weeklyTssRange: { min: 280, max: 340 },
      longRunGuideline: "Tirada máxima de 60-65 min en terreno blando.",
      recommendedIntensityZones: ["Z2 Estable", "Cadencia Ligera"],
    },
    {
      phaseKey: "TAPER",
      phaseName: "Descarga y Regeneración",
      percentageDuration: 0.0,
      focusDescription: "Asimilación biológica periódica 2:1.",
      weeklyTssRange: { min: 160, max: 220 },
      longRunGuideline: "Tirada suave de 45m.",
      recommendedIntensityZones: ["Z1 Regenerativo"],
    },
  ],
  mandatoryTests: [
    { ...RUN_TEST_STRYD_3_9, testName: "Test 3/9m de Control Submáximo", recommendedWeekIndex: 2 },
  ],
  longRunRules: {
    startKm: 8,
    peakKm: 12,
    startMinutes: 50,
    peakMinutes: 65,
    targetIntensityPercentCpOrFtp: "65-72% CP (Estricto control Z2)",
    description: "Límite estricto de 65 min para evitar sobrecargas articulares o catabolismo miofascial.",
    taperKmSequence: [8, 6],
    taperMinutesSequence: [45, 35],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        {
          name: "Rodaje Progresivo Z1-Z2 con 4 Strides (45m)",
          powerTarget: "72% CP + 110% CP",
          justification: "Estímulo de reactividad de sóleo sin acumular fatiga residual.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 25m 72% FTP\n\n4x\n- 20s 110% FTP\n- 40s 55% FTP\n\nCooldown\n- 5m 60% FTP",
        },
      ],
      build: [
        {
          name: "Fartlek Suave de Ritmo Aeróbico Z3 (45m)",
          powerTarget: "82% CP",
          justification: "Flexibilidad metabólica en umbral aeróbico.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 3m 82% FTP\n- 2m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Rodaje Aeróbico Z2 Estable con Cadencia Óptima (50m)",
          powerTarget: "72% CP",
          justification: "Durabilidad mitocondrial pura.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 35m 72% FTP\n\nCooldown\n- 5m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Rodaje Suave Regenerativo (35m)",
          powerTarget: "65% CP",
          justification: "Oxigenación y descarga articular.",
          workoutDoc: "Warmup\n- 5m 60% FTP\n\nMain\n- 25m 65% FTP\n\nCooldown\n- 5m 55% FTP",
        },
      ],
    },
    bikeMidWeekWorkouts: [
      {
        name: "Ciclismo Z2 Regenerativo sin Impacto (50m)",
        powerTarget: "62% FTP",
        justification: "Volumen cardiovascular de bajo estrés osteoarticular.",
        workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 30m 62% FTP\n\nCooldown\n- 10m 45% FTP",
        durationMin: 50,
      },
    ],
    recoveryAerobicWorkouts: [
      {
        name: "Caminata Rápida / Trote Suave Z1 (35m)",
        powerTarget: "60% CP",
        justification: "Salud articular y recuperación activa.",
        workoutDoc: "Warmup\n- 5m 55% FTP\n\nMain\n- 25m 60% FTP\n\nCooldown\n- 5m 50% FTP",
        durationMin: 35,
      },
    ],
    strengthWorkouts: [
      {
        name: "Fuerza Funcional Sóleo, Pliometría & Core para Longevidad",
        focus: "Sóleo, Aquiles y Core",
        justification: "Prevención de lesiones y preservación de la elasticidad de los tendones.",
        workoutDoc: "Warmup\n- 5m Mobility\n\nMain\n- 20m Pliometría Sóleo en Escalón, Planchas y Sentadillas",
      },
    ],
  },
  tssProgressionRules: {
    startTssRatio: 0.90,
    peakTssRatio: 1.15,
    recoveryDropPercent: 0.25,
    weeklyLoadStepTss: 8,
  },
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin: 60,
    recommendedStrengthSessionsPerWeek: 2,
    notes: "Fuerza funcional enfocada en pliometría de sóleo, sentadillas y estabilidad pélvica.",
  },
  banisterRampRateLimits: {
    minCtlPerWeek: 0.5,
    maxCtlPerWeek: 2.0,
  },
};
