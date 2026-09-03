"use client";

import React, { useState, useMemo } from "react";
import {
  Footprints,
  Bike,
  Dumbbell,
  Waves,
  Moon,
  ChevronLeft,
  ChevronRight,
  Check,
  Activity,
  Zap,
  Info,
  Sparkles,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";

interface AthleteMobileAgendaViewProps {
  blueprint: MacrocycleBlueprint;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  todayStr: string;
  weekPlan: PlanItem[];
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectWorkoutModal: (item: PlanItem) => void;
  onOpenAICoach?: () => void;
}

const dayShortNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export const AthleteMobileAgendaView: React.FC<AthleteMobileAgendaViewProps> = ({
  blueprint,
  selectedMacroWeekIdx,
  onSelectWeek,
  todayStr,
  weekPlan,
  dailyExecutedActivities = {},
  onSelectWorkoutModal,
  onOpenAICoach,
}) => {
  const weeks = blueprint.weeks || [];
  const currentWeek = weeks[selectedMacroWeekIdx] || weeks[0];

  // Agrupar items de la semana por fecha/día
  const daysMap = useMemo(() => {
    const map: { [dayIdx: number]: { date: string; items: PlanItem[] } } = {};
    for (let i = 0; i < 7; i++) {
      map[i] = { date: "", items: [] };
    }

    weekPlan.forEach((item) => {
      let dayIdx = 0;
      if (item.date && currentWeek?.startDate) {
        const start = new Date(currentWeek.startDate + "T00:00:00");
        const current = new Date(item.date + "T00:00:00");
        const diffDays = Math.round((current.getTime() - start.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays < 7) dayIdx = diffDays;
      }
      if (!map[dayIdx]) map[dayIdx] = { date: item.date || "", items: [] };
      map[dayIdx].items.push(item);
      if (!map[dayIdx].date && item.date) map[dayIdx].date = item.date;
    });

    return map;
  }, [weekPlan, currentWeek]);

  // Encontrar el día de HOY dentro de la semana seleccionada
  const todayDayIdx = useMemo(() => {
    for (let i = 0; i < 7; i++) {
      if (daysMap[i]?.date === todayStr) return i;
    }
    return 0; // Default lunes si no coincide
  }, [daysMap, todayStr]);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayDayIdx);

  const selectedDayData = daysMap[selectedDayIdx] || { date: "", items: [] };
  const selectedDayItems = selectedDayData.items;
  const isTodaySelected = selectedDayData.date === todayStr;

  const executedForDay = selectedDayData.date ? dailyExecutedActivities[selectedDayData.date] : undefined;
  const executedActivities: DailyExecutedActivity[] = executedForDay?.activities || [];

  const getDisciplineIcon = (disc: string) => {
    if (disc === "Carrera") return <Footprints className="h-4 w-4 text-amber-500" />;
    if (disc === "Ciclismo") return <Bike className="h-4 w-4 text-cyan-500" />;
    if (disc === "Natacion") return <Waves className="h-4 w-4 text-sky-500" />;
    if (disc === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500" />;
    return <Moon className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="space-y-3.5 select-none md:hidden animate-fadeIn">
      {/* 1. Selector de Semana Ergonómico Móvil */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          disabled={selectedMacroWeekIdx === 0}
          onClick={() => onSelectWeek(Math.max(0, selectedMacroWeekIdx - 1))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Semana Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Semana {selectedMacroWeekIdx + 1} de {weeks.length}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {currentWeek?.phase || "Base"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {currentWeek?.focusDescription || currentWeek?.phaseLabel || "Construcción Aeróbica"}
          </span>
        </div>

        <button
          type="button"
          disabled={selectedMacroWeekIdx >= weeks.length - 1}
          onClick={() => onSelectWeek(Math.min(weeks.length - 1, selectedMacroWeekIdx + 1))}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Semana Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Barra Horizontal de los 7 Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {dayShortNames.map((name, idx) => {
          const dayInfo = daysMap[idx];
          const isSelected = selectedDayIdx === idx;
          const isToday = dayInfo?.date === todayStr;
          const hasExecution = dayInfo?.date ? !!dailyExecutedActivities[dayInfo.date]?.totalTss : false;
          const firstItem = dayInfo?.items[0];
          const isRest = firstItem?.isRestDay || firstItem?.discipline === "Descanso";

          const dayNumber = dayInfo?.date ? dayInfo.date.split("-")[2] : "";

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer relative touch-bounce ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-md scale-[1.02]"
                  : isToday
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="text-[9px] font-bold tracking-tight opacity-75">{name}</span>
              <span className="text-xs font-mono font-black mt-0.5">{dayNumber}</span>

              {/* Indicador de estado */}
              <div className="mt-1 flex items-center justify-center h-2">
                {hasExecution ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Ejecutado" />
                ) : isRest ? (
                  <span className="h-1 w-1 rounded-full bg-slate-300" title="Descanso" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" title="Programado" />
                )}
              </div>

              {/* Badge HOY */}
              {isToday && !isSelected && (
                <span className="absolute -top-1 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[7px] font-black uppercase">
                  Hoy
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tarjeta Principal del Día Seleccionado */}
      <div className="space-y-2.5">
        {selectedDayItems.length === 0 ? (
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Día sin sesiones programadas.
          </div>
        ) : (
          selectedDayItems.map((workout, wIdx) => {
            const parsedDoc = parseWorkoutDoc(workout.workoutDoc);
            const isRest = workout.isRestDay || workout.discipline === "Descanso";
            const executedMatch = executedActivities[wIdx] || executedActivities[0];

            return (
              <div
                key={wIdx}
                onClick={() => onSelectWorkoutModal(workout)}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs touch-bounce space-y-3 ${
                  executedMatch
                    ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/30"
                    : isTodaySelected
                    ? "border-cyan-300 dark:border-cyan-700/60 ring-2 ring-cyan-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {/* Cabecera de la Sesión */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getDisciplineIcon(workout.discipline)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {workout.day} • {selectedDayData.date}
                        </span>
                        {isTodaySelected && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                            Hoy
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
                      </h4>
                    </div>
                  </div>

                  {executedMatch ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      Completado
                    </span>
                  ) : isRest ? (
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Descanso
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 text-[10px] font-bold">
                      Planificado
                    </span>
                  )}
                </div>

                {/* Métricas Clave de la Sesión */}
                {!isRest && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Tiempo</span>
                      <strong className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                        <Activity className="h-3 w-3 text-cyan-500" />
                        {workout.durationMinutes}m
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Carga TSS</span>
                      <strong className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {executedMatch?.tss ? `${executedMatch.tss} / ` : ""}{workout.tss || parsedDoc.estimatedTss || 0}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Enfoque</span>
                      <strong className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">
                        {workout.discipline}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Resumen de Estructura / Stryd */}
                {workout.workoutDoc && (
                  <div className="text-[11px] font-mono bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-xl text-slate-600 dark:text-slate-300 space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 block font-sans">Estructura:</span>
                    {workout.workoutDoc
                      .split("\n")
                      .filter((l) => l.trim().startsWith("-"))
                      .slice(0, 3)
                      .map((line, bIdx) => (
                        <div key={bIdx} className="truncate">
                          {line.trim()}
                        </div>
                      ))}
                  </div>
                )}

                {/* Botón Táctil de 1 Toque */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium">Toca para ver intervalos y potencia</span>
                  <span className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
                    Ver Detalle →
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Actividades Extras no planificadas de ese día */}
        {executedActivities.length > selectedDayItems.length && (
          <div className="rounded-2xl p-3 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-mono uppercase font-black text-slate-500">
              Actividad Adicional Registrada:
            </span>
            {executedActivities.slice(selectedDayItems.length).map((extra, eIdx) => (
              <div key={eIdx} className="flex items-center justify-between font-mono">
                <span className="truncate">{extra.name}</span>
                <span className="font-bold text-emerald-600">+{extra.tss} TSS</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
