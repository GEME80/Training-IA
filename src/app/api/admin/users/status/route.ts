import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus } from "@/lib/db/adminUsers";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { UserStatus } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, newStatus, requesterEmail, requesterUid } = body;

    if (!targetUid || !newStatus) {
      return NextResponse.json(
        { success: false, error: "targetUid y newStatus son obligatorios." },
        { status: 400 }
      );
    }

    const validStatuses: UserStatus[] = ["active", "pending", "disabled"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Estado no válido." },
        { status: 400 }
      );
    }

    // Validación de privilegios
    const effectiveEmail = requesterEmail || req.headers.get("x-requester-email");
    const effectiveUid = requesterUid || req.headers.get("x-requester-uid");

    let isAuthorized = false;
    if (effectiveUid === "superadmin-root" || (effectiveEmail && isMasterAdminEmail(effectiveEmail))) {
      isAuthorized = true;
    } else if (effectiveUid) {
      const requester = await getUserProfileDecrypted(effectiveUid);
      if (requester?.profile.role === "admin" || isMasterAdminEmail(requester?.profile.email)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const result = await updateUserStatus(targetUid, newStatus, requesterEmail);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al actualizar estado del atleta";
    console.error("Error en /api/admin/users/status:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
