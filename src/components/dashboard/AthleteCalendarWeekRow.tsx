"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Footprints, Bike, Dumbbell, Waves, Clock, Target, CheckCircle2 } from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { WeeklyAvailabilityMap, PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, CalendarEvent } from "@/lib/intervals/types";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { parseWorkoutDoc } from "../WorkoutChart";
import { AthleteCalendarDayColumn } from "./AthleteCalendarDayColumn";
import { hydrateWeekPlanFromEvents } from "@/lib/intervals/calendarHydration";
import { formatLocalDateToYMD } from "@/lib/dateUtils";

interface AthleteCalendarWeekRowProps {
  week: MacrocycleWeek; wIdx: number; weeksCount: number; isCurrentWeek: boolean;
  isFutureWeek?: boolean; isSelectedWeek?: boolean; isPastWeek: boolean; calendarWeekNumber: number;
  isWithinBuffer?: boolean; blueprint: MacrocycleBlueprint; runFtp: number; bikeFtp: number;
  effectiveAvailability: WeeklyAvailabilityMap; weeklyExecutedTss: number;
  dailyExecutedActivities: DailyExecutedMap; calendarEvents?: CalendarEvent[];
  runningOpts?: { mode?: "POWER" | "PACE" | "HYBRID"; thresholdPaceSec?: number; thresholdPaceStr?: string; lthr?: number; };
  todayStr: string; gridTemplate: string; currentWeekRef: React.RefObject<HTMLDivElement | null>;
  onSelectWeek: (idx: number) => void; onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals?: (plan: PlanItem[]) => Promise<void>;
  onSyncTriweeklyBlock?: (weekIdx: number) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

const fmtMins = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ""}` : m > 0 ? `${m}m` : "—";

function DisciplineBar({
  icon, mins, tss, executedTss, textColor, barColor, isPastWeek,
}: { icon: React.ReactNode; mins: number; tss: number; executedTss: number; textColor: string; barColor: string; isPastWeek: boolean }) {
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

function resolvePhaseShortLabel(week: MacrocycleWeek, isHistorical: boolean): string {
  if (isHistorical) return "Historial";
  const raw = week.phaseLabel || week.phase || "";
  return raw ? raw.replace(/Fase \d+:\s*/i, "").trim().split(" ").slice(0, 3).join(" ") : "Base";
}

export const AthleteCalendarWeekRow: React.FC<AthleteCalendarWeekRowProps> = ({
  week, wIdx, weeksCount, isCurrentWeek, isFutureWeek, isWithinBuffer, isSelectedWeek, isPastWeek,
  calendarWeekNumber, blueprint, runFtp, bikeFtp, effectiveAvailability,
  weeklyExecutedTss, dailyExecutedActivities, calendarEvents, runningOpts, todayStr,
  gridTemplate, currentWeekRef, onSelectWeek, onOpenAICoach,
  onSyncWeekToIntervals, onSyncTriweeklyBlock, onSelectWorkoutModal,
}) => {
  const isHistoricalOnly = Boolean(!blueprint || blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly);
  const rawWeekPlan = isHistoricalOnly ? [] : generateWeekTemplate(
    week, runFtp, bikeFtp, effectiveAvailability,
    (blueprint.distanceType || blueprint.primaryRace?.distance) as any, blueprint.athleteCtlAtCreation,
    blueprint.primaryRace?.date, runningOpts
  );
  const weekPlan = hydrateWeekPlanFromEvents(week, rawWeekPlan, calendarEvents, runningOpts, {
    runFtp, bikeFtp, primaryRaceDate: blueprint?.primaryRace?.date,
    targetRaces: blueprint?.primaryRace ? [blueprint.primaryRace] : undefined,
  });

  const [isSyncingTriweekly, setIsSyncingTriweekly] = useState(false);
  const [isSyncingCurrentWeek, setIsSyncingCurrentWeek] = useState(false);

  const handleSyncTriweekly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncingTriweekly || isSyncingCurrentWeek || !onSyncTriweeklyBlock) return;
    setIsSyncingTriweekly(true);
    try { await onSyncTriweeklyBlock(wIdx); } finally { setIsSyncingTriweekly(false); }
  };

  const handleSyncWeek = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncingTriweekly || isSyncingCurrentWeek || !onSyncWeekToIntervals) return;
    setIsSyncingCurrentWeek(true);
    try { await onSyncWeekToIntervals(weekPlan); } finally { setIsSyncingCurrentWeek(false); }
  };

  const isWithinGarminBuffer = Boolean(isWithinBuffer ?? isCurrentWeek);

  let totalMins = 0, plannedTss = 0, runMins = 0, runTss = 0, bikeMins = 0, bikeTss = 0, swimMins = 0, swimTss = 0, strengthMins = 0, strengthTss = 0;
  let execBikeTss = 0, execRunTss = 0, execSwimTss = 0, execStrengthTss = 0, execDirectTotalTss = 0;
  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const weekDates: string[] = [];
  if (week.startDate) {
    const p = week.startDate.split("-").map(Number);
    for (let i = 0; i < 7; i++) weekDates.push(formatLocalDateToYMD(new Date(p[0], p[1] - 1, p[2] + i)));
  }

  weekPlan.forEach((item) => {
    const parsed = parseWorkoutDoc(item.workoutDoc, item.discipline);
    const m = item.durationMinutes || parsed.totalMins || 45, t = item.tss || parsed.estimatedTss || 0;
    if (!item.isRestDay && item.discipline !== "Descanso") {
      totalMins += m; plannedTss += t;
      const d = item.discipline.toLowerCase();
      if (/run|carrera/.test(d)) { runMins += m; runTss += t; }
      else if (/ride|ciclismo/.test(d)) { bikeMins += m; bikeTss += t; }
      else if (/swim|nataci/.test(d)) { swimMins += m; swimTss += t; }
      else if (/gym|fuerza|fortalecimiento|weight/.test(d)) { strengthMins += m; strengthTss += t; }
    }
  });

  weekDates.forEach((wDate) => {
    const actDay = dailyExecutedActivities?.[wDate];
    if (actDay?.totalTss) {
      execDirectTotalTss += actDay.totalTss;
      actDay.activities?.forEach((a) => {
        const t = (a.type || "").toLowerCase();
        if (/run|carrera/.test(t)) execRunTss += a.tss;
        else if (/ride|ciclismo|bike|virtualride/.test(t)) execBikeTss += a.tss;
        else if (/swim|nataci/.test(t)) execSwimTss += a.tss;
        else if (/weight|gym|fuerza|strength/.test(t)) execStrengthTss += a.tss;
      });
    }
  });

  const isHistoricalWeek = Boolean((week as any).isHistorical || week.weekNumber <= 0);
  const effectiveExecuted = execDirectTotalTss > 0 ? execDirectTotalTss : isCurrentWeek ? weeklyExecutedTss : 0;
  const displayPlannedTss = plannedTss > 0 ? plannedTss : (week.targetTss || 0);
  const completionPct = displayPlannedTss > 0 ? Math.round((effectiveExecuted / displayPlannedTss) * 100) : 0;
  const phaseShort = resolvePhaseShortLabel(week, isHistoricalWeek);
  const fullPhaseLabel = week.phaseLabel || week.phase || "Base";

  const weekBorderClass = isCurrentWeek
    ? "border-sky-400 dark:border-sky-500 shadow-md ring-1 ring-sky-400/30"
    : isHistoricalWeek ? "border-slate-200 dark:border-slate-800/70"
    : isFutureWeek ? "border-indigo-200/80 dark:border-indigo-800/60"
    : isPastWeek ? "border-slate-200/80 dark:border-slate-800/70 opacity-95 hover:opacity-100"
    : "border-slate-200 dark:border-slate-800 hover:border-slate-300";

  const weekBgClass = isCurrentWeek
    ? "bg-white dark:bg-slate-900"
    : isHistoricalWeek ? "bg-slate-50/60 dark:bg-slate-950/50"
    : isFutureWeek ? "bg-indigo-50/30 dark:bg-indigo-950/15"
    : isPastWeek ? "bg-slate-50/40 dark:bg-slate-950/30"
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
                  {isHistoricalWeek || isHistoricalOnly ? (isHistoricalOnly && isCurrentWeek ? "Semana Actual" : "Historial") : `Sem. ${week.weekNumber}`}
                  {!isHistoricalWeek && !isHistoricalOnly && (
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
              {isFutureWeek && !isHistoricalOnly && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  Próxima
                </span>
              )}
            </div>

            {/* Badge de Fase del Macrociclo */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border leading-tight ${
                isHistoricalWeek || isHistoricalOnly
                  ? "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                  : isCurrentWeek
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                  : isFutureWeek
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
              title={isHistoricalWeek || isHistoricalOnly ? "Historial" : fullPhaseLabel}
            >
              {!isHistoricalWeek && !isHistoricalOnly && <Target className="h-2.5 w-2.5 shrink-0" />}
              <span className="truncate max-w-[110px]">{isHistoricalOnly ? "Sin Plan Activo" : phaseShort}</span>
            </div>

            {/* Métricas: Tiempo + TSS */}
            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5">
                <Clock className="h-2.5 w-2.5 text-slate-400 mb-0.5" />
                <strong className="text-slate-900 dark:text-white text-xs block">{fmtMins(totalMins)}</strong>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5">
                <span className="text-slate-400 text-[9px] block uppercase font-bold">
                  {!isHistoricalOnly && displayPlannedTss > 0 ? "TSS Obj" : "TSS"}
                </span>
                <strong className="text-cyan-600 dark:text-cyan-400 text-xs">
                  {!isHistoricalOnly && displayPlannedTss > 0 ? displayPlannedTss : (effectiveExecuted || "—")}
                </strong>
              </div>
            </div>

            {/* Cumplimiento Semanal Minimalista y Responsivo */}
            {!isFutureWeek && (
              <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                  <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Cumplimiento</span>
                  <span className={`font-black text-xs ${
                    completionPct >= 85 ? "text-emerald-600 dark:text-emerald-400"
                    : completionPct >= 50 ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-500"
                  }`}>
                    {isHistoricalOnly ? "Sin plan" : (displayPlannedTss > 0 ? `${completionPct}%` : (effectiveExecuted > 0 ? "Sin plan" : "—"))}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completionPct >= 85 ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                      : completionPct >= 50 ? "bg-amber-400"
                      : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{ width: `${Math.min(100, completionPct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono pt-0.5">
                  <span>{effectiveExecuted} TSS real</span>
                  <span>{displayPlannedTss > 0 ? `${displayPlannedTss} TSS obj` : "Libre"}</span>
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
          const dayItemsMap: Record<string, PlanItem[]> = {}, weekDateSet = new Set(weekDates);
          weekPlan.forEach((item) => {
            if ((!item.date || weekDateSet.has(item.date)) && dayItemsMap[item.day]) dayItemsMap[item.day].push(item);
            else if (!item.date || weekDateSet.has(item.date)) dayItemsMap[item.day] = [item];
          });
          return daysOfWeek.map((dayName, dIdx) => (
            <AthleteCalendarDayColumn
              key={dayName}
              dayName={dayName}
              dateStr={weekDates[dIdx]}
              isHistoricalOnly={isHistoricalOnly}
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 font-mono">
              {isCurrentWeek ? "Semana en curso · Intervals.icu" : `Semana ${wIdx + 1} · ${fullPhaseLabel}`}
            </span>
            {(isCurrentWeek || isFutureWeek) && !isHistoricalOnly && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                {runningOpts?.mode === "PACE" ? `Pace ${runningOpts.thresholdPaceStr || "4:45"}/km` : `CP ${runFtp}W`} • FTP {bikeFtp}W
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onOpenAICoach(wIdx)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 text-xs font-black shadow-xs transition hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Head Coach IA</span>
            </button>
            {isWithinGarminBuffer && (
              <>
                <span className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>En tu reloj Garmin</span>
                </span>
                {((isCurrentWeek && onSyncTriweeklyBlock) || onSyncWeekToIntervals) && !isHistoricalOnly && (
                  <button
                    type="button"
                    onClick={isCurrentWeek && onSyncTriweeklyBlock ? handleSyncTriweekly : handleSyncWeek}
                    disabled={isSyncingCurrentWeek || isSyncingTriweekly}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer disabled:opacity-60 active:scale-95 shadow-xs"
                    title={isCurrentWeek && onSyncTriweeklyBlock ? "Re-sincronizar buffer de 3 semanas a Garmin" : "Re-sincronizar semana a Garmin"}
                  >
                    <RefreshCw className={`h-3 w-3 text-slate-500 dark:text-slate-400 ${(isSyncingCurrentWeek || isSyncingTriweekly) ? "animate-spin" : ""}`} />
                    <span>{(isSyncingCurrentWeek || isSyncingTriweekly) ? "Sync..." : "Sincronizar"}</span>
                  </button>
                )}
              </>
            )}
            {isFutureWeek && !isWithinGarminBuffer && !isHistoricalOnly && (
              <span
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] font-bold text-amber-700 dark:text-amber-300"
                title="Esta semana se sincronizará automáticamente cuando entre en el colchón de las próximas 3 semanas."
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Por sincronizar</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
