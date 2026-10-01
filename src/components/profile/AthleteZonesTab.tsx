"use client";

import React from "react";
import { AthleteProfileHeroCard } from "./AthleteProfileHeroCard";
import { AthleteZonesViewer } from "./AthleteZonesViewer";
import { RunningTrainingMode } from "@/lib/db/types";
import { ThresholdSuggestionItem } from "./SuggestedThresholdBanner";

interface AthleteZonesTabProps {
  athleteName: string;
  email?: string;
  calculatedAge?: number;
  birthDate?: string;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
  runFtp: number;
  bikeFtp: number;
  lthr?: number;
  restingHR?: number;
  maxHR?: number;
  hasRunningPowerMeter: boolean;
  runningTrainingMode: RunningTrainingMode;
  runThresholdPaceStr: string;
  runThresholdPaceSecPerKm: number;
  swimCssSecPer100m?: number;
  swimCssStr?: string;
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  suggestedRunPace?: ThresholdSuggestionItem | null;
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  suggestedSwimCss?: ThresholdSuggestionItem | null;
  onNavigateToProfile: () => void;
  onToggleMode: (newMode: RunningTrainingMode) => void;
  onEditThreshold: (metric: "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR" | "SWIM_CSS") => void;
  onUpdateThreshold: (metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR" | "SWIM_CSS", val: string | number) => Promise<void>;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (suggestion: ThresholdSuggestionItem) => void;
}

export const AthleteZonesTab: React.FC<AthleteZonesTabProps> = ({
  athleteName,
  email,
  calculatedAge,
  birthDate,
  gender,
  weightKg,
  heightCm,
  runFtp,
  bikeFtp,
  lthr,
  restingHR,
  maxHR,
  hasRunningPowerMeter,
  runningTrainingMode,
  runThresholdPaceStr,
  runThresholdPaceSecPerKm,
  swimCssSecPer100m,
  swimCssStr,
  suggestedBikeFtp,
  suggestedRunPace,
  suggestedRunFtp,
  suggestedSwimCss,
  onNavigateToProfile,
  onToggleMode,
  onEditThreshold,
  onUpdateThreshold,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tarjeta Hero Principal con métricas y botones interactivos [ ✎ Ajustar ] */}
      <AthleteProfileHeroCard
        athleteName={athleteName}
        email={email}
        calculatedAge={calculatedAge}
        birthDate={birthDate}
        gender={gender}
        weightKg={weightKg}
        heightCm={heightCm}
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        lthr={lthr}
        restingHR={restingHR}
        maxHR={maxHR}
        hasRunningPowerMeter={hasRunningPowerMeter}
        runningTrainingMode={runningTrainingMode}
        runThresholdPaceStr={runThresholdPaceStr}
        runThresholdPaceSecPerKm={runThresholdPaceSecPerKm}
        swimCssSecPer100m={swimCssSecPer100m}
        swimCssStr={swimCssStr}
        onToggleMode={onToggleMode}
        onEditThreshold={onEditThreshold}
      />

      {/* Visor de las 5 tablas de zonas de entrenamiento fisiológicas */}
      <AthleteZonesViewer
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        lthr={lthr || 0}
        maxHR={maxHR || 0}
        hasRunningPowerMeter={hasRunningPowerMeter}
        runningTrainingMode={runningTrainingMode}
        runThresholdPaceStr={runThresholdPaceStr}
        runThresholdPaceSecPerKm={runThresholdPaceSecPerKm}
        swimCssSecPer100m={swimCssSecPer100m}
        swimCssStr={swimCssStr}
        onUpdateThreshold={onUpdateThreshold}
        suggestedBikeFtp={suggestedBikeFtp}
        suggestedRunPace={suggestedRunPace}
        suggestedRunFtp={suggestedRunFtp}
        suggestedSwimCss={suggestedSwimCss}
        onApplySuggestion={onApplySuggestion || (async (sug) => {
          if (sug.metric === "BIKE_FTP") await onUpdateThreshold("BIKE_FTP", Number(sug.suggestedValue));
          else if (sug.metric === "RUN_PACE") await onUpdateThreshold("RUN_PACE", String(sug.suggestedValue));
          else if (sug.metric === "RUN_FTP") await onUpdateThreshold("RUN_FTP", Number(sug.suggestedValue));
          else if (sug.metric === "SWIM_CSS") await onUpdateThreshold("SWIM_CSS", String(sug.suggestedValue));
        })}
        onDismissSuggestion={onDismissSuggestion}
      />
    </div>
  );
};
