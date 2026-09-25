import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine, PhysiologicalStatus } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness, CalendarEvent, DailyExecutedMap } from "@/lib/intervals/types";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { getLocalTodayStr, formatLocalDateToYMD, getMondayOfWeekStr } from "@/lib/dateUtils";
import { EvaluateRequest } from "@/lib/validation/schemas";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { FtpDetectionService, FtpCalibrationEvent } from "@/lib/services/ftpDetectionService";

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
  recentFtpCalibration?: FtpCalibrationEvent;
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
      const storedUser = uid ? await getUserProfileDecrypted(uid).catch(() => null) : null;
      const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
      effectiveAthleteId = credentials.athleteId;
      const effectiveApiKey = credentials.apiKey;

      let profile: AthleteProfile = getEmptyProfile(effectiveAthleteId, customRunFtp, customBikeFtp);
      let wellness: AthleteWellness[] = [];
      let events: CalendarEvent[] = [];
      let isLive = false;
      let executedWeeklyTss = 0;
      let dailyExecutedActivities: DailyExecutedMap = {};
      let recentFtpCalibration: FtpCalibrationEvent | undefined = undefined;

      if (effectiveAthleteId && effectiveApiKey) {
        try {
          const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
          const today = new Date();
          const past370Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 370);
          const past180Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 180);
          const next60Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);

          const oldestWellnessStr = formatLocalDateToYMD(past370Days);
          const oldestActivitiesStr = formatLocalDateToYMD(past370Days);
          const oldestEventsStr = formatLocalDateToYMD(past180Days);
          const newestStr = getLocalTodayStr();
          const futureEventsStr = formatLocalDateToYMD(next60Days);
          const thisMondayStr = getMondayOfWeekStr(today);

          const [athleteData, wellnessData, calendarEvents, sportSettingsData, activitiesData] = await Promise.all([
            client.getAthlete().catch((err) => { console.warn("Aviso al consultar atleta:", err); return null; }),
            client.getWellness(oldestWellnessStr, newestStr).catch((err) => { console.warn("Aviso wellness:", err); return []; }),
            client.getEvents(oldestEventsStr, futureEventsStr).catch((err) => { console.warn("Aviso eventos:", err); return []; }),
            client.getSportSettings().catch((err) => { console.warn("Aviso sportSettings:", err); return []; }),
            client.getActivities(oldestActivitiesStr, newestStr).catch((err) => { console.warn("Aviso actividades:", err); return []; }),
          ]);

          dailyExecutedActivities = {};
          (activitiesData || []).forEach((act: any) => {
            if (!act.start_date_local) return;
            const dateKey = act.start_date_local.split("T")[0];
            const tss = Math.round(act.icu_training_load ?? act.training_load ?? act.tss ?? 0);
            const movingTimeMin = Math.round((act.moving_time ?? act.elapsed_time ?? 0) / 60);
            const rawWatts = [
              act.icu_weighted_avg_watts,
              act.icu_average_watts,
              act.weighted_average_watts,
              act.average_watts,
              act.icu_power,
              act.power,
            ].find((w) => typeof w === "number" && !isNaN(w) && w > 0);
            const watts = typeof rawWatts === "number" ? Math.round(rawWatts) : undefined;
            const heartrate = typeof act.average_heartrate === "number" && act.average_heartrate > 35
              ? Math.round(act.average_heartrate)
              : undefined;
            const distanceKm = act.distance ? Number((act.distance / 1000).toFixed(1)) : undefined;

            const isRide = /ride|ciclismo|bike|virtualride|indoor/i.test(act.type || "");
            const rawWeighted = [act.icu_weighted_avg_watts, act.weighted_average_watts].find(
              (w) => typeof w === "number" && !isNaN(w) && w > 0
            );
            const weightedWatts = typeof rawWeighted === "number" ? Math.round(rawWeighted) : undefined;
            const paceStr = act.average_speed && act.average_speed > 0.5
              ? (isRide
                  ? `${(act.average_speed * 3.6).toFixed(1)} km/h`
                  : `${Math.floor(1000 / act.average_speed / 60)}:${String(Math.round((1000 / act.average_speed) % 60)).padStart(2, "0")}/km`)
              : undefined;
            const gapSpeed = act.gap ?? act.icu_gap;
            const gapPaceStr = !isRide && gapSpeed && gapSpeed > 0.5
              ? `${Math.floor(1000 / gapSpeed / 60)}:${String(Math.round((1000 / gapSpeed) % 60)).padStart(2, "0")}/km`
              : undefined;

            // Factor de Eficiencia (EF):
            // En ciclismo: W/bpm (~1.2 - 2.5). En carrera a pie:
            // 1. Si hay vatios de carrera (Garmin/Stryd) y FC: watts / HR (ej: 253 / 133 = 1.90 W/bpm)
            // 2. Si Intervals entrega icu_efficiency_factor < 0.2 (está en m/s / bpm): multiplicar por 60 para obtener m/latido
            // 3. Si no, calcular metros avanzados por minuto divididos por FC cardíaca (m/latido, ej: 1.29)
            let rawEf: number | undefined = undefined;
            if (watts && heartrate && heartrate > 0) {
              rawEf = watts / heartrate;
            } else if (typeof act.icu_efficiency_factor === "number" && !isNaN(act.icu_efficiency_factor) && act.icu_efficiency_factor > 0) {
              rawEf = act.icu_efficiency_factor < 0.2 ? act.icu_efficiency_factor * 60 : act.icu_efficiency_factor;
            } else if (act.distance && movingTimeMin > 0 && heartrate && heartrate > 0) {
              const metersPerMin = act.distance / movingTimeMin;
              rawEf = metersPerMin / heartrate;
            }
            const efficiencyFactor = typeof rawEf === "number" && !isNaN(rawEf) ? Number(rawEf.toFixed(2)) : undefined;

            const rawDecoupling = act.decoupling ?? act.icu_cardiac_decoupling ?? act.icu_decoupling;
            const cardiacDecoupling = typeof rawDecoupling === "number" && !isNaN(rawDecoupling)
              ? Number(rawDecoupling.toFixed(1))
              : undefined;

            let cadence = typeof act.average_cadence === "number" ? Math.round(act.average_cadence) : undefined;
            // En carrera a pie, si el reloj reportó ciclos de una sola pierna (<120), duplicar para reflejar pasos/min (spm)
            if (!isRide && cadence && cadence > 0 && cadence < 120) {
              cadence = cadence * 2;
            }

            const feelLabels: Record<number, string> = { 1: "Excelente", 2: "Bueno", 3: "Normal", 4: "Exigente", 5: "Agotado" };
            const resolvedFeel = typeof act.feel === "string"
              ? act.feel
              : (typeof act.feel === "number" ? feelLabels[act.feel] || "Normal" : undefined);

            if (!dailyExecutedActivities[dateKey]) {
              dailyExecutedActivities[dateKey] = { date: dateKey, totalTss: 0, activities: [] };
            }
            dailyExecutedActivities[dateKey].totalTss += tss;
            dailyExecutedActivities[dateKey].activities.push({
              id: String(act.id),
              name: act.name,
              type: act.type,
              tss,
              movingTimeMin,
              elapsedTimeMin: act.elapsed_time ? Math.round(act.elapsed_time / 60) : undefined,
              watts,
              weightedWatts,
              heartrate,
              maxHeartrate: typeof act.max_heartrate === "number" && act.max_heartrate > 35 ? Math.round(act.max_heartrate) : undefined,
              distanceKm,
              paceStr,
              gapPaceStr,
              intensityPercent: act.icu_intensity ? Math.round(act.icu_intensity * (act.icu_intensity <= 1 ? 100 : 1)) : undefined,
              efficiencyFactor,
              cardiacDecoupling,
              cadence,
              strideLengthM: typeof act.average_stride_length === "number" ? Number(act.average_stride_length.toFixed(2)) : undefined,
              elevationGainM: typeof act.total_elevation_gain === "number" ? Math.round(act.total_elevation_gain) : undefined,
              calories: typeof act.calories === "number" ? Math.round(act.calories) : undefined,
              workKj: typeof act.joules === "number" ? Math.round(act.joules / 1000) : undefined,
              rpe: act.icu_rpe ?? act.perceived_exertion ?? undefined,
              feel: resolvedFeel,
              deviceName: act.device_name,
              icu_ftp: typeof act.icu_ftp === "number" ? act.icu_ftp : undefined,
              icu_pm_ftp: typeof act.icu_pm_ftp === "number" ? act.icu_pm_ftp : undefined,
            });

            if (dateKey >= thisMondayStr && dateKey <= newestStr) {
              executedWeeklyTss += tss;
            }
          });

          if (athleteData) {
            isLive = true;
            wellness = (wellnessData || []).map((w: any) => ({
              ...w,
              id: w.id || w.date,
              date: w.date || w.id,
            }));
            events = calendarEvents;

            const runSport = (sportSettingsData || []).find((s: any) =>
              s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) || /run/i.test(String(s.id))
            );
            const rideSport = (sportSettingsData || []).find((s: any) =>
              s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) || /ride|cycling|bike/i.test(String(s.id))
            );

            const anyAthlete = athleteData as any;
            const icuDob = anyAthlete.icu_date_of_birth || anyAthlete.dob || anyAthlete.date_of_birth || storedUser?.profile.birthDate;
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

            const rawHeight = (anyAthlete.icu_height as number) || (anyAthlete.height as number) || undefined;
            const normHeight = rawHeight ? (rawHeight < 3 ? Math.round(rawHeight * 100) : Math.round(rawHeight)) : undefined;
            const resolvedHeight = storedUser?.profile.heightCm || normHeight;

            const latestWellness = wellness.length > 0 ? wellness[wellness.length - 1] : undefined;

            // Datos maestros: peso, Stryd CP, Bike FTP, fecha de nacimiento, sexo
            const resolvedWeight = storedUser?.profile.weightKg || athleteData.weight || anyAthlete.icu_weight || (latestWellness as any)?.weight;
            const resolvedRunFtp = customRunFtp ?? (runSport?.ftp || anyAthlete.icu_running_ftp || athleteData.run_ftp || storedUser?.profile.runFtp || 0);
            const initialBikeFtp = customBikeFtp ?? (rideSport?.ftp || anyAthlete.icu_ftp || athleteData.bike_ftp || storedUser?.profile.bikeFtp || 0);

            // Detección y Calibración Automática de Tests de FTP
            let resolvedBikeFtp = initialBikeFtp;
            try {
              const ftpCal = await FtpDetectionService.evaluateActivitiesForFtpUpdate({
                activities: activitiesData || [],
                athleteId: effectiveAthleteId,
                apiKey: effectiveApiKey,
                uid,
                currentBikeFtp: initialBikeFtp,
              });
              if (ftpCal?.detected && ftpCal.newFtp > 0) {
                resolvedBikeFtp = ftpCal.newFtp;
                recentFtpCalibration = ftpCal;
              }
            } catch (calErr) {
              console.warn("Aviso al evaluar test de FTP en telemetría:", calErr);
            }

            // Datos fisiológicos tomados directamente de Intervals.icu (SSOT)
            const intervalsRestingHR = (latestWellness as any)?.restingHR || anyAthlete.resting_hr || anyAthlete.restingHR || athleteData.restingHR;
            const intervalsMaxHR = anyAthlete.max_hr || anyAthlete.maxHR || athleteData.maxHR;
            const intervalsLthr = runSport?.lthr || rideSport?.lthr || anyAthlete.lthr || athleteData.lthr;

            profile = {
              ...athleteData,
              name: athleteData.name || storedUser?.profile.displayName || "Atleta",
              birthDate: icuDob,
              age: calculatedAge,
              gender: (storedUser?.profile.gender as any) || anyAthlete.sex || anyAthlete.gender,
              weight: resolvedWeight ? Number(resolvedWeight) : undefined,
              heightCm: resolvedHeight ? Number(resolvedHeight) : undefined,
              restingHR: intervalsRestingHR ? Number(intervalsRestingHR) : undefined,
              maxHR: intervalsMaxHR ? Number(intervalsMaxHR) : undefined,
              lthr: intervalsLthr ? Number(intervalsLthr) : undefined,
              run_ftp: resolvedRunFtp,
              bike_ftp: resolvedBikeFtp,
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
        recentFtpCalibration,
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
