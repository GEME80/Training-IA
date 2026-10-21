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

    const { athleteId: effAthleteId, apiKey: effApiKey } = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });

    if (!effApiKey || !effAthleteId) {
      return NextResponse.json(
        { success: false, error: "Credenciales de Intervals.icu no disponibles" },
        { status: 401 }
      );
    }

    const client = new IntervalsClient(effAthleteId, effApiKey);
    const rawStreams = await client.getActivityStreams(activityId, [
      "time",
      "heartrate",
      "raw_heartrate",
      "fixed_heartrate",
      "watts",
      "velocity_smooth",
      "cadence",
      "altitude",
    ]);

    const streamsMap: Record<string, any> = {};
    if (Array.isArray(rawStreams)) {
      rawStreams.forEach((stream: any) => {
        if (stream.type && Array.isArray(stream.data)) {
          streamsMap[stream.type] = stream.data;
        }
      });
    }

    // Fusión y recuperación de stream de FC (Anti-Clipping & Anti-Truncation Universal):
    // Si Intervals.icu aplicó un filtro automático por Max HR (recortando valores > max_hr a null o limitándolos)
    // o truncó la cola del stream de FC respecto al tiempo real de la actividad,
    // restaurar los valores reales desde raw_heartrate o fixed_heartrate registrados directamente por el sensor.
    const timeStream = streamsMap.time as number[] | undefined;
    const rawHr = (streamsMap.raw_heartrate || streamsMap.fixed_heartrate) as number[] | undefined;
    const processedHr = (streamsMap.heartrate || []) as number[];

    const targetLength = Math.max(
      Array.isArray(timeStream) ? timeStream.length : 0,
      Array.isArray(rawHr) ? rawHr.length : 0,
      Array.isArray(processedHr) ? processedHr.length : 0
    );

    if (targetLength > 0 && Array.isArray(rawHr) && rawHr.length > 0) {
      const mergedHr: (number | null)[] = new Array(targetLength);
      for (let i = 0; i < targetLength; i++) {
        const pVal = processedHr[i];
        const rVal = rawHr[i];
        const pValid = typeof pVal === "number" && !isNaN(pVal) && pVal >= 40;
        const rValid = typeof rVal === "number" && !isNaN(rVal) && rVal >= 40;

        if (rValid && pValid) {
          mergedHr[i] = Math.max(pVal, rVal);
        } else if (rValid) {
          mergedHr[i] = rVal;
        } else if (pValid) {
          mergedHr[i] = pVal;
        } else {
          mergedHr[i] = null;
        }
      }
      streamsMap.heartrate = mergedHr;
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
