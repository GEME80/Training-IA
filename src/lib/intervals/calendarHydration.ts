import { PlanItem, DisciplineType } from "@/lib/gemini/types";
import { MacrocycleWeek } from "@/lib/physiology/macrocycle";
import { CalendarEvent } from "@/lib/intervals/types";

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function resolveDiscipline(type: string): DisciplineType {
  const t = (type || "").toLowerCase();
  if (/run|carrera|trailrun|virtualrun/i.test(t)) return "Carrera";
  if (/ride|ciclismo|bike|virtualride|cycling/i.test(t)) return "Ciclismo";
  if (/weight|fuerza|strength/i.test(t)) return "Fuerza";
  if (/swim|nataci/i.test(t)) return "Natacion";
  return "Carrera";
}

/**
 * Hidrata los entrenamientos planificados de una semana directamente desde los eventos
 * sincronizados en Intervals.icu (SSOT). Si la semana no tiene eventos en Intervals,
 * utiliza la plantilla generada algorítmicamente como respaldo.
 */
export function hydrateWeekPlanFromEvents(
  week: MacrocycleWeek,
  fallbackPlan: PlanItem[],
  calendarEvents?: CalendarEvent[]
): PlanItem[] {
  if (!calendarEvents || calendarEvents.length === 0 || !week?.startDate) {
    return fallbackPlan;
  }

  const weekStart = new Date(week.startDate + "T00:00:00");
  if (isNaN(weekStart.getTime())) return fallbackPlan;

  const weekDates: Array<{ day: string; dateStr: string; formattedDate: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const formattedDate = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
    weekDates.push({ day: DAY_NAMES[i], dateStr, formattedDate });
  }

  const weekDateSet = new Set(weekDates.map((w) => w.dateStr));
  const matchingEvents = calendarEvents.filter((evt) => {
    const evtDate = evt.start_date_local?.split("T")[0];
    return evtDate && weekDateSet.has(evtDate);
  });

  if (matchingEvents.length === 0) {
    return fallbackPlan;
  }

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  matchingEvents.forEach((evt) => {
    const evtDate = evt.start_date_local?.split("T")[0];
    if (!evtDate) return;
    if (!eventsByDate[evtDate]) eventsByDate[evtDate] = [];
    eventsByDate[evtDate].push(evt);
  });

  const hydratedItems: PlanItem[] = [];

  for (const { day, dateStr, formattedDate } of weekDates) {
    const dayEvts = eventsByDate[dateStr];
    if (!dayEvts || dayEvts.length === 0) {
      hydratedItems.push({
        day,
        date: dateStr,
        formattedDate,
        discipline: "Descanso",
        workoutName: "Descanso Activo / Recuperación",
        action: "MANTENER",
        durationMinutes: 0,
        tss: 0,
        justification: "Día de asimilación biológica programado en Intervals.icu",
        isRestDay: true,
      });
      continue;
    }

    dayEvts.forEach((evt) => {
      const disc = resolveDiscipline(evt.type);
      const cleanName = evt.name ? evt.name.replace(/^\[PULSE AI\]\s*/i, "").trim() : "Entrenamiento";
      const mins = Math.round((evt.moving_time || 0) / 60) || 45;
      const tss = evt.icu_training_load || undefined;
      const doc = evt.workout_doc || evt.description || undefined;

      hydratedItems.push({
        id: evt.id ? String(evt.id) : undefined,
        day,
        date: dateStr,
        formattedDate,
        discipline: disc,
        workoutName: cleanName,
        action: "MANTENER",
        durationMinutes: mins,
        tss,
        workoutDoc: doc,
        justification: `Sincronizado desde Intervals.icu (${evt.type})`,
        isRestDay: false,
      });
    });
  }

  return hydratedItems;
}
