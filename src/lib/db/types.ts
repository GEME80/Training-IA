export type UserRole = "admin" | "athlete";
export type UserStatus = "active" | "pending" | "disabled";

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export type DisciplineType = "Descanso" | "Carrera" | "Ciclismo" | "Fuerza" | "Natacion";
export type WeeklyAvailabilityMap = Record<string, DisciplineType[] | DisciplineType>;

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMap = {
  Lunes: ["Descanso"],
  Martes: ["Carrera"],
  Miércoles: ["Ciclismo"],
  Jueves: ["Fuerza"],
  Viernes: ["Carrera"],
  Sábado: ["Ciclismo"],
  Domingo: ["Carrera"],
};

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  intervalsAthleteId?: string;
  encryptedApiKey?: EncryptedPayload;
  runFtp?: number; // Stryd CP (W)
  bikeFtp?: number; // Bike FTP (W)
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  targetEventDate?: string;
  trainingFocus?: "MAINTENANCE" | "BUILD" | "MARATHON" | "TRIATHLON";
  weeklyAvailability?: WeeklyAvailabilityMap;
  visibleMetrics?: string[];
  targetRaces?: any[];
  seasonPlans?: any[];
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
}

export interface AdminUserListItem {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  intervalsAthleteId?: string;
  hasIntervalsKey: boolean;
  isPreAuthorized?: boolean;
  runFtp?: number;
  bikeFtp?: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  connectedAthletes: number;
  lastCalculatedAt: string;
}

export interface DecisionLog {
  id: string;
  timestamp: string;
  evaluationDate: string;
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  reasoningTree: string[];
  adjustmentsApplied: boolean;
  appliedAdjustments?: Array<{
    day: string;
    workoutName: string;
    type: string;
    action: "MODIFIED" | "KEPT" | "REST_REPLACED";
  }>;
}

/**
 * Semilla de configuración por defecto para el Superadministrador Raíz.
 * Los datos se resuelven dinámicamente según variables de entorno.
 */
export const MASTER_ATHLETE_SEED: Partial<UserProfileData> = {
  displayName: "Germán Morales",
  intervalsAthleteId: process.env.INTERVALS_ATHLETE_ID || "i442091",
  role: "admin",
  status: "active",
  weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
};
