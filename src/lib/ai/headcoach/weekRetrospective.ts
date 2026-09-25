import { PlanItem } from "@/lib/gemini/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { PreviousWeekSummary } from "./types";

interface ComputeRetrospectiveParams {
  planningWeekDates: Array<{ day: string; date: string; formattedDate: string }>;
  effectiveExecutedMap: Record<string, { totalTss: number; activities: any[] }>;
  macrocyclePhase?: MacrocyclePhaseInfo | null;
  targetPlanningWeekNum: number;
}

/**
 * Calcula la retrospectiva y balance de la semana anterior a la semana objetivo.
 */
export function computePreviousWeekRetrospective(
  params: ComputeRetrospectiveParams
): PreviousWeekSummary {
  const { planningWeekDates, effectiveExecutedMap, macrocyclePhase, targetPlanningWeekNum } = params;

  // Derivar las fechas de los 7 días de la semana anterior
  const previousWeekDates: Array<{ date: string; formattedDate: string }> = [];
  const baseFirstDate = planningWeekDates[0]?.date ? new Date(planningWeekDates[0].date + "T12:00:00Z") : new Date();

  for (let i = 7; i >= 1; i--) {
    const d = new Date(baseFirstDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const formattedDate = d.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
    previousWeekDates.push({ date: dateStr, formattedDate });
  }

  // Suma de TSS ejecutado en la ventana de la semana anterior
  let actualTss = 0;
  let keySessionsCount = 0;
  const keyActivitiesNames: string[] = [];

  previousWeekDates.forEach((pDate) => {
    const dayData = effectiveExecutedMap[pDate.date];
    if (dayData && dayData.totalTss > 0) {
      actualTss += dayData.totalTss;
      dayData.activities.forEach((act) => {
        if ((act.tss && act.tss >= 50) || (act.movingTimeMin && act.movingTimeMin >= 45)) {
          keySessionsCount++;
          if (act.name && keyActivitiesNames.length < 3) {
            keyActivitiesNames.push(act.name);
          }
        }
      });
    }
  });

  actualTss = Math.round(actualTss);

  // Determinar el TSS planificado para la semana anterior
  const prevWeekIdx = targetPlanningWeekNum - 2; // targetPlanningWeekNum es 1-indexed
  const previousWeekBlueprint = (macrocyclePhase?.blueprint?.weeks && prevWeekIdx >= 0)
    ? macrocyclePhase.blueprint.weeks[prevWeekIdx]
    : null;

  const plannedTss = previousWeekBlueprint?.targetTss || (actualTss > 0 ? actualTss : 350);
  const compliancePct = plannedTss > 0 ? Math.round((actualTss / plannedTss) * 100) : 0;

  const startDate = previousWeekDates[0]?.formattedDate || "Lunes previo";
  const endDate = previousWeekDates[6]?.formattedDate || "Domingo previo";

  let summaryText = "";
  if (actualTss > 0) {
    const activitiesSnippet = keyActivitiesNames.length > 0 ? ` (${keyActivitiesNames.join(", ")})` : "";
    summaryText = `Semana anterior (${startDate} - ${endDate}): ${actualTss} TSS ejecutados frente a ${plannedTss} TSS previstos (${compliancePct}% de cumplimiento). ${keySessionsCount} sesiones clave registradas${activitiesSnippet}.`;
  } else {
    summaryText = `Semana anterior (${startDate} - ${endDate}): Sin registro de actividades en Intervals.icu (${plannedTss} TSS previstos).`;
  }

  return {
    startDate,
    endDate,
    actualTss,
    plannedTss,
    compliancePct,
    keySessionsCount,
    summaryText,
  };
}

/**
 * Escala armónicamente las cargas y duraciones de un microciclo según un porcentaje de ajuste de TSS semanal.
 */
export function applyTssAdjustmentToPlan(
  plan: PlanItem[],
  adjustmentPct: number
): PlanItem[] {
  if (!adjustmentPct || adjustmentPct === 0 || !Array.isArray(plan)) {
    return plan;
  }

  const factor = 1 + adjustmentPct / 100;
  const clampedFactor = Math.max(0.65, Math.min(1.35, factor)); // Rango seguro [-35%, +35%]

  return plan.map((item) => {
    const isRest = item.discipline === "Descanso" || (item.tss === 0 && item.durationMinutes === 0);
    if (isRest) return item;

    const currentTss = item.tss || 40;
    const currentDur = item.durationMinutes || 45;

    const adjustedTss = Math.max(15, Math.round(currentTss * clampedFactor));
    const adjustedDur = Math.max(25, Math.round(currentDur * clampedFactor));

    const sign = adjustmentPct > 0 ? "+" : "";
    const modJustification = `Ajuste táctico de carga: modulación de ${sign}${adjustmentPct}% de TSS/volumen según requerimiento fisiológico semanal.`;

    return {
      ...item,
      tss: adjustedTss,
      durationMinutes: adjustedDur,
      action: "MODIFICAR" as const,
      justification: item.justification ? `${item.justification} • ${modJustification}` : modJustification,
    };
  });
}
