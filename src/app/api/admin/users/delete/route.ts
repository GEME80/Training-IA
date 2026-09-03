import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { deleteUserFromAdmin } from "@/lib/db/adminUsers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterUid, requesterEmail, targetUid, targetEmail } = body;

    // 1. Verificación de Seguridad
    let isAuthorized = false;
    if (requesterEmail && isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const userResult = await getUserProfileDecrypted(requesterUid);
      if (userResult?.profile && (userResult.profile.role === "admin" || isMasterAdminEmail(userResult.profile.email))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Acceso no autorizado para eliminar usuarios." },
        { status: 403 }
      );
    }

    if (!targetUid) {
      return NextResponse.json(
        { success: false, error: "Identificador de usuario objetivo no especificado." },
        { status: 400 }
      );
    }

    // 2. Proteger al Superadministrador Raíz
    if (targetEmail && isMasterAdminEmail(targetEmail)) {
      return NextResponse.json(
        { success: false, error: "Acción bloqueada: El Superadministrador Raíz no puede ser eliminado." },
        { status: 400 }
      );
    }

    // 3. Eliminar documento del usuario en Firestore mediante Firebase Admin
    const result = await deleteUserFromAdmin(targetUid);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error en POST /api/admin/users/delete:", error);
    const message = error instanceof Error ? error.message : "Error al eliminar usuario.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
