import { NextRequest, NextResponse } from "next/server";
import { preauthorizeUser } from "@/lib/db/adminUsers";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      displayName,
      role,
      status,
      intervalsAthleteId,
      runFtp,
      bikeFtp,
      requesterEmail,
      requesterUid,
    } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Correo electrónico válido es obligatorio." },
        { status: 400 }
      );
    }

    // Validación de privilegios de Administrador
    let isAuthorized = false;
    if (requesterEmail && isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const requester = await getUserProfileDecrypted(requesterUid);
      if (requester?.profile.role === "admin" || isMasterAdminEmail(requester?.profile.email)) {
        isAuthorized = true;
      }
    }

    // Permitir en entorno local si no hay sesión configurada
    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Solo el Administrador puede invitar atletas." },
        { status: 403 }
      );
    }

    const result = await preauthorizeUser({
      email,
      displayName,
      role: role || "athlete",
      status: status || "active",
      intervalsAthleteId,
      runFtp,
      bikeFtp,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al preautorizar atleta";
    console.error("Error en /api/admin/users/preauthorize:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
