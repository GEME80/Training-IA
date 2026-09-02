import { AdminUserListItem, AdminStats, UserStatus, UserRole } from "@/lib/db/types";
import { AgentPromptsLibrary } from "@/lib/ai/prompts";
import { MacrocycleDefinition } from "@/lib/physiology/macrocycleLibrary";

export type AdminSidebarTab =
  | "dashboard"
  | "users"
  | "ai_settings"
  | "methodology_programs"
  | "scientific_models"
  | "program_libraries";
export type TokenPeriod = "daily" | "monthly" | "yearly";

export interface GeminiModelDto {
  id: string;
  displayName: string;
  description: string;
  category: string;
  isRecommended: boolean;
}

export interface GlobalAISettings {
  primaryModel: string;
  temperature: number;
  fallbackModels: string[];
  systemPrompt: string;
  hasCustomApiKey: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EnvCheckItem {
  key: string;
  configured: boolean;
  category: string;
  description: string;
}

export interface FirestoreStatsData {
  users: number;
  macrocycles: number;
  activityCache: number;
  mode: string;
  tier: string;
}

export interface TokenTelemetryData {
  period: TokenPeriod;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  requests: number;
  estimatedCostUsd: number;
  byModel: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }>;
  byFeature: Record<string, { promptTokens: number; candidatesTokens: number; totalTokens: number; requests: number; costUsd: number }>;
  timeline: { date?: string; month?: string; totalTokens: number; requests: number; costUsd: number }[];
}

export interface LiveConnectionsData {
  firebase: { service: string; status: string; latencyMs: number; projectId: string; tier: string };
  intervals: { service: string; status: string; latencyMs: number; hasApiKey: boolean; details?: { athleteId?: string; name?: string; city?: string; status?: string } };
  gemini: { service: string; status: string; latencyMs: number; hasApiKey: boolean };
}
