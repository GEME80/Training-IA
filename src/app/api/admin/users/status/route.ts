import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus, getUserProfileDecrypted, UserStatus } from "@/lib/db/userProfile";
import { isMasterAdminEmail } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, requesterUid, requesterEmail } = body;
    const statusToUpdate = (body.newStatus || body.status) as UserStatus;

    if (!targetUid || !statusToUpdate) {
      return NextResponse.json(
        { success: false, error: "targetUid y status (o newStatus) son obligatorios." },
        { status: 400 }
      );
    }

    // Verificar autorización del solicitante
    let isAuthorized = false;
    if (requesterEmail && isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const requesterData = await getUserProfileDecrypted(requesterUid);
      if (requesterData?.profile.role === "admin" || isMasterAdminEmail(requesterData?.profile.email)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado para cambiar el estado de usuarios." },
        { status: 403 }
      );
    }

    const result = await updateUserStatus(
      targetUid,
      statusToUpdate,
      requesterEmail
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar estado de usuario";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
