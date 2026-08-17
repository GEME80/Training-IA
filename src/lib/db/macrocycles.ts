import { adminDb } from "../firebase/admin";
import { MacrocycleBlueprint, TargetRace } from "../physiology/macrocycle";

export interface StoredMacrocycleData {
  id: string;
  athleteId: string;
  createdAt: string;
  updatedAt: string;
  blueprint: MacrocycleBlueprint;
  primaryRace?: TargetRace | null;
  isActive: boolean;
  notes?: string;
  source: "AI_GENERATED" | "WIZARD_CUSTOM" | "TEMPLATE_DEFAULT";
}

/**
 * Guarda un macrociclo generado o personalizado en Firestore para el atleta.
 */
export async function saveMacrocycleToFirestore(
  athleteId: string,
  blueprint: MacrocycleBlueprint,
  primaryRace?: TargetRace | null,
  source: "AI_GENERATED" | "WIZARD_CUSTOM" | "TEMPLATE_DEFAULT" = "WIZARD_CUSTOM"
): Promise<string> {
  const macrocycleId = `macro_${Date.now()}`;
  const now = new Date().toISOString();

  const payload: StoredMacrocycleData = {
    id: macrocycleId,
    athleteId,
    createdAt: now,
    updatedAt: now,
    blueprint,
    primaryRace: primaryRace || blueprint.primaryRace,
    isActive: true,
    source,
  };

  if (adminDb) {
    try {
      // 1. Guardar en la subcolección de macrociclos
      const macroRef = adminDb.collection("users").doc(athleteId).collection("macrocycles").doc(macrocycleId);
      await macroRef.set(payload);

      // 2. Establecer como macrociclo activo en el perfil principal
      const activeRef = adminDb.collection("users").doc(athleteId).collection("meta").doc("active_macrocycle");
      await activeRef.set({
        activeMacrocycleId: macrocycleId,
        updatedAt: now,
        cycleTitle: blueprint.cycleTitle,
        totalWeeks: blueprint.totalWeeks,
        startDate: blueprint.startDate,
        primaryRace: primaryRace || blueprint.primaryRace,
      }, { merge: true });
    } catch (err) {
      console.warn("Aviso: No se pudo escribir en Firestore Admin, persistiendo en caché de sesión:", err);
    }
  }

  return macrocycleId;
}

/**
 * Obtiene el macrociclo activo de un atleta desde Firestore.
 */
export async function getActiveMacrocycleFromFirestore(
  athleteId: string
): Promise<StoredMacrocycleData | null> {
  if (!adminDb) return null;

  try {
    const activeRef = adminDb.collection("users").doc(athleteId).collection("meta").doc("active_macrocycle");
    const activeDoc = await activeRef.get();

    if (activeDoc.exists) {
      const activeId = activeDoc.data()?.activeMacrocycleId;
      if (activeId) {
        const macroDoc = await adminDb
          .collection("users")
          .doc(athleteId)
          .collection("macrocycles")
          .doc(activeId)
          .get();

        if (macroDoc.exists) {
          return macroDoc.data() as StoredMacrocycleData;
        }
      }
    }
  } catch (err) {
    console.warn("Aviso al leer macrociclo activo de Firestore:", err);
  }

  return null;
}
