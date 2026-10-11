"use client";

import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { useAuth } from "@/context/AuthContext";
import { parseWorkoutDoc } from "../WorkoutChart";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";
import { ActivityTelemetryChart, TargetWorkRange } from "./ActivityTelemetryChart";
import { ActivityZoneDistribution } from "./ActivityZoneDistribution";
import { PlannedWorkoutPrescription } from "./PlannedWorkoutPrescription";
import { ExecutedSessionMetricsTable } from "./ExecutedSessionMetricsTable";
import { WorkoutBottomSheetHero } from "./WorkoutBottomSheetHero";
import { WorkoutSegmentedTabs, WorkoutModalTab } from "./WorkoutSegmentedTabs";
import { parsePaceToSeconds, interpolateWorkoutTarget, adaptRunningWorkoutDoc } from "@/lib/physiology/runningWorkoutAdapter";

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
  const [sheetState, setSheetState] = useState<"HALF" | "FULL">("HALF");
  const [activeTab, setActiveTab] = useState<WorkoutModalTab>("TELEMETRY");
  const [discoveredWatts, setDiscoveredWatts] = useState<Record<string, number>>({});

  if (!workout) return null;

  const effAthleteId = athleteId || userProfile?.intervalsAthleteId, effApiKey = apiKey || (userProfile as any)?.intervalsApiKey, effEmail = email || user?.email || undefined;
  const isCurrentUser = !athleteId || athleteId === userProfile?.intervalsAthleteId;
  const effRunFtp = typeof runFtp === "number" ? runFtp : (isCurrentUser ? (userProfile?.runFtp || 0) : 0), effBikeFtp = typeof bikeFtp === "number" ? bikeFtp : (isCurrentUser ? (userProfile?.bikeFtp || 0) : 0), effUid = uid || user?.uid || undefined;
  const effLthr = typeof lthr === "number" && lthr > 0 ? lthr : (userProfile?.lthr || 0);
  const effMaxHR = typeof maxHR === "number" && maxHR > 0 ? maxHR : (userProfile?.maxHR || 0);

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
  const isPaceAthlete =
    runningTrainingMode === "PACE" ||
    hasRunningPowerMeter === false ||
    userProfile?.runningTrainingMode === "PACE" ||
    userProfile?.hasRunningPowerMeter === false;

  const isRunPace =
    workout.discipline === "Carrera" &&
    (isPaceAthlete || effRunFtp === 0 || !workout.powerTarget || !/\b\d+\s*W\b/i.test(workout.powerTarget) || /%\s*Pace\b/i.test(workout.workoutDoc || ""));

  const isRunPower = workout.discipline === "Carrera" && !isRunPace && effRunFtp > 0;
  const isBike = workout.discipline === "Ciclismo";

  const adaptedDoc = isRunPace && workout.workoutDoc
    ? adaptRunningWorkoutDoc(workout.workoutDoc, workout.discipline, false, "PACE", workout.workoutName)
    : workout.workoutDoc;
  const parsedDoc = parseWorkoutDoc(adaptedDoc, workout.discipline);
  const plannedTss = isRunPace && parsedDoc.estimatedTss && parsedDoc.estimatedTss > (workout.tss || 0)
    ? parsedDoc.estimatedTss
    : (workout.tss || parsedDoc.estimatedTss || (workout.durationMinutes ? Math.round(workout.durationMinutes * 0.75) : 0));
  const executedTss = matchedAct ? matchedAct.tss : isExtraActivity ? (workout.tss || 0) : (modalExecuted?.totalTss || 0);
  const displayActivities = matchedAct ? [matchedAct] : (isExtraActivity && allActs.length > 0 ? [allActs[0]] : []);
  const isExecuted = displayActivities.length > 0;

  let displayTarget = workout.powerTarget;
  if (isRunPace && displayTarget) {
    displayTarget = interpolateWorkoutTarget(displayTarget, {
      discipline: "Carrera",
      mode: "PACE",
      thresholdPaceSec: thresholdPaceSec || (thresholdPaceStr ? parsePaceToSeconds(thresholdPaceStr) : 285),
    });
  } else if (isRunPower && displayTarget) {
    displayTarget = displayTarget.replace(/%\s*FTP\b/gi, "% CP");
  }

  const parseTargetWorkRange = (): TargetWorkRange | undefined => {
    let raw = displayTarget || workout.powerTarget || (workout as any).paceTarget || "";
    if (!raw && workout.workoutDoc) {
      const matchW = workout.workoutDoc.match(/(\d{2,4})\s*[-–—]\s*(\d{2,4})\s*W/i);
      if (matchW) raw = matchW[0];
      else {
        const matchP = workout.workoutDoc.match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
        if (matchP) raw = matchP[0];
        else {
          const matchSingleW = workout.workoutDoc.match(/(\d{2,4})\s*W/i);
          if (matchSingleW) raw = matchSingleW[0];
        }
      }
    }
    if (!raw) return undefined;
    const wMatch = raw.match(/(\d{2,4})\s*[-–—]\s*(\d{2,4})\s*W/i);
    if (wMatch) return { min: parseInt(wMatch[1], 10), max: parseInt(wMatch[2], 10), type: "WATTS", label: `${wMatch[1]}–${wMatch[2]} W` };
    const sMatch = raw.match(/(\d{2,4})\s*W/i);
    if (sMatch) {
      const w = parseInt(sMatch[1], 10);
      const minW = Math.round(w * 0.92), maxW = Math.round(w * 1.08);
      return { min: minW, max: maxW, type: "WATTS", label: `${minW}–${maxW} W (Obj: ${w}W)` };
    }
    const pMatch = raw.match(/(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/);
    if (pMatch) {
      const p1 = parseInt(pMatch[1], 10) * 60 + parseInt(pMatch[2], 10);
      const p2 = parseInt(pMatch[3], 10) * 60 + parseInt(pMatch[4], 10);
      return { min: Math.min(p1, p2), max: Math.max(p1, p2), type: "PACE", label: `${pMatch[1]}:${pMatch[2]}–${pMatch[3]}:${pMatch[4]} min/km` };
    }
    return undefined;
  };
  const parsedTargetRange = parseTargetWorkRange();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
      {/* Click en backdrop para cerrar */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Contenedor del Bottom Sheet Modal */}
      <div
        className={`relative w-full max-w-2xl mx-auto rounded-t-[28px] bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          sheetState === "HALF" ? "h-[54vh] max-h-[54vh]" : "h-[92vh] max-h-[92vh]"
        }`}
      >
        {/* Nivel 1: Drag handle + Cabecera minimalista + Hero KPI Cards */}
        <WorkoutBottomSheetHero
          workout={workout}
          isExtraActivity={isExtraActivity}
          executedTss={executedTss}
          plannedTss={plannedTss}
          durationMin={matchedAct?.movingTimeMin || workout.durationMinutes}
          distanceKm={matchedAct?.distanceKm}
          targetLabel={parsedTargetRange?.label || displayTarget}
          sheetState={sheetState}
          onToggleSheet={() => setSheetState(sheetState === "HALF" ? "FULL" : "HALF")}
          onClose={onClose}
        />

        {/* Nivel 3: Control Segmentado de Pestañas (Tabs) */}
        <WorkoutSegmentedTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />

        {/* Área Scrollable del Contenido del Tab Activo */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 space-y-3">
          {activeTab === "TELEMETRY" && (
            <div className="space-y-3">
              {isExecuted ? (
                displayActivities.map((rawAct, aIdx) => {
                  const act = discoveredWatts[rawAct.id] && !rawAct.watts ? { ...rawAct, watts: discoveredWatts[rawAct.id] } : rawAct;
                  return (
                    <div key={aIdx} className="space-y-3">
                      {act.id && sheetState === "FULL" && (
                        <ActivityTelemetryChart
                          activityId={act.id}
                          athleteId={effAthleteId}
                          apiKey={effApiKey}
                          email={effEmail}
                          uid={effUid}
                          targetRange={parsedTargetRange}
                          summaryStats={{
                            heartrate: act.heartrate,
                            maxHeartrate: act.maxHeartrate,
                            watts: act.watts,
                            weightedWatts: act.weightedWatts,
                            distanceKm: act.distanceKm,
                            movingTimeMin: act.movingTimeMin,
                            paceStr: act.paceStr,
                            elevationGainM: act.elevationGainM,
                          }}
                          onMetricsDiscovered={(m) => {
                            if (m.avgWatts && !rawAct.watts) setDiscoveredWatts((p) => ({ ...p, [rawAct.id]: m.avgWatts! }));
                          }}
                        />
                      )}
                      {act.id && (
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
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
                  Sesión pendiente de ejecución. Consulta la pestaña <strong>Plan</strong> para la prescripción.
                </div>
              )}
            </div>
          )}

          {activeTab === "METRICS" && (
            <div className="space-y-3">
              {isExecuted ? (
                displayActivities.map((rawAct, aIdx) => {
                  const act = discoveredWatts[rawAct.id] && !rawAct.watts ? { ...rawAct, watts: discoveredWatts[rawAct.id] } : rawAct;
                  return (
                    <ExecutedSessionMetricsTable
                      key={aIdx}
                      activity={act}
                      discipline={workout.discipline}
                      isExtraActivity={isExtraActivity}
                      executedTss={executedTss}
                      plannedTss={plannedTss}
                      weightKg={userProfile?.weightKg}
                    />
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
                  No hay datos fisiológicos registrados aún para este entrenamiento.
                </div>
              )}
            </div>
          )}

          {activeTab === "PLAN" && (
            <div className="space-y-3">
              {workout.workoutDoc && (
                <PlannedWorkoutPrescription
                  cleanDoc={sanitizeWorkoutDoc(adaptedDoc, { discipline: workout.discipline, isRunPaceOnly: isRunPace })}
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
                      <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">🧘 Movilidad & Activación</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.mobilityWarmup}</p>
                    </div>
                  )}
                  {workout.fuelingStrategy && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">⚡ Nutrición</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.fuelingStrategy}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nivel 4: Barra de Acción Fija Inferior */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          {sheetState === "HALF" ? (
            <button
              type="button"
              onClick={() => setSheetState("FULL")}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Ver Análisis Completo</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSheetState("HALF")}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Vista Resumen</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold transition cursor-pointer"
              >
                <span>Cerrar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
