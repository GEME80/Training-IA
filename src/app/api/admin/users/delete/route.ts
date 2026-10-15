import { NextRequest, NextResponse } from "next/server";
import { deleteUserFromAdmin } from "@/lib/db/adminUsers";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUid, targetEmail, requesterEmail, requesterUid } = body;

    if (!targetUid && !targetEmail) {
      return NextResponse.json(
        { success: false, error: "targetUid o targetEmail es obligatorio." },
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
        { success: false, error: "No autorizado. Solo el Administrador puede eliminar usuarios." },
        { status: 403 }
      );
    }

    // Purga por Email (Firestore + Auth + Preauth)
    if (targetEmail) {
      const cleanEmail = String(targetEmail).trim().toLowerCase();
      if (isMasterAdminEmail(cleanEmail)) {
        return NextResponse.json({ success: false, error: "El Superadministrador no puede ser eliminado." }, { status: 400 });
      }

      if (adminDb) {
        const snap = await adminDb.collection("users").where("email", "==", cleanEmail).get();
        for (const doc of snap.docs) {
          await doc.ref.delete().catch(() => {});
        }
        const preId = `preauth_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
        await adminDb.collection("users").doc(preId).delete().catch(() => {});
      }

      if (adminAuth) {
        try {
          const authUser = await adminAuth.getUserByEmail(cleanEmail);
          if (authUser) {
            await adminAuth.deleteUser(authUser.uid).catch(() => {});
          }
        } catch {
          // Ignorar si no existía en Firebase Auth
        }
      }

      return NextResponse.json({
        success: true,
        message: `Usuario con email ${cleanEmail} purgado exitosamente de Firestore y Auth.`,
      });
    }

    // Borrado por UID
    const result = await deleteUserFromAdmin(targetUid);
    if (adminAuth && targetUid) {
      await adminAuth.deleteUser(targetUid).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al eliminar atleta";
    console.error("Error en /api/admin/users/delete:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

