import { WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { RunningTrainingMode } from "@/lib/db/types";
import { AthleteProfileFormData } from "../profile/AthleteEditProfileModal";
import { ThresholdSuggestionItem } from "../profile/SuggestedThresholdBanner";

export interface AthletePhysiologyViewProps {
  athleteId: string;
  athleteName?: string;
  email?: string;
  runFtp: number;
  bikeFtp: number;
  weightKg?: number;
  heightCm?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  restingHR?: number;
  lthr?: number;
  maxHR?: number;
  hasRunningPowerMeter?: boolean;
  runningTrainingMode?: RunningTrainingMode;
  runThresholdPaceStr?: string;
  runThresholdPaceSecPerKm?: number;
  apiKey?: string;
  ctl: number;
  atl: number;
  tsb: number;
  weeklyAvailability: WeeklyAvailabilityMap;
  visibleMetrics?: string[];
  isLiveConnected?: boolean;
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  suggestedRunPace?: ThresholdSuggestionItem | null;
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (suggestion: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (suggestion: ThresholdSuggestionItem) => void;
  onTestConnection?: (athleteId: string) => Promise<{ success: boolean; athleteName?: string; error?: string }>;
  onSave: (data: AthleteProfileFormData & { weeklyAvailability?: WeeklyAvailabilityMap }) => Promise<void>;
  onUpdateAvailability?: (newMap: WeeklyAvailabilityMap) => Promise<void>;
}
