"use client";

import React from "react";
import { Check, Footprints, Bike, Dumbbell, Waves, Moon } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";
import { getLocalTodayStr } from "@/lib/dateUtils";

interface MacrocycleDayScheduleCardProps {
  item: PlanItem;
  runFtp: number;
  bikeFtp: number;
  dailyExecutedActivities: DailyExecutedMap;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

export const MacrocycleDayScheduleCard: React.FC<MacrocycleDayScheduleCardProps> = ({
  item,
  runFtp,
  bikeFtp,
  dailyExecutedActivities,
  onSelectWorkoutModal,
}) => {
  const todayStr = getLocalTodayStr();
  const isPastDay = item.date < todayStr;
  const isToday = item.date === todayStr;
  const isRest = item.isRestDay || item.discipline === "Descanso";

  const getDisciplineIcon = (discipline: string) => {
    if (discipline === "Descanso" || discipline === "Off") return <Moon className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    if (discipline === "Fuerza") return <Dumbbell className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    if (discipline === "Ciclismo") return <Bike className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
    if (discipline === "Natacion" || discipline === "Natación") return <Waves className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
    return <Footprints className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  };

  const icon = getDisciplineIcon(item.discipline);
  const itemPlannedTss = item.tss || parseWorkoutDoc(item.workoutDoc).estimatedTss || 0;
  const executedDay = dailyExecutedActivities?.[item.date];
  const isExecuted = !isRest && !!executedDay && (executedDay.totalTss > 0 || (executedDay.activities && executedDay.activities.length > 0));
  const isMissed = !isRest && !isExecuted && isPastDay;
  const primaryAct = executedDay?.activities?.[0];
  const displayName = item.discipline === "Carrera"
    ? item.workoutName.replace(/Rodaje/gi, "Carrera").replace(/Stryd/gi, "").replace(/\s{2,}/g, " ").trim()
    : item.workoutName;

  return (
    <div
      onClick={() => {
        if (!isRest && item.workoutDoc) {
          onSelectWorkoutModal({ ...item, workoutName: displayName });
        }
      }}
      className={`rounded-2xl p-3.5 sm:p-4 border flex flex-col justify-between space-y-2.5 transition-all ${
        isExecuted
          ? "bg-gradient-to-b from-emerald-50/90 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-950 border-emerald-400/80 dark:border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/20 hover:border-emerald-500 cursor-pointer group"
          : isMissed
          ? "bg-gradient-to-b from-rose-50/90 via-white to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-950 border-rose-300 dark:border-rose-900/60 shadow-sm ring-1 ring-rose-400/25 hover:border-rose-400 cursor-pointer group"
          : isToday
          ? "bg-white dark:bg-slate-950 border-cyan-400 dark:border-cyan-500 shadow-md ring-2 ring-cyan-400/25 hover:border-cyan-500 cursor-pointer group"
          : isRest
          ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 opacity-75 cursor-default"
          : "bg-white dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-slate-700 shadow-sm cursor-pointer group"
      }`}
      title={!isRest && item.workoutDoc ? "Haz clic para ver el detalle y prescripción de potencia" : undefined}
    >
      <div>
        <div className={`pb-2 border-b space-y-1.5 ${
          isExecuted
            ? "border-emerald-100 dark:border-emerald-950/60"
            : isMissed
            ? "border-rose-100 dark:border-rose-950/60"
            : "border-slate-100 dark:border-slate-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black tracking-tight ${
              isExecuted ? "text-emerald-950 dark:text-emerald-200" : isMissed ? "text-rose-950 dark:text-rose-200" : isToday ? "text-cyan-700 dark:text-cyan-400" : "text-slate-900 dark:text-white"
            }`}>
              {item.day}
            </span>
            <span className={`text-[10px] font-mono font-bold ${
              isExecuted ? "text-emerald-700 dark:text-emerald-400" : isMissed ? "text-rose-600 dark:text-rose-400" : isToday ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400"
            }`}>
              {item.formattedDate}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-xs shrink-0">{icon}</span>
              <span className={`text-[10px] font-bold ${
                isExecuted ? "text-emerald-800 dark:text-emerald-300" : isMissed ? "text-rose-800 dark:text-rose-300" : "text-slate-700 dark:text-slate-300"
              }`}>
                {item.discipline}
              </span>
            </div>

            {isExecuted ? (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shrink-0 shadow-2xs" title="Sesión Realizada">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              </span>
            ) : isMissed ? (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0 shadow-2xs text-[11px] font-black leading-none" title="Sesión No Realizada / Omitida">
                ✕
              </span>
            ) : isToday ? (
              <span className="inline-flex items-center justify-center px-1.5 h-5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/25 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shrink-0 text-[10px] font-black" title="Sesión de Hoy">
                ⏱️ Hoy
              </span>
            ) : isRest ? (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 text-[11px]" title="Día de Descanso Pasivo">
                🌙
              </span>
            ) : (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 text-[10px]" title="Sesión Programada">
                ⏳
              </span>
            )}
          </div>
        </div>

        <h5 className={`mt-2 text-[11px] font-bold line-clamp-2 min-h-[30px] transition-colors leading-snug ${
          isExecuted ? "text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" : isMissed ? "text-rose-950 dark:text-rose-100 group-hover:text-rose-600 dark:group-hover:text-rose-300" : "text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
        }`}>
          {displayName}
        </h5>

        {isRest ? (
          <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="block font-mono font-bold text-slate-700 dark:text-slate-300">0 TSS</span>
            <span className="block text-[9.5px] leading-tight">Regeneración pasiva y asimilación.</span>
          </div>
        ) : isExecuted && executedDay ? (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-emerald-100 dark:border-emerald-950/60">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                ⏱️ {primaryAct?.movingTimeMin || parseWorkoutDoc(item.workoutDoc).totalMins || 45} min
              </span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                ⚡ {executedDay.totalTss} TSS
              </span>
            </div>

            {(primaryAct?.watts || primaryAct?.heartrate) && (
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
                {primaryAct.watts ? (
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    ⚡ {primaryAct.watts} W
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    ⚡ {item.discipline === "Ciclismo" ? bikeFtp : runFtp} W
                  </span>
                )}
                {primaryAct.heartrate ? (
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ❤️ {primaryAct.heartrate} bpm
                  </span>
                ) : <span />}
              </div>
            )}
          </div>
        ) : isMissed ? (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-rose-100 dark:border-rose-950/60">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                ⏱️ {parseWorkoutDoc(item.workoutDoc).totalMins || 45} min
              </span>
              {itemPlannedTss > 0 && (
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  ⚡ {itemPlannedTss} TSS
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-600 dark:text-rose-400 font-medium">
              <span>{item.discipline === "Ciclismo" ? `⚡ ${bikeFtp} W` : runFtp && runFtp > 0 ? `⚡ ${runFtp} W` : "⏱️ Ritmo"}</span>
              <span className="text-[9px] font-bold uppercase">Omitida</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                ⏱️ {parseWorkoutDoc(item.workoutDoc).totalMins || 45} min
              </span>
              {itemPlannedTss > 0 && (
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  ⚡ {itemPlannedTss} TSS
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.discipline === "Ciclismo" ? `⚡ ${bikeFtp} W` : item.discipline === "Carrera" ? (runFtp && runFtp > 0 ? `⚡ ${runFtp} W` : "⏱️ Ritmo") : "Fuerza"}
              </span>
              <span>{item.discipline === "Carrera" && (!runFtp || runFtp <= 0) ? "Z1-Z2" : "❤️ Z1-Z2"}</span>
            </div>
          </div>
        )}
      </div>

      {!isRest && item.workoutDoc && (
        <div className={`mt-2 pointer-events-none ${isMissed ? "opacity-60 grayscale" : "opacity-90"}`}>
          <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
        </div>
      )}
    </div>
  );
};
