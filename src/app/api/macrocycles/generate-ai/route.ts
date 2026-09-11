import { NextRequest, NextResponse } from "next/server";
import { generateMacrocycleAiService } from "@/lib/services/macrocycleApiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateMacrocycleAiService(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al generar macrociclo con IA";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
