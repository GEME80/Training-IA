"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MacrocyclePhaseInfo,
  TargetRace,
  MacrocycleBlueprint,
  SeasonPlanItem,
  calculatePlanStatus,
  calculateMacrocyclePhase,
  getOffsetForWeek,
} from "@/lib/physiology/macrocycle";
import { resolveCurrentWeekIndex, syncBlueprintToCurrentDate } from "@/lib/physiology/macrocycleSync";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";
import { UserStorage } from "@/lib/storage/userStorage";
import { isMasterAdminEmail } from "@/lib/env";
import { SyncNotificationData } from "@/components/dashboard/SyncNotificationModal";

interface UseSeasonPlansProps {
  user: any;
  userProfile: any;
  userStorage: UserStorage;
  profileId: string;
  runFtp?: number;
  bikeFtp?: number;
  apiKeyCache?: string;
  refreshTelemetry?: (athleteId?: string, apiKey?: string, runFtp?: number, bikeFtp?: number) => Promise<void>;
  setSyncNotification?: (data: SyncNotificationData | null) => void;
}

function createPhaseInfoFromBlueprint(bp: MacrocycleBlueprint, race?: TargetRace | null): MacrocyclePhaseInfo {
  return {
    phase: bp.currentWeek?.phase || "MAINTENANCE",
    phaseLabel: bp.cycleTitle || "Macrociclo Activo",
    cycleBadgeLabel: bp.mode === "PRE_SEASON_MAINTENANCE" ? "🔵 MANTENIMIENTO PRE-TEMPORADA" : "🏃 CICLO ACTIVO",
    cycleBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    weeksRemaining: bp.totalWeeks,
    daysRemaining: bp.totalWeeks ? bp.totalWeeks * 7 : null,
    primaryRace: race || bp.primaryRace || null,
    guideline: bp.currentWeek?.focusDescription || "",
    suggestedFocus: "Macrociclo Activo",
    badgeColor: "bg-amber-500/20 text-amber-300",
    maxLongRunMinutes: bp.currentWeek?.maxLongRunMinutes || 60,
    isSpecificMarathonPhase: bp.mode === "MARATHON_SPECIFIC",
    weeklyTssTarget: `${bp.currentWeek?.targetTss || 350} TSS`,
    blueprint: bp,
  };
}

async function persistProfileField(uid: string, email: string, fields: Record<string, any>) {
  try {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: uid || "demo-user", email, ...fields }),
    });
  } catch (e) {
    console.warn("Aviso al persistir en perfil:", e);
  }
}

export function useSeasonPlans({
  user,
  userProfile,
  userStorage,
  profileId,
  runFtp,
  bikeFtp,
  apiKeyCache,
  refreshTelemetry,
  setSyncNotification,
}: UseSeasonPlansProps) {
  const isSuper = isMasterAdminEmail(userProfile?.email || user?.email);

  const [targetRaces, setTargetRaces] = useState<TargetRace[]>([]);
  const [seasonPlans, setSeasonPlans] = useState<SeasonPlanItem[]>([]);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const [selectedMacroWeekIdx, setSelectedMacroWeekIdx] = useState<number>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = userStorage.getItem("active_blueprint") || localStorage.getItem("sgea_active_blueprint");
        if (saved) {
          const bp = JSON.parse(saved);
          if (bp?.weeks && Array.isArray(bp.weeks)) return resolveCurrentWeekIndex(bp.weeks);
        }
      }
    } catch {}
    return 0;
  });

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(
    userProfile?.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY
  );
  const [macrocyclePhase, setMacrocyclePhase] = useState<MacrocyclePhaseInfo | null>(() => calculateMacrocyclePhase([]));

  const activePlanItem = useMemo(() => {
    return seasonPlans.find((p) => calculatePlanStatus(p.startDate, p.endDate) === "ACTIVE") || seasonPlans[0] || null;
  }, [seasonPlans]);

  const upcomingPlanItem = useMemo(() => {
    return seasonPlans.find((p) => calculatePlanStatus(p.startDate, p.endDate) === "UPCOMING") || null;
  }, [seasonPlans]);

  const currentlyViewedPlan = useMemo(() => {
    return seasonPlans.find((p) => p.id === viewingPlanId) || activePlanItem;
  }, [seasonPlans, viewingPlanId, activePlanItem]);

  const primaryARace = useMemo(() => targetRaces.find((r) => r.priority === "A") || null, [targetRaces]);

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

  const handleApplyMacrocycle = async (
    newBlueprint: MacrocycleBlueprint,
    primaryTargetRace?: TargetRace,
    source: "AI_GENERATED" | "WIZARD_CUSTOM" = "WIZARD_CUSTOM",
    options?: { mode?: "CHAIN" | "REPLACE" }
  ) => {
    const updatedRaces = primaryTargetRace
      ? [primaryTargetRace, ...targetRaces.filter((r) => r.id !== primaryTargetRace.id && r.priority !== "A")]
      : targetRaces;

    const syncedBlueprint = syncBlueprintToCurrentDate(newBlueprint);
    userStorage.setJSON("target_races", updatedRaces);
    userStorage.setJSON("active_blueprint", syncedBlueprint);

    const todayStr = new Date().toISOString().split("T")[0];
    const sDate = syncedBlueprint.startDate || todayStr;
    const eDate = syncedBlueprint.weeks?.[syncedBlueprint.weeks.length - 1]?.endDate || todayStr;

    const newPlanItem: SeasonPlanItem = {
      id: "plan-" + Date.now(),
      planName: syncedBlueprint.cycleTitle,
      goalType: "MARATON_42K",
      blueprint: syncedBlueprint,
      startDate: sDate,
      endDate: eDate,
      totalWeeks: syncedBlueprint.totalWeeks || 16,
      status: calculatePlanStatus(sDate, eDate),
      orderIndex: options?.mode === "CHAIN" ? seasonPlans.length : 0,
      createdAt: new Date().toISOString(),
    };

    const updatedPlans = options?.mode === "CHAIN" && seasonPlans.length > 0 ? [...seasonPlans, newPlanItem] : [newPlanItem];
    setSeasonPlans(updatedPlans);
    setViewingPlanId(newPlanItem.id);
    userStorage.setJSON("season_plans", updatedPlans);

    let phaseInfo = calculateMacrocyclePhase(updatedRaces) || createPhaseInfoFromBlueprint(syncedBlueprint, primaryTargetRace);
    phaseInfo.blueprint = syncedBlueprint;
    setMacrocyclePhase(phaseInfo);

    try {
      await fetch("/api/macrocycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId: profileId, blueprint: syncedBlueprint, primaryRace: primaryTargetRace || syncedBlueprint.primaryRace, source }),
      });
    } catch (e) {
      console.warn("Aviso al persistir macrociclo en Firestore:", e);
    }

    const initIdx = syncedBlueprint.currentWeekIndex ?? 0;
    setSelectedMacroWeekIdx(initIdx);
    setWeekOffset(syncedBlueprint.weeks?.[initIdx] ? getOffsetForWeek(syncedBlueprint.weeks[initIdx]) : 0);

    if (setSyncNotification) {
      setSyncNotification({
        title: "¡Macrociclo Activado con Éxito!",
        message: `El plan "${newBlueprint.cycleTitle}" (${newBlueprint.weeks.length} semanas) ha sido fijado como tu ciclo activo en el calendario.`,
        type: "success",
      });
    }
    if (refreshTelemetry) await refreshTelemetry(profileId, apiKeyCache, runFtp, bikeFtp);
  };

  const handleUpdateWeekMicrocycle = async (weekIdx: number, newType: any) => {
    const currentBp = currentlyViewedPlan?.blueprint || macrocyclePhase?.blueprint;
    if (!currentBp?.weeks?.[weekIdx]) return;

    const updatedWeeks = [...currentBp.weeks];
    updatedWeeks[weekIdx] = { ...updatedWeeks[weekIdx], microcycleType: newType };
    const updatedBlueprint = { ...currentBp, weeks: updatedWeeks };

    const updatedPlans = seasonPlans.map((p) => (p.id === currentlyViewedPlan?.id ? { ...p, blueprint: updatedBlueprint } : p));
    setSeasonPlans(updatedPlans);
    userStorage.setJSON("season_plans", updatedPlans);
    userStorage.setJSON("active_blueprint", updatedBlueprint);
    if (macrocyclePhase) setMacrocyclePhase({ ...macrocyclePhase, blueprint: updatedBlueprint });
  };

  const handleSaveTargetRaces = async (races: TargetRace[]) => {
    setTargetRaces(races);
    userStorage.setJSON("target_races", races);
    await persistProfileField(user?.uid, user?.email || userProfile?.email || "", { targetRaces: races });
  };

  const handleSaveSeasonPlans = async (plans: SeasonPlanItem[]) => {
    setSeasonPlans(plans);
    if (plans.length > 0) {
      userStorage.setJSON("season_plans", plans);
      if (plans[0].blueprint) userStorage.setJSON("active_blueprint", plans[0].blueprint);
    } else {
      userStorage.removeItem("season_plans");
      userStorage.removeItem("active_blueprint");
      setViewingPlanId(null);
      setMacrocyclePhase(null);
    }
    await persistProfileField(user?.uid, user?.email || userProfile?.email || "", { seasonPlans: plans });
  };

  const handleDeleteActivePlan = async () => {
    await handleSaveSeasonPlans([]);
    setViewingPlanId(null);
    setMacrocyclePhase(null);
    if (setSyncNotification) {
      setSyncNotification({
        title: "Plan Eliminado",
        message: "El macrociclo activo ha sido eliminado. Tu calendario ha quedado restablecido.",
        type: "success",
      });
    }
  };

  useEffect(() => {
    const initPlans = async () => {
      const storedRaces = userStorage.getJSON<TargetRace[]>("target_races");
      const storedPlans = userStorage.getJSON<SeasonPlanItem[]>("season_plans");

      if (userProfile?.targetRaces?.length) {
        setTargetRaces(userProfile.targetRaces);
        userStorage.setJSON("target_races", userProfile.targetRaces);
      } else if (storedRaces?.length) {
        setTargetRaces(storedRaces);
      } else {
        setTargetRaces([]);
      }

      let resolvedPlans: SeasonPlanItem[] = [];
      if (userProfile?.seasonPlans?.length) resolvedPlans = userProfile.seasonPlans;
      else if (storedPlans?.length) resolvedPlans = storedPlans;

      const storedAthleteId = profileId || userProfile?.intervalsAthleteId;
      if (resolvedPlans.length === 0 && storedAthleteId && (isSuper || storedAthleteId !== "i442091")) {
        try {
          const userEmailParam = encodeURIComponent(userProfile?.email || user?.email || "");
          const macroRes = await fetch(`/api/macrocycles?athleteId=${encodeURIComponent(storedAthleteId)}&requesterEmail=${userEmailParam}`);
          if (macroRes.ok) {
            const macroData = await macroRes.json();
            if (macroData.success && macroData.macrocycle?.blueprint) {
              const bp = syncBlueprintToCurrentDate(macroData.macrocycle.blueprint);
              const restoredPlan: SeasonPlanItem = {
                id: macroData.macrocycle.id || "plan-active",
                planName: bp.cycleTitle || "Macrociclo Activo",
                goalType: "MARATON_42K",
                blueprint: bp,
                startDate: bp.startDate || new Date().toISOString().split("T")[0],
                endDate: bp.weeks?.[bp.weeks.length - 1]?.endDate || new Date().toISOString().split("T")[0],
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
        const syncedPlans = resolvedPlans.map((p) => (p.blueprint ? { ...p, blueprint: syncBlueprintToCurrentDate(p.blueprint) } : p));
        setSeasonPlans(syncedPlans);
        setViewingPlanId(syncedPlans[0].id);
        userStorage.setJSON("season_plans", syncedPlans);
        if (syncedPlans[0].blueprint) {
          const bp = syncedPlans[0].blueprint;
          userStorage.setJSON("active_blueprint", bp);
          const currentIdx = resolveCurrentWeekIndex(bp.weeks);
          setSelectedMacroWeekIdx(currentIdx);
          if (bp.weeks?.[currentIdx]) setWeekOffset(getOffsetForWeek(bp.weeks[currentIdx]));
          setMacrocyclePhase(createPhaseInfoFromBlueprint(bp));
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
    };

    initPlans();
  }, [user?.uid, userProfile?.seasonPlans, userProfile?.targetRaces, userProfile?.weeklyAvailability, userStorage, profileId, isSuper, user?.email, userProfile?.email, userProfile?.intervalsAthleteId]);

  return {
    targetRaces, setTargetRaces, seasonPlans, setSeasonPlans, viewingPlanId, setViewingPlanId,
    weekOffset, setWeekOffset, selectedMacroWeekIdx, setSelectedMacroWeekIdx,
    weeklyAvailability, setWeeklyAvailability, macrocyclePhase, setMacrocyclePhase,
    activePlanItem, upcomingPlanItem, currentlyViewedPlan, primaryARace, blueprint,
    isMaintenanceCycle, primaryRace, weeks, selectedWeek, calculatedWeekNumber,
    handleApplyMacrocycle, handleUpdateWeekMicrocycle, handleSaveTargetRaces,
    handleSaveSeasonPlans, handleDeleteActivePlan,
  };
}
