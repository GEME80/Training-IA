"use client";

import React from "react";
import { Zap, Footprints, Bike, Dumbbell, Waves, Mountain, HeartPulse, Layers, Check, ExternalLink } from "lucide-react";
import { WeeklyAvailabilityMap, DisciplineType } from "@/lib/gemini/engine";
import { CompactAvailabilityMatrix } from "@/components/profile/CompactAvailabilityMatrix";

interface SeasonWizardStep2DisciplinesProps {
  trainingApproach: string;
  onChangeTrainingApproach: (appr: string) => void;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onChangeWeeklyAvailability?: (newMap: WeeklyAvailabilityMap) => void;
  onNavigateToProfile?: () => void;
}

export const SeasonWizardStep2Disciplines: React.FC<SeasonWizardStep2DisciplinesProps> = ({
  trainingApproach,
  onChangeTrainingApproach,
  weeklyAvailability,
  onChangeWeeklyAvailability,
  onNavigateToProfile,
}) => {
  const approaches = [
    {
      id: "Entrenamiento Cruzado",
      title: "Entrenamiento Cruzado (Recomendado)",
      subtitle: "Combina carrera con sesiones de ciclismo suave y fuerza para sumar volumen aeróbico protegiendo las articulaciones.",
      icon: Zap,
      badge: "⭐ Menos Impacto",
    },
    {
      id: "Solo Running",
      title: "Solo Running (Puro Asfalto)",
      subtitle: "Preparación enfocada 100% en correr, con rodajes suaves, series de ritmo y tiradas largas.",
      icon: Footprints,
      badge: "Específico Maratón",
    },
    {
      id: "Triatlón",
      title: "Triatlón / Multideporte",
      subtitle: "Entrenamientos distribuidos armónicamente entre natación, ciclismo y carrera a pie.",
      icon: Waves,
      badge: "70.3 / Olímpico",
    },
    {
      id: "Trail Running",
      title: "Trail Running & Montaña",
      subtitle: "Énfasis en volumen por tiempo, potencia en subida y resistencia muscular en desniveles.",
      icon: Mountain,
      badge: "Montaña",
    },
    {
      id: "Mantenimiento",
      title: "Mantenimiento & Salud General",
      subtitle: "Carga estable, estimulación cardiovascular y recuperación activa equilibrada.",
      icon: HeartPulse,
      badge: "Equilibrio",
    },
  ];

  const daysList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const disciplineOptions: { id: DisciplineType; label: string; icon: string }[] = [
    { id: "Carrera", label: "Carrera", icon: "🏃" },
    { id: "Ciclismo", label: "Bici", icon: "🚴" },
    { id: "Fuerza", label: "Fuerza", icon: "🏋️" },
    { id: "Natacion", label: "Nado", icon: "🌊" },
    { id: "Descanso", label: "Descanso", icon: "🌙" },
  ];

  const toggleDayDiscipline = (day: string, discId: DisciplineType) => {
    if (!onChangeWeeklyAvailability) return;
    const currentMap: WeeklyAvailabilityMap = weeklyAvailability
      ? { ...weeklyAvailability }
      : {
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Carrera", "Fuerza"],
          Jueves: ["Carrera", "Fuerza"],
          Viernes: ["Carrera", "Fuerza"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        };

    const currentDayVal = currentMap[day as keyof WeeklyAvailabilityMap];
    let currentList: DisciplineType[] = Array.isArray(currentDayVal)
      ? [...(currentDayVal as DisciplineType[])]
      : [((currentDayVal as DisciplineType) || "Descanso")];

    if (discId === "Descanso") {
      (currentMap as Record<string, any>)[day] = ["Descanso"];
    } else {
      currentList = currentList.filter((d) => d !== "Descanso");
      if (currentList.includes(discId)) {
        currentList = currentList.filter((d) => d !== discId);
        if (currentList.length === 0) currentList = ["Descanso"];
      } else {
        currentList.push(discId);
      }
      (currentMap as Record<string, any>)[day] = currentList;
    }

    onChangeWeeklyAvailability(currentMap);
  };

  const handleSelectApproach = (apprId: string) => {
    onChangeTrainingApproach(apprId);
    if (onChangeWeeklyAvailability) {
      if (apprId === "Triatlón") {
        onChangeWeeklyAvailability({
          Lunes: ["Descanso"],
          Martes: ["Natacion", "Carrera"],
          Miércoles: ["Ciclismo"],
          Jueves: ["Natacion", "Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        });
      } else if (apprId === "Solo Running") {
        onChangeWeeklyAvailability({
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Carrera"],
          Jueves: ["Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Descanso"],
          Domingo: ["Carrera"],
        });
      } else if (apprId === "Trail Running") {
        onChangeWeeklyAvailability({
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Fuerza"],
          Jueves: ["Carrera"],
          Viernes: ["Descanso"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        });
      } else if (apprId === "Entrenamiento Cruzado") {
        onChangeWeeklyAvailability({
          Lunes: ["Descanso"],
          Martes: ["Carrera"],
          Miércoles: ["Ciclismo"],
          Jueves: ["Fuerza"],
          Viernes: ["Carrera"],
          Sábado: ["Ciclismo"],
          Domingo: ["Carrera"],
        });
      }
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. SELECTOR DE ENFOQUE DEPORTIVO (TEXTOS CLAROS Y DIRECTOS) */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
          Selecciona tu Enfoque de Entrenamiento
        </label>

        <div className="space-y-2">
          {approaches.map((appr) => {
            const Icon = appr.icon;
            const isSelected = trainingApproach === appr.id;
            return (
              <div
                key={appr.id}
                onClick={() => handleSelectApproach(appr.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {appr.title}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {appr.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {appr.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 mt-1 ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-transparent"
                }`}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MATRIZ SEMANAL DE DISPONIBILIDAD INTERACTIVA DIRECTA */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Layers className="h-3.5 w-3.5 text-emerald-500" />
            Matriz Semanal de Disponibilidad (Personaliza tus Días)
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            ⚡ Clic en chips para activar dobles sesiones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {daysList.map((day) => {
            const rawVal = weeklyAvailability?.[day as keyof WeeklyAvailabilityMap] || (day === "Lunes" ? ["Descanso"] : day === "Sábado" || day === "Martes" ? ["Ciclismo"] : ["Carrera"]);
            const dayDiscs: DisciplineType[] = Array.isArray(rawVal) ? (rawVal as DisciplineType[]) : [(rawVal as DisciplineType || "Descanso")];
            const isRest = dayDiscs.includes("Descanso");

            return (
              <div
                key={day}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono">
                    {day.slice(0, 3)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                    {isRest ? "🌙 Off" : `${dayDiscs.length} act`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {disciplineOptions.map((opt) => {
                    const isActive = dayDiscs.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleDayDiscipline(day, opt.id)}
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title={`Marcar ${opt.label} para ${day}`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
