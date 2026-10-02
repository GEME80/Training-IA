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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {/* CARD 1: PEAK CTL 365D */}
      <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1 gap-1">
          <span className="truncate">Máxima Forma (Último Año)</span>
          <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500 shrink-0" />
        </div>
        <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 sm:gap-1.5">
          <span>{summary.peakCtlLastYear}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">pts récord</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-medium truncate">
          Mejor nivel aeróbico demostrado
        </p>
      </div>

      {/* CARD 2: CTL ACTUAL VS PLAN HOY */}
      <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1 gap-1">
          <span className="truncate">Forma Física Actual vs Plan</span>
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500 shrink-0" />
        </div>
        <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 sm:gap-1.5">
          <span>{summary.lastKnownCtl}</span>
          {hasPlan && (
            <>
              <span className="text-[10px] sm:text-xs text-slate-400 font-bold">vs</span>
              <span className="text-amber-500">{summary.plannedCtlToday}</span>
            </>
          )}
        </div>
        <p className={`text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 font-medium truncate ${gap >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {hasPlan ? `Diferencia: ${gap > 0 ? `+${gap}` : gap} pts de forma` : `Meta Carrera: ${targetCtl} pts`}
        </p>
      </div>

      {/* CARD 3: ADHERENCIA AL PLAN O FORMA TSB OBJETIVO */}
      <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1 gap-1">
          <span className="truncate">{hasPlan ? "Cumplimiento del Plan" : "Frescura Objetivo"}</span>
          {hasPlan ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" /> : <BatteryCharging className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" />}
        </div>
        <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1 sm:gap-1.5">
          <span>{hasPlan ? `${summary.planCompliancePercent ?? 100}%` : (targetTsb > 0 ? `+${targetTsb}` : targetTsb)}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{hasPlan ? "completado" : "Frescura"}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-medium truncate">
          {hasPlan ? "Carga realizada vs programada" : "Punto óptimo de descanso"}
        </p>
      </div>

      {/* CARD 4: RAMPA ASIMILADA O FRESCA EN CARRERA */}
      <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1 gap-1">
          <span className="truncate">{hasPlan ? "Frescura el Día de Carrera" : "Ritmo de Progresión"}</span>
          {hasPlan ? <BatteryCharging className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" /> : <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />}
        </div>
        <div className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 sm:gap-1.5">
          {hasPlan ? (
            <span className="text-emerald-500">{targetTsb > 0 ? `+${targetTsb}` : targetTsb}</span>
          ) : (
            <span>+{summary.avgRampRate}</span>
          )}
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">{hasPlan ? "Frescura" : "pts/sem"}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
          {hasPlan ? `Meta día de carrera (${targetCtl} pts de forma)` : `Límite seguro de fatiga: ${summary.minTsbRecorded}`}
        </p>
      </div>
    </div>
  );
};
