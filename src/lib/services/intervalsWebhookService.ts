import { adminDb } from "@/lib/firebase/admin";

export interface IntervalsWebhookEvent {
  athlete_id: string;
  type: "ACTIVITY_UPLOADED" | "ACTIVITY_ANALYZED" | "ACTIVITY_DELETED" | "CALENDAR_UPDATED" | "WELLNESS_UPDATED" | string;
  timestamp?: string;
  activity?: {
    id?: string | number;
    name?: string;
    type?: string;
    start_date_local?: string;
    icu_training_load?: number;
    distance?: number;
    moving_time?: number;
    [key: string]: any;
  };
  wellness?: Record<string, any>;
  event?: Record<string, any>;
}

export interface IntervalsWebhookPayload {
  secret?: string;
  events?: IntervalsWebhookEvent[];
}

export interface ProcessWebhookResult {
  success: boolean;
  receivedCount: number;
  matchedAthletes: number;
  reason?: string;
}

export class IntervalsWebhookService {
  /**
   * Valida la autenticidad del webhook de Intervals.icu contra el secreto configurado
   */
  static validateSecret(receivedSecret?: string): boolean {
    const configuredSecret = process.env.INTERVALS_WEBHOOK_SECRET || "pulse_intervals_whsec_2026";
    if (!receivedSecret) return false;
    return receivedSecret.trim() === configuredSecret.trim();
  }

  /**
   * Procesa los eventos entrantes del webhook de Intervals.icu
   */
  static async processPayload(payload: IntervalsWebhookPayload): Promise<ProcessWebhookResult> {
    if (!payload.events || !Array.isArray(payload.events) || payload.events.length === 0) {
      return { success: true, receivedCount: 0, matchedAthletes: 0 };
    }

    if (!adminDb) {
      console.warn("[IntervalsWebhook] Firestore Admin no disponible. Omitiendo persistencia de eventos.");
      return { success: true, receivedCount: payload.events.length, matchedAthletes: 0, reason: "NO_DB" };
    }

    let matchedAthletes = 0;
    const nowIso = new Date().toISOString();

    for (const ev of payload.events) {
      const athleteId = ev.athlete_id?.trim();
      if (!athleteId) continue;

      try {
        // 1. Buscar usuario por intervalsAthleteId directo
        let userSnap = await adminDb.collection("users").where("intervalsAthleteId", "==", athleteId).limit(1).get();

        // 2. Fallback a profile.intervalsAthleteId si no se halla en raíz
        if (userSnap.empty) {
          userSnap = await adminDb.collection("users").where("profile.intervalsAthleteId", "==", athleteId).limit(1).get();
        }

        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          matchedAthletes++;

          const eventSummary = {
            type: ev.type,
            timestamp: ev.timestamp || nowIso,
            receivedAt: nowIso,
            activityId: ev.activity?.id ? String(ev.activity.id) : null,
            activityName: ev.activity?.name || null,
            activityType: ev.activity?.type || null,
            trainingLoad: typeof ev.activity?.icu_training_load === "number" ? ev.activity.icu_training_load : null,
          };

          let newNotif: any = null;
          if (ev.type === "ACTIVITY_ANALYZED" || ev.type === "ACTIVITY_UPLOADED") {
            const isRun = /run|carrera|trote/i.test(`${ev.activity?.type} ${ev.activity?.name}`);
            const isRide = /ride|bici|ciclismo/i.test(`${ev.activity?.type} ${ev.activity?.name}`);
            const isSwim = /swim|nado|nataci/i.test(`${ev.activity?.type} ${ev.activity?.name}`);
            const icon = isRun ? "🏃‍♂️" : isRide ? "🚴‍♂️" : isSwim ? "🏊‍♂️" : "⚡";

            const loadStr = typeof ev.activity?.icu_training_load === "number" ? ` • ${Math.round(ev.activity.icu_training_load)} TSS` : "";
            const distKm = typeof ev.activity?.distance === "number" && ev.activity.distance > 0 ? `${(ev.activity.distance / 1000).toFixed(1)} km` : "";
            const timeMin = typeof ev.activity?.moving_time === "number" && ev.activity.moving_time > 0 ? `${Math.round(ev.activity.moving_time / 60)} min` : "";
            const metricsDetail = [distKm, timeMin].filter(Boolean).join(" • ");

            newNotif = {
              id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: `${icon} Actividad Sincronizada`,
              message: `${ev.activity?.name || "Entrenamiento"}${loadStr}`,
              details: metricsDetail ? `${metricsDetail} sincronizados desde Garmin Connect` : "Sincronizado desde Garmin Connect",
              category: "SYNC",
              severity: "success",
              timestamp: ev.timestamp || nowIso,
              read: false,
              metadata: { activityId: ev.activity?.id, trainingLoad: ev.activity?.icu_training_load },
            };
          } else if (ev.type === "WELLNESS_UPDATED") {
            newNotif = {
              id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: "📊 Biomarcadores Actualizados",
              message: "Nuevas métricas de recuperación, sueño o FC reposo registradas.",
              category: "SYNC",
              severity: "info",
              timestamp: ev.timestamp || nowIso,
              read: false,
            };
          }

          const userData = userDoc.data();
          const currentNotifs = Array.isArray(userData.notifications) ? userData.notifications : [];
          const updatedNotifs = newNotif ? [newNotif, ...currentNotifs.filter((n: any) => n.id !== newNotif.id)].slice(0, 15) : currentNotifs;

          // Marcar al atleta con telemetría desactualizada y persistir notificación en Firestore
          await userDoc.ref.update({
            telemetryDirty: true,
            lastWebhookEvent: eventSummary,
            notifications: updatedNotifs,
            updatedAt: nowIso,
          });

          // Registro inmutable de auditoría forense para eventos de Intervals.icu
          await adminDb.collection("intervals_webhook_events").add({
            uid: userDoc.id,
            athleteId,
            event: ev,
            receivedAt: nowIso,
          });

          console.log(`[IntervalsWebhook] Evento ${ev.type} procesado exitosamente para atleta ${athleteId} (UID: ${userDoc.id})`);
        } else {
          console.warn(`[IntervalsWebhook] Evento recibido para athlete_id no vinculado: ${athleteId}`);
        }
      } catch (err: unknown) {
        console.error(`[IntervalsWebhook] Error procesando evento para atleta ${athleteId}:`, err);
      }
    }

    return {
      success: true,
      receivedCount: payload.events.length,
      matchedAthletes,
    };
  }
}
