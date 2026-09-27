"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { getMondayOfWeekStr } from "@/lib/dateUtils";
import { AthleteMobileExtraCard } from "./AthleteMobileExtraCard";
import { AthleteMobileWorkoutCard } from "./AthleteMobileWorkoutCard";
import { MobileWeekFeedItem } from "./AthleteMobileWeekFeed";
import { AthleteMobileDayStrip } from "./AthleteMobileDayStrip";
import { matchDailyActivities } from "./matchDailyActivities";
import { dayShortNames, getWeekDates, formatDayMonthShort } from "./athleteMobileHelpers";

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
              {blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly
                ? isCurrentWeek ? "Semana Actual" : `Semana ${weekRangeLabel}`
                : `Semana ${selectedMacroWeekIdx + 1} de ${weeks.length}`}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-mono">
              {blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly ? "Sin Plan Activo" : (currentWeek?.phase || "Base")}
            </span>
            {isCurrentWeek && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 uppercase">
                Semana Actual
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[240px] mx-auto">
            {blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly
              ? weekRangeLabel ? `Rango: ${weekRangeLabel}` : "Historial de entrenamientos registrados en Intervals.icu"
              : (currentWeek?.focusDescription || currentWeek?.phaseLabel || "Construcción Aeróbica")}
          </p>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {blueprint.id === "historical-timeline-blueprint" || (blueprint as any).isHistoricalOnly || weekPlannedTss === 0 ? (
              <>Carga Real: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{weekExecutedTss}</strong> TSS</>
            ) : (
              <>Carga: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{weekExecutedTss}</strong> / {weekPlannedTss} TSS</>
            )}
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

      {/* 2. Barra de Control de Vista: Toggle [ Día | Semana ] */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {viewMode === "day" ? "Detalle Diario" : "Agenda Semanal"}
        </span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "day"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Día
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "week"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {viewMode === "day" ? (
        <>
          {/* 3. Tira de 7 Días con Número Grande y Banner de Fecha Actual */}
          <AthleteMobileDayStrip
            daysMap={daysMap}
            selectedDayIdx={selectedDayIdx}
            onSelectDay={setSelectedDayIdx}
            todayStr={todayStr}
            dailyExecutedActivities={dailyExecutedActivities}
          />

          {/* 4. Tarjetas del Día Seleccionado con Swipe Gestual */}
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
        </>
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
