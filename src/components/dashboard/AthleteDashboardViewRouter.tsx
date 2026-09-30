"use client";

import React from "react";
import { AthleteDashboardOverview } from "./AthleteDashboardOverview";
import { AthleteSeasonStudioView } from "./AthleteSeasonStudioView";
import { AthleteHeadCoachView } from "./AthleteHeadCoachView";
import { AthletePhysiologyView } from "./AthletePhysiologyView";
import { AthleteSidebarNavSection } from "./AthleteSidebar";
import { PlanItem, resolveEffectiveAvailability } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { hydrateWeekPlanFromEvents } from "@/lib/intervals/calendarHydration";

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
  isReadOnly?: boolean;
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
  isReadOnly = false,
}) => {
  if (activeNavSection === "dashboard") {
    return (
      <AthleteDashboardOverview
        physioStatus={telemetry.physioStatus}
        profile={telemetry.profile}
        latestWellness={telemetry.latestWellness}
        wellnessHistory={telemetry.wellnessHistory}
        visibleMetrics={telemetry.visibleMetrics}
        onToggleMetric={telemetry.handleToggleMetric}
        blueprint={season.blueprint}
        selectedMacroWeekIdx={season.selectedMacroWeekIdx}
        onSelectWeek={season.setSelectedMacroWeekIdx}
        weeklyAvailability={season.weeklyAvailability}
        weeklyExecutedTss={telemetry.weeklyExecutedTss}
        dailyExecutedActivities={telemetry.dailyExecutedActivities}
        calendarEvents={telemetry.calendarEvents}
        onOpenAICoach={(idx) => {
          if (typeof idx === "number") season.setSelectedMacroWeekIdx(idx);
          onNavigateTo("head_coach");
        }}
        onSyncWeekToIntervals={sync.handleSyncToIntervals}
        onSyncTriweeklyBlock={(startIdx) =>
          sync.handleSyncTriweeklyBlockToIntervals(
            season.blueprint,
            season.weeklyAvailability,
            season.primaryRace,
            startIdx
          )
        }
        onSelectWorkoutModal={onSelectWorkoutModal}
        onOpenSeasonStudio={() => onNavigateTo("season_studio")}
        onRefreshTelemetry={() =>
          telemetry.refreshTelemetry(
            telemetry.profile.id,
            telemetry.apiKeyCache,
            telemetry.profile.run_ftp,
            telemetry.profile.bike_ftp,
            true
          )
        }
        isRefreshingTelemetry={telemetry.isRefreshingTelemetry}
      />
    );
  }

  if (activeNavSection === "season_studio") {
    const handlePersistAvailability = async (newMap: Record<string, string[]>) => {
      try {
        season.setWeeklyAvailability(newMap as any);
        userStorage.setJSON("weekly_availability", newMap);
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user?.uid || "",
            email: user?.email || userProfile?.email || "",
            weeklyAvailability: newMap,
          }),
        });
      } catch { /* silent fail — localStorage already saved */ }
    };
    return (
      <AthleteSeasonStudioView
        athleteId={telemetry.profile.id}
        runFtp={telemetry.profile.run_ftp || 0}
        bikeFtp={telemetry.profile.bike_ftp || 0}
        lthr={telemetry.profile.lthr || 0}
        ctl={telemetry.physioStatus?.ctl || telemetry.profile.ctl || 0}
        weightKg={telemetry.profile.weight}
        heightCm={telemetry.profile.heightCm}
        birthDate={telemetry.profile.birthDate}
        gender={telemetry.profile.gender}
        restingHR={telemetry.profile.restingHR}
        maxHR={telemetry.profile.maxHR}
        weeklyAvailability={season.weeklyAvailability}
        historicalMetrics={telemetry.historicalSummary}
        targetRaces={season.targetRaces}
        seasonPlans={season.seasonPlans}
        onSaveTargetRaces={season.handleSaveTargetRaces}
        onSaveSeasonPlans={season.handleSaveSeasonPlans}
        onDeleteActivePlan={season.handleDeleteActivePlan}
        onApplyPlan={(newBlueprint, options) =>
          season.handleApplyMacrocycle(newBlueprint, undefined, "WIZARD_CUSTOM", options)
        }
        onPersistAvailability={handlePersistAvailability}
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
            ? hydrateWeekPlanFromEvents(
                season.selectedWeek,
                generateWeekTemplate(
                  season.selectedWeek,
                  telemetry.profile.run_ftp,
                  telemetry.profile.bike_ftp,
                  resolveEffectiveAvailability((season.macrocyclePhase?.blueprint?.availabilitySnapshot as any) || season.weeklyAvailability),
                  (season.macrocyclePhase?.blueprint?.distanceType || season.primaryRace?.distance) as any,
                  telemetry.profile.ctl
                ),
                telemetry.calendarEvents
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
    const suggestedBikeFtp = telemetry.recentFtpCalibration ? {
      id: telemetry.recentFtpCalibration.activityId || "bike-ftp",
      metric: "BIKE_FTP" as const,
      activityName: telemetry.recentFtpCalibration.activityName || "Test FTP Ciclismo",
      date: telemetry.recentFtpCalibration.date,
      currentValue: `${telemetry.recentFtpCalibration.previousFtp}W`,
      suggestedValue: `${telemetry.recentFtpCalibration.newFtp}W`,
      deltaLabel: `${telemetry.recentFtpCalibration.deltaWatts > 0 ? "+" : ""}${telemetry.recentFtpCalibration.deltaWatts}W`,
      message: telemetry.recentFtpCalibration.message,
    } : null;

    const suggestedRunPace = telemetry.recentPaceCalibration ? {
      id: telemetry.recentPaceCalibration.activityId || "run-pace",
      metric: "RUN_PACE" as const,
      activityName: telemetry.recentPaceCalibration.activityName || "Test Ritmo Running",
      date: telemetry.recentPaceCalibration.date,
      currentValue: telemetry.recentPaceCalibration.previousPaceStr,
      suggestedValue: telemetry.recentPaceCalibration.newPaceStr,
      deltaLabel: `${(telemetry.recentPaceCalibration.deltaSec ?? 0) < 0 ? "" : "+"}${telemetry.recentPaceCalibration.deltaSec ?? 0}s/km`,
      message: telemetry.recentPaceCalibration.message,
    } : null;

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
        hasRunningPowerMeter={telemetry.profile.hasRunningPowerMeter}
        runningTrainingMode={telemetry.profile.runningTrainingMode}
        runThresholdPaceStr={telemetry.profile.runThresholdPaceStr}
        runThresholdPaceSecPerKm={telemetry.profile.runThresholdPaceSecPerKm}
        apiKey={telemetry.apiKeyCache}
        ctl={telemetry.physioStatus?.ctl || telemetry.profile.ctl || 0}
        atl={telemetry.physioStatus?.atl || telemetry.profile.atl || 0}
        tsb={telemetry.physioStatus?.tsb || telemetry.profile.tsb || 0}
        weeklyAvailability={season.weeklyAvailability}
        visibleMetrics={telemetry.visibleMetrics}
        isLiveConnected={telemetry.isLiveConnected}
        suggestedBikeFtp={suggestedBikeFtp}
        suggestedRunPace={suggestedRunPace}
        onApplySuggestion={async (sug) => {
          if (sug.metric === "BIKE_FTP") {
            const numVal = parseInt(String(sug.suggestedValue), 10);
            await telemetry.handleSaveSettings({ bikeFtp: numVal });
            telemetry.setRecentFtpCalibration(null);
          } else if (sug.metric === "RUN_PACE") {
            await telemetry.handleSaveSettings({ runThresholdPaceStr: String(sug.suggestedValue) });
            telemetry.setRecentPaceCalibration(null);
          }
        }}
        onDismissSuggestion={(sug) => {
          if (sug.metric === "BIKE_FTP") telemetry.setRecentFtpCalibration(null);
          if (sug.metric === "RUN_PACE") telemetry.setRecentPaceCalibration(null);
        }}
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
        onUpdateAvailability={async (newMap) => {
          season.setWeeklyAvailability(newMap);
          userStorage.setJSON("weekly_availability", newMap);
          await telemetry.handleSaveSettings({ weeklyAvailability: newMap });
        }}
      />
    );
  }

  return null;
};
