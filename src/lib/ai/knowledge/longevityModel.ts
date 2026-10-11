import { CuratedTrainingModel } from "./types";
import { RUN_TEST_STRYD_3_9 } from "./testingProtocols";
import { ALL_RUNNING_AEROBIC_WORKOUTS } from "./workoutPools/runningAerobicPool";
import {
  RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
  RUN_PIRAMIDE_CONTINUA_Z2_Z3,
  RUN_FARTLEK_SUECO_PIRAMIDAL,
} from "./workoutPools/runningFartlekPool";
import {
  RUN_TEMPO_CONTINUO_30M,
  RUN_TEMPO_PROGRESIVO_CANOVA,
  RUN_TEMPO_ALTERNANCIAS_3X_8M,
} from "./workoutPools/runningTempoPool";
import {
  RUN_DISTANCE_REPETICIONES_12X_200M,
  RUN_DISTANCE_ESCALERA_200_800,
} from "./workoutPools/runningDistancePool";

export const BASE_LONGEVITY_MODEL: CuratedTrainingModel = {
  modelId: "BASE_LONGEVITY",
  sportCategory: "General",
  displayName: "PULSE Longevity & Aerobic Base (Stephen Seiler 80/20 + Peter Attia)",
  scientificAuthors: [
    "Dr. Stephen Seiler (Polarized Training Model 80/20)",
    "Dr. Peter Attia (Zone 2 Cardio & Musculoskeletal Longevity)",
  ],
  description:
    "Modelo centrado en la salud cardiovascular a largo plazo, resistencia aeróbica en Zona 2, estabilidad muscular y prevención de sobrecargas.",
  targetDistanceKm: 12,
  periodizationStyle: "Periodización Continua Polarizada 2:1 Preventiva",
  phaseDistributions: [
    {
      phaseKey: "BASE",
      phaseName: "Base Aeróbica en Zona 2",
      percentageDuration: 0.50,
      focusDescription: "80% del tiempo en Zona 2 cómoda y conversacional (<2 mmol lactato, conversación fluida) + fuerza funcional.",
      weeklyTssRange: { min: 220, max: 320 },
      longRunGuideline: "Tirada dominical suave de 50 a 65 min en Zona 2 pura (65-72% Stryd CP).",
      recommendedIntensityZones: ["Z1-Z2 Fondo Aeróbico", "Fuerza y Estabilidad"],
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
  maxLongRunMinutesCap: 60,
  athleteLevelCaps: {
    BEGINNER: { ctlThresholdMax: 35, maxLongRunKm: 8, maxLongRunMinutes: 50, tssScaleFactor: 0.85 },
    INTERMEDIATE: { ctlThresholdMax: 65, maxLongRunKm: 10, maxLongRunMinutes: 55, tssScaleFactor: 1.0 },
    ADVANCED_ELITE: { ctlThresholdMax: 999, maxLongRunKm: 12, maxLongRunMinutes: 60, tssScaleFactor: 1.1 },
  },
  longRunRules: {
    startKm: 6,
    peakKm: 10,
    startMinutes: 40,
    peakMinutes: 55,
    targetIntensityPercentCpOrFtp: "65-72% CP (Estricto control Z2 conversacional)",
    description: "Zona 2 pura de 40 a 55 min para biogénesis mitocondrial sin estrés adrenal.",
    taperKmSequence: [6, 5],
    taperMinutesSequence: [40, 30],
  },
  workoutVariations: {
    qualityWorkouts: {
      base: [
        RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
        RUN_PIRAMIDE_CONTINUA_Z2_Z3,
        RUN_FARTLEK_SUECO_PIRAMIDAL,
        RUN_TEMPO_CONTINUO_30M,
        RUN_TEMPO_PROGRESIVO_CANOVA,
        RUN_DISTANCE_REPETICIONES_12X_200M,
      ],
      build: [
        RUN_DISTANCE_ESCALERA_200_800,
        RUN_TEMPO_ALTERNANCIAS_3X_8M,
        {
          name: "Fartlek Suave de Ritmo Aeróbico Z3 (45m)",
          powerTarget: "82% CP",
          justification: "Flexibilidad metabólica en umbral aeróbico.",
          workoutDoc: "Warmup\n- 15m 65% FTP\n\n4x\n- 3m 82% FTP\n- 2m 60% FTP\n\nCooldown\n- 10m 60% FTP",
        },
      ],
      peak: [
        {
          name: "Carrera Continua Aeróbica Z2 Estable con Cadencia Óptima (50m)",
          powerTarget: "72% CP",
          justification: "Resistencia aeróbica continua y durabilidad muscular.",
          workoutDoc: "Warmup\n- 10m 65% FTP\n\nMain\n- 35m 72% FTP\n\nCooldown\n- 5m 60% FTP",
        },
      ],
      taper: [
        {
          name: "Trote Suave Regenerativo (35m)",
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
    recoveryAerobicWorkouts: ALL_RUNNING_AEROBIC_WORKOUTS,
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
