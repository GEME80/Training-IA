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

      // b) Convertir notas de metros o comentarios entre paréntesis al final a comillas dobles:
      // Ej: "- 40s 110% Pace (200m)" => '- 40s 110% Pace "200m"'
      line = line.replace(/\s*\(([^)]+)\)\s*$/, (_m, note) => ` "${note.trim()}"`);

      // c) Si el corredor es exclusivo por ritmo, forzar conversión de % CP / % FTP a % Pace
      if (options?.isRunPaceOnly || (options?.discipline === "Carrera" && options?.isRunPaceOnly)) {
        line = line.replace(/%\s*(?:CP|FTP)\b/gi, "% Pace");
      }

      // d) Limpiar espacios redundantes dentro de la línea
      line = line.replace(/\s{2,}/g, " ").trim();
    }

    result.push(line);
  }

  // Eliminar líneas en blanco al principio y al final
  while (result.length > 0 && result[0] === "") result.shift();
  while (result.length > 0 && result[result.length - 1] === "") result.pop();

  return result.join("\n");
}
