"use client";

import { useState } from "react";
import { PlanItem, WeeklyAvailabilityMap } from "@/lib/gemini/engine";
import { MacrocycleBlueprint, TargetRace } from "@/lib/physiology/macrocycle";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { SyncNotificationData } from "@/components/dashboard/SyncNotificationModal";
import { isMasterAdminEmail } from "@/lib/env";
import { UserStorage } from "@/lib/storage/userStorage";

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
}: UseIntervalsSyncProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<SyncNotificationData | null>(null);

  const handleSyncToIntervals = async (planToSync: PlanItem[]) => {
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

  const handleSyncFullMacrocycleToIntervals = async (
    blueprint?: MacrocycleBlueprint | null,
    weeklyAvailability?: WeeklyAvailabilityMap,
    primaryRace?: TargetRace | null
  ) => {
    if (!blueprint || !blueprint.weeks || blueprint.weeks.length === 0) {
      setSyncNotification({
        title: "Sin Macrociclo Activo",
        message: "No hay un macrociclo activo cargado para sincronizar.",
        type: "error",
      });
      return;
    }

    const fullCyclePlan: PlanItem[] = [];
    blueprint.weeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week,
        runFtp,
        bikeFtp,
        (blueprint.availabilitySnapshot as any) || weeklyAvailability,
        (blueprint.distanceType || primaryRace?.distance) as any,
        ctl
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
      setSyncNotification({
        title: "¡Macrociclo Sincronizado con Éxito!",
        message: `Se cargaron ${data.createdCount || structuredCount} entrenamientos estructurados en tu calendario de Intervals.icu (${blueprint.weeks.length} semanas).`,
        details: `Cada día refleja exactamente tu disponibilidad semanal de deportes, días de descanso (0 TSS) y zonas de potencia (Stryd CP: ${runFtp}W, Bike FTP: ${bikeFtp}W).`,
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

  return {
    isSyncing,
    syncNotification,
    setSyncNotification,
    handleSyncToIntervals,
    handleSyncFullMacrocycleToIntervals,
  };
}
