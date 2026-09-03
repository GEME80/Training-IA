import { adminDb } from "../firebase/admin";
import { encryptSensitiveData, decryptSensitiveData } from "../crypto";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "../gemini/engine";
import { isMasterAdminEmail, getSuperadminEmail } from "../env";
import { UserProfileData, UserRole, UserStatus } from "./types";

// Re-exportación completa de tipos y módulos para mantener 100% de retrocompatibilidad
export * from "./types";
export * from "./adminUsers";
export * from "./decisionLogs";

/**
 * Sincroniza o crea el usuario en Firestore al iniciar sesión con Google.
 * Si coincide con el superadministrador:
 *   - Asigna inmediatamente rol: "admin" y status: "active"
 *   - Vincula las métricas fisiológicas completas del atleta rector.
 * Para cualquier otro usuario:
 *   - Registra como "athlete" con status: "pending" (o según pre-autorizaciones).
 */
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
}

export async function syncUserFromGoogleAuth(userData: {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<UserProfileData> {
  const now = new Date().toISOString();
  const isSuperadmin = isMasterAdminEmail(userData.email);

  if (!adminDb) {
    // Fallback en memoria si Firebase Admin no está inicializado en entorno local
    return {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || (isSuperadmin ? "Germán Morales" : "Atleta"),
      photoURL: userData.photoURL || undefined,
      role: isSuperadmin ? "admin" : "athlete",
      status: isSuperadmin ? "active" : "pending",
      intervalsAthleteId: isSuperadmin ? (process.env.INTERVALS_ATHLETE_ID || "i442091") : undefined,
      weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
    };
  }

  const userRef = adminDb.collection("users").doc(userData.uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    // Verificar si existía un pre-registro o whitelist para este correo
    let preAuthRole: UserRole = isSuperadmin ? "admin" : "athlete";
    let preAuthStatus: UserStatus = isSuperadmin ? "active" : "pending";
    let preAuthAthleteId = isSuperadmin ? (process.env.INTERVALS_ATHLETE_ID || "i442091") : undefined;
    let preAuthRunFtp: number | undefined = undefined;
    let preAuthBikeFtp: number | undefined = undefined;

    const sanitizedEmailId = `preauth_${userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
    const preAuthRef = adminDb.collection("users").doc(sanitizedEmailId);
    const preAuthDoc = await preAuthRef.get();

    if (preAuthDoc.exists) {
      const pData = preAuthDoc.data();
      if (pData) {
        preAuthRole = pData.role || preAuthRole;
        preAuthStatus = pData.status || "active";
        preAuthAthleteId = pData.intervalsAthleteId || preAuthAthleteId;
        preAuthRunFtp = pData.runFtp || preAuthRunFtp;
        preAuthBikeFtp = pData.bikeFtp || preAuthBikeFtp;
      }
      await preAuthRef.delete().catch(() => {});
    }

    // Migrar datos funcionales (Stryd CP, Bike FTP) de documentos anteriores con el mismo email
    const emailSnap = await adminDb.collection("users").where("email", "==", userData.email.toLowerCase()).get();
    let existingData: Partial<UserProfileData> = {};
    if (!emailSnap.empty) {
      for (const d of emailSnap.docs) {
        if (d.id !== userData.uid) {
          const dData = d.data() as UserProfileData;
          if ((dData.runFtp || 0) > (existingData.runFtp || 0)) existingData.runFtp = dData.runFtp;
          if ((dData.bikeFtp || 0) > (existingData.bikeFtp || 0)) existingData.bikeFtp = dData.bikeFtp;
          if (dData.encryptedApiKey) existingData.encryptedApiKey = dData.encryptedApiKey;
          if (dData.intervalsAthleteId) existingData.intervalsAthleteId = dData.intervalsAthleteId;
          await d.ref.delete().catch(() => {});
        }
      }
    }

    // Registro de nuevo usuario consolidado
    const newProfile: UserProfileData = {
      uid: userData.uid,
      email: userData.email.toLowerCase(),
      displayName: userData.displayName || (isSuperadmin ? "Germán Morales" : "Atleta"),
      photoURL: userData.photoURL || undefined,
      role: preAuthRole,
      status: preAuthStatus,
      intervalsAthleteId: existingData.intervalsAthleteId || preAuthAthleteId,
      encryptedApiKey: existingData.encryptedApiKey,
      runFtp: existingData.runFtp || preAuthRunFtp,
      bikeFtp: existingData.bikeFtp || preAuthBikeFtp,
      weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
    };

    await userRef.set(stripUndefined(newProfile));
    return newProfile;
  }

  // Usuario existente: actualizar último inicio de sesión y datos básicos
  const existing = doc.data() as UserProfileData;
  const updates: Partial<UserProfileData> = {
    lastLoginAt: now,
    displayName: userData.displayName || existing.displayName,
    updatedAt: now,
  };

  if (userData.photoURL) {
    updates.photoURL = userData.photoURL;
  }

  if (isSuperadmin) {
    if (existing.role !== "admin") updates.role = "admin";
    if (existing.status !== "active") updates.status = "active";
    if (!existing.intervalsAthleteId) updates.intervalsAthleteId = process.env.INTERVALS_ATHLETE_ID || "i442091";
  }

  await userRef.set(stripUndefined(updates), { merge: true });
  return { ...existing, ...updates };
}

/**
 * Guarda o actualiza el perfil de un usuario, cifrando la API Key de Intervals con AES-256-GCM.
 */
export async function saveUserProfile(
  uid: string,
  data: {
    email?: string;
    displayName?: string;
    photoURL?: string;
    intervalsAthleteId?: string;
    rawApiKey?: string;
    runFtp?: number;
    bikeFtp?: number;
    restingHR?: number;
    maxHR?: number;
    lthr?: number;
    weightKg?: number;
    heightCm?: number;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    targetEventDate?: string;
    trainingFocus?: "MAINTENANCE" | "BUILD" | "MARATHON" | "TRIATHLON";
    weeklyAvailability?: WeeklyAvailabilityMap;
    visibleMetrics?: string[];
    targetRaces?: any[];
    seasonPlans?: any[];
  }
): Promise<void> {
  if (!adminDb) {
    return;
  }

  try {
    const userRef = adminDb.collection("users").doc(uid);
    const existingDoc = await userRef.get();
    const existingData = (existingDoc.exists ? existingDoc.data() : {}) as Partial<UserProfileData>;

    const payloadToSave: Partial<UserProfileData> = {
      uid,
      email: data.email ?? existingData?.email ?? "atleta@pulse.ai",
      displayName: data.displayName ?? existingData?.displayName ?? "Atleta",
      photoURL: data.photoURL ?? existingData?.photoURL,
      role: existingData?.role ?? (isMasterAdminEmail(data.email) ? "admin" : "athlete"),
      status: existingData?.status ?? (isMasterAdminEmail(data.email) ? "active" : "pending"),
      intervalsAthleteId: data.intervalsAthleteId ?? existingData?.intervalsAthleteId,
      runFtp: data.runFtp ?? existingData?.runFtp,
      bikeFtp: data.bikeFtp ?? existingData?.bikeFtp,
      restingHR: data.restingHR ?? existingData?.restingHR,
      maxHR: data.maxHR ?? existingData?.maxHR,
      lthr: data.lthr ?? existingData?.lthr,
      weightKg: data.weightKg ?? existingData?.weightKg,
      heightCm: data.heightCm ?? existingData?.heightCm,
      birthDate: data.birthDate ?? existingData?.birthDate,
      gender: data.gender ?? existingData?.gender,
      targetEventDate: data.targetEventDate ?? existingData?.targetEventDate,
      trainingFocus: data.trainingFocus ?? existingData?.trainingFocus ?? "BUILD",
      weeklyAvailability: data.weeklyAvailability ?? existingData?.weeklyAvailability ?? DEFAULT_WEEKLY_AVAILABILITY,
      visibleMetrics: data.visibleMetrics ?? existingData?.visibleMetrics,
      targetRaces: data.targetRaces ?? existingData?.targetRaces,
      seasonPlans: data.seasonPlans ?? existingData?.seasonPlans,
      createdAt: existingData?.createdAt ?? new Date().toISOString(),
      lastLoginAt: existingData?.lastLoginAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Cifrado simétrico AES-256-GCM para la API Key de Intervals
    if (data.rawApiKey && data.rawApiKey.trim().length > 0) {
      payloadToSave.encryptedApiKey = encryptSensitiveData(data.rawApiKey.trim());
    }

    await userRef.set(stripUndefined(payloadToSave), { merge: true });
  } catch (err) {
    console.warn("Aviso: Guardado en Firestore omitido en modo local:", err instanceof Error ? err.message : err);
  }
}

/**
 * Obtiene el perfil de un usuario y desencripta la clave de Intervals solo en memoria del servidor.
 */
export async function getUserProfileDecrypted(
  uid: string
): Promise<{ profile: UserProfileData; decryptedApiKey: string | null } | null> {
  const superadminEmail = getSuperadminEmail();

  if (uid === "superadmin-root") {
    return {
      profile: {
        uid,
        email: superadminEmail,
        displayName: "Germán Morales",
        role: "admin",
        status: "active",
        intervalsAthleteId: process.env.INTERVALS_ATHLETE_ID || "i442091",
        createdAt: "2026-08-01T00:00:00.000Z",
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      decryptedApiKey: process.env.INTERVALS_API_KEY || null,
    };
  }

  if (!adminDb) {
    return null;
  }

  try {
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
  } catch (err) {
    console.warn(`Aviso al consultar usuario ${uid} en Firestore adminDb:`, err);
    return null;
  }
}
