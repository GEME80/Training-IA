"use client";

import React from "react";
import { TrendingUp, Activity, BatteryCharging, Award, CheckCircle2 } from "lucide-react";
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
  const hasPlan = summary.plannedCtlToday !== undefined;
  const gap = summary.ctlGapToday ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* CARD 1: PEAK CTL 365D */}
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

      {/* CARD 2: CTL ACTUAL VS PLAN HOY */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>CTL Actual vs Plan Hoy</span>
          <Activity className="h-4 w-4 text-sky-500" />
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{summary.lastKnownCtl}</span>
          {hasPlan && (
            <>
              <span className="text-xs text-slate-400 font-bold">vs</span>
              <span className="text-amber-500">{summary.plannedCtlToday}</span>
            </>
          )}
        </div>
        <p className={`text-[11px] mt-1 font-medium ${gap >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {hasPlan ? `Desviación: ${gap > 0 ? `+${gap}` : gap} pts CTL` : `Meta Carrera: ${targetCtl} CTL`}
        </p>
      </div>

      {/* CARD 3: ADHERENCIA AL PLAN O FORMA TSB OBJETIVO */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>{hasPlan ? "Adherencia al Macrociclo" : "Forma TSB Meta"}</span>
          {hasPlan ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <BatteryCharging className="h-4 w-4 text-emerald-500" />}
        </div>
        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
          <span>{hasPlan ? `${summary.planCompliancePercent ?? 100}%` : (targetTsb > 0 ? `+${targetTsb}` : targetTsb)}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{hasPlan ? "cumplimiento" : "Frescura"}</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate">
          {hasPlan ? "Carga ejecutada vs planificada" : "Pico de supercompensación (Friel)"}
        </p>
      </div>

      {/* CARD 4: RAMPA ASIMILADA O FRESCA EN CARRERA */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>{hasPlan ? "Forma TSB Carrera" : "Rampa Asimilada"}</span>
          {hasPlan ? <BatteryCharging className="h-4 w-4 text-emerald-500" /> : <TrendingUp className="h-4 w-4 text-amber-500" />}
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          {hasPlan ? (
            <span className="text-emerald-500">{targetTsb > 0 ? `+${targetTsb}` : targetTsb}</span>
          ) : (
            <span>+{summary.avgRampRate}</span>
          )}
          <span className="text-[10px] text-slate-400 font-semibold">{hasPlan ? "Frescura" : "pts/sem"}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
          {hasPlan ? `Meta día de carrera (${targetCtl} CTL)` : `Suelo seguro TSB: ${summary.minTsbRecorded}`}
        </p>
      </div>
    </div>
  );
};
