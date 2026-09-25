import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, ActivitySummary } from "@/lib/intervals/types";
import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getWeekDates, normalizeDisciplines, CANONICAL_DAYS, getDayDisciplines, resolveEffectiveAvailability } from "@/lib/gemini/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { HeadCoachPromptContext } from "@/lib/ai/prompts";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { buildCondensedExecutedMap, formatCompactActivitySummary, formatActivitiesTssBreakdown, formatRecentWellnessSummary } from "@/lib/ai/contextCondenser";
import { FtpDetectionService } from "@/lib/services/ftpDetectionService";
import { computePreviousWeekRetrospective } from "./weekRetrospective";
import { HeadCoachChatRequest, PreviousWeekSummary } from "./types";

export interface ResolvedChatContext {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus;
  plannedWeekTss: number;
  actualTss: number;
  compliancePct: number;
  targetMinTss: number;
  targetMaxTss: number;
  formDiagnostic: string;
  hasExistingPlan: boolean;
  currentPlanSummary: string;
  availabilityFormatted: string;
  safeAvailability: WeeklyAvailabilityMap;
  targetPlanningWeekNum: number;
  planningWeekDates: Array<{ day: string; date: string; formattedDate: string }>;
  planningStartDateStr: string;
  planningEndDateStr: string;
  todayDayName: string;
  todayDateStr: string;
  todayDayIndex: number;
  isCurrentWeek: boolean;
  isDeload: boolean;
  coachStyleDescription: string;
  promptContext: HeadCoachPromptContext;
  effectiveExecutedMap: Record<string, { totalTss: number; activities: any[] }>;
  previousWeekSummary: PreviousWeekSummary;
  targetTssAdjustmentPct: number;
  isWeekKickoffAudit: boolean;
}

export async function resolveChatContext(body: HeadCoachChatRequest): Promise<ResolvedChatContext> {
  const {
    athleteId,
    apiKey,
    uid,
    email,
    weekOffset = 0,
    weekNumber = 1,
    macrocyclePhase = null,
    weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
    temporaryAvailability,
    targetTssAdjustmentPct = 0,
    isWeekKickoffAudit = false,
    currentPlan = [],
    dailyExecutedActivities = {},
    runFtp,
    bikeFtp,
    birthDate,
    gender,
    weight,
    height,
    restingHR,
    maxHR,
    lthr,
    isInitialAudit = false,
    coachProfile = "balanced",
    customPrompt: initialCustomPrompt = "",
  } = body;

  let customPrompt = initialCustomPrompt;
  const safeWeekNum = Number(weekNumber) || 1;
  const safeOffset = Number(weekOffset) || 0;

  const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
    await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

  let profile: AthleteProfile = {
    id: effectiveAthleteId, name: "Atleta", ctl: 0, atl: 0, tsb: 0, rampRate: 0,
    run_ftp: runFtp ? Number(runFtp) : undefined, bike_ftp: bikeFtp ? Number(bikeFtp) : undefined,
    weight: weight ? Number(weight) : undefined, heightCm: height ? Number(height) : undefined,
    birthDate, gender: (gender === "M" || gender === "F" || gender === "OTHER") ? gender : undefined,
    restingHR: restingHR ? Number(restingHR) : undefined, maxHR: maxHR ? Number(maxHR) : undefined, lthr: lthr ? Number(lthr) : undefined,
  };
  let wellness: AthleteWellness[] = [];
  let pastActivities: ActivitySummary[] = [];

  if (effectiveAthleteId && effectiveApiKey) {
    try {
      const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
      const today = new Date();
      const oldestStr = new Date(today.getTime() - 14 * 86400000).toISOString().split("T")[0];
      const newestStr = today.toISOString().split("T")[0];

      const [ath, wel, acts, sports] = await Promise.all([
        client.getAthlete().catch(() => null),
        client.getWellness(oldestStr, newestStr).catch(() => []),
        client.getActivities(oldestStr, newestStr).catch(() => []),
        client.getSportSettings().catch(() => []),
      ]);

      if (ath) {
        const runSport = (sports || []).find((s: any) => s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) || /run/i.test(String(s.id)));
        const rideSport = (sports || []).find((s: any) => s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) || /ride|cycling|bike/i.test(String(s.id)));

        const anyAth = (ath || {}) as any;
        const icuDob = anyAth.icu_date_of_birth || anyAth.dob || anyAth.date_of_birth || birthDate;
        let computedAge: number | undefined = undefined;
        if (icuDob) {
          const birth = new Date(icuDob);
          if (!isNaN(birth.getTime())) {
            const now = new Date();
            let age = now.getFullYear() - birth.getFullYear();
            const monthDiff = now.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
            if (age > 0 && age < 120) computedAge = age;
          }
        }
        if (!computedAge && (body as any).age) {
          computedAge = Number((body as any).age);
        }

        const resolvedSex: "M" | "F" | "OTHER" = (gender === "M" || anyAth.sex === "M" || anyAth.gender === "M") ? "M" : ((gender === "F" || anyAth.sex === "F" || anyAth.gender === "F") ? "F" : "M");
        const rawHeight = (anyAth.icu_height as number) || (anyAth.height as number) || undefined;
        const resolvedHeight = (body as any).height || (rawHeight ? (rawHeight < 3 ? Math.round(rawHeight * 100) : Math.round(rawHeight)) : undefined);
        const resolvedWeight = weight || anyAth.weight || (wellness[0] as any)?.weight || ath?.weight;
        const resolvedRunFtp = (runFtp ? Number(runFtp) : undefined) || runSport?.ftp || anyAth.icu_running_ftp || ath?.run_ftp || 0;
        const resolvedBikeFtp = (bikeFtp ? Number(bikeFtp) : undefined) || rideSport?.ftp || anyAth.icu_ftp || ath?.bike_ftp || 0;

        // Fisiología dinámica calculada (no quemada): Tanaka 208 - 0.7 * age si hay edad
        const defaultMaxHr = computedAge ? Math.round(208 - 0.7 * computedAge) : 185;
        const defaultLthr = Math.round(defaultMaxHr * 0.88);
        const defaultRestingHr = 55;

        profile = {
          ...ath,
          id: ath?.id || effectiveAthleteId || "",
          name: ath?.name || profile.name || "Atleta",
          birthDate: birthDate || icuDob,
          age: computedAge, gender: resolvedSex,
          weight: resolvedWeight ? Number(resolvedWeight) : undefined,
          heightCm: resolvedHeight ? Number(resolvedHeight) : undefined,
          restingHR: restingHR || (wellness[0] as any)?.restingHR || anyAth.resting_hr || anyAth.restingHR || ath?.restingHR || defaultRestingHr,
          maxHR: maxHR || anyAth.max_hr || anyAth.maxHR || ath?.maxHR || defaultMaxHr,
          lthr: lthr || anyAth.lthr || ath?.lthr || defaultLthr,
          run_ftp: resolvedRunFtp, bike_ftp: resolvedBikeFtp,
        };
      }
      wellness = Array.isArray(wel) ? wel : [];
      pastActivities = Array.isArray(acts) ? acts : [];

      if (pastActivities.length > 0 && profile.bike_ftp) {
        try {
          const ftpCal = await FtpDetectionService.evaluateActivitiesForFtpUpdate({
            activities: pastActivities, athleteId: effectiveAthleteId, apiKey: effectiveApiKey, uid, currentBikeFtp: profile.bike_ftp,
          });
          if (ftpCal?.detected && ftpCal.newFtp > 0) {
            profile.bike_ftp = ftpCal.newFtp;
            customPrompt = `${customPrompt ? customPrompt + "\n" : ""}⚡ NOVEDAD FISIOLÓGICA RECIENTE: ${ftpCal.message}`;
          }
        } catch {}
      }
    } catch (err) {
      console.warn("Aviso al obtener datos para Head Coach Chat:", err);
    }
  }

  const physioStatus: PhysiologicalStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);
  profile.ctl = physioStatus.ctl;
  profile.atl = physioStatus.atl;
  profile.tsb = physioStatus.tsb;
  profile.rampRate = physioStatus.rampRate;

  const effectiveAvailability = (temporaryAvailability && Object.keys(temporaryAvailability).length > 0)
    ? temporaryAvailability
    : weeklyAvailability;
  const safeAvailability = resolveEffectiveAvailability(effectiveAvailability);
  const availabilityFormatted = CANONICAL_DAYS
    .map((day) => `  - ${day}: ${getDayDisciplines(safeAvailability, day).join(", ")}`)
    .join("\n");

  const hasExistingPlan = Array.isArray(currentPlan) && currentPlan.length > 0 && currentPlan.some((p) => p && ((p.tss || 0) > 0 || (p.durationMinutes || 0) > 0));
  const currentPlanSummary = hasExistingPlan
    ? currentPlan.filter(Boolean).map((p) => `  - ${p.day || p.dayOfWeek || "Día"}: [${p.discipline || "Carrera"}] ${p.workoutName || p.title || "Entrenamiento"} (${p.durationMinutes || 0} min, ~${p.tss || 0} TSS)`).join("\n")
    : "  (No hay un plan activo previo para esta semana; se debe proponer uno nuevo)";

  const weekDates = getWeekDates(safeOffset);
  const now = new Date();
  const jsDay = now.getDay();
  const todayDayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const todayDayName = dayNames[todayDayIndex];
  const todayDateStr = now.toISOString().split("T")[0];
  const isCurrentWeek = safeOffset === 0;

  const targetPlanningWeekNum = safeWeekNum;
  const planningWeekDates = weekDates;
  const planningStartDateStr = planningWeekDates[0]?.formattedDate || "Inicio";
  const planningEndDateStr = planningWeekDates[6]?.formattedDate || "Fin";

  // Mapeo unificado y optimizado de actividades ejecutadas por fecha (FinOps & High Density)
  const effectiveExecutedMap = buildCondensedExecutedMap(pastActivities, dailyExecutedActivities);

  // Retrospectiva y balance de la semana anterior a la semana de planificación
  const previousWeekSummary = computePreviousWeekRetrospective({
    planningWeekDates,
    effectiveExecutedMap,
    macrocyclePhase,
    targetPlanningWeekNum: safeWeekNum,
  });

  // TSS ejecutado real estrictamente dentro de los 7 días de la semana de planificación
  const weekExecutedTss = planningWeekDates.reduce(
    (acc, d) => acc + (effectiveExecutedMap[d.date]?.totalTss || 0),
    0
  );

  const rawPlannedTss = (Array.isArray(currentPlan) && currentPlan.length > 0)
    ? currentPlan.reduce((acc: number, p: PlanItem) => acc + (p?.tss || 0), 0)
    : (macrocyclePhase?.blueprint?.currentWeek?.targetTss || 350);
  const tssFactor = targetTssAdjustmentPct !== 0 ? (1 + targetTssAdjustmentPct / 100) : 1;
  const plannedWeekTss = Math.round(rawPlannedTss * tssFactor);
  const actualTss = Math.round(weekExecutedTss);
  const compliancePct = plannedWeekTss > 0 ? Math.round((actualTss / plannedWeekTss) * 100) : 0;

  const isDeload = safeWeekNum % 4 === 0;
  const targetMinTss = Math.round((plannedWeekTss || 350) * (isDeload ? 0.65 : 0.95));
  const targetMaxTss = Math.round((plannedWeekTss || 350) * (isDeload ? 0.8 : 1.15));

  // Construcción del reporte analítico Día a Día (Plan vs. Ejecutado)
  const auditLines = planningWeekDates.map((wDate, idx) => {
    const dName = dayNames[idx];
    const plannedSession = Array.isArray(currentPlan) ? currentPlan[idx] : null;
    const isRestPlanned = !plannedSession || plannedSession.discipline === "Descanso" || (plannedSession.tss || 0) === 0;
    const planTss = plannedSession?.tss || 0;
    const planTitle = plannedSession?.workoutName || plannedSession?.title || (isRestPlanned ? "Descanso Pasivo" : "Entrenamiento");
    const planDur = plannedSession?.durationMinutes || 0;

    const execData = effectiveExecutedMap[wDate.date];
    const execTss = execData?.totalTss || 0;
    const isPast = wDate.date < todayDateStr;
    const isToday = wDate.date === todayDateStr;

    if (execData && execData.activities.length > 0) {
      const actSummaries = execData.activities
        .map((a) => formatCompactActivitySummary(a))
        .join("; ");
      const complianceStatus = isRestPlanned
        ? "[ACTIVIDAD EN DIA DE DESCANSO]"
        : execTss >= Math.round(planTss * 0.85)
        ? "[COMPLETADO]"
        : "[PARCIAL / RECORTADO]";
      return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: ${actSummaries} -> Total Real: ${execTss} TSS ${complianceStatus}`;
    }

    if (isRestPlanned) return `- ${dName} (${wDate.formattedDate}): Plan: Descanso | Real: Descanso Pasivo (0 TSS) [DESCANSO RESPETADO]`;
    if (isPast) return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: 0 TSS [SESION NO REGISTRADA]`;
    return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | [${isToday ? "HOY EN CURSO" : "PENDIENTE"}]`;
  });

  const dailyActivitiesReport = auditLines.join("\n");
  const activitiesTssBreakdown = formatActivitiesTssBreakdown(effectiveExecutedMap);
  const recentWellnessSummary = formatRecentWellnessSummary(wellness);

  const normalizedProfile = (coachProfile || "balanced").toLowerCase();
  const coachStyleDescription =
    normalizedProfile.includes("conserv")
      ? "CONSERVADOR / PROTECCIÓN BIOLÓGICA: Prioriza recuperación y descanso activo (TSB > -10)."
      : normalizedProfile.includes("agres") || normalizedProfile.includes("alto")
      ? "ALTO RENDIMIENTO / ÉLITE: Estímulos de sobrecarga progresiva intensa y ramp rates de hasta +6 CTL/sem."
      : "EQUILIBRADO / PROGRESIÓN 3:1 (RECOMENDADO): Equilibrio óptimo entre estímulo aeróbico y asimilación biológica.";

  const formDiagnostic =
    physioStatus.tsb >= 10
      ? "Frescura sobresaliente y piernas ligeras. Momento ideal para absorber calidad sin fatiga residual."
      : physioStatus.tsb >= -5
      ? "Estado de forma equilibrado. Ritmo óptimo de progresión aeróbica y asimilación de volumen."
      : "Fatiga acumulada moderada. Priorizaremos carreras continuas suaves y trabajo cruzado para proteger articulaciones.";

  const promptContext: HeadCoachPromptContext = {
    profile,
    physioStatus,
    targetPlanningWeekNum,
    planningStartDateStr,
    planningEndDateStr,
    isInitialAudit: Boolean(isInitialAudit),
    isCurrentWeek,
    todayDayName,
    todayDateStr,
    todayDayIndex,
    macrocyclePhase,
    weeklyAvailability: safeAvailability,
    availabilityFormatted,
    currentPlanSummary,
    dailyActivitiesReport,
    activitiesTssBreakdown,
    hasExistingPlan,
    plannedWeekTss,
    actualTss,
    compliancePct,
    targetMinTss,
    targetMaxTss,
    formDiagnostic,
    coachProfile,
    customPromptDirective: customPrompt,
    recentWellnessSummary,
    previousWeekReport: previousWeekSummary.summaryText,
    isWeekKickoffAudit: Boolean(isWeekKickoffAudit),
    targetTssAdjustmentPct,
  };

  return {
    profile,
    physioStatus,
    plannedWeekTss,
    actualTss,
    compliancePct,
    targetMinTss,
    targetMaxTss,
    formDiagnostic,
    hasExistingPlan,
    currentPlanSummary,
    availabilityFormatted,
    safeAvailability,
    targetPlanningWeekNum,
    planningWeekDates,
    planningStartDateStr,
    planningEndDateStr,
    todayDayName,
    todayDateStr,
    todayDayIndex,
    isCurrentWeek,
    isDeload,
    coachStyleDescription,
    promptContext,
    effectiveExecutedMap,
    previousWeekSummary,
    targetTssAdjustmentPct,
    isWeekKickoffAudit: Boolean(isWeekKickoffAudit),
  };
}
