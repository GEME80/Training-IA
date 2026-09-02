"use client";

import React from "react";
import { Footprints, Bike, Dumbbell, Waves, Moon, Check, X } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";

interface AthleteCalendarDayTileProps {
  item: PlanItem;
  todayStr: string;
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectWorkoutModal: (item: PlanItem) => void;
}

export const AthleteCalendarDayTile: React.FC<AthleteCalendarDayTileProps> = ({
  item,
  todayStr,
  dailyExecutedActivities,
  onSelectWorkoutModal,
}) => {
  const isToday = item.date === todayStr;
  const isPastDay = item.date < todayStr;
  const isRest = item.isRestDay || item.discipline === "Descanso";
  const executedDay = dailyExecutedActivities?.[item.date];
  const allActs: DailyExecutedActivity[] = executedDay?.activities || [];
  const parsedDoc = parseWorkoutDoc(item.workoutDoc);
  const itemPlannedTss = item.tss || parsedDoc.estimatedTss || (item.durationMinutes ? Math.round(item.durationMinutes * 0.75) : 0);

  // 1. Emparejamiento inteligente de la sesión programada con la actividad real
  const findMatchingActivity = (): DailyExecutedActivity | null => {
    if (isRest || allActs.length === 0) return null;

    if (item.discipline === "Carrera") {
      const match = allActs.find(
        (a) =>
          a.type === "Run" ||
          /run|carrera|trote|trail/i.test(a.type) ||
          /run|carrera|trote|marat|fondo/i.test(a.name)
      );
      if (match) return match;
    }

    if (item.discipline === "Ciclismo") {
      const match = allActs.find(
        (a) =>
          a.type === "Ride" ||
          /ride|ciclismo|bike|virtualride|indoor/i.test(a.type) ||
          /ride|ciclismo|bike|rodaje|fondo/i.test(a.name)
      );
      if (match) return match;
    }

    if (item.discipline === "Fuerza") {
      const match = allActs.find(
        (a) =>
          a.type === "WeightTraining" ||
          /weight|gym|fuerza|strength/i.test(a.type) ||
          /fuerza|gym|pesas|fortalec/i.test(a.name)
      );
      if (match) return match;
    }

    if (allActs.length === 1) return allActs[0];
    return null;
  };

  const matchedActivity = findMatchingActivity();
  const extraActivities = allActs.filter((a) => a !== matchedActivity);

  const isExecuted = !isRest && !!matchedActivity;
  const isMissed = !isRest && !matchedActivity && isPastDay;

  const renderPlannedIcon = () => {
    if (item.discipline === "Carrera") return <Footprints className="h-3.5 w-3.5" />;
    if (item.discipline === "Ciclismo") return <Bike className="h-3.5 w-3.5" />;
    if (item.discipline === "Natacion") return <Waves className="h-3.5 w-3.5" />;
    return <Dumbbell className="h-3.5 w-3.5" />;
  };

  const renderActivityIcon = (type: string, name?: string) => {
    const t = (type || "").toLowerCase();
    const n = (name || "").toLowerCase();
    if (t.includes("run") || n.includes("carrera") || n.includes("run")) {
      return <Footprints className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    }
    if (t.includes("ride") || t.includes("bike") || n.includes("ciclismo") || n.includes("bike")) {
      return <Bike className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />;
    }
    if (t.includes("swim") || n.includes("nataci") || n.includes("swim")) {
      return <Waves className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />;
    }
    return <Dumbbell className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
  };

  return (
    <div className="rounded-xl flex flex-col justify-between transition-all text-left">
      {/* Subcabecera de Fecha */}
      <div className="text-center pb-1 mb-1">
        {isToday ? (
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-600 text-white font-mono font-bold text-[10px] shadow-xs">
            {item.formattedDate || item.date.slice(5)}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {item.formattedDate || item.date.slice(5)}
          </span>
        )}
      </div>

      {/* Contenedor de Tarjetas Apiladas */}
      <div className="space-y-2 flex-1 flex flex-col">
        {/* CASO 1: DÍA DE DESCANSO */}
        {isRest ? (
          allActs.length === 0 ? (
            <div className="h-28 flex items-center justify-center rounded-xl bg-slate-50/40 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-400 gap-1.5">
              <Moon className="h-3.5 w-3.5" />
              <span>Descanso</span>
            </div>
          ) : (
            /* Si era descanso pero realizó actividades, se muestran como ejecutadas */
            allActs.map((act, aIdx) => (
              <div
                key={aIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWorkoutModal({
                    id: `extra-${act.id}`,
                    date: item.date,
                    formattedDate: item.formattedDate,
                    day: item.day,
                    discipline: act.type === "WeightTraining" ? "Fuerza" : act.type === "Ride" ? "Ciclismo" : act.type === "Run" ? "Carrera" : "Fuerza",
                    workoutName: act.name,
                    durationMinutes: act.movingTimeMin,
                    tss: act.tss,
                    action: "MANTENER",
                    justification: `Actividad registrada en Intervals.icu (${act.name}).`,
                    workoutDoc: "",
                  });
                }}
                className="rounded-xl border border-emerald-400 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/35 shadow-xs overflow-hidden flex flex-col hover:border-emerald-500 transition cursor-pointer group"
              >
                <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-b border-emerald-200/90 dark:border-emerald-800/80">
                  <div className="flex items-center space-x-1">
                    {renderActivityIcon(act.type, act.name)}
                    <span>{act.movingTimeMin}m</span>
                    {act.distanceKm && <span className="text-[10px] opacity-80 font-normal">({act.distanceKm}k)</span>}
                  </div>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-2xs">
                    ✓
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    <span>Carga {act.tss} TSS</span>
                    {act.heartrate && <span>❤️ {act.heartrate}bpm</span>}
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 text-center pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                    {act.name}
                  </div>
                </div>
              </div>
            ))
          )
        ) : isExecuted && matchedActivity ? (
          /* CASO 2: SESIÓN PROGRAMADA EJECUTADA (VERDE ESMERALDA CON MÉTRICAS PROPIAS) */
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectWorkoutModal(item);
            }}
            className="rounded-xl border border-emerald-400 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/35 shadow-xs ring-1 ring-emerald-500/20 overflow-hidden flex flex-col hover:border-emerald-500 transition cursor-pointer group"
          >
            <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-b border-emerald-200/90 dark:border-emerald-800/80">
              <div className="flex items-center space-x-1">
                {renderPlannedIcon()}
                <span>{matchedActivity.movingTimeMin}m</span>
                {matchedActivity.distanceKm && <span className="text-[10px] opacity-80 font-normal">({matchedActivity.distanceKm}k)</span>}
              </div>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-2xs">
                ✓
              </span>
            </div>

            <div className="p-2 space-y-1.5 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">
                  Carga {matchedActivity.tss} / {itemPlannedTss}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  RPE 4 😊
                </span>
              </div>

              {(matchedActivity.watts || matchedActivity.heartrate) && (
                <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between border-y border-emerald-200/60 dark:border-emerald-800/40 py-0.5">
                  {matchedActivity.watts ? <span>⚡ {matchedActivity.watts}W</span> : <span />}
                  {matchedActivity.heartrate ? <span>❤️ {matchedActivity.heartrate}bpm</span> : <span />}
                </div>
              )}

              {item.workoutDoc && (
                <div className="py-0.5">
                  <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                </div>
              )}

              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 text-center pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                {matchedActivity.name || item.workoutName.replace(/\[.*?\]\s*/g, "")}
              </div>
            </div>
          </div>
        ) : isMissed ? (
          /* CASO 3: SESIÓN PROGRAMADA OMITIDA (ROJO SUAVE) */
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectWorkoutModal(item);
            }}
            className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 opacity-80 overflow-hidden flex flex-col hover:opacity-100 transition cursor-pointer group"
          >
            <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-rose-100/70 dark:bg-rose-900/40 text-rose-900 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800">
              <div className="flex items-center space-x-1">
                {renderPlannedIcon()}
                <span>{item.durationMinutes || 45}m</span>
              </div>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-2xs">
                ✕
              </span>
            </div>

            <div className="p-2 space-y-1.5 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                <span>Carga 0 / {itemPlannedTss}</span>
                <span>⚠️ Omitida</span>
              </div>

              {item.workoutDoc && (
                <div className="py-0.5 opacity-60">
                  <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                </div>
              )}

              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight line-clamp-2 text-center pt-1 border-t border-rose-200 dark:border-rose-800">
                {item.workoutName.replace(/\[.*?\]\s*/g, "")}
              </div>
            </div>
          </div>
        ) : (
          /* CASO 4: SESIÓN PROGRAMADA PENDIENTE / FUTURA */
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (item.workoutDoc) onSelectWorkoutModal(item);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col hover:border-sky-400 dark:hover:border-sky-500 transition cursor-pointer group"
          >
            <div
              className={`px-2 py-1 flex items-center justify-between text-xs font-bold font-mono border-b ${
                item.discipline === "Carrera"
                  ? "bg-[#fcf2eb] dark:bg-amber-950/40 text-[#8C564B] dark:text-amber-300 border-[#f6ddcd] dark:border-amber-900/50"
                  : item.discipline === "Ciclismo"
                  ? "bg-[#e8f4fd] dark:bg-sky-950/50 text-[#0863b2] dark:text-sky-300 border-[#cde6fb] dark:border-sky-900/50"
                  : "bg-[#f3effb] dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-[#e1d8f5] dark:border-purple-900/50"
              }`}
            >
              <div className="flex items-center space-x-1">
                {renderPlannedIcon()}
                <span>{item.durationMinutes || parsedDoc.totalMins ? (
                  (item.durationMinutes || parsedDoc.totalMins) >= 60
                    ? `${Math.floor((item.durationMinutes || parsedDoc.totalMins) / 60)}h${(item.durationMinutes || parsedDoc.totalMins) % 60 > 0 ? `${(item.durationMinutes || parsedDoc.totalMins) % 60}m` : ""}`
                    : `${item.durationMinutes || parsedDoc.totalMins}m`
                ) : "45m"}</span>
                {(() => {
                  const kmMatch = item.workoutName.match(/(\d+(?:\.\d+)?)\s*(?:km|k\b)/i);
                  return kmMatch ? <span className="text-[10px] opacity-80 font-normal">({kmMatch[1]}k)</span> : null;
                })()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Plan</span>
            </div>

            <div className="p-2 space-y-1.5 flex flex-col justify-between flex-1">
              <div className="text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Carga {itemPlannedTss}
              </div>

              {item.workoutDoc && (
                <div className="py-0.5">
                  <WorkoutChart workoutDoc={item.workoutDoc} discipline={item.discipline} />
                </div>
              )}

              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 text-center pt-1 border-t border-slate-100 dark:border-slate-800">
                {item.workoutName.replace(/\[.*?\]\s*/g, "")}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVIDADES ADICIONALES / EXTRAS (APILADAS EN LA MISMA COLUMNA) */}
        {!isRest && extraActivities.map((extraAct, eIdx) => (
          <div
            key={`extra-${eIdx}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWorkoutModal({
                id: `extra-${extraAct.id}`,
                date: item.date,
                formattedDate: item.formattedDate,
                day: item.day,
                discipline: extraAct.type === "WeightTraining" ? "Fuerza" : extraAct.type === "Ride" ? "Ciclismo" : extraAct.type === "Run" ? "Carrera" : "Fuerza",
                workoutName: extraAct.name,
                durationMinutes: extraAct.movingTimeMin,
                tss: extraAct.tss,
                action: "MANTENER",
                justification: `Actividad adicional registrada en Intervals.icu (${extraAct.name}).`,
                workoutDoc: "",
              });
            }}
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shadow-2xs overflow-hidden flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition cursor-pointer group"
          >
            {/* Cabecera de la Actividad Adicional */}
            <div className="px-2 py-1 flex items-center justify-between text-xs font-bold font-mono bg-slate-200/60 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center space-x-1">
                {renderActivityIcon(extraAct.type, extraAct.name)}
                <span>{extraAct.movingTimeMin}m</span>
                {extraAct.distanceKm && <span className="text-[10px] opacity-80 font-normal">({extraAct.distanceKm}k)</span>}
              </div>
              <span className="px-1.5 py-0.2 rounded bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold">
                + Extra
              </span>
            </div>

            {/* Cuerpo */}
            <div className="p-1.5 space-y-1 flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-slate-600 dark:text-slate-400">
                  Carga {extraAct.tss} TSS
                </span>
                {extraAct.heartrate && (
                  <span className="text-rose-600 dark:text-rose-400">
                    ❤️ {extraAct.heartrate}bpm
                  </span>
                )}
              </div>

              {extraAct.watts && (
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                  ⚡ {extraAct.watts}W
                </div>
              )}

              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-1 text-center pt-1 border-t border-slate-200/60 dark:border-slate-800">
                {extraAct.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
