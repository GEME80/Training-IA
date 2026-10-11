"use client";

import React, { useState } from "react";
import { Timer, Zap, Heart, Flame, HelpCircle, X, Activity } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { buildTelemetryMetricItems, TelemetryMetricItem } from "./workoutTelemetryHelpers";

interface ExecutedWorkoutHudProps {
  activity: DailyExecutedActivity;
  discipline?: string;
  isExtraActivity?: boolean;
  executedTss?: number;
  plannedTss?: number;
}

export const ExecutedWorkoutHud: React.FC<ExecutedWorkoutHudProps> = ({
  activity,
  discipline,
  isExtraActivity,
  executedTss,
  plannedTss,
}) => {
  const [showGlossary, setShowGlossary] = useState(false);
  const metricItems = buildTelemetryMetricItems(activity, discipline);

  // Filtramos métricas primarias y secundarias
  const paceItem = metricItems.find((m) => m.badgeType === "pace");
  const powerItem = metricItems.find((m) => m.badgeType === "power");
  const hrItem = metricItems.find((m) => m.badgeType === "hr");
  const durationItem = metricItems.find((m) => m.badgeType === "duration");

  const secondaryItems = metricItems.filter(
    (m) => !["pace", "power", "hr", "duration"].includes(m.badgeType)
  );

  return (
    <div className="rounded-2xl bg-slate-900 text-white dark:bg-slate-950 p-3 sm:p-4 border border-slate-800 shadow-sm space-y-2.5">
      {/* Header técnico minimalista */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-black truncate">{activity.name}</span>
          <span className="text-[10px] font-mono text-slate-400 truncate shrink-0">
            • {activity.deviceName || "Intervals Sync"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
            title="Ver glosario de métricas"
          >
            <HelpCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Glosario</span>
          </button>
          <span className="font-mono text-[11px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/80">
            {isExtraActivity ? `⚡ ${executedTss} TSS` : `⚡ ${executedTss} / ${plannedTss} TSS`}
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principales (Big 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {/* 1. Ritmo / Velocidad */}
        <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider">{paceItem?.label || "Ritmo"}</span>
            <Timer className="h-3 w-3 text-cyan-400" />
          </div>
          <div className="text-sm sm:text-base font-black text-cyan-300 truncate">
            {paceItem?.value || "—"}
          </div>
          {paceItem?.subtext && (
            <div className="text-[9px] text-slate-400 truncate mt-0.5">{paceItem.subtext}</div>
          )}
        </div>

        {/* 2. Potencia */}
        <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider">Potencia</span>
            <Zap className="h-3 w-3 text-amber-400" />
          </div>
          <div className="text-sm sm:text-base font-black text-amber-300 truncate">
            {powerItem?.value || "—"}
          </div>
          {powerItem?.subtext && (
            <div className="text-[9px] text-slate-400 truncate mt-0.5">{powerItem.subtext}</div>
          )}
        </div>

        {/* 3. Cardio */}
        <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider">Cardio (FC)</span>
            <Heart className="h-3 w-3 text-rose-400" />
          </div>
          <div className="text-sm sm:text-base font-black text-rose-300 truncate">
            {hrItem?.value || "—"}
          </div>
          {hrItem?.subtext && (
            <div className="text-[9px] text-slate-400 truncate mt-0.5">{hrItem.subtext}</div>
          )}
        </div>

        {/* 4. Duración / Distancia */}
        <div className="bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider">Volumen</span>
            <Flame className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-300 truncate">
            {durationItem?.value || "—"}
          </div>
          {durationItem?.subtext && (
            <div className="text-[9px] text-slate-400 truncate mt-0.5">{durationItem.subtext}</div>
          )}
        </div>
      </div>

      {/* Fila compacta de Métricas Secundarias */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
        {secondaryItems.map((sec) => (
          <div
            key={sec.id}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/60"
          >
            <span className="text-slate-400 text-[9px] uppercase font-sans">{sec.label}:</span>
            <span className="font-bold text-white">{sec.value}</span>
            {sec.subtext && <span className="text-slate-400 text-[9px]">({sec.subtext})</span>}
          </div>
        ))}
      </div>

      {/* Glosario desplegable bajo demanda */}
      {showGlossary && (
        <div className="mt-2 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-sans space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-1">
            <span>Glosario Pedagógico de Métricas</span>
            <button
              type="button"
              onClick={() => setShowGlossary(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-300 leading-snug">
            {metricItems.map((item) => (
              <div key={item.id} className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-0.5 font-mono">{item.label}</span>
                <p className="text-slate-300">{item.athleteExplanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
