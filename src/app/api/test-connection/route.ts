import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { athleteId, apiKey, uid } = body || {};

    const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
      await resolveIntervalsCredentials({ athleteId, apiKey, uid });

    if (!effectiveAthleteId || !effectiveApiKey) {
      return NextResponse.json(
        { success: false, error: "Athlete ID y API Key son obligatorios para conectar con Intervals.icu." },
        { status: 400 }
      );
    }

    const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
    const result = await client.testConnection();

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al validar credenciales";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
