"use client";

import React, { useState } from "react";
import {
  Code2,
  Check,
  X,
  Copy,
  CheckCheck,
  Footprints,
  Bike,
  Dumbbell,
  Waves,
  Moon,
  Activity,
  Zap,
  Heart,
  Smile,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";

interface WorkoutDetailModalProps {
  workout: PlanItem | null;
  dailyExecutedActivities: DailyExecutedMap;
  onClose: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  dailyExecutedActivities,
  onClose,
}) => {
  const [hasCopiedSyntax, setHasCopiedSyntax] = useState<boolean>(false);

  if (!workout) return null;

  const handleCopySyntax = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedSyntax(true);
    setTimeout(() => setHasCopiedSyntax(false), 2000);
  };

  const getDisciplineIcon = (discipline: string) => {
    if (discipline === "Descanso" || discipline === "Off") {
      return <Moon className="h-4 w-4 text-slate-400 shrink-0" />;
    }
    if (discipline === "Fuerza") {
      return <Dumbbell className="h-4 w-4 text-purple-500 shrink-0" />;
    }
    if (discipline === "Ciclismo") {
      return <Bike className="h-4 w-4 text-cyan-500 shrink-0" />;
    }
    if (discipline === "Natacion" || discipline === "Natación") {
      return <Waves className="h-4 w-4 text-sky-500 shrink-0" />;
    }
    return <Footprints className="h-4 w-4 text-amber-500 shrink-0" />;
  };

  const isExtraActivity = workout.id?.startsWith("extra-");
  const modalExecuted = dailyExecutedActivities?.[workout.date];
  const allActs = modalExecuted?.activities || [];

  // Emparejamiento exclusivo de la actividad correspondiente
  const findMatchingActivity = () => {
    if (allActs.length === 0) return null;

    if (isExtraActivity) {
      return allActs.find((a) => workout.id === `extra-${a.id}` || a.name === workout.workoutName) || allActs[0];
    }

    if (workout.discipline === "Carrera") {
      const match = allActs.find(
        (a) =>
          a.type === "Run" ||
          /run|carrera|trote|trail/i.test(a.type) ||
          /run|carrera|trote|marat|fondo/i.test(a.name)
      );
      if (match) return match;
    }

    if (workout.discipline === "Ciclismo") {
      const match = allActs.find(
        (a) =>
          a.type === "Ride" ||
          /ride|ciclismo|bike|virtualride|indoor/i.test(a.type) ||
          /ride|ciclismo|bike|rodaje|fondo/i.test(a.name)
      );
      if (match) return match;
    }

    if (workout.discipline === "Fuerza") {
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

  const matchedAct = findMatchingActivity();
  const parsedDoc = parseWorkoutDoc(workout.workoutDoc);
  const plannedTss = workout.tss || parsedDoc.estimatedTss || (workout.durationMinutes ? Math.round(workout.durationMinutes * 0.75) : 0);
  const executedTss = matchedAct ? matchedAct.tss : isExtraActivity ? (workout.tss || 0) : (modalExecuted?.totalTss || 0);

  const displayActivities = matchedAct ? [matchedAct] : (isExtraActivity && allActs.length > 0 ? [allActs[0]] : []);
  const isExecuted = displayActivities.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {getDisciplineIcon(workout.discipline)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {workout.day} • {workout.formattedDate || workout.date}
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {isExtraActivity ? "Actividad Adicional" : workout.discipline}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen de Ejecución Real Sincronizada con Intervals */}
        {isExecuted && (
          <div className="rounded-2xl p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Telemetría Sincronizada en Vivo (Intervals.icu)
              </span>
              <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-300/80">
                {isExtraActivity ? (
                  `⚡ Carga: ${executedTss} TSS`
                ) : (
                  `⚡ Carga: ${executedTss} / ${plannedTss} TSS`
                )}
              </span>
            </div>

            <div className="space-y-2">
              {displayActivities.map((act, aIdx) => (
                <div key={aIdx} className="rounded-xl bg-white dark:bg-slate-900/90 p-3 border border-emerald-200 dark:border-emerald-800/60 font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 dark:text-white text-xs truncate">{act.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Smile className="h-3.5 w-3.5 text-amber-500" />
                      RPE 4 (Sensación Óptima)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block uppercase">Tiempo</span>
                      <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Activity className="h-3 w-3 text-cyan-500" />
                        {act.movingTimeMin}m
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block uppercase">Potencia</span>
                      <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {act.watts ? `${act.watts}W` : "—"}
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block uppercase">Cardio</span>
                      <strong className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Heart className="h-3 w-3 text-rose-500" />
                        {act.heartrate ? `${act.heartrate}bpm` : "—"}
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block uppercase">Distancia</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {act.distanceKm ? `${act.distanceKm} km` : "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráfica de Intervalos */}
        {workout.workoutDoc && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Perfil de Intervalos y Zonas:
            </span>
            <WorkoutChart
              workoutDoc={workout.workoutDoc}
              discipline={workout.discipline}
            />
          </div>
        )}

        {/* Sintaxis Estructurada Stryd / Intervals */}
        {workout.workoutDoc && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                Prescripción Estructurada (Sintaxis Stryd / % FTP):
              </span>
              <button
                type="button"
                onClick={() => handleCopySyntax(workout.workoutDoc || "")}
                className="flex items-center space-x-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {hasCopiedSyntax ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Sintaxis</span>
                  </>
                )}
              </button>
            </div>

            <pre className="max-h-48 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-[11px] font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {workout.workoutDoc}
            </pre>
          </div>
        )}

        {/* Footer del Modal */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white px-5 py-2 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
