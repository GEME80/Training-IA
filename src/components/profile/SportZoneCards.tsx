"use client";

import React from "react";
import { Timer, Footprints, Bike, Waves, HeartPulse } from "lucide-react";
import { EditableZoneCardHeader } from "./EditableZoneCardHeader";
import { SuggestedThresholdBanner, ThresholdSuggestionItem } from "./SuggestedThresholdBanner";

export interface ZoneItem {
  id: string;
  name: string;
  nameColor: string;
  pct: string;
  range: string;
}

export const RunningPaceZoneCard: React.FC<{
  isPaceActive: boolean;
  isHybridActive: boolean;
  paceZones: ZoneItem[];
  suggestedRunPace?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (sug: ThresholdSuggestionItem) => void;
}> = ({ isPaceActive, isHybridActive, paceZones, suggestedRunPace, onApplySuggestion, onDismissSuggestion }) => (
  <div
    className={`rounded-2xl border ${
      isPaceActive || isHybridActive
        ? "border-2 border-emerald-500/80 dark:border-emerald-500/60 ring-2 ring-emerald-500/10"
        : "border-slate-200 dark:border-slate-800 opacity-80"
    } bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}
  >
    <EditableZoneCardHeader
      icon={Timer}
      iconBgColor={isPaceActive || isHybridActive ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-slate-800"}
      iconColor={isPaceActive || isHybridActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}
      title="Ritmo Carrera"
      subtitle="Min/km por Zona (Inverso 1/v)"
      modeBadge={
        isPaceActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white leading-none">
            ACTIVA RITMO
          </span>
        ) : isHybridActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white leading-none">
            ACTIVA SERIES
          </span>
        ) : (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 leading-none">
            DANIELS
          </span>
        )
      }
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
            <span className="text-[10px] text-slate-400 hidden xl:inline">{z.pct}</span>
            <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const RunningPowerZoneCard: React.FC<{
  isPowerActive: boolean;
  strydZones: ZoneItem[];
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (sug: ThresholdSuggestionItem) => void;
}> = ({ isPowerActive, strydZones, suggestedRunFtp, onApplySuggestion, onDismissSuggestion }) => (
  <div
    className={`rounded-2xl border ${
      isPowerActive
        ? "border-2 border-amber-500/80 dark:border-amber-500/60 ring-2 ring-amber-500/10"
        : "border-slate-200 dark:border-slate-800 opacity-80"
    } bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}
  >
    <EditableZoneCardHeader
      icon={Footprints}
      iconBgColor={isPowerActive ? "bg-amber-500/10" : "bg-slate-100 dark:bg-slate-800"}
      iconColor={isPowerActive ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}
      title="Potencia Carrera"
      subtitle="Watts por Zona (Stryd)"
      modeBadge={
        isPowerActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 leading-none">
            ACTIVA RUN
          </span>
        ) : (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 leading-none">
            CP/FTP
          </span>
        )
      }
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
            <span className="text-[10px] text-slate-400 hidden xl:inline">{z.pct}</span>
            <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CyclingPowerZoneCard: React.FC<{
  cyclingZones: ZoneItem[];
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (sug: ThresholdSuggestionItem) => void;
}> = ({ cyclingZones, suggestedBikeFtp, onApplySuggestion, onDismissSuggestion }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
    <EditableZoneCardHeader
      icon={Bike}
      iconBgColor="bg-sky-500/10"
      iconColor="text-sky-600 dark:text-sky-400"
      title="Potencia Ciclismo"
      subtitle="Coggan Power (FTP)"
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
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:inline">{z.pct}</span>
            <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SwimmingCssZoneCard: React.FC<{
  swimZones: ZoneItem[];
  suggestedSwimCss?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (sug: ThresholdSuggestionItem) => void;
}> = ({ swimZones, suggestedSwimCss, onApplySuggestion, onDismissSuggestion }) => (
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
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:inline">{z.pct}</span>
            <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const HeartRateZoneCard: React.FC<{
  isHybridActive: boolean;
  hrZones: ZoneItem[];
  sportContext?: string;
}> = ({ isHybridActive, hrZones, sportContext }) => (
  <div
    className={`rounded-2xl border ${
      isHybridActive
        ? "border-2 border-rose-500/80 dark:border-rose-500/60 ring-2 ring-rose-500/10"
        : "border-slate-200 dark:border-slate-800"
    } bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs`}
  >
    <EditableZoneCardHeader
      icon={HeartPulse}
      iconBgColor={isHybridActive ? "bg-rose-500/10" : "bg-slate-100 dark:bg-slate-800"}
      iconColor={isHybridActive ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}
      title={`Frecuencia Cardíaca${sportContext ? ` (${sportContext})` : ""}`}
      subtitle="7 Zonas LTHR"
      modeBadge={
        isHybridActive ? (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white leading-none">
            ACTIVA FONDOS
          </span>
        ) : undefined
      }
    />
    <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
      {hrZones.map((z) => (
        <div key={z.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 w-5">{z.id}</span>
            <span className={`font-bold ${z.nameColor}`}>{z.name}</span>
          </div>
          <div className="text-right flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:inline">{z.pct}</span>
            <strong className="text-slate-900 dark:text-white text-[11px]">{z.range}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SwimPaceMilestonesCard: React.FC<{
  swimCssSec: number;
  swimCssStr: string;
}> = ({ swimCssSec, swimCssStr }) => {
  const milestones = [
    { label: "50m", sec: Math.round(swimCssSec * 0.5) },
    { label: "100m (CSS)", sec: swimCssSec },
    { label: "200m", sec: Math.round(swimCssSec * 2) },
    { label: "400m", sec: Math.round(swimCssSec * 4) },
    { label: "800m", sec: Math.round(swimCssSec * 8) },
    { label: "1500m", sec: Math.round(swimCssSec * 15) },
  ];

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono flex items-center gap-1.5">
          <Waves className="h-4 w-4 text-cyan-500" />
          <span>Tiempos de Paso por Distancia (CSS {swimCssStr}/100m)</span>
        </h4>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
          SWIM PACING
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {milestones.map((m) => (
          <div key={m.label} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">{m.label}</span>
            <span className="text-xs font-black font-mono text-cyan-600 dark:text-cyan-400">{formatSec(m.sec)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

