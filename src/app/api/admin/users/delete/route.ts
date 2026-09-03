import { NextRequest, NextResponse } from "next/server";
import { deleteUserFromAdmin } from "@/lib/db/adminUsers";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, requesterEmail, requesterUid } = body;

    if (!targetUid) {
      return NextResponse.json(
        { success: false, error: "targetUid es obligatorio." },
        { status: 400 }
      );
    }

    // Validación de privilegios
    let isAuthorized = false;
    if (requesterEmail && isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const requester = await getUserProfileDecrypted(requesterUid);
      if (requester?.profile.role === "admin" || isMasterAdminEmail(requester?.profile.email)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Solo el Administrador puede eliminar usuarios." },
        { status: 403 }
      );
    }

    const result = await deleteUserFromAdmin(targetUid);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al eliminar atleta";
    console.error("Error en /api/admin/users/delete:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
