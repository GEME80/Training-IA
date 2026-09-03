"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Moon, Check, X, Activity, Zap } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedActivity } from "@/lib/intervals/types";
import { parseWorkoutDoc } from "../WorkoutChart";

interface AthleteMobileWorkoutCardProps {
  workout: PlanItem;
  matchedAct: DailyExecutedActivity | null;
  isRest: boolean;
  isCompleted: boolean;
  isOmitted: boolean;
  isTodaySelected: boolean;
  selectedDate: string;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

const getDisciplineIcon = (disc: string) => {
  if (disc === "Carrera") return <Footprints className="h-4 w-4 text-amber-500" />;
  if (disc === "Ciclismo") return <Bike className="h-4 w-4 text-cyan-500" />;
  if (disc === "Natacion") return <Waves className="h-4 w-4 text-sky-500" />;
  if (disc === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500" />;
  return <Moon className="h-4 w-4 text-slate-400" />;
};

export const AthleteMobileWorkoutCard: React.FC<AthleteMobileWorkoutCardProps> = ({
  workout,
  matchedAct,
  isRest,
  isCompleted,
  isOmitted,
  isTodaySelected,
  selectedDate,
  onSelectWorkoutModal,
}) => {
  const parsedDoc = parseWorkoutDoc(workout.workoutDoc);

  return (
    <div
      onClick={() => onSelectWorkoutModal(workout)}
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs touch-bounce space-y-3 ${
        isCompleted
          ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/30"
          : isOmitted
          ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/20"
          : isTodaySelected
          ? "border-cyan-300 dark:border-cyan-700/60 ring-2 ring-cyan-500/20"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
      }`}
    >
      {/* Cabecera de la Sesión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            {getDisciplineIcon(workout.discipline)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {workout.day} • {selectedDate}
              </span>
              {isTodaySelected && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                  Hoy
                </span>
              )}
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
            </h4>
          </div>
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/20">
            <Check className="h-3 w-3" />
            Completado
          </span>
        ) : isOmitted ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
            <X className="h-3 w-3 text-rose-500" />
            Omitida
          </span>
        ) : isRest ? (
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Descanso
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 text-[10px] font-bold">
            Planificado
          </span>
        )}
      </div>

      {/* Métricas Clave de la Sesión */}
      {!isRest && (
        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center font-mono">
          <div>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Tiempo</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-cyan-500" />
              {workout.durationMinutes}m
            </strong>
          </div>

          <div>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Carga TSS</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              {isCompleted && matchedAct?.tss ? `${matchedAct.tss} / ` : ""}
              {workout.tss || parsedDoc.estimatedTss || 0}
            </strong>
          </div>

          <div>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Enfoque</span>
            <strong className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">
              {workout.discipline}
            </strong>
          </div>
        </div>
      )}

      {/* Resumen de Estructura / Stryd */}
      {workout.workoutDoc && (
        <div className="text-[11px] font-mono bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-xl text-slate-600 dark:text-slate-300 space-y-0.5">
          <span className="text-[9px] font-black uppercase text-slate-400 block font-sans">Estructura:</span>
          {workout.workoutDoc
            .split("\n")
            .filter((l) => l.trim().startsWith("-"))
            .slice(0, 3)
            .map((line, bIdx) => (
              <div key={bIdx} className="truncate">
                {line.trim()}
              </div>
            ))}
        </div>
      )}

      {/* Botón Táctil de 1 Toque */}
      <div className="pt-0.5 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-medium">Toca para ver intervalos y potencia</span>
        <span className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
          Ver Detalle →
        </span>
      </div>
    </div>
  );
};
