/**
 * Optimizador FinOps de Contexto Fisiológico y Actividades para Modelos Google Gemini.
 * Comprime y minifica datos crudos de telemetría deportiva reduciendo el consumo
 * de tokens de entrada sin perder fidelidad analítica, biomecánica ni subjetiva (RPE/Feel).
 */

export interface CompactActivity {
  id?: string;
  name: string;
  type: string;
  tss: number;
  movingTimeMin: number;
  watts?: number;
  heartrate?: number;
  distanceKm?: number;
  rpe?: number;
  feel?: string;
}

export interface DayActivitySummary {
  date: string;
  totalTss: number;
  activities: CompactActivity[];
}

const FEEL_LABELS: Record<number, string> = {
  1: "Excelente",
  2: "Bueno",
  3: "Normal",
  4: "Exigente",
  5: "Agotado",
};

export function resolveFeelLabel(val: unknown): string | undefined {
  if (typeof val === "string" && val.trim()) return val.trim();
  if (typeof val === "number" && FEEL_LABELS[val]) return FEEL_LABELS[val];
  return undefined;
}

/**
 * Normaliza y condensa actividades dispersas de Intervals.icu en un mapa diario de alta densidad.
 */
export function buildCondensedExecutedMap(
  pastActivities: any[] = [],
  dailyExecutedActivities: Record<string, any> = {}
): Record<string, DayActivitySummary> {
  const map: Record<string, DayActivitySummary> = {};

  if (dailyExecutedActivities && typeof dailyExecutedActivities === "object") {
    Object.entries(dailyExecutedActivities).forEach(([dKey, val]: [string, any]) => {
      const activities: CompactActivity[] = Array.isArray(val?.activities)
        ? val.activities.map((a: any) => ({
            id: a.id ? String(a.id) : undefined,
            name: a.name || a.type || "Actividad",
            type: a.type || "Other",
            tss: Math.round(Number(a.tss || 0)),
            movingTimeMin: Math.round(Number(a.movingTimeMin || 0)),
            watts: typeof a.watts === "number" ? Math.round(a.watts) : undefined,
            heartrate: typeof a.heartrate === "number" ? Math.round(a.heartrate) : undefined,
            distanceKm: typeof a.distanceKm === "number" ? a.distanceKm : undefined,
            rpe: typeof a.rpe === "number" ? a.rpe : (typeof a.icu_rpe === "number" ? a.icu_rpe : undefined),
            feel: resolveFeelLabel(a.feel),
          }))
        : [];

      map[dKey] = {
        date: dKey,
        totalTss: Number(val?.totalTss || 0),
        activities,
      };
    });
  }

  pastActivities.forEach((act: any) => {
    if (!act.start_date_local) return;
    const dKey = act.start_date_local.split("T")[0];
    const tss = Math.round(act.icu_training_load ?? act.training_load ?? act.tss ?? 0);
    const movingTimeMin = Math.round((act.moving_time ?? act.elapsed_time ?? 0) / 60);
    const watts = act.icu_weighted_avg_watts ?? act.icu_average_watts ?? act.weighted_average_watts ?? act.average_watts ?? act.device_watts;
    const hr = act.average_heartrate;
    const distanceKm = act.distance ? Number((act.distance / 1000).toFixed(1)) : undefined;
    const rawRpe = act.icu_rpe ?? act.perceived_exertion ?? act.rpe;
    const rpe = typeof rawRpe === "number" ? rawRpe : undefined;
    const feel = resolveFeelLabel(act.feel);

    if (!map[dKey]) {
      map[dKey] = { date: dKey, totalTss: 0, activities: [] };
    }

    const alreadyExists = map[dKey].activities.some((x) => x.id && String(x.id) === String(act.id));
    if (!alreadyExists) {
      map[dKey].totalTss += tss;
      map[dKey].activities.push({
        id: String(act.id),
        name: act.name,
        type: act.type,
        tss,
        movingTimeMin,
        watts: typeof watts === "number" ? Math.round(watts) : undefined,
        heartrate: typeof hr === "number" ? Math.round(hr) : undefined,
        distanceKm,
        rpe,
        feel,
      });
    }
  });

  return map;
}

/**
 * Formatea una actividad compacta para la auditoría diaria del Head Coach.
 */
export function formatCompactActivitySummary(a: CompactActivity): string {
  const parts: string[] = [`${a.movingTimeMin}m`, `${a.tss} TSS`];
  if (a.watts) parts.push(`${a.watts}W`);
  if (a.heartrate) parts.push(`${a.heartrate} bpm`);
  if (a.distanceKm) parts.push(`${a.distanceKm} km`);
  if (a.rpe) parts.push(`RPE ${a.rpe}/10`);
  if (a.feel) parts.push(`Sensación: ${a.feel}`);
  return `"${a.name || a.type}" (${parts.join(", ")})`;
}

/**
 * Formatea el desglose analítico de TSS individual por actividad con RPE y sensación.
 */
export function formatActivitiesTssBreakdown(map: Record<string, DayActivitySummary>): string {
  const lines = Object.entries(map).flatMap(([dKey, val]) =>
    val.activities.map((a) => {
      const extra: string[] = [];
      if (a.watts) extra.push(`@ ${a.watts}W`);
      if (a.heartrate) extra.push(`FC ${a.heartrate} bpm`);
      if (a.rpe) extra.push(`RPE ${a.rpe}/10`);
      if (a.feel) extra.push(`Sensación: ${a.feel}`);
      const extraStr = extra.length > 0 ? ` (${extra.join(" • ")})` : "";
      return `  - [${dKey}] "${a.name || a.type}" (${a.type}): ${a.tss} TSS en ${a.movingTimeMin}m${extraStr}`;
    })
  );
  return lines.length > 0 ? lines.join("\n") : "  (No hay actividades registradas en el periodo)";
}

/**
 * Formatea el estado subjetivo de Wellness reciente (dolor, fatiga, estrés, calidad de sueño).
 */
export function formatRecentWellnessSummary(wellnessList: any[] = []): string {
  if (!Array.isArray(wellnessList) || wellnessList.length === 0) return "";
  const recent = wellnessList[0];
  if (!recent) return "";
  const parts: string[] = [];
  if (recent.soreness) parts.push(`Dolor muscular: ${recent.soreness}/5`);
  if (recent.fatigue) parts.push(`Fatiga percibida: ${recent.fatigue}/5`);
  if (recent.stress) parts.push(`Estrés: ${recent.stress}/5`);
  if (recent.sleepQuality) parts.push(`Calidad sueño: ${recent.sleepQuality}/5`);
  if (recent.sleepSecs) parts.push(`Horas sueño: ${(recent.sleepSecs / 3600).toFixed(1)}h`);
  if (recent.comments) parts.push(`Nota: "${recent.comments}"`);
  return parts.length > 0 ? parts.join(" • ") : "";
}

/**
 * Genera un desglose legible y ultracompacto de actividades diarias para el prompt del Head Coach.
 */
export function formatCondensedActivitiesSummary(map: Record<string, DayActivitySummary>): string {
  const dates = Object.keys(map).sort();
  if (dates.length === 0) return "  (Sin actividades registradas en los últimos días)";

  return dates
    .map((date) => {
      const item = map[date];
      if (!item.activities.length) return `  - ${date}: 0 TSS (Descanso)`;
      const actsStr = item.activities.map((a) => formatCompactActivitySummary(a)).join("; ");
      return `  - ${date} (Total: ${item.totalTss} TSS): ${actsStr}`;
    })
    .join("\n");
}
