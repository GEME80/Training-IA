import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { CalendarEvent } from "@/lib/intervals/types";
import { PhysiologicalEngine } from "@/lib/physiology/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteId, apiKey, plan } = body;

    if (!athleteId || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Athlete ID y API Key son obligatorios para sincronizar con Intervals.icu." },
        { status: 400 }
      );
    }

    if (!plan || !Array.isArray(plan) || plan.length === 0) {
      return NextResponse.json(
        { success: false, error: "Estructura del microciclo inválida." },
        { status: 400 }
      );
    }

    const client = new IntervalsClient(athleteId, apiKey);
    const createdEvents: CalendarEvent[] = [];

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

    // 2. Limpieza de entrenamientos previos [SGEA] para evitar duplicación
    try {
      const existingEvents = await client.getEvents(startDateStr, endDateStr);
      const sgeaEventsToDelete = existingEvents.filter(
        (e) =>
          e.id &&
          e.category === "WORKOUT" &&
          (e.name?.includes("[SGEA]") || e.description?.includes("Stryd") || e.description?.includes("FTP"))
      );

      if (sgeaEventsToDelete.length > 0) {
        console.log(`Eliminando ${sgeaEventsToDelete.length} entrenamientos previos de [SGEA] en el rango ${startDateStr} a ${endDateStr}...`);
        await Promise.all(
          sgeaEventsToDelete.map((e) =>
            client.deleteEvent(e.id!).catch((delErr) => {
              console.warn(`No se pudo eliminar evento previo ${e.id}:`, delErr);
            })
          )
        );
      }
    } catch (cleanErr) {
      console.warn("Aviso al consultar/limpiar eventos previos en Intervals:", cleanErr);
    }

    // 3. Inserción del nuevo microciclo optimizado
    for (const item of plan) {
      // Omitir días de descanso pasivo
      if (item.isRestDay || item.discipline === "Descanso") {
        continue;
      }

      const dateStr = item.date || startDateStr;

      let type: CalendarEvent["type"] = "Run";
      let fallbackSyntax = "";

      if (item.discipline === "Ciclismo") {
        type = "Ride";
        fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("Ride", "Z2_BASE");
      } else if (item.discipline === "Fuerza") {
        type = "WeightTraining";
        fallbackSyntax = PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH");
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
        name: `[SGEA] ${item.workoutName}`,
        description: workoutText,
        type,
        category: "WORKOUT",
      };

      try {
        const created = await client.createEvent(eventPayload);
        createdEvents.push(created);
      } catch (postErr) {
        console.warn(`Aviso al publicar sesión del ${item.day} (${dateStr}):`, postErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `¡Microciclo actualizado exitosamente en Intervals.icu! (${createdEvents.length} sesiones actualizadas)`,
      createdCount: createdEvents.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar con Intervals.icu";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
