"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MacrocycleView } from "@/components/MacrocycleView";
import { PhysiologicalCards } from "@/components/PhysiologicalCards";
import { MacrocyclePreviewTimeline } from "@/components/MacrocyclePreviewTimeline";
import { SeasonStudioTab } from "@/components/SeasonStudioModal";
import { HeadCoachChatDrawer } from "@/components/HeadCoachChatDrawer";
import { MacrocycleWizardModal } from "@/components/MacrocycleWizardModal";
import { IntervalsOnboardingModal } from "@/components/IntervalsOnboardingModal";

import { OnboardingBanner } from "./dashboard/OnboardingBanner";
import { SyncNotificationModal, SyncNotificationData } from "./dashboard/SyncNotificationModal";
import { AthleteHeroBanner } from "./dashboard/AthleteHeroBanner";
import { AthleteSidebar, AthleteSidebarNavSection } from "./dashboard/AthleteSidebar";
import { AthleteMobileBottomNav } from "./dashboard/AthleteMobileBottomNav";
import { WorkoutDetailModal } from "./macrocycle/WorkoutDetailModal";
import { AthleteSeasonStudioView } from "./dashboard/AthleteSeasonStudioView";
import { AthletePhysiologyView } from "./dashboard/AthletePhysiologyView";
import { AthleteHeadCoachView } from "./dashboard/AthleteHeadCoachView";
import { AthleteContinuousCalendar } from "./dashboard/AthleteContinuousCalendar";
import { Shield, LayoutDashboard, Home, LogOut, Sparkles } from "lucide-react";
import { PulseLogo } from "./PulseLogo";

import { PhysiologicalStatus } from "@/lib/physiology/engine";
import {
  AgentDecisionOutput,
  PlanItem,
  WeeklyAvailabilityMap,
  DEFAULT_WEEKLY_AVAILABILITY,
} from "@/lib/gemini/engine";
import { AthleteProfile, AthleteWellness, DailyExecutedMap, DEFAULT_VISIBLE_METRICS } from "@/lib/intervals/types";
import { isMasterAdminEmail } from "@/lib/env";
import {
  MacrocyclePhaseInfo,
  TargetRace,
  MacrocycleBlueprint,
  SeasonPlanItem,
  calculatePlanStatus,
  calculateMacrocyclePhase,
  getOffsetForWeek,
  getCleanFocusDescription,
} from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { useAuth } from "@/context/AuthContext";
import { getUserStorage, purgeLegacyGlobalStorage } from "@/lib/storage/userStorage";

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
  settingsTab,
  setSettingsTab,
  isSeasonStudioOpen,
  setIsSeasonStudioOpen,
  seasonStudioTab,
  setSeasonStudioTab,
  onSelectView,
  onLiveConnectedChange,
  onGeminiConnectedChange,
}) => {
  const { user, userProfile, isAdmin, signOutUser, refreshProfile } = useAuth();
  const userStorage = useMemo(() => getUserStorage(user?.uid), [user?.uid]);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  const [activeNavSection, setActiveNavSection] = useState<AthleteSidebarNavSection>("dashboard");
  const [selectedWorkoutModal, setSelectedWorkoutModal] = useState<PlanItem | null>(null);
  const [internalSeasonStudioOpen, setInternalSeasonStudioOpen] = useState(false);
  const [internalSeasonStudioTab, setInternalSeasonStudioTab] = useState<SeasonStudioTab>("plan_generator");

  const effectiveSeasonStudioOpen = isSeasonStudioOpen !== undefined ? isSeasonStudioOpen : internalSeasonStudioOpen;
  const setEffectiveSeasonStudioOpen = setIsSeasonStudioOpen || setInternalSeasonStudioOpen;
  const effectiveSeasonStudioTab = seasonStudioTab || internalSeasonStudioTab;
  const setEffectiveSeasonStudioTab = (tab: SeasonStudioTab) => {
    if (setSeasonStudioTab) setSeasonStudioTab(tab);
    setInternalSeasonStudioTab(tab);
  };

  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(
    userProfile?.visibleMetrics || DEFAULT_VISIBLE_METRICS
  );

  const [wellnessHistory, setWellnessHistory] = useState<AthleteWellness[]>([]);

  const latestWellness = useMemo(() => {
    if (!wellnessHistory || wellnessHistory.length === 0) return null;
    const reversed = [...wellnessHistory].reverse();
    return reversed.find((w) => w.sleepQuality !== undefined || w.sleepSecs !== undefined || w.hrv !== undefined || w.restingHR !== undefined) || reversed[0];
  }, [wellnessHistory]);

  const [profile, setProfile] = useState<AthleteProfile>(() => {
    return {
      id: userProfile?.intervalsAthleteId || "",
      name: userProfile?.displayName || user?.displayName || "Atleta",
      ctl: 0,
      atl: 0,
      tsb: 0,
      rampRate: 0,
      restingHR: userProfile?.restingHR,
      run_ftp: userProfile?.runFtp || 0,
      bike_ftp: userProfile?.bikeFtp || 0,
      weight: userProfile?.weightKg,
      heightCm: userProfile?.heightCm,
      gender: userProfile?.gender,
      birthDate: userProfile?.birthDate,
      visibleMetrics: userProfile?.visibleMetrics,
    };
  });

  const [physioStatus, setPhysioStatus] = useState<PhysiologicalStatus | null>(null);
  const [agentDecision, setAgentDecision] = useState<AgentDecisionOutput | null>(null);
  const [activePlan, setActivePlan] = useState<PlanItem[]>([]);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedMacroWeekIdx, setSelectedMacroWeekIdx] = useState<number>(0);
  const [targetRaces, setTargetRaces] = useState<TargetRace[]>([]);
  const [seasonPlans, setSeasonPlans] = useState<SeasonPlanItem[]>([]);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(
    userProfile?.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY
  );
  const [macrocyclePhase, setMacrocyclePhase] = useState<MacrocyclePhaseInfo | null>(() => calculateMacrocyclePhase([]));

  // Sincronizar apertura de pestañas desde Header o props superiores
  useEffect(() => {
    if (isSettingsOpen) {
      if (settingsTab === "connections" || settingsTab === "intervals" || settingsTab === "ai") {
        setActiveNavSection("physiology");
      } else if (settingsTab === "physiology" || settingsTab === "availability") {
        setActiveNavSection("physiology");
      }
      setIsSettingsOpen(false);
    }
  }, [isSettingsOpen, settingsTab, setIsSettingsOpen]);

  useEffect(() => {
    if (isSeasonStudioOpen) {
      setActiveNavSection("season_studio");
      if (setIsSeasonStudioOpen) setIsSeasonStudioOpen(false);
    }
  }, [isSeasonStudioOpen, setIsSeasonStudioOpen]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const [isCoachChatOpen, setIsCoachChatOpen] = useState<boolean>(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string | null>(null);

  const [apiKeyCache, setApiKeyCache] = useState<string>("");
  const [geminiKeyCache, setGeminiKeyCache] = useState<string>("");
  const [selectedModelCache, setSelectedModelCache] = useState<string>("gemini-2.5-flash");
  const [temperatureCache, setTemperatureCache] = useState<number>(0.0);
  const [fallbackModelsCache, setFallbackModelsCache] = useState<string[]>(["gemini-2.0-flash", "gemini-1.5-pro"]);
  const [enableGroundingCache, setEnableGroundingCache] = useState<boolean>(true);
  const [customPromptCache, setCustomPromptCache] = useState<string>("");
  const [coachProfileCache, setCoachProfileCache] = useState<string>("olympic");
  const [weeklyExecutedTss, setWeeklyExecutedTss] = useState<number>(0);
  const [dailyExecutedActivities, setDailyExecutedActivities] = useState<DailyExecutedMap>({});
  const [syncNotification, setSyncNotification] = useState<SyncNotificationData | null>(null);

  const handleOnboardingSuccess = async (data: {
    athleteId: string;
    apiKey: string;
    athleteName?: string;
    runFtp?: number;
    bikeFtp?: number;
  }) => {
    setApiKeyCache(data.apiKey);
    userStorage.setItem("intervals_api_key", data.apiKey);
    userStorage.setItem("athlete_id", data.athleteId);
    if (data.runFtp) userStorage.setItem("run_ftp", data.runFtp.toString());
    if (data.bikeFtp) userStorage.setItem("bike_ftp", data.bikeFtp.toString());

    setProfile((prev) => ({
      ...prev,
      id: data.athleteId,
      name: data.athleteName || prev.name,
      run_ftp: data.runFtp || prev.run_ftp,
      bike_ftp: data.bikeFtp || prev.bike_ftp,
    }));

    if (user?.uid) {
      try {
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: data.athleteName || user.displayName,
            intervalsAthleteId: data.athleteId,
            rawApiKey: data.apiKey,
            runFtp: data.runFtp,
            bikeFtp: data.bikeFtp,
          }),
        });
      } catch (e) {
        console.warn("No se pudo persistir perfil en API:", e);
      }
    }

    setIsOnboardingOpen(false);
    setIsLiveConnected(true);
    if (onLiveConnectedChange) onLiveConnectedChange(true);
    refreshTelemetry(data.athleteId, data.apiKey, data.runFtp, data.bikeFtp);
  };

  const handleStartAICoachPlanCreator = (sportHint?: string) => {
    setIsSettingsOpen(false);
    const athleteName = profile.name || userProfile?.displayName || "Atleta";
    const ctl = physioStatus?.ctl ?? profile.ctl ?? 0;
    const atl = physioStatus?.atl ?? profile.atl ?? 0;
    const tsb = physioStatus?.tsb ?? profile.tsb ?? 0;
    const cp = profile.run_ftp ? `${profile.run_ftp} W` : "no configurado";
    const bike = profile.bike_ftp ? `${profile.bike_ftp} W` : "no configurado";
    const ageStr = profile.age ? `${profile.age} años` : "edad no especificada";
    const genderStr = profile.gender === "M" ? "Masculino" : profile.gender === "F" ? "Femenino" : "No especificado";

    const prompt = sportHint
      ? `Hola Coach, quiero diseñar un nuevo plan de macrociclo a medida para ${sportHint}. Mis métricas fisiológicas actuales son: Atleta: ${athleteName} (${ageStr}, ${genderStr}), Fitness CTL: ${ctl}, Fatiga ATL: ${atl}, Forma TSB: ${tsb}, Stryd Potencia Crítica: ${cp}, FTP Ciclismo: ${bike}. Por favor, hazme una breve entrevista estructurada preguntándome sobre mi fecha objetivo, reto específico, horas disponibles y objetivos de rendimiento para crear mi macrociclo perfecto.`
      : `Hola Coach, quiero diseñar un nuevo macrociclo personalizado a medida con la IA. Analiza mis métricas fisiológicas actuales y guíame paso a paso para definir mi disciplina, objetivo, fechas y disponibilidad.`;

    setCoachInitialPrompt(prompt);
    setIsCoachChatOpen(true);
  };

  const refreshTelemetry = useCallback(
    async (
      athleteId?: string,
      apiKey?: string,
      runFtp?: number,
      bikeFtp?: number
    ) => {
      const targetAthleteId = athleteId || profile.id || userProfile?.intervalsAthleteId || "";
      const targetApiKey = apiKey || apiKeyCache || "";

      // Si el atleta no tiene configurado ningún identificador ni clave, no consultar Intervals
      if (!targetAthleteId && !targetApiKey && !userProfile?.encryptedApiKey) {
        setIsLiveConnected(false);
        return;
      }

      try {
        setIsRefreshingTelemetry(true);
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athleteId: targetAthleteId,
            apiKey: targetApiKey,
            uid: user?.uid,
            customRunFtp: runFtp || profile.run_ftp,
            customBikeFtp: bikeFtp || profile.bike_ftp,
            skipAI: true,
          }),
        });

        if (!res.ok) {
          setIsLiveConnected(false);
          return;
        }

        const data = await res.json();
        if (data.success) {
          if (data.isLive !== undefined) {
            setIsLiveConnected(Boolean(data.isLive));
            if (onLiveConnectedChange) onLiveConnectedChange(Boolean(data.isLive));
          }
          if (typeof data.executedWeeklyTss === "number") {
            setWeeklyExecutedTss(data.executedWeeklyTss);
          }
          if (data.dailyExecutedActivities) {
            setDailyExecutedActivities(data.dailyExecutedActivities);
          }
          if (Array.isArray(data.wellness)) {
            setWellnessHistory(data.wellness);
          }

          const resolvedBikeFtp = data.profile?.bike_ftp || bikeFtp || profile.bike_ftp;
          const resolvedRunFtp = data.profile?.run_ftp || runFtp || profile.run_ftp;

          if (data.profile?.bike_ftp) {
            userStorage.setItem("bike_ftp", String(data.profile.bike_ftp));
          }
          if (data.profile?.run_ftp) {
            userStorage.setItem("run_ftp", String(data.profile.run_ftp));
          }

          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            weight: data.profile?.weight ?? prev.weight,
            heightCm: data.profile?.heightCm ?? prev.heightCm,
            gender: data.profile?.gender ?? prev.gender,
            birthDate: data.profile?.birthDate ?? prev.birthDate,
            name:
              data.profile?.name && data.profile.name !== "Atleta"
                ? data.profile.name
                : (prev.name && prev.name !== "Atleta" ? prev.name : userProfile?.displayName || user?.displayName || "Atleta"),
            run_ftp: resolvedRunFtp,
            bike_ftp: resolvedBikeFtp,
          }));
          setPhysioStatus(data.physioStatus);

          const savedBlueprintStr = userStorage.getItem("active_blueprint");
          if (savedBlueprintStr) {
            try {
              const parsedBp = JSON.parse(savedBlueprintStr);
              if (parsedBp && Array.isArray(parsedBp.weeks)) {
                parsedBp.weeks = parsedBp.weeks.map((w: any) => ({
                  ...w,
                  focusDescription: getCleanFocusDescription(w.focusDescription, w.phase, w.isRecoveryWeek || w.microcycleType === "DESCARGA_ASIMILACION"),
                }));
              }
              setMacrocyclePhase((prev) => {
                if (prev && prev.blueprint) return prev;
                return {
                  phase: (parsedBp.currentWeek?.phase as any) || "MAINTENANCE",
                  phaseLabel: parsedBp.currentWeek?.phaseLabel || "Mantenimiento",
                  cycleBadgeLabel: "🔵 CICLO ACTIVO: MANTENIMIENTO",
                  cycleBadgeColor: "cyan",
                  weeksRemaining: null,
                  daysRemaining: null,
                  primaryRace: null,
                  guideline: "Mantener base aeróbica y fuerza estructural.",
                  suggestedFocus: "Base Aeróbica y Capacidad Mitocondrial",
                  badgeColor: "bg-cyan-500",
                  maxLongRunMinutes: 90,
                  isSpecificMarathonPhase: false,
                  weeklyTssTarget: "350 TSS",
                  blueprint: parsedBp,
                };
              });
            } catch {}
          }
        }
      } catch (err) {
        console.error("Error al refrescar telemetría:", err);
      } finally {
        setIsRefreshingTelemetry(false);
      }
    },
    [profile.id, profile.run_ftp, profile.bike_ftp, apiKeyCache, onLiveConnectedChange]
  );

  const handleSyncToIntervals = async (planToSync: PlanItem[]) => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey: apiKeyCache,
          plan: planToSync,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.isAuthError) {
          setSettingsTab("intervals");
          setIsSettingsOpen(true);
        }
        throw new Error(data.error || "Fallo en la sincronización con Intervals.icu");
      }

      setSyncNotification({
        title: "¡Microciclo Sincronizado con Éxito!",
        message: `Se cargaron ${data.createdCount || 7} entrenamientos estructurados en tu calendario de Intervals.icu y Garmin Connect.`,
        type: "success",
      });
    } catch (err: any) {
      setSyncNotification({
        title: "Error de Sincronización",
        message: err.message || "No se pudo sincronizar el microciclo.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFullMacrocycleToIntervals = async () => {
    const activeBlueprint = currentlyViewedPlan?.blueprint || macrocyclePhase?.blueprint;
    if (!activeBlueprint || !activeBlueprint.weeks || activeBlueprint.weeks.length === 0) {
      setSyncNotification({
        title: "Sin Macrociclo Activo",
        message: "No hay un macrociclo activo cargado para sincronizar.",
        type: "error",
      });
      return;
    }

    const fullCyclePlan: PlanItem[] = [];
    activeBlueprint.weeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week,
        profile.run_ftp,
        profile.bike_ftp,
        (activeBlueprint.availabilitySnapshot as any) || weeklyAvailability,
        (activeBlueprint.distanceType || primaryRace?.distance) as any,
        profile.ctl
      );
      fullCyclePlan.push(...weekPlan);
    });

    if (fullCyclePlan.length === 0) {
      setSyncNotification({
        title: "Error de Generación",
        message: "No se generaron sesiones para el macrociclo.",
        type: "error",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          apiKey: apiKeyCache,
          plan: fullCyclePlan,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.isAuthError) {
          setSettingsTab("intervals");
          setIsSettingsOpen(true);
        }
        throw new Error(data.error || "Fallo en la sincronización con Intervals.icu");
      }

      const structuredCount = fullCyclePlan.filter((p) => !p.isRestDay && p.discipline !== "Descanso").length;
      setSyncNotification({
        title: "¡Macrociclo Sincronizado con Éxito!",
        message: `Se cargaron ${data.createdCount || structuredCount} entrenamientos estructurados en tu calendario de Intervals.icu (${activeBlueprint.weeks.length} semanas).`,
        details: `Cada día refleja exactamente tu disponibilidad semanal de deportes, días de descanso (0 TSS) y zonas de potencia (Stryd CP: ${profile.run_ftp}W, Bike FTP: ${profile.bike_ftp}W).`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Error al sincronizar macrociclo completo:", err);
      setSyncNotification({
        title: "Error de Sincronización",
        message: err.message || "No se pudo completar la sincronización.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyMacrocycle = async (
    blueprint: MacrocycleBlueprint,
    primaryRace?: TargetRace,
    source: "AI_GENERATED" | "WIZARD_CUSTOM" = "WIZARD_CUSTOM",
    options?: { mode?: "CHAIN" | "REPLACE" }
  ) => {
    let updatedRaces: TargetRace[] = [];
    if (primaryRace) {
      updatedRaces = [
        primaryRace,
        ...targetRaces.filter((r) => r.id !== primaryRace.id && r.priority !== "A"),
      ];
    } else {
      updatedRaces = targetRaces;
    }

    userStorage.setJSON("target_races", updatedRaces);
    userStorage.setJSON("active_blueprint", blueprint);

    const newPlanItem: SeasonPlanItem = {
      id: "plan-" + Date.now(),
      planName: blueprint.cycleTitle,
      goalType: "MARATON_42K",
      blueprint,
      startDate: blueprint.startDate || new Date().toISOString().split("T")[0],
      endDate: blueprint.weeks?.[blueprint.weeks.length - 1]?.endDate || new Date().toISOString().split("T")[0],
      totalWeeks: blueprint.totalWeeks || 16,
      status: calculatePlanStatus(
        blueprint.startDate || new Date().toISOString().split("T")[0],
        blueprint.weeks?.[blueprint.weeks.length - 1]?.endDate || new Date().toISOString().split("T")[0]
      ),
      orderIndex: options?.mode === "CHAIN" ? seasonPlans.length : 0,
      createdAt: new Date().toISOString(),
    };

    let updatedPlans: SeasonPlanItem[] = [];
    if (options?.mode === "CHAIN" && seasonPlans.length > 0) {
      updatedPlans = [...seasonPlans, newPlanItem];
    } else {
      updatedPlans = [newPlanItem];
    }

    setSeasonPlans(updatedPlans);
    setViewingPlanId(newPlanItem.id);
    userStorage.setJSON("season_plans", updatedPlans);

    let newPhaseInfo = calculateMacrocyclePhase(updatedRaces);
    if (!newPhaseInfo) {
      newPhaseInfo = {
        phase: blueprint.currentWeek?.phase || "MAINTENANCE",
        phaseLabel: blueprint.cycleTitle,
        cycleBadgeLabel: blueprint.mode === "PRE_SEASON_MAINTENANCE" ? "🔵 MANTENIMIENTO PRE-TEMPORADA" : "🏃 CICLO ACTIVO",
        cycleBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        weeksRemaining: blueprint.totalWeeks,
        daysRemaining: blueprint.totalWeeks * 7,
        primaryRace: primaryRace || blueprint.primaryRace,
        guideline: blueprint.currentWeek?.focusDescription || "",
        suggestedFocus: "Macrociclo Activo",
        badgeColor: "bg-amber-500/20 text-amber-300",
        maxLongRunMinutes: blueprint.currentWeek?.maxLongRunMinutes || 60,
        isSpecificMarathonPhase: blueprint.mode === "MARATHON_SPECIFIC",
        weeklyTssTarget: `${blueprint.currentWeek?.targetTss || 350} TSS`,
        blueprint,
      };
    }
    newPhaseInfo.blueprint = blueprint;
    setMacrocyclePhase(newPhaseInfo);

    try {
      await fetch("/api/macrocycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: profile.id,
          blueprint,
          primaryRace: primaryRace || blueprint.primaryRace,
          source,
        }),
      });
    } catch (dbErr) {
      console.warn("Aviso al persistir macrociclo en Firestore:", dbErr);
    }

    const initialWeekIdx = blueprint.currentWeekIndex ?? 0;
    setSelectedMacroWeekIdx(initialWeekIdx);
    if (blueprint.weeks && blueprint.weeks[initialWeekIdx]) {
      setWeekOffset(getOffsetForWeek(blueprint.weeks[initialWeekIdx]));
    } else {
      setWeekOffset(0);
    }

    setSyncNotification({
      title: "¡Macrociclo Activado con Éxito!",
      message: `El plan "${blueprint.cycleTitle}" (${blueprint.weeks.length} semanas) ha sido fijado como tu ciclo activo en el calendario.`,
      type: "success",
    });

    await refreshTelemetry(
      profile.id,
      apiKeyCache,
      profile.run_ftp,
      profile.bike_ftp
    );
  };

  const handleUpdateWeekMicrocycle = async (weekIdx: number, newType: any) => {
    const currentBp = currentlyViewedPlan?.blueprint || macrocyclePhase?.blueprint;
    if (!currentBp || !currentBp.weeks[weekIdx]) return;

    const updatedWeeks = [...currentBp.weeks];
    updatedWeeks[weekIdx] = {
      ...updatedWeeks[weekIdx],
      microcycleType: newType,
    };

    const updatedBlueprint = {
      ...currentBp,
      weeks: updatedWeeks,
    };

    const updatedPlans = seasonPlans.map((p) => {
      if (p.id === currentlyViewedPlan?.id) {
        return { ...p, blueprint: updatedBlueprint };
      }
      return p;
    });

    setSeasonPlans(updatedPlans);
    userStorage.setJSON("season_plans", updatedPlans);
    userStorage.setJSON("active_blueprint", updatedBlueprint);

    if (macrocyclePhase) {
      setMacrocyclePhase({
        ...macrocyclePhase,
        blueprint: updatedBlueprint,
      });
    }
  };

  const handleSaveTargetRaces = async (races: TargetRace[]) => {
    setTargetRaces(races);
    userStorage.setJSON("target_races", races);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid || "",
          email: user?.email || userProfile?.email || "",
          targetRaces: races,
        }),
      });
    } catch (e) {
      console.warn("Aviso al guardar carreras en perfil:", e);
    }
  };

  const handleSaveSeasonPlans = async (plans: SeasonPlanItem[]) => {
    setSeasonPlans(plans);
    if (plans.length > 0) {
      userStorage.setJSON("season_plans", plans);
      if (plans[0].blueprint) {
        userStorage.setJSON("active_blueprint", plans[0].blueprint);
      }
    } else {
      userStorage.removeItem("season_plans");
      userStorage.removeItem("active_blueprint");
      setViewingPlanId(null);
      setMacrocyclePhase(null);
    }
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid || "demo-user",
          email: user?.email || userProfile?.email || "",
          seasonPlans: plans,
        }),
      });
    } catch (e) {
      console.warn("Aviso al guardar planes de temporada en perfil:", e);
    }
  };

  const handleDeleteActivePlan = async () => {
    await handleSaveSeasonPlans([]);
    setViewingPlanId(null);
    setMacrocyclePhase(null);
    setSyncNotification({
      title: "Plan Eliminado",
      message: "El macrociclo activo ha sido eliminado. Tu calendario ha quedado restablecido.",
      type: "success",
    });
  };

  const handleSaveSettings = async (data: any) => {
    const athleteIdToUse = data.intervalsAthleteId || data.athleteId;
    if (athleteIdToUse) {
      setProfile((p) => ({ ...p, id: athleteIdToUse }));
      userStorage.setItem("athlete_id", athleteIdToUse);
    }
    if (data.displayName) {
      setProfile((p) => ({ ...p, name: data.displayName }));
      userStorage.setItem("display_name", data.displayName);
    }
    if (data.apiKey) {
      setApiKeyCache(data.apiKey);
      userStorage.setItem("intervals_api_key", data.apiKey);
    }
    if (data.geminiApiKey) {
      setGeminiKeyCache(data.geminiApiKey);
      userStorage.setItem("custom_gemini_key", data.geminiApiKey);
    }
    if (data.runFtp) {
      setProfile((p) => ({ ...p, run_ftp: data.runFtp }));
      userStorage.setItem("run_ftp", String(data.runFtp));
    }
    if (data.bikeFtp) {
      setProfile((p) => ({ ...p, bike_ftp: data.bikeFtp }));
      userStorage.setItem("bike_ftp", String(data.bikeFtp));
    }
    if (data.heightCm) {
      setProfile((p) => ({ ...p, heightCm: data.heightCm }));
      userStorage.setItem("height_cm", String(data.heightCm));
    }
    if (data.weightKg) {
      setProfile((p) => ({ ...p, weight: data.weightKg }));
      userStorage.setItem("weight_kg", String(data.weightKg));
    }
    if (data.gender) {
      setProfile((p) => ({ ...p, gender: data.gender }));
      userStorage.setItem("gender", data.gender);
    }
    if (data.birthDate) {
      setProfile((p) => ({ ...p, birthDate: data.birthDate }));
      userStorage.setItem("birth_date", data.birthDate);
    }
    if (data.weeklyAvailability) {
      setWeeklyAvailability(data.weeklyAvailability);
      userStorage.setJSON("weekly_availability", data.weeklyAvailability);
    }
    if (data.visibleMetrics) {
      setVisibleMetrics(data.visibleMetrics);
      userStorage.setJSON("visible_metrics", data.visibleMetrics);
    }

    // Persistir de forma segura en Firestore con cifrado AES-256-GCM
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid || "",
          email: user?.email || userProfile?.email || "",
          displayName: data.displayName || profile.name || user?.displayName || userProfile?.displayName,
          intervalsAthleteId: athleteIdToUse || profile.id,
          rawApiKey: data.apiKey || apiKeyCache,
          runFtp: data.runFtp || profile.run_ftp,
          bikeFtp: data.bikeFtp || profile.bike_ftp,
          weightKg: data.weightKg || profile.weight,
          heightCm: data.heightCm || profile.heightCm,
          birthDate: data.birthDate || profile.birthDate,
          gender: data.gender || profile.gender,
          weeklyAvailability: data.weeklyAvailability || weeklyAvailability,
          visibleMetrics: data.visibleMetrics || visibleMetrics,
        }),
      });
    } catch (saveErr) {
      console.warn("Aviso al persistir perfil en Firestore:", saveErr);
    }

    if (refreshProfile) {
      try {
        await refreshProfile();
      } catch (authErr) {
        console.warn("Aviso al refrescar perfil en AuthContext:", authErr);
      }
    }

    await refreshTelemetry(athleteIdToUse || profile.id, data.apiKey, data.runFtp, data.bikeFtp);
  };

  const handleToggleMetric = async (id: string) => {
    let updated = visibleMetrics.includes(id)
      ? visibleMetrics.filter((m) => m !== id)
      : [...visibleMetrics, id];
    if (updated.length === 0) updated = ["ctl"];
    setVisibleMetrics(updated);
    userStorage.setJSON("visible_metrics", updated);
    await handleSaveSettings({ visibleMetrics: updated });
  };

  const activePlanItem = useMemo(() => {
    return (
      seasonPlans.find((p) => calculatePlanStatus(p.startDate, p.endDate) === "ACTIVE") ||
      seasonPlans[0] ||
      null
    );
  }, [seasonPlans]);

  const upcomingPlanItem = useMemo(() => {
    return seasonPlans.find((p) => calculatePlanStatus(p.startDate, p.endDate) === "UPCOMING") || null;
  }, [seasonPlans]);

  const currentlyViewedPlan = useMemo(() => {
    return seasonPlans.find((p) => p.id === viewingPlanId) || activePlanItem;
  }, [seasonPlans, viewingPlanId, activePlanItem]);

  const primaryARace = useMemo(() => {
    return targetRaces.find((r) => r.priority === "A") || null;
  }, [targetRaces]);

  const blueprint = seasonPlans.length > 0
    ? (currentlyViewedPlan?.blueprint || macrocyclePhase?.blueprint || null)
    : (macrocyclePhase?.blueprint || null);
  const isMaintenanceCycle =
    blueprint?.mode !== "MARATHON_SPECIFIC" ||
    !blueprint?.primaryRace ||
    blueprint?.cycleTitle?.toLowerCase().includes("mantenimiento") ||
    blueprint?.cycleTitle?.toLowerCase().includes("salud");

const primaryRace = isMaintenanceCycle ? null : (blueprint?.primaryRace || null);
  const weeks = blueprint?.weeks || [];
  const selectedWeek = weeks[selectedMacroWeekIdx] || weeks[0];
  const calculatedWeekNumber = selectedWeek?.weekNumber || (weekOffset >= 0 ? weekOffset + 1 : 1);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      purgeLegacyGlobalStorage();

      const isSuper = isMasterAdminEmail(userProfile?.email || user?.email);

      let storedAthleteId =
        userProfile?.intervalsAthleteId ||
        userStorage.getItem("athlete_id") ||
        (isSuper ? (process.env.NEXT_PUBLIC_DEFAULT_ATHLETE_ID || "") : "");

      let storedApiKey =
        userStorage.getItem("intervals_api_key") ||
        "";

      const storedGeminiKey = userStorage.getItem("custom_gemini_key") || "";
      const storedRaces = userStorage.getJSON<TargetRace[]>("target_races");
      const storedPlans = userStorage.getJSON<SeasonPlanItem[]>("season_plans");

      if (storedApiKey) {
        userStorage.setItem("intervals_api_key", storedApiKey);
      }
      if (storedAthleteId) {
        userStorage.setItem("athlete_id", storedAthleteId);
      }

      setApiKeyCache(storedApiKey);
      setGeminiKeyCache(storedGeminiKey);
      const storedWeight = userStorage.getItem("weight_kg");
      const storedHeight = userStorage.getItem("height_cm");
      const storedGender = userStorage.getItem("gender") as "M" | "F" | "OTHER" | null;
      const storedBirthDate = userStorage.getItem("birth_date");

      const resolvedWeight = storedWeight ? Number(storedWeight) : userProfile?.weightKg;
      const resolvedHeight = storedHeight ? Number(storedHeight) : userProfile?.heightCm;
      const resolvedGender = storedGender || userProfile?.gender;
      const resolvedBirthDate = storedBirthDate || userProfile?.birthDate;

      setProfile((prev) => ({
        ...prev,
        id: storedAthleteId,
        weight: resolvedWeight ?? prev.weight,
        heightCm: resolvedHeight ?? prev.heightCm,
        gender: resolvedGender ?? prev.gender,
        birthDate: resolvedBirthDate ?? prev.birthDate,
      }));

      if (userProfile?.targetRaces && Array.isArray(userProfile.targetRaces) && userProfile.targetRaces.length > 0) {
        setTargetRaces(userProfile.targetRaces);
        userStorage.setJSON("target_races", userProfile.targetRaces);
      } else if (storedRaces && Array.isArray(storedRaces) && storedRaces.length > 0) {
        setTargetRaces(storedRaces);
      } else {
        setTargetRaces([]);
      }

      // Resolver planes de temporada: UserProfile -> userStorage -> Firestore API (SOLO si hay storedAthleteId explícito)
      let resolvedPlans: SeasonPlanItem[] = [];
      if (userProfile?.seasonPlans && Array.isArray(userProfile.seasonPlans) && userProfile.seasonPlans.length > 0) {
        resolvedPlans = userProfile.seasonPlans;
      } else if (storedPlans && Array.isArray(storedPlans) && storedPlans.length > 0) {
        resolvedPlans = storedPlans;
      }

      // Si no hay planes en local ni sesión, consultar Firestore solo si existe un atleta válido explícito
      if (resolvedPlans.length === 0 && storedAthleteId) {
        try {
          const macroRes = await fetch(`/api/macrocycles?athleteId=${encodeURIComponent(storedAthleteId)}`);
          if (macroRes.ok) {
            const macroData = await macroRes.json();
            if (macroData.success && macroData.macrocycle?.blueprint) {
              const bp = macroData.macrocycle.blueprint;
              const restoredPlan: SeasonPlanItem = {
                id: macroData.macrocycle.id || "plan-active",
                planName: bp.cycleTitle || "Macrociclo Activo",
                goalType: "MARATON_42K",
                blueprint: bp,
                startDate: bp.startDate || new Date().toISOString().split("T")[0],
                endDate: bp.weeks?.[bp.weeks.length - 1]?.endDate || bp.endDate || new Date().toISOString().split("T")[0],
                totalWeeks: bp.totalWeeks || bp.weeks?.length || 16,
                status: "ACTIVE",
                orderIndex: 0,
                createdAt: macroData.macrocycle.createdAt || new Date().toISOString(),
              };
              resolvedPlans = [restoredPlan];
              if (macroData.macrocycle.primaryRace) {
                setTargetRaces([macroData.macrocycle.primaryRace]);
                userStorage.setJSON("target_races", [macroData.macrocycle.primaryRace]);
              }
            }
          }
        } catch (e) {
          console.warn("Aviso al recuperar macrociclo desde Firestore:", e);
        }
      }

      if (resolvedPlans.length > 0) {
        setSeasonPlans(resolvedPlans);
        setViewingPlanId(resolvedPlans[0].id);
        userStorage.setJSON("season_plans", resolvedPlans);
        if (resolvedPlans[0].blueprint) {
          const bp = resolvedPlans[0].blueprint;
          userStorage.setJSON("active_blueprint", bp);
          const currentIdx = bp.currentWeekIndex ?? 0;
          setSelectedMacroWeekIdx(currentIdx);
          if (bp.weeks && bp.weeks[currentIdx]) {
            setWeekOffset(getOffsetForWeek(bp.weeks[currentIdx]));
          }
          const primaryTargetRace = bp.primaryRace || null;
          setMacrocyclePhase({
            phase: bp.currentWeek?.phase || "MAINTENANCE",
            phaseLabel: bp.cycleTitle || "Macrociclo Activo",
            cycleBadgeLabel: bp.mode === "PRE_SEASON_MAINTENANCE" ? "🔵 MANTENIMIENTO PRE-TEMPORADA" : "🏃 CICLO ACTIVO",
            cycleBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
            weeksRemaining: bp.totalWeeks,
            daysRemaining: bp.totalWeeks ? bp.totalWeeks * 7 : null,
            primaryRace: primaryTargetRace,
            guideline: bp.currentWeek?.focusDescription || "",
            suggestedFocus: "Macrociclo Activo",
            badgeColor: "bg-amber-500/20 text-amber-300",
            maxLongRunMinutes: bp.currentWeek?.maxLongRunMinutes || 60,
            isSpecificMarathonPhase: bp.mode === "MARATHON_SPECIFIC",
            weeklyTssTarget: `${bp.currentWeek?.targetTss || 350} TSS`,
            blueprint: bp,
          });
        }
      } else {
        setSeasonPlans([]);
        setMacrocyclePhase(null);
      }

      const storedAvail = userStorage.getJSON<WeeklyAvailabilityMap>("weekly_availability");
      if (userProfile?.weeklyAvailability) {
        setWeeklyAvailability(userProfile.weeklyAvailability);
        userStorage.setJSON("weekly_availability", userProfile.weeklyAvailability);
      } else if (storedAvail && typeof storedAvail === "object" && Object.keys(storedAvail).length > 0) {
        setWeeklyAvailability(storedAvail);
      }

      setIsLoading(false);

      if (storedAthleteId || storedApiKey || userProfile?.encryptedApiKey) {
        refreshTelemetry(storedAthleteId, storedApiKey, profile.run_ftp, profile.bike_ftp);
      } else {
        setIsLiveConnected(false);
      }
    };

    init();
  }, [user?.uid, userProfile?.intervalsAthleteId, userProfile?.targetRaces, userProfile?.seasonPlans, userProfile?.weeklyAvailability, userProfile?.weightKg, userProfile?.heightCm, userProfile?.gender, userProfile?.birthDate, userStorage]);

  // Heartbeat de auto-recuperación: Solo si está desconectado y TIENE credenciales activas configuradas
  useEffect(() => {
    if (isLiveConnected || isLoading) return;
    const hasCredentials = Boolean(profile.id || apiKeyCache || userProfile?.encryptedApiKey);
    if (!hasCredentials) return;

    let retries = 0;
    const interval = setInterval(async () => {
      if (retries >= 5) {
        clearInterval(interval);
        return;
      }
      retries++;
      await refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp);
    }, 10000);

    return () => clearInterval(interval);
  }, [isLiveConnected, isLoading, profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp, refreshTelemetry, userProfile?.encryptedApiKey]);

  const isMasterAdmin = isMasterAdminEmail(userProfile?.email || user?.email);
  const displayName =
    profile.name && profile.name !== "Atleta"
      ? profile.name
      : (userProfile?.displayName || user?.displayName || (isMasterAdmin ? "Germán Morales" : "Atleta"));
  const email = userProfile?.email || user?.email || "";
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* SIDEBAR IZQUIERDO DEPORTIVO */}
      <AthleteSidebar
        activeSection={activeNavSection}
        onSelectSection={(section) => setActiveNavSection(section)}
        isIntervalsConnected={isLiveConnected}
        isGeminiConnected={Boolean(geminiKeyCache || isLiveConnected)}
        onOpenSeasonStudio={() => setActiveNavSection("season_studio")}
        onOpenCoachChat={() => setActiveNavSection("head_coach")}
        onOpenSettingsTab={(tab) => {
          setActiveNavSection("physiology");
        }}
      />

      {/* LIENZO DERECHO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* CABECERA INTEGRADA DEL LIENZO */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          {/* Logo y estado de conexión en móvil */}
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <PulseLogo size="sm" showSubtext={false} />
            </div>

            {/* Pill de conexión / sincronización rápida en móvil */}
            <button
              type="button"
              onClick={() => refreshTelemetry(profile.id, apiKeyCache, profile.run_ftp, profile.bike_ftp)}
              disabled={isRefreshingTelemetry}
              className="inline-flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer hover:bg-slate-100 touch-bounce"
              title="Toca para actualizar telemetría viva con Intervals.icu"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{isRefreshingTelemetry ? "Sync..." : isLiveConnected ? "En Vivo" : "Offline"}</span>
            </button>
          </div>

          {/* Menú de Usuario a la Derecha */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition cursor-pointer shadow-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-6 w-6 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white font-black text-[11px] flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold leading-none truncate max-w-[120px] text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5 font-bold">
                  {isMasterAdmin ? "Admin" : "Atleta"}
                </span>
              </div>
            </button>

            {/* Menú Flotante con Backdrop de Cierre */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800 dark:text-slate-200">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{displayName}</div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">{email}</div>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  {isMasterAdmin && (
                    <>
                      {onSelectView && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectView("dashboard");
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 text-cyan-600" />
                          <span>Panel Atleta</span>
                        </button>
                      )}

                      {onSelectView && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectView("admin");
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold transition cursor-pointer"
                        >
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span>Panel Admin</span>
                        </button>
                      )}

                      {onSelectView && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectView("landing");
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition cursor-pointer"
                        >
                          <Home className="h-4 w-4 text-slate-500" />
                          <span>Inicio</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      signOutUser();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
              </>
            )}
          </div>
        </header>

        {/* LIENZO PRINCIPAL DEL ATLETA */}
        <main className="flex-1 min-w-0 w-full max-w-[1550px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-5 pb-24 md:pb-6 space-y-4 sm:space-y-5">
        {/* BANNER ONBOARDING */}
        {!apiKeyCache && !userProfile?.encryptedApiKey && (!isMasterAdmin || profile.id !== "i442091") && (
          <OnboardingBanner onOpenOnboarding={() => setIsOnboardingOpen(true)} />
        )}

        {/* 1. VISTA DEDICADA: MI DASHBOARD (Cinta PMC + Calendario Continuo Multisemana) */}
        {activeNavSection === "dashboard" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Encabezado de Sección */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-sky-500" />
                  Mi Dashboard
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Métricas fisiológicas en vivo, telemetría PMC y calendario continuo de entrenamientos.
                </p>
              </div>
            </div>

            {/* TARJETAS DE TELEMETRÍA DINÁMICAS PMC */}
            <PhysiologicalCards
              status={physioStatus}
              runFtp={profile.run_ftp}
              bikeFtp={profile.bike_ftp}
              weightKg={profile.weight}
              age={profile.age}
              restingHR={profile.restingHR}
              hrv={physioStatus?.currentHrv}
              sleepQuality={latestWellness?.sleepQuality}
              sleepSecs={latestWellness?.sleepSecs}
              efficiencyFactor={profile.icu_efficiency_factor}
              visibleMetrics={visibleMetrics}
              onToggleMetric={handleToggleMetric}
            />

            {/* CALENDARIO CONTINUO SEMANAL O ESTADO VACÍO */}
            {blueprint ? (
              <AthleteContinuousCalendar
                blueprint={blueprint}
                selectedMacroWeekIdx={selectedMacroWeekIdx}
                onSelectWeek={setSelectedMacroWeekIdx}
                runFtp={profile.run_ftp || 0}
                bikeFtp={profile.bike_ftp || 0}
                weeklyAvailability={weeklyAvailability}
                weeklyExecutedTss={weeklyExecutedTss}
                dailyExecutedActivities={dailyExecutedActivities}
                onOpenAICoach={() => setActiveNavSection("head_coach")}
                onSyncWeekToIntervals={handleSyncToIntervals}
                onSelectWorkoutModal={(item) => setSelectedWorkoutModal(item)}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-12 text-center space-y-4 shadow-xs animate-fadeIn">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Sin Plan de Entrenamiento Activo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Actualmente no tienes ningún macrociclo en ejecución. Diseña un plan a medida con el Head Coach IA o selecciona un programa de la biblioteca para llenar tu calendario.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveNavSection("season_studio")}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Diseñar Macrociclo con IA</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. VISTA DEDICADA: ESTUDIO DE TEMPORADA & CARRERAS */}
        {activeNavSection === "season_studio" && (
          <AthleteSeasonStudioView
            athleteId={profile.id}
            runFtp={profile.run_ftp || 0}
            bikeFtp={profile.bike_ftp || 0}
            lthr={profile.lthr || 168}
            ctl={physioStatus?.ctl || profile.ctl || 0}
            weeklyAvailability={weeklyAvailability}
            targetRaces={targetRaces}
            seasonPlans={seasonPlans}
            onSaveTargetRaces={handleSaveTargetRaces}
            onSaveSeasonPlans={handleSaveSeasonPlans}
            onDeleteActivePlan={handleDeleteActivePlan}
            onApplyPlan={(newBlueprint, options) =>
              handleApplyMacrocycle(newBlueprint, undefined, "WIZARD_CUSTOM", options)
            }
            onNavigateToDashboard={() => setActiveNavSection("dashboard")}
            onNavigateToProfile={() => setActiveNavSection("physiology")}
            onOpenHeadCoach={() => setActiveNavSection("head_coach")}
          />
        )}

        {/* 4. VISTA DEDICADA: HEAD COACH IA EN VIVO */}
        {activeNavSection === "head_coach" && (
          <AthleteHeadCoachView
            profile={profile}
            physioStatus={physioStatus}
            macrocyclePhase={macrocyclePhase}
            weekOffset={weekOffset}
            weekNumber={calculatedWeekNumber}
            apiKey={apiKeyCache}
            geminiApiKey={geminiKeyCache}
            selectedModel={selectedModelCache}
            temperature={temperatureCache}
            weeklyAvailability={weeklyAvailability}
            currentPlan={
              activePlan.length > 0
                ? activePlan
                : selectedWeek
                ? generateWeekTemplate(
                    selectedWeek,
                    profile.run_ftp,
                    profile.bike_ftp,
                    (macrocyclePhase?.blueprint?.availabilitySnapshot as any) || weeklyAvailability,
                    (macrocyclePhase?.blueprint?.distanceType || primaryRace?.distance) as any,
                    profile.ctl
                  )
                : []
            }
            onApplyPlanAndSync={async (plan) => {
              if (plan) {
                await handleSyncToIntervals(plan);
              }
            }}
            onPlanUpdate={(plan) => setActivePlan(plan)}
          />
        )}

        {/* 4. VISTA DEDICADA: PERFIL DEL ATLETA, FISIOLOGÍA & INTEGRACIONES */}
        {activeNavSection === "physiology" && (
          <AthletePhysiologyView
            athleteId={profile.id}
            athleteName={profile.name || userProfile?.displayName || user?.displayName || "Atleta"}
            email={user?.email || userProfile?.email || ""}
            runFtp={profile.run_ftp || 0}
            bikeFtp={profile.bike_ftp || 0}
            weightKg={profile.weight}
            heightCm={profile.heightCm}
            birthDate={profile.birthDate}
            gender={profile.gender}
            apiKey={apiKeyCache}
            ctl={physioStatus?.ctl || profile.ctl || 0}
            atl={physioStatus?.atl || profile.atl || 0}
            tsb={physioStatus?.tsb || profile.tsb || 0}
            weeklyAvailability={weeklyAvailability}
            visibleMetrics={visibleMetrics}
            isLiveConnected={isLiveConnected}
            onTestConnection={async (testAthleteId) => {
              const res = await fetch("/api/test-connection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  athleteId: testAthleteId || profile.id,
                  apiKey: apiKeyCache,
                  uid: user?.uid,
                }),
              });
              const data = await res.json();
              if (data.success) {
                setIsLiveConnected(true);
                if (onLiveConnectedChange) onLiveConnectedChange(true);
                await refreshTelemetry(
                  testAthleteId || profile.id,
                  apiKeyCache,
                  data.runFtp || profile.run_ftp,
                  data.bikeFtp || profile.bike_ftp
                );
              }
              return data;
            }}
            onSave={async (data) => {
              await handleSaveSettings(data);
            }}
          />
        )}

        {/* MODAL DE DETALLE DE SESIÓN INDIVIDUAL / STRYD */}
        <WorkoutDetailModal
          workout={selectedWorkoutModal}
          dailyExecutedActivities={dailyExecutedActivities}
          onClose={() => setSelectedWorkoutModal(null)}
        />

        {/* Modal de Onboarding */}
        <IntervalsOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          initialAthleteId={profile.id}
          onSuccess={handleOnboardingSuccess}
        />

        {/* Modal de Notificación de Sincronización */}
        <SyncNotificationModal
          notification={syncNotification}
          onClose={() => setSyncNotification(null)}
        />
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR MÓVIL (PWA APP TABS) */}
      <AthleteMobileBottomNav
        activeSection={activeNavSection}
        onSelectSection={(section) => setActiveNavSection(section)}
        isIntervalsConnected={isLiveConnected}
      />
      </div>
    </div>
  );
};
