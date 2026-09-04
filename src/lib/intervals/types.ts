/**
 * Tipos de datos para la integración con Intervals.icu API v1
 */

export interface AthleteProfile {
  id: string;
  name?: string;
  email?: string;
  gender?: "M" | "F" | "OTHER";
  sex?: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  weight?: number;
  heightCm?: number;
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  run_ftp?: number; // Stryd Potencia Crítica (CP / Run FTP)
  bike_ftp?: number; // FTP Ciclismo
  icu_ftp?: number; // FTP General Intervals
  icu_run_ftp?: number;
  icu_running_ftp?: number;
  ctl?: number; // Fitness
  atl?: number; // Fatigue
  tsb?: number; // Form
  rampRate?: number; // Ramp Rate semanal
  icu_resting_hr?: number;
  icu_efficiency_factor?: number;
  timezone?: string;
  visibleMetrics?: string[];
}

export interface MetricIndicatorConfig {
  id: string;
  name: string;
  category: "PERFORMANCE" | "RECOVERY" | "THRESHOLDS" | "BIOMETRICS";
  icon: string;
  unit: string;
  description: string;
  defaultVisible: boolean;
}

export const AVAILABLE_METRIC_INDICATORS: MetricIndicatorConfig[] = [
  { id: "ctl", name: "Fitness (CTL)", category: "PERFORMANCE", icon: "📈", unit: "pts", description: "Carga crónica aeróbica acumulada de las últimas 6 semanas", defaultVisible: true },
  { id: "atl", name: "Fatigue (ATL)", category: "PERFORMANCE", icon: "⚡", unit: "pts", description: "Fatiga aguda acumulada de los últimos 7 días", defaultVisible: true },
  { id: "tsb", name: "Form (TSB)", category: "PERFORMANCE", icon: "🔋", unit: "balance", description: "Balance de frescura / disponibilidad para sesiones de calidad", defaultVisible: true },
  { id: "rampRate", name: "Ramp Rate", category: "PERFORMANCE", icon: "📐", unit: "/sem", description: "Tasa semanal de progresión de carga", defaultVisible: true },
  { id: "strydCp", name: "Stryd CP (Run FTP)", category: "THRESHOLDS", icon: "👟", unit: "Watts", description: "Potencia crítica umbral sostenible en carrera a pie", defaultVisible: true },
  { id: "bikeFtp", name: "Ride FTP (Ciclismo)", category: "THRESHOLDS", icon: "🚴", unit: "Watts", description: "Umbral funcional de potencia en bicicleta", defaultVisible: true },
  { id: "hrv", name: "HRV (rMSSD / Z-Score)", category: "RECOVERY", icon: "💓", unit: "ms", description: "Variabilidad de la frecuencia cardíaca y desviación estándar", defaultVisible: false },
  { id: "restingHr", name: "FC Reposo (RHR)", category: "RECOVERY", icon: "🫀", unit: "bpm", description: "Frecuencia cardíaca en reposo matutina", defaultVisible: false },
  { id: "sleep", name: "Sueño & Recuperación", category: "RECOVERY", icon: "😴", unit: "hrs / %", description: "Calidad y duración del sueño sincronizado", defaultVisible: false },
  { id: "wKg", name: "Relación W/kg", category: "BIOMETRICS", icon: "⚖️", unit: "W/kg", description: "Potencia relativa por kilo de peso corporal", defaultVisible: false },
  { id: "ageBiometrics", name: "Edad & FC Tanaka", category: "BIOMETRICS", icon: "🎂", unit: "años", description: "Edad cronológica y FC Máxima estimada (208 - 0.7*Edad)", defaultVisible: false },
  { id: "efficiencyFactor", name: "Eficiencia Aeróbica (EF)", category: "PERFORMANCE", icon: "🎯", unit: "W/bpm", description: "Relación de vatios producidos por cada latido cardíaco", defaultVisible: false },
];

export const DEFAULT_VISIBLE_METRICS: string[] = ["ctl", "atl", "tsb", "rampRate", "strydCp", "bikeFtp"];

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
  hrvZScore?: number;
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
  icu_efficiency_factor?: number;
  icu_cardiac_decoupling?: number;
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

export interface DailyExecutedActivity {
  id: string;
  name: string;
  type: string;
  tss: number;
  movingTimeMin: number;
  watts?: number;
  heartrate?: number;
  distanceKm?: number;
}

export interface DailyExecutedSummary {
  date: string; // YYYY-MM-DD
  totalTss: number;
  activities: DailyExecutedActivity[];
}

export type DailyExecutedMap = Record<string, DailyExecutedSummary>;
