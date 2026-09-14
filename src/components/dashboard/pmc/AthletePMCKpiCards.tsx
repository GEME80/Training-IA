"use client";

import React from "react";
import { TrendingUp, Activity, BatteryCharging, Award } from "lucide-react";
import { PMCHistoricalSummary, PMCDataPoint } from "@/lib/physiology/pmcEngine";

interface AthletePMCKpiCardsProps {
  summary: PMCHistoricalSummary;
  targetPoint: PMCDataPoint | null;
}

export const AthletePMCKpiCards: React.FC<AthletePMCKpiCardsProps> = ({
  summary,
  targetPoint,
}) => {
  const targetCtl = targetPoint?.ctl ?? summary.lastKnownCtl;
  const targetTsb = targetPoint?.tsb ?? summary.lastKnownTsb;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>Peak CTL (365d)</span>
          <Award className="h-4 w-4 text-sky-500" />
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{summary.peakCtlLastYear}</span>
          <span className="text-[10px] text-slate-400 font-semibold">pts techo</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate">
          Motor demostrado por el atleta
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>CTL Actual vs Meta</span>
          <Activity className="h-4 w-4 text-sky-500" />
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{summary.lastKnownCtl}</span>
          <span className="text-xs text-slate-400 font-bold">➔</span>
          <span className="text-sky-500">{targetCtl}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Proyección a día de carrera
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>Forma TSB Objetivo</span>
          <BatteryCharging className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
          <span>{targetTsb > 0 ? `+${targetTsb}` : targetTsb}</span>
          <span className="text-[10px] text-slate-400 font-semibold">Frescura</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
          Pico de supercompensación (Friel)
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>Rampa Asimilada</span>
          <TrendingUp className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>+{summary.avgRampRate}</span>
          <span className="text-[10px] text-slate-400 font-semibold">pts/sem</span>
        </div>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
          Suelo seguro TSB: {summary.minTsbRecorded}
        </p>
      </div>
    </div>
  );
};
