/**
 * Optimizador FinOps de Contexto Fisiológico y Actividades para Modelos Google Gemini.
 * Comprime y minifica datos crudos de telemetría deportiva reduciendo hasta un 75%
 * el consumo de tokens de entrada sin perder fidelidad analítica ni biológica.
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
}

export interface DayActivitySummary {
  date: string;
  totalTss: number;
  activities: CompactActivity[];
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
      map[dKey] = {
        date: dKey,
        totalTss: Number(val?.totalTss || 0),
        activities: Array.isArray(val?.activities) ? val.activities : [],
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

    if (!map[dKey]) {
      map[dKey] = { date: dKey, totalTss: 0, activities: [] };
    }

    const alreadyExists = map[dKey].activities.some((x) => x.id === act.id);
    if (!alreadyExists) {
      map[dKey].totalTss += tss;
      map[dKey].activities.push({
        id: act.id,
        name: act.name,
        type: act.type,
        tss,
        movingTimeMin,
        watts: typeof watts === "number" ? Math.round(watts) : undefined,
        heartrate: typeof hr === "number" ? Math.round(hr) : undefined,
        distanceKm,
      });
    }
  });

  return map;
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
      const actsStr = item.activities
        .map((a) => {
          const w = a.watts ? `, ${a.watts}W` : "";
          const hr = a.heartrate ? `, ${a.heartrate} bpm` : "";
          const km = a.distanceKm ? `, ${a.distanceKm} km` : "";
          return `[${a.type}] ${a.name || "Sesión"} (${a.movingTimeMin}m, ${a.tss} TSS${w}${hr}${km})`;
        })
        .join("; ");
      return `  - ${date} (Total: ${item.totalTss} TSS): ${actsStr}`;
    })
    .join("\n");
}
