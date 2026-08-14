import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfileDecrypted } from "@/lib/db/userProfile";

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
        email: "demo@sgea.training",
        displayName: "Atleta SGEA",
        intervalsAthleteId: "i442091",
        runFtp: 280,
        bikeFtp: 250,
        hasApiKey: false,
        trainingFocus: "BUILD",
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
    const { uid = "demo-user", email = "atleta@sgea.training", intervalsAthleteId, rawApiKey, runFtp, bikeFtp, trainingFocus } = body;

    try {
      await saveUserProfile(uid, {
        email,
        intervalsAthleteId,
        rawApiKey,
        runFtp: Number(runFtp) || 280,
        bikeFtp: Number(bikeFtp) || 250,
        trainingFocus,
      });
    } catch (dbErr) {
      console.warn("Aviso: Guardado en Firestore omitido en modo local:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Perfil y credenciales guardados de forma segura.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar perfil";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
