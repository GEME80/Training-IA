"use client";

import React from "react";
import { AthleteDashboardOverview } from "./AthleteDashboardOverview";
import { AthleteSeasonStudioView } from "./AthleteSeasonStudioView";
import { AthleteHeadCoachView } from "./AthleteHeadCoachView";
import { AthletePhysiologyView } from "./AthletePhysiologyView";
import { AthleteSidebarNavSection } from "./AthleteSidebar";
import { PlanItem } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";

interface AthleteDashboardViewRouterProps {
  activeNavSection: AthleteSidebarNavSection;
  telemetry: any;
  season: any;
  sync: any;
  user: any;
  userProfile: any;
  displayName: string;
  activePlan: PlanItem[];
  setActivePlan: (plan: PlanItem[]) => void;
  onSelectWorkoutModal: (item: PlanItem) => void;
  onNavigateTo: (section: AthleteSidebarNavSection) => void;
  onLiveConnectedChange?: (connected: boolean) => void;
  userStorage: any;
}

export const AthleteDashboardViewRouter: React.FC<AthleteDashboardViewRouterProps> = ({
  activeNavSection,
  telemetry,
  season,
  sync,
  user,
  userProfile,
  displayName,
  activePlan,
  setActivePlan,
  onSelectWorkoutModal,
  onNavigateTo,
  onLiveConnectedChange,
  userStorage,
}) => {
  if (activeNavSection === "dashboard") {
    return (
      <AthleteDashboardOverview
        physioStatus={telemetry.physioStatus}
        profile={telemetry.profile}
        latestWellness={telemetry.latestWellness}
        visibleMetrics={telemetry.visibleMetrics}
        onToggleMetric={telemetry.handleToggleMetric}
        blueprint={season.blueprint}
        selectedMacroWeekIdx={season.selectedMacroWeekIdx}
        onSelectWeek={season.setSelectedMacroWeekIdx}
        weeklyAvailability={season.weeklyAvailability}
        weeklyExecutedTss={telemetry.weeklyExecutedTss}
        dailyExecutedActivities={telemetry.dailyExecutedActivities}
        onOpenAICoach={(idx) => {
          if (typeof idx === "number") season.setSelectedMacroWeekIdx(idx);
          onNavigateTo("head_coach");
        }}
        onSyncWeekToIntervals={sync.handleSyncToIntervals}
        onSelectWorkoutModal={onSelectWorkoutModal}
        onOpenSeasonStudio={() => onNavigateTo("season_studio")}
      />
    );
  }

  if (activeNavSection === "season_studio") {
    return (
      <AthleteSeasonStudioView
        athleteId={telemetry.profile.id}
        runFtp={telemetry.profile.run_ftp || 0}
        bikeFtp={telemetry.profile.bike_ftp || 0}
        lthr={telemetry.profile.lthr || 0}
        ctl={telemetry.physioStatus?.ctl || telemetry.profile.ctl || 0}
        weeklyAvailability={season.weeklyAvailability}
        targetRaces={season.targetRaces}
        seasonPlans={season.seasonPlans}
        onSaveTargetRaces={season.handleSaveTargetRaces}
        onSaveSeasonPlans={season.handleSaveSeasonPlans}
        onDeleteActivePlan={season.handleDeleteActivePlan}
        onApplyPlan={(newBlueprint, options) =>
          season.handleApplyMacrocycle(newBlueprint, undefined, "WIZARD_CUSTOM", options)
        }
        onNavigateToDashboard={() => onNavigateTo("dashboard")}
        onOpenHeadCoach={() => onNavigateTo("head_coach")}
      />
    );
  }

  if (activeNavSection === "head_coach") {
    return (
      <AthleteHeadCoachView
        profile={telemetry.profile}
        physioStatus={telemetry.physioStatus}
        macrocyclePhase={season.macrocyclePhase}
        blueprint={season.blueprint}
        weekOffset={season.weekOffset}
        weekNumber={season.calculatedWeekNumber}
        apiKey={telemetry.apiKeyCache}
        geminiApiKey={telemetry.geminiKeyCache}
        selectedModel="gemini-2.5-flash"
        temperature={0.0}
        weeklyAvailability={season.weeklyAvailability}
        uid={user?.uid}
        email={user?.email || userProfile?.email}
        dailyExecutedActivities={telemetry.dailyExecutedActivities}
        currentPlan={
          activePlan.length > 0
            ? activePlan
            : season.selectedWeek
            ? generateWeekTemplate(
                season.selectedWeek,
                telemetry.profile.run_ftp,
                telemetry.profile.bike_ftp,
                (season.macrocyclePhase?.blueprint?.availabilitySnapshot as any) || season.weeklyAvailability,
                (season.macrocyclePhase?.blueprint?.distanceType || season.primaryRace?.distance) as any,
                telemetry.profile.ctl
              )
            : []
        }
        onApplyPlanAndSync={async (plan) => {
          if (plan) await sync.handleSyncToIntervals(plan);
        }}
        onPlanUpdate={(plan) => setActivePlan(plan)}
      />
    );
  }

  if (activeNavSection === "physiology") {
    return (
      <AthletePhysiologyView
        athleteId={telemetry.profile.id}
        athleteName={displayName}
        email={user?.email || userProfile?.email || ""}
        runFtp={telemetry.profile.run_ftp || 0}
        bikeFtp={telemetry.profile.bike_ftp || 0}
        weightKg={telemetry.profile.weight}
        heightCm={telemetry.profile.heightCm}
        birthDate={telemetry.profile.birthDate}
        gender={telemetry.profile.gender}
        restingHR={telemetry.profile.restingHR}
        lthr={telemetry.profile.lthr}
        maxHR={telemetry.profile.maxHR}
        apiKey={telemetry.apiKeyCache}
        ctl={telemetry.physioStatus?.ctl || telemetry.profile.ctl || 0}
        atl={telemetry.physioStatus?.atl || telemetry.profile.atl || 0}
        tsb={telemetry.physioStatus?.tsb || telemetry.profile.tsb || 0}
        weeklyAvailability={season.weeklyAvailability}
        visibleMetrics={telemetry.visibleMetrics}
        isLiveConnected={telemetry.isLiveConnected}
        onTestConnection={async (testAthleteId) => {
          const activeApiKey = telemetry.apiKeyCache || userStorage.getItem("intervals_api_key") || "";
          const res = await fetch("/api/test-connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              athleteId: testAthleteId || telemetry.profile.id,
              apiKey: activeApiKey,
              uid: user?.uid,
              email: user?.email || userProfile?.email || "",
            }),
          });
          const data = await res.json();
          if (data.success) {
            telemetry.setIsLiveConnected(true);
            if (onLiveConnectedChange) onLiveConnectedChange(true);
            await telemetry.refreshTelemetry(
              testAthleteId || telemetry.profile.id,
              telemetry.apiKeyCache,
              data.runFtp || telemetry.profile.run_ftp,
              data.bikeFtp || telemetry.profile.bike_ftp
            );
          }
          return data;
        }}
        onSave={telemetry.handleSaveSettings}
      />
    );
  }

  return null;
};
