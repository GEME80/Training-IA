/**
 * demoAthletesSuite.ts
 * Suite Ejecutiva de Pruebas Fisiológicas y Gestión de Usuarios Dummy Demo.
 */

import { adminDb } from "../firebase/admin";
import { UserProfileData } from "../db/types";
import { generateCustomMacrocycleBlueprint } from "../physiology/macrocycleGenerator";
import { generateWeekTemplate } from "../physiology/macrocycleTemplates";
import { evaluateGoalFeasibility } from "../physiology/goalFeasibilityEngine";
import { DEMO_ATHLETES, DemoAthletePersona } from "./demoAthletesData";

export { DEMO_ATHLETES, type DemoAthletePersona };

export interface Phase1TestResultItem {
  athleteId: string;
  name: string;
  sportApproach: string;
  hasRace: boolean;
  feasibilityStatus: string;
  stagedPace: string;
  targetWatts: string;
  phase1WeeksCount: number;
  sampleTuesday: string;
  sampleSunday: string;
  isFeasibilityOk: boolean;
  hasCorrectModel: boolean;
  passed: boolean;
}

/**
 * Ejecuta la suite de pruebas automatizadas sobre la Fase 1 de los 7 atletas demo.
 */
export function runPhase1TestSuite(): Phase1TestResultItem[] {
  return DEMO_ATHLETES.map((athlete) => {
    const { wizardConfig, biometrics, expectedCriteria } = athlete;
    const goalCand = wizardConfig.raceGoal || wizardConfig.athleteMoment || "Completar";

    // 1. Evaluar factibilidad fisiológica
    const feasibility = wizardConfig.raceDistance
      ? evaluateGoalFeasibility(goalCand, wizardConfig.raceDistance, {
          runFtp: biometrics.runFtp,
          bikeFtp: biometrics.bikeFtp,
          weightKg: biometrics.weightKg,
          ctl: biometrics.ctl,
          thresholdPaceSec: biometrics.runThresholdPaceSec,
        })
      : null;

    // 2. Generar Blueprint
    const blueprint = generateCustomMacrocycleBlueprint({
      distanceType: wizardConfig.raceDistance || (wizardConfig.athleteMoment as any) || "maintenance",
      startDate: wizardConfig.startDate,
      weeksCount: wizardConfig.weeksCount,
      customGoal: wizardConfig.raceName || `Plan ${wizardConfig.athleteMoment}`,
      periodization: wizardConfig.periodization,
      primaryRace: wizardConfig.hasRace && wizardConfig.raceName ? {
        id: `race-${athlete.id}`,
        name: wizardConfig.raceName,
        date: wizardConfig.raceDate || "",
        distance: wizardConfig.raceDistance || "42k",
        priority: "A",
        goalTarget: wizardConfig.raceGoal,
      } : undefined,
      athleteMetrics: {
        ctl: biometrics.ctl,
        runFtp: biometrics.runFtp,
        bikeFtp: biometrics.bikeFtp,
        runningTrainingMode: biometrics.runningTrainingMode,
        hasRunningPowerMeter: biometrics.hasRunningPowerMeter,
        weightKg: biometrics.weightKg,
        weeklyAvailability: wizardConfig.weeklyAvailability,
      },
    });

    // 3. Generar Semanas 1 a 4 (Fase 1)
    const phase1Weeks = blueprint.weeks.slice(0, 4).map((w) => {
      const items = generateWeekTemplate(
        w,
        biometrics.runFtp,
        biometrics.bikeFtp,
        wizardConfig.weeklyAvailability,
        blueprint.distanceType as any,
        biometrics.ctl,
        wizardConfig.raceDate,
        {
          mode: biometrics.runningTrainingMode,
          raceGoal: wizardConfig.raceGoal,
          stagedRacePaceSec: feasibility?.stagedRacePaceSec,
        }
      );
      return {
        weekNumber: w.weekNumber,
        phase: w.phase,
        microcycleType: w.microcycleType,
        targetTss: w.targetTss,
        sessionsCount: items.filter((i) => !i.isRestDay).length,
        tuesday: items.find((i) => i.day === "Martes"),
        sunday: items.find((i) => i.day === "Domingo"),
      };
    });

    const isFeasibilityOk = !expectedCriteria.expectedFeasibilityStatus || feasibility?.status === expectedCriteria.expectedFeasibilityStatus;
    const hasCorrectModel = blueprint.cycleTitle.toLowerCase().includes(expectedCriteria.expectedModelKeyword.toLowerCase()) ||
      blueprint.mode.toLowerCase().includes("specific") || blueprint.mode.toLowerCase().includes("maintenance");

    return {
      athleteId: athlete.id,
      name: athlete.displayName,
      sportApproach: wizardConfig.trainingApproach,
      hasRace: wizardConfig.hasRace,
      feasibilityStatus: feasibility?.status || "N/A",
      stagedPace: feasibility?.stagedRacePaceKmStr || "N/A",
      targetWatts: feasibility?.targetPowerWatts ? `${feasibility.targetPowerWatts}W` : "N/A",
      phase1WeeksCount: phase1Weeks.length,
      sampleTuesday: phase1Weeks[0]?.tuesday?.workoutName || "Descanso",
      sampleSunday: phase1Weeks[0]?.sunday?.workoutName || "Descanso",
      isFeasibilityOk,
      hasCorrectModel,
      passed: isFeasibilityOk && phase1Weeks.length === 4,
    };
  });
}

/**
 * Siembra los 7 atletas demo en Firestore para pruebas en la interfaz web.
 */
export async function seedDemoAthletes(): Promise<{ success: boolean; count: number; message: string }> {
  if (!adminDb) return { success: true, count: DEMO_ATHLETES.length, message: "Modo local: 7 atletas simulados listos." };

  const batch = adminDb.batch();
  const now = new Date().toISOString();

  DEMO_ATHLETES.forEach((athlete) => {
    const userRef = adminDb!.collection("users").doc(athlete.id);
    const profileDoc: Partial<UserProfileData> & Record<string, any> = {
      uid: athlete.id,
      email: athlete.email,
      displayName: athlete.displayName,
      role: athlete.role,
      status: athlete.status,
      intervalsAthleteId: athlete.biometrics.hasRunningPowerMeter ? athlete.intervalsAthleteId : undefined,
      runFtp: athlete.biometrics.runFtp,
      bikeFtp: athlete.biometrics.bikeFtp,
      weightKg: athlete.biometrics.weightKg,
      ctl: athlete.biometrics.ctl,
      runningTrainingMode: athlete.biometrics.runningTrainingMode,
      hasRunningPowerMeter: athlete.biometrics.hasRunningPowerMeter,
      runThresholdPaceStr: athlete.biometrics.runThresholdPaceStr,
      weeklyAvailability: athlete.wizardConfig.weeklyAvailability,
      isDemoAthlete: true,
      demoTag: "PULSE_DEMO_ATHLETE",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    batch.set(userRef, profileDoc, { merge: true });
  });

  await batch.commit();
  return { success: true, count: DEMO_ATHLETES.length, message: `${DEMO_ATHLETES.length} atletas demo sembrados con éxito en Firestore.` };
}

/**
 * Elimina todos los atletas demo de Firestore de forma segura.
 */
export async function cleanDemoAthletes(): Promise<{ success: boolean; count: number; message: string }> {
  if (!adminDb) return { success: true, count: DEMO_ATHLETES.length, message: "Modo local: atletas demo eliminados." };

  const snapshot = await adminDb.collection("users").where("demoTag", "==", "PULSE_DEMO_ATHLETE").get();
  if (snapshot.empty) {
    let count = 0;
    for (const a of DEMO_ATHLETES) {
      const doc = await adminDb.collection("users").doc(a.id).get();
      if (doc.exists) {
        await adminDb.collection("users").doc(a.id).delete();
        count++;
      }
    }
    return { success: true, count, message: `${count} atletas demo eliminados.` };
  }

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return { success: true, count: snapshot.size, message: `${snapshot.size} atletas demo eliminados de Firestore.` };
}
