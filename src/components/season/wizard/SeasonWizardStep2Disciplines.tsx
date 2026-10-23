"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Mountain, Layers, Check, Moon, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  WeeklyAvailabilityMap,
  DisciplineType,
  DEFAULT_WEEKLY_AVAILABILITY,
  getDayDisciplines,
  setLongSessionDay,
  validateLongSessionDays,
} from "@/lib/gemini/engine";

interface SeasonWizardStep2DisciplinesProps {
  trainingApproach: string;
  onChangeTrainingApproach: (appr: string) => void;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onChangeWeeklyAvailability?: (newMap: WeeklyAvailabilityMap) => void;
  onNavigateToProfile?: () => void;
}

type MainSportKey = "running" | "cycling" | "triathlon" | "trail";

const MATRIX_DEFAULTS: Record<string, WeeklyAvailabilityMap> = {
  "Solo Running": { Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Carrera"], Jueves: ["Fuerza"], Viernes: ["Carrera"], Sábado: ["Descanso"], Domingo: ["Carrera"], _longRunDay: "Domingo" },
  "Entrenamiento Cruzado": { Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Ciclismo"], Jueves: ["Fuerza"], Viernes: ["Carrera"], Sábado: ["Ciclismo"], Domingo: ["Carrera"], _longRideDay: "Sábado", _longRunDay: "Domingo" },
  "Solo Ciclismo": { Lunes: ["Descanso"], Martes: ["Ciclismo"], Miércoles: ["Ciclismo"], Jueves: ["Fuerza"], Viernes: ["Ciclismo"], Sábado: ["Descanso"], Domingo: ["Ciclismo"], _longRideDay: "Domingo" },
  "Ciclismo Cruzado": { Lunes: ["Descanso"], Martes: ["Ciclismo"], Miércoles: ["Carrera"], Jueves: ["Fuerza"], Viernes: ["Ciclismo"], Sábado: ["Ciclismo"], Domingo: ["Carrera"], _longRideDay: "Sábado", _longRunDay: "Domingo" },
  "Triatlón": { Lunes: ["Descanso"], Martes: ["Natacion", "Carrera"], Miércoles: ["Ciclismo"], Jueves: ["Natacion", "Fuerza"], Viernes: ["Carrera"], Sábado: ["Ciclismo"], Domingo: ["Carrera"], _longRideDay: "Sábado", _longRunDay: "Domingo" },
  "Trail Running": { Lunes: ["Descanso"], Martes: ["Carrera"], Miércoles: ["Fuerza"], Jueves: ["Carrera"], Viernes: ["Descanso"], Sábado: ["Ciclismo"], Domingo: ["Carrera"], _longRideDay: "Sábado", _longRunDay: "Domingo" },
};

export const SeasonWizardStep2Disciplines: React.FC<SeasonWizardStep2DisciplinesProps> = ({
  trainingApproach, onChangeTrainingApproach, weeklyAvailability, onChangeWeeklyAvailability,
}) => {
  const activeMainSport: MainSportKey = React.useMemo(() => {
    const a = (trainingApproach || "").toLowerCase();
    if (a.includes("cicl") || a.includes("bici")) return "cycling";
    if (a.includes("triat")) return "triathlon";
    if (a.includes("trail")) return "trail";
    return "running";
  }, [trainingApproach]);

  const daysList = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const disciplineOptions: { id: DisciplineType; label: string; icon: React.ElementType; colorActive: string }[] = [
    { id: "Carrera", label: "Carrera", icon: Footprints, colorActive: "bg-amber-500 text-white" },
    { id: "Ciclismo", label: "Bici", icon: Bike, colorActive: "bg-sky-500 text-white" },
    { id: "Fuerza", label: "Fuerza", icon: Dumbbell, colorActive: "bg-purple-500 text-white" },
    { id: "Natacion", label: "Nado", icon: Waves, colorActive: "bg-cyan-500 text-white" },
    { id: "Descanso", label: "Descanso", icon: Moon, colorActive: "bg-slate-500 text-white" },
  ];

  const applyDefaultMatrixForApproach = (approachKey: string) => {
    if (!onChangeWeeklyAvailability) return;
    if (MATRIX_DEFAULTS[approachKey]) onChangeWeeklyAvailability(MATRIX_DEFAULTS[approachKey]);
  };

  const handleSelectMainSport = (sport: MainSportKey) => {
    let newAppr = "Solo Running";
    if (sport === "running") newAppr = trainingApproach.includes("Cruzado") ? "Entrenamiento Cruzado" : "Solo Running";
    else if (sport === "cycling") newAppr = "Solo Ciclismo";
    else if (sport === "triathlon") newAppr = "Triatlón";
    else if (sport === "trail") newAppr = "Trail Running";

    onChangeTrainingApproach(newAppr);
    applyDefaultMatrixForApproach(newAppr);
  };

  const handleSelectSubVariant = (variant: string) => {
    onChangeTrainingApproach(variant);
    applyDefaultMatrixForApproach(variant);
  };

  const toggleDayDiscipline = (day: string, discId: DisciplineType) => {
    if (!onChangeWeeklyAvailability) return;
    const currentMap: WeeklyAvailabilityMap = weeklyAvailability ? { ...weeklyAvailability } : { ...DEFAULT_WEEKLY_AVAILABILITY };
    const currentDayVal = currentMap[day as keyof WeeklyAvailabilityMap];
    let currentList: DisciplineType[] = Array.isArray(currentDayVal) ? [...(currentDayVal as DisciplineType[])] : [((currentDayVal as DisciplineType) || "Descanso")];

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

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. SELECCIÓN DE DEPORTE PRINCIPAL Y MODALIDAD */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
          Selecciona tu Deporte y Enfoque Semanal
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* RUNNING */}
          <div onClick={() => handleSelectMainSport("running")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${activeMainSport === "running" ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 ring-2 ring-amber-500/20 shadow-xs" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${activeMainSport === "running" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-amber-500"}`}>
                  <Footprints className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Running</h4>
                  <p className="text-[10px] text-slate-500 font-mono">5K, 10K, 21K, 42K</p>
                </div>
              </div>
              {activeMainSport === "running" && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Series de ritmo, rodajes y tiradas progresivas.</p>
            <div className="grid grid-cols-2 gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => handleSelectSubVariant("Solo Running")}
                className={`py-1 px-2 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer text-center ${trainingApproach === "Solo Running" ? "bg-amber-500 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
                Solo Running
              </button>
              <button type="button" onClick={() => handleSelectSubVariant("Entrenamiento Cruzado")}
                className={`py-1 px-2 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer text-center ${trainingApproach === "Entrenamiento Cruzado" ? "bg-amber-500 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
                Cruzado (Bici+Fuerza)
              </button>
            </div>
          </div>

          {/* CICLISMO */}
          <div onClick={() => handleSelectMainSport("cycling")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${activeMainSport === "cycling" ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/20 ring-2 ring-sky-500/20 shadow-xs" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${activeMainSport === "cycling" ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-sky-500"}`}>
                  <Bike className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Ciclismo</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Fondo, Ruta, MTB, Gravel</p>
                </div>
              </div>
              {activeMainSport === "cycling" && <Check className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Entrenamiento estructurado por potencia FTP y fondo.</p>
            <div className="grid grid-cols-2 gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => handleSelectSubVariant("Solo Ciclismo")}
                className={`py-1 px-2 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer text-center ${trainingApproach === "Solo Ciclismo" ? "bg-sky-500 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
                Solo Ciclismo
              </button>
              <button type="button" onClick={() => handleSelectSubVariant("Ciclismo Cruzado")}
                className={`py-1 px-2 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer text-center ${trainingApproach === "Ciclismo Cruzado" ? "bg-sky-500 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
                Ciclismo + Cruzado
              </button>
            </div>
          </div>

          {/* TRIATLÓN */}
          <div onClick={() => handleSelectMainSport("triathlon")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${activeMainSport === "triathlon" ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-xs" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${activeMainSport === "triathlon" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-indigo-500"}`}>
                  <Waves className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Triatlón / Multideporte</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Sprint, 70.3, 140.6</p>
                </div>
              </div>
              {activeMainSport === "triathlon" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Distribución balanceada de natación, ciclismo y carrera.</p>
          </div>

          {/* TRAIL RUNNING */}
          <div onClick={() => handleSelectMainSport("trail")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${activeMainSport === "trail" ? "border-stone-500 bg-stone-50/60 dark:bg-stone-950/20 ring-2 ring-stone-500/20 shadow-xs" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${activeMainSport === "trail" ? "bg-stone-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-stone-500"}`}>
                  <Mountain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Trail Running & Montaña</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Desnivel D+, Ultra, Senderos</p>
                </div>
              </div>
              {activeMainSport === "trail" && <Check className="h-4 w-4 text-stone-600 dark:text-stone-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Énfasis en desnivel acumulado, volumen por tiempo y fuerza.</p>
          </div>
        </div>
      </div>

      {/* 2. MATRIZ SEMANAL DE DISPONIBILIDAD */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-white">
            <Layers className="h-3.5 w-3.5 text-emerald-500" />
            Matriz Semanal de Disponibilidad (Personaliza tus Días y Fondos)
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            ⚡ Doble sesión permitida
          </span>
        </div>

        {(() => {
          const v = validateLongSessionDays(weeklyAvailability);
          const missing: string[] = [];
          if (v.missingRunLong) missing.push("Tirada Larga de Carrera");
          if (v.missingRideLong) missing.push("Fondo de Ciclismo");
          if (v.sameDayConflict) {
            return (
              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-[11px]">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Protección al Atleta: No programes los dos ★ Fondos el mismo día ({v.explicitRunDay}). </span>
                  <span>Selecciona días distintos para tu Fondo de Ciclismo y tu Tirada Larga de Carrera para evitar sobrecarga articular.</span>
                </div>
              </div>
            );
          }
          if (!v.isValid) {
            return (
              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px]">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Requerido: Marca tu día de ★ Fondo ({missing.join(" y ")}). </span>
                  <span>Pulsa el botón <strong>[☆ Fondo]</strong> en el día (entre semana o fin de semana) donde harás tu entrenamiento largo para continuar.</span>
                </div>
              </div>
            );
          }
          if (v.hasRun || v.hasRide) {
            return (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/25 text-[11px] text-emerald-900 dark:text-emerald-200">
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Días de Fondo:</span>
                  {v.explicitRunDay && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[10px]">🏃 Run: {v.explicitRunDay}</span>}
                  {v.explicitRideDay && <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-800 dark:text-sky-300 font-mono text-[10px]">🚴 Bici: {v.explicitRideDay}</span>}
                </div>
                <span className="text-[10px] font-mono text-slate-500">Toca [☆ Fondo] en otro día para cambiarlo</span>
              </div>
            );
          }
          return null;
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {daysList.map((day) => {
            const dayDiscs = getDayDisciplines(weeklyAvailability, day);
            const isRest = dayDiscs.includes("Descanso");
            const v = validateLongSessionDays(weeklyAvailability);
            return (
              <div key={day} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white font-mono">{day.slice(0, 3)}</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{isRest ? "Off" : `${dayDiscs.length} ses`}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {disciplineOptions.map((opt) => {
                    const isActive = dayDiscs.includes(opt.id);
                    const Icon = opt.icon;
                    const canBeLong = opt.id === "Carrera" || opt.id === "Ciclismo";
                    const isLongDay = (opt.id === "Carrera" && v.explicitRunDay === day) || (opt.id === "Ciclismo" && v.explicitRideDay === day);
                    return (
                      <div key={opt.id} className="flex items-center gap-0.5">
                        <button type="button" onClick={() => toggleDayDiscipline(day, opt.id)}
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 ${isActive ? opt.colorActive : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                          title={`Marcar ${opt.label} para ${day}`}>
                          <Icon className="h-2.5 w-2.5" />
                          <span>{opt.label}</span>
                        </button>
                        {isActive && canBeLong && (
                          <button
                            type="button"
                            onClick={() => onChangeWeeklyAvailability && onChangeWeeklyAvailability(setLongSessionDay(weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY, opt.id as "Carrera" | "Ciclismo", day))}
                            className={`px-1 py-0.5 rounded-md text-[8px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 border ${
                              isLongDay
                                ? opt.id === "Carrera"
                                  ? "bg-amber-600 text-white border-amber-700"
                                  : "bg-sky-600 text-white border-sky-700"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400"
                            }`}
                            title={`Marcar ${day} como día de Fondo de ${opt.label}`}
                          >
                            <Star className={`h-2 w-2 ${isLongDay ? "fill-current" : ""}`} />
                            <span>{isLongDay ? "FONDO" : "☆ Fondo"}</span>
                          </button>
                        )}
                      </div>
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
