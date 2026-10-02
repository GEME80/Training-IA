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
import { getUserStorage, createReadOnlyMemoryStorage } from "@/lib/storage/userStorage";
import { useAthleteTelemetry } from "@/hooks/useAthleteTelemetry";
import { useSeasonPlans } from "@/hooks/useSeasonPlans";
import { useIntervalsSync } from "@/hooks/useIntervalsSync";
import { useAutoIntervalsSync } from "@/hooks/useAutoIntervalsSync";
import { AdminUserListItem } from "@/lib/db/types";

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
  targetAthlete?: AdminUserListItem | null;
  isReadOnly?: boolean;
}

export const AthleteDashboard: React.FC<AthleteDashboardProps> = ({
  isSettingsOpen,
  setIsSettingsOpen,
  setSettingsTab,
  isSeasonStudioOpen,
  setIsSeasonStudioOpen,
  onSelectView,
  onLiveConnectedChange,
  targetAthlete,
  isReadOnly = false,
}) => {
  const { user, userProfile, signOutUser, refreshProfile } = useAuth();

  const isAuditing = Boolean(targetAthlete);
  const effectiveReadOnly = isAuditing || Boolean(isReadOnly);

  // Perfil complementario de Firestore si estamos auditando un atleta específico
  const [targetAthleteFullProfile, setTargetAthleteFullProfile] = useState<any>(null);

  useEffect(() => {
    if (!targetAthlete?.uid) {
      setTargetAthleteFullProfile(null);
      return;
    }
    let isMounted = true;
    fetch(`/api/profile?uid=${encodeURIComponent(targetAthlete.uid)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.profile) {
          setTargetAthleteFullProfile(data.profile);
        }
      })
      .catch((err) => console.warn("Aviso al consultar perfil completo de atleta auditado:", err));

    return () => {
      isMounted = false;
    };
  }, [targetAthlete?.uid]);

  const effectiveUserProfile = useMemo(() => {
    if (!targetAthlete) return userProfile;
    return {
      uid: targetAthlete.uid,
      email: targetAthlete.email,
      displayName: targetAthlete.displayName || "Atleta",
      role: targetAthlete.role,
      status: targetAthlete.status,
      intervalsAthleteId: targetAthlete.intervalsAthleteId,
      runFtp: targetAthlete.runFtp,
      bikeFtp: targetAthlete.bikeFtp,
      weightKg: targetAthlete.weightKg,
      heightCm: targetAthlete.heightCm,
      hasApiKey: targetAthlete.hasIntervalsKey,
      ...targetAthleteFullProfile,
    };
  }, [targetAthlete, userProfile, targetAthleteFullProfile]);

  const effectiveUser = useMemo(() => {
    if (!targetAthlete) return user;
    return {
      uid: targetAthlete.uid,
      email: targetAthlete.email,
      displayName: targetAthlete.displayName || "Atleta",
      photoURL: targetAthlete.photoURL || user?.photoURL || null,
    };
  }, [targetAthlete, user]);

  // Si estamos en modo auditoría usamos almacenamiento volátil en memoria para no tocar localStorage del admin
  const userStorage = useMemo(() => {
    if (isAuditing) {
      return createReadOnlyMemoryStorage();
    }
    return getUserStorage(user?.uid);
  }, [isAuditing, user?.uid]);

  const [activeNavSection, setActiveNavSection] = useState<AthleteSidebarNavSection>("dashboard");
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PlanItem | null>(null);
  const [activePlan, setActivePlan] = useState<PlanItem[]>([]);

  const telemetry = useAthleteTelemetry({
    user: effectiveUser,
    userProfile: effectiveUserProfile,
    userStorage,
    refreshProfile: isAuditing ? undefined : refreshProfile,
    onLiveConnectedChange,
    isReadOnly: effectiveReadOnly,
  });

  const sync = useIntervalsSync({
    athleteId: telemetry.profile.id,
    apiKeyCache: telemetry.apiKeyCache,
    runFtp: telemetry.profile.run_ftp,
    bikeFtp: telemetry.profile.bike_ftp,
    ctl: telemetry.profile.ctl,
    user: effectiveUser,
    userProfile: effectiveUserProfile,
    userStorage,
    onOpenSettings: (tab) => { setSettingsTab(tab); setIsSettingsOpen(true); },
    isReadOnly: effectiveReadOnly,
    runningOpts: {
      mode: (telemetry.profile.hasRunningPowerMeter === false || telemetry.profile.runningTrainingMode === "PACE" || telemetry.profile.runningTrainingMode === "HYBRID" || !telemetry.profile.run_ftp) ? "PACE" : "POWER",
      thresholdPaceSec: telemetry.profile.runThresholdPaceSecPerKm,
      thresholdPaceStr: telemetry.profile.runThresholdPaceStr,
      lthr: telemetry.profile.lthr,
    },
  });

  const season = useSeasonPlans({
    user: effectiveUser,
    userProfile: effectiveUserProfile,
    userStorage,
    profileId: telemetry.profile.id,
    runFtp: telemetry.profile.run_ftp,
    bikeFtp: telemetry.profile.bike_ftp,
    ctl: telemetry.profile.ctl,
    historicalMetrics: telemetry.historicalSummary,
    apiKeyCache: telemetry.apiKeyCache,
    refreshTelemetry: telemetry.refreshTelemetry,
    setSyncNotification: sync.setSyncNotification,
    isReadOnly: effectiveReadOnly,
    calendarEvents: telemetry.calendarEvents,
  });

  useAutoIntervalsSync({
    athleteId: telemetry.profile.id,
    apiKeyCache: telemetry.apiKeyCache,
    user: effectiveUser,
    userProfile: effectiveUserProfile,
    userStorage,
    blueprint: season.blueprint,
    weeklyAvailability: season.weeklyAvailability,
    runFtp: telemetry.profile.run_ftp,
    bikeFtp: telemetry.profile.bike_ftp,
    ctl: telemetry.profile.ctl,
    runningOpts: {
      mode: (telemetry.profile.hasRunningPowerMeter === false || telemetry.profile.runningTrainingMode === "PACE" || telemetry.profile.runningTrainingMode === "HYBRID" || !telemetry.profile.run_ftp) ? "PACE" : "POWER",
      thresholdPaceSec: telemetry.profile.runThresholdPaceSecPerKm,
      thresholdPaceStr: telemetry.profile.runThresholdPaceStr,
      lthr: telemetry.profile.lthr,
    },
    refreshTelemetry: telemetry.refreshTelemetry,
    isReadOnly: effectiveReadOnly,
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

  const isMasterAdmin = isMasterAdminEmail(effectiveUserProfile?.email || effectiveUser?.email) && !effectiveReadOnly;
  const displayName = telemetry.profile.name && telemetry.profile.name !== "Atleta"
    ? telemetry.profile.name
    : effectiveUserProfile?.displayName || effectiveUser?.displayName || (isMasterAdmin ? "Germán Morales" : "Atleta");

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
        onSelectView={onSelectView}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AthleteDashboardHeader
          displayName={displayName}
          email={effectiveUserProfile?.email || effectiveUser?.email}
          photoURL={effectiveUserProfile?.photoURL || effectiveUser?.photoURL}
          isLiveConnected={telemetry.isLiveConnected}
          isRefreshingTelemetry={telemetry.isRefreshingTelemetry}
          onRefreshTelemetry={() => telemetry.refreshTelemetry(telemetry.profile.id, telemetry.apiKeyCache, telemetry.profile.run_ftp, telemetry.profile.bike_ftp)}
          onSelectView={onSelectView}
          signOutUser={signOutUser}
        />
        <main className="flex-1 min-w-0 w-full max-w-[1550px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5 pb-24 md:pb-6 space-y-4 sm:space-y-5">
          {!isAuditing && !telemetry.apiKeyCache && !effectiveUserProfile?.encryptedApiKey && !effectiveUserProfile?.hasApiKey && (!isMasterAdmin || telemetry.profile.id !== "i442091") && (
            <OnboardingBanner onOpenOnboarding={() => telemetry.setIsOnboardingOpen(true)} />
          )}
          <AthleteDashboardViewRouter
            activeNavSection={activeNavSection}
            telemetry={telemetry}
            season={season}
            sync={sync}
            user={effectiveUser}
            userProfile={effectiveUserProfile}
            displayName={displayName}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            onSelectWorkoutModal={setSelectedWorkoutModal}
            onNavigateTo={(section) => { if (section === "head_coach") selectCoachWeek(); setActiveNavSection(section); }}
            onLiveConnectedChange={onLiveConnectedChange}
            userStorage={userStorage}
            isReadOnly={effectiveReadOnly}
          />
          <WorkoutDetailModal
            workout={selectedWorkoutModal}
            dailyExecutedActivities={telemetry.dailyExecutedActivities}
            athleteId={telemetry.profile.id}
            apiKey={telemetry.apiKeyCache}
            email={effectiveUser?.email || undefined}
            uid={effectiveUser?.uid || undefined}
            runFtp={telemetry.profile.run_ftp}
            bikeFtp={telemetry.profile.bike_ftp}
            runningTrainingMode={telemetry.profile.runningTrainingMode}
            hasRunningPowerMeter={telemetry.profile.hasRunningPowerMeter}
            thresholdPaceStr={telemetry.profile.runThresholdPaceStr}
            thresholdPaceSec={telemetry.profile.runThresholdPaceSecPerKm}
            onClose={() => setSelectedWorkoutModal(null)}
          />
          <IntervalsOnboardingModal isOpen={telemetry.isOnboardingOpen} onClose={() => telemetry.setIsOnboardingOpen(false)} initialAthleteId={telemetry.profile.id} onSuccess={telemetry.handleOnboardingSuccess} />
          <SyncNotificationModal notification={sync.syncNotification} onClose={() => sync.setSyncNotification(null)} />
        </main>
        <AthleteMobileBottomNav activeSection={activeNavSection} onSelectSection={(s) => { if (s === "head_coach") selectCoachWeek(); setActiveNavSection(s); }} isIntervalsConnected={telemetry.isLiveConnected} />
      </div>
    </div>
  );
};
