"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { daySingleLetters, formatDayNumber } from "./athleteMobileHelpers";

interface WeeklyCalendarStripProps {
  weekLabel?: string;
  weekTitle?: string;
  weekRangeLabel?: string;
  weekPlannedTss: number;
  weekExecutedTss: number;
  canPrev: boolean;
  canNext: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  daysMap: { [dayIdx: number]: { date: string; items: PlanItem[] } };
  selectedDayIdx: number;
  onSelectDay: (idx: number) => void;
  todayStr: string;
  dailyExecutedActivities?: DailyExecutedMap;
}

/**
 * Tira Semanal Móvil Unificada — Design System Mobile (< 768px)
 * Cabecera compacta con navegación + Resumen TSS + Rejilla fija de 7 días L-D
 */
export const WeeklyCalendarStrip: React.FC<WeeklyCalendarStripProps> = ({
  weekLabel,
  weekTitle,
  weekRangeLabel,
  weekPlannedTss,
  weekExecutedTss,
  canPrev,
  canNext,
  onPrevWeek,
  onNextWeek,
  daysMap,
  selectedDayIdx,
  onSelectDay,
  todayStr,
  dailyExecutedActivities = {},
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 select-none">
      {/* 1. Fila Superior de Cabecera: Navegación compacta (Izq) + Resumen TSS (Der) */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={onPrevWeek}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Semana Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 truncate text-xs flex items-center">
            <span className="font-black text-slate-900 dark:text-white truncate">
              {weekTitle || weekLabel}
            </span>
            {weekRangeLabel && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1.5 shrink-0">
                • {weekRangeLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!canNext}
            onClick={onNextWeek}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Semana Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen de volumen: XXX / YYY TSS en tabular-nums */}
        <div className="text-xs font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 shrink-0 text-right">
          <span className="text-emerald-600 dark:text-emerald-400 font-black">{weekExecutedTss}</span>
          {weekPlannedTss > 0 ? (
            <>
              <span className="text-slate-400"> / </span>
              <span className="text-slate-500 dark:text-slate-400 font-bold">{weekPlannedTss}</span>
              <span className="text-[10px] text-slate-400 ml-1">TSS</span>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 ml-1">TSS</span>
          )}
        </div>
      </div>

      {/* 2. Tira de 7 Días (L a D): Rejilla de 7 columnas fijas */}
      <div className="grid grid-cols-7 gap-1.5">
        {daySingleLetters.map((letter, idx) => {
          const dayInfo = daysMap[idx];
          const isSelected = selectedDayIdx === idx;
          const isToday = dayInfo?.date === todayStr;
          const dayNum = formatDayNumber(dayInfo?.date);
          const hasExecution = dayInfo?.date ? !!dailyExecutedActivities[dayInfo.date]?.totalTss : false;
          const firstItem = dayInfo?.items[0];
          const isRest = !firstItem || firstItem?.isRestDay || firstItem?.discipline === "Descanso";

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(idx)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative touch-bounce ${
                isSelected
                  ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 scale-[1.02]"
                  : isToday
                  ? "bg-emerald-50/60 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              {/* Letra del día (L, M, X, J, V, S, D) */}
              <span className={`text-[10px] font-bold uppercase leading-none ${
                isSelected ? "text-emerald-200" : "text-slate-400 dark:text-slate-500"
              }`}>
                {letter}
              </span>

              {/* Número del día */}
              <span className="text-xs font-mono font-black mt-1 leading-none">
                {dayNum || "—"}
              </span>

              {/* Micro-indicador cromático inferior (dot de 5px) */}
              <div className="mt-1.5 flex items-center justify-center h-1.5">
                {hasExecution ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"} shadow-xs`}
                    title="Ejecutado"
                  />
                ) : isRest ? (
                  <span
                    className={`h-1 w-1 rounded-full ${isSelected ? "bg-purple-300" : "bg-slate-300 dark:bg-slate-700"}`}
                    title="Descanso"
                  />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-cyan-200" : "bg-cyan-500"}`}
                    title="Planificado"
                  />
                )}
              </div>

              {/* Micro-pill Hoy cuando no está seleccionado */}
              {isToday && !isSelected && (
                <span className="absolute -top-1 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[6.5px] font-black uppercase leading-none shadow-xs">
                  Hoy
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
