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
  HelpCircle,
} from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { useAuth } from "@/context/AuthContext";
import { WorkoutChart, parseWorkoutDoc } from "../WorkoutChart";
import { ActivityTelemetryChart } from "./ActivityTelemetryChart";
import { buildTelemetryMetricItems } from "./workoutTelemetryHelpers";

interface WorkoutDetailModalProps {
  workout: PlanItem | null;
  dailyExecutedActivities: DailyExecutedMap;
  onClose: () => void;
  athleteId?: string;
  apiKey?: string;
  uid?: string;
  email?: string;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  dailyExecutedActivities,
  onClose,
  athleteId,
  apiKey,
  uid,
  email,
}) => {
  const { user, userProfile } = useAuth();
  const effAthleteId = athleteId || userProfile?.intervalsAthleteId;
  const effApiKey = apiKey || (userProfile as any)?.intervalsApiKey;
  const effEmail = email || user?.email || undefined;
  const effUid = uid || user?.uid || undefined;

  const [hasCopiedSyntax, setHasCopiedSyntax] = useState<boolean>(false);
  const [activeHelpId, setActiveHelpId] = useState<string | null>(null);
  const [showAllHelp, setShowAllHelp] = useState<boolean>(false);
  const [discoveredWatts, setDiscoveredWatts] = useState<Record<string, number>>({});

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

    // Adaptación cruzada para resistencia (Correr en vez de pedalear o viceversa)
    if (workout.discipline === "Carrera" || workout.discipline === "Ciclismo") {
      const aerobic = allActs
        .filter((a) => a.type === "Run" || a.type === "Ride" || /run|carrera|ride|ciclismo/i.test(a.type || ""))
        .sort((a, b) => b.tss - a.tss)[0];
      if (aerobic) return aerobic;
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Datos Reales del Entrenamiento (Intervals.icu)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllHelp(!showAllHelp)}
                  className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/80 flex items-center gap-1 cursor-pointer bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg border border-emerald-300/80 transition"
                  title="Mostrar u ocultar la explicación de todas las métricas"
                >
                  <HelpCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  {showAllHelp ? "Ocultar Guía" : "¿Qué significa cada métrica?"}
                </button>
                <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-300/80">
                  {isExtraActivity ? `⚡ Carga: ${executedTss} TSS` : `⚡ Carga: ${executedTss} / ${plannedTss} TSS`}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {displayActivities.map((rawAct, aIdx) => {
                const act = discoveredWatts[rawAct.id] && !rawAct.watts
                  ? { ...rawAct, watts: discoveredWatts[rawAct.id] }
                  : rawAct;
                const metricItems = buildTelemetryMetricItems(act, workout.discipline);
                return (
                  <div key={aIdx} className="rounded-xl bg-white dark:bg-slate-900/90 p-3.5 border border-emerald-200 dark:border-emerald-800/60 font-mono space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 dark:text-white truncate max-w-[260px]">{act.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {act.deviceName || "Intervals Sync"}
                      </span>
                    </div>

                    {/* Rejilla de Métricas con Etiquetas Explicativas Claras */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                      {metricItems.map((item) => {
                        const isExpanded = showAllHelp || activeHelpId === item.id;
                        return (
                          <div
                            key={item.id}
                            className="bg-slate-50/90 dark:bg-slate-800/50 p-2 rounded-lg relative flex flex-col justify-between border border-slate-100 dark:border-slate-800 transition shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold truncate">
                                  {item.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveHelpId(activeHelpId === item.id ? null : item.id)}
                                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 transition cursor-pointer shrink-0"
                                  title={`¿Qué significa ${item.label}?`}
                                >
                                  <HelpCircle className="h-2.5 w-2.5" />
                                </button>
                              </div>

                              <strong className={`${item.colorClass} block font-bold text-xs mt-0.5`}>
                                {item.value}
                              </strong>
                              {item.subtext && (
                                <span className="text-[9px] text-slate-500 block truncate font-mono mt-0.5">
                                  {item.subtext}
                                </span>
                              )}
                            </div>

                            {/* Label pedagógico ocultable para los atletas */}
                            {isExpanded && (
                              <div className="text-[9px] text-slate-700 dark:text-slate-300 bg-emerald-50/90 dark:bg-slate-900/90 p-1.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/70 leading-snug font-sans mt-1.5 animate-fadeIn">
                                {item.athleteExplanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Gráfico Interactivo de Telemetría (Streams) con Credenciales Resueltas */}
                    {act.id && (
                      <ActivityTelemetryChart
                        activityId={act.id}
                        athleteId={effAthleteId}
                        apiKey={effApiKey}
                        email={effEmail}
                        uid={effUid}
                        summaryStats={{
                          heartrate: act.heartrate, maxHeartrate: act.maxHeartrate,
                          watts: act.watts, weightedWatts: act.weightedWatts,
                          distanceKm: act.distanceKm, movingTimeMin: act.movingTimeMin,
                          paceStr: act.paceStr, elevationGainM: act.elevationGainM,
                        }}
                        onMetricsDiscovered={(m) => {
                          if (m.avgWatts && !rawAct.watts) setDiscoveredWatts((p) => ({ ...p, [rawAct.id]: m.avgWatts! }));
                        }}
                      />
                    )}
                  </div>
                );
              })}
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
