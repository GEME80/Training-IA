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
  onClose,
  onAction,
  onSelectWeek,
  onOpenTemporaryMatrix,
}) => {
  const [subMode, setSubMode] = useState<"sick" | "matrix" | "swap" | null>(null);

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
            onClick={() =>
              handleFinish(
                "Hoy tengo tiempo muy limitado (30 a 45 minutos). Comprime mi sesión manteniendo el estímulo principal y reduciendo volumen no esencial."
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:border-amber-400 transition cursor-pointer"
          >
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Tengo poco tiempo hoy (30m/45m)</span>
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
      )}
    </div>
  );
};
