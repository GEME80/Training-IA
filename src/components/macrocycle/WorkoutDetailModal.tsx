"use client";

import React, { useState, useEffect } from "react";
import { PlanItem } from "@/lib/gemini/engine";
import { DailyExecutedMap } from "@/lib/intervals/types";
import { useWorkoutDetailData } from "./useWorkoutDetailData";
import { WorkoutBottomSheetMobile } from "./WorkoutBottomSheetMobile";
import { WorkoutDialogDesktop } from "./WorkoutDialogDesktop";

export interface WorkoutDetailModalProps {
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

function useIsDesktop(breakpoint = 768): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isDesktop;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = (props) => {
  const { workout, onClose, runningTrainingMode, hasRunningPowerMeter, thresholdPaceStr, thresholdPaceSec } = props;
  const isDesktop = useIsDesktop(768);
  const detailData = useWorkoutDetailData(props);

  if (!workout || !detailData) return null;

  if (isDesktop) {
    return (
      <WorkoutDialogDesktop
        workout={workout}
        detailData={detailData}
        onClose={onClose}
        runningTrainingMode={runningTrainingMode}
        hasRunningPowerMeter={hasRunningPowerMeter}
        thresholdPaceStr={thresholdPaceStr}
        thresholdPaceSec={thresholdPaceSec}
      />
    );
  }

  return (
    <WorkoutBottomSheetMobile
      workout={workout}
      detailData={detailData}
      onClose={onClose}
      runningTrainingMode={runningTrainingMode}
      hasRunningPowerMeter={hasRunningPowerMeter}
      thresholdPaceStr={thresholdPaceStr}
      thresholdPaceSec={thresholdPaceSec}
    />
  );
};
