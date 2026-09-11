import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, CalendarEvent, DailyExecutedMap } from "@/lib/intervals/types";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { getLocalTodayStr, formatLocalDateToYMD, getMondayOfWeekStr } from "@/lib/dateUtils";
import { EvaluateRequest } from "@/lib/validation/schemas";

export interface TelemetryEvaluationResult {
  success: boolean;
  isLive: boolean;
  profile: AthleteProfile;
  wellness: AthleteWellness[];
  events: CalendarEvent[];
  physioStatus: PhysiologicalStatus;
  macrocyclePhase: any;
  agentDecision: any;
  executedWeeklyTss: number;
  dailyExecutedActivities: DailyExecutedMap;
  warning?: string;
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

export class TelemetryService {
  /**
   * Evalúa la telemetría del atleta contra Intervals.icu o devuelve degradación elegante en fallback
   */
  static async evaluate(input: EvaluateRequest): Promise<TelemetryEvaluationResult> {
    const {
      athleteId,
      apiKey,
      uid,
      email,
      customRunFtp: inputRunFtp,
      customBikeFtp: inputBikeFtp,
    } = input;

    const customRunFtp = inputRunFtp ?? undefined;
    const customBikeFtp = inputBikeFtp ?? undefined;

    let effectiveAthleteId = "";
    try {
      const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
      effectiveAthleteId = credentials.athleteId;
      const effectiveApiKey = credentials.apiKey;

      let profile: AthleteProfile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
      let wellness: AthleteWellness[] = [];
      let events: CalendarEvent[] = [];
      let isLive = false;
      let executedWeeklyTss = 0;
      let dailyExecutedActivities: DailyExecutedMap = {};

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
            client.getAthlete().catch((err) => { console.warn("Aviso al consultar atleta:", err); return null; }),
            client.getWellness(oldestWellnessStr, newestStr).catch((err) => { console.warn("Aviso wellness:", err); return []; }),
            client.getEvents(newestStr, futureStr).catch((err) => { console.warn("Aviso eventos:", err); return []; }),
            client.getSportSettings().catch((err) => { console.warn("Aviso sportSettings:", err); return []; }),
            client.getActivities(oldestActivitiesStr, newestStr).catch((err) => { console.warn("Aviso actividades:", err); return []; }),
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
              dailyExecutedActivities[dateKey] = { date: dateKey, totalTss: 0, activities: [] };
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

            if (dateKey >= thisMondayStr && dateKey <= newestStr) {
              executedWeeklyTss += tss;
            }
          });

          if (athleteData) {
            isLive = true;
            wellness = wellnessData;
            events = calendarEvents;

            const runSport = (sportSettingsData || []).find((s: any) =>
              s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) || /run/i.test(String(s.id))
            );
            const rideSport = (sportSettingsData || []).find((s: any) =>
              s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) || /ride|cycling|bike/i.test(String(s.id))
            );

            const isGermanMorales = athleteData.id === "i442091" || Boolean(email && /german|gerkof/i.test(email));
            const anyAthlete = athleteData as any;
            const icuDob = anyAthlete.icu_date_of_birth || anyAthlete.dob || anyAthlete.date_of_birth || (isGermanMorales ? "1980-03-24" : undefined);
            let calculatedAge: number | undefined = undefined;
            if (icuDob) {
              const birth = new Date(icuDob);
              if (!isNaN(birth.getTime())) {
                const now = new Date();
                let age = now.getFullYear() - birth.getFullYear();
                const monthDiff = now.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
                if (age > 0 && age < 120) calculatedAge = age;
              }
            }

            const fallbackWeight = athleteData.weight || (wellness[0] as any)?.weight || (isGermanMorales ? 70 : undefined);
            const fallbackRunFtp = customRunFtp ?? (runSport?.ftp || anyAthlete.icu_running_ftp || athleteData.run_ftp || (isGermanMorales ? 327 : 0));
            const fallbackBikeFtp = customBikeFtp ?? (rideSport?.ftp || anyAthlete.icu_ftp || athleteData.bike_ftp || (isGermanMorales ? 240 : 0));

            profile = {
              ...athleteData,
              name: athleteData.name || (isGermanMorales ? "Germán Morales" : "Atleta"),
              birthDate: icuDob,
              age: calculatedAge,
              gender: anyAthlete.sex || anyAthlete.gender || (isGermanMorales ? "M" : undefined),
              weight: fallbackWeight,
              restingHR: anyAthlete.resting_hr || anyAthlete.restingHR || athleteData.restingHR,
              maxHR: anyAthlete.max_hr || anyAthlete.maxHR || athleteData.maxHR,
              lthr: anyAthlete.lthr || athleteData.lthr,
              run_ftp: fallbackRunFtp,
              bike_ftp: fallbackBikeFtp,
            };
          }
        } catch (clientErr) {
          console.warn("Aviso de degradación elegante: cliente Intervals inaccesible:", clientErr);
        }
      }

      const physioStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);
      profile.ctl = physioStatus.ctl;
      profile.atl = physioStatus.atl;
      profile.tsb = physioStatus.tsb;
      profile.rampRate = physioStatus.rampRate;

      return {
        success: true,
        isLive,
        profile,
        wellness,
        events,
        physioStatus,
        macrocyclePhase: null,
        agentDecision: null,
        executedWeeklyTss,
        dailyExecutedActivities,
      };
    } catch (err: unknown) {
      console.error("Error en TelemetryService.evaluate:", err);
      const defaultProfile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
      const defaultPhysio = PhysiologicalEngine.evaluateAthlete(defaultProfile, []);

      return {
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
        warning: err instanceof Error ? err.message : "Evaluación recuperada por fallback",
      };
    }
  }
}
