/**
 * Tipos de datos para la integración con Intervals.icu API v1
 */

export interface AthleteProfile {
  id: string;
  name?: string;
  email?: string;
  weight?: number;
  restingHR?: number;
  maxHR?: number;
  run_ftp?: number; // Stryd Potencia Crítica (CP / Run FTP)
  bike_ftp?: number; // FTP Ciclismo
  icu_ftp?: number; // FTP General Intervals
  icu_run_ftp?: number;
  ctl?: number; // Fitness
  atl?: number; // Fatigue
  tsb?: number; // Form
  rampRate?: number; // Ramp Rate semanal
  icu_resting_hr?: number;
  timezone?: string;
}

export interface AthleteWellness {
  id: string; // YYYY-MM-DD
  date: string;
  ctl?: number;
  atl?: number;
  tsb?: number;
  rampRate?: number;
  ctlLoad?: number;
  atlLoad?: number;
  restingHR?: number;
  hrv?: number; // rMSSD
  hrvSDNN?: number;
  readiness?: number;
  sleepQuality?: number;
  sleepSecs?: number;
  fatigue?: number;
  stress?: number;
  soreness?: number;
  comments?: string;
}

export type ActivityType = "Run" | "Ride" | "Swim" | "WeightTraining" | "Walk" | "Other";

export interface CalendarEvent {
  id?: number;
  athlete_id?: string;
  start_date_local: string; // ISO 8601: YYYY-MM-DDTHH:MM:SS
  name: string;
  description?: string;
  type: ActivityType;
  category: "WORKOUT" | "RACE" | "NOTE" | "TARGET" | "FITNESS_DAYS";
  moving_time?: number; // segundos
  distance?: number; // metros
  icu_training_load?: number; // TSS estimado
  icu_intensity?: number;
  workout_doc?: string; // Sintaxis de workout estructurado en Intervals
  tags?: string[];
  color?: string;
}

export interface ActivitySummary {
  id: string;
  start_date_local: string;
  name: string;
  type: ActivityType;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  average_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number; // Potencia normalizada
  icu_training_load?: number; // TSS real ejecutado
  icu_intensity?: number;
  icu_ftp?: number;
  device_name?: string;
}

export interface PhysiologicalEvaluation {
  athleteId: string;
  evaluationDate: string;
  currentMetrics: {
    ctl: number;
    atl: number;
    tsb: number;
    rampRate: number;
    restingHR: number;
    rollingHrvZScore: number;
    recentWellnessStatus: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  };
  recommendations: {
    suggestedAdjustments: Array<{
      day: string;
      originalWorkoutName?: string;
      suggestedWorkoutName: string;
      reason: string;
      type: ActivityType;
      intensityChangePercentage: number;
      workoutDoc: string;
    }>;
    generalComment: string;
    reasoningTree: string[];
  };
}
