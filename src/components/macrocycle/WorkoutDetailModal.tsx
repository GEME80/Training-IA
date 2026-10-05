"use client";

import React, { useState } from "react";
import { Check, X, Footprints, Bike, Dumbbell, Waves, Moon, HelpCircle, Zap, Timer } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { useAuth } from "@/context/AuthContext";
import { parseWorkoutDoc } from "../WorkoutChart";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";
import { ActivityTelemetryChart } from "./ActivityTelemetryChart";
import { ActivityZoneDistribution } from "./ActivityZoneDistribution";
import { PlannedWorkoutPrescription } from "./PlannedWorkoutPrescription";
import { buildTelemetryMetricItems } from "./workoutTelemetryHelpers";

interface WorkoutDetailModalProps {
  workout: PlanItem | null;
  dailyExecutedActivities: DailyExecutedMap;
  onClose: () => void;
  athleteId?: string;
  apiKey?: string;
  uid?: string;
  email?: string;
  runFtp?: number;
  bikeFtp?: number;
  runningTrainingMode?: "POWER" | "PACE" | "HYBRID";
  hasRunningPowerMeter?: boolean;
  thresholdPaceStr?: string;
  thresholdPaceSec?: number;
  lthr?: number;
  maxHR?: number;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout, dailyExecutedActivities, onClose, athleteId, apiKey, uid, email, runFtp, bikeFtp,
  runningTrainingMode, hasRunningPowerMeter, thresholdPaceStr, thresholdPaceSec, lthr, maxHR,
}) => {
  const { user, userProfile } = useAuth();
  const effAthleteId = athleteId || userProfile?.intervalsAthleteId, effApiKey = apiKey || (userProfile as any)?.intervalsApiKey, effEmail = email || user?.email || undefined;
  const isCurrentUser = !athleteId || athleteId === userProfile?.intervalsAthleteId;
  const effRunFtp = typeof runFtp === "number" ? runFtp : (isCurrentUser ? (userProfile?.runFtp || 0) : 0), effBikeFtp = typeof bikeFtp === "number" ? bikeFtp : (isCurrentUser ? (userProfile?.bikeFtp || 0) : 0), effUid = uid || user?.uid || undefined;
  const effLthr = typeof lthr === "number" && lthr > 0 ? lthr : (userProfile?.lthr || 0);
  const effMaxHR = typeof maxHR === "number" && maxHR > 0 ? maxHR : (userProfile?.maxHR || 0);

  const [activeHelpId, setActiveHelpId] = useState<string | null>(null);
  const [showAllHelp, setShowAllHelp] = useState<boolean>(false);
  const [discoveredWatts, setDiscoveredWatts] = useState<Record<string, number>>({});

  if (!workout) return null;

  const getDisciplineIcon = (discipline: string) => {
    if (discipline === "Descanso" || discipline === "Off") return <Moon className="h-4 w-4 text-slate-400 shrink-0" />;
    if (discipline === "Fuerza") return <Dumbbell className="h-4 w-4 text-purple-500 shrink-0" />;
    if (discipline === "Ciclismo") return <Bike className="h-4 w-4 text-sky-400 shrink-0" />;
    if (discipline === "Natacion" || discipline === "Natación") return <Waves className="h-4 w-4 text-teal-400 shrink-0" />;
    return <Footprints className="h-4 w-4 text-amber-500 shrink-0" />;
  };

  const isExtraActivity = workout.id?.startsWith("extra-");
  const modalExecuted = dailyExecutedActivities?.[workout.date];
  const allActs = modalExecuted?.activities || [];

  const findMatchingActivity = () => {
    if (allActs.length === 0) return null;
    if (isExtraActivity) return allActs.find((a) => workout.id === `extra-${a.id}` || a.name === workout.workoutName) || allActs[0];
    if (workout.discipline === "Carrera") return allActs.find((a) => a.type === "Run" || /run|carrera|trote|trail|fondo/i.test(`${a.type} ${a.name}`)) || null;
    if (workout.discipline === "Ciclismo") return allActs.find((a) => a.type === "Ride" || /ride|ciclismo|bike|virtualride|indoor/i.test(`${a.type} ${a.name}`)) || null;
    if (workout.discipline === "Fuerza") return allActs.find((a) => a.type === "WeightTraining" || /weight|gym|fuerza|strength/i.test(`${a.type} ${a.name}`)) || null;
    if (workout.discipline === "Natacion") return allActs.find((a) => a.type === "Swim" || /swim|nataci|piscina|aguas/i.test(`${a.type} ${a.name}`)) || null;
    return allActs.find((a) => a.type === "Run" || a.type === "Ride") || null;
  };

  const matchedAct = findMatchingActivity();
  const parsedDoc = parseWorkoutDoc(workout.workoutDoc, workout.discipline);
  const plannedTss = workout.tss || parsedDoc.estimatedTss || (workout.durationMinutes ? Math.round(workout.durationMinutes * 0.75) : 0);
  const executedTss = matchedAct ? matchedAct.tss : isExtraActivity ? (workout.tss || 0) : (modalExecuted?.totalTss || 0);
  const displayActivities = matchedAct ? [matchedAct] : (isExtraActivity && allActs.length > 0 ? [allActs[0]] : []);
  const isExecuted = displayActivities.length > 0;

  const getDisciplineBadgeClass = (discipline: string) => {
    if (discipline === "Natacion" || discipline === "Natación") return "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
    if (discipline === "Ciclismo") return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    if (discipline === "Fuerza") return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  };

  const isPaceAthlete =
    runningTrainingMode === "PACE" ||
    hasRunningPowerMeter === false ||
    userProfile?.runningTrainingMode === "PACE" ||
    userProfile?.hasRunningPowerMeter === false ||
    effAthleteId === "i729730";

  const isRunPace =
    workout.discipline === "Carrera" &&
    (isPaceAthlete || effRunFtp === 0 || !workout.powerTarget || !/\b\d+\s*W\b/i.test(workout.powerTarget) || /%\s*Pace\b/i.test(workout.workoutDoc || ""));

  const isRunPower = workout.discipline === "Carrera" && !isRunPace && effRunFtp > 0;
  const isBike = workout.discipline === "Ciclismo";

  let displayTitle = workout.workoutName.replace(/\[.*?\]\s*/g, "");
  if (isRunPace) {
    displayTitle = displayTitle
      .replace(/\s*@\s*(\d+(?:-\d+)?)\s*%\s*(?:CP|FTP)/gi, " @ $1% Pace")
      .replace(/\bStryd\s*CP\b/gi, "Ritmo Umbral")
      .replace(/\bStryd\b/gi, "Ritmo");
  } else if (isRunPower) {
    displayTitle = displayTitle.replace(/%\s*FTP\b/gi, "% CP");
  }

  let displayTarget = workout.powerTarget;
  if (isRunPace && displayTarget) {
    displayTarget = displayTarget
      .replace(/\b\d+\s*-\s*\d+\s*W\b\s*/gi, "")
      .replace(/\b\d+\s*W\b\s*/gi, "")
      .replace(/\s*\(\d+\s*W\)/gi, "")
      .replace(/^\s*\d+\s*-\s*/, "")
      .replace(/%\s*(?:Stryd\s*)?(?:CP|FTP)/gi, "% Pace")
      .replace(/\bStryd\s*CP\b/gi, "Ritmo Umbral")
      .replace(/\bStryd\b/gi, "Ritmo")
      .trim();
  } else if (isRunPower && displayTarget) {
    displayTarget = displayTarget.replace(/%\s*FTP\b/gi, "% CP");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {getDisciplineIcon(workout.discipline)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {workout.day} • {workout.formattedDate || workout.date}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getDisciplineBadgeClass(workout.discipline)}`}>
                  {isExtraActivity ? "Actividad Adicional" : workout.discipline}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-800/80">
                  ⚡ {plannedTss} TSS
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  ⏱️ {workout.durationMinutes || parsedDoc.totalMins || 45}m
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {displayTitle}
              </h4>
              {displayTarget && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isRunPace
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                      : isBike
                      ? "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60"
                      : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                  }`}>
                    {isRunPace ? <Timer className="h-3 w-3 text-emerald-500" /> : <Zap className={`h-3 w-3 ${isBike ? "text-sky-500" : "text-amber-500"}`} />}
                    Objetivo: {displayTarget}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isExecuted && (
          <div className="rounded-2xl p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-300">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Datos Reales del Entrenamiento (Intervals.icu)
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowAllHelp(!showAllHelp)} className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/80 flex items-center gap-1 cursor-pointer bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg border border-emerald-300/80 transition" title="Mostrar u ocultar guía">
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
                const act = discoveredWatts[rawAct.id] && !rawAct.watts ? { ...rawAct, watts: discoveredWatts[rawAct.id] } : rawAct;
                const metricItems = buildTelemetryMetricItems(act, workout.discipline);

                return (
                  <div key={aIdx} className="rounded-xl bg-white dark:bg-slate-900/90 p-3.5 border border-emerald-200 dark:border-emerald-800/60 font-mono space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 dark:text-white truncate max-w-[260px]">{act.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{act.deviceName || "Intervals Sync"}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                      {metricItems.map((item) => {
                        const isExpanded = showAllHelp || activeHelpId === item.id;
                        return (
                          <div key={item.id} className="bg-slate-50/90 dark:bg-slate-800/50 p-2 rounded-lg relative flex flex-col justify-between border border-slate-100 dark:border-slate-800 transition shadow-2xs">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-slate-400 uppercase block font-sans font-bold truncate">{item.label}</span>
                                <button type="button" onClick={() => setActiveHelpId(activeHelpId === item.id ? null : item.id)} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 transition cursor-pointer shrink-0" title={`¿Qué significa ${item.label}?`}>
                                  <HelpCircle className="h-2.5 w-2.5" />
                                </button>
                              </div>
                              <strong className={`${item.colorClass} block font-bold text-xs mt-0.5`}>{item.value}</strong>
                              {item.subtext && <span className="text-[9px] text-slate-500 block truncate font-mono mt-0.5">{item.subtext}</span>}
                            </div>
                            {isExpanded && <div className="text-[9px] text-slate-700 dark:text-slate-300 bg-emerald-50/90 dark:bg-slate-900/90 p-1.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/70 leading-snug font-sans mt-1.5 animate-fadeIn">{item.athleteExplanation}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {act.id && (
                      <div className="space-y-3 pt-1">
                        <ActivityTelemetryChart
                          activityId={act.id} athleteId={effAthleteId} apiKey={effApiKey} email={effEmail} uid={effUid}
                          summaryStats={{ heartrate: act.heartrate, maxHeartrate: act.maxHeartrate, watts: act.watts, weightedWatts: act.weightedWatts, distanceKm: act.distanceKm, movingTimeMin: act.movingTimeMin, paceStr: act.paceStr, elevationGainM: act.elevationGainM }}
                          onMetricsDiscovered={(m) => { if (m.avgWatts && !rawAct.watts) setDiscoveredWatts((p) => ({ ...p, [rawAct.id]: m.avgWatts! })); }}
                        />

                        <ActivityZoneDistribution
                          activity={act}
                          discipline={workout.discipline}
                          runningTrainingMode={runningTrainingMode}
                          hasRunningPowerMeter={hasRunningPowerMeter}
                          runFtp={effRunFtp}
                          bikeFtp={effBikeFtp}
                          thresholdPaceSec={thresholdPaceSec}
                          thresholdPaceStr={thresholdPaceStr}
                          maxHeartrate={act.maxHeartrate || effMaxHR}
                          lthr={effLthr}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {workout.workoutDoc && (
          <PlannedWorkoutPrescription
            cleanDoc={sanitizeWorkoutDoc(workout.workoutDoc, { discipline: workout.discipline, isRunPaceOnly: isRunPace })}
            discipline={workout.discipline}
            isRunPace={isRunPace}
            isRunPower={isRunPower}
            isBike={isBike}
            effRunFtp={effRunFtp}
            effBikeFtp={effBikeFtp}
            thresholdPaceStr={thresholdPaceStr}
            thresholdPaceSec={thresholdPaceSec}
            isExecuted={isExecuted}
          />
        )}

        {((!isExecuted && workout.mobilityWarmup) || workout.fuelingStrategy) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {!isExecuted && workout.mobilityWarmup && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 p-2.5 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">🧘 Movilidad & Activación (Pre-Entreno)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.mobilityWarmup}</p>
              </div>
            )}
            {workout.fuelingStrategy && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">⚡ Estrategia Nutricional (Informativo)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.fuelingStrategy}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-900 text-white dark:bg-slate-800 px-5 py-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
