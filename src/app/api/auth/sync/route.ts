import { NextRequest, NextResponse } from "next/server";
import { syncUserFromGoogleAuth } from "@/lib/db/userProfile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, displayName, photoURL } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: "UID y Email son requeridos para la sincronización." },
        { status: 400 }
      );
    }

    const profile = await syncUserFromGoogleAuth({
      uid,
      email,
      displayName,
      photoURL,
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        // Cero datos de claves en claro
        encryptedApiKey: undefined,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al sincronizar sesión de usuario";
    console.error("Error en /api/auth/sync:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
