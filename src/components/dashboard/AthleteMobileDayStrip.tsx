"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import {
  dayShortNames,
  dayFullNames,
  formatDayNumber,
  formatFullDateHeader,
} from "./athleteMobileHelpers";

interface AthleteMobileDayStripProps {
  daysMap: { [dayIdx: number]: { date: string; items: PlanItem[] } };
  selectedDayIdx: number;
  onSelectDay: (idx: number) => void;
  todayStr: string;
  dailyExecutedActivities?: DailyExecutedMap;
}

export const AthleteMobileDayStrip: React.FC<AthleteMobileDayStripProps> = ({
  daysMap,
  selectedDayIdx,
  onSelectDay,
  todayStr,
  dailyExecutedActivities = {},
}) => {
  const selectedDayData = daysMap[selectedDayIdx] || { date: "", items: [] };
  const isTodaySelected = selectedDayData.date === todayStr;
  const isPastDay = selectedDayData.date ? selectedDayData.date < todayStr : false;
  const executedForDay = selectedDayData.date ? dailyExecutedActivities[selectedDayData.date] : undefined;

  return (
    <div className="space-y-2">
      {/* Barra Horizontal de los 7 Días con Número Grande */}
      <div className="grid grid-cols-7 gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {dayShortNames.map((name, idx) => {
          const dayInfo = daysMap[idx];
          const isSelected = selectedDayIdx === idx;
          const isToday = dayInfo?.date === todayStr;
          const hasExecution = dayInfo?.date ? !!dailyExecutedActivities[dayInfo.date]?.totalTss : false;
          const firstItem = dayInfo?.items[0];
          const isRest = !firstItem || firstItem?.isRestDay || firstItem?.discipline === "Descanso";
          const dayNum = formatDayNumber(dayInfo?.date);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDay(idx)}
              className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer relative touch-bounce ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-md scale-[1.03]"
                  : isToday
                  ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[9px] font-bold tracking-tight opacity-75">{name}</span>
              <span className="text-xs font-mono font-black mt-0.5 leading-none">{dayNum}</span>

              <div className="mt-1 flex items-center justify-center h-2">
                {hasExecution ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-xs" title="Ejecutado" />
                ) : isRest ? (
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" title="Descanso" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" title="Programado" />
                )}
              </div>

              {isToday && !isSelected && (
                <span className="absolute -top-1.5 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[7px] font-black uppercase shadow-xs">
                  Hoy
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Banner Informativo del Día Seleccionado */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${isTodaySelected ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                {formatFullDateHeader(selectedDayData.date, dayFullNames[selectedDayIdx])}
              </h3>
              {isTodaySelected && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black uppercase shrink-0">
                  Hoy
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {executedForDay?.totalTss ? `${executedForDay.totalTss} TSS ejecutados` : isPastDay ? "Sin entrenamientos registrados" : "Día sin sesiones prescritas"}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 ml-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
            executedForDay?.totalTss
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
          }`}>
            {executedForDay?.totalTss ? `${executedForDay.totalTss} TSS` : "Libre"}
          </span>
        </div>
      </div>
    </div>
  );
};
