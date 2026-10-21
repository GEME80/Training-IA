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
  weightedWatts?: number;
  heartrate?: number;
  maxHeartrate?: number;
  distanceKm?: number;
  paceStr?: string;
  cardiacDecoupling?: number;
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
            weightedWatts: typeof a.weightedWatts === "number" ? Math.round(a.weightedWatts) : undefined,
            heartrate: typeof a.heartrate === "number" ? Math.round(a.heartrate) : undefined,
            maxHeartrate: typeof a.maxHeartrate === "number" ? Math.round(a.maxHeartrate) : undefined,
            distanceKm: typeof a.distanceKm === "number" ? a.distanceKm : undefined,
            paceStr: a.paceStr,
            cardiacDecoupling: typeof a.cardiacDecoupling === "number" ? Number(a.cardiacDecoupling.toFixed(1)) : undefined,
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
    const weightedWatts = act.icu_weighted_avg_watts ?? act.weighted_average_watts;
    const hr = act.average_heartrate;
    const maxHr = act.max_heartrate;
    const rawDecoupling = act.decoupling ?? act.icu_decoupling ?? act.cardiacDecoupling;
    const decoupling = typeof rawDecoupling === "number" ? Number(rawDecoupling.toFixed(1)) : undefined;
    const distanceKm = act.distance ? Number((act.distance / 1000).toFixed(1)) : undefined;
    const rawRpe = act.icu_rpe ?? act.perceived_exertion ?? act.rpe;
    const rpe = typeof rawRpe === "number" ? rawRpe : undefined;
    const feel = resolveFeelLabel(act.feel);

    if (!map[dKey]) {
      map[dKey] = { date: dKey, totalTss: 0, activities: [] };
    }

    const alreadyExists = map[dKey].activities.some((x) => {
      if (x.id && String(x.id) === String(act.id)) return true;
      const sameType = (x.type === act.type) || (/ride|bike/i.test(x.type) && /ride|bike/i.test(act.type || ""));
      const timeDelta = Math.abs((x.movingTimeMin || 0) - movingTimeMin);
      const distDelta = Math.abs((x.distanceKm || 0) - (distanceKm || 0));
      return sameType && (timeDelta <= 3 || (distanceKm && distDelta <= 0.3));
    });
    if (!alreadyExists) {
      map[dKey].totalTss += tss;
      map[dKey].activities.push({
        id: String(act.id),
        name: act.name,
        type: act.type,
        tss,
        movingTimeMin,
        watts: typeof watts === "number" ? Math.round(watts) : undefined,
        weightedWatts: typeof weightedWatts === "number" ? Math.round(weightedWatts) : undefined,
        heartrate: typeof hr === "number" ? Math.round(hr) : undefined,
        maxHeartrate: typeof maxHr === "number" && maxHr > 35 ? Math.round(maxHr) : undefined,
        cardiacDecoupling: decoupling,
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
  if (a.watts) parts.push(`${a.watts}W avg`);
  if (a.weightedWatts && a.weightedWatts !== a.watts) parts.push(`${a.weightedWatts}W NP`);
  if (a.heartrate) parts.push(`FC ${a.heartrate} bpm avg`);
  if (a.maxHeartrate) parts.push(`FC máx ${a.maxHeartrate} bpm`);
  if (a.cardiacDecoupling !== undefined) parts.push(`Desacople: ${a.cardiacDecoupling > 0 ? `+${a.cardiacDecoupling}%` : `${a.cardiacDecoupling}%`}`);
  if (a.paceStr) parts.push(a.paceStr);
  if (a.distanceKm) parts.push(`${a.distanceKm} km`);
  if (a.rpe) parts.push(`RPE ${a.rpe}/10`);
  if (a.feel) parts.push(`Sensación: ${a.feel}`);
  const discipline = /run|carrera/i.test(a.type) ? "Carrera a pie" : /ride|ciclismo|bike/i.test(a.type) ? "Ciclismo" : a.type;
  return `"${a.name || a.type}" [${discipline}] (${parts.join(" • ")})`;
}

/**
 * Formatea el desglose analítico de TSS individual por actividad con RPE y sensación.
 */
export function formatActivitiesTssBreakdown(map: Record<string, DayActivitySummary>): string {
  const lines = Object.entries(map).flatMap(([dKey, val]) =>
    val.activities.map((a) => {
      const extra: string[] = [];
      if (a.watts) extra.push(`@ ${a.watts}W avg${a.weightedWatts && a.weightedWatts !== a.watts ? ` (${a.weightedWatts}W NP)` : ""}`);
      if (a.heartrate) extra.push(`FC ${a.heartrate} bpm${a.maxHeartrate ? ` (máx ${a.maxHeartrate})` : ""}`);
      if (a.cardiacDecoupling !== undefined) extra.push(`Desacople: ${a.cardiacDecoupling > 0 ? `+${a.cardiacDecoupling}%` : `${a.cardiacDecoupling}%`}`);
      if (a.paceStr) extra.push(a.paceStr);
      if (a.rpe) extra.push(`RPE ${a.rpe}/10`);
      if (a.feel) extra.push(`Sensación: ${a.feel}`);
      const extraStr = extra.length > 0 ? ` (${extra.join(" • ")})` : "";
      const disc = /run|carrera/i.test(a.type) ? "Carrera a pie" : /ride|ciclismo|bike/i.test(a.type) ? "Ciclismo" : a.type;
      return `  - [${dKey}] "${a.name || a.type}" [${disc}]: ${a.tss} TSS en ${a.movingTimeMin}m${extraStr}`;
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
