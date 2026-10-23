import { NextRequest, NextResponse } from "next/server";
import { IntervalsWebhookService, IntervalsWebhookPayload } from "@/lib/services/intervalsWebhookService";

/**
 * Healthcheck y verificación de conectividad para el gateway de webhooks de Intervals.icu
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "PULSE ENDURANCE Intervals Webhook Gateway",
    endpoint: "/api/intervals/webhook",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Endpoint de recepción de eventos en tiempo real de Intervals.icu (OAuth Client App #1371)
 * Eventos soportados: ACTIVITY_UPLOADED, ACTIVITY_ANALYZED, ACTIVITY_DELETED, CALENDAR_UPDATED, WELLNESS_UPDATED
 */
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json().catch(() => null)) as IntervalsWebhookPayload | null;

    if (!payload) {
      return NextResponse.json({ error: "Payload JSON inválido o vacío" }, { status: 400 });
    }

    // Validación de secreto de webhook de Intervals.icu
    if (!IntervalsWebhookService.validateSecret(payload.secret)) {
      console.warn("[IntervalsWebhook] Intento de acceso no autorizado con secreto inválido");
      return NextResponse.json({ error: "No autorizado: Secreto de webhook incorrecto" }, { status: 401 });
    }

    const result = await IntervalsWebhookService.processPayload(payload);

    return NextResponse.json({
      success: true,
      message: `Procesados ${result.receivedCount} eventos para ${result.matchedAthletes} atletas`,
      result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido en webhook";
    console.error("[IntervalsWebhook] Excepción crítica:", message);
    return NextResponse.json({ error: "Error interno procesando webhook", details: message }, { status: 500 });
  }
}
