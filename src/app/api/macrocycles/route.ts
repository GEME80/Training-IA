import { NextRequest, NextResponse } from "next/server";
import { saveMacrocycleToFirestore, getActiveMacrocycleFromFirestore, deleteActiveMacrocycleFromFirestore } from "@/lib/db/macrocycles";
import { isMasterAdminEmail } from "@/lib/env";
import { executeRecalibrateBoth } from "@/lib/services/recalibrateService";
import { resolveIntervalsCredentials } from "@/lib/intervals/credentials";
import { IntervalsClient } from "@/lib/intervals/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const athleteId = searchParams.get("athleteId");
    const uid = searchParams.get("uid") || undefined;
    const requesterEmail = searchParams.get("requesterEmail");
    const targetId = athleteId || uid;

    if (!targetId) {
      return NextResponse.json({ success: true, macrocycle: null, message: "No athleteId or uid provided" });
    }

    const masterAthleteId = process.env.INTERVALS_ATHLETE_ID || "i442091";
    if (targetId === masterAthleteId && (!requesterEmail || !isMasterAdminEmail(requesterEmail))) {
      return NextResponse.json({ success: true, macrocycle: null, message: "Acceso restringido a macrociclo maestro" });
    }

    const savedMacro = await getActiveMacrocycleFromFirestore(targetId, uid);
    if (savedMacro) {
      return NextResponse.json({ success: true, macrocycle: savedMacro });
    }

    return NextResponse.json({ success: true, macrocycle: null, message: "No hay macrociclo en Firestore" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener macrociclos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "recalibrate_both" || body.action === "recalibrate_athlete") {
      const updated = await executeRecalibrateBoth(body.athleteId);
      return NextResponse.json({ success: true, updated });
    }

    if (body.action === "delete_active" || body.action === "delete") {
      const targetId = body.athleteId || body.uid;
      if (!targetId) return NextResponse.json({ success: false, error: "athleteId o uid es requerido" }, { status: 400 });
      await deleteActiveMacrocycleFromFirestore(targetId, body.uid);
      return NextResponse.json({ success: true, message: "Macrociclo activo eliminado y desactivado en Firestore" });
    }

    const { athleteId, uid, blueprint, primaryRace, source = "WIZARD_CUSTOM" } = body;
    const targetId = athleteId || uid;

    if (!targetId) {
      return NextResponse.json({ success: false, error: "athleteId o uid es requerido" }, { status: 400 });
    }

    if (!blueprint) {
      return NextResponse.json({ success: false, error: "Blueprint es requerido" }, { status: 400 });
    }

    const macrocycleId = await saveMacrocycleToFirestore(targetId, blueprint, primaryRace, source, uid);

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let athleteId = searchParams.get("athleteId");
    let uid = searchParams.get("uid") || undefined;

    if (!athleteId && !uid) {
      const body = await req.json().catch(() => ({}));
      athleteId = body.athleteId;
      uid = body.uid;
    }

    const targetId = athleteId || uid;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "athleteId o uid es requerido para eliminar" }, { status: 400 });
    }

    await deleteActiveMacrocycleFromFirestore(targetId, uid);

    // Limpieza reactiva de eventos futuros [PULSE AI] / [SGEA] previamente sincronizados en Intervals.icu
    try {
      const { athleteId: effAthId, apiKey: effApiKey } = await resolveIntervalsCredentials({ athleteId: targetId, uid });
      if (effAthId && effApiKey) {
        const client = new IntervalsClient(effAthId, effApiKey);
        const todayStr = new Date().toISOString().split("T")[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const futureLimitStr = nextYear.toISOString().split("T")[0];
        const futureEvts = await client.getEvents(todayStr, futureLimitStr).catch(() => []);
        const toDelete = (futureEvts || []).filter(
          (e) => e.id && e.category === "WORKOUT" && (e.name?.startsWith("[PULSE AI]") || e.name?.startsWith("[SGEA]"))
        );
        if (toDelete.length > 0) {
          await Promise.all(toDelete.map((e) => client.deleteEvent(e.id!).catch(() => {})));
        }
      }
    } catch (cleanErr) {
      console.warn("Aviso al limpiar eventos futuros en Intervals al borrar plan:", cleanErr);
    }

    return NextResponse.json({
      success: true,
      message: "Macrociclo activo eliminado y desactivado exitosamente en Firestore e Intervals.icu",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al eliminar macrociclo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
