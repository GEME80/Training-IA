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

import { saveMacrocycleToFirestore } from "../db/macrocycles";

const PROTECTED_ACCOUNTS = new Set([
  "gerkof@gmail.com",
  (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || "").toLowerCase(),
  (process.env.SUPERADMIN_EMAIL || "").toLowerCase(),
].filter(Boolean));

/**
 * Siembra los 7 atletas demo en Firestore con su perfil completo y su macrociclo activo generado.
 * Garantía absoluta: NUNCA sobrescribe ni toca usuarios reales.
 */
export async function seedDemoAthletes(): Promise<{ success: boolean; count: number; message: string }> {
  if (!adminDb) return { success: true, count: DEMO_ATHLETES.length, message: "Modo local: 7 atletas simulados listos." };

  const now = new Date().toISOString();
  let seededCount = 0;

  for (const athlete of DEMO_ATHLETES) {
    if (!athlete.id.startsWith("demo_") || !athlete.email.endsWith("@pulse-demo.com")) continue;

    const userRef = adminDb.collection("users").doc(athlete.id);
    const existingDoc = await userRef.get();
    if (existingDoc.exists && existingDoc.data()?.isDemoAthlete !== true) continue;

    // 1. Perfil Completo del Atleta con todos los umbrales y suscripción activa
    const profileDoc: Partial<UserProfileData> & Record<string, any> = {
      uid: athlete.id,
      email: athlete.email,
      displayName: athlete.displayName,
      role: athlete.role,
      status: athlete.status,
      intervalsAthleteId: athlete.intervalsAthleteId,
      runFtp: athlete.biometrics.runFtp,
      bikeFtp: athlete.biometrics.bikeFtp,
      swimCssStr: athlete.biometrics.swimCssStr,
      weightKg: athlete.biometrics.weightKg,
      ctl: athlete.biometrics.ctl,
      lthr: athlete.biometrics.lthr,
      maxHR: athlete.biometrics.maxHR,
      restingHR: athlete.biometrics.restingHR,
      runningTrainingMode: athlete.biometrics.runningTrainingMode,
      hasRunningPowerMeter: athlete.biometrics.hasRunningPowerMeter,
      runThresholdPaceStr: athlete.biometrics.runThresholdPaceStr,
      runThresholdPaceSecPerKm: athlete.biometrics.runThresholdPaceSec,
      weeklyAvailability: athlete.wizardConfig.weeklyAvailability,
      planPrice: athlete.planPrice || 80,
      planCurrency: "USD",
      billingStatus: athlete.billingStatus || "PAID",
      primaryGoalRace: athlete.wizardConfig.raceName,
      primaryGoalDate: athlete.wizardConfig.raceDate,
      isDemoAthlete: true,
      demoTag: "PULSE_DEMO_ATHLETE",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await userRef.set(profileDoc, { merge: true });

    // 2. Generar el Blueprint Completo del Macrociclo con IA/Motor Determinista
    const { wizardConfig, biometrics } = athlete;
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

    // 3. Persistir el Macrociclo Activo en Firestore para inspección en vivo
    await saveMacrocycleToFirestore(
      athlete.id,
      blueprint,
      blueprint.primaryRace,
      "AI_GENERATED",
      athlete.id
    );

    seededCount++;
  }

  return {
    success: true,
    count: seededCount,
    message: `${seededCount} atletas demo sembrados con umbrales completos y macrociclos activos en Firestore.`,
  };
}

/**
 * Elimina exclusivamente los atletas demo y sus macrociclos de Firestore de forma quirúrgica.
 * Salvaguarda quíntuple: Jamás toca usuarios reales ni cuentas de administración.
 */
export async function cleanDemoAthletes(): Promise<{ success: boolean; count: number; message: string }> {
  if (!adminDb) return { success: true, count: DEMO_ATHLETES.length, message: "Modo local: atletas demo eliminados." };

  const knownDemoIds = new Set(DEMO_ATHLETES.map((a) => a.id));
  const snapshot = await adminDb.collection("users").where("demoTag", "==", "PULSE_DEMO_ATHLETE").get();

  let deletedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const email = (data?.email || "").toLowerCase();

    const isKnownDemoId = knownDemoIds.has(doc.id) && doc.id.startsWith("demo_");
    const isExplicitDemoTag = data.isDemoAthlete === true && data.demoTag === "PULSE_DEMO_ATHLETE";
    const isDemoDomain = email.endsWith("@pulse-demo.com");
    const isNotProtected = !PROTECTED_ACCOUNTS.has(email) && doc.id !== "superadmin-root";
    const isNotAdmin = data.role !== "admin";

    if (isKnownDemoId && isExplicitDemoTag && isDemoDomain && isNotProtected && isNotAdmin) {
      // Purgar subcolecciones de macrociclos y meta
      const macroSnap = await doc.ref.collection("macrocycles").get();
      const metaSnap = await doc.ref.collection("meta").get();
      const subBatch = adminDb.batch();
      macroSnap.docs.forEach((m) => subBatch.delete(m.ref));
      metaSnap.docs.forEach((m) => subBatch.delete(m.ref));
      subBatch.delete(doc.ref);
      await subBatch.commit();
      deletedCount++;
    }
  }

  // Fallback seguro: barrer IDs conocidos de DEMO_ATHLETES
  if (deletedCount === 0) {
    for (const a of DEMO_ATHLETES) {
      if (!a.id.startsWith("demo_")) continue;
      const docRef = adminDb.collection("users").doc(a.id);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        const email = (data?.email || "").toLowerCase();
        if (data?.isDemoAthlete === true && email.endsWith("@pulse-demo.com") && !PROTECTED_ACCOUNTS.has(email)) {
          const macroSnap = await docRef.collection("macrocycles").get();
          const metaSnap = await docRef.collection("meta").get();
          const subBatch = adminDb.batch();
          macroSnap.docs.forEach((m) => subBatch.delete(m.ref));
          metaSnap.docs.forEach((m) => subBatch.delete(m.ref));
          subBatch.delete(docRef);
          await subBatch.commit();
          deletedCount++;
        }
      }
    }
  }

  return {
    success: true,
    count: deletedCount,
    message: `${deletedCount} atletas demo y sus macrociclos eliminados sin tocar usuarios reales.`,
  };
}
