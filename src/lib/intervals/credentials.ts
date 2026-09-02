import { getUserProfileDecrypted } from "@/lib/db/userProfile";

/**
 * Resuelve de forma robusta y determinística las credenciales de Intervals.icu:
 * 1. Payload directo de la petición (si se suministra)
 * 2. Firestore por UID de usuario (desencriptación AES-256-GCM en memoria)
 * 3. Variables de entorno del servidor (.env.local / process.env)
 */
export async function resolveIntervalsCredentials(params: {
  apiKey?: string;
  athleteId?: string;
  uid?: string;
}): Promise<{ athleteId: string; apiKey: string }> {
  let athleteId = (params.athleteId || "").replace(/["']/g, "").trim();
  let apiKey = (params.apiKey || "").replace(/["']/g, "").trim();

  // 1. Si falta la clave y se suministra UID, consultar Firestore desencriptando en memoria
  if (!apiKey && params.uid) {
    try {
      const userResult = await getUserProfileDecrypted(params.uid);
      if (userResult?.decryptedApiKey) {
        apiKey = userResult.decryptedApiKey.replace(/["']/g, "").trim();
      }
      if (!athleteId && userResult?.profile?.intervalsAthleteId) {
        athleteId = userResult.profile.intervalsAthleteId.replace(/["']/g, "").trim();
      }
    } catch (e) {
      console.warn("Aviso al resolver credenciales desde Firestore:", e);
    }
  }

  // 2. Si falta la clave o el ID, usar fallback de variables de entorno del servidor (privadas)
  if (!apiKey) {
    apiKey = (process.env.INTERVALS_API_KEY || "").replace(/["']/g, "").trim();
  }

  if (!athleteId) {
    athleteId = (process.env.INTERVALS_ATHLETE_ID || "").replace(/["']/g, "").trim();
  }

  return { athleteId, apiKey };
}
