/**
 * raceGoalParser.ts
 * Parser universal de tiempos objetivo para competiciones de carrera, triatlón y ciclismo.
 * Soporta formatos: "3:05", "3:05:00", "Sub 3h05", "3h05m", "185 min", "1:25", "38:00".
 */

export function parseGoalTimeToMinutes(goalTarget?: string): number | null {
  if (!goalTarget || typeof goalTarget !== "string") return null;
  const clean = goalTarget.toLowerCase().replace(/sub[-\s]?/g, "").trim();

  // Match HH:MM:SS or HH:MM
  const timeMatch = clean.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) {
    const p1 = parseInt(timeMatch[1], 10);
    const p2 = parseInt(timeMatch[2], 10);
    // Si p1 >= 10 y no hay segundos explícitos, y p1 <= 60 (ej. "38:00" para 10K, "19:30" para 5K)
    if (p1 >= 10 && !timeMatch[3] && p1 <= 60 && p2 === 0) return p1;
    if (p1 >= 10 && !timeMatch[3] && p1 <= 60) return Math.round(p1 + p2 / 60);
    return p1 * 60 + p2;
  }

  // Match 3h05, 3h05m, 3h 05, 3h 05m, 3h, 3 horas 05 min
  const hMatch = clean.match(/(\d{1,2})\s*h(?:our|oras?)?\s*(\d{1,2})?(?:\s*m(?:in|utos?)?)?/);
  if (hMatch) {
    const hours = parseInt(hMatch[1], 10);
    const mins = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    return hours * 60 + mins;
  }

  // Match minutos directos: "185 min", "185m"
  const mMatch = clean.match(/^(\d{2,3})\s*(?:min|m)$/);
  if (mMatch) {
    return parseInt(mMatch[1], 10);
  }

  return null;
}

/**
 * Formatea minutos totales en formato legible "Xh YYm" o "XX min"
 */
export function formatGoalMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) {
    return m > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h 00m`;
  }
  return `${m}m`;
}
