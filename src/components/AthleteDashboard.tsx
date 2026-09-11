"use client";

import React, { useState, useEffect, useMemo } from "react";
import { OnboardingBanner } from "./dashboard/OnboardingBanner";
import { SyncNotificationModal } from "./dashboard/SyncNotificationModal";
import { AthleteSidebar, AthleteSidebarNavSection } from "./dashboard/AthleteSidebar";
import { AthleteMobileBottomNav } from "./dashboard/AthleteMobileBottomNav";
import { WorkoutDetailModal } from "./macrocycle/WorkoutDetailModal";
import { AthleteDashboardHeader } from "./dashboard/AthleteDashboardHeader";
import { AthleteDashboardViewRouter } from "./dashboard/AthleteDashboardViewRouter";
import { IntervalsOnboardingModal } from "@/components/IntervalsOnboardingModal";
import { PlanItem } from "@/lib/gemini/engine";
import { isMasterAdminEmail } from "@/lib/env";
import { getOffsetForWeek } from "@/lib/physiology/macrocycle";
import { resolveCurrentWeekIndex } from "@/lib/physiology/macrocycleSync";
import { useAuth } from "@/context/AuthContext";
import { getUserStorage } from "@/lib/storage/userStorage";
import { useAthleteTelemetry } from "@/hooks/useAthleteTelemetry";
import { useSeasonPlans } from "@/hooks/useSeasonPlans";
import { useIntervalsSync } from "@/hooks/useIntervalsSync";

interface AthleteDashboardProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  settingsTab: "connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals";
  setSettingsTab: (tab: "connections" | "physiology" | "availability" | "races" | "macrocycle" | "ai" | "intervals") => void;
  isSeasonStudioOpen?: boolean;
  setIsSeasonStudioOpen?: (open: boolean) => void;
  seasonStudioTab?: "races" | "plan_generator";
  setSeasonStudioTab?: (tab: "races" | "plan_generator") => void;
  onSelectView?: (view: "landing" | "dashboard" | "admin") => void;
  onLiveConnectedChange?: (connected: boolean) => void;
  onGeminiConnectedChange?: (connected: boolean) => void;
}

export const AthleteDashboard: React.FC<AthleteDashboardProps> = ({
  isSettingsOpen,
  setIsSettingsOpen,
  setSettingsTab,
  isSeasonStudioOpen,
  setIsSeasonStudioOpen,
  onSelectView,
  onLiveConnectedChange,
}) => {
  const { user, userProfile, signOutUser, refreshProfile } = useAuth();
  const userStorage = useMemo(() => getUserStorage(user?.uid), [user?.uid]);
  const [activeNavSection, setActiveNavSection] = useState<AthleteSidebarNavSection>("dashboard");
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PlanItem | null>(null);
  const [activePlan, setActivePlan] = useState<PlanItem[]>([]);

  const telemetry = useAthleteTelemetry({ user, userProfile, userStorage, refreshProfile, onLiveConnectedChange });
  const sync = useIntervalsSync({
    athleteId: telemetry.profile.id,
    apiKeyCache: telemetry.apiKeyCache,
    runFtp: telemetry.profile.run_ftp,
    bikeFtp: telemetry.profile.bike_ftp,
    ctl: telemetry.profile.ctl,
    user,
    userProfile,
    userStorage,
    onOpenSettings: (tab) => { setSettingsTab(tab); setIsSettingsOpen(true); },
  });
  const season = useSeasonPlans({
    user,
    userProfile,
    userStorage,
    profileId: telemetry.profile.id,
    runFtp: telemetry.profile.run_ftp,
    bikeFtp: telemetry.profile.bike_ftp,
    apiKeyCache: telemetry.apiKeyCache,
    refreshTelemetry: telemetry.refreshTelemetry,
    setSyncNotification: sync.setSyncNotification,
  });

  useEffect(() => {
    if (isSettingsOpen) { setActiveNavSection("physiology"); setIsSettingsOpen(false); }
  }, [isSettingsOpen, setIsSettingsOpen]);

  useEffect(() => {
    if (isSeasonStudioOpen) { setActiveNavSection("season_studio"); if (setIsSeasonStudioOpen) setIsSeasonStudioOpen(false); }
  }, [isSeasonStudioOpen, setIsSeasonStudioOpen]);

  const selectCoachWeek = () => {
    if (season.blueprint?.weeks?.length) {
      const idx = resolveCurrentWeekIndex(season.blueprint.weeks);
      season.setSelectedMacroWeekIdx(idx);
      if (season.blueprint.weeks[idx]) season.setWeekOffset(getOffsetForWeek(season.blueprint.weeks[idx]));
    }
  };

  const isMasterAdmin = isMasterAdminEmail(userProfile?.email || user?.email);
  const displayName = telemetry.profile.name && telemetry.profile.name !== "Atleta"
    ? telemetry.profile.name
    : userProfile?.displayName || user?.displayName || (isMasterAdmin ? "Germán Morales" : "Atleta");

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <AthleteSidebar
        activeSection={activeNavSection}
        onSelectSection={(s) => { if (s === "head_coach") selectCoachWeek(); setActiveNavSection(s); }}
        isIntervalsConnected={telemetry.isLiveConnected}
        isGeminiConnected={Boolean(telemetry.geminiKeyCache || telemetry.isLiveConnected)}
        onOpenSeasonStudio={() => setActiveNavSection("season_studio")}
        onOpenCoachChat={() => { selectCoachWeek(); setActiveNavSection("head_coach"); }}
        onOpenSettingsTab={() => setActiveNavSection("physiology")}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AthleteDashboardHeader
          displayName={displayName}
          email={userProfile?.email || user?.email || undefined}
          photoURL={userProfile?.photoURL || user?.photoURL}
          isLiveConnected={telemetry.isLiveConnected}
          isRefreshingTelemetry={telemetry.isRefreshingTelemetry}
          onRefreshTelemetry={() => telemetry.refreshTelemetry(telemetry.profile.id, telemetry.apiKeyCache, telemetry.profile.run_ftp, telemetry.profile.bike_ftp)}
          onSelectView={onSelectView}
          signOutUser={signOutUser}
        />
        <main className="flex-1 min-w-0 w-full max-w-[1550px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5 pb-24 md:pb-6 space-y-4 sm:space-y-5">
          {!telemetry.apiKeyCache && !userProfile?.encryptedApiKey && (!isMasterAdmin || telemetry.profile.id !== "i442091") && (
            <OnboardingBanner onOpenOnboarding={() => telemetry.setIsOnboardingOpen(true)} />
          )}
          <AthleteDashboardViewRouter
            activeNavSection={activeNavSection}
            telemetry={telemetry}
            season={season}
            sync={sync}
            user={user}
            userProfile={userProfile}
            displayName={displayName}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            onSelectWorkoutModal={setSelectedWorkoutModal}
            onNavigateTo={(section) => { if (section === "head_coach") selectCoachWeek(); setActiveNavSection(section); }}
            onLiveConnectedChange={onLiveConnectedChange}
            userStorage={userStorage}
          />
          <WorkoutDetailModal workout={selectedWorkoutModal} dailyExecutedActivities={telemetry.dailyExecutedActivities} onClose={() => setSelectedWorkoutModal(null)} />
          <IntervalsOnboardingModal isOpen={telemetry.isOnboardingOpen} onClose={() => telemetry.setIsOnboardingOpen(false)} initialAthleteId={telemetry.profile.id} onSuccess={telemetry.handleOnboardingSuccess} />
          <SyncNotificationModal notification={sync.syncNotification} onClose={() => sync.setSyncNotification(null)} />
        </main>
        <AthleteMobileBottomNav activeSection={activeNavSection} onSelectSection={(s) => { if (s === "head_coach") selectCoachWeek(); setActiveNavSection(s); }} isIntervalsConnected={telemetry.isLiveConnected} />
      </div>
    </div>
  );
};
