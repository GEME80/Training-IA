import { NextRequest, NextResponse } from "next/server";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { updateUserDetails } from "@/lib/db/adminUsers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetUid,
      requesterUid,
      requesterEmail,
      planPrice,
      planCurrency,
      billingStatus,
      billingCycleDay,
      lastPaymentDate,
      paymentMethod,
      primaryGoalRace,
      primaryGoalDate,
    } = body;

    if (!targetUid) {
      return NextResponse.json({ success: false, error: "targetUid es requerido." }, { status: 400 });
    }

    // 1. Autorización
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
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 403 });
    }

    // 2. Ejecutar actualización
    const result = await updateUserDetails(targetUid, {
      planPrice: typeof planPrice === "number" ? planPrice : undefined,
      planCurrency,
      billingStatus,
      billingCycleDay: typeof billingCycleDay === "number" ? billingCycleDay : undefined,
      lastPaymentDate,
      paymentMethod,
      primaryGoalRace,
      primaryGoalDate,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error en POST /api/admin/billing:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error del servidor." },
      { status: 500 }
    );
  }
}
