import { IntervalsClient } from "@/lib/intervals/client";
import { CalendarEvent, ActivityType } from "@/lib/intervals/types";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { SyncIntervalsRequest } from "@/lib/validation/schemas";

export interface IntervalsSyncResult {
  success: boolean;
  createdCount?: number;
  errors?: string[];
  isAuthError?: boolean;
  error?: string;
}

export class IntervalsSyncService {
  /**
   * Sincroniza un conjunto de entrenamientos estructurados hacia el calendario de Intervals.icu
   */
  static async syncPlan(input: SyncIntervalsRequest): Promise<IntervalsSyncResult> {
    const { athleteId, apiKey, uid, email, plan } = input;

    const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
      await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

    if (!effectiveApiKey) {
      return {
        success: false,
        error: "API Key de Intervals.icu no configurada. Ingresa tu API Key para sincronizar con tu calendario y reloj Garmin.",
        isAuthError: true,
      };
    }

    const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
    const createdEvents: CalendarEvent[] = [];
    const errors: string[] = [];

    // 1. Extraer rango de fechas del microciclo (Lunes a Domingo)
    const validDates = plan.map((p) => p.date).filter(Boolean).sort();
    let startDateStr = validDates[0];
    let endDateStr = validDates[validDates.length - 1];

    if (!startDateStr || !endDateStr) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      startDateStr = monday.toISOString().split("T")[0];
      endDateStr = sunday.toISOString().split("T")[0];
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const cleanStartStr = startDateStr < todayStr ? todayStr : startDateStr;

    // 2. Limpieza de entrenamientos previos [PULSE AI] / [SGEA] para evitar duplicación
    if (cleanStartStr <= endDateStr) {
      try {
        const existingEvents = await client.getEvents(cleanStartStr, endDateStr);
        const sgeaEventsToDelete = existingEvents.filter(
          (e) =>
            e.id &&
            e.category === "WORKOUT" &&
            (e.name?.includes("[PULSE AI]") || e.name?.includes("[SGEA]") || e.description?.includes("Stryd") || e.description?.includes("FTP"))
        );

        if (sgeaEventsToDelete.length > 0) {
          await Promise.all(
            sgeaEventsToDelete.map((e) =>
              client.deleteEvent(e.id!).catch((delErr) => {
                console.warn(`No se pudo eliminar evento previo ${e.id}:`, delErr);
              })
            )
          );
        }
      } catch (cleanErr: any) {
        console.warn("Aviso al consultar/limpiar eventos previos en Intervals:", cleanErr);
        if (cleanErr?.message?.includes("401") || cleanErr?.message?.includes("403")) {
          return {
            success: false,
            error: "Credenciales de Intervals.icu incorrectas (401/403). Por favor verifica tu API Key.",
            isAuthError: true,
          };
        }
      }
    }

    // 3. Inserción del nuevo microciclo optimizado
    for (const item of plan) {
      if (item.isRestDay || item.discipline === "Descanso") continue;

      let category: CalendarEvent["category"] = "WORKOUT";
      let type: ActivityType = "Run";

      if (item.discipline === "Ciclismo") type = "Ride";
      else if (item.discipline === "Fuerza") type = "WeightTraining";
      else if (item.discipline === "Natacion") type = "Swim";

      let workoutText = item.workoutDoc || item.description || "";
      if (item.intervalsWorkoutText) {
        workoutText = item.intervalsWorkoutText;
      } else if (!workoutText && item.discipline === "Carrera") {
        workoutText = `Warmup\n- 10m 65% FTP\n\nMain\n- ${Math.max(10, (item.durationMinutes || 45) - 20)}m 75% FTP\n\nCooldown\n- 10m 60% FTP`;
      } else if (!workoutText && item.discipline === "Ciclismo") {
        workoutText = `Warmup\n- 10m 55% FTP\n\nMain\n- ${Math.max(10, (item.durationMinutes || 60) - 20)}m 68% FTP\n\nCooldown\n- 10m 50% FTP`;
      }

      const eventPayload: CalendarEvent = {
        start_date_local: `${item.date}T07:00:00`,
        category,
        type,
        name: `[PULSE AI] ${item.workoutName || `${item.discipline} - ${item.day || "Sesión"}`}`,
        description: workoutText,
        moving_time: (item.durationMinutes || 45) * 60,
        icu_training_load: item.targetTss || item.tss || 45,
      };

      try {
        const created = await client.createEvent(eventPayload);
        createdEvents.push(created);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Error en día ${item.day || item.date}: ${msg}`);
      }
    }

    return {
      success: createdEvents.length > 0 || errors.length === 0,
      createdCount: createdEvents.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
