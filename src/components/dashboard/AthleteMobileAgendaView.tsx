"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { MacrocycleBlueprint, MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { getMondayOfWeekStr } from "@/lib/dateUtils";
import { AthleteMobileExtraCard } from "./AthleteMobileExtraCard";
import { AthleteMobileWorkoutCard } from "./AthleteMobileWorkoutCard";
import { MobileWeekFeedItem } from "./AthleteMobileWeekFeed";
import { WeeklyCalendarStrip } from "./WeeklyCalendarStrip";
import { matchDailyActivities } from "./matchDailyActivities";
import { dayShortNames, getWeekDates, formatDayMonthShort } from "./athleteMobileHelpers";

interface AthleteMobileAgendaViewProps {
  blueprint: MacrocycleBlueprint;
  timelineWeeks?: MacrocycleWeek[];
  activeTimelineWeekIdx?: number;
  onSelectTimelineWeek?: (idx: number) => void;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  todayStr: string;
  weekPlan: PlanItem[];
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectWorkoutModal: (item: PlanItem) => void;
  onOpenAICoach?: () => void;
}

export const AthleteMobileAgendaView: React.FC<AthleteMobileAgendaViewProps> = ({
  blueprint,
  timelineWeeks,
  activeTimelineWeekIdx,
  onSelectTimelineWeek,
  selectedMacroWeekIdx,
  onSelectWeek,
  todayStr,
  weekPlan,
  dailyExecutedActivities = {},
  onSelectWorkoutModal,
  onOpenAICoach,
}) => {
  const weeks = timelineWeeks && timelineWeeks.length > 0 ? timelineWeeks : (blueprint.weeks || []);
  const activeIdx = activeTimelineWeekIdx !== undefined ? activeTimelineWeekIdx : selectedMacroWeekIdx;
  const currentWeek = weeks[activeIdx] || weeks[0];
  const currentMonStr = getMondayOfWeekStr();
  const isCurrentWeek = currentWeek?.startDate === currentMonStr || (currentWeek?.startDate <= todayStr && todayStr <= currentWeek?.endDate);
  const isHistorical = Boolean((currentWeek as any)?.isHistorical || currentWeek?.weekNumber <= 0);

  const handlePrevWeek = () => {
    if (onSelectTimelineWeek) {
      onSelectTimelineWeek(Math.max(0, activeIdx - 1));
    } else {
      onSelectWeek(Math.max(0, selectedMacroWeekIdx - 1));
    }
  };

  const handleNextWeek = () => {
    if (onSelectTimelineWeek) {
      onSelectTimelineWeek(Math.min(weeks.length - 1, activeIdx + 1));
    } else {
      onSelectWeek(Math.min(weeks.length - 1, selectedMacroWeekIdx + 1));
    }
  };

  // 1. Asignar determinísticamente los 7 días de la semana con fechas reales YYYY-MM-DD
  const daysMap = useMemo(() => {
    const baseMonday = currentWeek?.startDate || currentMonStr;
    const dates = getWeekDates(baseMonday);
    const map: { [dayIdx: number]: { date: string; items: PlanItem[] } } = {};
    for (let i = 0; i < 7; i++) {
      map[i] = { date: dates[i] || "", items: [] };
    }

    weekPlan.forEach((item) => {
      let dayIdx = -1;
      if (item.date) {
        dayIdx = dates.indexOf(item.date);
      }
      if (dayIdx >= 0 && dayIdx < 7) {
        map[dayIdx].items.push(item);
      }
    });

    return map;
  }, [weekPlan, currentWeek?.startDate, currentMonStr]);

  // 2. Encontrar el día de HOY dentro de la semana seleccionada
  const todayDayIdx = useMemo(() => {
    for (let i = 0; i < 7; i++) {
      if (daysMap[i]?.date === todayStr) return i;
    }
    return 0; // Default lunes si hoy no está en esta semana
  }, [daysMap, todayStr]);

  // 3. Totales de carga de la semana activa (TSS planificado y TSS real ejecutado)
  const { weekPlannedTss, weekExecutedTss } = useMemo(() => {
    let pTss = 0;
    let eTss = 0;
    weekPlan.forEach((item) => {
      if (!item.isRestDay && item.discipline !== "Descanso") {
        pTss += item.tss || 0;
      }
    });
    // Sumar TSS real de las actividades ejecutadas en los 7 días de esta semana
    for (let i = 0; i < 7; i++) {
      const dStr = daysMap[i]?.date;
      if (dStr && dailyExecutedActivities[dStr]?.totalTss) {
        eTss += dailyExecutedActivities[dStr].totalTss;
      }
    }
    return { weekPlannedTss: pTss, weekExecutedTss: eTss };
  }, [weekPlan, daysMap, dailyExecutedActivities]);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayDayIdx);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sincronizar el día seleccionado cuando cambia la semana
  useEffect(() => {
    setSelectedDayIdx(todayDayIdx);
  }, [todayDayIdx, selectedMacroWeekIdx]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0 && selectedDayIdx < 6) setSelectedDayIdx((prev) => prev + 1);
      else if (diff < 0 && selectedDayIdx > 0) setSelectedDayIdx((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

  const selectedDayData = daysMap[selectedDayIdx] || { date: "", items: [] };
  const selectedDayItems = selectedDayData.items;
  const isTodaySelected = selectedDayData.date === todayStr;
  const isPastDay = selectedDayData.date ? selectedDayData.date < todayStr : false;

  const executedForDay = selectedDayData.date ? dailyExecutedActivities[selectedDayData.date] : undefined;
  const executedActivities: DailyExecutedActivity[] = executedForDay?.activities || [];

  // Emparejamiento coordinado por disciplina con helper modular
  const { matchedItems, extraActivities } = useMemo(() => {
    return matchDailyActivities(selectedDayItems, executedActivities);
  }, [selectedDayItems, executedActivities]);

  const weekRangeLabel = currentWeek?.startDate
    ? `${formatDayMonthShort(currentWeek.startDate)} - ${formatDayMonthShort(currentWeek.endDate)}`
    : "";

  const weekLabel = useMemo(() => {
    if (isHistorical) return `Historial • ${weekRangeLabel || "Semana"}`;
    if (blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly) {
      return isCurrentWeek ? "Semana Actual" : `Semana • ${weekRangeLabel}`;
    }
    if (isCurrentWeek) return "Semana Actual";
    return `Semana ${currentWeek?.weekNumber || activeIdx + 1} de ${blueprint.weeks?.length || weeks.length}`;
  }, [isHistorical, weekRangeLabel, blueprint.id, isCurrentWeek, currentWeek?.weekNumber, activeIdx, blueprint.weeks?.length, weeks.length]);

  return (
    <div className="space-y-3 select-none md:hidden animate-fadeIn">
      {/* 1. Tira Semanal Móvil Unificada: Navegación + Resumen TSS + 7 Días L-D */}
      <WeeklyCalendarStrip
        weekLabel={weekLabel}
        weekPlannedTss={weekPlannedTss}
        weekExecutedTss={weekExecutedTss}
        canPrev={activeIdx > 0}
        canNext={activeIdx < weeks.length - 1}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        daysMap={daysMap}
        selectedDayIdx={selectedDayIdx}
        onSelectDay={(idx) => {
          setSelectedDayIdx(idx);
          if (viewMode !== "day") setViewMode("day");
        }}
        todayStr={todayStr}
        dailyExecutedActivities={dailyExecutedActivities}
      />

      {/* 2. Control sutil de vista: Día vs Semana completa */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
          {viewMode === "day"
            ? `${dayShortNames[selectedDayIdx]} • ${formatDayMonthShort(selectedDayData.date)}`
            : "Semana Completa"}
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`px-2 py-0.5 rounded-md transition-all ${
              viewMode === "day"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Día
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-2 py-0.5 rounded-md transition-all ${
              viewMode === "week"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {viewMode === "day" ? (
        /* Tarjetas del Día Seleccionado con Swipe Gestual — Inmediatamente visibles */
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="space-y-2.5 transition-transform"
        >
            {matchedItems.length === 0 && extraActivities.length === 0 ? (
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                Día de descanso sin sesiones registradas.
              </div>
            ) : (
              <>
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
      ) : (
        /* 5. Vista Feed Semanal tipo TrainingPeaks */
        <div className="space-y-2">
          {dayShortNames.map((name, idx) => {
            const dayData = daysMap[idx] || { date: "", items: [] };
            const isToday = dayData.date === todayStr;
            const isPast = dayData.date ? dayData.date < todayStr : false;
            const dayExecuted = dayData.date ? dailyExecutedActivities[dayData.date] : undefined;

            return (
              <MobileWeekFeedItem
                key={idx}
                dayName={name}
                dateStr={dayData.date}
                items={dayData.items}
                dailyExecuted={dayExecuted}
                isToday={isToday}
                isPast={isPast}
                onSelectDay={() => {
                  setSelectedDayIdx(idx);
                  setViewMode("day");
                }}
                onSelectWorkoutModal={onSelectWorkoutModal}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
