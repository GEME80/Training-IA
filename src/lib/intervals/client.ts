import {
  AthleteProfile,
  AthleteWellness,
  CalendarEvent,
  ActivitySummary,
} from "./types";

const BASE_URL = "https://intervals.icu/api/v1";

/**
 * Genera el encabezado HTTP de Basic Auth requerido por Intervals.icu.
 */
function getAuthHeader(apiKey: string): Record<string, string> {
  const credentials = Buffer.from(`API_KEY:${apiKey}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
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
    this.athleteId = athleteId.trim();
    this.apiKey = apiKey.trim();
  }

  /**
   * Verifica la validez de las credenciales consultando el perfil del atleta.
   */
  async testConnection(): Promise<{ success: boolean; athleteName?: string; error?: string }> {
    try {
      const athlete = await this.getAthlete();
      return {
        success: true,
        athleteName: athlete.name || athlete.id,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido de conexión";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene el perfil completo del atleta con umbrales y métricas de rendimiento (CTL, ATL, TSB).
   */
  async getAthlete(): Promise<AthleteProfile> {
    const res = await fetch(`${BASE_URL}/athlete/${this.athleteId}`, {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Error al consultar atleta (${res.status}): ${res.statusText}`
      );
    }

    return (await res.json()) as AthleteProfile;
  }

  /**
   * Obtiene la serie temporal de Wellness (HRV, RHR, Fatiga, Ramp Rate) en un rango de fechas.
   * @param oldest Fecha inicial YYYY-MM-DD
   * @param newest Fecha final YYYY-MM-DD
   */
  async getWellness(oldest: string, newest: string): Promise<AthleteWellness[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/wellness`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Error al consultar métricas de bienestar (${res.status}): ${res.statusText}`
      );
    }

    return (await res.json()) as AthleteWellness[];
  }

  /**
   * Consulta los eventos y sesiones programadas en el calendario.
   */
  async getEvents(oldest: string, newest: string): Promise<CalendarEvent[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/events`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Error al consultar eventos del calendario (${res.status}): ${res.statusText}`
      );
    }

    return (await res.json()) as CalendarEvent[];
  }

  /**
   * Publica un nuevo entrenamiento estructurado en el calendario de Intervals.icu.
   */
  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const res = await fetch(`${BASE_URL}/athlete/${this.athleteId}/events`, {
      method: "POST",
      headers: getAuthHeader(this.apiKey),
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(
        `Error al crear entrenamiento (${res.status}): ${errorBody || res.statusText}`
      );
    }

    return (await res.json()) as CalendarEvent;
  }

  /**
   * Elimina un evento/entrenamiento del calendario por su ID.
   */
  async deleteEvent(eventId: number): Promise<void> {
    const res = await fetch(
      `${BASE_URL}/athlete/${this.athleteId}/events/${eventId}`,
      {
        method: "DELETE",
        headers: getAuthHeader(this.apiKey),
      }
    );

    if (!res.ok && res.status !== 404) {
      throw new Error(
        `Error al eliminar evento ${eventId} (${res.status}): ${res.statusText}`
      );
    }
  }

  /**
   * Obtiene el listado de actividades completadas con su telemetría y TSS real ejecutado.
   */
  async getActivities(oldest: string, newest: string): Promise<ActivitySummary[]> {
    const url = new URL(`${BASE_URL}/athlete/${this.athleteId}/activities`);
    url.searchParams.set("oldest", oldest);
    url.searchParams.set("newest", newest);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeader(this.apiKey),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Error al consultar actividades ejecutadas (${res.status}): ${res.statusText}`
      );
    }

    return (await res.json()) as ActivitySummary[];
  }
}
