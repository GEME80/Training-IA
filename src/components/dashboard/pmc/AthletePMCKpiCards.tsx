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
          <span>Máxima Forma (Último Año)</span>
          <Award className="h-4 w-4 text-sky-500" />
        </div>
        <div className="text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{summary.peakCtlLastYear}</span>
          <span className="text-[10px] text-slate-400 font-semibold">pts récord</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate">
          Mejor nivel aeróbico demostrado
        </p>
      </div>

      {/* CARD 2: CTL ACTUAL VS PLAN HOY */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>Forma Física Actual vs Plan</span>
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
          {hasPlan ? `Diferencia: ${gap > 0 ? `+${gap}` : gap} pts de forma` : `Meta Carrera: ${targetCtl} pts`}
        </p>
      </div>

      {/* CARD 3: ADHERENCIA AL PLAN O FORMA TSB OBJETIVO */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>{hasPlan ? "Cumplimiento del Plan" : "Frescura Objetivo"}</span>
          {hasPlan ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <BatteryCharging className="h-4 w-4 text-emerald-500" />}
        </div>
        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
          <span>{hasPlan ? `${summary.planCompliancePercent ?? 100}%` : (targetTsb > 0 ? `+${targetTsb}` : targetTsb)}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{hasPlan ? "completado" : "Frescura"}</span>
        </div>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium truncate">
          {hasPlan ? "Carga realizada vs programada" : "Punto óptimo de descanso"}
        </p>
      </div>

      {/* CARD 4: RAMPA ASIMILADA O FRESCA EN CARRERA */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>{hasPlan ? "Frescura el Día de Carrera" : "Ritmo de Progresión"}</span>
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
          {hasPlan ? `Meta día de carrera (${targetCtl} pts de forma)` : `Límite seguro de fatiga: ${summary.minTsbRecorded}`}
        </p>
      </div>
    </div>
  );
};
