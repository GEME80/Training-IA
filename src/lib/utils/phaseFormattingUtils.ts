/**
 * phaseFormattingUtils.ts
 * Utilidades puras de presentación (Frontend) para la deduplicación
 * y formateo atlético de las fases de macrociclo.
 * 
 * ZERO-TOUCH BACKEND: No modifica esquemas, APIs ni modelos fisiológicos.
 */

/**
 * Sanitiza la descripción de una fase eliminando prefijos duplicados del nombre
 * (ej. "{name}:", "Fase X:", "Fase X -", etc.) para evitar redundancia en UI.
 */
export function sanitizePhaseDescription(name: string, description: string): string {
  if (!description) return "";
  let cleaned = description.trim();

  // 1. Si la descripción empieza con el nombre exacto de la fase (con o sin dos puntos o guiones)
  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`^${escapedName}[:\\-–]?\\s*`, "i"), "");

    // Si el nombre contiene subtítulo "Fase X: Subtítulo", probar también con solo el subtítulo
    const subTitleMatch = name.match(/Fase\s+\d+:\s*(.+)/i);
    if (subTitleMatch && subTitleMatch[1]) {
      const escapedSub = subTitleMatch[1].trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      cleaned = cleaned.replace(new RegExp(`^${escapedSub}[:\\-–]?\\s*`, "i"), "");
    }
  }

  // 2. Elimina prefijos recurrentes tipo "Fase 1:", "Fase 2 -", "Fase 3:"
  cleaned = cleaned.replace(/^Fase\s+\d+[:\-–]?\s*/i, "");

  // 3. Remueve dos puntos o guiones huérfanos residuales al inicio
  cleaned = cleaned.replace(/^[:\-–]\s*/, "");

  return cleaned.trim();
}

/**
 * Formatea minutos brutos a notación atlética legible (ej. 150 -> "2h 30m", 55 -> "55 min")
 */
export function formatLongRunDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "0 min";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins.toString().padStart(2, "0")}m` : `${hrs}h`;
}
