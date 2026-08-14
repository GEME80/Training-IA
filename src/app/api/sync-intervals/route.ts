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

    if (!plan || !Array.isArray(plan)) {
      return NextResponse.json(
        { success: false, error: "Estructura del microciclo inválida." },
        { status: 400 }
      );
    }

    const client = new IntervalsClient(athleteId, apiKey);
    const createdEvents: CalendarEvent[] = [];

    // Calcular las fechas correspondientes para la semana actual
    const today = new Date();
    // Lunes de la semana actual
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const dayOffsets: Record<string, number> = {
      Lunes: 0,
      Martes: 1,
      Miércoles: 2,
      Jueves: 3,
      Viernes: 4,
      Sábado: 5,
      Domingo: 6,
    };

    for (const item of plan) {
      const offset = dayOffsets[item.day] ?? 0;
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + offset);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Omitir descanso total si no se desea crear evento
      if (item.discipline === "Descanso") {
        continue;
      }

      let type: CalendarEvent["type"] = "Run";
      let workoutSyntax = "";

      if (item.discipline === "Ciclismo") {
        type = "Ride";
        workoutSyntax = PhysiologicalEngine.generateWorkoutSyntax("Ride", "Z2_BASE");
      } else if (item.discipline === "Fuerza") {
        type = "WeightTraining";
        workoutSyntax = PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH");
      } else {
        type = "Run";
        if (item.day === "Martes") {
          workoutSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100);
        } else if (item.day === "Domingo") {
          workoutSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 88);
        } else {
          workoutSyntax = PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70);
        }
      }

      const workoutText = item.workoutDoc || workoutSyntax;

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
        console.warn(`Aviso al publicar sesión del ${item.day}:`, postErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `¡Microciclo sincronizado exitosamente con Intervals.icu! (${createdEvents.length} sesiones publicadas)`,
      createdEventsCount: createdEvents.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar con Intervals.icu";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
