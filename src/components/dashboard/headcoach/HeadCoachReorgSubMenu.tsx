"use client";

import React, { useState } from "react";
import {
  Thermometer, Clock, Bike, CalendarSync, ArrowLeftRight,
  RotateCcw, Footprints, MapPin, ChevronRight, Dumbbell, Moon
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
  currWeek, nextWeek, todayName, isRunToday, isBikeToday,
  todaySession, tomorrowSession, hasTrainedToday = false,
  onClose, onAction, onSelectWeek, onOpenTemporaryMatrix,
}) => {
  const [subMode, setSubMode] = useState<"sick" | "matrix" | "swap" | "short_time" | null>(null);
  const [targetDay, setTargetDay] = useState<"today" | "tomorrow">(() => (hasTrainedToday ? "tomorrow" : "today"));

  const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayIdx = CANONICAL_DAYS.indexOf(todayName), tomorrowIdx = (todayIdx + 1) % 7;
  const tomorrowName = CANONICAL_DAYS[tomorrowIdx];
  const activeDayName = targetDay === "today" ? todayName : tomorrowName;
  const otherDayName = targetDay === "today" ? tomorrowName : todayName;
  const activeSession = targetDay === "today" ? todaySession : tomorrowSession;
  const otherSession = targetDay === "today" ? tomorrowSession : todaySession;

  const isRunActive = /run|carrera|trote|atletismo/i.test(activeSession?.discipline || activeSession?.workoutName || (targetDay === "today" && isRunToday ? "run" : ""));
  const isBikeActive = /bike|ride|ciclismo|rodillo|bici/i.test(activeSession?.discipline || activeSession?.workoutName || (targetDay === "today" && isBikeToday ? "bike" : ""));
  const activeWorkoutName = activeSession?.workoutName || activeSession?.title || (isRunActive ? "Carrera en Z2" : isBikeActive ? "Ciclismo en Z2" : "Entrenamiento");
  const isRestSelected = !activeSession || activeSession.discipline === "Descanso" || (activeSession.durationMinutes === 0 && activeSession.tss === 0);
  const otherWorkoutName = otherSession?.workoutName || otherSession?.title || (!otherSession || otherSession.discipline === "Descanso" ? "Descanso" : "Entrenamiento");

  const targetDayLabel = targetDay === "today" ? `Hoy (${todayName})` : `Mañana (${tomorrowName})`;
  const otherDayLabel = targetDay === "today" ? `Mañana (${tomorrowName})` : `Hoy (${todayName})`;
  const activeDuration = activeSession?.durationMinutes || 60;
  const activeMins20 = Math.max(20, Math.round(activeDuration * 0.8)), activeMins30 = Math.max(15, Math.round(activeDuration * 0.7));

  const handleFinish = (prompt: string, opts: any = { skipUserBubble: true }) => {
    onClose(); setSubMode(null); onAction(prompt, opts);
  };

  const btnCls = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer";

  return (
    <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/25 flex flex-wrap items-center gap-1.5 sm:gap-2 animate-fadeIn">
      {subMode === null ? (
        <>
          <button type="button" onClick={() => setSubMode("sick")} className={btnCls}>
            <Thermometer className="h-3 w-3 text-rose-500" />
            <span>Estuve enfermo / Me salté días</span>
          </button>
          <button type="button" onClick={() => setSubMode("matrix")} className={btnCls}>
            <CalendarSync className="h-3 w-3 text-indigo-500" />
            <span>Ajustar días (Matriz)</span>
          </button>
          <button type="button" onClick={() => setSubMode("swap")} className={btnCls}>
            <ArrowLeftRight className="h-3 w-3 text-sky-500" />
            <span>Intercambiar ejercicio</span>
          </button>
          <button type="button" onClick={() => setSubMode("short_time")} className={btnCls}>
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Poco tiempo</span>
          </button>
        </>
      ) : subMode === "sick" ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button type="button" onClick={() => setSubMode(null)} className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /><span>Volver</span>
          </button>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-rose-500" /><span>Retorno: ¿qué semana adaptar?</span>
          </span>
          <button type="button" onClick={() => handleFinish(`Estuve enfermo y me salté algunos días esta semana. Activa el protocolo de retorno progresivo para los días restantes de esta semana (Semana ${currWeek}) sin sobrecargarme, eliminando intensidades altas y acortando la tirada larga.`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-[11px] font-bold hover:bg-emerald-500/25 transition cursor-pointer">
            <MapPin className="h-3 w-3 text-emerald-600" /><span>Días restantes (Semana {currWeek})</span>
          </button>
          <button type="button" onClick={() => { if (onSelectWeek) onSelectWeek(nextWeek); handleFinish(`Estuve enfermo durante esta semana y ya no entrenaré más en ella. Planifiquemos mi retorno progresivo para la próxima semana (Semana ${nextWeek}): genera el microciclo con volumen reducido un 30%, rodajes suaves en Z1/Z2 conversacional y cero intensidades anaeróbicas.`); }} className={btnCls}>
            <ChevronRight className="h-3 w-3 text-indigo-500" /><span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : subMode === "matrix" ? (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button type="button" onClick={() => setSubMode(null)} className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /><span>Volver</span>
          </button>
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
            <CalendarSync className="h-3 w-3 text-indigo-500" /><span>Matriz: ¿para qué semana?</span>
          </span>
          <button type="button" onClick={() => { onClose(); setSubMode(null); if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(currWeek); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-[11px] font-bold hover:bg-emerald-500/25 transition cursor-pointer">
            <MapPin className="h-3 w-3 text-emerald-600" /><span>Esta semana (Semana {currWeek})</span>
          </button>
          <button type="button" onClick={() => { onClose(); setSubMode(null); if (onSelectWeek) onSelectWeek(nextWeek); if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(nextWeek); }} className={btnCls}>
            <ChevronRight className="h-3 w-3 text-indigo-500" /><span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <button type="button" onClick={() => setSubMode(null)} className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /><span>Volver</span>
          </button>

          {/* Selector de Día: Hoy vs Mañana */}
          <div className="flex items-center rounded-xl bg-amber-100/70 dark:bg-amber-900/40 p-0.5 border border-amber-300/40 dark:border-amber-700/50">
            <button type="button" onClick={() => setTargetDay("today")} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${targetDay === "today" ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700" : "text-amber-800 dark:text-amber-300"}`}>
              <span>Hoy ({todayName})</span>
              {hasTrainedToday && <span className="text-[8px] text-emerald-600 font-black">✓</span>}
            </button>
            <button type="button" onClick={() => setTargetDay("tomorrow")} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${targetDay === "tomorrow" ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700" : "text-amber-800 dark:text-amber-300"}`}>
              <span>Mañana ({tomorrowName})</span>
            </button>
          </div>

          {/* Badge Sesión Activa */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-semibold">
            <span className="font-bold truncate max-w-[130px] sm:max-w-[170px]">{activeWorkoutName}</span>
            <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">{isRestSelected ? "(Descanso)" : `(${activeDuration}m)`}</span>
          </div>

          {subMode === "swap" ? (
            <>
              {/* Invertir sesiones entre Hoy y Mañana */}
              <button type="button" onClick={() => handleFinish(`Deseo intercambiar las sesiones de ${targetDayLabel} y ${otherDayLabel}. Pasa la sesión '${activeWorkoutName}' a ${otherDayLabel} y la sesión '${otherWorkoutName}' a ${targetDayLabel}, manteniendo intacta la carga total de la semana. Presenta la propuesta de ajuste para mi aprobación.`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400 text-indigo-950 dark:text-indigo-100 text-[11px] font-bold hover:bg-indigo-500/25 transition cursor-pointer">
                <ArrowLeftRight className="h-3 w-3 text-indigo-500" />
                <span>Invertir con {targetDay === "today" ? "Mañana" : "Hoy"}</span>
              </button>

              {/* Pasar a Rodillo Z2 */}
              {!isBikeActive && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo programada la sesión '${activeWorkoutName}', pero deseo cambiarla por rodillo / ciclismo en Zona 2 sin impacto articular para cuidar mis articulaciones. Ajusta la sesión manteniendo la duración equivalente y potencia aeróbica adecuada a mi Bike FTP.`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400 text-sky-950 dark:text-sky-100 hover:bg-sky-500/25 transition cursor-pointer">
                  <Bike className="h-3 w-3 text-sky-500" /><span>Pasar a Rodillo Z2 (Sin impacto)</span>
                </button>
              )}

              {/* Pasar a Carrera Z2 */}
              {!isRunActive && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo programada la sesión '${activeWorkoutName}', pero deseo cambiarla por una sesión equivalente de carrera continua en Zona 2 suave. Ajusta la sesión manteniendo intensidad aeróbica controlada según mi Stryd CP / ritmo.`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-500/25 transition cursor-pointer">
                  <Footprints className="h-3 w-3 text-emerald-500" /><span>Pasar a Carrera Z2 (Suave)</span>
                </button>
              )}

              {/* Fuerza Funcional & Core */}
              {activeSession?.discipline !== "Fuerza" && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} deseo cambiar mi sesión programada ('${activeWorkoutName}') por una sesión de Fuerza Funcional, Core y estabilidad articular de 40 minutos para prevención de lesiones.`)} className={btnCls}>
                  <Dumbbell className="h-3 w-3 text-purple-500" /><span>Fuerza & Core (40m)</span>
                </button>
              )}

              {/* Descanso Pasivo o Activar */}
              {!isRestSelected ? (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} deseo cambiar mi sesión programada ('${activeWorkoutName}') por un día de Descanso Pasivo total para asimilar la carga y recuperar musculatura.`)} className={btnCls}>
                  <Moon className="h-3 w-3 text-slate-500" /><span>Descanso Pasivo</span>
                </button>
              ) : (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} está programado como descanso, pero deseo activar una sesión suave de Carrera continua en Zona 2 de 40 minutos sin sobrecargarme.`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-[11px] font-bold hover:bg-emerald-500/25 transition cursor-pointer">
                  <Footprints className="h-3 w-3 text-emerald-600" /><span>Activar Carrera Z2 (40m)</span>
                </button>
              )}
            </>
          ) : (
            <>
              {!isRestSelected ? (
                <>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 20% su duración a aproximadamente ${activeMins20} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer">
                    <span>-20% ({activeMins20}m)</span>
                  </button>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 30% su duración a aproximadamente ${activeMins30} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-950 dark:text-amber-100 text-[11px] font-bold hover:bg-amber-500/25 transition cursor-pointer">
                    <span>-30% ({activeMins30}m)</span>
                  </button>
                  {activeDuration >= 40 && (
                    <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo muy limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión express de exactamente 30 minutos, manteniendo la potencia en tu zona y recortando al mínimo calentamiento y vuelta a la calma. Presenta la propuesta adaptada para mi aprobación.`)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer">
                      <span>Express (30m)</span>
                    </button>
                  )}
                  {activeDuration >= 55 && (
                    <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión de 45 minutos manteniendo el estímulo central. Presenta la propuesta adaptada para mi aprobación.`)} className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 transition cursor-pointer">
                      <span>Express (45m)</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[10px] text-amber-700 dark:text-amber-300 italic">
                  {targetDay === "today" ? "Hoy es día de descanso pasivo." : "Mañana es día de descanso pasivo."}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
