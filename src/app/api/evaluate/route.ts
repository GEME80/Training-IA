import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";
import { PhysiologicalEngine } from "@/lib/physiology/engine";
import { GeminiPhysiologicalAgent } from "@/lib/gemini/engine";
import { calculateMacrocyclePhase, TargetRace } from "@/lib/physiology/macrocycle";
import { AthleteProfile, AthleteWellness, CalendarEvent } from "@/lib/intervals/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteId,
      apiKey,
      customRunFtp = 280,
      customBikeFtp = 250,
      weekOffset = 0,
      geminiApiKey,
      selectedModel,
      customPrompt,
      targetRaces = [],
      weeklyAvailability,
      skipAI = false,
    } = body;

    let profile: AthleteProfile;
    let wellness: AthleteWellness[] = [];
    let events: CalendarEvent[] = [];

    // Si se proporcionan credenciales activas, consultamos la API de Intervals en vivo
    if (athleteId && apiKey) {
      try {
        const client = new IntervalsClient(athleteId, apiKey);
        
        // Rango de fechas: últimos 90 días para asegurar captura completa de PMC y Rolling HRV
        const today = new Date();
        const past90Days = new Date();
        past90Days.setDate(today.getDate() - 90);
        
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        const oldestStr = past90Days.toISOString().split("T")[0];
        const newestStr = today.toISOString().split("T")[0];
        const futureStr = next7Days.toISOString().split("T")[0];

        const [athleteData, wellnessData, calendarEvents] = await Promise.all([
          client.getAthlete().catch((err) => {
            console.warn("Aviso al consultar atleta:", err);
            return null;
          }),
          client.getWellness(oldestStr, newestStr).catch((err) => {
            console.warn("Aviso al consultar wellness:", err);
            return [];
          }),
          client.getEvents(newestStr, futureStr).catch((err) => {
            console.warn("Aviso al consultar eventos:", err);
            return [];
          }),
        ]);

        if (athleteData) {
          profile = {
            ...athleteData,
            id: athleteData.id || athleteId,
            name: athleteData.name || "Atleta Intervals",
            run_ftp: customRunFtp || athleteData.run_ftp || 285,
            bike_ftp: customBikeFtp || athleteData.bike_ftp || athleteData.icu_ftp || 260,
          };
        } else {
          profile = getFallbackProfile(athleteId, customRunFtp, customBikeFtp);
        }

        wellness = wellnessData.length > 0 ? wellnessData : getFallbackWellness();
        events = calendarEvents;
      } catch (clientErr) {
        console.warn("Fallo al conectar con Intervals API, utilizando datos de telemetría de respaldo:", clientErr);
        profile = getFallbackProfile(athleteId, customRunFtp, customBikeFtp);
        wellness = getFallbackWellness();
      }
    } else {
      profile = getFallbackProfile("i442091", customRunFtp, customBikeFtp);
      wellness = getFallbackWellness();
    }

    // 1. Evaluación del motor fisiológico
    const physioStatus = PhysiologicalEngine.evaluateAthlete(profile, wellness);

    // Sincronizar métricas resueltas en el perfil del atleta
    profile.ctl = physioStatus.ctl;
    profile.atl = physioStatus.atl;
    profile.tsb = physioStatus.tsb;
    profile.rampRate = physioStatus.rampRate;
    profile.restingHR = physioStatus.restingHR ?? profile.restingHR;

    // 2. Calcular fase de macrociclo según carreras objetivo
    const macrocyclePhase = calculateMacrocyclePhase(targetRaces as TargetRace[]);

    // 3. Inferencia y generación del árbol de decisiones del Head Coach (Gemini con descubrimiento dinámico)
    const agentDecision = await GeminiPhysiologicalAgent.analyzeMicrocycle(
      profile,
      wellness,
      events,
      physioStatus,
      Number(weekOffset) || 0,
      {
        customApiKey: geminiApiKey,
        preferredModel: selectedModel,
        customDirectives: customPrompt,
        macrocyclePhase,
        weeklyAvailability,
        skipAI,
      }
    );

    return NextResponse.json({
      success: true,
      profile,
      physioStatus,
      macrocyclePhase,
      agentDecision,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al evaluar microciclo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function getFallbackProfile(athleteId: string, runFtp: number, bikeFtp: number): AthleteProfile {
  return {
    id: athleteId,
    name: "Germán Morales (SGEA Atleta)",
    ctl: 68.4,
    atl: 84.2,
    tsb: -15.8,
    rampRate: 4.5,
    restingHR: 46,
    run_ftp: runFtp || 285,
    bike_ftp: bikeFtp || 260,
  };
}

function getFallbackWellness(): AthleteWellness[] {
  const records: AthleteWellness[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    records.push({
      id: dateStr,
      date: dateStr,
      ctl: 60 + (30 - i) * 0.28,
      atl: 75 + Math.sin(i / 2) * 12,
      tsb: -15 + Math.sin(i / 2) * 8,
      restingHR: 46 + (i % 3 === 0 ? 2 : 0),
      hrv: 62 + Math.sin(i) * 6,
      sleepQuality: 4,
    });
  }
  return records;
}
