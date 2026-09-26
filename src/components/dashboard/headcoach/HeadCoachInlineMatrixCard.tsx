"use client";

import React, { useState } from "react";
import { Sparkles, Footprints, Bike, Dumbbell, Moon, Waves, Check, RotateCcw } from "lucide-react";
import { WeeklyAvailabilityMap, CANONICAL_DAYS, getDayDisciplines, DisciplineType } from "@/lib/gemini/engine";

interface HeadCoachInlineMatrixCardProps {
  weekNumber: number;
  initialAvailability: WeeklyAvailabilityMap;
  onApplyMatrix: (tempAvailability: WeeklyAvailabilityMap) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const DISCIPLINES: Array<{ id: DisciplineType; label: string; icon: React.ReactNode }> = [
  { id: "Descanso", label: "Descanso", icon: <Moon className="h-3 w-3" /> },
  { id: "Carrera", label: "Carrera", icon: <Footprints className="h-3 w-3" /> },
  { id: "Ciclismo", label: "Ciclismo", icon: <Bike className="h-3 w-3" /> },
  { id: "Fuerza", label: "Fuerza", icon: <Dumbbell className="h-3 w-3" /> },
  { id: "Natacion", label: "Natación", icon: <Waves className="h-3 w-3" /> },
];

export const HeadCoachInlineMatrixCard: React.FC<HeadCoachInlineMatrixCardProps> = ({
  weekNumber,
  initialAvailability,
  onApplyMatrix,
  onCancel,
  isLoading = false,
}) => {
  const [matrix, setMatrix] = useState<WeeklyAvailabilityMap>(() => {
    const copy: WeeklyAvailabilityMap = {};
    CANONICAL_DAYS.forEach((day) => {
      copy[day] = [...getDayDisciplines(initialAvailability, day)];
    });
    return copy;
  });

  const handleToggleDiscipline = (day: string, discipline: DisciplineType) => {
    setMatrix((prev) => {
      const current = getDayDisciplines(prev, day);

      if (discipline === "Descanso") {
        return { ...prev, [day]: ["Descanso"] };
      }

      let updated: DisciplineType[] = current.filter((d) => d !== "Descanso");
      if (updated.includes(discipline)) {
        updated = updated.filter((d) => d !== discipline);
        if (updated.length === 0) updated = ["Descanso"];
      } else {
        if (updated.length >= 2) updated.shift();
        updated.push(discipline);
      }
      return { ...prev, [day]: updated };
    });
  };

  return (
    <div className="mt-3.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 sm:p-4 shadow-xs animate-fadeIn">
      {/* Cabecera & Banner Informativo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Matriz Temporal · Semana {weekNumber}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona tus deportes o descansos para cada día. Tu matriz maestra de perfil no cambiará.
          </p>
        </div>
      </div>

      {/* Lista de Días en Filas Horizontales Amplias (Sin saltos de línea ni recortes) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 my-2">
        {CANONICAL_DAYS.map((day) => {
          const currentSelected = matrix[day] ? (Array.isArray(matrix[day]) ? (matrix[day] as string[]) : [matrix[day] as string]) : ["Descanso"];
          return (
            <div
              key={day}
              className="py-2.5 px-2 sm:px-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-900/50 transition-colors flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 w-24 shrink-0">
                {day}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap py-0.5 justify-end">
                {DISCIPLINES.map((d) => {
                  const isSelected = currentSelected.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleDiscipline(day, d.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? d.id === "Descanso"
                            ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-400 dark:border-slate-600 shadow-xs"
                            : d.id === "Carrera"
                            ? "bg-emerald-500 text-slate-950 font-bold border border-emerald-400 shadow-xs"
                            : d.id === "Ciclismo"
                            ? "bg-sky-500 text-slate-950 font-bold border border-sky-400 shadow-xs"
                            : d.id === "Fuerza"
                            ? "bg-amber-400 text-slate-950 font-bold border border-amber-300 shadow-xs"
                            : "bg-cyan-400 text-slate-950 font-bold border border-cyan-300 shadow-xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {d.icon}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acciones Inline (Botón Verde Atlético de Alto Impacto) */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={() => onApplyMatrix(matrix)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <RotateCcw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-slate-950" />
          )}
          <span>Generar propuesta según esta matriz</span>
        </button>
      </div>
    </div>
  );
};
