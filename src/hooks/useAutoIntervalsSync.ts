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

    // Clave de migración idempotente v5 (Modernización Multi-Sport & Paramétrica)
    // Garantiza que se ejecute solo UNA vez por atleta tras la actualización v5.0
    const migrationKey = `auto_intervals_v5_modernization_20261012_${athleteId}`;
    const alreadyDoneInStorage = userStorage.getItem(migrationKey) === "done";
    const alreadyDoneInProfile = userProfile?.lastAutoPurgeSync === "2026-10-12";

    if (alreadyDoneInStorage || alreadyDoneInProfile || isExecutingRef.current) {
      return;
    }

    const activeApiKey = apiKeyCache || userStorage.getItem("intervals_api_key") || userProfile?.intervalsApiKey || "";

    // Si estamos en modo de solo lectura estricto sin credenciales, no forzar
    if (isReadOnly && !activeApiKey) return;

    const executeBackgroundPurgeAndSync = async () => {
      isExecutingRef.current = true;
      // Los atletas ya tienen planificado su fin de semana hasta el domingo (2026-10-11).
      // Se preserva intacto de viernes a domingo y la modernización aplica a partir del próximo lunes (2026-10-12).
      const d = new Date();
      const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
      const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
      const nextMon = new Date(d);
      nextMon.setDate(d.getDate() + daysUntilMonday);
      const computedNextMonday = nextMon.toISOString().split("T")[0];
      const fromDate = computedNextMonday < "2026-10-12" ? "2026-10-12" : computedNextMonday;

      try {
        console.info(`[AutoIntervalsSync] Iniciando sincronización transparente en segundo plano para ${athleteId} desde ${fromDate}...`);

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

        // 2. Filtrar exclusivamente sesiones a partir del próximo lunes (preservando el fin de semana actual y el historial)
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
            `[AutoIntervalsSync] Sincronización exitosa en segundo plano para ${athleteId}. Sesiones purgadas: ${data.deletedCount || 0}, Sesiones actualizadas desde ${fromDate}: ${data.createdCount || 0}`
          );
          userStorage.setItem(migrationKey, "done");
          await persistProfileField(
            user?.uid,
            user?.email || userProfile?.email || "",
            { lastAutoPurgeSync: "2026-10-12" },
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
