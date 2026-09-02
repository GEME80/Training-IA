"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Moon, Check } from "lucide-react";
import {
  WeeklyAvailabilityMap,
  DisciplineType,
  normalizeDisciplines,
} from "@/lib/gemini/engine";

interface CompactAvailabilityMatrixProps {
  weeklyAvailability?: WeeklyAvailabilityMap;
  className?: string;
}

const DAYS = [
  { key: "Lunes", altKey: "Lunes", short: "Lun" },
  { key: "Martes", altKey: "Martes", short: "Mar" },
  { key: "Miercoles", altKey: "Miércoles", short: "Mié" },
  { key: "Jueves", altKey: "Jueves", short: "Jue" },
  { key: "Viernes", altKey: "Viernes", short: "Vie" },
  { key: "Sabado", altKey: "Sábado", short: "Sáb" },
  { key: "Domingo", altKey: "Domingo", short: "Dom" },
];

const DISCIPLINE_ITEMS: {
  type: DisciplineType;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  selectedClass: string;
}[] = [
  {
    type: "Carrera",
    label: "Carrera",
    icon: Footprints,
    colorClass: "text-amber-500",
    selectedClass: "border-amber-400/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold",
  },
  {
    type: "Ciclismo",
    label: "Ciclismo",
    icon: Bike,
    colorClass: "text-sky-500",
    selectedClass: "border-sky-400/60 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold",
  },
  {
    type: "Fuerza",
    label: "Fuerza",
    icon: Dumbbell,
    colorClass: "text-purple-500",
    selectedClass: "border-purple-400/60 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold",
  },
  {
    type: "Natacion",
    label: "Natación",
    icon: Waves,
    colorClass: "text-cyan-500",
    selectedClass: "border-cyan-400/60 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 font-bold",
  },
  {
    type: "Descanso",
    label: "Descanso",
    icon: Moon,
    colorClass: "text-indigo-500",
    selectedClass: "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold",
  },
];

export const CompactAvailabilityMatrix: React.FC<CompactAvailabilityMatrixProps> = ({
  weeklyAvailability = {},
  className = "",
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="grid grid-cols-7 gap-1.5 min-w-[520px] sm:min-w-0">
        {DAYS.map((day) => {
          const rawVal = weeklyAvailability[day.key] || weeklyAvailability[day.altKey];
          const dayDisciplines = normalizeDisciplines(rawVal);
          const isRest = dayDisciplines.includes("Descanso");

          return (
            <div
              key={day.key}
              className={`p-2 rounded-xl border flex flex-col justify-between space-y-1.5 transition ${
                isRest
                  ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/70"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
              }`}
            >
              {/* Cabecera del día */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                <span className="font-black text-[11px] text-slate-900 dark:text-white">
                  {day.short}
                </span>
                {isRest ? (
                  <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Descanso
                  </span>
                ) : (
                  <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {dayDisciplines.length} act.
                  </span>
                )}
              </div>

              {/* Lista visual de disciplinas en tamaño compacto */}
              <div className="grid grid-cols-1 gap-0.5">
                {DISCIPLINE_ITEMS.map((item) => {
                  const isSelected = dayDisciplines.includes(item.type);
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.type}
                      className={`px-1.5 py-0.5 rounded-lg text-[9px] flex items-center justify-between border transition-all ${
                        isSelected
                          ? item.selectedClass
                          : "border-transparent text-slate-400 dark:text-slate-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <Icon className={`h-2.5 w-2.5 ${isSelected ? item.colorClass : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[2.5]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
