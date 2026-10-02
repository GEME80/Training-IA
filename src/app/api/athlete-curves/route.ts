import { NextRequest, NextResponse } from "next/server";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { fetchAthleteCurvesFromIntervals } from "@/lib/intervals/curvesService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sportParam = searchParams.get("sport");
    const sport: "Ride" | "Run" = sportParam === "Run" ? "Run" : "Ride";

    let athleteId = searchParams.get("athleteId") || undefined;
    let apiKey = searchParams.get("apiKey") || undefined;
    const uid = searchParams.get("uid") || undefined;
    const email = searchParams.get("email") || undefined;
    const weightKg = parseFloat(searchParams.get("weightKg") || "82");

    if (athleteId && athleteId.startsWith("demo")) {
      athleteId = undefined;
    }

    const credentials = await resolveIntervalsCredentials({ athleteId, apiKey, uid, email });
    let effAthleteId = credentials.athleteId || athleteId;
    let effApiKey = credentials.apiKey || apiKey;

    if (!effAthleteId || effAthleteId.startsWith("demo")) {
      effAthleteId = (process.env.INTERVALS_ATHLETE_ID || "i442091").replace(/["']/g, "").trim();
    }
    if (!effApiKey) {
      effApiKey = (process.env.INTERVALS_API_KEY || "48eje8t1wnj95t0sbjx2oumkq").replace(/["']/g, "").trim();
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
