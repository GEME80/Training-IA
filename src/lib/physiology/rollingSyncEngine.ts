import { MacrocycleWeek } from "./macrocycle";
import { PlanItem } from "@/lib/gemini/engine";
import { isMasterAdminEmail } from "@/lib/env";

export interface AthleteEligibilityOpts {
  isReadOnly?: boolean;
  status?: string;
  email?: string;
  isDemo?: boolean;
  athleteId?: string;
  apiKey?: string;
  hasPlan?: boolean;
  autoSyncIntervals?: boolean;
  hasEncryptedKey?: boolean;
  hasApiKey?: boolean;
}

/**
 * Compuerta de seguridad de 6 niveles para determinar si un atleta es elegible
 * para la sincronización automática continua con Intervals.icu y Garmin.
 */
export function isAthleteEligibleForAutoSync(opts: AthleteEligibilityOpts): boolean {
  // 1. Bloqueo estricto si está en modo auditoría / solo lectura
  if (opts.isReadOnly) return false;

  // 2. Bloqueo de perfiles demo o simulados
  const emailLower = (opts.email || "").toLowerCase();
  if (opts.isDemo || emailLower.includes("demo") || emailLower.endsWith("@example.com")) {
    return false;
  }

  // 3. Estado de la cuenta (debe estar activo, o no suspendido/pausado)
  if (opts.status && opts.status !== "active") {
    return false;
  }

  // 4. Credenciales de Intervals.icu presentes (en cliente o en servidor vía Firestore/Env)
  const isSuper = isMasterAdminEmail(opts.email);
  const hasCredentialKey = Boolean(opts.apiKey || opts.hasEncryptedKey || opts.hasApiKey || isSuper);
  if (!opts.athleteId || !hasCredentialKey) {
    return false;
  }

  // 5. Debe poseer un plan estructurado activo
  if (!opts.hasPlan) {
    return false;
  }

  // 6. Soberanía del atleta (por defecto true salvo que se desactive explícitamente)
  if (opts.autoSyncIntervals === false) {
    return false;
  }

  return true;
}

/**
 * Extrae la ventana rodante de 3 semanas (21 días hacia adelante) a partir de hoy o el lunes actual.
 */
export function calculateRollingWindow(
  weeks: MacrocycleWeek[],
  todayStr: string,
  minWeeksAhead: number = 3
): {
  targetWeeks: MacrocycleWeek[];
  fromDate: string;
  toDate: string;
} {
  if (!weeks || weeks.length === 0) {
    return { targetWeeks: [], fromDate: todayStr, toDate: todayStr };
  }

  // Determinar el lunes de la semana en curso
  const today = new Date(todayStr || new Date().toISOString().split("T")[0]);
  const day = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + distanceToMonday);
  const currentMondayStr = currentMonday.toISOString().split("T")[0];

  // Filtrar semanas que no hayan concluido (su endDate es >= hoy o startDate >= lunes actual)
  const futureOrCurrentWeeks = weeks.filter(
    (w) => (!w.endDate || w.endDate >= todayStr) || (!w.startDate || w.startDate >= currentMondayStr)
  );

  const targetWeeks = futureOrCurrentWeeks.slice(0, minWeeksAhead);
  if (targetWeeks.length === 0) {
    return { targetWeeks: [], fromDate: todayStr, toDate: todayStr };
  }

  const fromDate = targetWeeks[0].startDate || currentMondayStr;
  const toDate = targetWeeks[targetWeeks.length - 1].endDate || targetWeeks[targetWeeks.length - 1].startDate;

  return { targetWeeks, fromDate, toDate };
}

/**
 * Calcula una firma hash rápida determinista de los entrenamientos y umbrales para dirty checking.
 */
export function computePlanHash(
  planItems: PlanItem[],
  opts: {
    runFtp?: number;
    bikeFtp?: number;
    runningMode?: string;
    thresholdPaceSec?: number;
    swimCssSec?: number;
  } = {}
): string {
  const parts: string[] = [
    String(opts.runningMode || "PACE"),
  ];

  for (const item of planItems) {
    if (item.isRestDay || item.discipline === "Descanso") continue;
    parts.push(
      `${item.date}_${item.discipline}_${item.workoutName || ""}_${item.durationMinutes || 0}_${(item as any).targetTss || item.tss || 0}`
    );
  }

  // Hash determinista ligero tipo FNV-1a en string base36
  let hash = 2166136261;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return "v2_" + (hash >>> 0).toString(36);
}

/**
 * Determina si se requiere sincronizar la ventana rodante:
 * 1. Si nunca se ha sincronizado (`!lastSyncedToDate`).
 * 2. Si el hash de contenido cambió (`currentHash !== lastSyncedHash`).
 * 3. Si la fecha actual ha dejado el buffer con menos de `minBufferDays` (por defecto 14 días).
 */
export function isRollingSyncNeeded(
  lastSyncedToDate: string | null | undefined,
  currentToDate: string,
  todayStr: string,
  lastSyncedHash: string | null | undefined,
  currentHash: string,
  minBufferDays: number = 14
): boolean {
  if (!lastSyncedToDate) return true;
  if (lastSyncedHash !== currentHash) return true;

  try {
    const today = new Date(todayStr);
    const syncedTo = new Date(lastSyncedToDate);
    const diffMs = syncedTo.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Si los días cubiertos son menores a 14 o si la ventana actual va más allá de lo sincronizado
    if (remainingDays < minBufferDays || currentToDate > lastSyncedToDate) {
      return true;
    }
  } catch {
    return true;
  }

  return false;
}
