import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, ActivitySummary } from "@/lib/intervals/types";
import { PlanItem, WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY, getWeekDates, normalizeDisciplines } from "@/lib/gemini/engine";
import { MacrocyclePhaseInfo } from "@/lib/physiology/macrocycle";
import { HeadCoachPromptContext } from "@/lib/ai/prompts";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
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
}

export async function resolveChatContext(body: HeadCoachChatRequest): Promise<ResolvedChatContext> {
  const {
    athleteId,
    apiKey,
    weekOffset = 0,
    weekNumber = 1,
    macrocyclePhase = null,
    weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
    currentPlan = [],
    runFtp,
    bikeFtp,
    isInitialAudit = false,
    coachProfile = "balanced",
    customPrompt = "",
  } = body;

  const safeWeekNum = Number(weekNumber) || 1;
  const safeOffset = Number(weekOffset) || 0;

  const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
    await resolveIntervalsCredentials({ athleteId, apiKey });

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
      const past14 = new Date();
      past14.setDate(today.getDate() - 14);

      const oldestStr = past14.toISOString().split("T")[0];
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

        const anyAth = ath as any;
        const icuDob = anyAth.icu_date_of_birth || anyAth.dob || anyAth.date_of_birth;
        let computedAge: number | undefined = undefined;
        if (icuDob) {
          const birth = new Date(icuDob);
          if (!isNaN(birth.getTime())) {
            const now = new Date();
            let age = now.getFullYear() - birth.getFullYear();
            const monthDiff = now.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
              age--;
            }
            if (age > 0 && age < 120) computedAge = age;
          }
        }

        profile = {
          ...ath,
          id: ath.id || effectiveAthleteId || "i442091",
          name: ath.name || profile.name,
          birthDate: icuDob,
          age: computedAge,
          run_ftp: runSport?.ftp || ath.icu_running_ftp || ath.run_ftp || (runFtp ? Number(runFtp) : undefined),
          bike_ftp: rideSport?.ftp || ath.icu_ftp || ath.bike_ftp || (bikeFtp ? Number(bikeFtp) : undefined),
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

  const targetPlanningWeekNum = isInitialAudit && isCurrentWeek ? safeWeekNum + 1 : safeWeekNum;
  const planningWeekDates = isInitialAudit && isCurrentWeek ? getWeekDates(safeOffset + 1) : weekDates;
  const planningStartDateStr = planningWeekDates[0]?.formattedDate || "Inicio";
  const planningEndDateStr = planningWeekDates[6]?.formattedDate || "Fin";

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
      : "Fatiga acumulada moderada. Priorizaremos rodajes suaves y trabajo cruzado para proteger articulaciones.";

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
  };
}
