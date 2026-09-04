"use client";

import React from "react";
import { Sparkles, RefreshCw, Footprints, Bike } from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";
import { AthleteCalendarDayColumn } from "./AthleteCalendarDayColumn";

interface AthleteCalendarWeekRowProps {
  week: MacrocycleWeek;
  wIdx: number;
  weeksCount: number;
  isCurrentWeek: boolean;
  isSelectedWeek?: boolean;
  isPastWeek: boolean;
  calendarWeekNumber: number;
  blueprint: MacrocycleBlueprint;
  runFtp: number;
  bikeFtp: number;
  effectiveAvailability: WeeklyAvailabilityMap;
  weeklyExecutedTss: number;
  dailyExecutedActivities: DailyExecutedMap;
  todayStr: string;
  gridTemplate: string;
  currentWeekRef: React.RefObject<HTMLDivElement | null>;
  onSelectWeek: (idx: number) => void;
  onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals?: (plan: PlanItem[]) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

function formatMinutesToHours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? `${m < 10 ? "0" + m : m}m` : ""}` : `${m}m`;
}

export const AthleteCalendarWeekRow: React.FC<AthleteCalendarWeekRowProps> = ({
  week,
  wIdx,
  weeksCount,
  isCurrentWeek,
  isSelectedWeek,
  isPastWeek,
  calendarWeekNumber,
  blueprint,
  runFtp,
  bikeFtp,
  effectiveAvailability,
  weeklyExecutedTss,
  dailyExecutedActivities,
  todayStr,
  gridTemplate,
  currentWeekRef,
  onSelectWeek,
  onOpenAICoach,
  onSyncWeekToIntervals,
  onSelectWorkoutModal,
}) => {
  const weekPlan = generateWeekTemplate(
    week,
    runFtp,
    bikeFtp,
    effectiveAvailability,
    (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
    blueprint.athleteCtlAtCreation
  );

  let totalMins = 0;
  let plannedTss = 0;
  let runMins = 0;
  let runTss = 0;
  let bikeMins = 0;
  let bikeTss = 0;
  let executedBikeTss = 0;
  let executedRunTss = 0;
  let executedDirectTotalTss = 0;

  weekPlan.forEach((item) => {
    const parsed = parseWorkoutDoc(item.workoutDoc);
    const m = item.durationMinutes || parsed.totalMins || 45;
    const t = item.tss || parsed.estimatedTss || 0;
    if (!item.isRestDay && item.discipline !== "Descanso") {
      totalMins += m;
      plannedTss += t;
      if (item.discipline === "Carrera") {
        runMins += m;
        runTss += t;
      } else if (item.discipline === "Ciclismo") {
        bikeMins += m;
        bikeTss += t;
      }
    }

    const actDay = dailyExecutedActivities?.[item.date];
    if (actDay && actDay.totalTss > 0) {
      executedDirectTotalTss += actDay.totalTss;
      actDay.activities?.forEach((a) => {
        if (a.type === "Run") executedRunTss += a.tss;
        else if (a.type === "Ride" || a.type === "VirtualRide") executedBikeTss += a.tss;
      });
    }
  });

  const effectiveExecuted =
    executedDirectTotalTss > 0
      ? executedDirectTotalTss
      : isCurrentWeek
      ? weeklyExecutedTss
      : isPastWeek
      ? plannedTss
      : 0;

  const completionPct = plannedTss > 0 ? Math.min(100, Math.round((effectiveExecuted / plannedTss) * 100)) : 0;

  return (
    <div
      ref={isCurrentWeek ? currentWeekRef : undefined}
      onClick={() => onSelectWeek(wIdx)}
      className={`rounded-2xl border transition-all duration-150 p-2.5 ${
        isCurrentWeek
          ? "bg-white dark:bg-slate-900 border-sky-400 dark:border-sky-500 shadow-md ring-1 ring-sky-400/30"
          : isPastWeek
          ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-95 hover:opacity-100"
          : "bg-white/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300"
      }`}
    >
      <div className={`grid ${gridTemplate} gap-2.5 items-stretch`}>
        {/* COLUMNA 1: RESUMEN DE LA SEMANA */}
        <div className="rounded-xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/90 dark:border-slate-800/90 p-3 flex flex-col justify-between text-xs font-mono shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-start border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  Sem. {week.weekNumber} <span className="text-slate-400 font-normal text-[11px]">/ {weeksCount}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 font-bold">
                  W{calendarWeekNumber}
                </span>
                {isCurrentWeek && (
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" title="Semana Actual" />
                )}
              </div>
            </div>

            <div className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] uppercase border border-cyan-500/20">
              {week.phaseLabel || week.phase}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px]">
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5">
                <span className="text-slate-400 text-[9px] block uppercase font-bold">Tiempo</span>
                <strong className="text-slate-900 dark:text-white text-xs">{formatMinutesToHours(totalMins)}</strong>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5">
                <span className="text-slate-400 text-[9px] block uppercase font-bold">Plan TSS</span>
                <strong className="text-cyan-600 dark:text-cyan-400 text-xs">{plannedTss}</strong>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 font-bold">Carga Real</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {effectiveExecuted} / {plannedTss} TSS
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              {bikeMins > 0 && (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Bike className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{formatMinutesToHours(bikeMins)}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-800 dark:text-sky-300 font-black text-[9px] border border-sky-400/25">
                      {executedBikeTss > 0 ? `${executedBikeTss}/` : ""}{bikeTss} TSS
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{
                        width: `${bikeTss > 0 ? Math.min(100, Math.round(((executedBikeTss || (isPastWeek ? bikeTss : 0)) / bikeTss) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {runMins > 0 && (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Footprints className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{formatMinutesToHours(runMins)}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-900 dark:text-amber-300 font-black text-[9px] border border-amber-400/25">
                      {executedRunTss > 0 ? `${executedRunTss}/` : ""}{runTss} TSS
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${runTss > 0 ? Math.min(100, Math.round(((executedRunTss || (isPastWeek ? runTss : 0)) / runTss) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-400 truncate pt-2">
            {week.formattedRange || `${week.startDate} → ${week.endDate}`}
          </div>
        </div>

        {/* COLUMNAS 2 A 8: 7 DÍAS CANÓNICOS */}
        {(() => {
          const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
          const dayItemsMap: Record<string, PlanItem[]> = {};
          daysOfWeek.forEach((d) => (dayItemsMap[d] = []));
          weekPlan.forEach((item) => {
            if (dayItemsMap[item.day]) {
              dayItemsMap[item.day].push(item);
            }
          });

          return daysOfWeek.map((dayName) => {
            const dayItems = dayItemsMap[dayName] || [];
            return (
              <AthleteCalendarDayColumn
                key={dayName}
                dayName={dayName}
                dayItems={dayItems}
                todayStr={todayStr}
                dailyExecutedActivities={dailyExecutedActivities}
                onSelectWorkoutModal={onSelectWorkoutModal}
              />
            );
          });
        })()}
      </div>

      {/* BARRA INFERIOR DE ACCIONES (Semana en curso o semana seleccionada) */}
      {(isCurrentWeek || isSelectedWeek) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs text-slate-500 font-mono">
            {isCurrentWeek ? "Semana en curso sincronizada con Intervals.icu" : `Semana ${wIdx + 1} (${week.phaseLabel || week.phase || "Plan"})`}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onOpenAICoach(wIdx)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-xs transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Head Coach & Adaptación IA</span>
            </button>

            {onSyncWeekToIntervals && (
              <button
                type="button"
                onClick={() => onSyncWeekToIntervals(weekPlan)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                <span>Sincronizar a Intervals</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
