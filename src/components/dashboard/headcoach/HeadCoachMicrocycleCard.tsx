"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  RefreshCw,
  Footprints,
  Bike,
  Dumbbell,
  Moon,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { HeadCoachWorkoutBlockChart } from "./HeadCoachWorkoutBlockChart";

interface HeadCoachMicrocycleCardProps {
  plan: PlanItem[];
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
}

export const HeadCoachMicrocycleCard: React.FC<HeadCoachMicrocycleCardProps> = ({
  plan,
  weekNumber,
  onApplyAndSync,
  isApplying = false,
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showStructures, setShowStructures] = useState(false);

  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const totalMinutes = plan.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;

  const getDisciplineIcon = (disc: string) => {
    switch (disc) {
      case "Carrera":
        return <Footprints className="h-3.5 w-3.5 text-emerald-500" />;
      case "Ciclismo":
        return <Bike className="h-3.5 w-3.5 text-sky-500" />;
      case "Fuerza":
        return <Dumbbell className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Moon className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getActionBadge = (item: PlanItem) => {
    if (item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0)) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Descanso
        </span>
      );
    }
    if (item.action === "MODIFICAR" || item.action === "REDUCIR_INTENSIDAD") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          Modificado
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
        En Plan
      </span>
    );
  };

  return (
    <div className="my-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-white via-emerald-50/15 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-md p-3.5 sm:p-5 space-y-4">
      {/* Cabecera de la Tarjeta del Microciclo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Propuesta de Microciclo: Semana {weekNumber}</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                Adaptación Activa
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              7 días estructurados con vatios a % FTP/CP listos para el calendario.
            </p>
          </div>
        </div>

        {/* Resumen Métrico de la Semana */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            ⚡ {totalTss} TSS
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            ⏱️ {timeFormatted}
          </span>
        </div>
      </div>

      {/* Grid de los 7 Días del Microciclo */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {plan.map((item, idx) => {
          const isExpanded = expandedDay === idx;
          const isRest = item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0);

          return (
            <div
              key={idx}
              onClick={() => setExpandedDay(isExpanded ? null : idx)}
              className={`rounded-xl p-2.5 transition-all cursor-pointer border ${
                isRest
                  ? "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/80 opacity-80"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-emerald-500/40"
              } space-y-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {getDisciplineIcon(item.discipline)}
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                    {item.day?.slice(0, 3) || "Día"}
                  </span>
                </div>
                {getActionBadge(item)}
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                  {item.workoutName || item.title || "Entrenamiento"}
                </p>
                {item.formattedDate && (
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                    {item.formattedDate}
                  </p>
                )}
              </div>

              {/* Gráfica de Bloques de Potencia */}
              <HeadCoachWorkoutBlockChart
                discipline={item.discipline}
                durationMinutes={item.durationMinutes || 0}
                tss={item.tss || 0}
                intensity={item.powerTarget || item.focus}
                workoutStructure={item.workoutStructure}
              />

              {isExpanded && item.justification && (
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/80 text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                  <p className="italic">💡 {item.justification}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón de Aprobación y Sincronización en 1 Clic */}
      {onApplyAndSync && (
        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Pulsa para sobrescribir los días de esta semana en Intervals.icu con fechas exactas.
          </span>
          <button
            type="button"
            disabled={isApplying}
            onClick={() => onApplyAndSync(plan)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>{isApplying ? "Sincronizando a Intervals..." : "✅ Aplicar Microciclo y Sincronizar a Intervals"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
