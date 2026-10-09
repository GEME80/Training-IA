import { generateCustomMacrocycleBlueprint } from "@/lib/physiology/macrocycleGenerator";
import { saveMacrocycleToFirestore } from "@/lib/db/macrocycles";
import { calculateTargetPeakCtlPotential, isFreezeWindowActive } from "@/lib/physiology/ctlPotentialEngine";
import { MacrocycleBlueprint } from "@/lib/physiology/macrocycle";
import { adminDb } from "@/lib/firebase/admin";

export {
  type UpgradeDiffItem,
  type MacrocycleUpgradeProposal,
  type TestEvaluationResult,
  evaluateTestForUpgrade,
} from "@/lib/physiology/ctlPotentialEngine";

/**
 * Recalibra dinámicamente el macrociclo activo de un atleta leyendo sus datos vivos
 * de perfil, carrera objetivo y matriz de disponibilidad desde Firestore.
 */
export async function recalibrateAthletePlan(athleteIdentifier: string): Promise<{
  success: boolean;
  athleteId: string;
  macrocycleId?: string;
  weeks?: number;
  primaryRace?: string;
  error?: string;
}> {
  if (!adminDb) {
    return { success: false, athleteId: athleteIdentifier, error: "Base de datos no disponible" };
  }

  try {
    // Localizar el documento del usuario por uid, intervalsAthleteId o email
    let userDoc: FirebaseFirestore.DocumentSnapshot | null = null;
    const directDoc = await adminDb.collection("users").doc(athleteIdentifier).get();
    if (directDoc.exists) {
      userDoc = directDoc;
    } else {
      const qId = await adminDb.collection("users").where("intervalsAthleteId", "==", athleteIdentifier).limit(1).get();
      if (!qId.empty) {
        userDoc = qId.docs[0];
      } else {
        const qEmail = await adminDb.collection("users").where("email", "==", athleteIdentifier).limit(1).get();
        if (!qEmail.empty) userDoc = qEmail.docs[0];
      }
    }

    if (!userDoc || !userDoc.exists) {
      return { success: false, athleteId: athleteIdentifier, error: "Atleta no encontrado en Firestore" };
    }

    const userData = userDoc.data() || {};
    const effectiveAthleteId = userData.intervalsAthleteId || userDoc.id;
    const profile = userData.profile || {};
    const primaryRace = (userData.targetRaces && userData.targetRaces[0]) || null;
    const activePlan = (userData.seasonPlans && userData.seasonPlans[0]?.blueprint) || null;

    if (!activePlan && !primaryRace) {
      return { success: false, athleteId: effectiveAthleteId, error: "Sin macrociclo activo ni carrera objetivo" };
    }

    const distanceType = activePlan?.distanceType || primaryRace?.distance || "42k";
    const startDate = activePlan?.startDate || new Date().toISOString().split("T")[0];
    const totalWeeks = activePlan?.totalWeeks || 16;
    const periodization = activePlan?.periodization || "3:1";

    const upgradedBlueprint = generateCustomMacrocycleBlueprint({
      distanceType: distanceType as any,
      startDate,
      weeksCount: totalWeeks,
      customGoal: activePlan?.cycleTitle || primaryRace?.name || "Macrociclo Recalibrado",
      periodization: periodization as any,
      primaryRace: primaryRace || undefined,
      athleteMetrics: {
        ctl: profile.ctl || userData.ctl,
        atl: profile.atl || userData.atl,
        tsb: profile.tsb || userData.tsb,
        runFtp: profile.runFtp || userData.runFtp,
        bikeFtp: profile.bikeFtp || userData.bikeFtp,
        runningTrainingMode: profile.runningTrainingMode || userData.runningTrainingMode,
        hasRunningPowerMeter: profile.hasRunningPowerMeter ?? userData.hasRunningPowerMeter,
        weightKg: profile.weightKg || userData.weightKg,
        heightCm: profile.heightCm || userData.heightCm,
        restingHR: profile.restingHR || userData.restingHR,
        maxHR: profile.maxHR || userData.maxHR,
        lthr: profile.lthr || userData.lthr,
        age: profile.age || userData.age,
        gender: profile.gender || userData.gender,
        weeklyAvailability: userData.weeklyAvailability || profile.weeklyAvailability,
      },
    });

    const macrocycleId = await saveMacrocycleToFirestore(effectiveAthleteId, upgradedBlueprint, primaryRace, "WIZARD_CUSTOM");

    const updatedPlanItem = {
      id: `plan-${Date.now()}`,
      planName: upgradedBlueprint.cycleTitle,
      goalType: distanceType.toUpperCase(),
      blueprint: upgradedBlueprint,
      startDate: upgradedBlueprint.startDate,
      endDate: upgradedBlueprint.weeks[upgradedBlueprint.weeks.length - 1]?.endDate,
      totalWeeks: upgradedBlueprint.totalWeeks,
      status: "ACTIVE",
      orderIndex: 0,
      createdAt: new Date().toISOString(),
    };

    await userDoc.ref.update({
      seasonPlans: [updatedPlanItem],
      ...(primaryRace ? { targetRaces: [primaryRace] } : {}),
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      athleteId: effectiveAthleteId,
      macrocycleId,
      weeks: upgradedBlueprint.totalWeeks,
      primaryRace: primaryRace?.name,
    };
  } catch (err: any) {
    return { success: false, athleteId: athleteIdentifier, error: err?.message || "Error al recalibrar" };
  }
}

/**
 * Recalibra dinámicamente los atletas activos en base de datos.
 * Preserva retrocompatibilidad con la API de administración.
 */
export async function executeRecalibrateBoth(targetAthleteId?: string) {
  if (targetAthleteId) {
    const res = await recalibrateAthletePlan(targetAthleteId);
    return [res];
  }

  if (!adminDb) return [];

  const usersSnap = await adminDb.collection("users").get();
  const results: any[] = [];

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (Array.isArray(data.seasonPlans) && data.seasonPlans.length > 0) {
      const athId = data.intervalsAthleteId || doc.id;
      const res = await recalibrateAthletePlan(athId);
      results.push(res);
    }
  }

  return results;
}
