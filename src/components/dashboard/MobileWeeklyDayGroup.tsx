"use client";

import React, { useMemo } from "react";
import { Check, X, Moon, Footprints, Bike, Dumbbell, Waves, Activity, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { formatDuration } from "@/lib/utils/formatters";
import { matchDailyActivities } from "./matchDailyActivities";

interface MobileWeeklyDayGroupProps {
  date: string;
  dayLabel: string; // ej. "Mié 14 Oct"
  isToday: boolean;
  isPast?: boolean;
  workouts: PlanItem[];
  dailyExecuted?: { activities: DailyExecutedActivity[]; totalTss?: number };
  onSelectWorkoutModal: (item: PlanItem) => void;
  onSelectDay?: () => void;
}

function resolveDiscipline(actType?: string): string {
  if (!actType) return "Cardio";
  const t = actType.toLowerCase();
  if (t.includes("run")) return "Carrera";
  if (t.includes("ride") || t.includes("bike")) return "Ciclismo";
  if (t.includes("swim")) return "Natación";
  if (t.includes("weight") || t.includes("gym")) return "Fuerza";
  return actType;
}

function getDisciplineIcon(disc: string) {
  if (disc === "Carrera") return <Footprints className="h-3.5 w-3.5 text-amber-500" />;
  if (disc === "Ciclismo") return <Bike className="h-3.5 w-3.5 text-sky-400" />;
  if (disc === "Natación" || disc === "Natacion") return <Waves className="h-3.5 w-3.5 text-cyan-400" />;
  if (disc === "Fuerza") return <Dumbbell className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />;
  return <Activity className="h-3.5 w-3.5 text-slate-400" />;
}

export const MobileWeeklyDayGroup: React.FC<MobileWeeklyDayGroupProps> = ({
  date,
  dayLabel,
  isToday,
  isPast = false,
  workouts,
  dailyExecuted,
  onSelectWorkoutModal,
  onSelectDay,
}) => {
  const executedActs = dailyExecuted?.activities || [];

  // Emparejamiento coordinado entre sesiones planificadas y ejecutadas
  const { matchedItems, extraActivities } = useMemo(() => {
    return matchDailyActivities(workouts, executedActs);
  }, [workouts, executedActs]);

  // Filtramos descansos puros sin ejecución para determinar el conteo real de entrenamientos
  const activeSessions = matchedItems.filter((m) => !m.isRest || Boolean(m.matchedAct));
  const totalSessionsCount = activeSessions.length + extraActivities.length;
  const isMultipleSessions = totalSessionsCount > 1;

  const totalDayTss = useMemo(() => {
    if (dailyExecuted?.totalTss) return dailyExecuted.totalTss;
    return workouts.reduce((acc, curr) => (!curr.isRestDay ? acc + (curr.tss || 0) : acc), 0);
  }, [dailyExecuted?.totalTss, workouts]);

  return (
    <div
      className={`rounded-2xl border transition-all bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${
        isToday
          ? "border-emerald-500/60 ring-1 ring-emerald-500/25 bg-emerald-50/20 dark:bg-emerald-950/15"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* 1. Cabecera de Fecha del Día */}
      <div
        onClick={onSelectDay}
        className={`px-3 py-2 flex items-center justify-between border-b cursor-pointer transition-colors ${
          isToday
            ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30"
            : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/60"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-xs font-black uppercase tracking-wider font-mono ${
              isToday ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {dayLabel}
          </span>
          {isToday && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-mono text-[9px] font-black uppercase">
              Hoy
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMultipleSessions && (
            <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700">
              {totalSessionsCount === 2 ? "Doble Sesión" : `${totalSessionsCount} Sesiones`}
            </span>
          )}
          {totalDayTss > 0 && (
            <span className="text-[10px] font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {totalDayTss} TSS
            </span>
          )}
        </div>
      </div>

      {/* 2. Lista de Sesiones o Día de Descanso */}
      <div className="p-2 space-y-1.5">
        {totalSessionsCount === 0 ? (
          /* Días sin Entrenamiento (Descanso o Libre) */
          <div
            onClick={onSelectDay}
            className="flex items-center justify-between py-2 px-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 text-xs">
              <Moon className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium">Descanso o Día Libre</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">0 TSS</span>
          </div>
        ) : (
          <>
            {/* Sesiones Planificadas (y sus ejecuciones cotejadas) */}
            {activeSessions.map(({ item: workout, matchedAct }, sIdx) => {
              const isCompleted = Boolean(matchedAct);
              const isOmitted = !isCompleted && isPast;
              const durationMin = matchedAct?.movingTimeMin || workout.durationMinutes;
              const tssVal = matchedAct?.tss || workout.tss || 0;

              return (
                <div
                  key={workout.id || sIdx}
                  onClick={() => onSelectWorkoutModal(workout)}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-2.5 touch-bounce"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0">
                      {getDisciplineIcon(workout.discipline)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {workout.discipline}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(durationMin)}</span>
                        <span>•</span>
                        <span className={isCompleted ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                          {tssVal} TSS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
                        <Check className="h-3 w-3" />
                        <span className="hidden xs:inline">Listo</span>
                      </span>
                    ) : isOmitted ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                        <X className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded">
                        Plan
                      </span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}

            {/* Actividades Extras Ejecutadas sin Plan Correspondiente */}
            {extraActivities.map((extraAct) => {
              const disc = resolveDiscipline(extraAct.type);
              const safeDiscipline: PlanItem["discipline"] =
                disc === "Carrera" || disc === "Ciclismo" || disc === "Fuerza" || disc === "Descanso"
                  ? disc
                  : disc === "Natación"
                  ? "Natacion"
                  : "Carrera";

              const extraWorkoutItem: PlanItem = {
                id: `extra-${extraAct.id}`,
                day: dayLabel.split(" ")[0] || "Día",
                date,
                formattedDate: date.slice(5),
                discipline: safeDiscipline,
                workoutName: extraAct.name,
                tss: extraAct.tss || 0,
                durationMinutes: extraAct.movingTimeMin || 45,
                action: "MANTENER",
                justification: `Actividad registrada en Intervals.icu (${extraAct.name}).`,
                workoutDoc: extraAct.name,
              };

              return (
                <div
                  key={extraAct.id}
                  onClick={() => onSelectWorkoutModal(extraWorkoutItem)}
                  className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between gap-2.5 touch-bounce"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-500/30 shrink-0">
                      {getDisciplineIcon(disc)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black uppercase font-mono px-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          Extra
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {extraAct.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        <span>{disc}</span>
                        <span>•</span>
                        <span>{formatDuration(extraAct.movingTimeMin)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {extraAct.tss || 0} TSS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      <span className="hidden xs:inline">Listo</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
