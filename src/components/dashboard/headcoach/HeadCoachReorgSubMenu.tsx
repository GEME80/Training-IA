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

  // Solo se pueden invertir sesiones entre Hoy y Mañana si Hoy no ha sido ya ejecutada
  const canSwapBetweenDays = !hasTrainedToday;

  const handleFinish = (prompt: string, opts: any = { skipUserBubble: true }) => {
    onClose(); setSubMode(null); onAction(prompt, opts);
  };

  const pillBtnCls = "flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 transition cursor-pointer shadow-2xs";

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-500/25 flex flex-col gap-2.5 animate-fadeIn">
      {subMode === null ? (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setSubMode("sick")} className={pillBtnCls}>
            <Thermometer className="h-3.5 w-3.5 text-rose-500" />
            <span>Estuve enfermo / Me salté días</span>
          </button>
          <button type="button" onClick={() => setSubMode("matrix")} className={pillBtnCls}>
            <CalendarSync className="h-3.5 w-3.5 text-indigo-500" />
            <span>Ajustar días (Matriz)</span>
          </button>
          <button type="button" onClick={() => setSubMode("swap")} className={pillBtnCls}>
            <ArrowLeftRight className="h-3.5 w-3.5 text-sky-500" />
            <span>Intercambiar ejercicio</span>
          </button>
          <button type="button" onClick={() => setSubMode("short_time")} className={pillBtnCls}>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Poco tiempo</span>
          </button>
        </div>
      ) : subMode === "sick" ? (
        <div className="flex flex-wrap items-center gap-2 w-full">
          <button type="button" onClick={() => setSubMode(null)} className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
            <RotateCcw className="h-3.5 w-3.5" /><span>Volver</span>
          </button>
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-rose-500" /><span>Retorno post-enfermedad:</span>
          </span>
          <button type="button" onClick={() => handleFinish(`Estuve enfermo y me salté algunos días esta semana. Activa el protocolo de retorno progresivo para los días restantes de esta semana (Semana ${currWeek}) sin sobrecargarme, eliminando intensidades altas y acortando la tirada larga.`)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-xs font-bold hover:bg-emerald-500/25 transition cursor-pointer">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" /><span>Días restantes (Semana {currWeek})</span>
          </button>
          <button type="button" onClick={() => { if (onSelectWeek) onSelectWeek(nextWeek); handleFinish(`Estuve enfermo durante esta semana y ya no entrenaré más en ella. Planifiquemos mi retorno progresivo para la próxima semana (Semana ${nextWeek}): genera el microciclo con volumen reducido un 30%, rodajes suaves en Z1/Z2 conversacional y cero intensidades anaeróbicas.`); }} className={pillBtnCls}>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-500" /><span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : subMode === "matrix" ? (
        <div className="flex flex-wrap items-center gap-2 w-full">
          <button type="button" onClick={() => setSubMode(null)} className="p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
            <RotateCcw className="h-3.5 w-3.5" /><span>Volver</span>
          </button>
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1.5">
            <CalendarSync className="h-3.5 w-3.5 text-indigo-500" /><span>Reorganizar disponibilidad:</span>
          </span>
          <button type="button" onClick={() => { onClose(); setSubMode(null); if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(currWeek); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-xs font-bold hover:bg-emerald-500/25 transition cursor-pointer">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" /><span>Esta semana (Semana {currWeek})</span>
          </button>
          <button type="button" onClick={() => { onClose(); setSubMode(null); if (onSelectWeek) onSelectWeek(nextWeek); if (onOpenTemporaryMatrix) onOpenTemporaryMatrix(nextWeek); }} className={pillBtnCls}>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-500" /><span>Próxima semana (Semana {nextWeek})</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 w-full">
          {/* Fila 1: Navegación, Selector de Día y Sesión Actual */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-200/70 dark:border-amber-800/50">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSubMode(null)} className="p-1.5 px-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
                <RotateCcw className="h-3.5 w-3.5" /><span>Volver</span>
              </button>

              {/* Selector de Día: Hoy vs Mañana */}
              <div className="flex items-center rounded-xl bg-amber-200/50 dark:bg-amber-900/50 p-0.5 border border-amber-300/60 dark:border-amber-700/60">
                <button type="button" onClick={() => setTargetDay("today")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${targetDay === "today" ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700" : "text-amber-800 dark:text-amber-300 hover:text-amber-950"}`}>
                  <span>Hoy ({todayName})</span>
                  {hasTrainedToday && <span className="text-[10px] text-emerald-600 font-black">✓</span>}
                </button>
                <button type="button" onClick={() => setTargetDay("tomorrow")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${targetDay === "tomorrow" ? "bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-100 shadow-xs border border-amber-300 dark:border-amber-700" : "text-amber-800 dark:text-amber-300 hover:text-amber-950"}`}>
                  <span>Mañana ({tomorrowName})</span>
                </button>
              </div>
            </div>

            {/* Contexto Fisiológico: Sesión Activa */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-100 text-xs">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Sesión programada:</span>
              <span className="font-bold">{activeWorkoutName}</span>
              <span className="font-mono text-amber-800 dark:text-amber-300 font-bold bg-amber-200/60 dark:bg-amber-800/50 px-1.5 py-0.5 rounded text-[10px]">
                {isRestSelected ? "Descanso" : `${activeDuration} min`}
              </span>
            </div>
          </div>

          {/* Fila 2: Opciones Contextuales de Intercambio / Compresión */}
          {subMode === "swap" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
                <ArrowLeftRight className="h-3.5 w-3.5 text-sky-500" />
                <span>Intercambiar por:</span>
              </span>

              {/* Invertir sesiones entre Hoy y Mañana (solo si hoy no ha sido ejecutada) */}
              {canSwapBetweenDays && (
                <button type="button" onClick={() => handleFinish(`Deseo intercambiar las sesiones de ${targetDayLabel} y ${otherDayLabel}. Pasa la sesión '${activeWorkoutName}' a ${otherDayLabel} y la sesión '${otherWorkoutName}' a ${targetDayLabel}, manteniendo intacta la carga total de la semana. Presenta la propuesta de ajuste para mi aprobación.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400 text-indigo-950 dark:text-indigo-100 text-xs font-bold hover:bg-indigo-500/25 transition cursor-pointer">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Invertir con {targetDay === "today" ? `Mañana (${otherWorkoutName})` : `Hoy (${otherWorkoutName})`}</span>
                </button>
              )}

              {/* Pasar a Rodillo Z2 */}
              {!isBikeActive && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo programada la sesión '${activeWorkoutName}', pero deseo cambiarla por rodillo / ciclismo en Zona 2 sin impacto articular para cuidar mis articulaciones. Ajusta la sesión manteniendo la duración equivalente y potencia aeróbica adecuada a mi Bike FTP.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400 text-sky-950 dark:text-sky-100 text-xs font-bold hover:bg-sky-500/25 transition cursor-pointer">
                  <Bike className="h-3.5 w-3.5 text-sky-500" /><span>Rodillo Z2 (Sin impacto)</span>
                </button>
              )}

              {/* Pasar a Carrera Z2 */}
              {!isRunActive && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo programada la sesión '${activeWorkoutName}', pero deseo cambiarla por una sesión equivalente de carrera continua en Zona 2 suave. Ajusta la sesión manteniendo intensidad aeróbica controlada según mi Stryd CP / ritmo.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-xs font-bold hover:bg-emerald-500/25 transition cursor-pointer">
                  <Footprints className="h-3.5 w-3.5 text-emerald-500" /><span>Carrera Z2 (Aeróbico suave)</span>
                </button>
              )}

              {/* Fuerza Funcional & Core */}
              {activeSession?.discipline !== "Fuerza" && (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} deseo cambiar mi sesión programada ('${activeWorkoutName}') por una sesión de Fuerza Funcional, Core y estabilidad articular de 40 minutos para prevención de lesiones.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-400 text-purple-950 dark:text-purple-100 text-xs font-bold hover:bg-purple-500/25 transition cursor-pointer">
                  <Dumbbell className="h-3.5 w-3.5 text-purple-500" /><span>Fuerza & Core (40m)</span>
                </button>
              )}

              {/* Descanso Pasivo o Activar */}
              {!isRestSelected ? (
                <button type="button" onClick={() => handleFinish(`${targetDayLabel} deseo cambiar mi sesión programada ('${activeWorkoutName}') por un día de Descanso Pasivo total para asimilar la carga y recuperar musculatura.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                  <Moon className="h-3.5 w-3.5 text-slate-500" /><span>Descanso Pasivo</span>
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} está programado como descanso, pero deseo activar una sesión suave de Carrera continua en Zona 2 de 40 minutos sin sobrecargarme.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-950 dark:text-emerald-100 text-xs font-bold hover:bg-emerald-500/25 transition cursor-pointer">
                    <Footprints className="h-3.5 w-3.5 text-emerald-600" /><span>Activar Carrera Z2 (40m)</span>
                  </button>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} está programado como descanso, pero deseo activar una sesión suave de Rodillo / Ciclismo en Zona 2 de 45 minutos sin impacto articular.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400 text-sky-950 dark:text-sky-100 text-xs font-bold hover:bg-sky-500/25 transition cursor-pointer">
                    <Bike className="h-3.5 w-3.5 text-sky-500" /><span>Activar Rodillo Z2 (45m)</span>
                  </button>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} está programado como descanso, pero deseo activar una sesión de Fuerza Funcional y Core de 40 minutos para reforzar estabilidad.`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-400 text-purple-950 dark:text-purple-100 text-xs font-bold hover:bg-purple-500/25 transition cursor-pointer">
                    <Dumbbell className="h-3.5 w-3.5 text-purple-500" /><span>Activar Fuerza & Core (40m)</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 mr-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Comprimir duración:</span>
              </span>

              {!isRestSelected ? (
                <>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 20% su duración a aproximadamente ${activeMins20} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer">
                    <span>-20% ({activeMins20}m)</span>
                  </button>
                  <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Mi sesión programada es '${activeWorkoutName}' de ${activeDuration} min. Comprime esta sesión recortando un 30% su duración a aproximadamente ${activeMins30} minutos, manteniendo la intensidad de los vatios clave y recortando volumen no esencial de calentamiento y enfriamiento. Presenta la propuesta de sesión adaptada para mi aprobación.`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-950 dark:text-amber-100 text-xs font-bold hover:bg-amber-500/25 transition cursor-pointer">
                    <span>-30% ({activeMins30}m)</span>
                  </button>
                  {activeDuration >= 40 && (
                    <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo muy limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión express de exactamente 30 minutos, manteniendo la potencia en tu zona y recortando al mínimo calentamiento y vuelta a la calma. Presenta la propuesta adaptada para mi aprobación.`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer">
                      <span>Express (30m)</span>
                    </button>
                  )}
                  {activeDuration >= 55 && (
                    <button type="button" onClick={() => handleFinish(`${targetDayLabel} tengo tiempo limitado. Comprime mi sesión prevista '${activeWorkoutName}' a una versión de 45 minutos manteniendo el estímulo central. Presenta la propuesta adaptada para mi aprobación.`)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer">
                      <span>Express (45m)</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs text-amber-700 dark:text-amber-300 italic">
                  {targetDay === "today" ? "Hoy es día de descanso pasivo." : "Mañana es día de descanso pasivo."}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
