import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, ActivitySummary } from "@/lib/intervals/types";
import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getWeekDates, normalizeDisciplines } from "@/lib/gemini/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { HeadCoachPromptContext } from "@/lib/ai/prompts";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { buildCondensedExecutedMap } from "@/lib/ai/contextCondenser";
import { HeadCoachChatRequest } from "./types";

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
    currentPlan = [],
    dailyExecutedActivities = {},
    runFtp,
    bikeFtp,
    birthDate,
    gender,
    weight,
    isInitialAudit = false,
    coachProfile = "balanced",
    customPrompt = "",
  } = body;

  const safeWeekNum = Number(weekNumber) || 1;
  const safeOffset = Number(weekOffset) || 0;

  const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
    await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

  let profile: AthleteProfile = {
    id: effectiveAthleteId,
    name: "Atleta",
    ctl: 0,
    atl: 0,
    tsb: 0,
    rampRate: 0,
    run_ftp: runFtp ? Number(runFtp) : undefined,
    bike_ftp: bikeFtp ? Number(bikeFtp) : undefined,
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
        const runSport = (sports || []).find((s: any) =>
          s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
          /run/i.test(String(s.id))
        );
        const rideSport = (sports || []).find((s: any) =>
          s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
          /ride|cycling|bike/i.test(String(s.id))
        );

        const isGerman = effectiveAthleteId === "i442091" || Boolean(email && /german|gerkof/i.test(email));
        const anyAth = (ath || {}) as any;
        const icuDob = anyAth.icu_date_of_birth || anyAth.dob || anyAth.date_of_birth || birthDate || (isGerman ? "1980-03-24" : undefined);
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
        if (!computedAge && isGerman) computedAge = 46;

        const resolvedSex: "M" | "F" | "OTHER" = (anyAth.sex === "M" || anyAth.gender === "M" || gender === "M") ? "M" : ((anyAth.sex === "F" || anyAth.gender === "F" || gender === "F") ? "F" : "M");
        const resolvedWeight = anyAth.weight || (wellness[0] as any)?.weight || ath?.weight || weight || (isGerman ? 70 : 68);
        const resolvedRunFtp = runSport?.ftp || anyAth.icu_running_ftp || ath?.run_ftp || (runFtp ? Number(runFtp) : undefined) || (isGerman ? 327 : 300);
        const resolvedBikeFtp = rideSport?.ftp || anyAth.icu_ftp || ath?.bike_ftp || (bikeFtp ? Number(bikeFtp) : undefined) || (isGerman ? 240 : 230);

        profile = {
          ...ath,
          id: ath?.id || effectiveAthleteId || "",
          name: ath?.name || profile.name || (isGerman ? "Germán Morales" : "Atleta"),
          birthDate: icuDob,
          age: computedAge,
          gender: resolvedSex,
          weight: resolvedWeight ? Number(resolvedWeight) : undefined,
          restingHR: anyAth.resting_hr || anyAth.restingHR || ath?.restingHR || 48,
          maxHR: anyAth.max_hr || anyAth.maxHR || ath?.maxHR || 185,
          lthr: anyAth.lthr || ath?.lthr || 168,
          run_ftp: resolvedRunFtp,
          bike_ftp: resolvedBikeFtp,
        };
      }
      wellness = Array.isArray(wel) ? wel : [];
      pastActivities = Array.isArray(acts) ? acts : [];
    } catch (err) {
      console.warn("Aviso al obtener datos para Head Coach Chat:", err);
    }
  }

  const physioStatus: PhysiologicalStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);
  profile.ctl = physioStatus.ctl;
  profile.atl = physioStatus.atl;
  profile.tsb = physioStatus.tsb;
  profile.rampRate = physioStatus.rampRate;

  const recentActivitiesTss = pastActivities.reduce((acc, a) => acc + (a.icu_training_load || 0), 0);
  const plannedWeekTss = (Array.isArray(currentPlan) && currentPlan.length > 0)
    ? currentPlan.reduce((acc: number, p: PlanItem) => acc + (p?.tss || 0), 0)
    : (macrocyclePhase?.blueprint?.currentWeek?.targetTss || 350);
  const actualTss = Math.round(recentActivitiesTss > 0 ? recentActivitiesTss : (plannedWeekTss || 350) * 0.92);
  const compliancePct = Math.min(120, Math.round((actualTss / (plannedWeekTss || 1)) * 100));

  const safeAvailability = weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY;
  const availabilityFormatted = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    .map((day) => {
      const list = normalizeDisciplines(safeAvailability[day]);
      return `  - ${day}: ${list.join(", ")}`;
    })
    .join("\n");

  const hasExistingPlan =
    Array.isArray(currentPlan) &&
    currentPlan.length > 0 &&
    currentPlan.some((p) => p && ((p.tss || 0) > 0 || (p.durationMinutes || 0) > 0));

  const currentPlanSummary = hasExistingPlan
    ? currentPlan
        .filter(Boolean)
        .map(
          (p) =>
            `  - ${p.day || p.dayOfWeek || "Día"}: [${p.discipline || "Carrera"}] ${p.workoutName || p.title || "Entrenamiento"} (${p.durationMinutes || 0} min, ~${p.tss || 0} TSS)`
        )
        .join("\n")
    : "  (No hay un plan activo previo para esta semana; se debe proponer uno nuevo)";

  const isDeload = safeWeekNum % 4 === 0;
  const targetMinTss = isDeload ? Math.round(actualTss * 0.7) : Math.round(actualTss * 1.08);
  const targetMaxTss = isDeload ? Math.round(actualTss * 0.8) : Math.round(actualTss * 1.16);

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
        .map((a) => `"${a.name || a.type}" (${a.movingTimeMin || 0}m, ${a.tss || 0} TSS${a.watts ? `, ${a.watts}W` : ""}${a.heartrate ? `, ${a.heartrate} bpm` : ""}${a.distanceKm ? `, ${a.distanceKm} km` : ""})`)
        .join("; ");
      const complianceStatus = isRestPlanned
        ? "⚠️ ACTIVIDAD EN DÍA DE DESCANSO"
        : execTss >= Math.round(planTss * 0.85)
        ? "✅ COMPLETADO"
        : "⚠️ PARCIAL / RECORTADO";
      return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: ${actSummaries} -> Total Real: ${execTss} TSS [${complianceStatus}]`;
    }

    if (isRestPlanned) {
      return `- ${dName} (${wDate.formattedDate}): Plan: Descanso | Real: Descanso Pasivo (0 TSS) [✅ DESCANSO RESPETADO]`;
    }

    if (isPast) {
      return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: ❌ 0 TSS [SESIÓN SALTADA / NO REGISTRADA]`;
    }

    return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | [⏳ ${isToday ? "HOY EN CURSO" : "PENDIENTE"}]`;
  });

  const dailyActivitiesReport = auditLines.join("\n");
  const activitiesTssBreakdown = Object.entries(effectiveExecutedMap)
    .flatMap(([dKey, val]) => val.activities.map((a: any) => `  - [${dKey}] "${a.name || a.type}" (${a.type}): ${a.tss || 0} TSS en ${a.movingTimeMin || 0}m${a.watts ? ` @ ${a.watts}W` : ""}${a.heartrate ? ` (FC ${a.heartrate} bpm)` : ""}`))
    .join("\n") || "  (No hay actividades registradas en el periodo)";

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
  };
}
