"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Target, Sparkles } from "lucide-react";

interface HeadCoachWeekSelectorProps {
  currentWeekNumber: number;
  selectedWeekNumber: number;
  totalWeeks?: number;
  onSelectWeek: (weekNum: number) => void;
  startDateStr?: string;
  endDateStr?: string;
  phaseLabel?: string;
}

export const HeadCoachWeekSelector: React.FC<HeadCoachWeekSelectorProps> = ({
  currentWeekNumber,
  selectedWeekNumber,
  totalWeeks = 16,
  onSelectWeek,
  startDateStr,
  endDateStr,
  phaseLabel,
}) => {
  const isCurrentWeek = selectedWeekNumber === currentWeekNumber;
  const isNextWeek = selectedWeekNumber === currentWeekNumber + 1;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
      {/* Selector Rápido de Horizonte Táctico */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onSelectWeek(currentWeekNumber)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isCurrentWeek
              ? "bg-emerald-500 text-slate-950 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Semana en Curso ({currentWeekNumber})</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectWeek(currentWeekNumber + 1)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isNextWeek
              ? "bg-emerald-500 text-slate-950 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Próxima Semana ({currentWeekNumber + 1})</span>
        </button>
      </div>

      {/* Navegación y Datos del Microciclo */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
        <div className="text-right">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <span>Microciclo {selectedWeekNumber} de {totalWeeks}</span>
            {phaseLabel && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-bold">
                {phaseLabel}
              </span>
            )}
          </div>
          {startDateStr && endDateStr && (
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {startDateStr} al {endDateStr}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            disabled={selectedWeekNumber <= 1}
            onClick={() => onSelectWeek(selectedWeekNumber - 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={selectedWeekNumber >= totalWeeks}
            onClick={() => onSelectWeek(selectedWeekNumber + 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title="Semana siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
