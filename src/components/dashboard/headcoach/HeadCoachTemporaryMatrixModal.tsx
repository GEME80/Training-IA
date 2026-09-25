"use client";

import React, { useState } from "react";
import { X, Calendar, Footprints, Bike, Dumbbell, Moon, Waves, Sparkles, Check, RefreshCw } from "lucide-react";
import { WeeklyAvailabilityMap, CANONICAL_DAYS, getDayDisciplines, DisciplineType } from "@/lib/gemini/engine";

interface HeadCoachTemporaryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  initialAvailability: WeeklyAvailabilityMap;
  onApplyTemporaryMatrix: (tempAvailability: WeeklyAvailabilityMap) => void;
  isLoading?: boolean;
}

const DISCIPLINES: Array<{ id: DisciplineType; label: string; icon: React.ReactNode }> = [
  { id: "Descanso", label: "Descanso", icon: <Moon className="h-3.5 w-3.5" /> },
  { id: "Carrera", label: "Carrera", icon: <Footprints className="h-3.5 w-3.5" /> },
  { id: "Ciclismo", label: "Ciclismo", icon: <Bike className="h-3.5 w-3.5" /> },
  { id: "Fuerza", label: "Fuerza", icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { id: "Natacion", label: "Natación", icon: <Waves className="h-3.5 w-3.5" /> },
];

export const HeadCoachTemporaryMatrixModal: React.FC<HeadCoachTemporaryMatrixModalProps> = ({
  isOpen,
  onClose,
  weekNumber,
  initialAvailability,
  onApplyTemporaryMatrix,
  isLoading = false,
}) => {
  const [matrix, setMatrix] = useState<WeeklyAvailabilityMap>(() => {
    const copy: WeeklyAvailabilityMap = {};
    CANONICAL_DAYS.forEach((day) => {
      copy[day] = [...getDayDisciplines(initialAvailability, day)];
    });
    return copy;
  });

  if (!isOpen) return null;

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

  const handleSave = () => {
    onApplyTemporaryMatrix(matrix);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Matriz Temporal · Semana {weekNumber}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ajuste exclusivo para este microciclo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Banner Informativo SSOT */}
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center space-x-2">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Cambio temporal seguro:</strong> Solo adaptará el plan de la Semana {weekNumber}. Tu Matriz Maestra habitual del perfil se mantendrá inalterada.
          </span>
        </div>

        {/* Lista de Días */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {CANONICAL_DAYS.map((day) => {
            const currentSelected = matrix[day] ? (Array.isArray(matrix[day]) ? (matrix[day] as string[]) : [matrix[day] as string]) : ["Descanso"];
            return (
              <div
                key={day}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24">
                  {day}
                </span>
                <div className="flex flex-wrap gap-1">
                  {DISCIPLINES.map((d) => {
                    const isSelected = currentSelected.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleDiscipline(day, d.id)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? d.id === "Descanso"
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                              : d.id === "Carrera"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                              : d.id === "Ciclismo"
                              ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40"
                              : d.id === "Fuerza"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                              : "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40"
                            : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        {/* Acciones */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>Aplicar a Semana {weekNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
