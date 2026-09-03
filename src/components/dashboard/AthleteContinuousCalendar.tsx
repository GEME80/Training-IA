"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, Table, Smartphone } from "lucide-react";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { getLocalTodayStr, getMondayOfWeekStr } from "@/lib/dateUtils";
import { AthleteCalendarWeekRow } from "./AthleteCalendarWeekRow";
import { AthleteMobileAgendaView } from "./AthleteMobileAgendaView";

interface AthleteContinuousCalendarProps {
  blueprint: MacrocycleBlueprint;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  runFtp?: number;
  bikeFtp?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  weeklyExecutedTss?: number;
  dailyExecutedActivities?: DailyExecutedMap;
  onOpenAICoach: () => void;
  onSyncWeekToIntervals?: (plan: PlanItem[]) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

function getWeekOfYear(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return 35;
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export const AthleteContinuousCalendar: React.FC<AthleteContinuousCalendarProps> = ({
  blueprint,
  selectedMacroWeekIdx,
  onSelectWeek,
  runFtp = 313,
  bikeFtp = 238,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  weeklyExecutedTss = 0,
  dailyExecutedActivities = {},
  onOpenAICoach,
  onSyncWeekToIntervals,
  onSelectWorkoutModal,
}) => {
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const currentMonStr = getMondayOfWeekStr();
  const todayStr = getLocalTodayStr();
  const weeks = blueprint.weeks || [];

  // Modo de visualización en móvil (por defecto "agenda" táctil diaria)
  const [mobileMode, setMobileMode] = useState<"agenda" | "grid">("agenda");

  useEffect(() => {
    if (currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const dayHeaders = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
  const gridTemplate = "grid-cols-[180px_repeat(7,minmax(0,1fr))]";

  // Semana activa para la vista de agenda móvil
  const activeWeekForAgenda = weeks[selectedMacroWeekIdx] || weeks[0];
  const effectiveAvailability = (blueprint.availabilitySnapshot as any) || weeklyAvailability;
  const activeWeekPlan = activeWeekForAgenda
    ? generateWeekTemplate(
        activeWeekForAgenda,
        runFtp,
        bikeFtp,
        effectiveAvailability,
        (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
        blueprint.athleteCtlAtCreation
      )
    : [];

  return (
    <div className="space-y-3 animate-fadeIn select-none">
      {/* Selector de modo exclusivo para Celulares */}
      <div className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">
          Vista Calendario
        </span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileMode("agenda")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
              mobileMode === "agenda"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3 w-3 text-emerald-500" />
            <span>Agenda Diaria</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("grid")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
              mobileMode === "grid"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Table className="h-3 w-3 text-cyan-500" />
            <span>Matriz Completa</span>
          </button>
        </div>
      </div>

      {/* 1. Vista Móvil de Agenda Diaria (Recomendada en Smartphones) */}
      {mobileMode === "agenda" && (
        <AthleteMobileAgendaView
          blueprint={blueprint}
          selectedMacroWeekIdx={selectedMacroWeekIdx}
          onSelectWeek={onSelectWeek}
          todayStr={todayStr}
          weekPlan={activeWeekPlan}
          dailyExecutedActivities={dailyExecutedActivities}
          onSelectWorkoutModal={onSelectWorkoutModal}
          onOpenAICoach={onOpenAICoach}
        />
      )}

      {/* 2. Vista Matriz Multisemana (Siempre visible en Desktop `md:block`; opcional en móvil si seleccionan "grid") */}
      <div className={`${mobileMode === "grid" ? "block" : "hidden md:block"} overflow-x-auto space-y-4`}>
        {/* Cabecera Global de Días */}
        <div
          className={`min-w-[1100px] grid ${gridTemplate} gap-2.5 px-2.5 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800`}
        >
          <div className="text-left pl-2 font-black text-slate-700 dark:text-slate-300">
            SEMANA / RESUMEN
          </div>
          {dayHeaders.map((dh, i) => (
            <div key={i} className="text-center font-black">
              {dh}
            </div>
          ))}
        </div>

        {/* Filas Semanales de la Cuadrícula */}
        <div className="min-w-[1100px] space-y-4">
          {weeks.map((week, wIdx) => {
            const isCurrentWeek =
              week.startDate === currentMonStr ||
              (blueprint.currentWeekIndex !== undefined && wIdx === blueprint.currentWeekIndex);
            const isPastWeek = week.startDate < currentMonStr && !isCurrentWeek;
            const calendarWeekNumber = getWeekOfYear(week.startDate);

            return (
              <AthleteCalendarWeekRow
                key={wIdx}
                week={week}
                wIdx={wIdx}
                weeksCount={weeks.length}
                isCurrentWeek={isCurrentWeek}
                isPastWeek={isPastWeek}
                calendarWeekNumber={calendarWeekNumber}
                blueprint={blueprint}
                runFtp={runFtp}
                bikeFtp={bikeFtp}
                effectiveAvailability={effectiveAvailability}
                weeklyExecutedTss={weeklyExecutedTss}
                dailyExecutedActivities={dailyExecutedActivities}
                todayStr={todayStr}
                gridTemplate={gridTemplate}
                currentWeekRef={currentWeekRef}
                onSelectWeek={onSelectWeek}
                onOpenAICoach={onOpenAICoach}
                onSyncWeekToIntervals={onSyncWeekToIntervals}
                onSelectWorkoutModal={onSelectWorkoutModal}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
