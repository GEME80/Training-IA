"use client";

import React, { useState, useMemo } from "react";
import { LayoutDashboard, Sparkles, TrendingUp, CalendarDays } from "lucide-react";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { AthleteContinuousCalendar } from "./AthleteContinuousCalendar";
import { AthletePMCChart } from "./pmc/AthletePMCChart";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, DailyExecutedMap, CalendarEvent } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { buildHistoricalBlueprint } from "@/lib/physiology/historicalCalendarWeeks";

interface AthleteDashboardOverviewProps {
  physioStatus: PhysiologicalStatus | null;
  profile: AthleteProfile;
  latestWellness: AthleteWellness | null;
  wellnessHistory?: AthleteWellness[];
  visibleMetrics: string[];
  onToggleMetric: (id: string) => Promise<void>;
  blueprint: MacrocycleBlueprint | null;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  weeklyAvailability: WeeklyAvailabilityMap;
  weeklyExecutedTss: number;
  dailyExecutedActivities: DailyExecutedMap;
  calendarEvents?: CalendarEvent[];
  onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals: (plan: PlanItem[]) => Promise<void>;
  onSyncTriweeklyBlock?: (weekIdx: number) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
  onOpenSeasonStudio: () => void;
  onRefreshTelemetry?: () => Promise<void>;
  isRefreshingTelemetry?: boolean;
}

export const AthleteDashboardOverview: React.FC<AthleteDashboardOverviewProps> = ({
  physioStatus,
  profile,
  latestWellness,
  wellnessHistory = [],
  visibleMetrics,
  onToggleMetric,
  blueprint,
  selectedMacroWeekIdx,
  onSelectWeek,
  weeklyAvailability,
  weeklyExecutedTss,
  dailyExecutedActivities,
  calendarEvents,
  onOpenAICoach,
  onSyncWeekToIntervals,
  onSyncTriweeklyBlock,
  onSelectWorkoutModal,
  onOpenSeasonStudio,
  onRefreshTelemetry,
  isRefreshingTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "pmc">("overview");

  const effectiveBlueprint = useMemo(() => {
    if (blueprint) return blueprint;
    const hasActs = Object.keys(dailyExecutedActivities || {}).some(
      (k) => dailyExecutedActivities[k]?.activities?.length > 0
    );
    if (hasActs) {
      return buildHistoricalBlueprint(dailyExecutedActivities, profile);
    }
    return null;
  }, [blueprint, dailyExecutedActivities, profile]);

  const dashboardHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-sky-500" />
          Mi Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Métricas de tu condición física en vivo, estado de forma y calendario de entrenamientos.
        </p>
      </div>

      {/* SELECTOR DE PESTAÑAS: RESUMEN ACTUAL VS GRÁFICAS PMC */}
      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
            activeTab === "overview"
              ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Resumen & Calendario</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pmc")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
            activeTab === "pmc"
              ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Estado de Forma & Evolución</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Si estamos en vista PMC o no hay blueprint, el encabezado se renderiza arriba normalmente */}
      {(activeTab === "pmc" || !effectiveBlueprint) && (
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          {dashboardHeader}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 1: RESUMEN ACTUAL Y CALENDARIO */}
      {activeTab === "overview" && (
        <div className="space-y-3 animate-fadeIn">
          {/* CALENDARIO CONTINUO — Header y Métricas viajan dentro del contenedor Sticky Maestro */}
          {effectiveBlueprint ? (
            <div className="space-y-3">
              {!blueprint && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs font-mono text-emerald-900 dark:text-emerald-200">
                      <strong>Modo Historial Activo:</strong> Estás visualizando tus entrenamientos registrados en Intervals.icu. Diseña tu macrociclo para proyectar las próximas semanas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSeasonStudio}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs font-mono shadow-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    Diseñar Macrociclo con IA
                  </button>
                </div>
              )}
              <AthleteContinuousCalendar
                blueprint={effectiveBlueprint}
                selectedMacroWeekIdx={selectedMacroWeekIdx}
                onSelectWeek={onSelectWeek}
                runFtp={profile.run_ftp || 0}
                bikeFtp={profile.bike_ftp || 0}
                weeklyAvailability={weeklyAvailability}
                weeklyExecutedTss={weeklyExecutedTss}
                dailyExecutedActivities={dailyExecutedActivities}
                calendarEvents={calendarEvents}
                onOpenAICoach={onOpenAICoach}
                onSyncWeekToIntervals={onSyncWeekToIntervals}
                onSyncTriweeklyBlock={onSyncTriweeklyBlock}
                onSelectWorkoutModal={onSelectWorkoutModal}
                dashboardHeaderSlot={dashboardHeader}
                stickyTopSlot={
                  <PhysiologicalCards
                    status={physioStatus}
                    runFtp={profile.run_ftp}
                    bikeFtp={profile.bike_ftp}
                    weightKg={profile.weight}
                    age={profile.age}
                    restingHR={profile.restingHR}
                    hrv={physioStatus?.currentHrv}
                    sleepQuality={latestWellness?.sleepQuality}
                    sleepSecs={latestWellness?.sleepSecs}
                    efficiencyFactor={profile.icu_efficiency_factor}
                    visibleMetrics={visibleMetrics}
                    onToggleMetric={onToggleMetric}
                  />
                }
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-12 text-center space-y-4 shadow-xs animate-fadeIn">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Sin Plan de Entrenamiento Activo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Actualmente no tienes ningún macrociclo en ejecución. Diseña un plan a medida con el Head Coach IA o selecciona un programa de la biblioteca para llenar tu calendario.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenSeasonStudio}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Diseñar Macrociclo con IA</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA 2: GRÁFICO PMC INTERACTIVO CON HISTÓRICO Y PROYECCIÓN */}
      {activeTab === "pmc" && (
        <div className="animate-fadeIn">
          <AthletePMCChart
            wellnessHistory={wellnessHistory}
            blueprint={blueprint}
            athleteName={profile.name}
            onRefresh={onRefreshTelemetry}
            isRefreshing={isRefreshingTelemetry}
          />
        </div>
      )}
    </div>
  );
};
