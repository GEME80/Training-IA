"use client";

import React from "react";
import {
  Footprints, Bike, Dumbbell, Moon, Zap, CheckCircle2,
  RefreshCw, ChevronDown, Calendar
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { WorkoutChart } from "@/components/WorkoutChart";
import { HeadCoachWorkoutBlockChart } from "./HeadCoachWorkoutBlockChart";
import { HeadCoachExpandedAerobic, HeadCoachExpandedGym, gymShortDesc } from "./headcoachCardHelpers";

interface HeadCoachSingleDiffCardProps {
  plan: PlanItem[];
  modifiedSessions: PlanItem[];
  weekNumber: number;
  onApplyAndSync?: (plan: PlanItem[]) => Promise<void>;
  isApplying?: boolean;
  onToggleFullWeek: () => void;
}

export const HeadCoachSingleDiffCard: React.FC<HeadCoachSingleDiffCardProps> = ({
  plan,
  modifiedSessions,
  weekNumber,
  onApplyAndSync,
  isApplying = false,
  onToggleFullWeek,
}) => {
  const [expandedCardKey, setExpandedCardKey] = React.useState<string | null>(null);
  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const dayNames = modifiedSessions.map((s) => s.day).join(" y ");

  const getDisciplineIcon = (disc: string) => {
    if (disc === "Carrera") return <Footprints className="h-4 w-4 text-emerald-500" />;
    if (disc === "Ciclismo") return <Bike className="h-4 w-4 text-sky-500" />;
    if (disc === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500" />;
    return <Moon className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="my-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-white via-emerald-50/15 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-md p-3.5 sm:p-5 space-y-3.5 animate-fadeIn">
      {/* Cabecera: Cambio de Ejercicio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Cambio de Ejercicio: {dayNames}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                Misma Carga
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Propuesta adaptada manteniendo intactos tus vatios y TSS de la semana {weekNumber}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{totalTss} TSS</span>
          <span>semanales intactos</span>
        </div>
      </div>

      {/* Tarjetas de las sesiones modificadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modifiedSessions.map((item, idx) => {
          const isGym = item.discipline === "Fuerza";
          const isRest = item.discipline === "Descanso" || (item.durationMinutes === 0 && item.tss === 0);
          const isExpanded = expandedCardKey === `${item.day}-${idx}`;

          return (
            <div
              key={`${item.day}-${idx}`}
              onClick={() => setExpandedCardKey(isExpanded ? null : `${item.day}-${idx}`)}
              className="rounded-xl border border-emerald-400/50 dark:border-emerald-500/40 bg-white dark:bg-slate-800/95 p-3 shadow-xs space-y-2 cursor-pointer hover:border-emerald-500 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getDisciplineIcon(item.discipline)}
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.day} {item.formattedDate ? `(${item.formattedDate})` : ""}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Adaptado
                </span>
              </div>

              <div>
                <p className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                  {item.workoutName || item.title || "Entrenamiento"}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{isRest ? "0 min" : `${item.durationMinutes || 0} min`}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">⚡ {item.tss || 0} TSS</span>
                  {item.powerTarget && <span className="truncate max-w-[120px]">{item.powerTarget}</span>}
                </div>
              </div>

              {/* Gráfica de Bloques */}
              {!isRest && !isGym && (
                item.workoutDoc ? (
                  <div className="w-full overflow-hidden rounded-lg">
                    <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                  </div>
                ) : (
                  <HeadCoachWorkoutBlockChart
                    discipline={item.discipline}
                    durationMinutes={item.durationMinutes || 0}
                    tss={item.tss || 0}
                    intensity={item.powerTarget || item.focus}
                    workoutStructure={item.workoutStructure}
                  />
                )
              )}

              {isExpanded && !isGym && <HeadCoachExpandedAerobic item={item} />}
              {isExpanded && isGym && <HeadCoachExpandedGym item={item} />}
            </div>
          );
        })}
      </div>

      {/* Barra de Confirmación y Enlace a Semana Completa */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onToggleFullWeek}
          className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Ver microciclo completo (7 días)</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {onApplyAndSync && (
          <button
            type="button"
            onClick={() => onApplyAndSync(plan)}
            disabled={isApplying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sincronizando con Intervals.icu...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar y Sincronizar Sesión</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
