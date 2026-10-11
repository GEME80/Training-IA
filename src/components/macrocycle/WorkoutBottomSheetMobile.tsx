"use client";

import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";
import { WorkoutBottomSheetHero } from "./WorkoutBottomSheetHero";
import { WorkoutSegmentedTabs } from "./WorkoutSegmentedTabs";
import { ExecutedSessionMetricsTable } from "./ExecutedSessionMetricsTable";
import { PlannedWorkoutPrescription } from "./PlannedWorkoutPrescription";
import { ActivityZoneDistribution } from "./ActivityZoneDistribution";
import { ActivityTelemetryChart } from "./ActivityTelemetryChart";
import { WorkoutDetailData } from "./useWorkoutDetailData";

interface WorkoutBottomSheetMobileProps {
  workout: PlanItem;
  detailData: WorkoutDetailData;
  onClose: () => void;
  runningTrainingMode?: "POWER" | "PACE" | "HYBRID";
  hasRunningPowerMeter?: boolean;
  thresholdPaceStr?: string;
  thresholdPaceSec?: number;
}

export const WorkoutBottomSheetMobile: React.FC<WorkoutBottomSheetMobileProps> = ({
  workout,
  detailData,
  onClose,
  runningTrainingMode,
  hasRunningPowerMeter,
  thresholdPaceStr,
  thresholdPaceSec,
}) => {
  const {
    userProfile,
    effAthleteId,
    effApiKey,
    effEmail,
    effUid,
    effRunFtp,
    effBikeFtp,
    effLthr,
    effMaxHR,
    isExtraActivity,
    matchedAct,
    displayActivities,
    isExecuted,
    isRunPace,
    isRunPower,
    isBike,
    adaptedDoc,
    plannedTss,
    executedTss,
    displayTarget,
    parsedTargetRange,
    peekProgressSummary,
    snapPoint,
    setSnapPoint,
    activeTab,
    setActiveTab,
    discoveredWatts,
    setDiscoveredWatts,
  } = detailData;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn transition-all duration-300"
      style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
    >
      {/* Backdrop click para descartar */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Contenedor Bottom Sheet Modal */}
      <div
        className={`relative w-full max-w-2xl mx-auto rounded-t-[28px] bg-white dark:bg-slate-900 border-t border-x border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-out flex flex-col ${
          snapPoint === "PEEK"
            ? "h-[345px] max-h-[360px] overflow-hidden"
            : "h-[90vh] max-h-[92vh] overflow-hidden"
        }`}
      >
        {/* Nivel 1: Cabecera, Manija táctil, 3 StatCards y Barra destacada */}
        <WorkoutBottomSheetHero
          workout={workout}
          isExtraActivity={isExtraActivity}
          executedTss={executedTss}
          plannedTss={plannedTss}
          durationMin={matchedAct?.movingTimeMin || workout.durationMinutes}
          distanceKm={matchedAct?.distanceKm}
          targetLabel={parsedTargetRange?.label || displayTarget}
          snapPoint={snapPoint}
          onToggleSnap={() => setSnapPoint(snapPoint === "PEEK" ? "EXPANDED" : "PEEK")}
          onClose={onClose}
          progressSummaryBar={peekProgressSummary}
        />

        {/* Solo en Modo EXPANDIDO (90%): Pestañas Segmentadas y Contenido Detallado */}
        {snapPoint === "EXPANDED" && (
          <>
            {/* Control Segmentado de Pestañas */}
            <WorkoutSegmentedTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />

            {/* Contenedor Scrollable de Pestañas */}
            <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 space-y-3">
              {activeTab === "RESUMEN" && (
                <div className="space-y-3">
                  {isExecuted &&
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
                    })}

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

              {activeTab === "DISTRIBUCION" && (
                <div className="space-y-3">
                  {isExecuted ? (
                    displayActivities.map((rawAct, aIdx) => {
                      const act = discoveredWatts[rawAct.id] && !rawAct.watts ? { ...rawAct, watts: discoveredWatts[rawAct.id] } : rawAct;
                      return act.id ? (
                        <ActivityZoneDistribution
                          key={aIdx}
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
                      ) : null;
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      Sesión pendiente de ejecución. Consulta la pestaña <strong>Resumen</strong> para la prescripción del plan.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "EVOLUCION" && (
                <div className="space-y-3">
                  {isExecuted ? (
                    displayActivities.map((rawAct, aIdx) => {
                      const act = discoveredWatts[rawAct.id] && !rawAct.watts ? { ...rawAct, watts: discoveredWatts[rawAct.id] } : rawAct;
                      return act.id ? (
                        <ActivityTelemetryChart
                          key={aIdx}
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
                      ) : null;
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      Gráfica de series temporales no disponible para sesiones planificadas aún no ejecutadas.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Sticky Footer CTA con Safe Area Inset Support */}
        <div
          className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
          style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
        >
          {snapPoint === "PEEK" ? (
            <button
              type="button"
              onClick={() => {
                setSnapPoint("EXPANDED");
                setActiveTab("RESUMEN");
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20 active:scale-[0.99]"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Ver Análisis Completo</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSnapPoint("PEEK")}
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
