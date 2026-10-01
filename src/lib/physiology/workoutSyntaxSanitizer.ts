/**
 * workoutSyntaxSanitizer.ts
 * 
 * Sanitizador y normalizador universal de sintaxis estructurada para entrenamientos (Workout DSL).
 * Garantiza compatibilidad 100% entre:
 * 1. Intervals.icu Workout Builder DSL
 * 2. Garmin Connect FIT Protocol (Steps y Repeat Loops)
 * 3. Pulse WorkoutChart Renderer
 */

export interface SanitizeOptions {
  discipline?: string;
  isRunPaceOnly?: boolean;
  forIntervalsSync?: boolean;
}

/**
 * Normaliza y sanea el texto del entrenamiento para que cumpla estrictamente
 * las especificaciones de Intervals.icu y Garmin Connect.
 */
export function sanitizeWorkoutDoc(doc?: string, options?: SanitizeOptions): string {
  if (!doc || doc.trim().length === 0) return "";

  const lines = doc.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    // 1. Detección y normalización de repeticiones con texto adjunto:
    // Ejemplos: "6x Fartlek Ágil", "4x (9m Over-Under)", "3x: Series Cuestas"
    const repeatWithText = line.match(/^(\d+)\s*x\s*(?:\((.*?)\)|:\s*(.*)|(.*))$/i);
    if (repeatWithText && (repeatWithText[2] || repeatWithText[3] || repeatWithText[4])) {
      const count = repeatWithText[1];
      const rawTitle = (repeatWithText[2] || repeatWithText[3] || repeatWithText[4]).trim();
      const cleanTitle = rawTitle.replace(/^[-(:]+/, "").replace(/[-):]+$/, "").trim();

      if (cleanTitle) {
        result.push(`Main (${cleanTitle})`);
      }
      result.push(`${count}x`);
      continue;
    }

    // 2. Normalización de pasos individuales (líneas que inician con '-')
    if (line.startsWith("-")) {
      // a) Eliminar arroba "@" que confunde algunos dispositivos Garmin
      line = line.replace(/@\s*/g, "");

      // b) Transformar pasos fraccionados con tiempo forzado y nota de distancia
      // Ej: "- 40s 110% Pace (200m)" o '- 40s 110% Pace "200m"' => '- 200mtr 110% Pace'
      // Preserva descansos por tiempo intactos: '- 1m 55% Pace', '- 1m30s 55% Pace'
      const legacyDistanceMatch = line.match(
        /^-\s*(?:\d+h)?(?:\d+m(?:in)?)?(?:\d+s)?\s+(.*?)\s+["\(](\d+\s*(?:m|km|mtr|metros?))(?:\s+[^"\)]*)?["\)]\s*$/i
      );
      if (legacyDistanceMatch) {
        const intensity = legacyDistanceMatch[1].trim();
        let rawDist = legacyDistanceMatch[2].trim().toLowerCase().replace(/\s*metros?/, "mtr").replace(/\s+/, "");
        if (rawDist.endsWith("m") && !rawDist.endsWith("km") && !rawDist.endsWith("mtr")) {
          rawDist = rawDist.slice(0, -1) + "mtr";
        }
        line = `- ${rawDist} ${intensity}`;
      }

      // c) Normalizar distancias métricas a la especificación oficial Intervals.icu ('mtr'):
      // Pasos en carrera/pista con distancias fijas (ej: 100m, 200m, 400m, 600m, 800m, 1000m, 2000m)
      // se convierten a 'mtr' para evitar que Intervals.icu los confunda con minutos.
      line = line.replace(/^-\s*(\d+)\s*metros?\b/i, "- $1mtr");
      line = line.replace(/^-\s*(50|60|100|150|200|300|400|500|600|800|1000|1200|1500|1600|2000|3000|5000)\s*m\b/i, "- $1mtr");
      line = line.replace(/^-\s*(\d+(?:\.\d+)?)\s*km\b/i, "- $1km");

      // d) Convertir cualquier comentario residual entre paréntesis al final a comillas dobles
      line = line.replace(/\s*\(([^)]+)\)\s*$/, (_m, note) => ` "${note.trim()}"`);

      // e) Normalización de unidades de carrera (Pace para atletas sin Stryd, CP para atletas Stryd)
      if (options?.isRunPaceOnly || (options?.discipline === "Carrera" && options?.isRunPaceOnly)) {
        line = line.replace(/%\s*(?:CP|FTP)\b/gi, "% Pace");
      } else if (options?.discipline === "Carrera") {
        line = line.replace(/%\s*FTP\b/gi, "% CP");
      }

      // f) Limpiar espacios redundantes dentro de la línea
      line = line.replace(/\s{2,}/g, " ").trim();
    }

    result.push(line);
  }

  // Eliminar líneas en blanco al principio y al final
  while (result.length > 0 && result[0] === "") result.shift();
  while (result.length > 0 && result[result.length - 1] === "") result.pop();

  return result.join("\n");
}
