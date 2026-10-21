/**
 * workoutSyntaxSanitizer.ts
 * 
 * Sanitizador y normalizador universal de sintaxis estructurada para entrenamientos (Workout DSL).
 * Garantiza compatibilidad 100% entre:
 * 1. Intervals.icu Workout Builder DSL
 * 2. Garmin Connect FIT Protocol (Steps y Repeat Loops)
 * 3. Pulse WorkoutChart Renderer
 * 
 * Principio de Fuente Canónica:
 * - El sistema emite directamente 'mtr' para metros de distancia y 'm'/'s' para minutos/segundos de tiempo.
 * - Sin expresiones regulares de adivinanza o transformación de unidades.
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
  let currentDiscipline = options?.discipline || "Carrera";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    if (/sector\s*1|nataci/i.test(line)) currentDiscipline = "Natacion";
    if (/sector\s*2|ciclismo|bike/i.test(line)) currentDiscipline = "Ciclismo";
    if (/sector\s*3|carrera|marat[oó]n|running/i.test(line)) currentDiscipline = "Carrera";

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

      // b) Convertir cualquier comentario residual entre paréntesis al final a comillas dobles
      line = line.replace(/\s*\(([^)]+)\)\s*$/, (_m, note) => ` "${note.trim()}"`);

      // c) Normalización de unidades de esfuerzo:
      // En Ciclismo: NUNCA reemplazar FTP por CP o Pace. Ciclismo es 100% FTP.
      if (currentDiscipline === "Ciclismo" || /ciclismo|bike/i.test(line)) {
        line = line.replace(/%\s*CP\b/gi, "% FTP");
      } else if (currentDiscipline === "Carrera") {
        if (options?.isRunPaceOnly) {
          line = line.replace(/%\s*(?:CP|FTP)\b/gi, "% Pace");
        } else {
          line = line.replace(/%\s*FTP\b/gi, "% CP").replace(/%\s*Pace\b/gi, "% CP");
        }
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
