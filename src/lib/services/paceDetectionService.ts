import { IntervalsClient } from "@/lib/intervals/client";
import { saveUserProfile } from "@/lib/db/userProfile";
import { formatPace, parsePaceToSeconds } from "@/lib/physiology/runningWorkoutAdapter";

export interface PaceCalibrationEvent {
  detected: boolean;
  activityId?: string;
  activityName?: string;
  date?: string;
  previousPaceStr: string;
  newPaceStr: string;
  previousPaceSec: number;
  newPaceSec: number;
  deltaSec: number;
  source: "5K_TEST" | "10K_TEST" | "RUN_TEST";
  message: string;
}

export interface PaceDetectionParams {
  activities: any[];
  athleteId: string;
  apiKey: string;
  uid?: string;
  currentPaceSec?: number;
  currentPaceStr?: string;
  lthr?: number;
  maxHR?: number;
}

/**
 * Servicio autónomo de detección de tests de ritmo de carrera (5k, 10k, control de umbral)
 * y aplicación soberana hacia Intervals.icu y Firestore.
 */
export class PaceDetectionService {
  /**
   * Analiza actividades de carrera en los últimos 21 días para detectar tests
   * o mejoras de ritmo umbral.
   */
  static evaluateActivitiesForPaceUpdate(params: PaceDetectionParams): PaceCalibrationEvent | null {
    const { activities, currentPaceSec = 285, currentPaceStr = "4:45", lthr, maxHR } = params;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return null;
    }

    // 1. Filtrar solo actividades de carrera a pie
    const runActivities = activities
      .filter((act: any) => /run|carrera|running|virtualrun|trailrun/i.test(act.type || ""))
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

      const distanceM = act.distance || 0;
      const movingSec = act.moving_time || act.elapsed_time || 0;
      if (distanceM < 2500 || movingSec < 600) continue;

      const avgSpeed = act.average_speed || (movingSec > 0 ? distanceM / movingSec : 0);
      if (avgSpeed < 1.8) continue; // Descartar caminatas

      const paceSecPerKm = Math.round(1000 / avgSpeed);

      // Distancias estándar
      const is5k = distanceM >= 4800 && distanceM <= 5400;
      const is10k = distanceM >= 9600 && distanceM <= 10600;
      
      // Detección explícita de test o competencia en nombre/descripción
      const isExplicitTest = /test|umbral|prueba.*ritmo|control.*ritmo|cooper|all-?out/i.test(fullText);
      const isRace = /race|competici[oó]n|marat[oó]n|media\s*marat[oó]n/i.test(fullText) || act.icu_training_load_type === "Race";

      // Filtro de Carga Interna (FC): Si no es test explícito ni carrera, la FC media debe
      // respaldar que fue un esfuerzo cercano al umbral (evitar bajadas/errores de GPS)
      const avgHr = act.average_heartrate || act.icu_average_heartrate || 0;
      if (!isExplicitTest && !isRace && avgHr > 0) {
        if (lthr && lthr > 0 && avgHr < lthr * 0.88) continue;
        if (maxHR && maxHR > 0 && avgHr < maxHR * 0.82) continue;
      }

      let candidatePaceSec: number | undefined = undefined;
      let source: "5K_TEST" | "10K_TEST" | "RUN_TEST" = "RUN_TEST";

      if (isExplicitTest || isRace) {
        if (is5k) {
          source = "5K_TEST";
          candidatePaceSec = Math.round(paceSecPerKm * 1.05);
        } else if (is10k) {
          source = "10K_TEST";
          candidatePaceSec = paceSecPerKm;
        } else if (movingSec >= 900 && movingSec <= 3600) {
          source = "RUN_TEST";
          candidatePaceSec = paceSecPerKm;
        }
      } else if (is5k) {
        // En entrenamientos cotidianos sin etiqueta de test: SOLO sugerir si fue un breakthrough
        // (es decir, el atleta corrió notablemente más rápido que su umbral actual)
        const calcPace = Math.round(paceSecPerKm * 1.05);
        if (calcPace < currentPaceSec - 3) {
          source = "5K_TEST";
          candidatePaceSec = calcPace;
        }
      } else if (is10k) {
        // En entrenamientos cotidianos sin etiqueta de test: SOLO sugerir si fue más rápido
        if (paceSecPerKm < currentPaceSec - 3) {
          source = "10K_TEST";
          candidatePaceSec = paceSecPerKm;
        }
      }

      if (!candidatePaceSec || candidatePaceSec < 150 || candidatePaceSec > 450) continue;

      // Requerir al menos 3 segundos/km de diferencia frente al umbral actual
      const deltaSec = candidatePaceSec - currentPaceSec;
      if (Math.abs(deltaSec) < 3) continue;

      // Un entreno regular nunca degrada el umbral a un ritmo más lento (evitar falsos positivos en rodajes Z2)
      if (deltaSec > 0 && !isExplicitTest && !isRace) continue;

      const dateStr = act.start_date_local ? act.start_date_local.split("T")[0] : "";
      const candidateStr = formatPace(candidatePaceSec);
      const sign = deltaSec < 0 ? `-${Math.abs(deltaSec)}s/km` : `+${deltaSec}s/km`;

      return {
        detected: true,
        activityId: String(act.id),
        activityName: act.name || "Test de Carrera",
        date: dateStr,
        previousPaceStr: currentPaceStr,
        newPaceStr: candidateStr,
        previousPaceSec: currentPaceSec,
        newPaceSec: candidatePaceSec,
        deltaSec,
        source,
        message: `🎯 Test de ritmo detectado en "${act.name || "Carrera"}" (${dateStr}): ${candidateStr}/km (${sign} frente a tu ritmo previo ${currentPaceStr}/km).`,
      };
    }

    return null;
  }

  /**
   * Aplica la calibración de ritmo umbral aprobada por el atleta hacia Intervals.icu y Firestore.
   */
  static async applyPaceCalibration(params: {
    athleteId: string;
    apiKey: string;
    uid?: string;
    candidatePaceStr: string;
    candidatePaceSec: number;
  }): Promise<boolean> {
    const { athleteId, apiKey, uid, candidatePaceStr, candidatePaceSec } = params;
    if (!athleteId || !apiKey || candidatePaceSec <= 0) return false;

    try {
      const client = new IntervalsClient(athleteId, apiKey);
      const sports = await client.getSportSettings().catch(() => []);
      const runSport = (sports || []).find((s: any) =>
        s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
        /run/i.test(String(s.id))
      );

      if (runSport?.id) {
        // En Intervals.icu se puede actualizar el pace en m/s
        const speedMps = Number((1000 / candidatePaceSec).toFixed(3));
        await client.updateSportSettings(runSport.id, { pace: speedMps }).catch((err) => {
          console.warn("Aviso al actualizar sport-settings pace en Intervals:", err);
        });
      }

      if (uid) {
        await saveUserProfile(uid, {
          runThresholdPaceStr: candidatePaceStr,
          runThresholdPaceSecPerKm: candidatePaceSec,
        }).catch((err) => {
          console.warn("Aviso al persistir ritmo en Firestore:", err);
        });
      }

      return true;
    } catch (err) {
      console.error("Error al aplicar calibración de ritmo:", err);
      return false;
    }
  }
}
