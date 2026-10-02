import { NextRequest, NextResponse } from "next/server";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { fetchAthleteCurvesFromIntervals } from "@/lib/intervals/curvesService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sportParam = searchParams.get("sport");
    const sport: "Ride" | "Run" = sportParam === "Run" ? "Run" : "Ride";

    const athleteId = searchParams.get("athleteId") || undefined;
    const apiKey = searchParams.get("apiKey") || undefined;
    const uid = searchParams.get("uid") || undefined;
    const email = searchParams.get("email") || undefined;
    const weightKg = parseFloat(searchParams.get("weightKg") || "82");

    const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    let effAthleteId = credentials.athleteId;
    let effApiKey = credentials.apiKey;

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

    const data = await fetchAthleteCurvesFromIntervals({
      athleteId: effAthleteId,
      apiKey: effApiKey,
      sport,
      weightKg: isNaN(weightKg) || weightKg <= 0 ? 82 : weightKg,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al procesar curvas fisiológicas";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
