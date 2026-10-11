"use client";

import React, { useState } from "react";
import { Timer, Zap, Heart, Flame, HelpCircle, X, Activity, Cpu } from "lucide-react";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { buildTelemetryMetricItems } from "./workoutTelemetryHelpers";

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

  const paceItem = metricItems.find((m) => m.badgeType === "pace");
  const powerItem = metricItems.find((m) => m.badgeType === "power");
  const hrItem = metricItems.find((m) => m.badgeType === "hr");
  const durationItem = metricItems.find((m) => m.badgeType === "duration");

  const secondaryItems = metricItems.filter(
    (m) => !["pace", "power", "hr", "duration"].includes(m.badgeType)
  );

  return (
    <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
      {/* Cabecera del HUD: Nombre de la actividad + Dispositivo + Carga TSS */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-2 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              {activity.name || "Actividad Ejecutada"}
            </h4>
          </div>
          <span className="font-mono text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-300/80 dark:border-emerald-800/80 shrink-0">
            {isExtraActivity ? `⚡ ${executedTss} TSS` : `⚡ ${executedTss} / ${plannedTss} TSS`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-1 truncate">
            <Cpu className="h-3 w-3 shrink-0" />
            <span className="truncate">{activity.deviceName || "Intervals Sync"}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGlossary(!showGlossary)}
            className="text-[10px] font-mono font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer shrink-0"
            title="Ver glosario de métricas"
          >
            <HelpCircle className="h-3 w-3" />
            <span>{showGlossary ? "Ocultar Guía" : "¿Qué significa cada dato?"}</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principales (Big 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {/* 1. Ritmo / Velocidad */}
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider truncate">{paceItem?.label || "Ritmo"}</span>
            <Timer className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400 truncate">
            {paceItem?.value || "—"}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5 min-h-[14px]">
            {paceItem?.subtext || ""}
          </div>
        </div>

        {/* 2. Potencia */}
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider truncate">Potencia</span>
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 truncate">
            {powerItem?.value || "—"}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5 min-h-[14px]">
            {powerItem?.subtext || ""}
          </div>
        </div>

        {/* 3. Cardio (FC) */}
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider truncate">Cardio (FC)</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 truncate">
            {hrItem?.value || "—"}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5 min-h-[14px]">
            {hrItem?.subtext || ""}
          </div>
        </div>

        {/* 4. Duración / Volumen */}
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="text-[9.5px] uppercase font-sans font-bold tracking-wider truncate">Volumen</span>
            <Flame className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
            {durationItem?.value || "—"}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5 min-h-[14px]">
            {durationItem?.subtext || ""}
          </div>
        </div>
      </div>

      {/* Franja compacta de Métricas Secundarias */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-200/60 dark:border-slate-800/80">
        {secondaryItems.map((sec) => (
          <div
            key={sec.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-2xs"
          >
            <span className="text-slate-400 text-[9px] uppercase font-sans font-bold">{sec.label}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{sec.value}</span>
            {sec.subtext && <span className="text-slate-400 text-[9px]">({sec.subtext})</span>}
          </div>
        ))}
      </div>

      {/* Glosario pedagógico bajo demanda */}
      {showGlossary && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-sans space-y-2 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
            <span>Guía Técnica de Telemetría</span>
            <button
              type="button"
              onClick={() => setShowGlossary(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
            {metricItems.map((item) => (
              <div key={item.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5 font-mono">{item.label}</span>
                <p className="text-slate-600 dark:text-slate-300">{item.athleteExplanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
