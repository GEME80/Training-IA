import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { GeminiPhysiologicalAgent } from "@/lib/gemini/engine";
import { calculateMacrocyclePhase, TargetRace } from "@/lib/physiology/macrocycle";
import { AthleteProfile, AthleteWellness, CalendarEvent } from "@/lib/intervals/types";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { getLocalTodayStr, formatLocalDateToYMD, getMondayOfWeekStr } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let customRunFtp: number | undefined;
  let customBikeFtp: number | undefined;
  let effectiveAthleteId = "";

  try {
    const body = await req.json().catch(() => ({}));
    const {
      athleteId,
      apiKey,
      uid,
      email,
      customRunFtp: inputRunFtp,
      customBikeFtp: inputBikeFtp,
      weekOffset = 0,
      geminiApiKey,
      selectedModel,
      customPrompt,
      targetRaces = [],
      weeklyAvailability,
      skipAI = true,
    } = body || {};

    customRunFtp = inputRunFtp;
    customBikeFtp = inputBikeFtp;

    const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    effectiveAthleteId = credentials.athleteId;
    const effectiveApiKey = credentials.apiKey;

    let profile: AthleteProfile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
    let wellness: AthleteWellness[] = [];
    let events: CalendarEvent[] = [];
    let isLive = false;
    let executedWeeklyTss = 0;
    let dailyExecutedActivities: Record<string, any> = {};

    // Si se proporcionan credenciales activas, consultamos la API de Intervals en vivo
    if (effectiveAthleteId && effectiveApiKey) {
      try {
        const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
        
        const today = new Date();
        const past60Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
        const past30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        const next7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

        const oldestWellnessStr = formatLocalDateToYMD(past60Days);
        const oldestActivitiesStr = formatLocalDateToYMD(past30Days);
        const newestStr = getLocalTodayStr();
        const futureStr = formatLocalDateToYMD(next7Days);
        const thisMondayStr = getMondayOfWeekStr(today);
        const [athleteData, wellnessData, calendarEvents, sportSettingsData, activitiesData] = await Promise.all([
          client.getAthlete().catch((err) => {
            console.warn("Aviso al consultar atleta en Intervals.icu:", err instanceof Error ? err.message : err);
            return null;
          }),
          client.getWellness(oldestWellnessStr, newestStr).catch((err) => {
            console.warn("Aviso al consultar wellness:", err);
            return [];
          }),
          client.getEvents(newestStr, futureStr).catch((err) => {
            console.warn("Aviso al consultar eventos:", err);
            return [];
          }),
          client.getSportSettings().catch((err) => {
            console.warn("Aviso al consultar sportSettings:", err);
            return [];
          }),
          client.getActivities(oldestActivitiesStr, newestStr).catch((err) => {
            console.warn("Aviso al consultar actividades:", err);
            return [];
          }),
        ]);

        dailyExecutedActivities = {};

        (activitiesData || []).forEach((act: any) => {
          if (!act.start_date_local) return;
          const dateKey = act.start_date_local.split("T")[0];
          const tss = Math.round(act.icu_training_load ?? act.training_load ?? act.tss ?? 0);
          const movingTimeMin = Math.round((act.moving_time ?? act.elapsed_time ?? 0) / 60);
          const watts = act.icu_weighted_avg_watts ?? act.icu_average_watts ?? act.weighted_average_watts ?? act.average_watts ?? act.device_watts;
          const heartrate = act.average_heartrate;
          const distanceKm = act.distance ? Number((act.distance / 1000).toFixed(1)) : undefined;

          if (!dailyExecutedActivities[dateKey]) {
            dailyExecutedActivities[dateKey] = {
              date: dateKey,
              totalTss: 0,
              activities: [],
            };
          }
          dailyExecutedActivities[dateKey].totalTss += tss;
          dailyExecutedActivities[dateKey].activities.push({
            id: act.id,
            name: act.name,
            type: act.type,
            tss,
            movingTimeMin,
            watts: typeof watts === "number" ? Math.round(watts) : undefined,
            heartrate: typeof heartrate === "number" ? Math.round(heartrate) : undefined,
            distanceKm,
          });
        });

        const weeklyExecutedTss = (activitiesData || [])
          .filter((act: any) => act.start_date_local && act.start_date_local.split("T")[0] >= thisMondayStr)
          .reduce((sum: number, act: any) => {
            const load = act.icu_training_load ?? act.training_load ?? act.tss ?? 0;
            return sum + (typeof load === "number" ? load : 0);
          }, 0);
        executedWeeklyTss = Math.round(weeklyExecutedTss);

        if (athleteData) {
          isLive = true;
          const anyAthlete = athleteData as any;
          const icuCtl = anyAthlete.icu_ctl ?? anyAthlete.ctl;
          const icuAtl = anyAthlete.icu_atl ?? anyAthlete.atl;
          const icuRestingHr = anyAthlete.icu_resting_hr ?? anyAthlete.restingHR;
          const icuFtp = anyAthlete.icu_ftp ?? anyAthlete.bike_ftp;
          const icuRunFtp = anyAthlete.icu_running_ftp ?? anyAthlete.run_ftp;
          const icuDob = anyAthlete.icu_date_of_birth || anyAthlete.dob || anyAthlete.date_of_birth;
          const rawSex = anyAthlete.sex || anyAthlete.gender || anyAthlete.icu_gender;
          const normSex = typeof rawSex === "string" ? rawSex.trim().toUpperCase() : "";
          const resolvedGender: "M" | "F" | "OTHER" | undefined = /^(M|MALE|HOMBRE)$/.test(normSex) ? "M" : /^(F|FEMALE|MUJER)$/.test(normSex) ? "F" : /^(OTHER|OTRO)$/.test(normSex) ? "OTHER" : undefined;

          const sports = (sportSettingsData && sportSettingsData.length > 0)
            ? sportSettingsData
            : (anyAthlete.sportSettings || []);
          const runSport = sports.find((s: any) =>
            s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
            /run/i.test(String(s.id)) ||
            s.id === 1844382
          );
          const rideSport = sports.find((s: any) =>
            s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
            /ride|cycling|bike/i.test(String(s.id)) ||
            s.id === 1844381
          );

          // Prioridad absoluta a los valores en vivo de Intervals.icu
          const resolvedRunFtp = runSport?.mmp_model?.criticalPower || runSport?.ftp || icuRunFtp || customRunFtp || anyAthlete.run_ftp || 0;
          const resolvedBikeFtp = rideSport?.ftp || icuFtp || customBikeFtp || anyAthlete.bike_ftp || 0;

          let computedAge: number | undefined = undefined;
          if (icuDob) {
            const birth = new Date(icuDob);
            if (!isNaN(birth.getTime())) {
              const today = new Date();
              let age = today.getFullYear() - birth.getFullYear();
              const monthDiff = today.getMonth() - birth.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
              }
              if (age > 0 && age < 120) computedAge = age;
            }
          }

          const resolvedLthr = runSport?.lthr || rideSport?.lthr || anyAthlete.lthr;
          const resolvedMaxHr = runSport?.max_hr || rideSport?.max_hr || anyAthlete.maxHR || (computedAge ? Math.round(208 - 0.7 * computedAge) : undefined);
          const resolvedWeight = anyAthlete.icu_weight || anyAthlete.weight;
          const rawHeight = anyAthlete.icu_height || anyAthlete.height;
          const resolvedHeight = rawHeight ? (rawHeight < 3 ? Math.round(rawHeight * 100) : Math.round(rawHeight)) : undefined;

          console.log("✓ [API evaluate] Telemetría y umbrales resueltos dinámicamente desde Intervals.icu:", {
            atleta: athleteData.name,
            runFtp: resolvedRunFtp,
            bikeFtp: resolvedBikeFtp,
            lthr: resolvedLthr,
            ctl: icuCtl,
            atl: icuAtl,
            edad: computedAge,
          });

          profile = {
            ...athleteData,
            id: athleteData.id || effectiveAthleteId,
            name: athleteData.name || "Atleta",
            birthDate: icuDob,
            gender: resolvedGender,
            age: computedAge,
            ctl: typeof icuCtl === "number" ? icuCtl : undefined,
            atl: typeof icuAtl === "number" ? icuAtl : undefined,
            restingHR: typeof icuRestingHr === "number" ? icuRestingHr : undefined,
            run_ftp: resolvedRunFtp,
            bike_ftp: resolvedBikeFtp,
            lthr: resolvedLthr,
            maxHR: resolvedMaxHr,
            weight: resolvedWeight,
            heightCm: resolvedHeight,
          };
        } else if (
          (sportSettingsData && sportSettingsData.length > 0) ||
          (activitiesData && activitiesData.length > 0) ||
          (wellnessData && wellnessData.length > 0)
        ) {
          isLive = true;
          const sports = sportSettingsData || [];
          const runSport = sports.find((s: any) =>
            s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
            /run/i.test(String(s.id)) ||
            s.id === 1844382
          );
          const rideSport = sports.find((s: any) =>
            s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
            /ride|cycling|bike/i.test(String(s.id)) ||
            s.id === 1844381
          );
          const resolvedRunFtp = runSport?.mmp_model?.criticalPower || runSport?.ftp || customRunFtp || 0;
          const resolvedBikeFtp = rideSport?.ftp || customBikeFtp || 0;
          const resolvedLthr = runSport?.lthr || rideSport?.lthr || 165;

          const latestWel = wellnessData && wellnessData.length > 0 ? wellnessData[wellnessData.length - 1] : undefined;

          profile = {
            id: effectiveAthleteId,
            name: effectiveAthleteId === "i442091" ? "German Morales" : ((athleteData as any)?.name || "Atleta"),
            run_ftp: resolvedRunFtp,
            bike_ftp: resolvedBikeFtp,
            lthr: resolvedLthr,
            ctl: latestWel?.ctl,
            atl: latestWel?.atl,
            restingHR: latestWel?.restingHR,
          } as any;
        } else {
          isLive = false;
          profile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
        }

        wellness = wellnessData.length > 0 ? wellnessData : [];
        events = calendarEvents;
      } catch (clientErr) {
        console.warn("Fallo al conectar con Intervals API:", clientErr);
        isLive = false;
        profile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
        wellness = [];
      }
    } else {
      isLive = false;
      profile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
      wellness = [];
    }

    // 1. Evaluación del motor fisiológico
    const physioStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);

    // Sincronizar métricas resueltas en el perfil del atleta
    profile.ctl = physioStatus.ctl;
    profile.atl = physioStatus.atl;
    profile.tsb = physioStatus.tsb;
    profile.rampRate = physioStatus.rampRate;
    profile.restingHR = physioStatus.restingHR ?? profile.restingHR;

    // 2. Calcular fase de macrociclo según carreras objetivo (null si no hay carreras)
    const macrocyclePhase = (targetRaces && Array.isArray(targetRaces) && targetRaces.length > 0)
      ? calculateMacrocyclePhase(targetRaces as TargetRace[])
      : null;

    // 3. Inferencia y generación del árbol de decisiones del Head Coach (Gemini con fallback automático)
    let agentDecision;
    try {
      agentDecision = await GeminiPhysiologicalAgent.analyzeMicrocycle(
        profile,
        wellness,
        events,
        physioStatus,
        Number(weekOffset) || 0,
        {
          customApiKey: geminiApiKey,
          preferredModel: selectedModel,
          customDirectives: customPrompt,
          macrocyclePhase,
          weeklyAvailability,
          skipAI,
        }
      );
    } catch (agentErr) {
      console.warn("Fallo en inferencia de agente, usando fallback determinístico:", agentErr);
      agentDecision = null;
    }

    return NextResponse.json({
      success: true,
      isLive,
      profile,
      wellness,
      events,
      physioStatus,
      macrocyclePhase,
      agentDecision,
      executedWeeklyTss,
      dailyExecutedActivities,
    });
  } catch (error: unknown) {
    console.error("Error capturado en /api/evaluate:", error);
    const defaultProfile = getEmptyProfile(effectiveAthleteId || "", customRunFtp, customBikeFtp);
    const defaultPhysio = PhysiologicalEngine.evaluateAthlete(defaultProfile, []);

    return NextResponse.json({
      success: true,
      isLive: false,
      profile: defaultProfile,
      wellness: [],
      events: [],
      physioStatus: defaultPhysio,
      macrocyclePhase: null,
      agentDecision: null,
      executedWeeklyTss: 0,
      dailyExecutedActivities: {},
      warning: error instanceof Error ? error.message : "Evaluación recuperada por fallback",
    });
  }
}

function getEmptyProfile(athleteId?: string, runFtp?: number, bikeFtp?: number): AthleteProfile {
  return {
    id: athleteId || "",
    name: "Atleta",
    ctl: 0,
    atl: 0,
    tsb: 0,
    rampRate: 0,
    run_ftp: runFtp,
    bike_ftp: bikeFtp,
  };
}

