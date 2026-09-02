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

    // 2. Inferencia con Google Gemini API
    const inferenceResult = await executeGeminiInference(ctx, body);

    if (inferenceResult.success && inferenceResult.data) {
      const parsed = inferenceResult.data;
      const response: HeadCoachChatResponse = {
        success: true,
        reply: parsed.reply,
        actionType: parsed.actionType || "CONVERSATION",
        reasoning: parsed.reasoning || null,
        workoutDiff: parsed.workoutDiff || null,
        audit: parsed.audit || {
          compliancePct: ctx.compliancePct,
          actualTss: ctx.actualTss,
          plannedTss: ctx.plannedWeekTss,
          ctl: ctx.physioStatus.ctl.toFixed(1),
          atl: ctx.physioStatus.atl.toFixed(1),
          tsb: ctx.physioStatus.tsb.toFixed(1),
          rampRate: Number(ctx.physioStatus.rampRate || 0).toFixed(1),
          feedback: ctx.formDiagnostic,
        },
        suggestedPlan: parsed.suggestedPlan || null,
        quickReplies: parsed.quickReplies || [
          "✅ Aprobar y Sincronizar",
          "⏱️ Adaptar martes por falta de tiempo",
          "🚴 Cambiar a Rodillo Z2",
          "🔍 Ver zonas de potencia",
        ],
        modelUsed: inferenceResult.successfulModel || "Google Gemini AI",
        targetWeekNumber: ctx.targetPlanningWeekNum,
      };

      return NextResponse.json(response);
    }

    // 3. Fallback fisiológico determinístico (Banister + Stryd CP / Bike FTP)
    const fallbackResponse = handleDeterministicFallback(
      ctx,
      body.messages || [],
      Boolean(body.isInitialAudit),
      body.currentPlan || []
    );

    return NextResponse.json(fallbackResponse);
  } catch (error: unknown) {
    console.error("DETALLE ERROR CHAT ROUTE:", error);
    const message = error instanceof Error ? error.message : "Error en el chat con Head Coach";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
