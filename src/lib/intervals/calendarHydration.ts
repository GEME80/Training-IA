import { PlanItem, DisciplineType } from "../gemini/types";
import { MacrocycleWeek } from "../physiology/macrocycle";
import { CalendarEvent } from "./types";
import { formatLocalDateToYMD } from "../dateUtils";
import { adaptRunningPlanItem } from "../physiology/runningWorkoutAdapter";

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

function buildEvePlanItem(p: PlanItem): PlanItem {
  if (p.discipline === "Ciclismo") {
    return {
      ...p,
      workoutName: "Pedaleo Ciclista de Soltura & Ajuste Mecánico (30m Z1)",
      durationMinutes: 30,
      tss: 18,
      powerTarget: "55% FTP",
      justification: "Verificación de cambios, presión de ruedas y soltura de piernas pre-carrera.",
      workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 15m 55% FTP con 2x30s 80% FTP\n\nCooldown\n- 5m 45% FTP",
    };
  }
  if (p.discipline === "Carrera") {
    return {
      ...p,
      activityType: undefined,
      workoutName: "Activación Final Pre-Carrera (15m Suave)",
      durationMinutes: 15,
      tss: 9,
      powerTarget: "Z1 Trote Suave",
      justification: "Soltura neuromuscular con mínimo impacto articular pre-carrera.",
      workoutDoc: "Warmup\n- 10m 65% CP\n\nMain\n- 5m 70% CP con 3x20s 85% CP\n\nCooldown\n- 5m 60% CP",
    };
  }
  if (p.discipline === "Fuerza") {
    return {
      ...p,
      workoutName: "Movilidad Articular & Activación Ligera (15m)",
      durationMinutes: 15,
      tss: 8,
      powerTarget: "Movilidad Articular",
      justification: "Descompresión articular y activación refleja sin carga externa.",
      workoutDoc: "Movilidad Dinámica\n- 5m Caderas y Tobillos\n- 5m Hombros y Columna Torácica\n- 5m Respiración y Relajación",
    };
  }
  return p;
}

function filterEveWorkouts(items: PlanItem[]): PlanItem[] {
  const nonStrength = items.filter((p) => p.discipline !== "Fuerza" && p.activityType !== "Brick");
  const cycling = nonStrength.find((p) => p.discipline === "Ciclismo");
  const running = nonStrength.find((p) => p.discipline === "Carrera");
  const swim = nonStrength.find((p) => p.discipline === "Natacion");

  const chosen = cycling || running || swim || nonStrength[0];
  if (!chosen) return [];
  return [buildEvePlanItem(chosen)];
}

export function hydrateWeekPlanFromEvents(
  week: MacrocycleWeek,
  fallbackPlan: PlanItem[],
  calendarEvents?: CalendarEvent[],
  runningOpts?: { mode?: "POWER" | "PACE" | "HYBRID"; thresholdPaceSec?: number; lthr?: number }
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

  const raceDates = new Set<string>();
  calendarEvents.forEach((evt) => {
    const isRace =
      evt.category === "RACE" ||
      evt.category === "TARGET" ||
      (evt.type as string) === "Race" ||
      /giro de rigo|competici|gran fondo|ironman|marat[oó]n|triatl[oó]n/i.test(`${evt.name || ""} ${evt.type || ""}`);
    if (isRace && evt.start_date_local) raceDates.add(evt.start_date_local.split("T")[0]);
  });

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
    const nextDate = new Date(new Date(dateStr + "T00:00:00").getTime() + 86400000).toISOString().split("T")[0];
    const isEveOfRace = raceDates.has(nextDate);

    if (!dayEvts || dayEvts.length === 0) {
      let fallbackForDay = fallbackPlan.filter((p) => p.date === dateStr || p.day === day);
      if (isEveOfRace) {
        fallbackForDay = filterEveWorkouts(fallbackForDay);
      }
      if (fallbackForDay.length > 0) {
        hydratedItems.push(...fallbackForDay);
      } else {
        hydratedItems.push({
          day, date: dateStr, formattedDate, discipline: "Descanso", workoutName: "Descanso Pasivo",
          action: "MANTENER", durationMinutes: 0, tss: 0, justification: "Día de asimilación biológica.", isRestDay: true,
        });
      }
      continue;
    }

    const seenWorkouts = new Set<string>();
    const seenDisciplines = new Set<DisciplineType>();
    let dayFallback = fallbackPlan.filter((p) => p.date === dateStr || p.day === day);
    if (isEveOfRace) dayFallback = filterEveWorkouts(dayFallback);
    const dayFallbackDiscs = new Set(dayFallback.map((p) => p.discipline));

    dayEvts.forEach((evt) => {
      const disc = resolveDiscipline(evt.type);
      const isPulseGenerated = evt.name && (/\[(?:PULSE AI|SGEA)\]/i.test(evt.name) || /test.*(ftp|css|vam|stryd|calibraci[oó]n)/i.test(evt.name));
      
      if (isPulseGenerated && dayFallbackDiscs.size > 0 && !dayFallbackDiscs.has(disc) && !dayFallbackDiscs.has("Descanso")) {
        return;
      }

      const maxAllowedForDisc = dayFallback.filter((p) => p.discipline === disc).length || 1;
      const countForDisc = Array.from(seenDisciplines).filter((d) => d === disc).length;
      if (countForDisc >= maxAllowedForDisc) return;

      const cleanName = evt.name ? evt.name.replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "").trim() : "Entrenamiento";
      const normalizedKey = `${dateStr}_${disc}_${cleanName.toLowerCase().replace(/\s+/g, " ")}`;
      if (seenWorkouts.has(normalizedKey)) return;
      seenWorkouts.add(normalizedKey);
      seenDisciplines.add(disc);

      const matchingFallback = dayFallback.find((p) => p.discipline === disc);
      const isFallbackTest = /test.*(ftp|control|calibraci[oó]n|stryd|vam|css)/i.test(matchingFallback?.workoutName || "");
      const isEvtTest = /test|ftp|umbral|prueba|css|vam/i.test(cleanName);

      if (isPulseGenerated && isEvtTest && !isFallbackTest && matchingFallback) {
        hydratedItems.push({ ...matchingFallback, id: evt.id ? String(evt.id) : undefined, date: dateStr, formattedDate, day });
        return;
      }

      if (isFallbackTest && !isEvtTest && matchingFallback) {
        hydratedItems.push({
          ...matchingFallback, id: evt.id ? String(evt.id) : undefined, date: dateStr, formattedDate, day,
          justification: `Test de calibración oficial programado (${matchingFallback.powerTarget || "Umbral"})`,
        });
        return;
      }

      // Blindaje Anti-Maratón & Descarga de Fuerza:
      // Si el evento de Intervals es un residuo previo de maratón (Canova/Pfitzinger) pero el plan actual
      // tiene un rodaje adaptado, o si es una fuerza consecutiva convertida en movilidad articular:
      const isObsoleteMarathonEvt = isPulseGenerated && /canova|pfitzinger 42k|fondo cumbre/i.test(cleanName) && !matchingFallback?.workoutName.toLowerCase().includes("canova");
      const isObsoleteStrengthEvt = isPulseGenerated && disc === "Fuerza" && matchingFallback?.workoutName.includes("Movilidad") && !cleanName.includes("Movilidad");

      if ((isObsoleteMarathonEvt || isObsoleteStrengthEvt) && matchingFallback) {
        hydratedItems.push({
          ...matchingFallback,
          id: evt.id ? String(evt.id) : undefined,
          date: dateStr,
          formattedDate,
          day,
          justification: isObsoleteMarathonEvt ? "Adaptado: Rodaje de asimilación post-test" : matchingFallback.justification,
        });
        return;
      }

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
      const doc = typeof evt.description === "string" && evt.description.trim() ? evt.description : (typeof evt.workout_doc === "string" ? evt.workout_doc : undefined);

      hydratedItems.push({
        id: evt.id ? String(evt.id) : undefined, day, date: dateStr, formattedDate, discipline: disc,
        workoutName: cleanName, action: "MANTENER", durationMinutes: mins, tss, powerTarget: matchingFallback?.powerTarget,
        workoutDoc: doc || matchingFallback?.workoutDoc, justification: `Sincronizado desde Intervals.icu (${evt.type})`,
        isRestDay: false, mobilityWarmup: matchingFallback?.mobilityWarmup, fuelingStrategy: matchingFallback?.fuelingStrategy,
      });
    });
  }

  if (runningOpts?.mode === "PACE" || runningOpts?.mode === "HYBRID") {
    return hydratedItems.map((item) =>
      adaptRunningPlanItem(item, {
        mode: "PACE",
        thresholdPaceSec: runningOpts.thresholdPaceSec,
        lthr: runningOpts.lthr,
      })
    );
  }

  return hydratedItems;
}
