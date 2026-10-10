"use client";

import React, { useState } from "react";
import { MacrocycleBlueprint, MacrocycleWeek, MicrocycleType } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, PlanItem } from "@/lib/gemini/engine";
import { MacrocycleDistanceType } from "@/lib/physiology/macrocycleLibrary";
import { DailyExecutedMap } from "@/lib/intervals/types";

import { MacrocycleTimelineBar } from "./macrocycle/MacrocycleTimelineBar";
import { MacrocycleActiveWeekWorkspace } from "./macrocycle/MacrocycleActiveWeekWorkspace";
import { WorkoutDetailModal } from "./macrocycle/WorkoutDetailModal";

interface MacrocyclePreviewTimelineProps {
  blueprint: MacrocycleBlueprint;
  runFtp?: number;
  bikeFtp?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  distanceType?: MacrocycleDistanceType;
  selectedWeekIndex?: number;
  executedTss?: number;
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectWeek?: (weekIndex: number) => void;
  onJumpToMicrocycle?: (weekOffset: number, weekPlan: PlanItem[]) => void;
  onRecalibrateWeekWithAI?: (weekOffset: number, weekPlan: PlanItem[]) => void;
  onUpdateWeekMicrocycle?: (weekIndex: number, newMicrocycleType: MicrocycleType) => void;
  onOpenCoachChat?: () => void;
  onSyncFullMacrocycle?: () => Promise<void>;
  onSyncTriweeklyBlock?: (startIdx?: number) => Promise<void>;
  isCompact?: boolean;
}

export const MacrocyclePreviewTimeline: React.FC<MacrocyclePreviewTimelineProps> = ({
  blueprint,
  runFtp,
  bikeFtp,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType,
  selectedWeekIndex: externalSelectedIndex,
  executedTss = 0,
  dailyExecutedActivities = {},
  onSelectWeek,
  onRecalibrateWeekWithAI,
  onOpenCoachChat,
  onSyncFullMacrocycle,
  onSyncTriweeklyBlock,
}) => {
  const effRunFtp = runFtp ?? blueprint.runFtpAtCreation ?? 0;
  const effBikeFtp = bikeFtp ?? blueprint.bikeFtpAtCreation ?? 0;
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(blueprint.currentWeekIndex || 0);
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PlanItem | null>(null);

  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const handleSelectWeek = (idx: number) => {
    setInternalSelectedIndex(idx);
    if (onSelectWeek) onSelectWeek(idx);
  };

  const weeks = blueprint.weeks || [];
  const selectedWeek = weeks[selectedIndex];
  const effAvailability = (blueprint?.availabilitySnapshot as any) || weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY;
  const runningMode = blueprint.runningTrainingMode || (effRunFtp > 0 ? "POWER" : "PACE");
  const runningOpts = {
    mode: runningMode,
    raceGoal: blueprint.primaryRace?.goalTarget,
  };
  const selectedWeekPlan = selectedWeek
    ? generateWeekTemplate(
        selectedWeek, effRunFtp, effBikeFtp, effAvailability,
        distanceType || (blueprint.distanceType as any), blueprint.athleteCtlAtCreation,
        blueprint.primaryRace?.date || blueprint.raceDate || undefined,
        runningOpts
      )
    : [];

  const getOffsetForWeek = (w: MacrocycleWeek): number => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const todayMonday = new Date(now.setDate(diff));
    todayMonday.setHours(0, 0, 0, 0);

    const weekMon = new Date(w.startDate + "T00:00:00");
    const diffTime = weekMon.getTime() - todayMonday.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  if (!weeks.length) return null;

  return (
    <div id="macrocycle-timeline-section" className="space-y-4 animate-fadeIn">
      {/* 1. Barra de Línea de Tiempo Condensada */}
      <MacrocycleTimelineBar
        blueprint={blueprint}
        selectedIndex={selectedIndex}
        onSelectWeek={handleSelectWeek}
        onSyncFullMacrocycle={onSyncFullMacrocycle}
        onSyncTriweeklyBlock={onSyncTriweeklyBlock}
      />

      {/* 2. Espacio de Trabajo de la Semana Activa */}
      {selectedWeek && (
        <MacrocycleActiveWeekWorkspace
          blueprint={blueprint}
          selectedWeek={selectedWeek}
          selectedIndex={selectedIndex}
          weeksCount={weeks.length}
          selectedWeekPlan={selectedWeekPlan}
          runFtp={effRunFtp}
          bikeFtp={effBikeFtp}
          executedTss={executedTss}
          dailyExecutedActivities={dailyExecutedActivities}
          onOpenCoachWithPlan={() => {
            const offset = getOffsetForWeek(selectedWeek);
            const plan = selectedWeekPlan;
            if (onRecalibrateWeekWithAI) {
              onRecalibrateWeekWithAI(offset, plan);
            } else if (onOpenCoachChat) {
              onOpenCoachChat();
            }
          }}
          onSelectWorkoutModal={(item) => setSelectedWorkoutModal(item)}
        />
      )}

      {/* 3. Modal Limpio de Detalle de Sesión / Prescripción Stryd */}
      <WorkoutDetailModal
        workout={selectedWorkoutModal}
        dailyExecutedActivities={dailyExecutedActivities}
        runFtp={effRunFtp}
        bikeFtp={effBikeFtp}
        runningTrainingMode={(blueprint as any)?.athleteMetrics?.runningTrainingMode || (blueprint as any)?.runningTrainingMode}
        hasRunningPowerMeter={(blueprint as any)?.athleteMetrics?.hasRunningPowerMeter}
        thresholdPaceStr={(blueprint as any)?.athleteMetrics?.runThresholdPaceStr}
        thresholdPaceSec={(blueprint as any)?.athleteMetrics?.runThresholdPaceSecPerKm}
        lthr={(blueprint as any)?.athleteMetrics?.lthr}
        maxHR={(blueprint as any)?.athleteMetrics?.maxHR}
        onClose={() => setSelectedWorkoutModal(null)}
      />
    </div>
  );
};
