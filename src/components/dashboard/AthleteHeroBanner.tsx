"use client";

import React from "react";
import {
  Layers,
  ArrowRight,
  Plus,
  Sparkles,
  Flag,
} from "lucide-react";
import {
  SeasonPlanItem,
  TargetRace,
  MacrocyclePhaseInfo,
  MacrocycleWeek,
  MacrocycleBlueprint,
  calculatePlanStatus,
} from "@/lib/physiology/macrocycle";

interface AthleteHeroBannerProps {
  seasonPlans: SeasonPlanItem[];
  currentlyViewedPlan: SeasonPlanItem | null;
  activePlanItem: SeasonPlanItem | null;
  upcomingPlanItem: SeasonPlanItem | null;
  primaryARace: TargetRace | null;
  primaryRace: TargetRace | null;
  blueprint: MacrocycleBlueprint | undefined;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  selectedMacroWeekIdx: number;
  weeks: MacrocycleWeek[];
  selectedWeek: MacrocycleWeek | undefined;
  isSyncing: boolean;
  onSelectPlan: (planId: string, weekIdx: number) => void;
  onOpenSeasonStudio: () => void;
  onSyncFullMacrocycle: () => void;
  onOpenAICoachSession: () => void;
}

export const AthleteHeroBanner: React.FC<AthleteHeroBannerProps> = ({
  seasonPlans,
  currentlyViewedPlan,
  activePlanItem,
  upcomingPlanItem,
  primaryARace,
  primaryRace,
  blueprint,
  macrocyclePhase,
  selectedMacroWeekIdx,
  weeks,
  selectedWeek,
  isSyncing,
  onSelectPlan,
  onOpenSeasonStudio,
  onSyncFullMacrocycle,
  onOpenAICoachSession,
}) => {
  return (
    <div className="rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col gap-4 shadow-sm">
      {/* FILA 1: CADENA DE PLANES DE TEMPORADA */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0 mr-1">
            <Layers className="h-3.5 w-3.5 text-cyan-500" />
            <span>Temporada ({seasonPlans.length} Planes):</span>
          </span>

          {seasonPlans.map((plan, pIdx) => {
            const status = calculatePlanStatus(plan.startDate, plan.endDate);
            const isSelected = (currentlyViewedPlan?.id || activePlanItem?.id) === plan.id;
            const isRunning = status === "ACTIVE";
            const isCompleted = status === "COMPLETED";

            return (
              <React.Fragment key={plan.id}>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id, plan.blueprint?.currentWeekIndex || 0)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm ring-2 ring-amber-500"
                      : isRunning
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                      : isCompleted
                      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                      : "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100"
                  }`}
                >
                  <span className="text-[10px]">{isRunning ? "🟢" : isCompleted ? "⚪" : "🟡"}</span>
                  <span>{plan.planName} ({plan.totalWeeks} sem)</span>
                </button>
                {pIdx < seasonPlans.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Botón Rápido para Añadir o Gestionar Planes de Temporada */}
        <button
          type="button"
          onClick={onOpenSeasonStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-cyan-50 hover:bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:bg-cyan-900/60 border border-cyan-300/80 dark:border-cyan-800 transition cursor-pointer shadow-2xs"
          title="Abrir Generador y Cadena de Planes"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Planificar Ciclo</span>
        </button>
      </div>

      {/* FILA 2: CONTENIDO PRINCIPAL DEL PLAN VISUALIZADO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 text-lg font-black shadow-inner">
            🎯
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide">
                {currentlyViewedPlan ? currentlyViewedPlan.planName : (primaryRace ? primaryRace.name : (blueprint?.cycleTitle || "Plan de Mantenimiento y Salud General"))}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono shadow-2xs">
                Semana {selectedMacroWeekIdx + 1} de {weeks.length || 8}
              </span>
              {macrocyclePhase && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border tracking-wide ${macrocyclePhase.cycleBadgeColor || macrocyclePhase.badgeColor}`}>
                  {macrocyclePhase.cycleBadgeLabel || macrocyclePhase.phaseLabel}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>📅 Fechas: <strong className="text-slate-800 dark:text-slate-200 font-mono">{currentlyViewedPlan?.startDate || blueprint?.startDate} ➔ {currentlyViewedPlan?.endDate || (weeks[weeks.length - 1]?.endDate)}</strong></span>
              <span>•</span>
              <span>🌱 Fase: <strong className="text-slate-800 dark:text-slate-200">{selectedWeek?.phase || "Base Aeróbica"}</strong></span>
              <span>•</span>
              <span>📊 Periodización 3:1</span>
            </div>
          </div>
        </div>

        {/* CTAs con Jerarquía */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onSyncFullMacrocycle}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Sube todas las semanas estructuradas del plan rector a Intervals.icu respetando tus días de descanso y zonas de potencia."
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{isSyncing ? "Sincronizando..." : `Sincronizar Macrociclo (${weeks.length} Sem)`}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAICoachSession}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 hover:from-cyan-400 hover:to-emerald-300 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
            <span>Adaptar Sesión con IA</span>
          </button>
        </div>
      </div>

      {/* FILA 3: BANNER DE EJECUCIÓN EN VIVO Y TRANSICIONES */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white">
            {activePlanItem
              ? `Plan en Ejecución: ${activePlanItem.planName} (Semana ${(activePlanItem.blueprint.currentWeekIndex ?? 0) + 1} de ${activePlanItem.totalWeeks})`
              : "Plan Activo en Curso"}
          </span>
          {activePlanItem && (
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              • Finaliza el {activePlanItem.endDate}
            </span>
          )}
        </div>

        {upcomingPlanItem ? (
          <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-medium flex items-center gap-1.5">
            <span>⏳ Próximo Ciclo: <strong>{upcomingPlanItem.planName}</strong></span>
            <span className="font-mono text-slate-500 dark:text-slate-400">(Inicia el {upcomingPlanItem.startDate})</span>
          </div>
        ) : primaryARace ? (
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5 text-amber-500" />
            <span>🥇 Objetivo A: <strong>{primaryARace.name}</strong> ({primaryARace.date})</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
