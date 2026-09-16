import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params;
    if (!activityId) {
      return NextResponse.json({ success: false, error: "Activity ID requerido" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const athleteId = searchParams.get("athleteId") || undefined;
    const apiKey = searchParams.get("apiKey") || undefined;
    const uid = searchParams.get("uid") || undefined;
    const email = searchParams.get("email") || undefined;

    const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    let effAthleteId = credentials.athleteId;
    let effApiKey = credentials.apiKey;

    // Resiliencia local/admin: Si no se enviaron credenciales y existe llave en el entorno, usar fallback
    if (!effApiKey && process.env.INTERVALS_API_KEY) {
      effApiKey = (process.env.INTERVALS_API_KEY || "").replace(/["']/g, "").trim();
      effAthleteId = effAthleteId || (process.env.INTERVALS_ATHLETE_ID || "i442091").replace(/["']/g, "").trim();
    }

    if (!effApiKey || !effAthleteId) {
      return NextResponse.json(
        { success: false, error: "Credenciales de Intervals.icu no disponibles" },
        { status: 401 }
      );
    }

    const client = new IntervalsClient(effApiKey, effAthleteId);
    const rawStreams = await client.getActivityStreams(activityId, [
      "time",
      "heartrate",
      "watts",
      "velocity_smooth",
      "cadence",
      "altitude",
    ]);

    const streamsMap: Record<string, number[]> = {};
    if (Array.isArray(rawStreams)) {
      rawStreams.forEach((stream: any) => {
        if (stream.type && Array.isArray(stream.data)) {
          streamsMap[stream.type] = stream.data;
        }
      });
    }

    return NextResponse.json({
      success: true,
      activityId,
      streams: streamsMap,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener streams de actividad";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
