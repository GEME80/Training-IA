import { IntervalsClient } from "@/lib/intervals/client";
import { saveUserProfile } from "@/lib/db/userProfile";

export interface RunPowerCalibrationEvent {
  detected: boolean;
  activityId?: string;
  activityName?: string;
  date?: string;
  previousWatts: number;
  newWatts: number;
  deltaWatts: number;
  source: "INTERVALS_EFTP" | "RUN_POWER_TEST";
  message: string;
}

export interface RunPowerDetectionParams {
  activities: any[];
  athleteId: string;
  apiKey: string;
  uid?: string;
  currentRunFtp?: number;
}

/**
 * Servicio de detección de Breakthroughs de Potencia de Carrera (CP / Run FTP)
 * compatible con Stryd, Garmin HRM-Pro, Coros y Polar.
 */
export class RunPowerDetectionService {
  static evaluateActivitiesForRunPowerUpdate(params: RunPowerDetectionParams): RunPowerCalibrationEvent | null {
    const { activities, currentRunFtp = 0 } = params;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return null;
    }

    const runActivities = activities
      .filter((act: any) => /run|carrera|running|trailrun/i.test(act.type || ""))
      .sort((a: any, b: any) => {
        const dateA = new Date(a.start_date_local || a.start_date || 0).getTime();
        const dateB = new Date(b.start_date_local || b.start_date || 0).getTime();
        return dateB - dateA;
      });

    if (runActivities.length === 0) return null;

    const now = Date.now();
    const maxAgeMs = 21 * 24 * 60 * 60 * 1000;

    for (const act of runActivities) {
      const actDateMs = new Date(act.start_date_local || act.start_date || 0).getTime();
      if (isNaN(actDateMs) || (now - actDateMs) > maxAgeMs) continue;

      const name = (act.name || "").toLowerCase();
      const desc = (act.description || "").toLowerCase();
      const fullText = `${name} ${desc}`;

      const isExplicitPowerTest = /test.*(potencia|power|stryd|cp)|cp.*test|3\/9/i.test(fullText);
      const hasEftp = typeof act.icu_pm_ftp === "number" && !isNaN(act.icu_pm_ftp) && act.icu_pm_ftp > 80;

      if (!isExplicitPowerTest && !hasEftp) continue;

      let candidateWatts: number | undefined = undefined;
      let source: "INTERVALS_EFTP" | "RUN_POWER_TEST" = "INTERVALS_EFTP";

      if (hasEftp) {
        source = "INTERVALS_EFTP";
        candidateWatts = Math.round(act.icu_pm_ftp);
      } else if (isExplicitPowerTest) {
        source = "RUN_POWER_TEST";
        const avgWatts = act.average_watts || act.icu_weighted_avg_watts || 0;
        if (avgWatts > 100) {
          candidateWatts = Math.round(avgWatts * 0.95);
        }
      }

      if (!candidateWatts || candidateWatts < 80 || candidateWatts > 550) continue;

      // Requerir al menos 2W de mejora frente a la CP actual
      const deltaWatts = candidateWatts - currentRunFtp;
      if (deltaWatts < 2) continue;

      // Antifallo: descartar picos irreales mayores a 60W en un solo entreno
      if (currentRunFtp > 0 && deltaWatts > 60) continue;

      const dateStr = act.start_date_local ? act.start_date_local.split("T")[0] : "";
      const sign = deltaWatts > 0 ? `+${deltaWatts}W` : `${deltaWatts}W`;

      return {
        detected: true,
        activityId: String(act.id),
        activityName: act.name || "Carrera con Potencia",
        date: dateStr,
        previousWatts: currentRunFtp,
        newWatts: candidateWatts,
        deltaWatts,
        source,
        message: `⚡ Breakthrough de Potencia en Carrera en "${act.name || "Entrenamiento"}" (${dateStr}): ${candidateWatts}W (${sign} sobre tus ${currentRunFtp}W previos).`,
      };
    }

    return null;
  }

  static async applyRunPowerCalibration(params: {
    athleteId: string;
    apiKey: string;
    uid?: string;
    newWatts: number;
  }): Promise<boolean> {
    const { athleteId, apiKey, uid, newWatts } = params;
    if (!athleteId || !apiKey || newWatts <= 0) return false;

    try {
      const client = new IntervalsClient(athleteId, apiKey);
      const sports = await client.getSportSettings().catch(() => []);
      const runSport = (sports || []).find((s: any) =>
        s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
        /run/i.test(String(s.id))
      );

      if (runSport?.id) {
        await client.updateSportSettings(runSport.id, {
          ftp: newWatts,
        });
      }

      if (uid) {
        await saveUserProfile(uid, {
          profile: { runFtp: newWatts },
        } as any);
      }

      return true;
    } catch (err) {
      console.error("Error al aplicar calibración de potencia de carrera:", err);
      return false;
    }
  }
}
