import { AthleteWellness } from "./types";

export interface ExtractedGarminWellness {
  restingHR?: number;
  weightKg?: number;
  sleepQuality?: number;
  sleepSecs?: number;
  hrv?: number;
}

/**
 * Extrae la telemetría objetiva registrada por sensores Garmin Connect
 * desde el historial de bienestar (wellness) de Intervals.icu.
 * Recorre en orden cronológico inverso para obtener la última medición válida durante el sueño profundo.
 */
export function extractGarminWellnessTelemetry(
  wellnessRecords: AthleteWellness[] | undefined | null
): ExtractedGarminWellness {
  if (!wellnessRecords || wellnessRecords.length === 0) return {};

  const reversed = [...wellnessRecords].reverse();

  // 1. FC de reposo nocturna medida por el sensor óptico de Garmin durante el sueño
  const rhrRecord = reversed.find(
    (w) => typeof w.restingHR === "number" && w.restingHR > 28 && w.restingHR < 125
  );

  // 2. Peso medido por báscula inteligente Garmin Index o sincronización Connect
  const weightRecord = reversed.find(
    (w) => typeof w.weight === "number" && w.weight > 30 && w.weight < 250
  );

  // 3. Calidad y duración de sueño de Garmin Sleep Tracking
  const sleepRecord = reversed.find(
    (w) => typeof w.sleepSecs === "number" && w.sleepSecs > 1800
  );

  // 4. HRV (rMSSD) nocturno medido por Garmin
  const hrvRecord = reversed.find(
    (w) => {
      const val = w.hrv ?? (w as any).avgOvernightHrv ?? (w as any).rmssd;
      return typeof val === "number" && val > 5 && val < 250;
    }
  );

  const rawHrv = hrvRecord ? (hrvRecord.hrv ?? (hrvRecord as any).avgOvernightHrv ?? (hrvRecord as any).rmssd) : undefined;

  return {
    restingHR: rhrRecord?.restingHR,
    weightKg: weightRecord?.weight,
    sleepQuality: sleepRecord?.sleepQuality,
    sleepSecs: sleepRecord?.sleepSecs,
    hrv: typeof rawHrv === "number" ? Math.round(rawHrv) : undefined,
  };
}
