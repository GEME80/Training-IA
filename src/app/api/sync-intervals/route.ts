import { NextRequest, NextResponse } from "next/server";
import { SyncIntervalsRequestSchema } from "@/lib/validation/schemas";
import { IntervalsSyncService } from "@/lib/services/intervalsSyncService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = SyncIntervalsRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Estructura del microciclo inválida o parámetros incompletos.",
          validationErrors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await IntervalsSyncService.syncPlan(parseResult.data);
    const status = result.isAuthError ? 401 : result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado al sincronizar entrenamientos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
