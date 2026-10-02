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

    if (parseResult.data.action === "clean_and_sync") {
      const cleanSyncResult = await IntervalsSyncService.cleanAndSync(parseResult.data);
      const status = cleanSyncResult.isAuthError ? 401 : cleanSyncResult.success ? 200 : 500;
      return NextResponse.json(cleanSyncResult, { status });
    }

    if (parseResult.data.action === "delete_future") {
      const delResult = await IntervalsSyncService.deleteFutureWorkouts({
        athleteId: parseResult.data.athleteId,
        apiKey: parseResult.data.apiKey,
        uid: parseResult.data.uid,
        email: parseResult.data.email,
        fromDate: parseResult.data.fromDate,
        toDate: parseResult.data.toDate,
      });
      const status = delResult.isAuthError ? 401 : delResult.success ? 200 : 500;
      return NextResponse.json(delResult, { status });
    }

    const result = await IntervalsSyncService.syncPlan(parseResult.data);
    const status = result.isAuthError ? 401 : result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado al sincronizar entrenamientos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
