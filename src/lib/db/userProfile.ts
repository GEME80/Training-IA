import { adminDb } from "../firebase/admin";
import { encryptSensitiveData, decryptSensitiveData, EncryptedPayload } from "../crypto";

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  intervalsAthleteId?: string;
  encryptedApiKey?: EncryptedPayload;
  runFtp?: number; // Stryd CP (W)
  bikeFtp?: number; // Bike FTP (W)
  targetEventDate?: string;
  trainingFocus?: "MAINTENANCE" | "BUILD" | "MARATHON" | "TRIATHLON";
  updatedAt: string;
}

export interface DecisionLog {
  id: string;
  timestamp: string;
  evaluationDate: string;
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  reasoningTree: string[];
  adjustmentsApplied: boolean;
  appliedAdjustments?: Array<{
    day: string;
    workoutName: string;
    type: string;
    action: "MODIFIED" | "KEPT" | "REST_REPLACED";
  }>;
}

/**
 * Guarda o actualiza el perfil de un usuario, cifrando la API Key con AES-256-GCM.
 */
export async function saveUserProfile(
  uid: string,
  data: {
    email: string;
    displayName?: string;
    photoURL?: string;
    intervalsAthleteId?: string;
    rawApiKey?: string;
    runFtp?: number;
    bikeFtp?: number;
    targetEventDate?: string;
    trainingFocus?: "MAINTENANCE" | "BUILD" | "MARATHON" | "TRIATHLON";
  }
): Promise<void> {
  if (!adminDb) {
    throw new Error("Firebase Admin Firestore no está inicializado.");
  }

  const userRef = adminDb.collection("users").doc(uid);
  const existingDoc = await userRef.get();
  const existingData = existingDoc.exists ? existingDoc.data() : {};

  const payloadToSave: Partial<UserProfileData> = {
    uid,
    email: data.email,
    displayName: data.displayName ?? existingData?.displayName,
    photoURL: data.photoURL ?? existingData?.photoURL,
    intervalsAthleteId: data.intervalsAthleteId ?? existingData?.intervalsAthleteId,
    runFtp: data.runFtp ?? existingData?.runFtp ?? 280,
    bikeFtp: data.bikeFtp ?? existingData?.bikeFtp ?? 250,
    targetEventDate: data.targetEventDate ?? existingData?.targetEventDate,
    trainingFocus: data.trainingFocus ?? existingData?.trainingFocus ?? "BUILD",
    updatedAt: new Date().toISOString(),
  };

  // Cifrado simétrico si se provee una nueva API Key
  if (data.rawApiKey && data.rawApiKey.trim().length > 0) {
    payloadToSave.encryptedApiKey = encryptSensitiveData(data.rawApiKey.trim());
  }

  await userRef.set(payloadToSave, { merge: true });
}

/**
 * Obtiene el perfil de un usuario y desencripta la clave de Intervals solo en memoria del servidor.
 */
export async function getUserProfileDecrypted(
  uid: string
): Promise<{ profile: UserProfileData; decryptedApiKey: string | null } | null> {
  if (!adminDb) {
    throw new Error("Firebase Admin Firestore no está inicializado.");
  }

  const userRef = adminDb.collection("users").doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    return null;
  }

  const profile = doc.data() as UserProfileData;
  let decryptedApiKey: string | null = null;

  if (profile.encryptedApiKey) {
    try {
      decryptedApiKey = decryptSensitiveData(profile.encryptedApiKey);
    } catch (err) {
      console.error("Error al descifrar API Key del usuario:", err);
    }
  }

  return {
    profile,
    decryptedApiKey,
  };
}

/**
 * Registra un log de auditoría y decisión del agente inteligente en Firestore.
 */
export async function logAgentDecision(
  uid: string,
  log: Omit<DecisionLog, "id">
): Promise<string> {
  if (!adminDb) {
    throw new Error("Firebase Admin Firestore no está inicializado.");
  }

  const logRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("decision_logs")
    .doc();

  await logRef.set({
    ...log,
    id: logRef.id,
  });

  return logRef.id;
}
