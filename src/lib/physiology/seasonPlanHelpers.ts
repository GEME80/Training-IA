import { MacrocyclePhaseInfo, TargetRace, MacrocycleBlueprint } from "./macrocycle";

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

/**
 * Fusiona sin pérdidas la carrera principal con todas las carreras secundarias (Tipo B y C).
 */
export function mergeTargetRacesList(
  existingRaces: TargetRace[] = [],
  primaryRace?: TargetRace | null,
  profileRaces: TargetRace[] = []
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

  // 3. Priorizar / asegurar la carrera primaria
  if (primaryRace && primaryRace.name) {
    const key = primaryRace.id || `${primaryRace.name}_${primaryRace.date}`;
    map.set(key, { ...primaryRace, priority: primaryRace.priority || "A" });
  }

  const result = Array.from(map.values());
  // Ordenar por prioridad (A primero, luego B, luego C) y luego por fecha
  return result.sort((a, b) => {
    const pOrder = { A: 1, B: 2, C: 3 };
    const diffP = (pOrder[a.priority as "A" | "B" | "C"] || 4) - (pOrder[b.priority as "A" | "B" | "C"] || 4);
    if (diffP !== 0) return diffP;
    return (a.date || "").localeCompare(b.date || "");
  });
}
