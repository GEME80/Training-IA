import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { CalendarEvent } from "@/lib/intervals/types";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteId, apiKey, uid, email, plan } = body;

    const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
      await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

    if (!effectiveApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API Key de Intervals.icu no configurada. Ingresa tu API Key para sincronizar con tu calendario y reloj Garmin.",
          isAuthError: true,
        },
        { status: 401 }
      );
    }

    if (!plan || !Array.isArray(plan) || plan.length === 0) {
      return NextResponse.json(
        { success: false, error: "Estructura del microciclo inválida." },
        { status: 400 }
      );
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

    // 2. Limpieza de entrenamientos previos [PULSE AI] / [SGEA] para evitar duplicación (solo de hoy en adelante)
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
          console.log(`Eliminando ${sgeaEventsToDelete.length} entrenamientos previos de [PULSE AI] en el rango ${cleanStartStr} a ${endDateStr}...`);
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
          return NextResponse.json(
            {
              success: false,
              error: "Credenciales de Intervals.icu incorrectas (401/403). Por favor verifica tu API Key.",
              isAuthError: true,
            },
            { status: 401 }
          );
        }
      }
    }

    // 3. Inserción del nuevo microciclo optimizado (estrictamente a partir de hoy)
    for (const item of plan) {
      // Omitir días de descanso pasivo
      if (item.isRestDay || item.discipline === "Descanso") {
        continue;
      }

      const dateStr = item.date || startDateStr;
      if (dateStr < todayStr) {
        // Historial inmutable: nunca sobrescribir el pasado en Intervals.icu
        continue;
      }

      let type: CalendarEvent["type"] = "Run";
      let fallbackSyntax = "";

      if (item.discipline === "Ciclismo") {
        type = "Ride";
        fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("Ride", "Z2_BASE");
      } else if (item.discipline === "Fuerza") {
        type = "WeightTraining";
        fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH");
      } else if (item.discipline === "Natacion" || (item.discipline as string) === "Natación") {
        type = "Swim";
        fallbackSyntax = item.workoutDoc || "Warmup\n- 200m Nado Suave\n\nMain (6x 100m)\n- 100m Ritmo Aeróbico c/20s desc\n\nCooldown\n- 100m Suave";
      } else {
        type = "Run";
        if (item.day === "Martes") {
          fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100);
        } else if (item.day === "Domingo") {
          fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 88);
        } else {
          fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70);
        }
      }

      const workoutText = item.workoutDoc || fallbackSyntax;

      const eventPayload: CalendarEvent = {
        start_date_local: `${dateStr}T07:00:00`,
        name: `[PULSE AI] ${item.workoutName}`,
        description: workoutText,
        type,
        category: "WORKOUT",
      };

      try {
        const created = await client.createEvent(eventPayload);
        createdEvents.push(created);
      } catch (postErr: any) {
        console.warn(`Aviso al publicar sesión del ${item.day} (${dateStr}):`, postErr);
        errors.push(`${item.day}: ${postErr?.message || "Error al publicar"}`);
      }
    }

    if (createdEvents.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se pudieron publicar las sesiones en Intervals.icu: ${errors[0]}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `¡Microciclo actualizado con éxito en Intervals.icu! (${createdEvents.length} sesiones publicadas)`,
      createdCount: createdEvents.length,
      athleteUrl: `https://intervals.icu/activities`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar con Intervals.icu";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
