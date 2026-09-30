"use client";

import React, { useMemo } from "react";
import { Footprints, Bike, HeartPulse, Activity, Timer, Waves } from "lucide-react";
import {
  calculatePaceZones,
  parsePaceToSeconds,
  calculateSwimCssZones,
  parseSwimPaceToSeconds,
  resolveRunningMode,
} from "@/lib/physiology/runningWorkoutAdapter";
import { RunningTrainingMode } from "@/lib/db/types";

import { EditableZoneCardHeader } from "./EditableZoneCardHeader";
import { SuggestedThresholdBanner, ThresholdSuggestionItem } from "./SuggestedThresholdBanner";

export interface AthleteZonesViewerProps {
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
  onUpdateThreshold?: (metric: "RUN_PACE" | "RUN_FTP" | "BIKE_FTP" | "LTHR" | "SWIM_CSS", val: string | number) => Promise<void>;
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  suggestedRunPace?: ThresholdSuggestionItem | null;
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  suggestedSwimCss?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (suggestion: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (suggestion: ThresholdSuggestionItem) => void;
}

export const AthleteZonesViewer: React.FC<AthleteZonesViewerProps> = ({
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
  onUpdateThreshold,
  suggestedBikeFtp,
  suggestedRunPace,
  suggestedRunFtp,
  suggestedSwimCss,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const activeMode = resolveRunningMode({
    hasRunningPowerMeter,
    runningTrainingMode,
    runFtp,
  });

  const [livePaceSec, setLivePaceSec] = React.useState<number>(runThresholdPaceSecPerKm || parsePaceToSeconds(runThresholdPaceStr));
  const [liveRunFtp, setLiveRunFtp] = React.useState<number>(runFtp || 0);
  const [liveBikeFtp, setLiveBikeFtp] = React.useState<number>(bikeFtp || 0);
  const [liveLthr, setLiveLthr] = React.useState<number>(lthr || 0);
  const [liveSwimCssSec, setLiveSwimCssSec] = React.useState<number>(swimCssSecPer100m || parseSwimPaceToSeconds(swimCssStr));

  React.useEffect(() => {
    if (runThresholdPaceSecPerKm) setLivePaceSec(runThresholdPaceSecPerKm);
    else if (runThresholdPaceStr) setLivePaceSec(parsePaceToSeconds(runThresholdPaceStr));
  }, [runThresholdPaceStr, runThresholdPaceSecPerKm]);

  React.useEffect(() => {
    if (swimCssSecPer100m) setLiveSwimCssSec(swimCssSecPer100m);
    else if (swimCssStr) setLiveSwimCssSec(parseSwimPaceToSeconds(swimCssStr));
  }, [swimCssStr, swimCssSecPer100m]);

  React.useEffect(() => { setLiveRunFtp(runFtp || 0); }, [runFtp]);
  React.useEffect(() => { setLiveBikeFtp(bikeFtp || 0); }, [bikeFtp]);
  React.useEffect(() => { setLiveLthr(lthr || 0); }, [lthr]);

  const paceZones = useMemo(() => calculatePaceZones(livePaceSec || 285), [livePaceSec]);
  const swimZones = useMemo(() => calculateSwimCssZones(liveSwimCssSec || 105), [liveSwimCssSec]);

  // 1. ZONAS RUNNING POWER
  const strydZones = [
    { id: "Z1", name: "Fácil", nameColor: "text-amber-500 dark:text-amber-400", pct: "65 - 80 % CP", range: liveRunFtp > 0 ? `${Math.round(liveRunFtp * 0.65)} - ${Math.round(liveRunFtp * 0.80)} W` : "—" },
    { id: "Z2", name: "Moderado", nameColor: "text-amber-600 dark:text-amber-300", pct: "80 - 90 % CP", range: liveRunFtp > 0 ? `${Math.round(liveRunFtp * 0.80)} - ${Math.round(liveRunFtp * 0.90)} W` : "—" },
    { id: "Z3", name: "Umbral", nameColor: "text-orange-500 dark:text-orange-400", pct: "90 - 100 % CP", range: liveRunFtp > 0 ? `${Math.round(liveRunFtp * 0.90)} - ${liveRunFtp} W` : "—" },
    { id: "Z4", name: "Intervalo", nameColor: "text-orange-600 dark:text-orange-500", pct: "100 - 115 % CP", range: liveRunFtp > 0 ? `${liveRunFtp} - ${Math.round(liveRunFtp * 1.15)} W` : "—" },
    { id: "Z5", name: "Repetición", nameColor: "text-rose-600 dark:text-rose-400", pct: "115 - 300 % CP", range: liveRunFtp > 0 ? `${Math.round(liveRunFtp * 1.15)}+ W` : "—" },
    { id: "SS", name: "Sweet Spot", nameColor: "text-teal-600 dark:text-teal-400", pct: "84 - 97 % CP", range: liveRunFtp > 0 ? `${Math.round(liveRunFtp * 0.84)} - ${Math.round(liveRunFtp * 0.97)} W` : "—" },
  ];

  // 2. ZONAS CICLISMO POWER COGGAN
  const cyclingZones = [
    { id: "Z1", name: "Recuperación", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 55% FTP", range: liveBikeFtp > 0 ? `< ${Math.round(liveBikeFtp * 0.55)} W` : "—" },
    { id: "Z2", name: "Resistencia (Fondo)", nameColor: "text-sky-600 dark:text-sky-400", pct: "56 - 75% FTP", range: liveBikeFtp > 0 ? `${Math.round(liveBikeFtp * 0.56)} - ${Math.round(liveBikeFtp * 0.75)} W` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "76 - 90% FTP", range: liveBikeFtp > 0 ? `${Math.round(liveBikeFtp * 0.76)} - ${Math.round(liveBikeFtp * 0.90)} W` : "—" },
    { id: "Z4", name: "Umbral (FTP)", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "91 - 105% FTP", range: liveBikeFtp > 0 ? `${Math.round(liveBikeFtp * 0.91)} - ${Math.round(liveBikeFtp * 1.05)} W` : "—" },
    { id: "Z5", name: "VO2max", nameColor: "text-amber-600 dark:text-amber-400", pct: "106 - 120% FTP", range: liveBikeFtp > 0 ? `${Math.round(liveBikeFtp * 1.06)} - ${Math.round(liveBikeFtp * 1.20)} W` : "—" },
    { id: "Z6", name: "Cap. Anaeróbica", nameColor: "text-orange-600 dark:text-orange-400", pct: "121 - 150% FTP", range: liveBikeFtp > 0 ? `${Math.round(liveBikeFtp * 1.21)} - ${Math.round(liveBikeFtp * 1.50)} W` : "—" },
    { id: "Z7", name: "Neuromuscular", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 150% FTP", range: liveBikeFtp > 0 ? `> ${Math.round(liveBikeFtp * 1.50)} W` : "—" },
  ];

  // 3. ZONAS FRECUENCIA CARDÍACA
  const hrZones = [
    { id: "Z1", name: "Recovery", nameColor: "text-slate-600 dark:text-slate-400", pct: "0 - 83% LTHR", range: liveLthr > 0 ? `0 - ${Math.round(liveLthr * 0.83)} bpm` : "—" },
    { id: "Z2", name: "Aerobic", nameColor: "text-sky-600 dark:text-sky-400", pct: "83 - 88% LTHR", range: liveLthr > 0 ? `${Math.round(liveLthr * 0.83) + 1} - ${Math.round(liveLthr * 0.88)} bpm` : "—" },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "88 - 92% LTHR", range: liveLthr > 0 ? `${Math.round(liveLthr * 0.88) + 1} - ${Math.round(liveLthr * 0.92)} bpm` : "—" },
    { id: "Z4", name: "SubThreshold", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "93 - 98% LTHR", range: liveLthr > 0 ? `${Math.round(liveLthr * 0.93)} - ${Math.round(liveLthr * 0.98)} bpm` : "—" },
    { id: "Z5", name: "SuperThreshold", nameColor: "text-amber-600 dark:text-amber-400", pct: "98 - 100% LTHR", range: liveLthr > 0 ? `${Math.round(liveLthr * 0.98) + 1} - ${liveLthr} bpm` : "—" },
    { id: "Z6", name: "Aerobic Capacity", nameColor: "text-orange-600 dark:text-orange-400", pct: "101 - 103% LTHR", range: liveLthr > 0 ? `${liveLthr + 1} - ${Math.round(liveLthr * 1.03)} bpm` : "—" },
    { id: "Z7", name: "Anaerobic", nameColor: "text-rose-600 dark:text-rose-400", pct: "104%+ LTHR", range: liveLthr > 0 ? `${Math.round(liveLthr * 1.04)} - ${maxHR > 0 ? `${maxHR} bpm` : "Máx"}` : "—" },
  ];

  const isPowerActive = activeMode === "POWER";
  const isHybridActive = activeMode === "HYBRID";

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-sky-500" />
          Zonas de Entrenamiento Fisiológicas (Intervals.icu)
        </h4>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {isPowerActive ? "⚡ Modo Activo: Potencia Carrera" : "⏱️❤️ Modo Activo: Híbrido (Ritmo + FC)"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {/* COLUMNA 1: ZONAS POR RITMO */}
        <div className={`rounded-2xl border ${isHybridActive ? "border-2 border-emerald-500/80 dark:border-emerald-500/60 ring-2 ring-emerald-500/10" : "border-slate-200 dark:border-slate-800"} bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}>
          <EditableZoneCardHeader
            icon={Timer}
            iconBgColor={isHybridActive ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-slate-800"}
            iconColor={isHybridActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}
            title="Ritmo Carrera"
            subtitle="Min/km por Zona"
            modeBadge={isHybridActive ? <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white leading-none">ACTIVA SERIES</span> : <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 leading-none">DANIELS</span>}
          />
          {suggestedRunPace && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedRunPace} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}
          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {paceZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 hidden 2xl:inline">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2: POTENCIA CARRERA */}
        <div className={`rounded-2xl border ${isPowerActive ? "border-2 border-amber-500/80 dark:border-amber-500/60 ring-2 ring-amber-500/10" : "border-slate-200 dark:border-slate-800 opacity-80"} bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}>
          <EditableZoneCardHeader
            icon={Footprints}
            iconBgColor={isPowerActive ? "bg-amber-500/10" : "bg-slate-100 dark:bg-slate-800"}
            iconColor={isPowerActive ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}
            title="Potencia Carrera"
            subtitle="Watts por Zona"
            modeBadge={isPowerActive ? <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 leading-none">ACTIVA RUN</span> : <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 leading-none">CP/FTP</span>}
          />
          {suggestedRunFtp && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedRunFtp} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}
          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {strydZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 hidden 2xl:inline">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: FRECUENCIA CARDÍACA */}
        <div className={`rounded-2xl border ${isHybridActive ? "border-2 border-rose-500/80 dark:border-rose-500/60 ring-2 ring-rose-500/10" : "border-slate-200 dark:border-slate-800"} bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}>
          <EditableZoneCardHeader
            icon={HeartPulse}
            iconBgColor={isHybridActive ? "bg-rose-500/10" : "bg-slate-100 dark:bg-slate-800"}
            iconColor={isHybridActive ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}
            title="Frecuencia Cardíaca"
            subtitle="7 Zonas LTHR"
            modeBadge={isHybridActive ? <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white leading-none">ACTIVA FONDOS</span> : undefined}
          />
          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {hrZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden 2xl:inline">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 4: CICLISMO POWER (FTP) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
          <EditableZoneCardHeader
            icon={Bike}
            iconBgColor="bg-sky-500/10"
            iconColor="text-sky-600 dark:text-sky-400"
            title="Potencia Ciclismo"
            subtitle="Coggan Power"
            modeBadge={<span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500 text-white leading-none">ACTIVA BICI</span>}
          />
          {suggestedBikeFtp && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedBikeFtp} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}
          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {cyclingZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden 2xl:inline">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 5: NATACIÓN CSS */}
        <div className="rounded-2xl border border-cyan-500/30 dark:border-cyan-500/20 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
          <EditableZoneCardHeader
            icon={Waves}
            iconBgColor="bg-cyan-500/10"
            iconColor="text-cyan-600 dark:text-cyan-400"
            title="Ritmo Natación"
            subtitle="CSS / 100m"
            modeBadge={<span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-white leading-none">ACTIVA NADO</span>}
          />
          {suggestedSwimCss && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedSwimCss} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}
          <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {swimZones.map((z) => (
              <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
                  <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden 2xl:inline">{z.pct}</span>
                  <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
