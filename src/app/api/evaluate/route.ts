import { NextRequest, NextResponse } from "next/server";
import { EvaluateRequestSchema } from "@/lib/validation/schemas";
import { TelemetryService } from "@/lib/services/telemetryService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = EvaluateRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload de evaluación inválido",
          validationErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await TelemetryService.evaluate(parseResult.data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado al evaluar telemetría";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
