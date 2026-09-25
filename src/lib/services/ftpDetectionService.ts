import { IntervalsClient } from "@/lib/intervals/client";
import { saveUserProfile } from "@/lib/db/userProfile";

export interface FtpCalibrationEvent {
  detected: boolean;
  activityId?: string;
  activityName?: string;
  date?: string;
  previousFtp: number;
  newFtp: number;
  deltaWatts: number;
  source: "20M_TEST" | "RAMP_TEST" | "INTERVALS_EFTP";
  message: string;
}

export interface FtpDetectionParams {
  activities: any[];
  athleteId: string;
  apiKey: string;
  uid?: string;
  currentBikeFtp?: number;
}

/**
 * Servicio autónomo de detección de tests de FTP en ciclismo y calibración
 * bidireccional automática en Firestore e Intervals.icu (v3.71).
 */
export class FtpDetectionService {
  /**
   * Analiza las actividades ejecutadas en busca de tests de FTP y recalibra
   * automáticamente el FTP de ciclismo del atleta si hay una variación significativa (>= 2W).
   */
  static async evaluateActivitiesForFtpUpdate(params: FtpDetectionParams): Promise<FtpCalibrationEvent | null> {
    const { activities, athleteId, apiKey, uid, currentBikeFtp = 0 } = params;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return null;
    }
    if (!athleteId || !apiKey) {
      return null;
    }

    // 1. Filtrar solo actividades de ciclismo ordenadas de más reciente a más antigua
    const cyclingActivities = activities
      .filter((act: any) => /ride|ciclismo|bike|virtualride|indoor/i.test(act.type || ""))
      .sort((a: any, b: any) => {
        const dateA = new Date(a.start_date_local || a.start_date || 0).getTime();
        const dateB = new Date(b.start_date_local || b.start_date || 0).getTime();
        return dateB - dateA;
      });

    if (cyclingActivities.length === 0) {
      return null;
    }

    // 2. Evaluar solo actividades de los últimos 21 días (ventana de vigencia fisiológica de un test)
    const now = Date.now();
    const maxAgeMs = 21 * 24 * 60 * 60 * 1000;

    for (const act of cyclingActivities) {
      const actDateMs = new Date(act.start_date_local || act.start_date || 0).getTime();
      if (isNaN(actDateMs) || (now - actDateMs) > maxAgeMs) {
        continue;
      }

      const name = (act.name || "").toLowerCase();
      const desc = (act.description || "").toLowerCase();
      const fullText = `${name} ${desc}`;

      const is20mTest = /20m|20\s*min/i.test(fullText) && /test|ftp|umbral|prueba/i.test(fullText);
      const isRampTest = /ramp|rampa/i.test(fullText) && /test|ftp|prueba/i.test(fullText);
      const isGenericFtpTest = /test.*ftp|ftp.*test|prueba.*ftp|control.*ftp/i.test(fullText);

      // Si no es un test explícito ni tiene eFTP calculado por Intervals, continuar
      const hasEftp = typeof act.icu_pm_ftp === "number" && !isNaN(act.icu_pm_ftp) && act.icu_pm_ftp > 50;
      if (!is20mTest && !isRampTest && !isGenericFtpTest && !hasEftp) {
        continue;
      }

      let candidateFtp: number | undefined = undefined;
      let source: "20M_TEST" | "RAMP_TEST" | "INTERVALS_EFTP" = "INTERVALS_EFTP";

      if (is20mTest) {
        source = "20M_TEST";
        if (hasEftp) {
          candidateFtp = Math.round(act.icu_pm_ftp);
        } else {
          const rawWatts = act.icu_weighted_avg_watts || act.weighted_average_watts || act.icu_average_watts || act.average_watts;
          const movingSec = act.moving_time || act.elapsed_time || 0;
          if (rawWatts && rawWatts > 50) {
            // Si la duración es aproximadamente de 20 min (18m - 25m), aplicar 0.95
            candidateFtp = (movingSec >= 1080 && movingSec <= 1600)
              ? Math.round(rawWatts * 0.95)
              : Math.round(rawWatts);
          }
        }
      } else if (isRampTest) {
        source = "RAMP_TEST";
        if (hasEftp) {
          candidateFtp = Math.round(act.icu_pm_ftp);
        } else if (act.icu_ftp && act.icu_ftp > 50) {
          candidateFtp = Math.round(act.icu_ftp);
        }
      } else if (isGenericFtpTest) {
        source = "20M_TEST";
        if (hasEftp) {
          candidateFtp = Math.round(act.icu_pm_ftp);
        } else if (act.icu_ftp && act.icu_ftp > 50) {
          candidateFtp = Math.round(act.icu_ftp);
        }
      } else if (hasEftp && (is20mTest || isRampTest || isGenericFtpTest)) {
        source = "INTERVALS_EFTP";
        candidateFtp = Math.round(act.icu_pm_ftp);
      }

      if (!candidateFtp || candidateFtp <= 50) {
        continue;
      }

      const delta = candidateFtp - currentBikeFtp;
      // Requerir al menos 2W de diferencia para evitar ruido de redondeo
      if (Math.abs(delta) < 2) {
        continue;
      }

      // 3. Ejecutar actualización síncrona bidireccional
      const client = new IntervalsClient(athleteId, apiKey);
      try {
        // A. Actualizar Sport Settings en Intervals.icu
        const sports = await client.getSportSettings().catch(() => []);
        const rideSport = (sports || []).find((s: any) =>
          s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
          /ride|cycling|bike/i.test(String(s.id))
        );

        if (rideSport?.id) {
          await client.updateSportSettings(rideSport.id, { ftp: candidateFtp });
        }
        await client.updateAthlete({ icu_ftp: candidateFtp } as any).catch(() => null);

        // B. Actualizar en Firestore si se suministró uid
        if (uid) {
          await saveUserProfile(uid, { bikeFtp: candidateFtp });
        }

        const dateStr = act.start_date_local ? act.start_date_local.split("T")[0] : "";
        const sign = delta > 0 ? `+${delta}W` : `${delta}W`;
        const direction = delta > 0 ? "incrementó" : "ajustó";

        return {
          detected: true,
          activityId: String(act.id),
          activityName: act.name || "Test de FTP",
          date: dateStr,
          previousFtp: currentBikeFtp,
          newFtp: candidateFtp,
          deltaWatts: delta,
          source,
          message: `🎯 Test de FTP detectado el ${dateStr}. Tu FTP de ciclismo se ${direction} de ${currentBikeFtp}W a ${candidateFtp}W (${sign}). Zonas y TSS recalculados automáticamente.`,
        };
      } catch (err) {
        console.warn("Aviso al actualizar FTP en Intervals.icu o Firestore:", err);
      }
    }

    return null;
  }
}
