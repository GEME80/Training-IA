import { NextRequest, NextResponse } from "next/server";
import { MacrocycleAIEngine } from "@/lib/gemini/macrocycleAI";
import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { AthleteProfile, AthleteWellness } from "@/lib/intervals/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteId = "i442091",
      apiKey,
      customGeminiKey,
      selectedModel,
      wizardConfig,
      runFtp = 285,
      bikeFtp = 260,
    } = body;

    let profile: AthleteProfile = {
      id: athleteId,
      name: "Germán Morales",
      ctl: 68.4,
      atl: 84.2,
      tsb: -15.8,
      rampRate: 4.5,
      restingHR: 46,
      run_ftp: runFtp,
      bike_ftp: bikeFtp,
    };
    let wellness: AthleteWellness[] = [];

    // 1. Obtener telemetría en vivo si hay credenciales de Intervals
    if (athleteId && apiKey) {
      try {
        const client = new IntervalsClient(athleteId, apiKey);
        const today = new Date();
        const past90 = new Date();
        past90.setDate(today.getDate() - 90);

        const [ath, wel] = await Promise.all([
          client.getAthlete().catch(() => null),
          client.getWellness(past90.toISOString().split("T")[0], today.toISOString().split("T")[0]).catch(() => []),
        ]);

        if (ath) {
          profile = {
            ...ath,
            id: ath.id || athleteId,
            name: ath.name || profile.name,
            run_ftp: runFtp || ath.run_ftp || 285,
            bike_ftp: bikeFtp || ath.bike_ftp || 260,
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
    const aiResult = await MacrocycleAIEngine.generatePersonalizedMacrocycle(
      profile,
      physioStatus,
      wizardConfig,
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
