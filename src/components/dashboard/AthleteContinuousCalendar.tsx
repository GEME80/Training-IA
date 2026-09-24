"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { CalendarDays, Compass } from "lucide-react";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import {
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
  PlanItem,
  resolveEffectiveAvailability,
  isLegacyAvailability,
} from "@/lib/gemini/engine";
import { DailyExecutedMap, CalendarEvent } from "@/lib/intervals/types";
import { getLocalTodayStr, getMondayOfWeekStr } from "@/lib/dateUtils";
import { AthleteCalendarWeekRow } from "./AthleteCalendarWeekRow";
import { AthleteMobileAgendaView } from "./AthleteMobileAgendaView";
import { hydrateWeekPlanFromEvents } from "@/lib/intervals/calendarHydration";
import { buildHistoricalCalendarWeeks } from "@/lib/physiology/historicalCalendarWeeks";

interface AthleteContinuousCalendarProps {
  blueprint: MacrocycleBlueprint;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  runFtp?: number;
  bikeFtp?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  weeklyExecutedTss?: number;
  dailyExecutedActivities?: DailyExecutedMap;
  calendarEvents?: CalendarEvent[];
  onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals?: (plan: PlanItem[]) => Promise<void>;
  onSyncTriweeklyBlock?: (weekIdx: number) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
  /** Encabezado del dashboard ("Mi Dashboard" + Tabs) anclado dentro del bloque sticky maestro */
  dashboardHeaderSlot?: React.ReactNode;
  /** Contenido opcional que se renderiza dentro del bloque sticky maestro, encima del título del calendario. */
  stickyTopSlot?: React.ReactNode;
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

/**
 * Calendario Unificado de Año Completo — Estilo Intervals.icu / TrainingPeaks
 * Scroll continuo: ↑ Plan Futuro | ── Semana Actual ── | ↓ Histórico
 */
export const AthleteContinuousCalendar: React.FC<AthleteContinuousCalendarProps> = ({
  blueprint,
  selectedMacroWeekIdx,
  onSelectWeek,
  runFtp = 0,
  bikeFtp = 0,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  weeklyExecutedTss = 0,
  dailyExecutedActivities = {},
  calendarEvents = [],
  onOpenAICoach,
  onSyncWeekToIntervals,
  onSyncTriweeklyBlock,
  onSelectWorkoutModal,
  dashboardHeaderSlot,
  stickyTopSlot,
}) => {
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentMonStr = getMondayOfWeekStr();
  const todayStr = getLocalTodayStr();
  const blueprintWeeks = blueprint.weeks || [];

  // Semanas históricas: orden reciente→antiguo (para scroll hacia abajo = pasado)
  const historicalWeeks = useMemo(
    () =>
      buildHistoricalCalendarWeeks({
        blueprintStartDate: blueprint.startDate || currentMonStr,
        dailyExecutedActivities,
        maxWeeksBack: 52,
      }),
    [blueprint.startDate, currentMonStr, dailyExecutedActivities]
  );

  // Semana actual del blueprint (puede coincidir fecha)
  const currentBlueprintWeek = useMemo(
    () =>
      blueprintWeeks.find(
        (w) =>
          w.startDate === currentMonStr ||
          (w.startDate <= todayStr && todayStr <= w.endDate)
      ),
    [blueprintWeeks, currentMonStr, todayStr]
  );

  // Semanas futuras: posteriores a la semana actual, en orden ascendente (próxima primero)
  const futureWeeks = useMemo(() => {
    const cutoff = currentBlueprintWeek?.startDate || currentMonStr;
    return blueprintWeeks
      .filter((w) => w.startDate > cutoff)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [blueprintWeeks, currentBlueprintWeek, currentMonStr]);

  /**
   * Array unificado para renderizar de arriba a abajo:
   * [futuras_lejanas..., futuras_próximas, semana_actual, pasada_1, pasada_2, ...]
   *
   * Las futuras se muestran en orden de más lejana (arriba) a más próxima (arriba-centro),
   * luego semana actual, luego histórico de más reciente (centro-abajo) a más antiguo.
   */
  const allYearWeeks = useMemo(() => {
    const futureSorted = [...futureWeeks].reverse(); // lejanas primero (top)
    const currentSlot = currentBlueprintWeek ? [currentBlueprintWeek] : [];
    // Histórico ya viene reciente→antiguo desde buildHistoricalCalendarWeeks
    return [...futureSorted, ...currentSlot, ...historicalWeeks];
  }, [futureWeeks, currentBlueprintWeek, historicalWeeks]);

  const totalWeeksLabel = allYearWeeks.length;

  // Auto-scroll instantáneo a la semana actual en el primer mount
  useEffect(() => {
    if (currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
    // Solo en el primer render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveAvailability = resolveEffectiveAvailability(
    weeklyAvailability && !isLegacyAvailability(weeklyAvailability)
      ? weeklyAvailability
      : ((blueprint.availabilitySnapshot as any) || weeklyAvailability)
  );

  const dayHeaders = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];
  const gridTemplate = "grid-cols-[160px_repeat(7,minmax(0,1fr))]";

  // Vista móvil: agenda de la semana activa
  const activeWeekForAgenda = blueprintWeeks[selectedMacroWeekIdx] || blueprintWeeks[0];
  const rawActiveWeekPlan = activeWeekForAgenda
    ? generateWeekTemplate(
        activeWeekForAgenda,
        runFtp,
        bikeFtp,
        effectiveAvailability,
        (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
        blueprint.athleteCtlAtCreation
      )
    : [];
  const activeWeekPlan = activeWeekForAgenda
    ? hydrateWeekPlanFromEvents(activeWeekForAgenda, rawActiveWeekPlan, calendarEvents)
    : [];

  return (
    <div className="animate-fadeIn select-none">
      {/* ══════════════════════════════════════════════════════════
          BLOQUE STICKY MAESTRO ('Main Sticky Header')
          Agrupa los 4 bloques:
          1. Encabezado principal y tabs (dashboardHeaderSlot)
          2. Métricas fisiológicas (stickyTopSlot)
          3. Barra de controles de calendario (Título + Hoy)
          4. Cabecera de la cuadrícula (SEMANA · FASE + Lun a Dom)
      ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm -mx-1 px-1">
        {/* Bloque 1: Encabezado principal y selector de vistas */}
        {dashboardHeaderSlot && (
          <div className="pt-1.5 pb-1.5 md:pt-2 md:pb-2 border-b border-slate-100 dark:border-slate-800/80">
            {dashboardHeaderSlot}
          </div>
        )}

        {/* Bloque 2: Métricas fisiológicas (CTL, ATL, TSB, Potencia) */}
        {stickyTopSlot && (
          <div className="pt-1 pb-1.5 md:pt-2 md:pb-2 border-b border-slate-100 dark:border-slate-800/80">
            {stickyTopSlot}
          </div>
        )}

        {/* Bloque 3: Barra de controles del calendario */}
        <div className="flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2">
          <div className="flex items-center gap-1.5 md:gap-2">
            <CalendarDays className="h-4 w-4 text-sky-500" />
            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white">
              Calendario de Entrenamiento
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {totalWeeksLabel} semanas · Año completo
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentWeekRef.current) {
                currentWeekRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-400 text-xs font-bold hover:bg-sky-500/20 transition cursor-pointer"
            title="Ir a la semana actual"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Hoy</span>
          </button>
        </div>

        {/* Bloque 4: Cabecera de la cuadrícula: Semana · Fase | Lun → Dom */}
        <div className="hidden md:block overflow-x-auto">
          <div
            className={`min-w-[960px] 2xl:min-w-0 w-full grid ${gridTemplate} gap-2 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-2`}
          >
            <div className="text-left pl-2 font-black text-slate-700 dark:text-slate-300">
              SEMANA · FASE
            </div>
            {dayHeaders.map((dh, i) => (
              <div key={i} className="text-center font-black">
                {dh}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════ */}

      {/* ── VISTA MÓVIL: Agenda Diaria ── */}
      <div className="md:hidden mt-3">
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
      </div>

      {/* ── VISTA ESCRITORIO: Cuadrícula Continua Anual ── */}
      <div ref={scrollContainerRef} className="hidden md:block overflow-x-auto mt-3">
        {/* Etiqueta de orientación: FUTURO */}
        {futureWeeks.length > 0 && (
          <div className="min-w-[960px] 2xl:min-w-0 flex items-center gap-3 px-3 py-2 mt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-700" />
            <span className="text-[10px] font-black font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              ↑ Plan Futuro ({futureWeeks.length} sem)
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-700" />
          </div>
        )}

        {/* Filas Semanales Unificadas */}
        <div className="min-w-[960px] 2xl:min-w-0 w-full space-y-3 pb-6">
          {allYearWeeks.map((week, renderIdx) => {
            const isHistoricalWeek = Boolean(
              (week as any).isHistorical || week.weekNumber <= 0
            );
            const isFutureWeek =
              !isHistoricalWeek && week.startDate > (currentBlueprintWeek?.startDate || currentMonStr);
            const isCurrentWeek =
              week.startDate === currentMonStr ||
              (!isHistoricalWeek && week.startDate <= todayStr && todayStr <= week.endDate);
            const isPastWeek = !isCurrentWeek && week.endDate < todayStr;
            const calendarWeekNumber = getWeekOfYear(week.startDate);
            const wIdx = isHistoricalWeek
              ? week.weekNumber
              : Math.max(0, week.weekNumber - 1);

            // Separador visual: etiqueta "SEMANA ACTUAL" antes de la primera semana actual
            const prevWeek = allYearWeeks[renderIdx - 1];
            const showCurrentDivider =
              isCurrentWeek &&
              prevWeek &&
              (prevWeek.startDate > currentMonStr || (prevWeek as any).isHistorical === false);

            return (
              <React.Fragment key={week.startDate}>
                {/* Divisor "Hoy" entre futuro y presente */}
                {showCurrentDivider && (
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400 dark:to-sky-600" />
                    <span className="text-[10px] font-black font-mono text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                      ── Semana Actual ──
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-400 dark:to-sky-600" />
                  </div>
                )}

                <div
                  ref={isCurrentWeek ? currentWeekRef : undefined}
                  className={isCurrentWeek ? "scroll-mt-[280px]" : undefined}
                >
                  <AthleteCalendarWeekRow
                    week={week}
                    wIdx={wIdx}
                    weeksCount={blueprintWeeks.length}
                    isCurrentWeek={isCurrentWeek}
                    isFutureWeek={isFutureWeek}
                    isSelectedWeek={wIdx === selectedMacroWeekIdx}
                    isPastWeek={isPastWeek}
                    calendarWeekNumber={calendarWeekNumber}
                    blueprint={blueprint}
                    runFtp={runFtp}
                    bikeFtp={bikeFtp}
                    effectiveAvailability={effectiveAvailability}
                    weeklyExecutedTss={weeklyExecutedTss}
                    dailyExecutedActivities={dailyExecutedActivities}
                    calendarEvents={calendarEvents}
                    todayStr={todayStr}
                    gridTemplate={gridTemplate}
                    currentWeekRef={currentWeekRef}
                    onSelectWeek={onSelectWeek}
                    onOpenAICoach={onOpenAICoach}
                    onSyncWeekToIntervals={onSyncWeekToIntervals}
                    onSyncTriweeklyBlock={onSyncTriweeklyBlock}
                    onSelectWorkoutModal={onSelectWorkoutModal}
                  />
                </div>

                {/* Separador "Historial" entre semana actual y primer semana pasada */}
                {isCurrentWeek && renderIdx < allYearWeeks.length - 1 && (
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700" />
                    <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      ↓ Historial Ejecutado ({historicalWeeks.length} sem)
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
