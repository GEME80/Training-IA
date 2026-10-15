"use client";

import React, { useState } from "react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap, DailyExecutedActivity } from "@/lib/intervals/types";
import { useAuth } from "@/context/AuthContext";
import { parseWorkoutDoc } from "../WorkoutChart";
import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";
import { TargetWorkRange } from "./ActivityTelemetryChart";
import { SheetSnapPoint } from "./WorkoutBottomSheetHero";
import { WorkoutModalTab } from "./WorkoutSegmentedTabs";
import { MetricBar } from "./MetricBar";
import { parsePaceToSeconds, interpolateWorkoutTarget, adaptRunningWorkoutDoc } from "@/lib/physiology/runningWorkoutAdapter";

export interface WorkoutDetailHookProps {
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

export function useWorkoutDetailData(props: WorkoutDetailHookProps) {
  const {
    workout, dailyExecutedActivities, athleteId, apiKey, uid, email, runFtp, bikeFtp,
    runningTrainingMode, hasRunningPowerMeter, thresholdPaceStr, thresholdPaceSec, lthr, maxHR,
  } = props;

  const { user, userProfile } = useAuth();
  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>("EXPANDED");
  const [activeTab, setActiveTab] = useState<WorkoutModalTab>("RESUMEN");
  const [discoveredWatts, setDiscoveredWatts] = useState<Record<string, number>>({});

  if (!workout) {
    return null;
  }

  const effAthleteId = athleteId || userProfile?.intervalsAthleteId;
  const effApiKey = apiKey || (userProfile as any)?.intervalsApiKey;
  const effEmail = email || user?.email || undefined;
  const isCurrentUser = !athleteId || athleteId === userProfile?.intervalsAthleteId;
  const effRunFtp = typeof runFtp === "number" ? runFtp : (isCurrentUser ? (userProfile?.runFtp || 0) : 0);
  const effBikeFtp = typeof bikeFtp === "number" ? bikeFtp : (isCurrentUser ? (userProfile?.bikeFtp || 0) : 0);
  const effUid = uid || user?.uid || undefined;
  const effLthr = typeof lthr === "number" && lthr > 0 ? lthr : (userProfile?.lthr || 0);
  const effMaxHR = typeof maxHR === "number" && maxHR > 0 ? maxHR : (userProfile?.maxHR || 0);

  const isExtraActivity = workout.id?.startsWith("extra-");
  const modalExecuted = dailyExecutedActivities?.[workout.date];
  const allActs = modalExecuted?.activities || [];

  const findMatchingActivity = (): DailyExecutedActivity | null => {
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

  const adaptedDoc = isRunPace && workout.workoutDoc ? adaptRunningWorkoutDoc(workout.workoutDoc, workout.discipline, false, "PACE", workout.workoutName) : workout.workoutDoc;
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
    displayTarget = interpolateWorkoutTarget(displayTarget, {
      discipline: "Carrera",
      mode: "POWER",
      runFtp: effRunFtp,
    });
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
      return { min: Math.round(w * 0.92), max: Math.round(w * 1.08), type: "WATTS", label: `${Math.round(w * 0.92)}–${Math.round(w * 1.08)} W (Obj: ${w}W)` };
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

  const compliancePercent = executedTss && plannedTss && plannedTss > 0
    ? Math.min(100, Math.round((executedTss / plannedTss) * 100))
    : 100;

  const peekProgressSummary = (
    <MetricBar
      label={parsedTargetRange?.label ? `Zona Objetivo: ${parsedTargetRange.label}` : "Cumplimiento de Sesión"}
      percent={compliancePercent}
      valueText={matchedAct?.movingTimeMin ? `${Math.round(matchedAct.movingTimeMin)}m` : `${workout.durationMinutes || 45}m`}
      barColor="#a855f7"
      isDominant
    />
  );

  return {
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
    modalExecuted,
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
    peekProgressSummary,
    snapPoint,
    setSnapPoint,
    activeTab,
    setActiveTab,
    discoveredWatts,
    setDiscoveredWatts,
  };
}

export type WorkoutDetailData = NonNullable<ReturnType<typeof useWorkoutDetailData>>;
