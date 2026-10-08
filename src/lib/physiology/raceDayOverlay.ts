/**
 * raceDayOverlay.ts
 * Superposición de competiciones secundarias (Tipo B / C) sobre el microciclo generado.
 * - Detecta carreras desde eventos de Intervals.icu (RACE_A/B/C, TARGET) o desde targetRaces del perfil.
 * - Infiere la disciplina REAL de la prueba (ej. "Giro de Rigo" = Ciclismo, nunca Carrera a pie).
 * - El día de la carrera reemplaza todo el entrenamiento del día por la competición.
 * - La víspera se convierte en una activación corta de la disciplina de la carrera.
 * - El día posterior se convierte en recuperación activa (sin fuerza ni calidad).
 */
import { PlanItem, DisciplineType } from "../gemini/types";
import { CalendarEvent } from "../intervals/types";

export interface RaceDayInfo {
  date: string;
  name: string;
  discipline: DisciplineType;
  priority: "A" | "B" | "C";
  eventId?: string;
  isTriathlon?: boolean;
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const CYCLING_RX = /giro|rigo|gran\s*fondo|granfondo|vuelta|cl[aá]sica|ciclo|ciclismo|bike|ride|mtb|ruta\s*ciclista|contrarreloj|\bcri\b/i;
const SWIM_RX = /aguas\s*abiertas|traves[ií]a|nataci[oó]n|swim/i;
const TRI_RX = /ironman|70\.3|140\.6|triatl[oó]n|triathlon|duatl[oó]n|triseries/i;
const RACE_NAME_RX = /giro\s*de\s*rigo|gran\s*fondo|competici[oó]n|carrera\s*oficial|marat[oó]n|media\s*marat[oó]n|ironman|70\.3|triatl[oó]n|triathlon|duatl[oó]n|ultra\s*trail|\b(5|10|15|21|42)\s*k\b/i;

export function isRaceCalendarEvent(evt: CalendarEvent): boolean {
  const cat = String(evt.category || "").toUpperCase();
  const name = (evt.name || "").replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "");
  if (/^\[(?:PULSE AI|SGEA)\]/i.test(evt.name || "")) return false; // Nuestras sesiones nunca son carreras externas
  return cat.startsWith("RACE") || cat === "TARGET" || (evt.type as string) === "Race" || RACE_NAME_RX.test(name);
}

export function inferRaceDiscipline(name: string, type?: string): { discipline: DisciplineType; isTriathlon: boolean } {
  const n = `${name || ""}`;
  if (TRI_RX.test(n)) return { discipline: "Carrera", isTriathlon: true };
  if (CYCLING_RX.test(n)) return { discipline: "Ciclismo", isTriathlon: false };
  if (SWIM_RX.test(n)) return { discipline: "Natacion", isTriathlon: false };
  const t = (type || "").toLowerCase();
  if (/ride|bike|cycl/.test(t)) return { discipline: "Ciclismo", isTriathlon: false };
  if (/swim/.test(t)) return { discipline: "Natacion", isTriathlon: false };
  return { discipline: "Carrera", isTriathlon: false };
}

export function raceInfoFromEvent(evt: CalendarEvent): RaceDayInfo | null {
  if (!evt?.start_date_local || !isRaceCalendarEvent(evt)) return null;
  const cat = String(evt.category || "").toUpperCase();
  const priority: "A" | "B" | "C" = cat === "RACE_A" ? "A" : cat === "RACE_C" ? "C" : "B";
  const { discipline, isTriathlon } = inferRaceDiscipline(evt.name, evt.type as string);
  return { date: evt.start_date_local.split("T")[0], name: evt.name.trim(), discipline, priority, isTriathlon, eventId: evt.id ? String(evt.id) : undefined };
}

export function raceInfoFromTarget(r: { date?: string; name?: string; priority?: string; distance?: string }): RaceDayInfo | null {
  if (!r?.date || !r?.name) return null;
  const distHint = r.distance && /cycling|fondo|ciclismo/i.test(r.distance) ? "ciclismo" : "";
  const { discipline, isTriathlon } = inferRaceDiscipline(`${r.name} ${distHint}`);
  const priority = (r.priority === "A" || r.priority === "C") ? r.priority : "B";
  return { date: r.date, name: r.name, discipline, priority, isTriathlon };
}

function dateMeta(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return { day: DAY_NAMES[d.getDay()], formattedDate: `${d.getDate()} ${MONTHS[d.getMonth()]}` };
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildRaceDayItem(race: RaceDayInfo, bikeFtp?: number): PlanItem {
  const { day, formattedDate } = dateMeta(race.date);
  const label = race.priority === "A" ? "🏆 COMPETICIÓN OBJETIVO" : `🏁 COMPETICIÓN ${race.priority}`;
  const base = { id: race.eventId, day, date: race.date, formattedDate, action: "MANTENER" as const, isRestDay: false };
  if (race.discipline === "Ciclismo") {
    const lo = bikeFtp ? `${Math.round(bikeFtp * 0.68)}-${Math.round(bikeFtp * 0.78)}W (68-78% FTP)` : "68-78% FTP";
    return {
      ...base, discipline: "Ciclismo", workoutName: `${label}: ${race.name}`, durationMinutes: 240, tss: 210, powerTarget: lo,
      justification: `Competición secundaria de ciclismo (Tipo ${race.priority}). Rodar en bloque, controlar vatios en los puertos (≤ 90% FTP) y comer 60-80 g CHO/h. Se usa como estímulo largo de Z2-Z3 dentro del plan 70.3.`,
      workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain (Ritmo de Competición Controlado)\n- 3h30m 72% FTP\n\nCooldown\n- 10m 50% FTP",
    };
  }
  if (race.discipline === "Natacion") {
    return {
      ...base, discipline: "Natacion", workoutName: `${label}: ${race.name}`, durationMinutes: 60, tss: 60, powerTarget: "Ritmo CSS sostenido",
      justification: `Competición secundaria de natación (Tipo ${race.priority}). Salida controlada, orientación cada 6-8 brazadas.`,
      workoutDoc: "Warmup\n- 10m Suave\n\nMain\n- Competición a ritmo CSS sostenido\n\nCooldown\n- 5m Suave",
    };
  }
  return {
    ...base, discipline: "Carrera", activityType: race.isTriathlon ? "Triatlón" : undefined, workoutName: `${label}: ${race.name}`,
    durationMinutes: race.isTriathlon ? 180 : 60, tss: race.isTriathlon ? 200 : 75, powerTarget: "88-95% Pace",
    justification: `Competición secundaria (Tipo ${race.priority}). Usar como test de ritmo y nutrición sin vaciarse.`,
    workoutDoc: "Warmup\n- 12m 74% Pace\n\nMain (Competición)\n- 40m 90% Pace\n\nCooldown\n- 8m 70% Pace",
  };
}

function buildEveItem(race: RaceDayInfo, dateStr: string, bikeFtp?: number): PlanItem {
  const { day, formattedDate } = dateMeta(dateStr);
  const base = { day, date: dateStr, formattedDate, action: "MANTENER" as const, isRestDay: false };
  if (race.discipline === "Ciclismo") {
    return {
      ...base, discipline: "Ciclismo", workoutName: "Pedaleo de Activación Pre-Competición (35m con 3x1m @ 90% FTP)", durationMinutes: 35, tss: 24,
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.6)}W (60% FTP)` : "60% FTP",
      justification: "Víspera de competición: verificar bici (cambios, presión, frenos) y despertar piernas sin fatiga.",
      workoutDoc: "Warmup\n- 15m 55% FTP\n\nMain (Activación)\n3x\n- 1m 90% FTP\n- 2m 55% FTP\n\nCooldown\n- 11m 50% FTP",
    };
  }
  return {
    ...base, discipline: "Carrera", workoutName: "Activación Final Pre-Carrera (20m con 3 Strides)", durationMinutes: 20, tss: 13, powerTarget: "74% Pace",
    justification: "Víspera de competición: soltura neuromuscular con mínimo impacto articular.",
    workoutDoc: "Warmup\n- 10m 72% Pace\n\nMain\n3x\n- 20s 105% Pace\n- 40s 68% Pace\n\nCooldown\n- 7m 70% Pace",
  };
}

function buildRecoveryItem(dateStr: string, discipline: DisciplineType, bikeFtp?: number): PlanItem {
  const { day, formattedDate } = dateMeta(dateStr);
  const base = { day, date: dateStr, formattedDate, action: "MANTENER" as const, isRestDay: false };
  if (discipline === "Natacion") {
    return { ...base, discipline, workoutName: "Natación Regenerativa Post-Competición (30m)", durationMinutes: 30, tss: 18, powerTarget: "Suave técnica",
      justification: "Descarga articular post-competición.", workoutDoc: "Warmup\n- 5m Suave\n\nMain\n- 20m Técnica suave\n\nCooldown\n- 5m Suave" };
  }
  if (discipline === "Ciclismo") {
    return { ...base, discipline, workoutName: "Rodillo Regenerativo Post-Competición (40m Z1)", durationMinutes: 40, tss: 20,
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.55)}W (55% FTP)` : "55% FTP",
      justification: "Lavado metabólico tras la competición, cadencia alta y cero tensión.", workoutDoc: "Warmup\n- 10m 50% FTP\n\nMain\n- 25m 55% FTP (95 rpm)\n\nCooldown\n- 5m 45% FTP" };
  }
  return { ...base, discipline: "Carrera", workoutName: "Trote Regenerativo Post-Competición (30m Z1)", durationMinutes: 30, tss: 18, powerTarget: "72% Pace",
    justification: "Recuperación activa tras la competición sin impacto de calidad.", workoutDoc: "Warmup\n- 5m 70% Pace\n\nMain\n- 20m 72% Pace\n\nCooldown\n- 5m 70% Pace" };
}

/**
 * Aplica las competiciones secundarias al plan: día de carrera, víspera y recuperación posterior.
 * Las carreras tipo A ya son gestionadas por el motor del macrociclo y no se tocan aquí.
 */
export function applyRaceDaysToPlan(
  plan: PlanItem[],
  races: RaceDayInfo[],
  opts: { bikeFtp?: number; primaryRaceDate?: string } = {}
): PlanItem[] {
  const secondary = races.filter((r) => {
    if (opts.primaryRaceDate && r.date === opts.primaryRaceDate) return false;
    return r.priority !== "A" || Boolean(r.name && /giro|rigo|gran\s*fondo/i.test(r.name));
  });
  if (secondary.length === 0 || plan.length === 0) return plan;
  const planDates = new Set(plan.map((p) => p.date).filter(Boolean));
  const raceByDate = new Map<string, RaceDayInfo>();
  secondary.forEach((r) => {
    const sanitized = /giro|rigo|gran\s*fondo/i.test(r.name) && r.priority === "A" ? { ...r, priority: "B" as const } : r;
    if (!raceByDate.has(sanitized.date)) raceByDate.set(sanitized.date, sanitized);
  });

  let result = [...plan];
  const allDates = plan.map((p) => p.date).filter(Boolean) as string[];
  if (allDates.length === 0) return plan;
  const sortedDates = [...allDates].sort();
  const minDate = sortedDates[0];
  const maxDate = shiftDate(minDate, 6);

  raceByDate.forEach((race, date) => {
    const isAObjective = (p: PlanItem) => p.date === date && /COMPETICI[ÓO]N OBJETIVO/i.test(p.workoutName || "");
    if (date >= minDate && date <= maxDate && !result.some(isAObjective)) {
      result = result.filter((p) => p.date !== date);
      result.push(buildRaceDayItem(race, opts.bikeFtp));
    }
    const eve = shiftDate(date, -1);
    if (eve >= minDate && eve <= maxDate && !raceByDate.has(eve) && !result.some((p) => p.date === eve && /COMPETICI/i.test(p.workoutName || ""))) {
      result = result.filter((p) => p.date !== eve);
      result.push(buildEveItem(race, eve, opts.bikeFtp));
    }
    const after = shiftDate(date, 1);
    if (after >= minDate && after <= maxDate && !raceByDate.has(after)) {
      const dayItems = result.filter((p) => p.date === after);
      const hasRace = dayItems.some((p) => /COMPETICI/i.test(p.workoutName || ""));
      const train = dayItems.find((p) => !p.isRestDay && p.discipline !== "Fuerza" && p.discipline !== "Descanso");
      if (!hasRace && train) {
        result = result.filter((p) => p.date !== after);
        result.push(buildRecoveryItem(after, train.discipline, opts.bikeFtp));
      }
    }
  });

  const order = (p: PlanItem) => `${p.date || ""}`;
  return result.sort((a, b) => order(a).localeCompare(order(b)));
}
