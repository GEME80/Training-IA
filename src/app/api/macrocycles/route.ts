import { NextRequest, NextResponse } from "next/server";
import { saveMacrocycleToFirestore, getActiveMacrocycleFromFirestore } from "@/lib/db/macrocycles";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const athleteId = searchParams.get("athleteId") || "i442091";

    const savedMacro = await getActiveMacrocycleFromFirestore(athleteId);
    if (savedMacro) {
      return NextResponse.json({
        success: true,
        macrocycle: savedMacro,
      });
    }

    return NextResponse.json({
      success: true,
      macrocycle: null,
      message: "No hay macrociclo guardado en Firestore, usando estado local",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener macrociclos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { athleteId = "i442091", blueprint, primaryRace, source = "WIZARD_CUSTOM" } = body;

    if (!blueprint) {
      return NextResponse.json({ success: false, error: "Blueprint es requerido" }, { status: 400 });
    }

    const macrocycleId = await saveMacrocycleToFirestore(athleteId, blueprint, primaryRace, source);

    return NextResponse.json({
      success: true,
      macrocycleId,
      message: "Macrociclo guardado y activado exitosamente en Firestore",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar macrociclo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
