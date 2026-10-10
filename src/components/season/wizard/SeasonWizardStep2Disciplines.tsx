"use client";

import React from "react";
import { Zap, Footprints, Bike, Dumbbell, Waves, Mountain, HeartPulse, Layers, Check, ExternalLink, Moon } from "lucide-react";
import { WeeklyAvailabilityMap, DisciplineType, DEFAULT_WEEKLY_AVAILABILITY, getDayDisciplines } from "@/lib/gemini/engine";
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
      title: "Entrenamiento Cruzado",
      subtitle: "Combina tu deporte principal con ciclismo o fuerza para ganar volumen aeróbico protegiendo las articulaciones.",
      icon: Zap,
      accent: "text-emerald-600 dark:text-emerald-400",
      recommended: true,
    },
    {
      id: "Solo Running",
      title: "Carrera a Pie",
      subtitle: "Preparación enfocada en correr: rodajes suaves, series de ritmo y tiradas largas. Válido para 5K, 10K, media, maratón y trail.",
      icon: Footprints,
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "Triatlón",
      title: "Triatlón / Multideporte",
      subtitle: "Entrenamientos distribuidos entre natación, ciclismo y carrera. Apto para distancias Sprint, Olímpico, 70.3 e Ironman.",
      icon: Waves,
      accent: "text-sky-600 dark:text-sky-400",
    },
    {
      id: "Trail Running",
      title: "Trail Running & Montaña",
      subtitle: "Énfasis en volumen por tiempo, potencia en subida y resistencia muscular en terreno técnico y desniveles.",
      icon: Mountain,
      accent: "text-stone-600 dark:text-stone-400",
    },
    {
      id: "Mantenimiento",
      title: "Mantenimiento & Salud General",
      subtitle: "Carga estable y equilibrada para mantener la condición física, la salud cardiovascular y la recuperación activa.",
      icon: HeartPulse,
      accent: "text-rose-600 dark:text-rose-400",
    },
  ];


  const daysList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const disciplineOptions: { id: DisciplineType; label: string; icon: React.ElementType; colorActive: string }[] = [
    { id: "Carrera", label: "Carrera", icon: Footprints, colorActive: "bg-amber-500 text-white" },
    { id: "Ciclismo", label: "Bici", icon: Bike, colorActive: "bg-sky-500 text-white" },
    { id: "Fuerza", label: "Fuerza", icon: Dumbbell, colorActive: "bg-purple-500 text-white" },
    { id: "Natacion", label: "Nado", icon: Waves, colorActive: "bg-cyan-500 text-white" },
    { id: "Descanso", label: "Descanso", icon: Moon, colorActive: "bg-slate-500 text-white" },
  ];

  const toggleDayDiscipline = (day: string, discId: DisciplineType) => {
    if (!onChangeWeeklyAvailability) return;
    const currentMap: WeeklyAvailabilityMap = weeklyAvailability
      ? { ...weeklyAvailability }
      : { ...DEFAULT_WEEKLY_AVAILABILITY };

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
    // BLINDAJE DE MATRIZ: Si el atleta ya tiene una matriz personalizada con días configurados,
    // preservarla 100% para no destruir su programación semanal (evita cambiar días de carrera por fuerza).
    const hasCustomMatrix = weeklyAvailability && Object.keys(weeklyAvailability).length >= 3;
    if (onChangeWeeklyAvailability && !hasCustomMatrix) {
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
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <Icon className={`h-4 w-4 ${isSelected ? "text-white" : appr.accent}`} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{appr.title}</h4>
                      {"recommended" in appr && appr.recommended && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-[9px] font-mono font-black text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ⭐ Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{appr.subtitle}</p>
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
            const dayDiscs = getDayDisciplines(weeklyAvailability, day);
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
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleDayDiscipline(day, opt.id)}
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 ${
                          isActive
                            ? opt.colorActive
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title={`Marcar ${opt.label} para ${day}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
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
