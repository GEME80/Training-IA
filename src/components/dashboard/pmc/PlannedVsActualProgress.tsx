"use client";

import React from "react";

interface PlannedVsActualProgressProps {
  actualTss: number;
  plannedTss: number;
  actualHours: number;
  plannedHours: number;
}

/**
 * Micro-tarjetas compactas de cumplimiento "Actual vs. Planificado"
 * Diseñadas para cabecera móvil (< 768px), con altura máxima de 46px.
 */
export const PlannedVsActualProgress: React.FC<PlannedVsActualProgressProps> = ({
  actualTss,
  plannedTss,
  actualHours,
  plannedHours,
}) => {
  // Cálculo de cumplimiento de TSS
  const tssTarget = plannedTss > 0 ? plannedTss : Math.max(actualTss, 1);
  const tssPercent = Math.round((actualTss / tssTarget) * 100);
  const tssBarWidth = Math.min(100, Math.max(0, tssPercent));

  let tssStatusLabel = "En plan";
  let tssBarColor = "bg-emerald-500";
  let tssBadgeColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";

  if (plannedTss === 0) {
    tssStatusLabel = "Ejecutado";
  } else if (tssPercent > 115) {
    tssStatusLabel = "Superado";
    tssBarColor = "bg-cyan-500";
    tssBadgeColor = "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10";
  } else if (tssPercent < 75) {
    tssStatusLabel = "En progreso";
    tssBarColor = "bg-amber-500";
    tssBadgeColor = "text-amber-600 dark:text-amber-400 bg-amber-500/10";
  }

  // Cálculo de cumplimiento de Horas / Volumen
  const hoursTarget = plannedHours > 0 ? plannedHours : Math.max(actualHours, 0.1);
  const hoursPercent = Math.round((actualHours / hoursTarget) * 100);
  const hoursBarWidth = Math.min(100, Math.max(0, hoursPercent));

  const hoursBarColor = hoursPercent >= 80 ? "bg-emerald-500" : "bg-sky-500";
  const hoursBadgeColor = hoursPercent >= 80 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-sky-600 dark:text-sky-400 bg-sky-500/10";

  return (
    <div className="grid grid-cols-2 gap-2 select-none">
      {/* TARJETA 1: CARGA TSS (Max 46px) */}
      <div className="h-[46px] flex flex-col justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-1 leading-none">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 font-mono tabular-nums truncate">
            <span className="font-bold text-slate-900 dark:text-white">{actualTss}</span>
            <span className="text-slate-400"> / </span>
            <span className="text-slate-500 dark:text-slate-400">{plannedTss > 0 ? plannedTss : actualTss}</span>
            <span className="text-[9px] text-slate-400 ml-0.5">TSS</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[9px] font-bold font-mono px-1 py-0.2 rounded ${tssBadgeColor}`}>
              {tssPercent}%
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
              {tssStatusLabel}
            </span>
          </div>
        </div>

        {/* Micro-barra lineal de progreso (4px) */}
        <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${tssBarColor}`}
            style={{ width: `${tssBarWidth}%` }}
          />
        </div>
      </div>

      {/* TARJETA 2: VOLUMEN / HORAS (Max 46px) */}
      <div className="h-[46px] flex flex-col justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-1 leading-none">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 font-mono tabular-nums truncate">
            <span className="font-bold text-slate-900 dark:text-white">{actualHours.toFixed(1)}</span>
            <span className="text-slate-400"> / </span>
            <span className="text-slate-500 dark:text-slate-400">{plannedHours > 0 ? plannedHours.toFixed(1) : actualHours.toFixed(1)}</span>
            <span className="text-[9px] text-slate-400 ml-0.5">hrs</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[9px] font-bold font-mono px-1 py-0.2 rounded ${hoursBadgeColor}`}>
              {hoursPercent}%
            </span>
          </div>
        </div>

        {/* Micro-barra lineal de progreso (4px) */}
        <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${hoursBarColor}`}
            style={{ width: `${hoursBarWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
};
