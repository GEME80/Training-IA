"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { PlanItem } from "@/lib/gemini/engine";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";
import { StatCard } from "./StatCard";
import { getDisciplineIcon, getDisciplineBadgeClass } from "./WorkoutBottomSheetHero";
import { WorkoutSegmentedTabs } from "./WorkoutSegmentedTabs";
import { ExecutedSessionMetricsTable } from "./ExecutedSessionMetricsTable";
import { PlannedWorkoutPrescription } from "./PlannedWorkoutPrescription";
import { ActivityZoneDistribution } from "./ActivityZoneDistribution";
import { ActivityTelemetryChart } from "./ActivityTelemetryChart";
import { WorkoutDetailData } from "./useWorkoutDetailData";
import { formatDuration } from "@/lib/utils/formatters";

interface WorkoutDialogDesktopProps {
  workout: PlanItem;
  detailData: WorkoutDetailData;
  onClose: () => void;
  runningTrainingMode?: "POWER" | "PACE" | "HYBRID";
  hasRunningPowerMeter?: boolean;
  thresholdPaceStr?: string;
  thresholdPaceSec?: number;
}

export const WorkoutDialogDesktop: React.FC<WorkoutDialogDesktopProps> = ({
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
    compliancePercent,
    activeTab,
    setActiveTab,
    discoveredWatts,
    setDiscoveredWatts,
  } = detailData;

  // Cierre accesible con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isMultisportTriathlon =
    workout.activityType === "Triatlón" ||
    workout.activityType === "Triatlon" ||
    (workout.discipline as string) === "Triatlón" ||
    (workout.discipline as string) === "Triatlon" ||
    /sector 1:\s*nataci/i.test(workout.workoutDoc || "");
  const effectiveDiscipline = isMultisportTriathlon ? "Triatlón" : workout.discipline;
  const icon = getDisciplineIcon(effectiveDiscipline);
  const badgeClass = getDisciplineBadgeClass(effectiveDiscipline);
  const durationMin = matchedAct?.movingTimeMin || workout.durationMinutes;
  const distanceKm = matchedAct?.distanceKm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Contenedor Modal Centrado */}
      <div
        className="relative w-full max-w-4xl max-h-[86vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Desktop: Icono + Título + Metadata + Botón Cerrar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${badgeClass} shrink-0`}>
                  {isExtraActivity ? "Extra" : effectiveDiscipline}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-[360px] sm:max-w-[500px]">
                  {workout.workoutName.replace(/\[.*?\]\s*/g, "")}
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate">
                {workout.day} • {workout.formattedDate || workout.date} {durationMin ? `• ${formatDuration(durationMin)}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. KPIs Maestros: Grid Horizontal 3 StatCards */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <StatCard
            label="Carga TSS"
            value={executedTss !== undefined ? `⚡ ${executedTss}` : "—"}
            subValue={plannedTss ? `Plan: ${plannedTss} TSS` : undefined}
            badge={compliancePercent ? { text: `${compliancePercent}%`, variant: compliancePercent >= 90 ? "success" : "warning" } : undefined}
            highlightColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="Eficacia"
            value={parsedTargetRange?.label || displayTarget || "Z2 Fondo"}
            subValue="Objetivo"
            badge={{ text: "Óptimo", variant: "info" }}
            highlightColor="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            label="Volumen"
            value={durationMin ? formatDuration(durationMin, { compact: true }) : "—"}
            subValue={distanceKm ? `${distanceKm.toFixed(1)} km` : "Tiempo"}
            badge={{ text: "General", variant: "neutral" }}
            highlightColor="text-slate-900 dark:text-white"
          />
        </div>

        {/* 3. Control Segmentado de Pestañas */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <WorkoutSegmentedTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />
        </div>

        {/* 4. Cuerpo Scrollable de la Pestaña Activa */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "RESUMEN" && (
            <div className="space-y-4">
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
                  workoutName={workout.workoutName}
                  activityType={workout.activityType}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {!isExecuted && workout.mobilityWarmup && (
                    <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 p-3 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">🧘 Movilidad & Activación</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.mobilityWarmup}</p>
                    </div>
                  )}
                  {workout.fuelingStrategy && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-3 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">⚡ Nutrición</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{workout.fuelingStrategy}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "DISTRIBUCION" && (
            <div className="space-y-4">
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
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
                  Sesión pendiente de ejecución. Consulta la pestaña <strong>Resumen</strong> para la prescripción del plan.
                </div>
              )}
            </div>
          )}

          {activeTab === "EVOLUCION" && (
            <div className="space-y-4">
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
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-medium">
                  Gráfica de series temporales no disponible para sesiones planificadas aún no ejecutadas.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Footer Desktop Sutil */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white/95 dark:bg-slate-900/95 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
