"use client";

import React from "react";
import { Calendar, Footprints, Bike, Dumbbell, Waves, Moon, Check, Save, RotateCcw, CheckCircle2, Loader2, Star, AlertTriangle } from "lucide-react";
import {
  WeeklyAvailabilityMap,
  DisciplineType,
  normalizeDisciplines,
  getDayDisciplines,
  setLongSessionDay,
  validateLongSessionDays,
} from "@/lib/gemini/engine";

export const CANONICAL_ATHLETE_MATRIX: WeeklyAvailabilityMap = {
  Lunes: ["Descanso"],
  Martes: ["Carrera"],
  Miércoles: ["Ciclismo"],
  Jueves: ["Fuerza"],
  Viernes: ["Carrera", "Fuerza"],
  Sábado: ["Ciclismo"],
  Domingo: ["Carrera"],
  _longRideDay: "Sábado",
  _longRunDay: "Domingo",
};

interface ProfileAvailabilityTabProps {
  weeklyAvailability: WeeklyAvailabilityMap;
  onToggleDayDiscipline: (dayKey: string, disc: DisciplineType) => void;
  onChangeAvailability?: (newMap: WeeklyAvailabilityMap) => void;
  onSaveAvailability?: (newMap: WeeklyAvailabilityMap) => Promise<void>;
  onResetToCanonical?: () => Promise<void>;
  isSaving?: boolean;
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
  onChangeAvailability,
  onSaveAvailability,
  onResetToCanonical,
  isSaving: externalSaving = false,
}) => {
  const [internalSaving, setInternalSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const isSaving = externalSaving || internalSaving;
  const longValidation = validateLongSessionDays(weeklyAvailability);

  const days = [
    { key: "Lunes", label: "Lunes", short: "Lun" },
    { key: "Martes", label: "Martes", short: "Mar" },
    { key: "Miércoles", label: "Miércoles", short: "Mié" },
    { key: "Jueves", label: "Jueves", short: "Jue" },
    { key: "Viernes", label: "Viernes", short: "Vie" },
    { key: "Sábado", label: "Sábado", short: "Sáb" },
    { key: "Domingo", label: "Domingo", short: "Dom" },
  ];

  const handleSetLongDay = (e: React.MouseEvent, dayKey: string, disc: "Carrera" | "Ciclismo") => {
    e.stopPropagation();
    const updated = setLongSessionDay(weeklyAvailability, disc, dayKey);
    if (onChangeAvailability) onChangeAvailability(updated);
  };

  const handleManualSave = async () => {
    if (!onSaveAvailability || !longValidation.isValid) return;
    setInternalSaving(true);
    try {
      await onSaveAvailability(weeklyAvailability);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setInternalSaving(false);
    }
  };

  const handleReset = async () => {
    if (onResetToCanonical) {
      await onResetToCanonical();
    } else if (onChangeAvailability) {
      onChangeAvailability(CANONICAL_ATHLETE_MATRIX);
    } else {
      for (const [day, disciplines] of Object.entries(CANONICAL_ATHLETE_MATRIX)) {
        if (day.startsWith("_")) continue;
        const current = getDayDisciplines(weeklyAvailability, day);
        normalizeDisciplines(disciplines).forEach((d: DisciplineType) => {
          if (!current.includes(d)) onToggleDayDiscipline(day, d);
        });
      }
    }
  };

  const missingLabels: string[] = [];
  if (longValidation.missingRunLong) missingLabels.push("Tirada Larga de Carrera");
  if (longValidation.missingRideLong) missingLabels.push("Fondo de Ciclismo");

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-sky-500" />
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Matriz Semanal de Disponibilidad Deportiva
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-bold self-start sm:self-auto">Semana Canónica</span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Configura qué disciplinas tienes disponibles cada día y marca con la insignia <strong>★ Fondo</strong> qué día realizas tu sesión larga de <strong>Carrera</strong> y/o <strong>Ciclismo</strong> (puede ser entre semana o fin de semana).
      </p>

      {/* Banner de Instrucción y Validación de Días de Fondo */}
      {longValidation.sameDayConflict ? (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-xs">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Protección al Atleta: No programes los dos ★ Fondos el mismo día ({longValidation.explicitRunDay})</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Para cuidar tus articulaciones y evitar sobrecarga neuromuscular, asigna el <strong>★ Fondo de Ciclismo</strong> y la <strong>★ Tirada Larga de Carrera</strong> en días diferentes de la semana.
            </p>
          </div>
        </div>
      ) : !longValidation.isValid ? (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Falta marcar tu día de ★ Fondo ({missingLabels.join(" y ")})</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Pulsa el botón <strong>[☆ Marcar Fondo]</strong> dentro del día en que harás tu entrenamiento largo antes de guardar la matriz.
            </p>
          </div>
        </div>
      ) : (longValidation.hasRun || longValidation.hasRide) ? (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/25 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex flex-wrap items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Días de Fondo confirmados:</span>
            {longValidation.explicitRunDay && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[11px]">
                🏃 Run: {longValidation.explicitRunDay}
              </span>
            )}
            {longValidation.explicitRideDay && (
              <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-800 dark:text-sky-300 font-mono text-[11px]">
                🚴 Bici: {longValidation.explicitRideDay}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Toca [☆ Fondo] en otro día activo para cambiarlo
          </span>
        </div>
      ) : null}

      {/* Grid de los 7 Días */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 pt-1">
        {days.map((day) => {
          const dayDisciplines = getDayDisciplines(weeklyAvailability, day.key);
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

              {/* Botones de Selección */}
              <div className="grid grid-cols-1 gap-1">
                {DISCIPLINE_CONFIG.map((conf) => {
                  const isSelected = dayDisciplines.includes(conf.type);
                  const Icon = conf.icon;
                  const canBeLong = conf.type === "Carrera" || conf.type === "Ciclismo";
                  const isLongDay =
                    (conf.type === "Carrera" && longValidation.explicitRunDay === day.key) ||
                    (conf.type === "Ciclismo" && longValidation.explicitRideDay === day.key);

                  return (
                    <div key={conf.type} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => onToggleDayDiscipline(day.key, conf.type)}
                        className={`w-full px-2 py-1.5 rounded-xl text-[10px] transition flex items-center justify-between cursor-pointer border ${
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
                      {isSelected && canBeLong && (
                        <button
                          type="button"
                          onClick={(e) => handleSetLongDay(e, day.key, conf.type as "Carrera" | "Ciclismo")}
                          className={`w-full px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                            isLongDay
                              ? conf.type === "Carrera"
                                ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                                : "bg-sky-500 text-white border-sky-600 shadow-2xs"
                              : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 hover:text-slate-800 dark:hover:text-white"
                          }`}
                          title={`Marcar ${day.label} como día de Fondo de ${conf.label}`}
                        >
                          <Star className={`h-2.5 w-2.5 ${isLongDay ? "fill-current" : ""}`} />
                          <span>{isLongDay ? "★ FONDO" : "☆ Marcar Fondo"}</span>
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

      {/* Barra de Acciones: Guardar Matriz y Restablecer Canónica */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restablecer Matriz Canónica</span>
        </button>

        <div className="flex items-center space-x-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4" />
              <span>¡Matriz Guardada en BD!</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving || !longValidation.isValid}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={!longValidation.isValid ? `Selecciona primero tu día de Fondo (${missingLabels.join(" y ")})` : "Guardar Matriz de Disponibilidad"}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando en BD...</span>
              </>
            ) : longValidation.sameDayConflict ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Separa los ★ Fondos en días distintos</span>
              </>
            ) : !longValidation.isValid ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Marca ★ Fondo para Guardar</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Matriz de Disponibilidad</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
