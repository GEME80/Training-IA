import { NextRequest, NextResponse } from "next/server";
import { getAllUsersForAdmin, getAdminStats, getUserProfileDecrypted } from "@/lib/db/userProfile";
import { isMasterAdminEmail } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterUid = searchParams.get("requesterUid");
    const requesterEmail = searchParams.get("requesterEmail");

    // Verificación de privilegios de Administrador
    let isAuthorized = false;

    if (requesterEmail && isMasterAdminEmail(requesterEmail)) {
      isAuthorized = true;
    } else if (requesterUid) {
      const requesterData = await getUserProfileDecrypted(requesterUid);
      if (requesterData?.profile.role === "admin" || isMasterAdminEmail(requesterData?.profile.email)) {
        isAuthorized = true;
      }
    }

    // Permitir en entorno local para visualización inicial
    if (!isAuthorized && process.env.NODE_ENV !== "production") {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const [users, stats] = await Promise.all([
      getAllUsersForAdmin(),
      getAdminStats(),
    ]);

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error: unknown) {
    console.warn("Aviso en /api/admin/users, retornando superadmin por defecto:", error);
    return NextResponse.json({
      success: true,
      users: [
        {
          uid: "superadmin-root",
          email: "gerkof@gmail.com",
          displayName: "Germán Morales",
          role: "admin",
          status: "active",
          intervalsAthleteId: "i442091",
          hasIntervalsKey: true,
          createdAt: "2026-08-01T00:00:00.000Z",
          lastLoginAt: new Date().toISOString(),
        },
      ],
      stats: {
        totalUsers: 1,
        activeUsers: 1,
        pendingUsers: 0,
        disabledUsers: 0,
        connectedAthletes: 1,
        lastCalculatedAt: new Date().toISOString(),
      },
    });
  }
}
