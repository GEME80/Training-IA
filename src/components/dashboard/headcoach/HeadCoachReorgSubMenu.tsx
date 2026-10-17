"use client";

import React, { useState } from "react";
import {
  Thermometer, Clock, Bike, CalendarSync, ArrowLeftRight,
  RotateCcw, Footprints, MapPin, ChevronRight
} from "lucide-react";

interface HeadCoachReorgSubMenuProps {
  currWeek: number;
  nextWeek: number;
  todayName: string;
  isRunToday: boolean;
  isBikeToday: boolean;
  todaySession?: any;
  tomorrowSession?: any;
  hasTrainedToday?: boolean;
  onClose: () => void;
  onAction: (prompt: string, opts?: any) => void;
  onSelectWeek?: (weekNum: number) => void;
  onOpenTemporaryMatrix?: (targetWeekNum?: number) => void;
}

export const HeadCoachReorgSubMenu: React.FC<HeadCoachReorgSubMenuProps> = ({
  currWeek,
  nextWeek,
  todayName,
  isRunToday,
  isBikeToday,
  todaySession,
  tomorrowSession,
  hasTrainedToday = false,
  onClose,
  onAction,
  onSelectWeek,
  onOpenTemporaryMatrix,
}) => {
  const [subMode, setSubMode] = useState<"sick" | "matrix" | "swap" | "short_time" | null>(null);
  const [targetDay, setTargetDay] = useState<"today" | "tomorrow">(() => (hasTrainedToday ? "tomorrow" : "today"));

  const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayIdx = CANONICAL_DAYS.indexOf(todayName);
  const tomorrowIdx = (todayIdx + 1) % 7;
  const tomorrowName = CANONICAL_DAYS[tomorrowIdx];

  const activeDayName = targetDay === "today" ? todayName : tomorrowName;
  const activeSession = targetDay === "today" ? todaySession : tomorrowSession;
  const isRunActive = /run|carrera|trote|atletismo/i.test(activeSession?.discipline || activeSession?.workoutName || (targetDay === "today" && isRunToday ? "run" : ""));
  const isBikeActive = /bike|ride|ciclismo|rodillo|bici/i.test(activeSession?.discipline || activeSession?.workoutName || (targetDay === "today" && isBikeToday ? "bike" : ""));
  const activeWorkoutName = activeSession?.workoutName || activeSession?.title || (isRunActive ? "Carrera en Z2" : isBikeActive ? "Ciclismo en Z2" : "Entrenamiento");
  const activeDuration = activeSession?.durationMinutes || 60;
  const activeMins20 = Math.max(20, Math.round(activeDuration * 0.8));
  const activeMins30 = Math.max(15, Math.round(activeDuration * 0.7));
  const isRestSelected = !activeSession || activeSession.discipline === "Descanso" || (activeSession.durationMinutes === 0 && activeSession.tss === 0);

  const handleFinish = (prompt: string, opts: any = { skipUserBubble: true }) => {
    onClose();
    setSubMode(null);
    onAction(prompt, opts);
  };

  return (
    <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/25 flex flex-wrap items-center gap-1.5 sm:gap-2 animate-fadeIn">
      {subMode === null ? (
        <>
          <button
            type="button"
            onClick={() => setSubMode("sick")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer"
          >
            <Thermometer className="h-3 w-3 text-rose-500" />
            <span>Estuve enfermo / Me salté días</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode("matrix")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer"
          >
            <CalendarSync className="h-3 w-3 text-indigo-500" />
            <span>Ajustar días (Matriz)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode("swap")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer"
          >
            <ArrowLeftRight className="h-3 w-3 text-sky-500" />
            <span>Intercambiar ejercicio hoy</span>
          </button>

          <button
            type="button"
            onClick={() => setSubMode("short_time")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer"
          >
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Tengo poco tiempo hoy</span>
          </button>
        </>
      ) : subMode === "sick" ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button
            type="button"
            onClick={() => setSubMode(null)}
            className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Volver</span>
          </button>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-rose-500" />
            <span>Retorno: ¿qué semana adaptar?</span>
          </span>
          <button
            type="button"
            onClick={() =>
              handleFinish(
                `Estuve enfermo y me salté algunos días esta semana. Activa el protocolo de retorno progresivo para los días restantes de esta semana (Semana ${currWeek}) sin sobrecargarme, eliminando intensidades altas y acortando la tirada larga.`
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-[11px] font-bold hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Días restantes (Semana {currWeek})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onSelectWeek) onSelectWeek(nextWeek);
              handleFinish(
                `Estuve enfermo durante esta semana y ya no entrenaré más en ella. Planifiquemos mi retorno progresivo para la próxima semana (Semana ${nextWeek}): genera el microciclo con volumen reducido un 30%, rodajes suaves en Z1/Z2 conversacional y cero intensidades anaeróbicas.`
              );
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
          >
            <ChevronRight className="h-3 w-3 text-indigo-500" />
            <span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : subMode === "matrix" ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button
            type="button"
            onClick={() => setSubMode(null)}
            className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Volver</span>
          </button>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
            <CalendarSync className="h-3 w-3 text-indigo-500" />
            <span>Matriz: ¿para qué semana?</span>
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSubMode(null);
              if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(currWeek);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-[11px] font-bold hover:bg-emerald-500/25 transition cursor-pointer"
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Esta semana (Semana {currWeek})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSubMode(null);
              if (onSelectWeek) onSelectWeek(nextWeek);
              if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(nextWeek);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
          >
            <ChevronRight className="h-3 w-3 text-indigo-500" />
            <span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : subMode === "swap" ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button
            type="button"
            onClick={() => setSubMode(null)}
            className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Volver</span>
          </button>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
            <ArrowLeftRight className="h-3 w-3 text-sky-500" />
            <span>Intercambiar hoy ({todayName}):</span>
          </span>
          <button
            type="button"
            onClick={() =>
              handleFinish(
                "Hoy tengo programada una sesión de carrera a pie, pero deseo intercambiarla por rodillo / ciclismo en Zona 2 sin impacto articular para cuidar mis articulaciones. Ajusta la sesión de hoy manteniendo la duración equivalente y potencia aeróbica adecuada a mi Bike FTP."
              )
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
              isRunToday
                ? "bg-sky-500/15 border-sky-400 text-sky-950 dark:text-sky-100 hover:bg-sky-500/25 ring-1 ring-sky-400/30"
                : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:border-amber-400"
            }`}
          >
            <Bike className="h-3 w-3 text-sky-500" />
            <span>Pasar a Rodillo Z2 (Sin impacto)</span>
            {isRunToday && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-800 dark:text-sky-300 font-black">
                Toca Carrera
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              handleFinish(
                "Hoy tengo programada una sesión de ciclismo/rodillo, pero deseo intercambiarla por una sesión equivalente de carrera a pie continua en Zona 2 suave. Ajusta la sesión de hoy manteniendo intensidad aeróbica controlada según mi Stryd CP / ritmo."
              )
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
              isBikeToday
                ? "bg-emerald-500/15 border-emerald-400 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-500/25 ring-1 ring-emerald-400/30"
                : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:border-amber-400"
            }`}
          >
            <Footprints className="h-3 w-3 text-emerald-500" />
            <span>Pasar a Carrera Z2 (Aeróbico suave)</span>
            {isBikeToday && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black">
                Toca Ciclismo
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button
            type="button"
            onClick={() => setSubMode(null)}
            className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Volver</span>
          </button>

          {/* Selector de Día: Hoy vs Mañana */}
          <div className="flex items-center rounded-xl bg-amber-100/70 dark:bg-amber-900/40 p-0.5 border border-amber-300/40 dark:border-amber-700/50">
            <button
              type="button"
              onClick={() => setTargetDay("today")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                targetDay === "today"
                  ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700"
                  : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
              }`}
            >
              <span>Hoy ({todayName})</span>
              {hasTrainedToday && <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black">✓</span>}
            </button>
            <button
              type="button"
              onClick={() => setTargetDay("tomorrow")}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                targetDay === "tomorrow"
                  ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700"
                  : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
              }`}
            >
              <span>Mañana ({tomorrowName})</span>
            </button>
          </div>

          {/* Tarjeta de la Sesión del Día Seleccionado */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-semibold">
            <span className="font-bold truncate max-w-[130px] sm:max-w-[180px]">{activeWorkoutName}</span>
            <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
              {isRestSelected ? "(Descanso)" : `(${activeDuration}m)`}
            </span>
          </div>

          {!isRestSelected ? (
            <>
              <button
                type="button"
                onClick={() =>
                  handleFinish(
                    `${targetDay === "today" ? `Hoy (${todayName})` : `Mañana (${tomorrowName})`} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 20% su duración a aproximadamente ${activeMins20} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
              >
                <span>-20% ({activeMins20}m)</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleFinish(
                    `${targetDay === "today" ? `Hoy (${todayName})` : `Mañana (${tomorrowName})`} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 30% su duración a aproximadamente ${activeMins30} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`
                  )
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-950 dark:text-amber-100 text-[11px] font-bold hover:bg-amber-500/25 transition cursor-pointer"
              >
                <span>-30% ({activeMins30}m)</span>
              </button>
              {activeDuration >= 40 && (
                <button
                  type="button"
                  onClick={() =>
                    handleFinish(
                      `${targetDay === "today" ? `Hoy (${todayName})` : `Mañana (${tomorrowName})`} tengo tiempo muy limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión express de exactamente 30 minutos, manteniendo la potencia en tu zona y recortando al mínimo calentamiento y vuelta a la calma. Presenta la propuesta adaptada para mi aprobación.`
                    )
                  }
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  <span>Express (30m)</span>
                </button>
              )}
              {activeDuration >= 55 && (
                <button
                  type="button"
                  onClick={() =>
                    handleFinish(
                      `${targetDay === "today" ? `Hoy (${todayName})` : `Mañana (${tomorrowName})`} tengo tiempo limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión de 45 minutos manteniendo el estímulo central. Presenta la propuesta adaptada para mi aprobación.`
                    )
                  }
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  <span>Express (45m)</span>
                </button>
              )}
            </>
          ) : (
            <span className="text-[10px] text-amber-700 dark:text-amber-300 italic">
              {targetDay === "today" ? "Hoy es día de descanso pasivo." : "Mañana es día de descanso pasivo."}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
