import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { getAggregatedTokenUsage } from "@/lib/ai/telemetry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterUid = searchParams.get("requesterUid");
    const requesterEmail = searchParams.get("requesterEmail");
    const period = (searchParams.get("period") || "monthly") as "daily" | "monthly" | "yearly";

    // 1. Verificación de Seguridad
    let isAuthorized = false;
    if (isMasterAdminEmail(requesterEmail)) {
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
        { success: false, error: "Acceso no autorizado." },
        { status: 403 }
      );
    }

    // 2. Consulta Eficiente de Telemetría
    const data = await getAggregatedTokenUsage(period);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/tokens:", error);
    return NextResponse.json({
      success: true,
      period: "monthly",
      promptTokens: 0,
      candidatesTokens: 0,
      totalTokens: 0,
      requests: 0,
      estimatedCostUsd: 0,
      byModel: {},
      byFeature: {},
      timeline: [],
    });
  }
}
