import { z } from "zod";

/**
 * Esquema de validación para `/api/evaluate`
 */
export const EvaluateRequestSchema = z.object({
  athleteId: z.string().optional(),
  apiKey: z.string().optional(),
  uid: z.string().optional(),
  email: z.string().optional(),
  customRunFtp: z.number().nullable().optional(),
  customBikeFtp: z.number().nullable().optional(),
  weekOffset: z.number().optional().default(0),
  geminiApiKey: z.string().optional(),
  selectedModel: z.string().optional(),
  customPrompt: z.string().optional(),
  targetRaces: z.array(z.any()).optional().default([]),
  weeklyAvailability: z.record(z.string(), z.any()).optional(),
  skipAI: z.boolean().optional().default(true),
});

export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

/**
 * Esquema de validación para `/api/profile`
 */
export const ProfileUpdateRequestSchema = z.object({
  uid: z.string().min(1, "UID es requerido para guardar el perfil"),
  email: z.string().optional().default("atleta@pulseai.pro"),
  displayName: z.string().optional(),
  intervalsAthleteId: z.string().optional(),
  rawApiKey: z.string().optional(),
  runFtp: z.number().nullable().optional(),
  bikeFtp: z.number().nullable().optional(),
  restingHR: z.number().nullable().optional(),
  maxHR: z.number().nullable().optional(),
  lthr: z.number().nullable().optional(),
  weightKg: z.number().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["M", "F", "OTHER"]).optional(),
  trainingFocus: z.enum(["MAINTENANCE", "BUILD", "MARATHON", "TRIATHLON"]).optional(),
  weeklyAvailability: z.record(z.string(), z.any()).optional(),
  visibleMetrics: z.array(z.string()).optional(),
  targetRaces: z.array(z.any()).optional(),
  seasonPlans: z.array(z.any()).optional(),
});

export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;

/**
 * Esquema de sesión individual de microciclo para sincronización
 */
export const PlanItemSchema = z
  .object({
    id: z.string().optional(),
    day: z.string().optional(),
    date: z.string().min(1, "La fecha de la sesión es requerida"),
    formattedDate: z.string().optional(),
    discipline: z.string().min(1, "La disciplina es requerida"),
    workoutName: z.string().optional(),
    action: z.string().optional(),
    powerTarget: z.string().optional(),
    tss: z.number().optional(),
    targetTss: z.number().optional(),
    durationMinutes: z.number().optional(),
    activityType: z.string().optional(),
    dayOfWeek: z.string().optional(),
    title: z.string().optional(),
    focus: z.string().optional(),
    justification: z.string().optional(),
    description: z.string().optional(),
    workoutDoc: z.string().optional(),
    workoutStructure: z.any().optional(),
    isRestDay: z.boolean().optional(),
    isCustomized: z.boolean().optional(),
    intervalsWorkoutText: z.string().optional(),
  })
  .passthrough();

/**
 * Esquema de validación para `/api/sync-intervals`
 */
export const SyncIntervalsRequestSchema = z.object({
  athleteId: z.string().optional(),
  apiKey: z.string().optional(),
  uid: z.string().optional(),
  email: z.string().optional(),
  plan: z.array(PlanItemSchema).min(1, "Estructura del microciclo inválida o vacía."),
});

export type SyncIntervalsRequest = z.infer<typeof SyncIntervalsRequestSchema>;

/**
 * Esquema de validación para `/api/headcoach/chat`
 */
export const HeadCoachChatRequestSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío"),
  conversationHistory: z.array(z.any()).optional().default([]),
  athleteId: z.string().optional(),
  apiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  selectedModel: z.string().optional(),
  temperature: z.number().optional(),
  uid: z.string().optional(),
  email: z.string().optional(),
  weekOffset: z.number().optional().default(0),
  dailyExecutedActivities: z.record(z.string(), z.any()).optional(),
  currentPlan: z.array(z.any()).optional(),
  blueprint: z.any().optional(),
  weeklyAvailability: z.record(z.string(), z.any()).optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  weight: z.number().optional(),
});

export type HeadCoachChatRequest = z.infer<typeof HeadCoachChatRequestSchema>;
