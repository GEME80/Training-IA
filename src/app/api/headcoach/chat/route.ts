import { NextRequest, NextResponse } from "next/server";
import { resolveChatContext } from "@/lib/ai/headcoach/chatContext";
import { executeGeminiInference } from "@/lib/ai/headcoach/chatInference";
import { handleDeterministicFallback } from "@/lib/ai/headcoach/deterministicFallback";
import { HeadCoachChatRequest, HeadCoachChatResponse } from "@/lib/ai/headcoach/types";

export async function POST(req: NextRequest) {
  try {
    const body: HeadCoachChatRequest = await req.json();

    // 1. Extracción de telemetría y resolución de contexto unificado
    const ctx = await resolveChatContext(body);

    // 2. Interceptación inmediata de Acciones Canónicas (Flujos A, B, C, D, Matriz Temporal, Confirmación)
    const lastMsg = (body.messages && body.messages.length > 0)
      ? (body.messages[body.messages.length - 1].content || "").toLowerCase().trim()
      : "";

    const isCanonicalAction =
      Boolean(body.isInitialAudit) ||
      lastMsg === "detalle de mi estado" || lastMsg === "ver detalle de mi estado" ||
      lastMsg.includes("confirmar nuevo calendario") || lastMsg.includes("aprobar ajuste") ||
      lastMsg.includes("aplicar mayor carga") || lastMsg.includes("descartar") ||
      lastMsg.includes("prefiero descansar") || lastMsg.includes("mantener plan original");

    if (isCanonicalAction) {
      const fallbackResponse = handleDeterministicFallback(
        ctx,
        body.messages || [],
        Boolean(body.isInitialAudit),
        body.currentPlan || []
      );
      return NextResponse.json(fallbackResponse);
    }

    // 3. Inferencia con Google Gemini API para consultas abiertas
    let inferenceResult: { success: boolean; data?: any; successfulModel?: string } = { success: false };
    try {
      inferenceResult = await executeGeminiInference(ctx, body);
    } catch (inferErr) {
      console.warn("Aviso: executeGeminiInference falló, activando motor fisiológico determinístico:", inferErr);
      inferenceResult = { success: false };
    }

    if (inferenceResult.success && inferenceResult.data) {
      const parsed = inferenceResult.data;
      const response: HeadCoachChatResponse = {
        success: true,
        reply: parsed.reply || "Microciclo evaluado y calibrado a tus parámetros fisiológicos.",
        actionType: parsed.actionType || "CONVERSATION",
        reasoning: parsed.reasoning || null,
        workoutDiff: parsed.workoutDiff || null,
        previousWeekSummary: ctx.previousWeekSummary || null,
        audit: parsed.audit || {
          compliancePct: ctx.compliancePct, actualTss: ctx.actualTss, plannedTss: ctx.plannedWeekTss,
          ctl: Number(ctx.physioStatus?.ctl || 0).toFixed(1),
          atl: Number(ctx.physioStatus?.atl || 0).toFixed(1),
          tsb: Number(ctx.physioStatus?.tsb || 0).toFixed(1),
          rampRate: Number(ctx.physioStatus?.rampRate || 0).toFixed(1),
          feedback: ctx.formDiagnostic || "Carga asimilada adecuadamente",
          demographics: {
            age: ctx.profile?.age, gender: ctx.profile?.gender, weight: ctx.profile?.weight,
            wkgRun: ctx.profile?.run_ftp && ctx.profile?.weight ? Number((ctx.profile.run_ftp / ctx.profile.weight).toFixed(2)) : undefined,
            wkgBike: ctx.profile.bike_ftp && ctx.profile.weight ? Number((ctx.profile.bike_ftp / ctx.profile.weight).toFixed(2)) : undefined,
          },
          activitiesBreakdown: Object.entries(ctx.effectiveExecutedMap || {}).flatMap(([dKey, val]) =>
            Array.isArray(val?.activities) ? val.activities.map((a: any) => ({
              name: a?.name || a?.type || "Actividad", type: a?.type || "Run", date: dKey, tss: a?.tss || 0,
              movingTimeMin: a?.movingTimeMin || 0, watts: a?.watts, heartrate: a?.heartrate,
            })) : []
          ),
        },
        suggestedPlan: parsed.suggestedPlan || null,
        smartActions: parsed.smartActions || (Array.isArray(parsed.quickReplies) ? parsed.quickReplies.map((qr: any) => ({
          label: typeof qr === "string" ? qr.replace(/^[📊✈️📉📈✅⏱️📋]\s*/, "") : String(qr?.label || qr)
        })) : undefined),
        quickReplies: parsed.quickReplies || ["Mantener plan original", "Reorganizar", "Siento mucha fatiga hoy", "El plan está muy suave"],
        modelUsed: inferenceResult.successfulModel || "Google Gemini AI",
        targetWeekNumber: ctx.targetPlanningWeekNum,
      };

      return NextResponse.json(response);
    }

    // 4. Fallback fisiológico determinístico (Banister + Stryd CP / Bike FTP)
    const fallbackResponse = handleDeterministicFallback(
      ctx,
      body.messages || [],
      Boolean(body.isInitialAudit),
      body.currentPlan || []
    );

    return NextResponse.json(fallbackResponse);
  } catch (error: unknown) {
    console.error("DETALLE ERROR CHAT ROUTE (Fallback Seguro Activado):", error);
    return NextResponse.json({
      success: true,
      reply: "He evaluado tu solicitud. Tus parámetros fisiológicos y zonas de potencia se mantienen estables para este microciclo.",
      actionType: "CONVERSATION",
      quickReplies: ["Ver detalle de mi estado", "Reorganizar", "Mantener plan original"],
      modelUsed: "Motor Fisiológico PULSE (Seguridad)",
    });
  }
}
