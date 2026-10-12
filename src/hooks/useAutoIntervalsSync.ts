"use client";

import { useEffect, useRef, useCallback } from "react";
import { UserStorage } from "@/lib/storage/userStorage";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap, resolveEffectiveAvailability } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import {
  isAthleteEligibleForAutoSync,
  calculateRollingWindow,
  computePlanHash,
  isRollingSyncNeeded,
} from "@/lib/physiology/rollingSyncEngine";
import { notificationService } from "@/lib/notifications/notificationService";

interface UseAutoIntervalsSyncProps {
  athleteId?: string;
  apiKeyCache?: string;
  user: any;
  userProfile: any;
  userStorage: UserStorage;
  blueprint: MacrocycleBlueprint | null;
  weeklyAvailability?: WeeklyAvailabilityMap;
  runFtp?: number;
  bikeFtp?: number;
  ctl?: number;
  runningOpts?: {
    mode?: "POWER" | "PACE" | "HYBRID";
    thresholdPaceSec?: number;
    thresholdPaceStr?: string;
    lthr?: number;
  };
  refreshTelemetry?: (athleteId?: string, apiKey?: string, runFtp?: number, bikeFtp?: number) => Promise<void>;
  isReadOnly?: boolean;
}

/**
 * Hook de sincronización continua por buffer rodante de 3 semanas (21 días).
 * Se ejecuta en segundo plano (0 clics del atleta) evaluando compuertas de elegibilidad,
 * avance de fecha y cambios en el plan (Dirty Hash).
 */
export function useAutoIntervalsSync({
  athleteId,
  apiKeyCache,
  user,
  userProfile,
  userStorage,
  blueprint,
  weeklyAvailability,
  runFtp = 0,
  bikeFtp = 0,
  ctl = 0,
  runningOpts,
  refreshTelemetry,
  isReadOnly = false,
}: UseAutoIntervalsSyncProps) {
  const isExecutingRef = useRef<boolean>(false);
  const lastCheckTimestampRef = useRef<number>(0);

  const checkAndExecuteRollingSync = useCallback(async () => {
    // Throttling mínimo: no evaluar más de una vez cada 20 segundos
    const now = Date.now();
    if (now - lastCheckTimestampRef.current < 20000 || isExecutingRef.current) {
      return;
    }
    lastCheckTimestampRef.current = now;

    const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || userProfile?.intervalsApiKey || "";

    // 1. Validar elegibilidad del atleta productivo (6 compuertas de seguridad)
    const isEligible = isAthleteEligibleForAutoSync({
      isReadOnly,
      status: userProfile?.status,
      email: user?.email || userProfile?.email,
      isDemo: Boolean(userProfile?.isDemo),
      athleteId,
      apiKey: activeApiKey,
      hasPlan: Boolean(blueprint?.weeks && blueprint.weeks.length > 0),
      autoSyncIntervals: userProfile?.autoSyncIntervals,
      hasEncryptedKey: Boolean(userProfile?.encryptedApiKey),
      hasApiKey: Boolean(userProfile?.hasApiKey),
    });

    if (!isEligible || !blueprint?.weeks) return;

    // 2. Extraer ventana rodante de 3 semanas (21 días hacia adelante)
    const todayStr = new Date().toISOString().split("T")[0];
    const { targetWeeks, fromDate, toDate } = calculateRollingWindow(blueprint.weeks, todayStr, 3);
    if (targetWeeks.length === 0) return;

    // 3. Generar entrenamientos para la ventana
    const effPrimaryRaceDate = blueprint.primaryRace?.date || blueprint.raceDate || undefined;
    const effRunningOpts = {
      ...runningOpts,
      mode: blueprint.runningTrainingMode || runningOpts?.mode || (runFtp > 0 ? "POWER" : "PACE"),
      raceGoal: blueprint.primaryRace?.goalTarget,
    };

    const rollingPlan: PlanItem[] = [];
    targetWeeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week,
        runFtp,
        bikeFtp,
        resolveEffectiveAvailability((blueprint.availabilitySnapshot as any) || weeklyAvailability),
        (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
        ctl || 35,
        effPrimaryRaceDate,
        effRunningOpts
      );
      rollingPlan.push(...weekPlan);
    });

    const futurePlan = rollingPlan.filter((item) => !item.date || item.date >= fromDate);
    if (futurePlan.length === 0) return;

    // 4. Calcular Hash de contenido para Dirty Checking
    const currentHash = computePlanHash(futurePlan, {
      runFtp,
      bikeFtp,
      runningMode: effRunningOpts.mode,
      thresholdPaceSec: effRunningOpts.thresholdPaceSec,
    });

    const syncToKey = `last_synced_to_${athleteId}`;
    const syncHashKey = `last_synced_hash_${athleteId}`;
    const lastSyncedTo = userStorage.getItem(syncToKey);
    const lastSyncedHash = userStorage.getItem(syncHashKey);

    const isNeeded = isRollingSyncNeeded(lastSyncedTo, toDate, todayStr, lastSyncedHash, currentHash, 14);
    if (!isNeeded) return;

    // 5. Ejecutar sincronización silenciosa en segundo plano
    try {
      isExecutingRef.current = true;
      console.info(`[AutoIntervalsSync] Sincronizando buffer rodante (${fromDate} al ${toDate}) para ${athleteId}...`);

      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clean_and_sync",
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          fromDate,
          toDate,
          plan: futurePlan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        userStorage.setItem(syncToKey, toDate);
        userStorage.setItem(syncHashKey, currentHash);

        const weekCount = targetWeeks.length;
        const createdCount = data.createdCount || futurePlan.length;

        // Registrar en el Espacio de Notificaciones
        notificationService.addNotification(userStorage, {
          title: "Sincronización Automática",
          message: `Próximas ${weekCount} semanas actualizadas en tu reloj Garmin e Intervals.icu (${createdCount} sesiones).`,
          details: `Ventana activa del ${fromDate} al ${toDate}.`,
          category: "SYNC",
          severity: "success",
        });

        if (refreshTelemetry) {
          await refreshTelemetry(athleteId, activeApiKey, runFtp, bikeFtp);
        }
      } else {
        console.warn("[AutoIntervalsSync] Backend reportó aviso:", data.error);
        if (data.isAuthError) {
          notificationService.addNotification(userStorage, {
            title: "Reconexión de Intervals.icu Requerida",
            message: "No se pudo actualizar tu reloj Garmin. Por favor verifica tu API Key en Ajustes.",
            category: "SYNC",
            severity: "warning",
          });
        }
      }
    } catch (err) {
      console.warn("[AutoIntervalsSync] Error silencioso en sincronización en background:", err);
    } finally {
      isExecutingRef.current = false;
    }
  }, [
    athleteId,
    apiKeyCache,
    user?.uid,
    user?.email,
    userProfile,
    userStorage,
    blueprint,
    weeklyAvailability,
    runFtp,
    bikeFtp,
    ctl,
    runningOpts,
    refreshTelemetry,
    isReadOnly,
  ]);

  useEffect(() => {
    // Trigger 1: Mount inicial de la app
    checkAndExecuteRollingSync();

    // Trigger 2: Retorno a primer plano en móvil (desbloqueo o cambio de pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndExecuteRollingSync();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkAndExecuteRollingSync);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkAndExecuteRollingSync);
    };
  }, [checkAndExecuteRollingSync]);
}
