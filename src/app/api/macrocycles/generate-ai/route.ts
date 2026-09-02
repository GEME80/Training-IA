import { NextRequest, NextResponse } from "next/server";
import { MacrocycleAIEngine } from "@/lib/gemini/macrocycleAI";
import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness } from "@/lib/intervals/types";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteId,
      apiKey,
      uid,
      customGeminiKey,
      selectedModel,
      wizardConfig,
      runFtp,
      bikeFtp,
    } = body;

    const { athleteId: effectiveAthleteId, apiKey: effectiveApiKey } =
      await resolveIntervalsCredentials({ athleteId, apiKey, uid });

    let profile: AthleteProfile = {
      id: effectiveAthleteId,
      name: "Atleta",
      ctl: 0,
      atl: 0,
      tsb: 0,
      rampRate: 0,
      run_ftp: runFtp,
      bike_ftp: bikeFtp,
    };
    let wellness: AthleteWellness[] = [];

    // 1. Obtener telemetría en vivo si hay credenciales de Intervals
    if (effectiveAthleteId && effectiveApiKey) {
      try {
        const client = new IntervalsClient(effectiveAthleteId, effectiveApiKey);
        const today = new Date();
        const past90 = new Date();
        past90.setDate(today.getDate() - 90);

        const [ath, wel, sports] = await Promise.all([
          client.getAthlete().catch(() => null),
          client.getWellness(past90.toISOString().split("T")[0], today.toISOString().split("T")[0]).catch(() => []),
          client.getSportSettings().catch(() => []),
        ]);

        if (ath) {
          const runSport = (sports || []).find((s: any) =>
            s.types?.some((t: string) => /run|running|virtualrun|trailrun/i.test(t)) ||
            /run/i.test(String(s.id))
          );
          const rideSport = (sports || []).find((s: any) =>
            s.types?.some((t: string) => /ride|cycling|bike|virtualride|ebikeride/i.test(t)) ||
            /ride|cycling|bike/i.test(String(s.id))
          );

          profile = {
            ...ath,
            id: ath.id || athleteId,
            name: ath.name || profile.name,
            run_ftp: runSport?.ftp || ath.icu_running_ftp || ath.run_ftp || runFtp,
            bike_ftp: rideSport?.ftp || ath.icu_ftp || ath.bike_ftp || bikeFtp,
          };
        }
        wellness = wel;
      } catch (err) {
        console.warn("Aviso al consultar Intervals para IA de macrociclo:", err);
      }
    }

    const physioStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);
    profile.ctl = physioStatus.ctl;
    profile.atl = physioStatus.atl;
    profile.tsb = physioStatus.tsb;
    profile.rampRate = physioStatus.rampRate;

    // 2. Inferencia y personalización del macrociclo con IA
    // weeklyAvailability viene dentro de wizardConfig del cliente
    const aiResult = await MacrocycleAIEngine.generatePersonalizedMacrocycle(
      profile,
      physioStatus,
      {
        ...wizardConfig,
        // ✅ Propagar weeklyAvailability desde el wizard al motor
        weeklyAvailability: wizardConfig?.weeklyAvailability || null,
      },
      {
        geminiApiKey: customGeminiKey,
        selectedModel,
      }
    );

    return NextResponse.json({
      success: true,
      aiResult,
      physioStatus,
      profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al generar macrociclo con IA";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
