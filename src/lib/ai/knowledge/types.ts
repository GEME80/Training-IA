import { DisciplineType } from "@/lib/db/types";

export type SportDisciplineGoal =
  | "MARATHON_42K"
  | "HALF_MARATHON_21K"
  | "TEN_K_ROAD"
  | "FIVE_K_SPEED"
  | "CYCLING_GRAN_FONDO"
  | "CYCLING_CLIMBING"
  | "CYCLING_CRITERIUM"
  | "TRIATHLON_70_3"
  | "TRIATHLON_SHORT"
  | "TRIATHLON_140_6"
  | "TRAIL_ULTRA"
  | "BASE_GPP"
  | "GENERAL_BUILD"
  | "SPEED_BLOCK"
  | "POST_RACE_DELOAD"
  | "INJURY_REHAB"
  | "BASE_LONGEVITY";

export type PeriodizationRatio = "2:1" | "3:1" | "LINEAR";

export interface MacrocyclePhaseDistribution {
  phaseKey: "BASE" | "BUILD" | "PEAK" | "TAPER";
  phaseName: string;
  percentageDuration: number;
  focusDescription: string;
  weeklyTssRange: { min: number; max: number };
  longRunGuideline: string;
  recommendedIntensityZones: string[];
}

export interface PhysiologicalTestDefinition {
  testId: string;
  testName: string;
  sport: "Run" | "Ride" | "Swim";
  targetMetric: "Stryd Critical Power (CP)" | "Bike Functional Threshold Power (FTP)" | "CSS Swim Pace";
  scheduledWeekType: "BASELINE_WEEK" | "MID_BUILD_WEEK" | "PRE_PEAK_WEEK";
  recommendedWeekIndex: number;
  protocolDescription: string;
  workoutDoc: string;
  calculationFormula: string;
}

export interface LongRunProgressionRules {
  startKm: number;
  peakKm: number;
  startMinutes: number;
  peakMinutes: number;
  targetIntensityPercentCpOrFtp: string;
  description: string;
  taperKmSequence: number[];
  taperMinutesSequence: number[];
}

export interface WeeklyWorkoutVariations {
  qualityWorkouts: {
    base: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string }>;
    build: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string }>;
    peak: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string }>;
    taper: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string }>;
  };
  bikeMidWeekWorkouts: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string; durationMin: number }>;
  recoveryAerobicWorkouts: Array<{ name: string; powerTarget: string; justification: string; workoutDoc: string; durationMin: number }>;
  strengthWorkouts: Array<{ name: string; focus: string; justification: string; workoutDoc: string }>;
}

export interface TssProgressionRules {
  startTssRatio: number;
  peakTssRatio: number;
  recoveryDropPercent: number;
  weeklyLoadStepTss: number;
}

export type AthleteLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED_ELITE";

export interface AthleteLevelCapConfig {
  ctlThresholdMax: number; // Ej: 30 para BEGINNER, 60 para INTERMEDIATE, Infinity para ADVANCED_ELITE
  maxLongRunKm: number;
  maxLongRunMinutes: number;
  tssScaleFactor: number;
}

export interface TaperingRuleConfig {
  taperingWeeks: number; // Ej: 3 para 42K, 2 para 21K, 1.5 para 10K, 1 para 5K
  volumeDropSequencePercent: number[]; // Ej: [0.20, 0.40, 0.65]
  maintainRacePaceIntensity: boolean; // Preservar toques al 100% de ritmo maratón/carrera
}

export interface BiotypeCrossTrainingRuleConfig {
  triggerWeightKgThreshold: number; // Ej: 80 kg
  triggerMinWKgThreshold: number; // Ej: 3.2 W/kg
  substituteBikeZ2WeeklyMin: number;
  waterSessionWeeklyMin?: number;
  notes: string;
}

export interface StrengthModelDefinition {
  modelId: string;
  name: string;
  category: "NEURAL_HEAVY" | "SPRING_ANKLE_SOLEUS" | "ECCENTRIC_DOWNHILL" | "PELVIC_CORE_PREHAB" | "WATER_HYDROTHERAPY" | "SWIM_SHOULDER_DORSAL";
  focus: string;
  justification: string;
  workoutDoc: string;
}


export interface CrossTrainingModelDefinition {
  modelId: string;
  name: string;
  category: "BIKE_Z2_MITO" | "BIKE_HIIT_VO2" | "WATER_AQUA_RUN" | "WATER_HYDROTHERAPY";
  sport: "Ride" | "Swim" | "Other";
  targetMetric: string;
  durationMin: number;
  justification: string;
  workoutDoc: string;
}

export interface CuratedTrainingModel {
  modelId: SportDisciplineGoal;
  sportCategory: "Running" | "Cycling" | "Triathlon" | "Trail" | "General";
  displayName: string;
  scientificAuthors: string[];
  description: string;
  targetDistanceKm?: number;
  periodizationStyle: string;
  phaseDistributions: MacrocyclePhaseDistribution[];
  mandatoryTests: PhysiologicalTestDefinition[];
  longRunRules: LongRunProgressionRules;
  athleteLevelCaps?: Record<AthleteLevel, AthleteLevelCapConfig>;
  maxLongRunMinutesCap?: number; // Cap estricto (ej. 150 min / 2h30m)
  taperingRules?: TaperingRuleConfig;
  biotypeCrossTrainingRule?: BiotypeCrossTrainingRuleConfig;
  recommendedStrengthModelIds?: string[];
  recommendedCrossTrainingModelIds?: string[];
  workoutVariations: WeeklyWorkoutVariations;
  tssProgressionRules: TssProgressionRules;
  crossTrainingRules: {
    recommendedBikeZ2WeeklyMin?: number;
    recommendedStrengthSessionsPerWeek?: number;
    notes: string;
  };
  banisterRampRateLimits: {
    minCtlPerWeek: number;
    maxCtlPerWeek: number;
  };
}

