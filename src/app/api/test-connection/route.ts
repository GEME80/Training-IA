import { NextRequest, NextResponse } from "next/server";
import { IntervalsClient } from "@/lib/intervals/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteId, apiKey } = body;

    if (!athleteId || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Athlete ID y API Key son obligatorios." },
        { status: 400 }
      );
    }

    const client = new IntervalsClient(athleteId, apiKey);
    const result = await client.testConnection();

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al validar credenciales";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
