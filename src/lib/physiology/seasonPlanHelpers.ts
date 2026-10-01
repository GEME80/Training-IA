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

function inferRaceDistance(name: string, type?: string): TargetRace["distance"] {
  const n = (name + " " + (type || "")).toLowerCase();
  if (n.includes("70.3") || n.includes("medio iron")) return "triathlon_703";
  if (n.includes("140.6") || n.includes("ironman")) return "triathlon_1406" as any;
  if (n.includes("sprint") || n.includes("olimp")) return "triathlon_short" as any;
  if (n.includes("giro") || n.includes("fondo") || n.includes("ride") || n.includes("bike")) return "cycling_fondo" as any;
  if (n.includes("21k") || n.includes("media marat")) return "21k";
  if (n.includes("10k")) return "10k";
  if (n.includes("5k")) return "5k";
  if (n.includes("ultra") || n.includes("trail")) return "ultra" as any;
  return "42k";
}

/**
 * Fusiona sin pérdidas la carrera principal con todas las carreras secundarias (Tipo B y C)
 * e importa carreras detectadas en el calendario de Intervals.icu.
 */
export function mergeTargetRacesList(
  existingRaces: TargetRace[] = [],
  primaryRace?: TargetRace | null,
  profileRaces: TargetRace[] = [],
  calendarEvents: CalendarEvent[] = []
): TargetRace[] {
  const map = new Map<string, TargetRace>();

  // 1. Inyectar carreras de perfil
  (profileRaces || []).forEach((r) => {
    if (r && r.name) {
      const key = r.id || `${r.name}_${r.date}`;
      map.set(key, r);
    }
  });

  // 2. Inyectar carreras existentes en memoria/storage
  (existingRaces || []).forEach((r) => {
    if (r && r.name) {
      const key = r.id || `${r.name}_${r.date}`;
      map.set(key, r);
    }
  });

  // 3. Extraer e inyectar carreras desde eventos de Intervals.icu
  (calendarEvents || []).forEach((evt) => {
    const isRaceEvent =
      evt.category === "RACE" ||
      evt.category === "TARGET" ||
      (evt.type as string) === "Race" ||
      /giro de rigo|competici|gran fondo|ironman|marat[oó]n|triatl[oó]n/i.test(`${evt.name || ""} ${evt.type || ""}`);

    if (isRaceEvent && evt.name && evt.start_date_local) {
      const dateStr = evt.start_date_local.split("T")[0];
      const cleanName = evt.name.replace(/^\[(?:PULSE AI|SGEA)\]\s*/i, "").trim();
      const key = `race_evt_${dateStr}_${cleanName.toLowerCase().replace(/\s+/g, "_")}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: cleanName,
          date: dateStr,
          distance: inferRaceDistance(cleanName, evt.type),
          priority: "B",
          goalTarget: "Pico de forma óptimo",
        });
      }
    }
  });

  // 4. Priorizar / asegurar la carrera primaria
  if (primaryRace && primaryRace.name) {
    const key = primaryRace.id || `${primaryRace.name}_${primaryRace.date}`;
    map.set(key, { ...primaryRace, priority: primaryRace.priority || "A" });
  }

  const result = Array.from(map.values());
  return result.sort((a, b) => {
    const pOrder = { A: 1, B: 2, C: 3 };
    const diffP = (pOrder[a.priority as "A" | "B" | "C"] || 4) - (pOrder[b.priority as "A" | "B" | "C"] || 4);
    if (diffP !== 0) return diffP;
    return (a.date || "").localeCompare(b.date || "");
  });
}
