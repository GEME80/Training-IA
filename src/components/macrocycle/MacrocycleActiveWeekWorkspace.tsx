"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { MacrocycleBlueprint, MacrocycleWeek, getCleanFocusDescription } from "@/lib/physiology/macrocycle";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";
import { getLocalTodayStr, getMondayOfWeekStr } from "@/lib/dateUtils";
import { MacrocycleDayScheduleCard } from "./MacrocycleDayScheduleCard";

interface MacrocycleActiveWeekWorkspaceProps {
  blueprint: MacrocycleBlueprint;
  selectedWeek: MacrocycleWeek;
  selectedIndex: number;
  weeksCount: number;
  selectedWeekPlan: PlanItem[];
  runFtp: number;
  bikeFtp: number;
  executedTss: number;
  dailyExecutedActivities: DailyExecutedMap;
  onOpenCoachWithPlan: () => void;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

export const MacrocycleActiveWeekWorkspace: React.FC<MacrocycleActiveWeekWorkspaceProps> = ({
  blueprint,
  selectedWeek,
  selectedIndex,
  weeksCount,
  selectedWeekPlan,
  runFtp,
  bikeFtp,
  executedTss,
  dailyExecutedActivities,
  onOpenCoachWithPlan,
  onSelectWorkoutModal,
}) => {
  const getStructureLabel = (week: MacrocycleWeek) => {
    if (week.isRecoveryWeek || week.microcycleType === "DESCARGA_ASIMILACION") return "🌿 Estructura: Descarga 3:1";
    if (week.microcycleType === "IMPACTO_CHOQUE") return "🔥 Estructura: Choque";
    if (week.microcycleType === "TAPER") return "⚡ Estructura: Taper";
    if (week.microcycleType === "COMPETICION") return "🏆 Estructura: Competición";
    if (week.microcycleType === "MANTENIMIENTO") return "🔵 Estructura: Mantenimiento";
    return "📈 Estructura: Carga Progresiva";
  };

  const currentMonStr = getMondayOfWeekStr();
  const todayStr = getLocalTodayStr();
  const isCurrent = selectedWeek.isCurrentWeek ?? (selectedWeek.startDate === currentMonStr || (selectedWeek.startDate <= todayStr && todayStr <= selectedWeek.endDate));
  const isPast = selectedWeek.isPastWeek ?? (selectedWeek.endDate < todayStr);

  const plannedTss = selectedWeekPlan.reduce((acc, curr) => acc + (curr.tss || parseWorkoutDoc(curr.workoutDoc).estimatedTss || 0), 0) || 284;
  const isCurrentSelectedWeek = selectedIndex === (blueprint.currentWeekIndex || 0);

  const directWeekExecutedTss = selectedWeekPlan.reduce((sum, item) => {
    const dayData = dailyExecutedActivities?.[item.date];
    const dayTss = dayData?.totalTss ?? 0;
    return sum + dayTss;
  }, 0);

  const effectiveExecutedTss = directWeekExecutedTss > 0
    ? directWeekExecutedTss
    : (isPast || isCurrentSelectedWeek ? executedTss : 0);

  const adherence = plannedTss > 0
    ? Math.min(150, Math.round((effectiveExecutedTss / plannedTss) * 100))
    : 0;

  const getAdherenceBadge = (pct: number) => {
    if (pct >= 85 && pct <= 115) return { label: "Óptimo", color: "bg-emerald-500 text-white dark:bg-emerald-600" };
    if (pct > 115) return { label: "Sobrecarga", color: "bg-amber-500 text-white dark:bg-amber-600" };
    if (pct > 0) return { label: "Parcial", color: "bg-sky-500 text-white dark:bg-sky-600" };
    return { label: isPast ? "Sin registro" : "Pendiente", color: "bg-slate-400 text-white dark:bg-slate-600" };
  };

  const adherenceBadge = getAdherenceBadge(adherence);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header del Espacio de Trabajo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Semana {selectedWeek.weekNumber} de {weeksCount}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              • {selectedWeek.formattedRange}
            </span>
            {isCurrent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                ⏱️ En Curso
              </span>
            )}
            {selectedWeek.milestone && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                ⭐ {selectedWeek.milestone}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {selectedWeek.phaseLabel}: {selectedWeek.microcycleLabel}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {getCleanFocusDescription(selectedWeek.focusDescription)}
          </p>
        </div>

        {/* Métricas de Carga Semanal */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-right px-2 font-mono">
            <span className="text-[10px] text-slate-400 block font-sans">Carga Semanal</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {effectiveExecutedTss}
              </span>
              <span className="text-[10px] text-slate-400">/ {plannedTss} TSS</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black ${adherenceBadge.color}`}>
            {adherence}% {adherenceBadge.label}
          </span>
        </div>
      </div>

      {/* Tarjeta Informativa de Estructura y Head Coach */}
      <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/30 p-3 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">
            {getStructureLabel(selectedWeek)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
            Tirada Pico Proyectada: {selectedWeek.maxLongRunMinutes ? `${selectedWeek.maxLongRunMinutes} min` : "Regenerativa"}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenCoachWithPlan}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700/80 transition cursor-pointer text-xs shrink-0 shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
          Consultar con Head Coach IA
        </button>
      </div>

      {/* Grid de Días de la Semana (Lunes a Domingo) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Programación Diaria Detallada (Lunes a Domingo):
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {(() => {
            const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
            const dayMap: Record<string, typeof selectedWeekPlan> = {};
            daysOfWeek.forEach((d) => (dayMap[d] = []));
            selectedWeekPlan.forEach((item) => {
              if (dayMap[item.day]) dayMap[item.day].push(item);
            });

            return daysOfWeek.map((dayName) => {
              const dayItems = dayMap[dayName] || [];
              return (
                <div key={dayName} className="space-y-2 flex flex-col justify-start">
                  {dayItems.map((item, dIdx) => (
                    <MacrocycleDayScheduleCard
                      key={dIdx}
                      item={item}
                      runFtp={runFtp}
                      bikeFtp={bikeFtp}
                      dailyExecutedActivities={dailyExecutedActivities}
                      onSelectWorkoutModal={onSelectWorkoutModal}
                    />
                  ))}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
