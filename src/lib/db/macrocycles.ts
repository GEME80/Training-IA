import { adminDb } from "../firebase/admin";
import { MacrocycleBlueprint, TargetRace } from "../physiology/macrocycle";
import { sanitizeMacrocycleBlueprint } from "../physiology/macrocycleSanitizer";

export interface StoredMacrocycleData {
  id: string;
  athleteId: string;
  uid?: string;
  createdAt: string;
  updatedAt: string;
  blueprint: MacrocycleBlueprint;
  primaryRace?: TargetRace | null;
  isActive: boolean;
  notes?: string;
  source: "AI_GENERATED" | "WIZARD_CUSTOM" | "TEMPLATE_DEFAULT";
}

/**
 * Guarda un macrociclo generado o personalizado en Firestore para el atleta y lo unifica con su UID.
 */
export async function saveMacrocycleToFirestore(
  athleteId: string,
  blueprint: MacrocycleBlueprint,
  primaryRace?: TargetRace | null,
  source: "AI_GENERATED" | "WIZARD_CUSTOM" | "TEMPLATE_DEFAULT" = "WIZARD_CUSTOM",
  uid?: string
): Promise<string> {
  const macrocycleId = `macro_${Date.now()}`;
  const now = new Date().toISOString();
  const cleanBlueprint = sanitizeMacrocycleBlueprint(blueprint);

  const payload: StoredMacrocycleData = {
    id: macrocycleId,
    athleteId,
    uid,
    createdAt: now,
    updatedAt: now,
    blueprint: cleanBlueprint,
    primaryRace: primaryRace || cleanBlueprint.primaryRace,
    isActive: true,
    source,
  };

  if (adminDb) {
    try {
      const metaPayload = {
        activeMacrocycleId: macrocycleId,
        updatedAt: now,
        cycleTitle: cleanBlueprint.cycleTitle,
        totalWeeks: cleanBlueprint.totalWeeks,
        startDate: cleanBlueprint.startDate,
        primaryRace: primaryRace || cleanBlueprint.primaryRace,
      };

      // 1. Guardar en la subcolección del athleteId
      if (athleteId) {
        await adminDb.collection("users").doc(athleteId).collection("macrocycles").doc(macrocycleId).set(payload);
        await adminDb.collection("users").doc(athleteId).collection("meta").doc("active_macrocycle").set(metaPayload, { merge: true });
      }

      // 2. Unificación SSOT con el UID del usuario (si difiere de athleteId)
      if (uid && uid !== athleteId) {
        await adminDb.collection("users").doc(uid).collection("macrocycles").doc(macrocycleId).set(payload);
        await adminDb.collection("users").doc(uid).collection("meta").doc("active_macrocycle").set(metaPayload, { merge: true });
      }
    } catch (err) {
      console.warn("Aviso: No se pudo escribir en Firestore Admin, persistiendo en caché de sesión:", err);
    }
  }

  return macrocycleId;
}

/**
 * Obtiene el macrociclo activo de un atleta desde Firestore resolviendo por athleteId o UID.
 */
export async function getActiveMacrocycleFromFirestore(
  athleteIdentifier: string,
  uid?: string
): Promise<StoredMacrocycleData | null> {
  if (!adminDb) return null;

  try {
    const candidates = [athleteIdentifier, uid].filter(Boolean) as string[];

    for (const id of candidates) {
      const activeRef = adminDb.collection("users").doc(id).collection("meta").doc("active_macrocycle");
      const activeDoc = await activeRef.get();

      if (activeDoc.exists) {
        const activeId = activeDoc.data()?.activeMacrocycleId;
        if (activeId) {
          const macroDoc = await adminDb.collection("users").doc(id).collection("macrocycles").doc(activeId).get();
          if (macroDoc.exists) {
            const rawData = macroDoc.data() as StoredMacrocycleData;
            return {
              ...rawData,
              blueprint: sanitizeMacrocycleBlueprint(rawData.blueprint),
            };
          }
        }
      }
    }

    // Si no se encuentra directo, buscar si algún usuario tiene intervalsAthleteId === athleteIdentifier
    if (athleteIdentifier) {
      const querySnap = await adminDb.collection("users").where("profile.intervalsAthleteId", "==", athleteIdentifier).limit(1).get();
      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        const activeRef = userDoc.ref.collection("meta").doc("active_macrocycle");
        const activeDoc = await activeRef.get();
        if (activeDoc.exists) {
          const activeId = activeDoc.data()?.activeMacrocycleId;
          if (activeId) {
            const macroDoc = await userDoc.ref.collection("macrocycles").doc(activeId).get();
            if (macroDoc.exists) {
              const rawData = macroDoc.data() as StoredMacrocycleData;
              return {
                ...rawData,
                blueprint: sanitizeMacrocycleBlueprint(rawData.blueprint),
              };
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Aviso al leer macrociclo activo de Firestore:", err);
  }

  return null;
}
