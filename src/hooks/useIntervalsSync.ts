"use client";

import { useState } from "react";
import { PlanItem, WeeklyAvailabilityMap, resolveEffectiveAvailability } from "@/lib/gemini/engine";
import { MacrocycleBlueprint, TargetRace } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { SyncNotificationData } from "@/components/dashboard/SyncNotificationModal";
import { isMasterAdminEmail } from "@/lib/env";
import { UserStorage } from "@/lib/storage/userStorage";
import { notificationService } from "@/lib/notifications/notificationService";

interface UseIntervalsSyncProps {
  athleteId: string;
  apiKeyCache: string;
  runFtp?: number;
  bikeFtp?: number;
  ctl?: number;
  user: any;
  userProfile: any;
  userStorage: UserStorage;
  onOpenSettings?: (tab: "intervals") => void;
  isReadOnly?: boolean;
  runningOpts?: { mode?: "POWER" | "PACE" | "HYBRID"; thresholdPaceSec?: number; thresholdPaceStr?: string; lthr?: number };
}

export function useIntervalsSync({
  athleteId,
  apiKeyCache,
  runFtp = 0,
  bikeFtp = 0,
  ctl = 0,
  user,
  userProfile,
  userStorage,
  onOpenSettings,
  isReadOnly = false,
  runningOpts,
}: UseIntervalsSyncProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<SyncNotificationData | null>(null);

  const handleSyncToIntervals = async (planToSync: PlanItem[]) => {
    if (isReadOnly) {
      setSyncNotification({
        title: "Modo Auditoría (Solo Lectura)",
        message: "Las sincronizaciones a Intervals.icu están deshabilitadas en modo auditoría para proteger los datos del atleta.",
        type: "error",
      });
      return;
    }
    setIsSyncing(true);
    try {
      const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || "";
      const isSuper = isMasterAdminEmail(userProfile?.email || user?.email);

      if (!athleteId && !isSuper) {
        if (onOpenSettings) onOpenSettings("intervals");
        throw new Error("Por favor configura tu Athlete ID de Intervals.icu en Ajustes antes de sincronizar.");
      }

      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          plan: planToSync,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.isAuthError && onOpenSettings) {
          onOpenSettings("intervals");
        }
        throw new Error(data.error || "Fallo en la sincronización con Intervals.icu");
      }

      notificationService.addNotification(userStorage, {
        title: "Microciclo Sincronizado",
        message: `Se cargaron ${data.createdCount || 7} entrenamientos en tu calendario de Intervals.icu y Garmin Connect.`,
        category: "SYNC",
        severity: "success",
      });
    } catch (err: any) {
      notificationService.addNotification(userStorage, {
        title: "Error de Sincronización",
        message: err.message || "No se pudo sincronizar el microciclo con Intervals.icu.",
        category: "SYNC",
        severity: "warning",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFullMacrocycleToIntervals = async (
    blueprint?: MacrocycleBlueprint | null,
    weeklyAvailability?: WeeklyAvailabilityMap,
    primaryRace?: TargetRace | null
  ) => {
    if (isReadOnly) {
      setSyncNotification({
        title: "Modo Auditoría (Solo Lectura)",
        message: "Las sincronizaciones a Intervals.icu están deshabilitadas en modo auditoría para proteger los datos del atleta.",
        type: "error",
      });
      return;
    }
    if (!blueprint || !blueprint.weeks || blueprint.weeks.length === 0) {
      setSyncNotification({
        title: "Sin Macrociclo Activo",
        message: "No hay un macrociclo activo cargado para sincronizar.",
        type: "error",
      });
      return;
    }

    const effPrimaryRaceDate = blueprint.primaryRace?.date || blueprint.raceDate || primaryRace?.date || undefined;
    const effRunningOpts = {
      ...runningOpts,
      mode: blueprint.runningTrainingMode || runningOpts?.mode || (runFtp > 0 ? "POWER" : "PACE"),
      raceGoal: blueprint.primaryRace?.goalTarget || primaryRace?.goalTarget,
    };
    const fullCyclePlan: PlanItem[] = [];
    blueprint.weeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week, runFtp, bikeFtp,
        resolveEffectiveAvailability((blueprint.availabilitySnapshot as any) || weeklyAvailability),
        (blueprint.distanceType || primaryRace?.distance) as any, ctl, effPrimaryRaceDate, effRunningOpts
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
      const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || "";
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          plan: fullCyclePlan,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.isAuthError && onOpenSettings) {
          onOpenSettings("intervals");
        }
        throw new Error(data.error || "Fallo en la sincronización con Intervals.icu");
      }

      const structuredCount = fullCyclePlan.filter((p) => !p.isRestDay && p.discipline !== "Descanso").length;
      notificationService.addNotification(userStorage, {
        title: "Temporada Sincronizada",
        message: `Se cargaron ${data.createdCount || structuredCount} entrenamientos en Intervals.icu y Garmin Connect (${blueprint.weeks.length} semanas).`,
        details: runningOpts?.mode === "PACE"
          ? `Zonas por Ritmo (Pace: ${runningOpts.thresholdPaceStr || "4:45"}/km, Bike FTP: ${bikeFtp}W).`
          : `Zonas por Potencia (Stryd CP: ${runFtp}W, Bike FTP: ${bikeFtp}W).`,
        category: "SYNC",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error al sincronizar macrociclo completo:", err);
      notificationService.addNotification(userStorage, {
        title: "Error de Sincronización",
        message: err.message || "No se pudo sincronizar la temporada con Intervals.icu.",
        category: "SYNC",
        severity: "warning",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncTriweeklyBlockToIntervals = async (
    blueprint?: MacrocycleBlueprint | null,
    weeklyAvailability?: WeeklyAvailabilityMap,
    primaryRace?: TargetRace | null,
    startWeekIndex: number = 0
  ) => {
    if (isReadOnly) {
      setSyncNotification({
        title: "Modo Auditoría (Solo Lectura)",
        message: "Las sincronizaciones a Intervals.icu están deshabilitadas en modo auditoría para proteger los datos del atleta.",
        type: "error",
      });
      return;
    }
    if (!blueprint || !blueprint.weeks || blueprint.weeks.length === 0) {
      setSyncNotification({
        title: "Sin Macrociclo Activo",
        message: "No hay un macrociclo activo cargado para sincronizar.",
        type: "error",
      });
      return;
    }

    const effectiveStartIndex = Math.max(0, Math.min(startWeekIndex, blueprint.weeks.length - 1));
    const targetWeeks = blueprint.weeks.slice(effectiveStartIndex, effectiveStartIndex + 3);

    if (targetWeeks.length === 0) {
      setSyncNotification({
        title: "Fin del Plan",
        message: "No hay más semanas futuras en este macrociclo para sincronizar.",
        type: "error",
      });
      return;
    }

    const triweeklyPlan: PlanItem[] = [];
    const effPrimaryRaceDate = blueprint.primaryRace?.date || blueprint.raceDate || primaryRace?.date || undefined;
    const effRunningOpts = {
      ...runningOpts,
      mode: blueprint.runningTrainingMode || runningOpts?.mode || (runFtp > 0 ? "POWER" : "PACE"),
      raceGoal: blueprint.primaryRace?.goalTarget || primaryRace?.goalTarget,
    };
    targetWeeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week, runFtp, bikeFtp,
        resolveEffectiveAvailability((blueprint.availabilitySnapshot as any) || weeklyAvailability),
        (blueprint.distanceType || primaryRace?.distance) as any, ctl, effPrimaryRaceDate, effRunningOpts
      );
      triweeklyPlan.push(...weekPlan);
    });

    setIsSyncing(true);
    try {
      const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || "";
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          plan: triweeklyPlan,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.isAuthError && onOpenSettings) onOpenSettings("intervals");
        throw new Error(data.error || "Fallo en la sincronización con Intervals.icu");
      }

      const weekNumbers = targetWeeks.map((w) => w.weekNumber).join(", ");
      const structuredCount = triweeklyPlan.filter((p) => !p.isRestDay && p.discipline !== "Descanso").length;

      notificationService.addNotification(userStorage, {
        title: `Bloque de 3 Semanas Sincronizado (Sem. ${weekNumbers})`,
        message: `Se cargaron ${data.createdCount || structuredCount} entrenamientos en Intervals.icu y Garmin Connect (${targetWeeks[0].formattedRange} al ${targetWeeks[targetWeeks.length - 1].formattedRange}).`,
        category: "SYNC",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error al sincronizar bloque de 3 semanas:", err);
      notificationService.addNotification(userStorage, {
        title: "Error de Sincronización",
        message: err.message || "No se pudo sincronizar el bloque de 3 semanas.",
        category: "SYNC",
        severity: "warning",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteFutureWorkouts = async (fromDateStr?: string) => {
    if (isReadOnly) {
      notificationService.addNotification(userStorage, {
        title: "Modo Auditoría (Solo Lectura)",
        message: "Las modificaciones a Intervals.icu están deshabilitadas en modo auditoría.",
        category: "ALERT",
        severity: "warning",
      });
      return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const targetFromDate = fromDateStr || todayStr;
    setIsSyncing(true);
    try {
      const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || "";
      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_future",
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          fromDate: targetFromDate,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al eliminar sesiones en Intervals.icu");
      notificationService.addNotification(userStorage, {
        title: "Limpieza Completada en Intervals.icu",
        message: `Se retiraron ${data.deletedCount || 0} sesiones planificadas a partir del ${targetFromDate}.`,
        category: "SEASON",
        severity: "info",
      });
    } catch (err: any) {
      notificationService.addNotification(userStorage, {
        title: "Error de Limpieza",
        message: err.message || "No se pudieron eliminar los entrenamientos futuros.",
        category: "SEASON",
        severity: "warning",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncNotification,
    setSyncNotification,
    handleSyncToIntervals,
    handleSyncFullMacrocycleToIntervals,
    handleSyncTriweeklyBlockToIntervals,
    handleDeleteFutureWorkouts,
  };
}
