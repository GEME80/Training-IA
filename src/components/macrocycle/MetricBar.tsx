"use client";

import React from "react";

interface MetricBarProps {
  label: string;
  rangeLabel?: string;
  percent: number;
  valueText?: string;
  barColor?: string;
  isDominant?: boolean;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  label,
  rangeLabel,
  percent,
  valueText,
  barColor = "#a855f7",
  isDominant = false,
}) => {
  const clampedPct = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className={`flex items-center text-xs py-0.5 ${isDominant ? "bg-slate-50/50 dark:bg-slate-800/20 rounded-lg px-1.5" : ""}`}>
      {/* Etiqueta y Rango */}
      <div className="w-[110px] sm:w-[130px] text-right pr-2 shrink-0 min-w-0">
        <span className={`text-[10.5px] block truncate ${isDominant ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300"}`}>
          {label}
        </span>
        {rangeLabel && (
          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block truncate">
            {rangeLabel}
          </span>
        )}
      </div>

      {/* Eje divisor, Carril Tenue de Escala y Barra */}
      <div className="flex-1 border-l-2 border-slate-300 dark:border-slate-700 pl-2 flex items-center gap-2 min-w-0 h-6">
        <div className="flex-1 max-w-[240px] sm:max-w-[320px] h-3 sm:h-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-r-md overflow-hidden flex items-center">
          {clampedPct > 0 ? (
            <div
              style={{ width: `${clampedPct}%`, backgroundColor: barColor }}
              className="h-full rounded-r-xs transition-all duration-500 shadow-2xs hover:brightness-110"
              title={`${label}: ${clampedPct}% ${valueText ? `(${valueText})` : ""}`}
            />
          ) : null}
        </div>

        {/* Valor y porcentaje */}
        <div className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0 min-w-[50px] text-right">
          <span>{valueText || `${clampedPct}%`}</span>
          {valueText && clampedPct > 0 && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1 font-normal">
              {clampedPct}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
