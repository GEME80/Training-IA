import { MacrocyclePhaseInfo, TargetRace, MacrocycleBlueprint } from "./macrocycle";
import { CalendarEvent } from "../intervals/types";

export function createPhaseInfoFromBlueprint(bp: MacrocycleBlueprint, race?: TargetRace | null): MacrocyclePhaseInfo {
  return {
    phase: bp.currentWeek?.phase || "MAINTENANCE",
    phaseLabel: bp.cycleTitle || "Macrociclo Activo",
    cycleBadgeLabel: bp.mode === "PRE_SEASON_MAINTENANCE" ? "🔵 MANTENIMIENTO PRE-TEMPORADA" : "🏃 CICLO ACTIVO",
    cycleBadgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    weeksRemaining: bp.totalWeeks,
    daysRemaining: bp.totalWeeks ? bp.totalWeeks * 7 : null,
    primaryRace: race || bp.primaryRace || null,
    guideline: bp.currentWeek?.focusDescription || "",
    suggestedFocus: "Macrociclo Activo",
    badgeColor: "bg-amber-500/20 text-amber-300",
    maxLongRunMinutes: bp.currentWeek?.maxLongRunMinutes || 60,
    isSpecificMarathonPhase: bp.mode === "MARATHON_SPECIFIC",
    weeklyTssTarget: `${bp.currentWeek?.targetTss || 350} TSS`,
    blueprint: bp,
  };
}

export async function persistProfileField(uid: string, email: string, fields: Record<string, any>, isReadOnly?: boolean) {
  if (isReadOnly) return;
  try {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: uid || "demo-user", email, ...fields }),
    });
  } catch (e) {
    console.warn("Aviso al persistir en perfil:", e);
  }
}

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isWorkoutSession(name: string, category?: string, type?: string): boolean {
  if (!name) return false;
  if (category === "WORKOUT") return true;

  // Prefijos comunes de sesiones de entrenamiento (ej. "S5:", "W2:", "Sesión 3:")
  if (/^(s\d+|w\d+|sesi[oó]n|workout|dia\s*\d+|day\s*\d+|sem\s*\d+|semana\s*\d+)[\s:_.-]/i.test(name)) return true;

  // Nombres de sesiones pre/post competición (ej. "Descarga Pre-Competición", "Activación Pre-Competición")
  if (/(?:pre|post)[-\s]*(?:competi|carrera|marat|evento|triat)/i.test(name)) return true;

  // Términos estrictos de entrenamientos rutinarios
  if (/descarga|movilidad|activaci[oó]n|calentamiento|estiramiento|fartlek|rodaje|series|fuerza|core|yoga|regenerativo|recuperaci[oó]n|soltura|simulacro|tirada|progresivo|intervalos|transici[oó]n|pliometr|gym|gimnasio/i.test(name)) return true;

  // Duración en paréntesis al final típica de sesiones (ej. "(20m)", "(40m)", "(15m)")
  if (/\(\s*\d+\s*(?:m|min|minutos)\s*\)$/i.test(name.trim())) return true;

  // Entrenamientos con mención de ritmo (ej. "Ritmo Maratón", "Ritmo 10K", "Ritmo Competición")
  if (/\britmo\s*(de\s*)?(marat[oó]n|10k|21k|5k|umbral|competici[oó]n)/i.test(name)) return true;

  return false;
}

export function normalizeRaceText(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\[(?:pulse ai|sgea)\]\s*/i, "")
    .replace(/\b(carrera|maraton|media\s*maraton|half\s*marathon|triatlon|triathlon|gran\s*fondo|de|del|la|el|los|las|the)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function isSameRace(r1: Partial<TargetRace>, r2: Partial<TargetRace>): boolean {
  if (r1.id && r2.id && r1.id === r2.id) return true;
  if (!r1.date || !r2.date || r1.date !== r2.date) return false;
  const n1 = normalizeRaceText(r1.name || "");
  const n2 = normalizeRaceText(r2.name || "");
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  return false;
}

function inferRaceDistance(name: string, type?: string): TargetRace["distance"] {
  const n = (name + " " + (type || "")).toLowerCase();
  if (n.includes("70.3") || n.includes("medio iron") || n.includes("half iron")) return "triathlon_703";
  if (n.includes("140.6") || n.includes("ironman") || n.includes("full iron")) return "triathlon_1406" as any;
  if (n.includes("sprint") || n.includes("olimp") || n.includes("triat") || n.includes("triath") || n.includes("triseries")) return "triathlon_short" as any;
  if (n.includes("giro") || n.includes("gran fondo") || n.includes("fondo") || n.includes("ride") || n.includes("bike") || n.includes("cicli")) return "cycling_fondo" as any;
  if (n.includes("21k") || n.includes("media marat") || n.includes("half marat")) return "21k";
  if (n.includes("10k") || n.includes("diez k")) return "10k";
  if (n.includes("5k") || n.includes("cinco k")) return "5k";
  if (n.includes("ultra") || n.includes("trail") || n.includes("montaña")) return "ultra" as any;
  if (n.includes("marat") || n.includes("42k") || n.includes("marathon") || n.includes("tokio") || n.includes("valencia") || n.includes("boston") || n.includes("berlin") || n.includes("chicago")) return "42k";
  return "10k";
}

/**
 * Fusiona sin pérdidas la carrera principal con todas las carreras secundarias (Tipo B y C)
 * e importa carreras detectadas en el calendario de Intervals.icu excluyendo sesiones rutinarias y pasadas.
 */
export function mergeTargetRacesList(
  existingRaces: TargetRace[] = [],
  primaryRace?: TargetRace | null,
  profileRaces: TargetRace[] = [],
  calendarEvents: CalendarEvent[] = []
): TargetRace[] {
  const todayStr = getTodayDateStr();
  const merged: TargetRace[] = [];

  const addOrUpdateRace = (candidate: TargetRace) => {
    if (!candidate || !candidate.name) return;
    if (isWorkoutSession(candidate.name)) return;
    if (candidate.date && candidate.date < todayStr) return;

    const existingIdx = merged.findIndex((r) => isSameRace(r, candidate));
    if (existingIdx >= 0) {
      const existing = merged[existingIdx];
      const pOrder: Record<string, number> = { A: 1, B: 2, C: 3 };
      const candPriority = candidate.priority || "B";
      const existPriority = existing.priority || "B";
      const bestPriority = pOrder[candPriority] < pOrder[existPriority] ? candPriority : existPriority;

      merged[existingIdx] = {
        ...existing,
        ...candidate,
        id: existing.id || candidate.id,
        priority: bestPriority,
        goalTarget: candidate.goalTarget || existing.goalTarget || "Pico de forma óptimo",
      };
    } else {
      merged.push({
        ...candidate,
        priority: candidate.priority || "B",
        goalTarget: candidate.goalTarget || "Pico de forma óptimo",
      });
    }
  };

  // 1. Inyectar carreras de perfil (filtrando entrenamientos y pasadas)
  (profileRaces || []).forEach((r) => addOrUpdateRace(r));

  // 2. Inyectar carreras existentes en memoria/storage (filtrando entrenamientos y pasadas)
  (existingRaces || []).forEach((r) => addOrUpdateRace(r));

  // 3. Extraer e inyectar carreras desde eventos reales del calendario de Intervals.icu
  (calendarEvents || []).forEach((evt) => {
    if (!evt || !evt.name || !evt.start_date_local) return;
    if (isWorkoutSession(evt.name, evt.category, evt.type)) return;

    const cleanName = evt.name.replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "").trim();
    const isRaceEvent =
      evt.category === "RACE" ||
      evt.category === "TARGET" ||
      (evt.type as string) === "Race" ||
      /\b(marat[oó]n|media\s*marat[oó]n|half\s*marathon|gran\s*fondo|giro\s*de\s*rigo|ironman|70\.3|140\.6|triatl[oó]n|triathlon|duatl[oó]n|ultra\s*trail|ultramarat[oó]n)\b/i.test(cleanName);

    if (isRaceEvent) {
      const dateStr = evt.start_date_local.split("T")[0];
      const key = `race_evt_${dateStr}_${cleanName.toLowerCase().replace(/\s+/g, "_")}`;
      addOrUpdateRace({
        id: key,
        name: cleanName,
        date: dateStr,
        distance: inferRaceDistance(cleanName, evt.type),
        priority: "B",
        goalTarget: "Pico de forma óptimo",
      });
    }
  });

  // 4. Priorizar y blindar la carrera primaria (Tipo A), garantizando que no se duplique
  if (primaryRace && primaryRace.name) {
    if (!primaryRace.date || primaryRace.date >= todayStr) {
      const existingIdx = merged.findIndex((r) => isSameRace(r, primaryRace));
      if (existingIdx >= 0) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          ...primaryRace,
          priority: "A",
        };
      } else {
        merged.unshift({
          ...primaryRace,
          priority: "A",
        });
      }
    }
  }

  // Ordenar por prioridad (A > B > C) y cronológicamente
  return merged.sort((a, b) => {
    const pOrder: Record<string, number> = { A: 1, B: 2, C: 3 };
    const diffP = (pOrder[a.priority as "A" | "B" | "C"] || 4) - (pOrder[b.priority as "A" | "B" | "C"] || 4);
    if (diffP !== 0) return diffP;
    return (a.date || "").localeCompare(b.date || "");
  });
}
