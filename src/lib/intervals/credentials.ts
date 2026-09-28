import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { isMasterAdminEmail } from "@/lib/env";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Resuelve de forma robusta y determinística las credenciales de Intervals.icu:
 * 1. Payload directo de la petición (si se suministra)
 * 2. Firestore por UID de usuario (desencriptación AES-256-GCM en memoria)
 * 3. Fallback a búsqueda por email en Firestore y documentos preauth_
 * 4. Fallback a variables de servidor SOLO para el Superadministrador (Germán Morales)
 */
export async function resolveIntervalsCredentials(params: {
  apiKey?: string;
  athleteId?: string;
  uid?: string;
  email?: string;
}): Promise<{ athleteId: string; apiKey: string }> {
  let athleteId = (params.athleteId || "").replace(/["']/g, "").trim();
  let apiKey = (params.apiKey || "").replace(/["']/g, "").trim();
  let userEmail = (params.email || "").trim();

  // 1. Si falta la clave o athleteId y se suministra UID, consultar Firestore desencriptando en memoria
  if (params.uid) {
    try {
      const userResult = await getUserProfileDecrypted(params.uid);
      if (userResult?.profile?.email) {
        userEmail = userResult.profile.email;
      }
      if (!apiKey && userResult?.decryptedApiKey) {
        apiKey = userResult.decryptedApiKey.replace(/["']/g, "").trim();
      }
      if (!athleteId && userResult?.profile?.intervalsAthleteId) {
        athleteId = userResult.profile.intervalsAthleteId.replace(/["']/g, "").trim();
      }
    } catch (e) {
      console.warn("Aviso al resolver credenciales desde Firestore por UID:", e);
    }
  }

  // 2. Si aún falta la clave o athleteId pero conocemos el email, buscar en Firestore por email o preauth
  if ((!apiKey || !athleteId) && userEmail && adminDb) {
    try {
      const cleanEmail = userEmail.toLowerCase();
      // Búsqueda por colección de usuarios con el mismo email
      const snap = await adminDb.collection("users").where("email", "==", cleanEmail).get();
      for (const d of snap.docs) {
        const uRes = await getUserProfileDecrypted(d.id);
        if (!apiKey && uRes?.decryptedApiKey) {
          apiKey = uRes.decryptedApiKey.replace(/["']/g, "").trim();
        }
        if (!athleteId && uRes?.profile?.intervalsAthleteId) {
          athleteId = uRes.profile.intervalsAthleteId.replace(/["']/g, "").trim();
        }
        if (apiKey && athleteId) break;
      }

      // Si aún falta, verificar documento preauth directo
      if (!apiKey || !athleteId) {
        const sanitizedEmailId = `preauth_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const preDoc = await getUserProfileDecrypted(sanitizedEmailId);
        if (!apiKey && preDoc?.decryptedApiKey) {
          apiKey = preDoc.decryptedApiKey.replace(/["']/g, "").trim();
        }
        if (!athleteId && preDoc?.profile?.intervalsAthleteId) {
          athleteId = preDoc.profile.intervalsAthleteId.replace(/["']/g, "").trim();
        }
      }
    } catch (e) {
      console.warn("Aviso al resolver credenciales por email en Firestore:", e);
    }
  }

  // 3. Solo el Superadministrador (Germán Morales) tiene fallback a las variables de entorno de i442091
  const isSuper = isMasterAdminEmail(userEmail);
  if (isSuper) {
    if (!apiKey) {
      apiKey = (process.env.INTERVALS_API_KEY || "").replace(/["']/g, "").trim();
    }
    if (!athleteId) {
      athleteId = (process.env.INTERVALS_ATHLETE_ID || "i442091").replace(/["']/g, "").trim();
    }
  } else {
    // BLINDAJE ABSOLUTO: Ningún atleta regular puede consultar la cuenta de Germán Morales (i442091)
    const masterApiKey = (process.env.INTERVALS_API_KEY || "").replace(/["']/g, "").trim();
    if (athleteId === "i442091" || (masterApiKey && apiKey === masterApiKey)) {
      athleteId = "";
      apiKey = "";
    }
  }

  return { athleteId, apiKey };
}
