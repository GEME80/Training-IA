"use client";

import { useEffect, useRef } from "react";
import { UserStorage } from "@/lib/storage/userStorage";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { PlanItem, WeeklyAvailabilityMap, resolveEffectiveAvailability } from "@/lib/gemini/engine";
import { generateWeekTemplate } from "@/lib/physiology/macrocycleTemplates";
import { persistProfileField } from "@/lib/physiology/seasonPlanHelpers";

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
 * Hook para la purga y sincronización automática en segundo plano (transparente, 0 clics del atleta).
 * Detecta si el atleta requiere actualización limpia a Pace y sincroniza las semanas futuras
 * desde mañana (2026-10-03) eliminando residuos de potencia en Intervals.icu.
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

  useEffect(() => {
    // Si no hay atleta o macrociclo activo con semanas, esperar
    if (!athleteId || !blueprint?.weeks || blueprint.weeks.length === 0) return;

    // Solo atletas en modo PACE o específicamente Georg Schmitt (i729730)
    const isPaceTarget =
      athleteId === "i729730" ||
      runningOpts?.mode === "PACE" ||
      userProfile?.runningTrainingMode === "PACE";

    if (!isPaceTarget) return;

    // Clave de migración idempotente: garantiza que se ejecute solo UNA vez
    const migrationKey = `auto_intervals_purge_sync_v4_20261008_${athleteId}`;
    const alreadyDoneInStorage = userStorage.getItem(migrationKey) === "done";
    const alreadyDoneInProfile = userProfile?.lastAutoPurgeSync === "2026-10-08";

    if (alreadyDoneInStorage || alreadyDoneInProfile || isExecutingRef.current) {
      return;
    }

    const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || userProfile?.intervalsApiKey || "";

    // Si estamos en modo de solo lectura estricto sin credenciales, no forzar
    if (isReadOnly && !activeApiKey) return;

    const executeBackgroundPurgeAndSync = async () => {
      isExecutingRef.current = true;
      const fromDate = "2026-10-07";

      try {
        console.info(`[AutoIntervalsSync] Iniciando sincronización transparente en segundo plano para ${athleteId}...`);

        // 1. Generar la plantilla de microciclos del macrociclo
        const fullPlan: PlanItem[] = [];
        blueprint.weeks.forEach((week) => {
          const weekPlan = generateWeekTemplate(
            week,
            runFtp,
            bikeFtp,
            resolveEffectiveAvailability((blueprint.availabilitySnapshot as any) || weeklyAvailability),
            (blueprint.distanceType || blueprint.primaryRace?.distance) as any,
            ctl || 35,
            undefined,
            runningOpts
          );
          fullPlan.push(...weekPlan);
        });

        // 2. Filtrar exclusivamente sesiones a partir de mañana (2026-10-03)
        const futurePlan = fullPlan.filter((item) => !item.date || item.date >= fromDate);

        if (futurePlan.length === 0) {
          isExecutingRef.current = false;
          return;
        }

        // 3. Llamar al backend atómico clean_and_sync
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
            plan: futurePlan,
          }),
        });

        const data = await res.json();
        if (data.success) {
          console.info(
            `[AutoIntervalsSync] Sincronización exitosa en segundo plano para ${athleteId}. Sesiones purgadas: ${data.deletedCount || 0}, Sesiones en Pace sincronizadas: ${data.createdCount || 0}`
          );
          userStorage.setItem(migrationKey, "done");
          await persistProfileField(
            user?.uid,
            user?.email || userProfile?.email || "",
            { lastAutoPurgeSync: "2026-10-08" },
            isReadOnly
          );

          // 4. Refrescar calendario silenciosamente para reflejar los cambios
          if (refreshTelemetry) {
            await refreshTelemetry(athleteId, activeApiKey, runFtp, bikeFtp);
          }
        } else {
          console.warn("[AutoIntervalsSync] Respuesta no exitosa del backend:", data.error);
        }
      } catch (err) {
        console.warn("[AutoIntervalsSync] Error silencioso en sincronización en segundo plano:", err);
      } finally {
        isExecutingRef.current = false;
      }
    };

    executeBackgroundPurgeAndSync();
  }, [
    athleteId,
    apiKeyCache,
    blueprint,
    user?.uid,
    user?.email,
    userProfile,
    userStorage,
    runningOpts,
    weeklyAvailability,
    runFtp,
    bikeFtp,
    ctl,
    refreshTelemetry,
    isReadOnly,
  ]);
}
