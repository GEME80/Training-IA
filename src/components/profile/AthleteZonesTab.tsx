"use client";

import React, { useState } from "react";
import { RunningTrainingMode } from "@/lib/db/types";
import { parsePaceToSeconds, parseSwimPaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";
import { ThresholdSuggestionItem } from "./SuggestedThresholdBanner";
import { AthleteBiometricsBar } from "./AthleteBiometricsBar";
import { SportContextSelector, SportContextType } from "./SportContextSelector";
import { ContextualThresholdsGrid } from "./ContextualThresholdsGrid";
import { DynamicZonesTable } from "./DynamicZonesTable";
import { PowerDurationChart } from "./PowerDurationChart";
import { PaceDurationChart } from "./PaceDurationChart";
import { SportBestEffortsTable } from "./SportBestEffortsTable";
import { PaceBestEffortsTable } from "./PaceBestEffortsTable";
import { useAthleteCurves } from "@/hooks/useAthleteCurves";
import { ChevronDown, BarChart3 } from "lucide-react";

interface AthleteZonesTabProps {
  athleteId?: string;
  apiKey?: string;
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
  onEditThreshold: (metric: "RUN_FTP" | "RUN_PACE" | "BIKE_FTP" | "LTHR" | "SWIM_CSS" | "RESTING_HR" | "MAX_HR") => void;
  onUpdateThreshold: (metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR" | "SWIM_CSS" | "RESTING_HR" | "MAX_HR", val: string | number) => Promise<void>;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (suggestion: ThresholdSuggestionItem) => void;
}

export const AthleteZonesTab: React.FC<AthleteZonesTabProps> = ({
  athleteId,
  apiKey,
  athleteName,
  email,
  calculatedAge,
  gender,
  weightKg = 82,
  heightCm = 185,
  runFtp = 336,
  bikeFtp = 226,
  lthr = 178,
  restingHR = 54,
  maxHR = 185,
  runningTrainingMode,
  runThresholdPaceStr = "4:23",
  runThresholdPaceSecPerKm,
  swimCssSecPer100m,
  swimCssStr = "2:10",
  suggestedBikeFtp,
  suggestedRunPace,
  suggestedRunFtp,
  suggestedSwimCss,
  onToggleMode,
  onEditThreshold,
  onUpdateThreshold,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportContextType>("RUN");
  const [runTelemetryMode, setRunTelemetryMode] = useState<"POWER" | "PACE">(
    runningTrainingMode === "PACE" ? "PACE" : "POWER"
  );
  const [bikeTelemetryMode, setBikeTelemetryMode] = useState<"POWER" | "HR">("POWER");
  const [showCurvesAccordion, setShowCurvesAccordion] = useState(false);

  const livePaceSec = runThresholdPaceSecPerKm || parsePaceToSeconds(runThresholdPaceStr) || 263;
  const liveSwimCssSec = swimCssSecPer100m || parseSwimPaceToSeconds(swimCssStr) || 130;
  const safeLthr = lthr && maxHR && lthr > maxHR ? maxHR : lthr;
  const safeMaxHR = lthr && maxHR && lthr > maxHR ? lthr : maxHR;

  const { rideCurves, runCurves } = useAthleteCurves({ athleteId, apiKey, email, weightKg });

  const handleToggleRunMode = (mode: "POWER" | "PACE") => {
    setRunTelemetryMode(mode);
    onToggleMode(mode);
  };

  return (
    <div className="space-y-4 animate-fadeIn select-none">
      {/* ── 1. LIMPIEZA DE CABECERA: Identidad & Biometría pura ── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <AthleteBiometricsBar
          athleteName={athleteName}
          calculatedAge={calculatedAge}
          gender={gender}
          weightKg={weightKg}
          heightCm={heightCm}
        />
      </div>

      {/* ── 2. SELECTOR MAESTRO DE DEPORTE ([ 🏃 Carrera ] | [ 🚴 Ciclismo ] | [ 🏊 Natación ]) ── */}
      <SportContextSelector
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
      />

      {/* ── 3. TARJETAS DE UMBRALES CONTEXTUALES ([ ▾ Umbrales de [Deporte] ]) ── */}
      <ContextualThresholdsGrid
        selectedSport={selectedSport}
        weightKg={weightKg}
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        lthr={safeLthr}
        maxHR={safeMaxHR}
        restingHR={restingHR}
        runThresholdPaceStr={runThresholdPaceStr}
        swimCssStr={swimCssStr}
        runTelemetryMode={runTelemetryMode}
        onToggleRunMode={handleToggleRunMode}
        bikeTelemetryMode={bikeTelemetryMode}
        onToggleBikeMode={setBikeTelemetryMode}
        onEditThreshold={onEditThreshold}
      />

      {/* ── 4. TABLAS DE ZONAS FISIOLÓGICAS CONTINUAS (Coggan / Daniels / CSS) ── */}
      <DynamicZonesTable
        selectedSport={selectedSport}
        runTelemetryMode={runTelemetryMode}
        bikeTelemetryMode={bikeTelemetryMode}
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        livePaceSec={livePaceSec}
        liveSwimCssSec={liveSwimCssSec}
        swimCssStr={swimCssStr}
        lthr={safeLthr}
        maxHR={safeMaxHR}
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

      {/* ── 5. CURVAS DE TELEMETRÍA Y MEJORES MARCAS (Carrera & Ciclismo) ── */}
      {(selectedSport === "RUN" || selectedSport === "BIKE") && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setShowCurvesAccordion((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {showCurvesAccordion ? "▾" : "▸"} Curvas de Potencia / Ritmo y Récords Históricos ({selectedSport === "RUN" ? "Carrera" : "Ciclismo"})
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                showCurvesAccordion ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCurvesAccordion && (
            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn space-y-4">
              {selectedSport === "RUN" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2">
                    {runTelemetryMode === "POWER" ? (
                      <PowerDurationChart
                        recent42d={runCurves?.powerCurves?.recent42d}
                        season={runCurves?.powerCurves?.season}
                        thresholdFtp={runFtp}
                        weightKg={weightKg}
                        sportTitle="Carrera"
                      />
                    ) : (
                      <PaceDurationChart
                        recent42d={runCurves?.paceCurves?.recent42d}
                        season={runCurves?.paceCurves?.season}
                        thresholdPaceSec={livePaceSec}
                        thresholdPaceStr={runThresholdPaceStr}
                      />
                    )}
                  </div>
                  <div className="lg:col-span-1">
                    {runTelemetryMode === "POWER" ? (
                      <SportBestEffortsTable
                        bestEfforts={runCurves?.bestEfforts}
                        recent42d={runCurves?.powerCurves?.recent42d}
                        season={runCurves?.powerCurves?.season}
                        weightKg={weightKg}
                        sportTitle="Carrera"
                      />
                    ) : (
                      <PaceBestEffortsTable
                        recent42d={runCurves?.paceCurves?.recent42d}
                        season={runCurves?.paceCurves?.season}
                        thresholdPaceSec={livePaceSec}
                        thresholdPaceStr={runThresholdPaceStr}
                      />
                    )}
                  </div>
                </div>
              )}

              {selectedSport === "BIKE" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2">
                    <PowerDurationChart
                      recent42d={rideCurves?.powerCurves?.recent42d}
                      season={rideCurves?.powerCurves?.season}
                      thresholdFtp={bikeFtp}
                      weightKg={weightKg}
                      sportTitle="Ciclismo"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <SportBestEffortsTable
                      bestEfforts={rideCurves?.bestEfforts}
                      recent42d={rideCurves?.powerCurves?.recent42d}
                      season={rideCurves?.powerCurves?.season}
                      weightKg={weightKg}
                      sportTitle="Ciclismo"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
