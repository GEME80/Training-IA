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
import { CalendarEvent } from "@/lib/intervals/types";

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
  calendarEvents?: CalendarEvent[];
  refreshTelemetry?: (athleteId?: string, apiKey?: string, runFtp?: number, bikeFtp?: number) => Promise<void>;
  isTelemetryLoading?: boolean;
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
  calendarEvents,
  isTelemetryLoading = false,
  isReadOnly = false,
}: UseAutoIntervalsSyncProps) {
  const isExecutingRef = useRef<boolean>(false);
  const lastCheckTimestampRef = useRef<number>(0);

  const checkAndExecuteRollingSync = useCallback(async () => {
    // 0. Bloquear si ya está en ejecución o si la telemetría de perfil aún se está resolviendo
    if (isExecutingRef.current || isTelemetryLoading) return;

    // 1. Si los datos mínimos aún no están en memoria, abortar de inmediato SIN penalizar el throttle
    if (!athleteId || !blueprint?.weeks || blueprint.weeks.length === 0) {
      return;
    }

    const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || userProfile?.intervalsApiKey || "";

    // 2. Validar elegibilidad del atleta productivo (6 compuertas de seguridad)
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

    if (!isEligible) return;

    // 3. Throttling mínimo: evitar re-evaluaciones repetitivas en la misma sesión
    const now = Date.now();
    if (lastCheckTimestampRef.current > 0 && now - lastCheckTimestampRef.current < 60000) {
      return;
    }

    // 4. Extraer ventana rodante de 3 semanas (21 días hacia adelante)
    const todayStr = new Date().toISOString().split("T")[0];
    const { targetWeeks, toDate } = calculateRollingWindow(blueprint.weeks, todayStr, 3);
    if (targetWeeks.length === 0) return;

    // Generar entrenamientos para la ventana con métricas estables del macrociclo
    const stableCtl = blueprint.athleteCtlAtCreation || userProfile?.ctl || ctl || 35;
    const stableRunFtp = userProfile?.runFtp || runFtp || 0;
    const stableBikeFtp = userProfile?.bikeFtp || bikeFtp || 0;
    const stableThresholdPace = userProfile?.runThresholdPaceSecPerKm || runningOpts?.thresholdPaceSec || 285;

    const effPrimaryRaceDate = blueprint.primaryRace?.date || blueprint.raceDate || undefined;
    const effRunningMode = blueprint.runningTrainingMode || runningOpts?.mode || (stableRunFtp > 0 ? "POWER" : "PACE");
    const effRunningOpts = {
      ...runningOpts,
      mode: effRunningMode,
      thresholdPaceSec: stableThresholdPace,
      raceGoal: blueprint.primaryRace?.goalTarget,
    };

    const rollingPlan: PlanItem[] = [];
    targetWeeks.forEach((week) => {
      const weekPlan = generateWeekTemplate(
        week,
        stableRunFtp,
        stableBikeFtp,
        resolveEffectiveAvailability((blueprint.availabilitySnapshot as any) || weeklyAvailability),
        (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
        stableCtl,
        effPrimaryRaceDate,
        effRunningOpts
      );
      rollingPlan.push(...weekPlan);
    });

    // Solo sincronizar entrenamientos desde hoy en adelante (nunca re-subir ni borrar días ya pasados)
    const futurePlan = rollingPlan.filter((item) => !item.date || item.date >= todayStr);
    if (futurePlan.length === 0) return;

    // 5. Calcular Hash estructural sobre las 3 semanas completas (invariante al día de la semana)
    const currentHash = computePlanHash(rollingPlan, {
      runningMode: effRunningMode,
    });

    const syncToKey = `last_synced_to_${athleteId}`;
    const syncHashKey = `last_synced_hash_${athleteId}`;
    const lastSyncedTo = userStorage.getItem(syncToKey);
    const lastSyncedHash = userStorage.getItem(syncHashKey);

    // Verificar sesiones [PULSE AI] que YA existen realmente en el calendario de Intervals.icu
    const activeFutureWorkouts = futurePlan.filter((item) => !item.isRestDay && item.discipline !== "Descanso");
    const pulseEventsInWindow = (calendarEvents || []).filter((e) => {
      const d = (e.start_date_local || "").split("T")[0];
      return d >= todayStr && d <= toDate && e.category === "WORKOUT" && (e.name?.startsWith("[PULSE AI]") || e.name?.startsWith("[SGEA]"));
    });
    const maxExistingDate = pulseEventsInWindow.reduce((max, e) => {
      const d = (e.start_date_local || "").split("T")[0];
      return d > max ? d : max;
    }, "");

    const minLastWeekDate = targetWeeks[targetWeeks.length - 1]?.startDate || toDate;
    const intervalsAlreadyPopulated =
      pulseEventsInWindow.length >= Math.max(1, Math.floor(activeFutureWorkouts.length * 0.7)) &&
      maxExistingDate >= minLastWeekDate;

    // Candado 1: Si esta ventana exacta ya fue sincronizada o Intervals ya tiene las sesiones cargadas
    if (lastSyncedTo === toDate || (intervalsAlreadyPopulated && lastSyncedTo !== null)) {
      userStorage.setItem(syncToKey, toDate);
      userStorage.setItem(syncHashKey, currentHash);
      lastCheckTimestampRef.current = now;
      return;
    }

    // Candado 2: En un navegador/dispositivo nuevo donde Intervals ya tiene las 3 semanas pobladas
    if (!lastSyncedTo && intervalsAlreadyPopulated && !lastSyncedHash) {
      userStorage.setItem(syncToKey, toDate);
      userStorage.setItem(syncHashKey, currentHash);
      lastCheckTimestampRef.current = now;
      return;
    }

    const isNeeded = isRollingSyncNeeded(lastSyncedTo, toDate, todayStr, lastSyncedHash, currentHash, 14);
    if (!isNeeded) {
      lastCheckTimestampRef.current = now;
      return;
    }

    // 6. Ejecutar sincronización silenciosa en segundo plano
    try {
      isExecutingRef.current = true;
      console.info(`[AutoIntervalsSync] Sincronizando buffer rodante (${todayStr} al ${toDate}) para ${athleteId}...`);

      const res = await fetch("/api/sync-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clean_and_sync",
          athleteId,
          apiKey: activeApiKey,
          uid: user?.uid,
          email: user?.email || userProfile?.email || "",
          fromDate: todayStr,
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

        notificationService.addNotification(userStorage, {
          title: "Sincronización Automática",
          message: `Próximas ${weekCount} semanas actualizadas en tu reloj Garmin e Intervals.icu (${createdCount} sesiones).`,
          details: `Ventana activa del ${todayStr} al ${toDate}.`,
          category: "SYNC",
          severity: "success",
        });
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
      lastCheckTimestampRef.current = Date.now();
      isExecutingRef.current = false;
    }
  }, [
    athleteId,
    apiKeyCache,
    user?.uid,
    user?.email,
    userProfile?.status,
    userProfile?.isDemo,
    userProfile?.autoSyncIntervals,
    userProfile?.encryptedApiKey,
    userProfile?.hasApiKey,
    userProfile?.runFtp,
    userProfile?.bikeFtp,
    userProfile?.runThresholdPaceSecPerKm,
    userStorage,
    blueprint,
    weeklyAvailability,
    runFtp,
    bikeFtp,
    ctl,
    runningOpts?.mode,
    runningOpts?.thresholdPaceSec,
    calendarEvents,
    isTelemetryLoading,
    isReadOnly,
  ]);

  useEffect(() => {
    checkAndExecuteRollingSync();
  }, [checkAndExecuteRollingSync]);
}
