"use client";

import React, { useMemo, useState } from "react";
import { Activity, Timer, Zap, Bike, Footprints, Waves } from "lucide-react";
import {
  calculatePaceZones,
  parsePaceToSeconds,
  calculateSwimCssZones,
  parseSwimPaceToSeconds,
  resolveRunningMode,
} from "@/lib/physiology/runningWorkoutAdapter";
import { RunningTrainingMode } from "@/lib/db/types";
import { ThresholdSuggestionItem } from "./SuggestedThresholdBanner";
import {
  RunningPaceZoneCard,
  RunningPowerZoneCard,
  CyclingPowerZoneCard,
  SwimmingCssZoneCard,
  HeartRateZoneCard,
  SwimPaceMilestonesCard,
} from "./SportZoneCards";
import { PowerDurationChart } from "./PowerDurationChart";
import { PaceDurationChart } from "./PaceDurationChart";
import { SportBestEffortsTable } from "./SportBestEffortsTable";
import { useAthleteCurves } from "@/hooks/useAthleteCurves";

export type SportViewTab = "RUN" | "BIKE" | "SWIM";

export interface AthleteZonesViewerProps {
  athleteId?: string;
  apiKey?: string;
  email?: string;
  weightKg?: number;
  runFtp: number;
  bikeFtp: number;
  lthr: number;
  maxHR: number;
  runningTrainingMode?: RunningTrainingMode;
  hasRunningPowerMeter?: boolean;
  runThresholdPaceSecPerKm?: number;
  runThresholdPaceStr?: string;
  swimCssSecPer100m?: number;
  swimCssStr?: string;
  onToggleMode?: (newMode: RunningTrainingMode) => void;
  onUpdateThreshold?: (metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR" | "SWIM_CSS", val: string | number) => Promise<void>;
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  suggestedRunPace?: ThresholdSuggestionItem | null;
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  suggestedSwimCss?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (suggestion: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (suggestion: ThresholdSuggestionItem) => void;
}

export const AthleteZonesViewer: React.FC<AthleteZonesViewerProps> = ({
  athleteId,
  apiKey,
  email,
  weightKg = 82,
  runFtp = 0,
  bikeFtp = 0,
  lthr = 0,
  maxHR = 0,
  runningTrainingMode,
  hasRunningPowerMeter,
  runThresholdPaceSecPerKm,
  runThresholdPaceStr,
  swimCssSecPer100m,
  swimCssStr,
  onToggleMode,
  suggestedBikeFtp,
  suggestedRunPace,
  suggestedRunFtp,
  suggestedSwimCss,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportViewTab>("RUN");
  const [runTelemetryMode, setRunTelemetryMode] = useState<"POWER" | "PACE">("POWER");

  const activeMode = resolveRunningMode({ hasRunningPowerMeter, runningTrainingMode, runFtp });
  const isPowerActive = activeMode === "POWER";
  const isHybridActive = activeMode === "HYBRID";
  const isPaceActive = activeMode === "PACE";

  const livePaceSec = runThresholdPaceSecPerKm || parsePaceToSeconds(runThresholdPaceStr) || 285;
  const liveSwimCssSec = swimCssSecPer100m || parseSwimPaceToSeconds(swimCssStr) || 105;

  const paceZones = useMemo(() => calculatePaceZones(livePaceSec), [livePaceSec]);
  const swimZones = useMemo(() => calculateSwimCssZones(liveSwimCssSec), [liveSwimCssSec]);

  const strydZones = useMemo(() => [
    { id: "Z1", name: "Fácil", nameColor: "text-amber-500 dark:text-amber-400", pct: "65 - 80 % CP", range: runFtp > 0 ? `${Math.round(runFtp * 0.65)} - ${Math.round(runFtp * 0.80)} W` : "—" },
    { id: "Z2", name: "Moderado", nameColor: "text-amber-600 dark:text-amber-300", pct: "80 - 90 % CP", range: runFtp > 0 ? `${Math.round(runFtp * 0.80)} - ${Math.round(runFtp * 0.90)} W` : "—" },
    { id: "Z3", name: "Umbral", nameColor: "text-orange-500 dark:text-orange-400", pct: "90 - 100 % CP", range: runFtp > 0 ? `${Math.round(runFtp * 0.90)} - ${runFtp} W` : "—" },
    { id: "Z4", name: "Intervalo", nameColor: "text-orange-600 dark:text-orange-500", pct: "100 - 115 % CP", range: runFtp > 0 ? `${runFtp} - ${Math.round(runFtp * 1.15)} W` : "—" },
    { id: "Z5", name: "Repetición", nameColor: "text-rose-600 dark:text-rose-400", pct: "115 - 300 % CP", range: runFtp > 0 ? `${Math.round(runFtp * 1.15)}+ W` : "—" },
    { id: "SS", name: "Sweet Spot", nameColor: "text-teal-600 dark:text-teal-400", pct: "84 - 97 % CP", range: runFtp > 0 ? `${Math.round(runFtp * 0.84)} - ${Math.round(runFtp * 0.97)} W` : "—" },
  ], [runFtp]);

  const cyclingZones = useMemo(() => [
    { id: "Z1", name: "Recuperación", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 55% FTP", range: bikeFtp > 0 ? `< ${Math.round(bikeFtp * 0.55)} W` : "—" },
    { id: "Z2", name: "Resistencia (Fondo)", nameColor: "text-sky-600 dark:text-sky-400", pct: "56 - 75% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.56)} - ${Math.round(bikeFtp * 0.75)} W` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "76 - 90% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.76)} - ${Math.round(bikeFtp * 0.90)} W` : "—" },
    { id: "Z4", name: "Umbral (FTP)", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "91 - 105% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 0.91)} - ${Math.round(bikeFtp * 1.05)} W` : "—" },
    { id: "Z5", name: "VO2max", nameColor: "text-amber-600 dark:text-amber-400", pct: "106 - 120% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 1.06)} - ${Math.round(bikeFtp * 1.20)} W` : "—" },
    { id: "Z6", name: "Cap. Anaeróbica", nameColor: "text-orange-600 dark:text-orange-400", pct: "121 - 150% FTP", range: bikeFtp > 0 ? `${Math.round(bikeFtp * 1.21)} - ${Math.round(bikeFtp * 1.50)} W` : "—" },
    { id: "Z7", name: "Neuromuscular", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 150% FTP", range: bikeFtp > 0 ? `> ${Math.round(bikeFtp * 1.50)} W` : "—" },
  ], [bikeFtp]);

  const hrZones = useMemo(() => [
    { id: "Z1", name: "Recovery", nameColor: "text-slate-600 dark:text-slate-400", pct: "0 - 83% LTHR", range: lthr > 0 ? `0 - ${Math.round(lthr * 0.83)} bpm` : "—" },
    { id: "Z2", name: "Aerobic", nameColor: "text-sky-600 dark:text-sky-400", pct: "83 - 88% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.83) + 1} - ${Math.round(lthr * 0.88)} bpm` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "88 - 92% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.88) + 1} - ${Math.round(lthr * 0.92)} bpm` : "—" },
    { id: "Z4", name: "SubThreshold", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "93 - 98% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.93)} - ${Math.round(lthr * 0.98)} bpm` : "—" },
    { id: "Z5", name: "SuperThreshold", nameColor: "text-amber-600 dark:text-amber-400", pct: "98 - 100% LTHR", range: lthr > 0 ? `${Math.round(lthr * 0.98) + 1} - ${lthr} bpm` : "—" },
    { id: "Z6", name: "Aerobic Capacity", nameColor: "text-orange-600 dark:text-orange-400", pct: "101 - 103% LTHR", range: lthr > 0 ? `${lthr + 1} - ${Math.round(lthr * 1.03)} bpm` : "—" },
    { id: "Z7", name: "Anaerobic", nameColor: "text-rose-600 dark:text-rose-400", pct: "104%+ LTHR", range: lthr > 0 ? `${Math.round(lthr * 1.04)} - ${maxHR > 0 ? `${maxHR} bpm` : "Máx"}` : "—" },
  ], [lthr, maxHR]);

  const { rideCurves, runCurves } = useAthleteCurves({ athleteId, apiKey, email, weightKg });

  return (
    <div className="space-y-4">
      {/* 1. Encabezado Maestro */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-sky-500" />
          Zonas de Entrenamiento Fisiológicas & Rendimiento (Intervals.icu)
        </h4>

        {onToggleMode && (
          <button
            type="button"
            onClick={() => onToggleMode(isPowerActive ? "HYBRID" : "POWER")}
            title="Haz clic para alternar entre Modo Potencia y Modo Ritmo"
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
              isPowerActive
                ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isPowerActive ? <Zap className="h-3 w-3 text-amber-500 fill-amber-500/30" /> : <Timer className="h-3 w-3 text-emerald-500" />}
            <span>Modo Activo: {isPowerActive ? "Potencia" : "Ritmo"}</span>
          </button>
        )}
      </div>

      {/* 2. Selector de Deportes (Carrera, Ciclismo, Natación) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedSport("RUN")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
            selectedSport === "RUN"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Footprints className="h-3.5 w-3.5" />
          <span>Carrera</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSport("BIKE")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
            selectedSport === "BIKE"
              ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-sky-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Bike className="h-3.5 w-3.5" />
          <span>Ciclismo</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSport("SWIM")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
            selectedSport === "SWIM"
              ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs border border-cyan-500/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Waves className="h-3.5 w-3.5" />
          <span>Natación</span>
        </button>
      </div>

      {/* 3. VISTA CARRERA */}
      {selectedSport === "RUN" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <RunningPaceZoneCard isPaceActive={isPaceActive} isHybridActive={isHybridActive} paceZones={paceZones} suggestedRunPace={suggestedRunPace} onApplySuggestion={onApplySuggestion} onDismissSuggestion={onDismissSuggestion} />
            <RunningPowerZoneCard isPowerActive={isPowerActive} strydZones={strydZones} suggestedRunFtp={suggestedRunFtp} onApplySuggestion={onApplySuggestion} onDismissSuggestion={onDismissSuggestion} />
            <HeartRateZoneCard isHybridActive={isHybridActive} hrZones={hrZones} sportContext="Carrera" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setRunTelemetryMode("POWER")}
                className={`px-3 py-1 rounded-md transition ${runTelemetryMode === "POWER" ? "bg-amber-500 text-slate-950 font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                Curva Potencia Stryd (CP)
              </button>
              <button
                type="button"
                onClick={() => setRunTelemetryMode("PACE")}
                className={`px-3 py-1 rounded-md transition ${runTelemetryMode === "PACE" ? "bg-emerald-500 text-white font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                Curva de Ritmo (Pace)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2">
              {runTelemetryMode === "POWER" ? (
                <PowerDurationChart recent42d={runCurves?.powerCurves?.recent42d} season={runCurves?.powerCurves?.season} thresholdFtp={runFtp} weightKg={weightKg} sportTitle="Carrera" />
              ) : (
                <PaceDurationChart recent42d={runCurves?.paceCurves?.recent42d} season={runCurves?.paceCurves?.season} thresholdPaceSec={livePaceSec} thresholdPaceStr={runThresholdPaceStr || "4:45/km"} />
              )}
            </div>
            <div className="lg:col-span-1">
              <SportBestEffortsTable bestEfforts={runCurves?.bestEfforts} recent42d={runCurves?.powerCurves?.recent42d} season={runCurves?.powerCurves?.season} weightKg={weightKg} sportTitle="Carrera" />
            </div>
          </div>
        </div>
      )}

      {/* 4. VISTA CICLISMO */}
      {selectedSport === "BIKE" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <CyclingPowerZoneCard cyclingZones={cyclingZones} suggestedBikeFtp={suggestedBikeFtp} onApplySuggestion={onApplySuggestion} onDismissSuggestion={onDismissSuggestion} />
            <HeartRateZoneCard isHybridActive={isHybridActive} hrZones={hrZones} sportContext="Ciclismo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2">
              <PowerDurationChart recent42d={rideCurves?.powerCurves?.recent42d} season={rideCurves?.powerCurves?.season} thresholdFtp={bikeFtp} weightKg={weightKg} sportTitle="Ciclismo" />
            </div>
            <div className="lg:col-span-1">
              <SportBestEffortsTable bestEfforts={rideCurves?.bestEfforts} recent42d={rideCurves?.powerCurves?.recent42d} season={rideCurves?.powerCurves?.season} weightKg={weightKg} sportTitle="Ciclismo" />
            </div>
          </div>
        </div>
      )}

      {/* 5. VISTA NATACIÓN */}
      {selectedSport === "SWIM" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <SwimmingCssZoneCard swimZones={swimZones} suggestedSwimCss={suggestedSwimCss} onApplySuggestion={onApplySuggestion} onDismissSuggestion={onDismissSuggestion} />
            <SwimPaceMilestonesCard swimCssSec={liveSwimCssSec} swimCssStr={swimCssStr || "1:45"} />
          </div>
        </div>
      )}
    </div>
  );
};
