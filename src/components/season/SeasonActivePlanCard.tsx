"use client";

import React, { useMemo, useState } from "react";
import { Layers, Calendar, Sparkles, CheckCircle2, Clock, Trash2, Trophy } from "lucide-react";
import { SeasonPlanItem, TargetRace } from "@/lib/physiology/macrocycle";
import { SeasonCurveChart } from "./wizard/SeasonCurveChart";

interface SeasonActivePlanCardProps {
  activePlan: SeasonPlanItem | null;
  primaryRace?: TargetRace | null;
  seasonPlansCount: number;
  onNavigateToDashboard?: () => void;
  onOpenHeadCoach?: () => void;
  onOpenDesigner?: () => void;
  onDeletePlan?: () => void;
}

export const SeasonActivePlanCard: React.FC<SeasonActivePlanCardProps> = ({
  activePlan,
  primaryRace,
  seasonPlansCount,
  onNavigateToDashboard,
  onOpenHeadCoach,
  onOpenDesigner,
  onDeletePlan,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const blueprintWeeks = activePlan?.blueprint?.weeks || [];
  const totalWeeks = activePlan?.totalWeeks || blueprintWeeks.length || 16;
  const rawTitle = activePlan?.planName || activePlan?.blueprint?.cycleTitle || "";
  const isGeneric = !rawTitle || rawTitle === "Macrociclo de Temporada" || rawTitle === "Plan de Temporada";
  const planTitle = isGeneric && primaryRace
    ? `Macrociclo para ${primaryRace.name} (${primaryRace.distance?.toUpperCase() || "42K"})`
    : rawTitle || "Plan de Temporada";

  const avgWeeklyTss = blueprintWeeks.length > 0
    ? Math.round(blueprintWeeks.reduce((acc, w) => acc + (w.targetTss || 300), 0) / blueprintWeeks.length)
    : 320;
  const avgHoursStr = (avgWeeklyTss / 60).toFixed(1);

  const dynamicPhases = useMemo(() => {
    if (!activePlan || blueprintWeeks.length === 0) {
      const b1 = Math.max(1, Math.round(totalWeeks * 0.35));
      const b2 = Math.max(b1 + 1, Math.round(totalWeeks * 0.6));
      const pk = Math.max(b2 + 1, Math.round(totalWeeks * 0.85));
      return [
        { label: "Base", weeks: `1-${b1}`, active: true },
        { label: "Construcción", weeks: `${b1 + 1}-${b2}`, active: false },
        { label: "Pico", weeks: `${b2 + 1}-${pk}`, active: false },
        { label: "Taper", weeks: `${pk + 1}-${totalWeeks}`, active: false },
      ];
    }

    const groups: { phase: string; label: string; start: number; end: number }[] = [];
    blueprintWeeks.forEach((w) => {
      const last = groups[groups.length - 1];
      const pLabel = w.phaseLabel || w.phase;
      if (!last || last.phase !== w.phase) {
        groups.push({ phase: w.phase, label: pLabel, start: w.weekNumber, end: w.weekNumber });
      } else {
        last.end = w.weekNumber;
      }
    });

    return groups.map((g, idx) => ({
      label: g.label,
      weeks: g.start === g.end ? `${g.start}` : `${g.start}-${g.end}`,
      active: idx === 0,
    }));
  }, [activePlan, blueprintWeeks, totalWeeks]);

  if (!activePlan) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] font-bold">
            Sin Plan Activo
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Planifica tu Próxima Temporada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Diseña un macrociclo estructurado con el Diseñador IA o selecciona un programa de la biblioteca.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDesigner || onOpenHeadCoach}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Diseñar Macrociclo con IA</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
      {/* Header del Plan */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-black border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            EN EJECUCIÓN
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
            Semana 1 de {totalWeeks}
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {planTitle}
            </h3>
            {primaryRace && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-black border border-amber-400/30">
                <Trophy className="h-3 w-3 text-amber-500" />
                {primaryRace.name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
              {activePlan.startDate} → {activePlan.endDate}
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              ~{avgHoursStr}h / semana
            </span>
          </div>
        </div>
      </div>

      {/* Gráfica de Curva de Temporada Real */}
      {blueprintWeeks.length > 0 ? (
        <SeasonCurveChart weeks={blueprintWeeks} />
      ) : (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Periodización & Fases ({totalWeeks} Semanas):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {dynamicPhases.map((ph, i) => (
              <div
                key={i}
                className={`rounded-xl p-2 text-center transition-all ${
                  ph.active
                    ? "bg-emerald-500 text-white font-black shadow-xs"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-medium border border-slate-100 dark:border-slate-800"
                }`}
              >
                <span className="block text-[11px] truncate leading-tight font-bold">
                  {ph.label}
                </span>
                <span className={`block text-[9px] font-mono ${ph.active ? "text-emerald-100" : "text-slate-400"}`}>
                  Sem {ph.weeks}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onNavigateToDashboard && (
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Ver Calendario</span>
          </button>
        )}

        {(onOpenDesigner || onOpenHeadCoach) && (
          <button
            type="button"
            onClick={onOpenDesigner || onOpenHeadCoach}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Reajustar Plan</span>
          </button>
        )}

        {onDeletePlan && (
          !isConfirmingDelete ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center space-x-1 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer shadow-xs"
              title="Eliminar este macrociclo de tu temporada"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  onDeletePlan();
                }}
                className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs font-mono transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                ¿Confirmar Borrado?
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
