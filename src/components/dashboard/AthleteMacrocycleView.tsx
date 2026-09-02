"use client";

import React from "react";
import {
  SeasonPlanItem,
  TargetRace,
  MacrocyclePhaseInfo,
  MacrocycleWeek,
  MacrocycleBlueprint,
  MicrocycleType,
} from "@/lib/physiology/macrocycle";
import { WeeklyAvailabilityMap, PlanItem } from "@/lib/gemini/engine";
import { MacrocycleDistanceType } from "@/lib/physiology/macrocycleLibrary";
import { DailyExecutedMap } from "@/lib/intervals/types";

import { AthleteHeroBanner } from "./AthleteHeroBanner";
import { MacrocyclePreviewTimeline } from "../MacrocyclePreviewTimeline";

interface AthleteMacrocycleViewProps {
  seasonPlans: SeasonPlanItem[];
  currentlyViewedPlan: SeasonPlanItem | null;
  activePlanItem: SeasonPlanItem | null;
  upcomingPlanItem: SeasonPlanItem | null;
  primaryARace: TargetRace | null;
  primaryRace: TargetRace | null;
  blueprint: MacrocycleBlueprint;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  selectedMacroWeekIdx: number;
  weeks: MacrocycleWeek[];
  selectedWeek: MacrocycleWeek | undefined;
  isSyncing: boolean;
  runFtp?: number;
  bikeFtp?: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  distanceType?: MacrocycleDistanceType;
  weeklyExecutedTss?: number;
  dailyExecutedActivities?: DailyExecutedMap;
  onSelectPlan: (planId: string, weekIdx: number) => void;
  onOpenSeasonStudio: () => void;
  onSyncFullMacrocycle: () => void;
  onOpenAICoachSession: () => void;
  onSelectWeek: (idx: number) => void;
  onJumpToMicrocycle?: (weekOffset: number, weekPlan: PlanItem[]) => void;
  onRecalibrateWeekWithAI?: (weekOffset: number, weekPlan: PlanItem[]) => void;
  onUpdateWeekMicrocycle?: (weekIndex: number, newType: MicrocycleType) => void;
}

export const AthleteMacrocycleView: React.FC<AthleteMacrocycleViewProps> = ({
  seasonPlans,
  currentlyViewedPlan,
  activePlanItem,
  upcomingPlanItem,
  primaryARace,
  primaryRace,
  blueprint,
  macrocyclePhase,
  selectedMacroWeekIdx,
  weeks,
  selectedWeek,
  isSyncing,
  runFtp = 285,
  bikeFtp = 260,
  weeklyAvailability,
  distanceType,
  weeklyExecutedTss = 0,
  dailyExecutedActivities = {},
  onSelectPlan,
  onOpenSeasonStudio,
  onSyncFullMacrocycle,
  onOpenAICoachSession,
  onSelectWeek,
  onJumpToMicrocycle,
  onRecalibrateWeekWithAI,
  onUpdateWeekMicrocycle,
}) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. HERO CARD DE TEMPORADA & ROADMAP */}
      <AthleteHeroBanner
        seasonPlans={seasonPlans}
        currentlyViewedPlan={currentlyViewedPlan}
        activePlanItem={activePlanItem}
        upcomingPlanItem={upcomingPlanItem}
        primaryARace={primaryARace}
        primaryRace={primaryRace}
        blueprint={blueprint}
        macrocyclePhase={macrocyclePhase}
        selectedMacroWeekIdx={selectedMacroWeekIdx}
        weeks={weeks}
        selectedWeek={selectedWeek}
        isSyncing={isSyncing}
        onSelectPlan={onSelectPlan}
        onOpenSeasonStudio={onOpenSeasonStudio}
        onSyncFullMacrocycle={onSyncFullMacrocycle}
        onOpenAICoachSession={onOpenAICoachSession}
      />

      {/* 2. LÍNEA DE TIEMPO DEL MACROCICLO (16 SEMANAS) & ESPACIO DE TRABAJO */}
      <MacrocyclePreviewTimeline
        blueprint={blueprint}
        runFtp={runFtp}
        bikeFtp={bikeFtp}
        weeklyAvailability={weeklyAvailability}
        distanceType={distanceType}
        selectedWeekIndex={selectedMacroWeekIdx}
        executedTss={weeklyExecutedTss}
        dailyExecutedActivities={dailyExecutedActivities}
        onSelectWeek={onSelectWeek}
        onJumpToMicrocycle={onJumpToMicrocycle}
        onRecalibrateWeekWithAI={onRecalibrateWeekWithAI}
        onUpdateWeekMicrocycle={onUpdateWeekMicrocycle}
        onOpenCoachChat={onOpenAICoachSession}
        onSyncFullMacrocycle={async () => onSyncFullMacrocycle()}
      />
    </div>
  );
};
