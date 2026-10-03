import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { DEFAULT_SUBSCRIPTION_PLAN, SubscriptionPlanConfig } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const planRef = doc(db, "system_config", "subscription_plan");
    const snap = await getDoc(planRef);

    if (snap.exists()) {
      const data = snap.data() as SubscriptionPlanConfig;
      return NextResponse.json({
        success: true,
        plan: {
          ...DEFAULT_SUBSCRIPTION_PLAN,
          ...data,
        },
      });
    }

    return NextResponse.json({
      success: true,
      plan: DEFAULT_SUBSCRIPTION_PLAN,
    });
  } catch (error) {
    console.warn("Aviso al obtener subscription_plan, usando valores por defecto:", error);
    return NextResponse.json({
      success: true,
      plan: DEFAULT_SUBSCRIPTION_PLAN,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterUid, requesterEmail, plan } = body;

    // 1. Autorización de Administrador
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
      return NextResponse.json({ success: false, error: "No autorizado. Se requieren privilegios de Administrador." }, { status: 403 });
    }

    if (!plan || typeof plan !== "object") {
      return NextResponse.json({ success: false, error: "Datos de plan inválidos." }, { status: 400 });
    }

    const planToSave: SubscriptionPlanConfig = {
      ...DEFAULT_SUBSCRIPTION_PLAN,
      ...plan,
      price: typeof plan.price === "number" ? Math.max(0, plan.price) : DEFAULT_SUBSCRIPTION_PLAN.price,
      currency: plan.currency || "USD",
      name: plan.name?.trim() || DEFAULT_SUBSCRIPTION_PLAN.name,
      tagline: plan.tagline?.trim() || DEFAULT_SUBSCRIPTION_PLAN.tagline,
      description: plan.description?.trim() || DEFAULT_SUBSCRIPTION_PLAN.description,
      features: Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : DEFAULT_SUBSCRIPTION_PLAN.features,
      nequiEnabled: Boolean(plan.nequiEnabled),
      nequiNumber: plan.nequiNumber?.trim() || DEFAULT_SUBSCRIPTION_PLAN.nequiNumber,
      nequiAccountName: plan.nequiAccountName?.trim() || DEFAULT_SUBSCRIPTION_PLAN.nequiAccountName,
      nequiDocumentId: plan.nequiDocumentId?.trim() || DEFAULT_SUBSCRIPTION_PLAN.nequiDocumentId,
      nequiQrImageUrl: plan.nequiQrImageUrl?.trim() || "",
      bankName: plan.bankName?.trim() || DEFAULT_SUBSCRIPTION_PLAN.bankName,
      bankAccountNumber: plan.bankAccountNumber?.trim() || DEFAULT_SUBSCRIPTION_PLAN.bankAccountNumber,
      paymentInstructions: plan.paymentInstructions?.trim() || DEFAULT_SUBSCRIPTION_PLAN.paymentInstructions,
      updatedAt: new Date().toISOString(),
      updatedBy: requesterEmail || requesterUid || "admin",
    };

    const planRef = doc(db, "system_config", "subscription_plan");
    await setDoc(planRef, planToSave, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Plan de suscripción y datos de Nequi guardados exitosamente.",
      plan: planToSave,
    });
  } catch (err: unknown) {
    console.error("Error en POST /api/admin/subscription-plan:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error del servidor." },
      { status: 500 }
    );
  }
}
