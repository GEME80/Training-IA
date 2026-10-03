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
  Viernes: ["Carrera", "Fuerza"],
  Sábado: ["Ciclismo"],
  Domingo: ["Carrera"],
};

export type RunningTrainingMode = "POWER" | "PACE" | "HYBRID";

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  intervalsAthleteId?: string;
  encryptedApiKey?: EncryptedPayload;
  hasApiKey?: boolean;
  hasRunningPowerMeter?: boolean;
  runningTrainingMode?: RunningTrainingMode;
  runFtp?: number; // Stryd CP (W)
  bikeFtp?: number; // Bike FTP (W)
  runThresholdPaceSecPerKm?: number; // Ritmo umbral en segundos/km (ej. 270 = 4:30/km)
  runThresholdPaceStr?: string; // Ritmo umbral legible (ej. "4:30")
  swimCssSecPer100m?: number; // Ritmo umbral de natación (CSS) en segundos/100m (ej. 105 = 1:45/100m)
  swimCssStr?: string; // Ritmo umbral de natación legible (ej. "1:45")
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  targetEventDate?: string;
  trainingFocus?: "MAINTENANCE" | "BUILD" | "MARATHON" | "TRIATHLON";
  planPrice?: number;
  planCurrency?: "USD" | "COP" | "EUR";
  billingStatus?: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION";
  billingCycleDay?: number;
  lastPaymentDate?: string;
  paymentMethod?: "TRANSFER" | "STRIPE" | "WOMPI" | "CASH" | "OTHER";
  paymentReference?: string;
  paymentReportedAt?: string;
  primaryGoalRace?: string;
  primaryGoalDate?: string;
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
  swimCssStr?: string;
  hasRunningPowerMeter?: boolean;
  runningTrainingMode?: RunningTrainingMode;
  runThresholdPaceStr?: string;
  runThresholdPaceSecPerKm?: number;
  weightKg?: number;
  heightCm?: number;
  restingHR?: number;
  maxHR?: number;
  lthr?: number;
  planPrice?: number;
  planCurrency?: "USD" | "COP" | "EUR";
  billingStatus?: "PAID" | "PENDING" | "OVERDUE" | "PENDING_VERIFICATION";
  billingCycleDay?: number;
  lastPaymentDate?: string;
  paymentMethod?: "TRANSFER" | "STRIPE" | "WOMPI" | "CASH" | "OTHER";
  paymentReference?: string;
  paymentReportedAt?: string;
  primaryGoalRace?: string;
  primaryGoalDate?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface SubscriptionPlanConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: "USD" | "COP" | "EUR";
  billingPeriod: "monthly";
  billingCycleDaysText: string;
  features: string[];
  nequiEnabled: boolean;
  nequiNumber: string;
  nequiAccountName: string;
  nequiDocumentId?: string;
  nequiQrImageUrl?: string;
  bankName: string;
  bankAccountType?: "Ahorros" | "Corriente" | "Nequi";
  bankAccountNumber?: string;
  paymentInstructions: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlanConfig = {
  id: "plan-elite-pro",
  name: "Plan Élite Pro SGEA",
  tagline: "Periodización Dinámica, Fisiología Stryd y Head Coach Digital",
  description: "Acceso total a la plataforma de entrenamiento inteligente adaptativo con IA, prescripción en vatios/ritmo y analítica fisiológica de élite.",
  price: 80,
  currency: "USD",
  billingPeriod: "monthly",
  billingCycleDaysText: "Días 1 al 5 de cada mes",
  features: [
    "Prescripción adaptativa diaria con IA y motor de potencia Stryd",
    "Ajuste dinámico continuo según HRV, calidad de sueño y fatiga (Banister)",
    "Sincronización automática directa con Intervals.icu y relojes Garmin / Coros",
    "Prevención activa de lesiones (Cap 3h y regla 3:1 de asimilación)",
    "Chat interactivo 24/7 con tu Head Coach Digital",
    "Curvas de potencia MMP, mejores esfuerzos y estimación Daniels VDOT hasta 42K",
  ],
  nequiEnabled: true,
  nequiNumber: "310 123 4567",
  nequiAccountName: "Germán Morales",
  nequiDocumentId: "CC 1.234.567.890",
  nequiQrImageUrl: "",
  bankName: "Bancolombia / Nequi",
  bankAccountType: "Ahorros",
  bankAccountNumber: "310-1234567",
  paymentInstructions: "Transfiere desde tu app de Nequi o Bancolombia escaneando el código QR o enviando al número indicado. Luego reporta tu comprobante aquí para validación inmediata.",
};

export interface AdminBillingStats {
  totalAthletesMonth: number;
  totalExpectedRevenue: number;
  totalCollectedMonth: number;
  totalPendingMonth: number;
  collectionRatePercent: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  pendingVerificationCount: number;
  currency: string;
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
  displayName: process.env.SUPERADMIN_NAME || "Administrador",
  intervalsAthleteId: process.env.INTERVALS_ATHLETE_ID || undefined,
  role: "admin",
  status: "active",
  weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
};
