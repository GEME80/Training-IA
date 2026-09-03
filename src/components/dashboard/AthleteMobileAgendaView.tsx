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
  X,
  Activity,
  Zap,
  Info,
  Sparkles,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { getMondayOfWeekStr } from "@/lib/dateUtils";
import { AthleteMobileExtraCard } from "./AthleteMobileExtraCard";
import { AthleteMobileWorkoutCard } from "./AthleteMobileWorkoutCard";

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

function formatDayMonthShort(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const m = parseInt(parts[1], 10) - 1;
    return `${day} ${months[m] || ""}`;
  }
  return dateStr;
}

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
  const currentMonStr = getMondayOfWeekStr();
  const isCurrentWeek = currentWeek?.startDate === currentMonStr;

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

  // Totales de carga de la semana activa
  const { weekPlannedTss, weekExecutedTss } = useMemo(() => {
    let pTss = 0;
    let eTss = 0;
    weekPlan.forEach((item) => {
      if (!item.isRestDay && item.discipline !== "Descanso") {
        pTss += item.tss || 0;
      }
      const actDay = dailyExecutedActivities[item.date];
      if (actDay?.totalTss) {
        eTss += actDay.totalTss;
      }
    });
    return { weekPlannedTss: pTss, weekExecutedTss: eTss };
  }, [weekPlan, dailyExecutedActivities]);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayDayIdx);

  const selectedDayData = daysMap[selectedDayIdx] || { date: "", items: [] };
  const selectedDayItems = selectedDayData.items;
  const isTodaySelected = selectedDayData.date === todayStr;
  const isPastDay = selectedDayData.date ? selectedDayData.date < todayStr : false;

  const executedForDay = selectedDayData.date ? dailyExecutedActivities[selectedDayData.date] : undefined;
  const executedActivities: DailyExecutedActivity[] = executedForDay?.activities || [];

  // Emparejamiento coordinado y estricto por disciplina idéntico al motor de PC
  const { matchedItems, extraActivities } = useMemo(() => {
    const usedActIds = new Set<string>();
    const matched = selectedDayItems.map((item) => {
      const isRest = item.isRestDay || item.discipline === "Descanso";
      if (isRest || executedActivities.length === 0) {
        return { item, matchedAct: null as DailyExecutedActivity | null, isRest };
      }

      let match: DailyExecutedActivity | undefined;
      if (item.discipline === "Carrera") {
        match = executedActivities.find(
          (a) => !usedActIds.has(a.id) && (a.type === "Run" || /run|carrera|trote|trail/i.test(a.type) || /run|carrera|trote|marat|fondo/i.test(a.name))
        );
      } else if (item.discipline === "Ciclismo") {
        match = executedActivities.find(
          (a) => !usedActIds.has(a.id) && (a.type === "Ride" || /ride|ciclismo|bike|virtualride|indoor/i.test(a.type) || /ride|ciclismo|bike|rodaje|fondo/i.test(a.name))
        );
      } else if (item.discipline === "Fuerza") {
        match = executedActivities.find(
          (a) => !usedActIds.has(a.id) && (a.type === "WeightTraining" || /weight|gym|fuerza|strength/i.test(a.type) || /fuerza|gym|pesas|fortalec/i.test(a.name))
        );
      }

      if (match) {
        usedActIds.add(match.id);
        return { item, matchedAct: match, isRest: false };
      }
      return { item, matchedAct: null as DailyExecutedActivity | null, isRest: false };
    });

    const extras = executedActivities.filter((a) => !usedActIds.has(a.id));
    return { matchedItems: matched, extraActivities: extras };
  }, [selectedDayItems, executedActivities]);

  const getDisciplineIcon = (disc: string) => {
    if (disc === "Carrera") return <Footprints className="h-4 w-4 text-amber-500" />;
    if (disc === "Ciclismo") return <Bike className="h-4 w-4 text-cyan-500" />;
    if (disc === "Natacion") return <Waves className="h-4 w-4 text-sky-500" />;
    if (disc === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500" />;
    return <Moon className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="space-y-3.5 select-none md:hidden animate-fadeIn">
      {/* 1. Selector de Semana Ergonómico Móvil con Carga Acumulada */}
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

        <div className="text-center px-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Semana {selectedMacroWeekIdx + 1} de {weeks.length}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-mono">
              {currentWeek?.phase || "Base"}
            </span>
            {isCurrentWeek && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 uppercase">
                Semana Actual
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[240px] mx-auto">
            {currentWeek?.focusDescription || currentWeek?.phaseLabel || "Construcción Aeróbica"}
          </p>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Carga: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{weekExecutedTss}</strong> / {weekPlannedTss} TSS
          </div>
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
          const dayFormatted = dayInfo?.date ? formatDayMonthShort(dayInfo.date) : "";

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
              <span className="text-[10px] font-mono font-black mt-0.5 leading-none whitespace-nowrap">{dayFormatted}</span>

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

      {/* 3. Tarjetas del Día Seleccionado */}
      <div className="space-y-2.5">
        {matchedItems.length === 0 && extraActivities.length === 0 ? (
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Día de descanso sin sesiones programadas.
          </div>
        ) : (
          <>
            {/* 3.1 Sesiones Planificadas con Emparejamiento Real */}
            {matchedItems.map(({ item: workout, matchedAct, isRest }, wIdx) => (
              <AthleteMobileWorkoutCard
                key={wIdx}
                workout={workout}
                matchedAct={matchedAct}
                isRest={isRest}
                isCompleted={Boolean(matchedAct)}
                isOmitted={!matchedAct && isPastDay && !isRest}
                isTodaySelected={isTodaySelected}
                selectedDate={selectedDayData.date}
                onSelectWorkoutModal={onSelectWorkoutModal}
              />
            ))}

            {/* 3.2 Actividades Extra / No Planificadas (Renderizadas con fidelidad 100% como en PC) */}
            {extraActivities.map((extraAct) => (
              <AthleteMobileExtraCard
                key={extraAct.id}
                activity={extraAct}
                dateStr={selectedDayData.date}
                dayName={dayShortNames[selectedDayIdx]}
                onSelectWorkoutModal={onSelectWorkoutModal}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
