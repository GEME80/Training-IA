/**
 * formatters.ts
 * Utilidades puras de renderizado defensivo y reutilizables para el Frontend.
 * 
 * DATA-DRIVEN ESTRICTO: Cero hardcode de atletas, eventos, duraciones o metodologías.
 */

/**
 * Convierte minutos brutos a formato legible atlético (ej. 185 -> "3h 05m", 45 -> "45 min", 0 -> "--")
 */
export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "--";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins.toString().padStart(2, "0")}m` : `${hrs}h`;
}

/**
 * Limpia prefijos duplicados del nombre en la descripción si vienen del generador
 */
export function sanitizePhaseDescription(phaseName: string, description?: string | null): string {
  if (!description) return "";
  let cleaned = description.trim();

  // 1. Elimina prefijo del nombre si viene al inicio (con o sin dos puntos o guiones)
  if (phaseName) {
    const escaped = phaseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`^${escaped}[:\\-–]?\\s*`, "i"), "");

    // Si el nombre contiene subtítulo "Fase X: Subtítulo", probar también con solo el subtítulo
    const subTitleMatch = phaseName.match(/Fase\s+\d+:\s*(.+)/i);
    if (subTitleMatch && subTitleMatch[1]) {
      const escapedSub = subTitleMatch[1].trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      cleaned = cleaned.replace(new RegExp(`^${escapedSub}[:\\-–]?\\s*`, "i"), "");
    }
  }

  // 2. Elimina prefijos recurrentes tipo "Fase 1:", "Fase 2 -", "Fase 3:"
  cleaned = cleaned.replace(/^Fase\s+\d+[:\-–]?\s*/i, "");

  // 3. Remueve dos puntos o guiones residuales al inicio
  cleaned = cleaned.replace(/^[:\-–]\s*/, "");

  return cleaned.trim();
}
