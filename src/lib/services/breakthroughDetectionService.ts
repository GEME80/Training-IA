import { FtpDetectionService, FtpCalibrationEvent } from "./ftpDetectionService";
import { PaceDetectionService, PaceCalibrationEvent } from "./paceDetectionService";
import { RunPowerDetectionService, RunPowerCalibrationEvent } from "./runPowerDetectionService";

export interface BreakthroughDetectionParams {
  activities: any[];
  athleteId: string;
  apiKey: string;
  uid?: string;
  currentBikeFtp?: number;
  currentRunFtp?: number;
  currentPaceSec?: number;
  currentPaceStr?: string;
  lthr?: number;
  maxHR?: number;
}

export interface BreakthroughResults {
  recentFtpCalibration?: FtpCalibrationEvent;
  recentPaceCalibration?: PaceCalibrationEvent;
  recentRunPowerCalibration?: RunPowerCalibrationEvent;
}

/**
 * Motor Soberano de Detección de Breakthroughs Fisiológicos.
 * Evalúa Ciclismo (Watts), Ritmo Daniels (Min/km) y Potencia de Carrera (CP en Watts).
 */
export class BreakthroughDetectionService {
  static async evaluateAll(params: BreakthroughDetectionParams): Promise<BreakthroughResults> {
    const { activities, athleteId, apiKey, uid, currentBikeFtp = 0, currentRunFtp = 0, currentPaceSec = 285, currentPaceStr = "4:45", lthr, maxHR } = params;

    const results: BreakthroughResults = {};
    if (!activities || !Array.isArray(activities) || activities.length === 0 || !athleteId || !apiKey) {
      return results;
    }

    // 1. Ciclismo: FTP
    try {
      const ftpCal = await FtpDetectionService.evaluateActivitiesForFtpUpdate({
        activities, athleteId, apiKey, uid, currentBikeFtp,
      });
      if (ftpCal?.detected && ftpCal.newFtp > 0) {
        results.recentFtpCalibration = ftpCal;
      }
    } catch (e) {
      console.warn("Aviso al evaluar Breakthrough de FTP:", e);
    }

    // 2. Carrera: Ritmo Umbral (VDOT / Daniels)
    try {
      const paceCal = PaceDetectionService.evaluateActivitiesForPaceUpdate({
        activities, athleteId, apiKey, uid, currentPaceSec, currentPaceStr, lthr, maxHR,
      });
      if (paceCal?.detected) {
        results.recentPaceCalibration = paceCal;
      }
    } catch (e) {
      console.warn("Aviso al evaluar Breakthrough de Ritmo:", e);
    }

    // 3. Carrera: Potencia (CP / Watts)
    try {
      const runPowerCal = RunPowerDetectionService.evaluateActivitiesForRunPowerUpdate({
        activities, athleteId, apiKey, uid, currentRunFtp,
      });
      if (runPowerCal?.detected) {
        results.recentRunPowerCalibration = runPowerCal;
      }
    } catch (e) {
      console.warn("Aviso al evaluar Breakthrough de Potencia de Carrera:", e);
    }

    return results;
  }
}
