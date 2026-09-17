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
  { id: "ctl", name: "Condición Física (CTL)", category: "PERFORMANCE", icon: "📈", unit: "pts", description: "Tu nivel de forma aeróbica acumulado en las últimas 6 semanas", defaultVisible: true },
  { id: "atl", name: "Fatiga Acumulada (ATL)", category: "PERFORMANCE", icon: "⚡", unit: "pts", description: "Cansancio muscular y cardiovascular de los últimos 7 días", defaultVisible: true },
  { id: "tsb", name: "Frescura & Energía (TSB)", category: "PERFORMANCE", icon: "🔋", unit: "balance", description: "Disponibilidad física para rendir y asimilar entrenamientos de calidad hoy", defaultVisible: true },
  { id: "rampRate", name: "Ritmo de Progresión", category: "PERFORMANCE", icon: "📐", unit: "/sem", description: "Incremento semanal de carga de forma segura y sin riesgo de lesión", defaultVisible: true },
  { id: "strydCp", name: "Potencia de Carrera (Run)", category: "THRESHOLDS", icon: "👟", unit: "Watts", description: "Vatios umbral para correr a ritmo exigente y sostenible", defaultVisible: true },
  { id: "bikeFtp", name: "Potencia en Bici (FTP)", category: "THRESHOLDS", icon: "🚴", unit: "Watts", description: "Tus vatios umbral pedaleando a ritmo exigente durante 1 hora", defaultVisible: true },
  { id: "hrv", name: "Recuperación (HRV)", category: "RECOVERY", icon: "💓", unit: "ms", description: "Variabilidad cardíaca: qué tan recuperado está tu sistema nervioso", defaultVisible: false },
  { id: "restingHr", name: "Pulso en Reposo", category: "RECOVERY", icon: "🫀", unit: "bpm", description: "Pulsaciones al despertar; si sube, puede indicar fatiga o inicio de enfermedad", defaultVisible: false },
  { id: "sleep", name: "Sueño & Descanso", category: "RECOVERY", icon: "😴", unit: "hrs / %", description: "Horas y calidad del sueño registradas por tu reloj", defaultVisible: false },
  { id: "wKg", name: "Relación Fuerza/Peso", category: "BIOMETRICS", icon: "⚖️", unit: "W/kg", description: "Vatios producidos por cada kilo de peso corporal", defaultVisible: false },
  { id: "ageBiometrics", name: "Edad & Pulso Máximo", category: "BIOMETRICS", icon: "🎂", unit: "años", description: "Edad y frecuencia cardíaca máxima estimada", defaultVisible: false },
  { id: "efficiencyFactor", name: "Eficiencia Aeróbica", category: "PERFORMANCE", icon: "🎯", unit: "W/bpm", description: "Velocidad o vatios que produces por cada latido del corazón", defaultVisible: false },
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
  elapsedTimeMin?: number;
  watts?: number;
  weightedWatts?: number; // Potencia Normalizada (NP)
  heartrate?: number; // FC media (bpm)
  maxHeartrate?: number; // FC máxima (bpm)
  distanceKm?: number;
  paceStr?: string; // e.g. "5:35/km"
  gapPaceStr?: string; // Grade Adjusted Pace e.g. "5:34/km"
  intensityPercent?: number; // IF %
  efficiencyFactor?: number; // EF = Watts / HR
  cardiacDecoupling?: number; // Desacoplamiento cardíaco D%
  cadence?: number; // Cadencia rpm / spm
  strideLengthM?: number; // Zancada en metros
  elevationGainM?: number; // Desnivel positivo en m
  calories?: number;
  workKj?: number;
  rpe?: number; // Perceived exertion 1-10
  feel?: string; // Sensaciones (ej. "Bueno", "Excelente")
  deviceName?: string; // e.g. "Garmin Forerunner 970"
}

export interface ActivityStreamPoint {
  timeSec: number;
  heartrate?: number;
  watts?: number;
  paceSecPerKm?: number;
  cadence?: number;
  altitude?: number;
}

export interface ActivityStreamsData {
  activityId: string;
  totalTimeSec: number;
  points: ActivityStreamPoint[];
}

export interface DailyExecutedSummary {
  date: string; // YYYY-MM-DD
  totalTss: number;
  activities: DailyExecutedActivity[];
}

export type DailyExecutedMap = Record<string, DailyExecutedSummary>;

