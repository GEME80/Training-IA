import dns from "node:dns";
import { AthleteProfile, AthleteWellness, CalendarEvent, ActivitySummary } from "./types";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

const BASE_URL = "https://intervals.icu/api/v1";

function getAuthHeader(apiKey: string): Record<string, string> {
  const credentials = Buffer.from(`API_KEY:${apiKey}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "PulseAI-SGEA/2.0 (Macintosh; Intel Mac OS X; athlete-sync)",
  };
}

/**
 * Cliente seguro de comunicación REST con Intervals.icu API v1.
 */
export class IntervalsClient {
  private athleteId: string;
  private apiKey: string;

  constructor(athleteId: string, apiKey: string) {
    if (!athleteId || !apiKey) {
      throw new Error("IntervalsClient requiere athleteId y apiKey válidos.");
    }
    this.athleteId = athleteId.replace(/["']/g, "").trim();
    this.apiKey = apiKey.replace(/["']/g, "").trim();
  }

  /**
   * Verifica la validez de las credenciales consultando el perfil del atleta y extrayendo sus parámetros biométricos.
   */
  async testConnection(): Promise<{
    success: boolean;
    athleteName?: string;
    athleteId?: string;
    city?: string;
    gender?: "M" | "F" | "OTHER";
    runFtp?: number;
    bikeFtp?: number;
    restingHR?: number;
    maxHR?: number;
    lthr?: number;
    swimCssSecPer100m?: number;
    swimCssStr?: string;
    weight?: number;
    heightCm?: number;
    athlete?: AthleteProfile;
    error?: string;
  }> {
    try {
      const athlete = await this.getAthlete();
      const anyAthlete = athlete as unknown as Record<string, unknown>;
      const athleteName = athlete.name || athlete.id || "Atleta";

      const sports = (anyAthlete.sportSettings as Array<Record<string, unknown>>) || [];
      const runSport = sports.find((s) => {
        const types = s.types as string[] | undefined;
        return types?.some((t) => /run|running|virtualrun|trailrun/i.test(t)) || /run/i.test(String(s.id));
      });
      const rideSport = sports.find((s) => {
        const types = s.types as string[] | undefined;
        return types?.some((t) => /ride|cycling|bike|virtualride/i.test(t)) || /ride|cycling|bike/i.test(String(s.id));
      });
      const swimSport = sports.find((s) => {
        const types = s.types as string[] | undefined;
        return types?.some((t) => /swim|swimming|openwater/i.test(t)) || /swim/i.test(String(s.id));
      });

      const mmpModel = runSport?.mmp_model as { criticalPower?: number } | undefined;
      const runFtp = mmpModel?.criticalPower || (runSport?.ftp as number) || (anyAthlete.icu_running_ftp as number) || (anyAthlete.run_ftp as number) || undefined;
      const bikeFtp = (rideSport?.ftp as number) || (anyAthlete.icu_ftp as number) || (anyAthlete.bike_ftp as number) || undefined;
      const restingHR = (anyAthlete.icu_resting_hr as number) || (anyAthlete.restingHR as number) || undefined;
      const lthr = (runSport?.lthr as number) || (rideSport?.lthr as number) || (anyAthlete.lthr as number) || undefined;
      const maxHR = (runSport?.max_hr as number) || (rideSport?.max_hr as number) || (anyAthlete.max_hr as number) || (anyAthlete.maxHR as number) || undefined;
      
      const swimThresholdPace = (swimSport?.threshold_pace as number) || (anyAthlete.swim_threshold_pace as number) || undefined;
      let swimCssSecPer100m: number | undefined = undefined;
      let swimCssStr: string | undefined = undefined;
      if (typeof swimThresholdPace === "number" && swimThresholdPace > 0) {
        swimCssSecPer100m = Math.round(100 / swimThresholdPace);
        const mins = Math.floor(swimCssSecPer100m / 60);
        const secs = Math.round(swimCssSecPer100m % 60);
        swimCssStr = `${mins}:${String(secs).padStart(2, "0")}`;
      }

      const weight = (anyAthlete.icu_weight as number) || (anyAthlete.weight as number) || undefined;
      const rawHeight = (anyAthlete.icu_height as number) || (anyAthlete.height as number) || undefined;
      const heightCm = rawHeight ? (rawHeight < 3 ? Math.round(rawHeight * 100) : Math.round(rawHeight)) : undefined;
      const rawSex = anyAthlete.sex || anyAthlete.gender || anyAthlete.icu_gender;
      const normSex = typeof rawSex === "string" ? rawSex.trim().toUpperCase() : "";
      const gender: "M" | "F" | "OTHER" | undefined = /^(M|MALE|HOMBRE)$/.test(normSex) ? "M" : /^(F|FEMALE|MUJER)$/.test(normSex) ? "F" : /^(OTHER|OTRO)$/.test(normSex) ? "OTHER" : undefined;
      const city = (anyAthlete.city as string) || undefined;

      return {
        success: true,
        athleteName,
        athleteId: athlete.id || this.athleteId,
        city,
        gender,
        runFtp: typeof runFtp === "number" ? runFtp : undefined,
        bikeFtp: typeof bikeFtp === "number" ? bikeFtp : undefined,
        restingHR: typeof restingHR === "number" ? restingHR : undefined,
        maxHR: typeof maxHR === "number" ? maxHR : undefined,
        lthr: typeof lthr === "number" ? lthr : undefined,
        swimCssSecPer100m,
        swimCssStr,
        weight: typeof weight === "number" ? weight : undefined,
        heightCm: typeof heightCm === "number" ? heightCm : undefined,
        athlete,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido de conexión";
      const cause = (err as any)?.cause ? ((err as any).cause.message || (err as any).cause.code || String((err as any).cause)) : undefined;
      console.error(`[IntervalsClient] testConnection falló: ${errorMessage}`, cause);
      return { success: false, error: cause ? `${errorMessage} (${cause})` : errorMessage };
    }
  }

  private async safeFetch(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) });
    } catch (err: unknown) {
      console.warn(`[IntervalsClient] Reintentando fetch a ${url}... Error previo:`, err instanceof Error ? err.message : err);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000) });
    }
  }

  async getAthlete(): Promise<AthleteProfile> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}`, {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
    });
    if (!res.ok) throw new Error(`Error al consultar atleta (${res.status}): ${res.statusText}`);
    return (await res.json()) as AthleteProfile;
  }

  async getWellness(oldest: string, newest: string): Promise<AthleteWellness[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/wellness`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);
    const res = await this.safeFetch(url.toString(), { method: "GET", headers: getAuthHeader(this.apiKey) });
    if (!res.ok) throw new Error(`Error al consultar métricas de bienestar (${res.status}): ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({ ...item, id: item.id || item.date, date: item.date || item.id })) as AthleteWellness[];
  }

  async getEvents(oldest: string, newest: string): Promise<CalendarEvent[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/events`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);
    const res = await this.safeFetch(url.toString(), { method: "GET", headers: getAuthHeader(this.apiKey) });
    if (!res.ok) throw new Error(`Error al consultar eventos del calendario (${res.status}): ${res.statusText}`);
    return (await res.json()) as CalendarEvent[];
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}/events`, {
      method: "POST",
      headers: getAuthHeader(this.apiKey),
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error al crear entrenamiento (${res.status}): ${errorBody || res.statusText}`);
    }
    return (await res.json()) as CalendarEvent;
  }

  async deleteEvent(eventId: number): Promise<void> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}/events/${eventId}`, {
      method: "DELETE",
      headers: getAuthHeader(this.apiKey),
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Error al eliminar evento ${eventId} (${res.status}): ${res.statusText}`);
    }
  }

  async getActivities(oldest: string, newest: string): Promise<ActivitySummary[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/activities`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);
    const res = await this.safeFetch(url.toString(), { method: "GET", headers: getAuthHeader(this.apiKey) });
    if (!res.ok) throw new Error(`Error al consultar actividades ejecutadas (${res.status}): ${res.statusText}`);
    return (await res.json()) as ActivitySummary[];
  }

  async getSportSettings(): Promise<any[]> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}/sport-settings`, {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
    });
    if (!res.ok) throw new Error(`Error al consultar sport-settings (${res.status}): ${res.statusText}`);
    return (await res.json()) as any[];
  }

  async updateSportSettings(sportId: string, settingsData: Record<string, any>): Promise<any> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}/sport-settings/${sportId}`, {
      method: "PUT",
      headers: getAuthHeader(this.apiKey),
      body: JSON.stringify(settingsData),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error al actualizar sport-settings (${res.status}): ${errText || res.statusText}`);
    }
    return await res.json();
  }

  async updateAthlete(athleteData: Record<string, any>): Promise<AthleteProfile> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}`, {
      method: "PUT",
      headers: getAuthHeader(this.apiKey),
      body: JSON.stringify(athleteData),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error al actualizar perfil del atleta (${res.status}): ${errText || res.statusText}`);
    }
    return (await res.json()) as AthleteProfile;
  }

  async updateWellness(date: string, data: Record<string, any>): Promise<any> {
    const res = await this.safeFetch(`${BASE_URL}/athlete/${this.athleteId}/wellness/${date}`, {
      method: "PUT",
      headers: getAuthHeader(this.apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error al actualizar wellness ${date} (${res.status}): ${errText || res.statusText}`);
    }
    return await res.json();
  }

  async getActivityStreams(
    activityId: string,
    types: string[] = ["time", "heartrate", "watts", "velocity_smooth", "cadence", "altitude"]
  ): Promise<any[]> {
    const url = new URL(`${BASE_URL}/activity/${activityId}/streams`);
    if (types.length > 0) url.searchParams.set("types", types.join(","));
    const res = await this.safeFetch(url.toString(), { method: "GET", headers: getAuthHeader(this.apiKey) });
    if (!res.ok) {
      throw new Error(`Error al consultar streams de actividad ${activityId} (${res.status}): ${res.statusText}`);
    }
    return (await res.json()) as any[];
  }
}
