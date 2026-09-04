import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { isMasterAdminEmail } from "@/lib/env";

/**
 * Resuelve de forma robusta y determinística las credenciales de Intervals.icu:
 * 1. Payload directo de la petición (si se suministra)
 * 2. Firestore por UID de usuario (desencriptación AES-256-GCM en memoria)
 * 3. Fallback a variables de servidor SOLO para el Superadministrador (Germán Morales)
 */
export async function resolveIntervalsCredentials(params: {
  apiKey?: string;
  athleteId?: string;
  uid?: string;
}): Promise<{ athleteId: string; apiKey: string }> {
  let athleteId = (params.athleteId || "").replace(/["']/g, "").trim();
  let apiKey = (params.apiKey || "").replace(/["']/g, "").trim();
  let userEmail = "";

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
      console.warn("Aviso al resolver credenciales desde Firestore:", e);
    }
  }

  // 2. Solo el Superadministrador (Germán Morales) tiene fallback a las variables de entorno de i442091
  const isSuper = isMasterAdminEmail(userEmail);
  if (isSuper) {
    if (!apiKey) {
      apiKey = (process.env.INTERVALS_API_KEY || "48eje8t1wnj95t0sbjx2oumkq").replace(/["']/g, "").trim();
    }
    if (!athleteId) {
      athleteId = (process.env.INTERVALS_ATHLETE_ID || "i442091").replace(/["']/g, "").trim();
    }
  } else {
    // BLINDAJE ABSOLUTO: Ningún atleta regular puede consultar la cuenta de Germán Morales (i442091)
    if (athleteId === "i442091" || apiKey === (process.env.INTERVALS_API_KEY || "48eje8t1wnj95t0sbjx2oumkq")) {
      athleteId = "";
      apiKey = "";
    }
  }

  return { athleteId, apiKey };
}
