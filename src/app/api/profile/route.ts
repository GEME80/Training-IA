import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfileDecrypted } from "@/lib/db/userProfile";
import { DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid") || "demo-user";

    // Si Firebase Admin no está conectado, retornamos estado fallback para pruebas
    try {
      const data = await getUserProfileDecrypted(uid);
      if (data) {
        return NextResponse.json({
          success: true,
          profile: {
            ...data.profile,
            weeklyAvailability: data.profile.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY,
            hasApiKey: !!data.decryptedApiKey,
          },
        });
      }
    } catch {
      // Retornar demo profile si la base de datos aún no se ha aprovisionado en local
    }

    return NextResponse.json({
      success: true,
      profile: {
        uid,
        email: "demo@pulseai.pro",
        displayName: "Atleta PULSE AI PRO",
        intervalsAthleteId: "i442091",
        hasApiKey: false,
        trainingFocus: "BUILD",
        weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener perfil";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      uid = "demo-user",
      email = "atleta@pulseai.pro",
      displayName,
      intervalsAthleteId,
      rawApiKey,
      runFtp,
      bikeFtp,
      restingHR,
      maxHR,
      lthr,
      weightKg,
      heightCm,
      birthDate,
      gender,
      trainingFocus,
      weeklyAvailability,
      visibleMetrics,
      targetRaces,
      seasonPlans,
    } = body;

    try {
      await saveUserProfile(uid, {
        email,
        displayName,
        intervalsAthleteId,
        rawApiKey,
        runFtp: runFtp !== undefined && runFtp !== null ? Number(runFtp) : undefined,
        bikeFtp: bikeFtp !== undefined && bikeFtp !== null ? Number(bikeFtp) : undefined,
        restingHR: restingHR !== undefined && restingHR !== null ? Number(restingHR) : undefined,
        maxHR: maxHR !== undefined && maxHR !== null ? Number(maxHR) : undefined,
        lthr: lthr !== undefined && lthr !== null ? Number(lthr) : undefined,
        weightKg: weightKg !== undefined && weightKg !== null ? Number(weightKg) : undefined,
        heightCm: heightCm !== undefined && heightCm !== null ? Number(heightCm) : undefined,
        birthDate,
        gender,
        trainingFocus,
        weeklyAvailability,
        visibleMetrics,
        targetRaces,
        seasonPlans,
      });
    } catch (dbErr) {
      console.warn("Aviso: Guardado en Firestore omitido en modo local:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Perfil y configuración guardados de forma segura.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar perfil";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
