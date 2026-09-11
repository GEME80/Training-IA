"use client";

import React from "react";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { AthleteContinuousCalendar } from "./AthleteContinuousCalendar";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, DailyExecutedMap } from "@/lib/intervals/types";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";

interface AthleteDashboardOverviewProps {
  physioStatus: PhysiologicalStatus | null;
  profile: AthleteProfile;
  latestWellness: AthleteWellness | null;
  visibleMetrics: string[];
  onToggleMetric: (id: string) => Promise<void>;
  blueprint: MacrocycleBlueprint | null;
  selectedMacroWeekIdx: number;
  onSelectWeek: (idx: number) => void;
  weeklyAvailability: WeeklyAvailabilityMap;
  weeklyExecutedTss: number;
  dailyExecutedActivities: DailyExecutedMap;
  onOpenAICoach: (weekIdx?: number) => void;
  onSyncWeekToIntervals: (plan: PlanItem[]) => Promise<void>;
  onSelectWorkoutModal: (item: PlanItem) => void;
  onOpenSeasonStudio: () => void;
}

export const AthleteDashboardOverview: React.FC<AthleteDashboardOverviewProps> = ({
  physioStatus,
  profile,
  latestWellness,
  visibleMetrics,
  onToggleMetric,
  blueprint,
  selectedMacroWeekIdx,
  onSelectWeek,
  weeklyAvailability,
  weeklyExecutedTss,
  dailyExecutedActivities,
  onOpenAICoach,
  onSyncWeekToIntervals,
  onSelectWorkoutModal,
  onOpenSeasonStudio,
}) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Encabezado de Sección */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-sky-500" />
            Mi Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Métricas fisiológicas en vivo, telemetría PMC y calendario continuo de entrenamientos.
          </p>
        </div>
      </div>

      {/* TARJETAS DE TELEMETRÍA DINÁMICAS PMC */}
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

      {/* CALENDARIO CONTINUO SEMANAL O ESTADO VACÍO */}
      {blueprint ? (
        <AthleteContinuousCalendar
          blueprint={blueprint}
          selectedMacroWeekIdx={selectedMacroWeekIdx}
          onSelectWeek={onSelectWeek}
          runFtp={profile.run_ftp || 0}
          bikeFtp={profile.bike_ftp || 0}
          weeklyAvailability={weeklyAvailability}
          weeklyExecutedTss={weeklyExecutedTss}
          dailyExecutedActivities={dailyExecutedActivities}
          onOpenAICoach={onOpenAICoach}
          onSyncWeekToIntervals={onSyncWeekToIntervals}
          onSelectWorkoutModal={onSelectWorkoutModal}
        />
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
  );
};
