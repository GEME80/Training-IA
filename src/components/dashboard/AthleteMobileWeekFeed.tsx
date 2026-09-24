"use client";

import React from "react";
import { Check, X, Moon, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";

interface MobileWeekFeedItemProps {
  dayName: string;
  dateStr: string;
  items: PlanItem[];
  dailyExecuted?: { activities: DailyExecutedActivity[]; totalTss?: number };
  isToday: boolean;
  isPast: boolean;
  onSelectDay: () => void;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

function formatDayNumber(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts[2] ? `${parseInt(parts[2], 10)}` : "";
}

export const MobileWeekFeedItem: React.FC<MobileWeekFeedItemProps> = ({
  dayName,
  dateStr,
  items,
  dailyExecuted,
  isToday,
  isPast,
  onSelectDay,
  onSelectWorkoutModal,
}) => {
  const executedActs = dailyExecuted?.activities || [];
  const primaryItem = items[0];
  const isRest = !primaryItem || primaryItem.isRestDay || primaryItem.discipline === "Descanso";
  const executedTss = dailyExecuted?.totalTss || 0;
  const plannedTss = items.reduce((acc, curr) => (!curr.isRestDay ? acc + (curr.tss || 0) : acc), 0);
  const isCompleted = executedActs.length > 0;
  const isOmitted = !isCompleted && isPast && !isRest;

  return (
    <div
      onClick={onSelectDay}
      className={`p-3 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-3 touch-bounce ${
        isToday
          ? "border-emerald-500/40 ring-1 ring-emerald-500/20 bg-emerald-50/20"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
      }`}
    >
      {/* Columna Día */}
      <div className="flex items-center gap-2.5 min-w-[70px]">
        <div
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl font-mono ${
            isToday
              ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
          }`}
        >
          <span className="text-[9px] uppercase leading-none">{dayName}</span>
          <span className="text-sm font-black leading-none mt-0.5">{formatDayNumber(dateStr)}</span>
        </div>
      </div>

      {/* Contenido Central: Sesión o Descanso */}
      <div className="flex-1 min-w-0">
        {isRest && executedActs.length === 0 ? (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Moon className="h-3.5 w-3.5" />
            <span className="font-medium">Descanso o Recuperación</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                {primaryItem ? primaryItem.workoutName.replace(/\[.*?\]\s*/g, "") : executedActs[0]?.name || "Actividad"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-500">
              <span>{primaryItem?.discipline || executedActs[0]?.type || "Cardio"}</span>
              <span>•</span>
              <span>
                {isCompleted ? `${executedTss} TSS` : `${plannedTss} TSS`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Estado y Chevron */}
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
            <Check className="h-3 w-3" />
            <span className="hidden xs:inline">Listo</span>
          </span>
        ) : isOmitted ? (
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
            <X className="h-3 w-3" />
          </span>
        ) : isRest ? (
          <span className="text-[10px] font-mono text-slate-400">Rest</span>
        ) : (
          <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded">
            Plan
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
};
