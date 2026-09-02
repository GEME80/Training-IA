import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { AthleteProfile, AthleteWellness, ActivitySummary } from "@/lib/intervals/types";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface WorkoutDiff {
  dayName: string;
  dayIndex: number;
  changeType: "MODIFIED" | "REPLACED" | "SWAPPED" | "REST_DAY";
  previous: {
    title: string;
    durationMinutes: number;
    tss: number;
    intensity: string;
    activityType: string;
  };
  proposed: {
    title: string;
    durationMinutes: number;
    tss: number;
    intensity: string;
    activityType: string;
    workoutStructure?: string;
  };
}

export interface HeadCoachChatRequest {
  athleteId?: string;
  apiKey?: string;
  customGeminiKey?: string;
  selectedModel?: string;
  messages?: ChatMessage[];
  weekOffset?: number;
  weekNumber?: number;
  targetRaces?: any[];
  macrocyclePhase?: MacrocyclePhaseInfo | null;
  weeklyAvailability?: WeeklyAvailabilityMap;
  currentPlan?: PlanItem[];
  runFtp?: number;
  bikeFtp?: number;
  isInitialAudit?: boolean;
  coachProfile?: string;
  customPrompt?: string;
  intentMode?: string;
  temperature?: number;
  fallbackModels?: string[];
  enableGrounding?: boolean;
}

export interface HeadCoachChatResponse {
  success: boolean;
  reply?: string;
  actionType?: "REVIEW_PHYSIOLOGY" | "CREATE_PLAN" | "ADAPT_WORKOUT" | "CONVERSATION" | "MODIFY_WORKOUT" | "REPLACE_WORKOUT";
  reasoning?: string | null;
  workoutDiff?: WorkoutDiff | null;
  audit?: {
    compliancePct: number;
    actualTss: number;
    plannedTss: number;
    ctl: string;
    atl: string;
    tsb: string;
    rampRate: string;
    feedback: string;
  };
  suggestedPlan?: PlanItem[] | null;
  quickReplies?: string[];
  modelUsed?: string;
  targetWeekNumber?: number;
  error?: string;
}
