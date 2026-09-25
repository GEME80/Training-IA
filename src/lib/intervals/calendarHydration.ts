import { PlanItem, DisciplineType } from "../gemini/types";
import { MacrocycleWeek } from "../physiology/macrocycle";
import { CalendarEvent } from "./types";
import { formatLocalDateToYMD } from "../dateUtils";

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
    const dateStr = formatLocalDateToYMD(d);
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
      const fallbackForDay = fallbackPlan.filter((p) => p.date === dateStr || p.day === day);
      if (fallbackForDay.length > 0) {
        hydratedItems.push(...fallbackForDay);
      } else {
        hydratedItems.push({
          day,
          date: dateStr,
          formattedDate,
          discipline: "Descanso",
          workoutName: "Descanso Pasivo",
          action: "MANTENER",
          durationMinutes: 0,
          tss: 0,
          justification: "Día de asimilación biológica.",
          isRestDay: true,
        });
      }
      continue;
    }

    // Deduplicación inteligente: evitar workouts duplicados por múltiples sincronizaciones o idéntico contenido
    const seenWorkouts = new Set<string>();
    const seenDisciplines = new Set<DisciplineType>();
    const dayFallback = fallbackPlan.filter((p) => p.date === dateStr || p.day === day);
    const dayFallbackDiscs = new Set(dayFallback.map((p) => p.discipline));

    dayEvts.forEach((evt) => {
      const disc = resolveDiscipline(evt.type);
      const isPulseGenerated = evt.name && (/\[(?:PULSE AI|SGEA)\]/i.test(evt.name) || /test.*(ftp|css|vam|stryd|calibraci[oó]n)/i.test(evt.name));
      
      // Si es un evento generado por Pulse/SGEA pero la disciplina no pertenece a la prescripción del día:
      if (isPulseGenerated && dayFallbackDiscs.size > 0 && !dayFallbackDiscs.has(disc) && !dayFallbackDiscs.has("Descanso")) {
        return; // Omitir evento huérfano de sincronizaciones previas obsoletas
      }

      // Evitar duplicar la misma disciplina en el mismo día a menos que el plan rector lo contemple
      const maxAllowedForDisc = dayFallback.filter((p) => p.discipline === disc).length || 1;
      const countForDisc = Array.from(seenDisciplines).filter((d) => d === disc).length;
      if (countForDisc >= maxAllowedForDisc) {
        return;
      }

      const cleanName = evt.name ? evt.name.replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "").trim() : "Entrenamiento";
      const normalizedKey = `${dateStr}_${disc}_${cleanName.toLowerCase().replace(/\s+/g, " ")}`;
      if (seenWorkouts.has(normalizedKey)) {
        return;
      }
      seenWorkouts.add(normalizedKey);
      seenDisciplines.add(disc);

      const matchingFallback = dayFallback.find((p) => p.discipline === disc);
      const isFallbackTest = /test.*(ftp|control|calibraci[oó]n|stryd|vam|css)/i.test(matchingFallback?.workoutName || "");
      const isEvtTest = /test|ftp|umbral|prueba|css|vam/i.test(cleanName);

      // Si Intervals tiene un test obsoleto de Pulse pero el plan rector NO prescribe test para esta semana:
      if (isPulseGenerated && isEvtTest && !isFallbackTest && matchingFallback) {
        hydratedItems.push({
          ...matchingFallback,
          id: evt.id ? String(evt.id) : undefined,
          date: dateStr,
          formattedDate,
          day,
        });
        return;
      }

      // Si el plan rector actual prescribe un TEST OFICIAL y el evento previo en Intervals es un rodaje genérico:
      if (isFallbackTest && !isEvtTest && matchingFallback) {
        hydratedItems.push({
          ...matchingFallback,
          id: evt.id ? String(evt.id) : undefined,
          date: dateStr,
          formattedDate,
          day,
          justification: `Test de calibración oficial programado (${matchingFallback.powerTarget || "Umbral"})`,
        });
        return;
      }

      // Sanitización matemática estricta de duración (elimina anomalías como 22h30m / 81000s)
      const maxLimit = disc === "Ciclismo" ? 360 : 180;
      let rawMins = Math.round((evt.moving_time || 0) / 60);
      let mins = (rawMins > 0 && rawMins <= maxLimit) ? rawMins : 0;

      const titleMinsMatch = cleanName.match(/\((\d+)\s*m(?:in)?\)/i);
      if (titleMinsMatch) {
        const parsedTitleMins = parseInt(titleMinsMatch[1], 10);
        if (parsedTitleMins > 0 && (mins < 15 || mins > maxLimit || disc === "Fuerza")) {
          mins = parsedTitleMins;
        }
      }
      if (!mins || mins === 0) mins = matchingFallback?.durationMinutes || (disc === "Fuerza" ? 35 : 45);

      const tss = evt.icu_training_load || undefined;
      const doc = typeof evt.description === "string" && evt.description.trim()
        ? evt.description
        : (typeof evt.workout_doc === "string" ? evt.workout_doc : undefined);

      const powerTarget = matchingFallback?.powerTarget;

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
        powerTarget,
        workoutDoc: doc || matchingFallback?.workoutDoc,
        justification: `Sincronizado desde Intervals.icu (${evt.type})`,
        isRestDay: false,
        mobilityWarmup: matchingFallback?.mobilityWarmup,
        fuelingStrategy: matchingFallback?.fuelingStrategy,
      });
    });
  }

  return hydratedItems;
}
