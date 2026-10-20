"use client";

import React, { useState } from "react";
import {
  Footprints, Bike, Dumbbell, Moon, ArrowLeftRight, CheckCircle2,
  RefreshCw, ChevronDown, Calendar, ChevronRight
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { WorkoutChart } from "@/components/WorkoutChart";
import { HeadCoachWorkoutBlockChart } from "./HeadCoachWorkoutBlockChart";
import { HeadCoachExpandedAerobic, HeadCoachExpandedGym } from "./headcoachCardHelpers";
import { formatDuration } from "@/lib/utils/formatters";

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
  const [showStructure, setShowStructure] = useState(false);
  const totalTss = plan.reduce((acc, p) => acc + (p.tss || 0), 0);
  const dayNames = modifiedSessions.map((s) => s.day).join(" y ");
  const isSingle = modifiedSessions.length === 1;
  const item = modifiedSessions[0] || ({} as PlanItem);

  const getDisciplineIcon = (disc?: string) => {
    if (disc === "Carrera") return <Footprints className="h-4 w-4 text-emerald-500" />;
    if (disc === "Ciclismo") return <Bike className="h-4 w-4 text-sky-500" />;
    if (disc === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500" />;
    return <Moon className="h-4 w-4 text-slate-400" />;
  };

  const isGym = item.discipline === "Fuerza";
  const isRest = item.discipline === "Descanso" || (item.durationMinutes === 0 && item.tss === 0);

  const prevDisc = item.previousDiscipline || (item.discipline === "Ciclismo" ? "Carrera" : "Ciclismo");
  const prevTitle = item.previousWorkoutName || (prevDisc === "Carrera" ? "Carrera Programada" : "Ciclismo Programado");
  const prevMins = item.previousDurationMinutes || item.durationMinutes || 50;
  const prevTss = item.previousTss || item.tss || 45;
  const prevTarget = item.previousPowerTarget;

  return (
    <div className="my-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-white via-emerald-50/15 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-md p-3.5 sm:p-5 space-y-3.5 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <span>Cambio de Ejercicio: {dayNames}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                Misma Carga
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sustitución de disciplina manteniendo intacta tu carga fisiológica ({item.tss || prevTss} TSS).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{totalTss} TSS</span>
          <span>semanales intactos</span>
        </div>
      </div>

      {isSingle ? (
        <>
          {/* Comparativa: Ejercicio Actual vs Ejercicio que se va a cambiar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Columna Izquierda: Ejercicio Actual */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Ejercicio actual programado</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {item.day} {item.formattedDate ? `(${item.formattedDate})` : ""}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {getDisciplineIcon(prevDisc)}
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{prevDisc}</span>
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                  {prevTitle}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>⏱️ {prevMins} min</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">⚡ {prevTss} TSS</span>
                {prevTarget && <span className="truncate max-w-[120px]">{prevTarget}</span>}
              </div>
            </div>

            {/* Columna Derecha: Ejercicio que se va a cambiar */}
            <div className="rounded-xl border border-emerald-400/60 dark:border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-3.5 space-y-2 flex flex-col justify-between ring-1 ring-emerald-500/20 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ejercicio que se va a cambiar</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Misma Carga
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {getDisciplineIcon(item.discipline)}
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">{item.discipline}</span>
                </div>
                <p className="font-black text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                  {item.workoutName || item.title || "Nueva Sesión"}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <span>⏱️ {isRest ? "0 min" : formatDuration(item.durationMinutes)}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">⚡ {item.tss || 0} TSS</span>
                {item.powerTarget && <span className="truncate max-w-[120px] font-semibold">{item.powerTarget}</span>}
              </div>
            </div>
          </div>

          {/* Gráfica de Bloques de Potencia de la Nueva Sesión */}
          {!isRest && !isGym && (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold px-1">
                <span>Estructura de la nueva sesión adaptada:</span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{formatDuration(item.durationMinutes)} • {item.tss} TSS</span>
              </div>
              {item.workoutDoc ? (
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
              )}
            </div>
          )}

          {isGym && <HeadCoachExpandedGym item={item} />}
        </>
      ) : (
        /* Caso 2 días (Invertir sesiones) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modifiedSessions.map((sess, idx) => (
            <div key={idx} className="rounded-xl border border-emerald-400/50 dark:border-emerald-500/40 bg-white dark:bg-slate-800/95 p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getDisciplineIcon(sess.discipline)}
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{sess.day}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Intercambiada</span>
              </div>
              <p className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">{sess.workoutName}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>{formatDuration(sess.durationMinutes)}</span>
                <span className="font-bold text-emerald-600">⚡ {sess.tss || 0} TSS</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
