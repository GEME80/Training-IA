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
  isCompact?: boolean;
}

export const MacrocyclePreviewTimeline: React.FC<MacrocyclePreviewTimelineProps> = ({
  blueprint,
  runFtp = 285,
  bikeFtp = 260,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  distanceType,
  selectedWeekIndex: externalSelectedIndex,
  executedTss = 0,
  dailyExecutedActivities = {},
  onSelectWeek,
  onRecalibrateWeekWithAI,
  onOpenCoachChat,
  onSyncFullMacrocycle,
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number>(blueprint.currentWeekIndex || 0);
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PlanItem | null>(null);

  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const handleSelectWeek = (idx: number) => {
    setInternalSelectedIndex(idx);
    if (onSelectWeek) onSelectWeek(idx);
  };

  const weeks = blueprint.weeks || [];
  const selectedWeek: MacrocycleWeek = weeks[selectedIndex] || weeks[0];
  const selectedWeekPlan = selectedWeek
    ? generateWeekTemplate(selectedWeek, runFtp, bikeFtp, weeklyAvailability, distanceType)
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
      />

      {/* 2. Espacio de Trabajo de la Semana Activa */}
      {selectedWeek && (
        <MacrocycleActiveWeekWorkspace
          blueprint={blueprint}
          selectedWeek={selectedWeek}
          selectedIndex={selectedIndex}
          weeksCount={weeks.length}
          selectedWeekPlan={selectedWeekPlan}
          runFtp={runFtp}
          bikeFtp={bikeFtp}
          executedTss={executedTss}
          dailyExecutedActivities={dailyExecutedActivities}
          onOpenCoachWithPlan={() => {
            const offset = getOffsetForWeek(selectedWeek);
            const plan = generateWeekTemplate(selectedWeek, runFtp, bikeFtp, weeklyAvailability, distanceType);
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
        onClose={() => setSelectedWorkoutModal(null)}
      />
    </div>
  );
};
