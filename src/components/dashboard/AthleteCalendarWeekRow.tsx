"use client";

import React from "react";
import { Sparkles, RefreshCw, Footprints, Bike, Dumbbell, Waves, Clock, Target } from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, CalendarEvent } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";
import { AthleteCalendarDayColumn } from "./AthleteCalendarDayColumn";
import { hydrateWeekPlanFromEvents } from "@/lib/intervals/calendarHydration";

interface AthleteCalendarWeekRowProps {
  week: MacrocycleWeek; wIdx: number; weeksCount: number; isCurrentWeek: boolean;
  isFutureWeek?: boolean; isSelectedWeek?: boolean; isPastWeek: boolean; calendarWeekNumber: number;
  blueprint: MacrocycleBlueprint; runFtp: number; bikeFtp: number;
  effectiveAvailability: WeeklyAvailabilityMap; weeklyExecutedTss: number;
  dailyExecutedActivities: DailyExecutedMap; calendarEvents?: CalendarEvent[];
  todayStr: string; gridTemplate: string; currentWeekRef: React.RefObject<HTMLDivElement | null>;
  onSelectWeek: (idx: number) => void; onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals?: (plan: PlanItem[]) => Promise<void>;
  onSyncTriweeklyBlock?: (weekIdx: number) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

const fmtMins = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ""}` : m > 0 ? `${m}m` : "—";

/** Barra de disciplina compacta para el panel lateral */
function DisciplineBar({
  icon, mins, tss, executedTss, textColor, barColor, isPastWeek,
}: {
  icon: React.ReactNode; mins: number; tss: number; executedTss: number;
  textColor: string; barColor: string; isPastWeek: boolean;
}) {
  if (mins <= 0 && executedTss <= 0) return null;
  const displayed = executedTss > 0 ? executedTss : isPastWeek ? tss : 0;
  const pct = tss > 0 ? Math.min(100, Math.round((displayed / tss) * 100)) : 0;
  return (
    <div className="space-y-0.5">
      <div className={`flex items-center justify-between font-bold text-[10px] ${textColor}`}>
        <span className="flex items-center gap-1">{icon}<span>{fmtMins(mins)}</span></span>
        <span className="font-black">{tss > 0 ? `${executedTss > 0 ? `${executedTss}/` : ""}${tss}` : "—"}</span>
      </div>
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Resuelve la etiqueta corta legible de la fase */
function resolvePhaseShortLabel(week: MacrocycleWeek, isHistorical: boolean): string {
  if (isHistorical) return "Historial";
  const raw = week.phaseLabel || week.phase || "";
  if (!raw) return "Base";
  // Acortar etiquetas largas para el panel lateral
  return raw.replace(/Fase \d+:\s*/i, "").trim().split(" ").slice(0, 3).join(" ");
}

export const AthleteCalendarWeekRow: React.FC<AthleteCalendarWeekRowProps> = ({
  week, wIdx, weeksCount, isCurrentWeek, isFutureWeek, isSelectedWeek, isPastWeek,
  calendarWeekNumber, blueprint, runFtp, bikeFtp, effectiveAvailability,
  weeklyExecutedTss, dailyExecutedActivities, calendarEvents, todayStr,
  gridTemplate, currentWeekRef, onSelectWeek, onOpenAICoach,
  onSyncWeekToIntervals, onSyncTriweeklyBlock, onSelectWorkoutModal,
}) => {
  const rawWeekPlan = generateWeekTemplate(
    week, runFtp, bikeFtp, effectiveAvailability,
    (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
    blueprint.athleteCtlAtCreation
  );
  const weekPlan = hydrateWeekPlanFromEvents(week, rawWeekPlan, calendarEvents);

  let totalMins = 0, plannedTss = 0;
  let runMins = 0, runTss = 0, bikeMins = 0, bikeTss = 0;
  let swimMins = 0, swimTss = 0, strengthMins = 0, strengthTss = 0;
  let execBikeTss = 0, execRunTss = 0, execSwimTss = 0, execStrengthTss = 0;
  let execDirectTotalTss = 0;
  const processedDates = new Set<string>();

  weekPlan.forEach((item) => {
    const parsed = parseWorkoutDoc(item.workoutDoc, item.discipline);
    const m = item.durationMinutes || parsed.totalMins || 45;
    const t = item.tss || parsed.estimatedTss || 0;
    if (!item.isRestDay && item.discipline !== "Descanso") {
      totalMins += m; plannedTss += t;
      const d = item.discipline.toLowerCase();
      if (d === "carrera" || d === "run") { runMins += m; runTss += t; }
      else if (d === "ciclismo" || d === "ride") { bikeMins += m; bikeTss += t; }
      else if (d === "natacion" || d === "natación" || d === "swim") { swimMins += m; swimTss += t; }
      else if (d === "fuerza" || d === "fortalecimiento" || d === "weighttraining" || d === "gym") {
        strengthMins += m; strengthTss += t;
      }
    }
    if (item.date && !processedDates.has(item.date)) {
      processedDates.add(item.date);
      const actDay = dailyExecutedActivities?.[item.date];
      if (actDay && actDay.totalTss > 0) {
        execDirectTotalTss += actDay.totalTss;
        actDay.activities?.forEach((a) => {
          const type = (a.type || "").toLowerCase();
          if (/run|carrera/.test(type)) execRunTss += a.tss;
          else if (/ride|ciclismo|bike|virtualride/.test(type)) execBikeTss += a.tss;
          else if (/swim|nataci/.test(type)) execSwimTss += a.tss;
          else if (/weighttraining|weight|gym|fuerza|strength/.test(type)) execStrengthTss += a.tss;
        });
      }
    }
  });

  const isHistoricalWeek = Boolean((week as any).isHistorical || week.weekNumber <= 0);
  const effectiveExecuted =
    execDirectTotalTss > 0 ? execDirectTotalTss
    : isCurrentWeek ? weeklyExecutedTss
    : isPastWeek ? (isHistoricalWeek ? 0 : plannedTss)
    : 0;

  const displayPlannedTss = isHistoricalWeek
    ? (effectiveExecuted || week.targetTss || 0)
    : plannedTss;
  const completionPct =
    displayPlannedTss > 0
      ? Math.min(100, Math.round((effectiveExecuted / displayPlannedTss) * 100))
      : effectiveExecuted > 0 ? 100 : 0;

  const phaseShort = resolvePhaseShortLabel(week, isHistoricalWeek);
  const fullPhaseLabel = week.phaseLabel || week.phase || "Base";

  // Colores según estado de la semana
  const weekBorderClass = isCurrentWeek
    ? "border-sky-400 dark:border-sky-500 shadow-md ring-1 ring-sky-400/30"
    : isHistoricalWeek
    ? "border-slate-200 dark:border-slate-800/70"
    : isFutureWeek
    ? "border-indigo-200/80 dark:border-indigo-800/60"
    : isPastWeek
    ? "border-slate-200/80 dark:border-slate-800/70 opacity-95 hover:opacity-100"
    : "border-slate-200 dark:border-slate-800 hover:border-slate-300";

  const weekBgClass = isCurrentWeek
    ? "bg-white dark:bg-slate-900"
    : isHistoricalWeek
    ? "bg-slate-50/60 dark:bg-slate-950/50"
    : isFutureWeek
    ? "bg-indigo-50/30 dark:bg-indigo-950/15"
    : isPastWeek
    ? "bg-slate-50/40 dark:bg-slate-950/30"
    : "bg-white/95 dark:bg-slate-900/90";

  return (
    <div
      onClick={() => onSelectWeek(wIdx)}
      className={`rounded-2xl border transition-all duration-150 p-2 ${weekBgClass} ${weekBorderClass}`}
    >
      <div className={`grid ${gridTemplate} gap-2 items-stretch`}>
        {/* ── COLUMNA 1: PANEL LATERAL DE RESUMEN SEMANAL ── */}
        <div className="rounded-xl bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/80 p-2.5 flex flex-col justify-between text-xs font-mono shadow-2xs">
          <div className="space-y-2">
            {/* Encabezado: número de semana + badge de estado */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {isHistoricalWeek ? "Historial" : `Sem. ${week.weekNumber}`}
                  {!isHistoricalWeek && (
                    <span className="text-slate-400 font-normal text-[11px]"> / {weeksCount}</span>
                  )}
                </span>
                <span className="px-1.5 rounded bg-slate-200 dark:bg-slate-800 text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                  W{calendarWeekNumber}
                </span>
                {isCurrentWeek && (
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" title="Semana Actual" />
                )}
              </div>
              {isFutureWeek && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  Próxima
                </span>
              )}
            </div>

            {/* Badge de Fase del Macrociclo */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border leading-tight ${
                isHistoricalWeek
                  ? "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                  : isCurrentWeek
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                  : isFutureWeek
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              title={isHistoricalWeek ? "Historial" : fullPhaseLabel}
            >
              {!isHistoricalWeek && <Target className="h-2.5 w-2.5 shrink-0" />}
              <span className="truncate max-w-[110px]">{phaseShort}</span>
            </div>

            {/* Métricas: Tiempo + TSS */}
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5">
                <Clock className="h-2.5 w-2.5 text-slate-400 mb-0.5" />
                <strong className="text-slate-900 dark:text-white text-xs block">{fmtMins(totalMins)}</strong>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5">
                <span className="text-slate-400 text-[9px] block uppercase font-bold">TSS</span>
                <strong className="text-cyan-600 dark:text-cyan-400 text-xs">
                  {isHistoricalWeek ? effectiveExecuted : displayPlannedTss}
                </strong>
              </div>
            </div>

            {/* Barra de adherencia */}
            {!isFutureWeek && (
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500 font-bold">Adherencia</span>
                  <span className={`font-black ${completionPct >= 85 ? "text-emerald-600 dark:text-emerald-400" : completionPct >= 60 ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
                    {effectiveExecuted > 0 ? `${effectiveExecuted} / ${displayPlannedTss} TSS` : isPastWeek ? "Sin datos" : "—"}
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completionPct >= 85 ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                      : completionPct >= 60 ? "bg-amber-400"
                      : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Barras de disciplina */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <DisciplineBar icon={<Bike className="h-3 w-3" />} mins={bikeMins} tss={bikeTss} executedTss={execBikeTss} textColor="text-sky-700 dark:text-sky-300" barColor="bg-sky-500" isPastWeek={isPastWeek} />
              <DisciplineBar icon={<Footprints className="h-3 w-3" />} mins={runMins} tss={runTss} executedTss={execRunTss} textColor="text-amber-700 dark:text-amber-300" barColor="bg-amber-500" isPastWeek={isPastWeek} />
              <DisciplineBar icon={<Waves className="h-3 w-3" />} mins={swimMins} tss={swimTss} executedTss={execSwimTss} textColor="text-cyan-700 dark:text-cyan-300" barColor="bg-cyan-400" isPastWeek={isPastWeek} />
              <DisciplineBar icon={<Dumbbell className="h-3 w-3" />} mins={strengthMins} tss={strengthTss} executedTss={execStrengthTss} textColor="text-purple-700 dark:text-purple-300" barColor="bg-purple-500" isPastWeek={isPastWeek} />
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-400 truncate pt-2 border-t border-slate-200 dark:border-slate-800 mt-1">
            {week.formattedRange || `${week.startDate?.slice(5)} → ${week.endDate?.slice(5)}`}
          </div>
        </div>

        {/* ── COLUMNAS 2–8: 7 DÍAS DE LA SEMANA ── */}
        {(() => {
          const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
          const dayItemsMap: Record<string, PlanItem[]> = {};
          daysOfWeek.forEach((d) => (dayItemsMap[d] = []));
          weekPlan.forEach((item) => { if (dayItemsMap[item.day]) dayItemsMap[item.day].push(item); });
          return daysOfWeek.map((dayName) => (
            <AthleteCalendarDayColumn
              key={dayName}
              dayName={dayName}
              dayItems={dayItemsMap[dayName] || []}
              todayStr={todayStr}
              dailyExecutedActivities={dailyExecutedActivities}
              onSelectWorkoutModal={onSelectWorkoutModal}
            />
          ));
        })()}
      </div>

      {/* ── BARRA INFERIOR DE ACCIONES ── */}
      {(isCurrentWeek || isSelectedWeek) && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-[10px] text-slate-500 font-mono">
            {isCurrentWeek
              ? "Semana en curso · sincronizada con Intervals.icu"
              : `Semana ${wIdx + 1} · ${fullPhaseLabel}`}
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onOpenAICoach(wIdx)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 text-xs font-black shadow-xs transition hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Head Coach IA</span>
            </button>
            {onSyncTriweeklyBlock && !isHistoricalWeek && (
              <button
                type="button"
                onClick={() => onSyncTriweeklyBlock(wIdx)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                <span>Sync 3 sem (2:1)</span>
              </button>
            )}
            {onSyncWeekToIntervals && (
              <button
                type="button"
                onClick={() => onSyncWeekToIntervals(weekPlan)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Esta sem.</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
