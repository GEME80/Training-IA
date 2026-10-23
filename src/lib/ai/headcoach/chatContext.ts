import { IntervalsClient } from "@/lib/intervals/client";
import { isRunSport, isRideSport } from "@/lib/intervals/sportMatchers";
import { extractGarminWellnessTelemetry } from "@/lib/intervals/wellnessHelpers";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, ActivitySummary } from "@/lib/intervals/types";
import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getWeekDates, normalizeDisciplines, CANONICAL_DAYS, getDayDisciplines, resolveEffectiveAvailability, getExplicitLongRunDay, getExplicitLongRideDay } from "@/lib/gemini/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { HeadCoachPromptContext } from "@/lib/ai/prompts";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { buildCondensedExecutedMap, formatCompactActivitySummary, formatActivitiesTssBreakdown, formatRecentWellnessSummary } from "@/lib/ai/contextCondenser";
import { BreakthroughDetectionService } from "@/lib/services/breakthroughDetectionService";
import { computePreviousWeekRetrospective } from "./weekRetrospective";
import { HeadCoachChatRequest, PreviousWeekSummary, ResolvedChatContext } from "./types";
export type { ResolvedChatContext };

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
    dailyExecutedActivities = {}, runFtp, bikeFtp, birthDate, gender, weight, height,
    restingHR, maxHR, lthr, isInitialAudit = false, coachProfile = "balanced", customPrompt: initialCustomPrompt = "",
  } = body;

  let customPrompt = initialCustomPrompt;
  const safeWeekNum = Number(weekNumber) || 1, safeOffset = Number(weekOffset) || 0;
  const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
    await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

  let userDocProfile: any = null;
  if (uid && (!body.runningTrainingMode || body.hasRunningPowerMeter === undefined || !body.runThresholdPaceStr)) {
    try {
      const { getUserProfileDecrypted } = await import("@/lib/db/userProfile");
      userDocProfile = (await getUserProfileDecrypted(uid))?.profile || null;
    } catch {}
  }

  const { resolveRunningMode, parsePaceToSeconds, formatPace } = await import("@/lib/physiology/runningWorkoutAdapter");
  const effectiveRunningMode = resolveRunningMode({
    runningTrainingMode: body.runningTrainingMode || userDocProfile?.runningTrainingMode,
    hasRunningPowerMeter: body.hasRunningPowerMeter ?? userDocProfile?.hasRunningPowerMeter,
    runFtp: runFtp ?? userDocProfile?.runFtp,
  }, macrocyclePhase?.blueprint?.runningTrainingMode);

  const isPaceMode = effectiveRunningMode === "PACE";
  const resolvedPaceSec = body.runThresholdPaceSecPerKm || userDocProfile?.runThresholdPaceSecPerKm || (body.runThresholdPaceStr ? parsePaceToSeconds(body.runThresholdPaceStr) : (userDocProfile?.runThresholdPaceStr ? parsePaceToSeconds(userDocProfile.runThresholdPaceStr) : 258));
  const resolvedPaceStr = body.runThresholdPaceStr || userDocProfile?.runThresholdPaceStr || formatPace(resolvedPaceSec);

  let profile: AthleteProfile = {
    id: effectiveAthleteId, name: body.athleteName || "Atleta", ctl: 0, atl: 0, tsb: 0, rampRate: 0,
    run_ftp: isPaceMode ? undefined : (runFtp ? Number(runFtp) : undefined), bike_ftp: bikeFtp ? Number(bikeFtp) : undefined,
    weight: weight ? Number(weight) : undefined, heightCm: height ? Number(height) : undefined,
    birthDate, gender: (gender === "M" || gender === "F" || gender === "OTHER") ? gender : undefined,
    restingHR: restingHR ? Number(restingHR) : undefined, maxHR: maxHR ? Number(maxHR) : undefined, lthr: lthr ? Number(lthr) : undefined,
    runningTrainingMode: isPaceMode ? "PACE" : "POWER",
    hasRunningPowerMeter: !isPaceMode,
    runThresholdPaceStr: resolvedPaceStr,
    runThresholdPaceSecPerKm: resolvedPaceSec,
  };
  let wellness: AthleteWellness[] = [];
  let pastActivities: ActivitySummary[] = [];

  if (effectiveAthleteId && effectiveApiKey) {
    try {
      const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
      const today = new Date();
      const oldestStr = new Date(today.getTime() - 60 * 86400000).toISOString().split("T")[0];
      const newestStr = today.toISOString().split("T")[0];

      const [ath, wel, acts, sports] = await Promise.all([
        client.getAthlete().catch(() => null),
        client.getWellness(oldestStr, newestStr).catch(() => []),
        client.getActivities(oldestStr, newestStr).catch(() => []),
        client.getSportSettings().catch(() => []),
      ]);

      if (ath) {
        const runSport = (sports || []).find(isRunSport);
        const rideSport = (sports || []).find(isRideSport);
        const anyAth = (ath || {}) as any;
        const icuDob = anyAth.icu_date_of_birth || anyAth.dob || anyAth.date_of_birth || birthDate;
        let computedAge: number | undefined = undefined;
        if (icuDob) {
          const birth = new Date(icuDob);
          if (!isNaN(birth.getTime())) {
            const age = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
            if (age > 0 && age < 120) computedAge = age;
          }
        }
        if (!computedAge && (body as any).age) computedAge = Number((body as any).age);

        const resolvedSex: "M" | "F" | "OTHER" = (gender === "M" || anyAth.sex === "M" || anyAth.gender === "M") ? "M" : ((gender === "F" || anyAth.sex === "F" || anyAth.gender === "F") ? "F" : "M");
        const rawHeight = (anyAth.icu_height as number) || (anyAth.height as number) || undefined;
        const resolvedHeight = (body as any).height || (rawHeight ? (rawHeight < 3 ? Math.round(rawHeight * 100) : Math.round(rawHeight)) : undefined);
        const garminWel = extractGarminWellnessTelemetry(Array.isArray(wel) ? wel : []);
        const resolvedWeight = weight || garminWel.weightKg || anyAth.weight || ath?.weight;
        const resolvedRunFtp = isPaceMode ? 0 : ((runFtp ? Number(runFtp) : undefined) || runSport?.ftp || anyAth.icu_running_ftp || ath?.run_ftp || 0);
        const resolvedBikeFtp = (bikeFtp ? Number(bikeFtp) : undefined) || rideSport?.ftp || anyAth.icu_ftp || ath?.bike_ftp || 0;
        const defaultMaxHr = computedAge ? Math.round(208 - 0.7 * computedAge) : 185;
        const defaultLthr = Math.round(defaultMaxHr * 0.88);
        const defaultRestingHr = 55;
        const rawM = maxHR || runSport?.max_hr || rideSport?.max_hr || anyAth.max_hr || anyAth.maxHR || ath?.maxHR || defaultMaxHr;
        const rawL = lthr || runSport?.lthr || rideSport?.lthr || anyAth.lthr || ath?.lthr || defaultLthr;
        const safeMax = rawL && rawM && Number(rawL) > Number(rawM) ? rawL : rawM;
        const safeLthr = rawL && rawM && Number(rawL) > Number(rawM) ? rawM : rawL;

        profile = {
          ...ath, id: ath?.id || effectiveAthleteId || "", name: body.athleteName || ath?.name || profile.name || "Atleta",
          birthDate: birthDate || icuDob, age: computedAge, gender: resolvedSex,
          weight: resolvedWeight ? Number(resolvedWeight) : undefined, heightCm: resolvedHeight ? Number(resolvedHeight) : undefined,
          restingHR: restingHR || garminWel.restingHR || runSport?.resting_hr || anyAth.resting_hr || anyAth.restingHR || ath?.restingHR || defaultRestingHr,
          maxHR: safeMax, lthr: safeLthr, run_ftp: resolvedRunFtp, bike_ftp: resolvedBikeFtp,
          runningTrainingMode: isPaceMode ? "PACE" : "POWER",
          hasRunningPowerMeter: !isPaceMode,
          runThresholdPaceStr: resolvedPaceStr,
          runThresholdPaceSecPerKm: resolvedPaceSec,
        };
      }
      wellness = Array.isArray(wel) ? wel : [];
      pastActivities = Array.isArray(acts) ? acts : [];

      if (pastActivities.length > 0) {
        try {
          const bResults = await BreakthroughDetectionService.evaluateAll({
            activities: pastActivities, athleteId: effectiveAthleteId, apiKey: effectiveApiKey, uid,
            currentBikeFtp: profile.bike_ftp, currentRunFtp: profile.run_ftp,
            currentPaceSec: (profile as any).runThresholdPaceSecPerKm,
            currentPaceStr: (profile as any).runThresholdPaceStr,
            lthr: profile.lthr, maxHR: profile.maxHR,
          });
          if (bResults.recentFtpCalibration?.detected) { profile.bike_ftp = bResults.recentFtpCalibration.newFtp; customPrompt = `${customPrompt ? customPrompt + "\n" : ""}⚡ NOVEDAD CICLISMO (FTP): ${bResults.recentFtpCalibration.message}`; }
          if (bResults.recentPaceCalibration?.detected) customPrompt = `${customPrompt ? customPrompt + "\n" : ""}🏃 NOVEDAD RITMO CARRERA: ${bResults.recentPaceCalibration.message}`;
          if (!isPaceMode && bResults.recentRunPowerCalibration?.detected) { profile.run_ftp = bResults.recentRunPowerCalibration.newWatts; customPrompt = `${customPrompt ? customPrompt + "\n" : ""}⚡ NOVEDAD POTENCIA CARRERA: ${bResults.recentRunPowerCalibration.message}`; }
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

  const effectiveAvailability = (temporaryAvailability && Object.keys(temporaryAvailability).length > 0) ? temporaryAvailability : weeklyAvailability;
  const safeAvailability = resolveEffectiveAvailability(effectiveAvailability);
  const expRun = getExplicitLongRunDay(safeAvailability), expRide = getExplicitLongRideDay(safeAvailability);
  const availabilityFormatted = CANONICAL_DAYS.map((day) => `  - ${day}: ${getDayDisciplines(safeAvailability, day).join(", ")}${day === expRun ? " (★ FONDO CARRERA)" : ""}${day === expRide ? " (★ FONDO CICLISMO)" : ""}`).join("\n");

  const hasExistingPlan = Array.isArray(currentPlan) && currentPlan.length > 0 && currentPlan.some((p) => p && ((p.tss || 0) > 0 || (p.durationMinutes || 0) > 0));
  const currentPlanSummary = hasExistingPlan
    ? currentPlan.filter(Boolean).map((p) => `  - ${p.day || p.dayOfWeek || "Día"}: [${p.discipline || "Carrera"}] ${p.workoutName || p.title || "Entrenamiento"} (${p.durationMinutes || 0} min, ~${p.tss || 0} TSS)`).join("\n")
    : "  (No hay un plan activo previo para esta semana; se debe proponer uno nuevo)";

  const clientTime = body.clientTime, timeZone = clientTime?.timeZone || "America/Bogota", now = new Date();
  const defaultIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const todayDayName = clientTime?.localDayName || CANONICAL_DAYS[defaultIdx];
  const todayDateStr = clientTime?.localDateStr || now.toISOString().split("T")[0];
  const todayTimeStr = clientTime?.localTimeStr || "";
  const foundIdx = CANONICAL_DAYS.findIndex((d) => d.toLowerCase() === todayDayName.toLowerCase());
  const todayDayIndex = foundIdx >= 0 ? foundIdx : defaultIdx;

  const baseLocalRef = clientTime?.localDateStr ? new Date(`${clientTime.localDateStr}T12:00:00`) : now;
  const weekDates = getWeekDates(safeOffset, baseLocalRef);
  const isCurrentWeek = safeOffset === 0;

  // Proyección de CTL del macrociclo para esta semana
  const blueprint = macrocyclePhase?.blueprint, totalWeeks = blueprint?.totalWeeks || 16, targetPeakCtl = blueprint?.targetPeakCtl || 70;
  const startCtl = blueprint?.athleteCtlAtCreation || (profile.ctl ? Math.max(20, profile.ctl - 4) : 38);
  const rampRateWeekly = (targetPeakCtl - startCtl) / Math.max(1, totalWeeks - 2);
  const plannedCtlForWeek = Math.round((startCtl + Math.max(0, safeWeekNum - 1) * rampRateWeekly) * 10) / 10;
  const ctlDelta = Math.round((physioStatus.ctl - plannedCtlForWeek) * 10) / 10;
  const ctlDeltaStr = ctlDelta > 0 ? `+${ctlDelta.toFixed(1)}` : `${ctlDelta.toFixed(1)}`;
  const ctlDeltaVerdict = Math.abs(ctlDelta) <= 0.6 ? "en el blanco exacto del plan" : ctlDelta > 0.6 ? "por encima de la curva (+progreso acelerado seguro)" : "ligeramente por debajo del modelo (-recuperable sin doblar sesiones)";

  const targetPlanningWeekNum = safeWeekNum, planningWeekDates = weekDates;
  const planningStartDateStr = planningWeekDates[0]?.formattedDate || "Inicio", planningEndDateStr = planningWeekDates[6]?.formattedDate || "Fin";

  // Mapeo unificado y optimizado de actividades ejecutadas por fecha (FinOps & High Density)
  const effectiveExecutedMap = buildCondensedExecutedMap(pastActivities, dailyExecutedActivities);
  const previousWeekSummary = computePreviousWeekRetrospective({ planningWeekDates, effectiveExecutedMap, macrocyclePhase, targetPlanningWeekNum: safeWeekNum });
  const weekExecutedTss = planningWeekDates.reduce((acc, d) => acc + (effectiveExecutedMap[d.date]?.totalTss || 0), 0);
  const planSumTss = (Array.isArray(currentPlan) && currentPlan.length > 0) ? currentPlan.reduce((acc: number, p: PlanItem) => acc + (p?.tss || 0), 0) : 0;
  const bpTarget = macrocyclePhase?.blueprint?.weeks?.find((w: any) => w.weekNumber === safeWeekNum)?.targetTss || macrocyclePhase?.blueprint?.currentWeek?.targetTss;
  const rawPlannedTss = planSumTss > 0 ? planSumTss : (bpTarget || 366);
  const tssFactor = targetTssAdjustmentPct !== 0 ? (1 + targetTssAdjustmentPct / 100) : 1;
  const plannedWeekTss = Math.round(rawPlannedTss * tssFactor), actualTss = Math.round(weekExecutedTss);
  const compliancePct = plannedWeekTss > 0 ? Math.round((actualTss / plannedWeekTss) * 100) : 0;

  const isDeload = safeWeekNum % 4 === 0;
  const targetMinTss = Math.round((plannedWeekTss || 350) * (isDeload ? 0.65 : 0.95)), targetMaxTss = Math.round((plannedWeekTss || 350) * (isDeload ? 0.8 : 1.15));

  // TSS planificado acumulado de Lunes a hoy (corte acumulado a la fecha)
  const plannedTssToDate = planningWeekDates.slice(0, todayDayIndex + 1).reduce((acc, wDate, dIdx) => {
    const dName = CANONICAL_DAYS[dIdx];
    const items = Array.isArray(currentPlan)
      ? currentPlan.filter((p) => (p?.date && p.date === wDate.date) || (p?.day && p.day.toLowerCase() === dName.toLowerCase()))
      : [];
    return acc + items.reduce((s, p) => s + (p?.tss || 0), 0);
  }, 0);
  const toDateTssDelta = actualTss - plannedTssToDate;

  // Construcción del reporte analítico Día a Día (Plan vs. Ejecutado) soportando dobles sesiones
  const auditLines = planningWeekDates.map((wDate, idx) => {
    const dName = CANONICAL_DAYS[idx];
    const dayPlanItems = Array.isArray(currentPlan)
      ? currentPlan.filter((p) => (p?.date && p.date === wDate.date) || (p?.day && p.day.toLowerCase() === dName.toLowerCase()))
      : [];
    const isRestPlanned = dayPlanItems.length === 0 || dayPlanItems.every((p) => !p || p.discipline === "Descanso" || (p.tss || 0) === 0);
    const planTss = dayPlanItems.reduce((acc, p) => acc + (p?.tss || 0), 0);
    const planDur = dayPlanItems.reduce((acc, p) => acc + (p?.durationMinutes || 0), 0);
    const planTitle = dayPlanItems.length > 0
      ? dayPlanItems.map((p) => `[${p.discipline || "Carrera"}] ${p.workoutName || p.title || "Entrenamiento"} (${p.tss || 0} TSS)`).join(" + ")
      : "Descanso Pasivo";

    const execData = effectiveExecutedMap[wDate.date];
    const execTss = execData?.totalTss || 0;
    const isPast = wDate.date < todayDateStr, isToday = wDate.date === todayDateStr;

    if (execData && execData.activities.length > 0) {
      const actSummaries = execData.activities.map((a) => formatCompactActivitySummary(a)).join("; ");
      const complianceStatus = isRestPlanned
        ? "[ACTIVIDAD EN DIA DE DESCANSO]"
        : execTss >= Math.round(planTss * 0.85) ? "[COMPLETADO]" : "[PARCIAL / RECORTADO]";
      return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: ${actSummaries} -> Total Real: ${execTss} TSS ${complianceStatus}`;
    }

    if (isRestPlanned) return `- ${dName} (${wDate.formattedDate}): Plan: Descanso | Real: Descanso Pasivo (0 TSS) [DESCANSO RESPETADO]`;
    if (isPast) return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | Real: 0 TSS [SESION NO REGISTRADA]`;
    return `- ${dName} (${wDate.formattedDate}): Plan: ${planTitle} (${planDur}m, ${planTss} TSS) | [${isToday ? "HOY EN CURSO" : "PENDIENTE"}]`;
  });

  const dailyActivitiesReport = auditLines.join("\n");
  const activitiesTssBreakdown = formatActivitiesTssBreakdown(effectiveExecutedMap);
  const recentWellnessSummary = formatRecentWellnessSummary(wellness);

  // Detección del estado temporal fisiológico de hoy y de la semana
  const todayExecData = effectiveExecutedMap[todayDateStr];
  const hasTrainedToday = isCurrentWeek && Boolean(todayExecData && todayExecData.activities && todayExecData.activities.length > 0);
  const todayExecutedTss = hasTrainedToday ? (todayExecData?.totalTss || 0) : 0;
  const todayDayItems = Array.isArray(currentPlan)
    ? currentPlan.filter((p) => (p?.date && p.date === todayDateStr) || (p?.day && p.day.toLowerCase() === todayDayName.toLowerCase()))
    : [];
  const isTodayPlannedRest = todayDayItems.length === 0 || todayDayItems.every((p) => !p || p.discipline === "Descanso" || (p.tss || 0) === 0);
  const todaySessionStatus: "COMPLETADA_HOY" | "PENDIENTE_HOY" | "DESCANSO_HOY" =
    hasTrainedToday ? "COMPLETADA_HOY" : isTodayPlannedRest ? "DESCANSO_HOY" : "PENDIENTE_HOY";

  const remainingPendingDays = planningWeekDates.filter((wDate, idx) => {
    if (!isCurrentWeek) return false;
    if (idx < todayDayIndex) return false;
    if (idx === todayDayIndex) return !hasTrainedToday && !isTodayPlannedRest;
    const dName = CANONICAL_DAYS[idx];
    const items = Array.isArray(currentPlan)
      ? currentPlan.filter((p) => (p?.date && p.date === wDate.date) || (p?.day && p.day.toLowerCase() === dName.toLowerCase()))
      : [];
    const isRest = items.length === 0 || items.every((p) => !p || p.discipline === "Descanso" || (p.tss || 0) === 0);
    const hasExec = Boolean(effectiveExecutedMap[wDate.date]?.activities?.length);
    return !isRest && !hasExec;
  });
  const remainingPendingDaysCount = remainingPendingDays.length;
  const isWeekCompleted = isCurrentWeek && (
    (todayDayIndex === 6 && (hasTrainedToday || isTodayPlannedRest)) ||
    remainingPendingDaysCount === 0
  );

  const normalizedProfile = (coachProfile || "balanced").toLowerCase();
  const coachStyleDescription = normalizedProfile.includes("conserv")
    ? "CONSERVADOR / PROTECCIÓN BIOLÓGICA: Prioriza recuperación y descanso activo (TSB > -10)."
    : normalizedProfile.includes("agres") || normalizedProfile.includes("alto")
    ? "ALTO RENDIMIENTO / ÉLITE: Estímulos de sobrecarga intensa (hasta +6 CTL/sem)."
    : "EQUILIBRADO / PROGRESIÓN 3:1 (RECOMENDADO): Equilibrio entre estímulo aeróbico y asimilación biológica.";

  const formDiagnostic = physioStatus.tsb >= 10
    ? "Frescura sobresaliente y piernas ligeras. Momento ideal para absorber calidad sin fatiga residual."
    : physioStatus.tsb >= -5
    ? "Estado de forma equilibrado. Ritmo óptimo de progresión aeróbica y asimilación de volumen."
    : "Fatiga acumulada moderada. Priorizaremos carreras continuas suaves y trabajo regenerativo.";

  // Disciplinas reales del atleta
  const allDiscs = Object.values(safeAvailability || {}).flatMap((d: any) => (Array.isArray(d) ? d : [d]));
  const planDiscs = Array.isArray(currentPlan) ? currentPlan.map((p: any) => (p?.discipline || p?.workoutName || "").toLowerCase()) : [];
  const hasCycling = allDiscs.some((d: string) => /ciclismo|bike|ride|bici/i.test(d)) || planDiscs.some((d: string) => /ciclismo|bike|ride|bici|rodillo/i.test(d));
  const hasRunning = allDiscs.some((d: string) => /carrera|run/i.test(d)) || planDiscs.some((d: string) => /carrera|run|trote/i.test(d));
  const hasSwimming = allDiscs.some((d: string) => /nataci[oó]n|swim/i.test(d)) || planDiscs.some((d: string) => /nataci|swim/i.test(d));
  const hasStrength = allDiscs.some((d: string) => /fuerza|strength|gym/i.test(d)) || planDiscs.some((d: string) => /fuerza|gym/i.test(d));
  const sportsList: string[] = [];
  if (hasRunning) sportsList.push("Carrera");
  if (hasCycling) sportsList.push("Ciclismo");
  if (hasSwimming) sportsList.push("Natación");
  if (hasStrength) sportsList.push("Fuerza");
  const disciplinesSummary = sportsList.length > 0 ? sportsList.join(", ") : "Resistencia aeróbica y fuerza";

  // Objetivo del macrociclo: Competitivo vs Salud/Mantenimiento/Base
  const bp = macrocyclePhase?.blueprint;
  const race = macrocyclePhase?.primaryRace || bp?.primaryRace;
  const distType = (bp?.distanceType || race?.distance || "").toLowerCase();
  const rawTitle = (bp?.cycleTitle || macrocyclePhase?.phaseLabel || "").trim();
  const isNonComp = !race?.date || distType === "maintenance" || distType === "base_building" || distType === "general_build" || distType === "post_race_recovery" || distType === "injury_rehab" || bp?.mode === "GENERAL_MAINTENANCE" || bp?.mode === "PRE_SEASON_MAINTENANCE" || /manten|salud|longev|base\s*aer|gpp|sin\s*carrera/i.test(`${rawTitle} ${macrocyclePhase?.guideline || ""} ${macrocyclePhase?.suggestedFocus || ""}`);
  const isCompetitiveRace = !isNonComp;
  const cycleGoalTitle = isNonComp
    ? (/manten|salud|longev/i.test(rawTitle) ? "Mantenimiento y Salud Aeróbica" : /base|gpp|construcci/i.test(rawTitle) ? "Construcción de Base y Condición Física" : rawTitle || "Mantenimiento y Condición Física")
    : (race?.name ? `${race.name}${race.distance ? ` (${race.distance})` : ""}` : rawTitle || "Competición Objetivo");

  const promptContext: HeadCoachPromptContext = {
    profile, physioStatus, targetPlanningWeekNum, planningStartDateStr, planningEndDateStr,
    isInitialAudit: Boolean(isInitialAudit), isCurrentWeek, todayDayName, todayDateStr, todayDayIndex,
    hasTrainedToday, todaySessionStatus, isWeekCompleted, macrocyclePhase, weeklyAvailability: safeAvailability,
    availabilityFormatted, currentPlanSummary, dailyActivitiesReport, activitiesTssBreakdown, hasExistingPlan,
    plannedWeekTss, actualTss, compliancePct, targetMinTss, targetMaxTss, formDiagnostic, coachProfile,
    customPromptDirective: customPrompt, recentWellnessSummary, previousWeekReport: previousWeekSummary.summaryText,
    isWeekKickoffAudit: Boolean(isWeekKickoffAudit), targetTssAdjustmentPct,
    todayTimeStr, timeZone, plannedCtlForWeek, ctlDelta, targetPeakCtl, ctlDeltaStr, ctlDeltaVerdict,
    plannedTssToDate, toDateTssDelta,
    hasCycling, hasRunning, hasSwimming, hasStrength, isCompetitiveRace, cycleGoalTitle, disciplinesSummary,
  };

  return {
    profile, physioStatus, plannedWeekTss, actualTss, compliancePct, targetMinTss, targetMaxTss, formDiagnostic,
    hasExistingPlan, currentPlanSummary, availabilityFormatted, safeAvailability, targetPlanningWeekNum,
    planningWeekDates, planningStartDateStr, planningEndDateStr, todayDayName, todayDateStr, todayDayIndex,
    isCurrentWeek, hasTrainedToday, todayExecutedTss, todaySessionStatus, isWeekCompleted, remainingPendingDaysCount,
    isDeload, coachStyleDescription, promptContext, effectiveExecutedMap, previousWeekSummary, targetTssAdjustmentPct,
    isWeekKickoffAudit: Boolean(isWeekKickoffAudit), todayTimeStr, timeZone, plannedCtlForWeek, ctlDelta, ctlDeltaStr, ctlDeltaVerdict, targetPeakCtl,
    plannedTssToDate, toDateTssDelta,
    hasCycling, hasRunning, hasSwimming, hasStrength, isCompetitiveRace, cycleGoalTitle, disciplinesSummary,
  };
}
