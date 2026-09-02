"use client";

import React from "react";
import { Calendar, Footprints, Bike, Dumbbell, Waves, Moon, Check } from "lucide-react";
import {
  WeeklyAvailabilityMap,
  DisciplineType,
  normalizeDisciplines,
} from "@/lib/gemini/engine";

interface ProfileAvailabilityTabProps {
  weeklyAvailability: WeeklyAvailabilityMap;
  onToggleDayDiscipline: (dayKey: string, disc: DisciplineType) => void;
}

const DISCIPLINE_CONFIG: {
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
    selectedClass: "border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold",
  },
  {
    type: "Ciclismo",
    label: "Ciclismo",
    icon: Bike,
    colorClass: "text-sky-500",
    selectedClass: "border-sky-500/40 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold",
  },
  {
    type: "Fuerza",
    label: "Fuerza",
    icon: Dumbbell,
    colorClass: "text-purple-500",
    selectedClass: "border-purple-500/40 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold",
  },
  {
    type: "Natacion",
    label: "Natación",
    icon: Waves,
    colorClass: "text-cyan-500",
    selectedClass: "border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold",
  },
  {
    type: "Descanso",
    label: "Descanso",
    icon: Moon,
    colorClass: "text-indigo-500",
    selectedClass: "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold",
  },
];

export const ProfileAvailabilityTab: React.FC<ProfileAvailabilityTabProps> = ({
  weeklyAvailability,
  onToggleDayDiscipline,
}) => {
  const days = [
    { key: "Lunes", label: "Lunes", short: "Lun" },
    { key: "Martes", label: "Martes", short: "Mar" },
    { key: "Miercoles", label: "Miércoles", short: "Mié" },
    { key: "Jueves", label: "Jueves", short: "Jue" },
    { key: "Viernes", label: "Viernes", short: "Vie" },
    { key: "Sabado", label: "Sábado", short: "Sáb" },
    { key: "Domingo", label: "Domingo", short: "Dom" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-sky-500" />
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Matriz Semanal de Disponibilidad Deportiva
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-bold">Semana Tipo</span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Configura qué disciplinas tienes disponibles cada día. La IA distribuirá las cargas, descansos y tiradas largas respetando esta matriz.
      </p>

      {/* Grid de los 7 Días */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 pt-1">
        {days.map((day) => {
          const dayDisciplines = normalizeDisciplines(weeklyAvailability[day.key]);
          const isRest = dayDisciplines.includes("Descanso");

          return (
            <div
              key={day.key}
              className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition ${
                isRest
                  ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span className="font-black text-xs text-slate-900 dark:text-white">
                  {day.short}
                </span>
                {isRest ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Descanso
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600">
                    {dayDisciplines.length} act.
                  </span>
                )}
              </div>

              {/* Botones de Selección con Iconos Vectoriales Lucide */}
              <div className="grid grid-cols-1 gap-1">
                {DISCIPLINE_CONFIG.map((conf) => {
                  const isSelected = dayDisciplines.includes(conf.type);
                  const Icon = conf.icon;

                  return (
                    <button
                      key={conf.type}
                      type="button"
                      onClick={() => onToggleDayDiscipline(day.key, conf.type)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] transition flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? conf.selectedClass
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Icon className={`h-3 w-3 ${conf.colorClass}`} />
                        <span>{conf.label}</span>
                      </div>
                      {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                    </button>
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
