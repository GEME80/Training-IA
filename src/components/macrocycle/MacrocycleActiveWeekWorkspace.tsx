"use client";

import React from "react";
import {
  Sparkles,
  Check,
  Footprints,
  Bike,
  Dumbbell,
  Waves,
  Moon,
} from "lucide-react";
import {
  MacrocycleBlueprint,
  MacrocycleWeek,
  getCleanFocusDescription,
} from "@/lib/physiology/macrocycle";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";
import { getLocalTodayStr, getMondayOfWeekStr } from "@/lib/dateUtils";

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
  const getDisciplineIcon = (discipline: string) => {
    if (discipline === "Descanso" || discipline === "Off") {
      return <Moon className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    }
    if (discipline === "Fuerza") {
      return <Dumbbell className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    }
    if (discipline === "Ciclismo") {
      return <Bike className="h-3.5 w-3.5 text-cyan-500 shrink-0" />;
    }
    if (discipline === "Natacion" || discipline === "Natación") {
      return <Waves className="h-3.5 w-3.5 text-sky-500 shrink-0" />;
    }
    return <Footprints className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
  };

  const getStructureLabel = (week: MacrocycleWeek) => {
    if (week.isRecoveryWeek || week.microcycleType === "DESCARGA_ASIMILACION") {
      return "🌿 Estructura: Descarga 3:1";
    }
    if (week.microcycleType === "IMPACTO_CHOQUE") {
      return "🔥 Estructura: Choque";
    }
    if (week.microcycleType === "TAPER") {
      return "⚡ Estructura: Taper";
    }
    if (week.microcycleType === "COMPETICION") {
      return "🏆 Estructura: Competición";
    }
    if (week.microcycleType === "MANTENIMIENTO") {
      return "🔵 Estructura: Mantenimiento";
    }
    return "📈 Estructura: Carga Progresiva";
  };

  const currentMonStr = getMondayOfWeekStr();
  const isCurrent = selectedWeek.isCurrentWeek ?? (selectedWeek.startDate === currentMonStr || selectedIndex === blueprint.currentWeekIndex);
  const isPast = selectedWeek.isPastWeek ?? (selectedWeek.startDate < currentMonStr);

  const plannedTss = selectedWeekPlan.reduce((acc, curr) => acc + (curr.tss || parseWorkoutDoc(curr.workoutDoc).estimatedTss || 0), 0) || 284;
  const isCurrentSelectedWeek = selectedIndex === (blueprint.currentWeekIndex || 0);

  const directWeekExecutedTss = selectedWeekPlan.reduce((sum, item) => {
    const dayData = dailyExecutedActivities?.[item.date];
    const dayTss = dayData?.totalTss ?? 0;
    return sum + dayTss;
  }, 0);

  const effectiveExecutedTss = directWeekExecutedTss > 0
    ? directWeekExecutedTss
    : (isCurrentSelectedWeek
        ? (executedTss ?? 0)
        : (selectedIndex < (blueprint.currentWeekIndex || 0) ? plannedTss : 0));
  const remainingTss = Math.max(0, plannedTss - effectiveExecutedTss);
  const completionPercentage = plannedTss > 0 ? Math.round((effectiveExecutedTss / plannedTss) * 100) : 0;

  let complianceBadge = {
    label: "● En Progreso",
    style: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    barColor: "bg-blue-500",
  };

  if (effectiveExecutedTss > 0) {
    if (completionPercentage >= 90 && completionPercentage <= 110) {
      complianceBadge = {
        label: "🟢 En Objetivo (90–110%)",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        barColor: "bg-emerald-500",
      };
    } else if (completionPercentage > 110) {
      complianceBadge = {
        label: "🟠 Sobrecarga (>110%)",
        style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        barColor: "bg-amber-500",
      };
    }
  } else {
    if (selectedIndex < (blueprint.currentWeekIndex || 0)) {
      complianceBadge = {
        label: "🟢 Completada",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        barColor: "bg-emerald-500",
      };
    } else {
      complianceBadge = {
        label: "⚪ Inicio de Semana",
        style: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        barColor: "bg-blue-500",
      };
    }
  }

  return (
    <div className="card-gradient rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm animate-fadeIn">
      {/* Header del Espacio de Trabajo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-black px-3 py-0.5 flex items-center gap-1">
              <span>⚡</span>
              Semana {selectedWeek.weekNumber} de {weeksCount}
            </span>

            {isCurrent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                🟢 Semana Actual en Curso
              </span>
            ) : isPast ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[11px] font-bold px-2.5 py-0.5">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ⚪ Semana Completada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5">
                ⏳ Semana Pendiente
              </span>
            )}

            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
              📅 {selectedWeek.formattedRange}
            </span>

            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-xs font-bold">
              {getStructureLabel(selectedWeek)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide">
            {getCleanFocusDescription(selectedWeek.focusDescription, selectedWeek.phase, selectedWeek.isRecoveryWeek || selectedWeek.microcycleType === "DESCARGA_ASIMILACION")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenCoachWithPlan}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 hover:from-cyan-400 hover:to-emerald-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            title="Abrir el Head Coach en Vivo para evaluar asimilación y recalibrar la semana"
          >
            <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
            <span>Head Coach IA & Adaptación</span>
          </button>
        </div>
      </div>

      {/* Control & Balance de Carga Fisiológica */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 sm:p-4 space-y-2.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Balance de Carga Fisiológica (TSS Semanal)
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
              {effectiveExecutedTss} / {plannedTss} TSS ({completionPercentage}% completado)
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${complianceBadge.style}`}>
            {complianceBadge.label}
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${complianceBadge.barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-2">
          <span>
            🎯 Planificado: <strong className="text-slate-900 dark:text-white font-mono">{plannedTss} TSS</strong>
          </span>
          <span>
            ✅ Ejecutado: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{effectiveExecutedTss} TSS</strong>
          </span>
          <span>
            ⏳ Restante: <strong className="text-amber-600 dark:text-amber-400 font-mono">{remainingTss} TSS</strong>
          </span>
        </div>
      </div>

      {/* Programación Diaria Detallada */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span>🗓️</span>
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
                  {dayItems.map((item, dIdx) => {
                    const todayStr = getLocalTodayStr();
                    const isPastDay = item.date < todayStr;
                    const isToday = item.date === todayStr;

                    const isRest = item.isRestDay || item.discipline === "Descanso";
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
                        key={dIdx}
                        onClick={() => {
                          if (!isRest && item.workoutDoc) {
                            onSelectWorkoutModal({
                              ...item,
                              workoutName: displayName,
                            });
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
                                isExecuted
                                  ? "text-emerald-950 dark:text-emerald-200"
                                  : isMissed
                                  ? "text-rose-950 dark:text-rose-200"
                                  : isToday
                                  ? "text-cyan-700 dark:text-cyan-400"
                                  : "text-slate-900 dark:text-white"
                              }`}>
                                {item.day}
                              </span>
                              <span className={`text-[10px] font-mono font-bold ${
                                isExecuted
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : isMissed
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isToday
                                  ? "text-cyan-600 dark:text-cyan-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}>
                                {item.formattedDate}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center space-x-1 shrink-0">
                                <span className="text-xs shrink-0">{icon}</span>
                                <span className={`text-[10px] font-bold ${
                                  isExecuted
                                    ? "text-emerald-800 dark:text-emerald-300"
                                    : isMissed
                                    ? "text-rose-800 dark:text-rose-300"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}>
                                  {item.discipline}
                                </span>
                              </div>

                              {isExecuted ? (
                                <span
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shrink-0 shadow-2xs"
                                  title="Sesión Realizada"
                                >
                                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                                </span>
                              ) : isMissed ? (
                                <span
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 shrink-0 shadow-2xs text-[11px] font-black leading-none"
                                  title="Sesión No Realizada / Omitida"
                                >
                                  ✕
                                </span>
                              ) : isToday ? (
                                <span
                                  className="inline-flex items-center justify-center px-1.5 h-5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/25 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 shrink-0 text-[10px] font-black"
                                  title="Sesión de Hoy"
                                >
                                  ⏱️ Hoy
                                </span>
                              ) : isRest ? (
                                <span
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 text-[11px]"
                                  title="Día de Descanso Pasivo"
                                >
                                  🌙
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 text-[10px]"
                                  title="Sesión Programada"
                                >
                                  ⏳
                                </span>
                              )}
                            </div>
                          </div>

                          <h5 className={`mt-2 text-[11px] font-bold line-clamp-2 min-h-[30px] transition-colors leading-snug ${
                            isExecuted
                              ? "text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300"
                              : isMissed
                              ? "text-rose-950 dark:text-rose-100 group-hover:text-rose-600 dark:group-hover:text-rose-300"
                              : "text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
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
                                <span>⚡ {item.discipline === "Ciclismo" ? `${bikeFtp} W` : `${runFtp} W`}</span>
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
                                  ⚡ {item.discipline === "Ciclismo" ? `${bikeFtp} W` : item.discipline === "Carrera" ? `${runFtp} W` : "Fuerza"}
                                </span>
                                <span>❤️ Z1-Z2</span>
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
                  })}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
