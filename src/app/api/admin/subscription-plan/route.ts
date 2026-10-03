import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { isMasterAdminEmail } from "@/lib/env";
import { getUserProfileDecrypted } from "@/lib/db/userProfile";
import { DEFAULT_SUBSCRIPTION_PLAN, SubscriptionPlanConfig } from "@/lib/db/types";

export const dynamic = "force-dynamic";

// Memoria compartida de fallback para entornos locales o sin credenciales de servicio GCP
let inMemoryPlanConfig: SubscriptionPlanConfig = { ...DEFAULT_SUBSCRIPTION_PLAN };

export async function GET() {
  try {
    if (adminDb) {
      try {
        const snap = await adminDb.collection("system_config").doc("subscription_plan").get();
        if (snap.exists) {
          const data = snap.data() as SubscriptionPlanConfig;
          inMemoryPlanConfig = { ...DEFAULT_SUBSCRIPTION_PLAN, ...data };
          return NextResponse.json({ success: true, plan: inMemoryPlanConfig });
        }
      } catch (dbErr) {
        console.warn("Aviso al consultar subscription_plan en Firestore, usando fallback:", dbErr);
      }
    }
    return NextResponse.json({ success: true, plan: inMemoryPlanConfig });
  } catch (error) {
    console.warn("Aviso al obtener subscription_plan, usando valores por defecto:", error);
    return NextResponse.json({ success: true, plan: inMemoryPlanConfig });
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
      ...inMemoryPlanConfig,
      ...plan,
      price: typeof plan.price === "number" ? Math.max(0, plan.price) : DEFAULT_SUBSCRIPTION_PLAN.price,
      currency: plan.currency || "USD",
      name: plan.name?.trim() || DEFAULT_SUBSCRIPTION_PLAN.name,
      tagline: plan.tagline?.trim() || DEFAULT_SUBSCRIPTION_PLAN.tagline,
      description: plan.description?.trim() || DEFAULT_SUBSCRIPTION_PLAN.description,
      billingCycleDaysText: plan.billingCycleDaysText?.trim() || DEFAULT_SUBSCRIPTION_PLAN.billingCycleDaysText,
      features: Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : DEFAULT_SUBSCRIPTION_PLAN.features,
      breBEnabled: plan.breBEnabled !== undefined ? Boolean(plan.breBEnabled) : (plan.nequiEnabled !== undefined ? Boolean(plan.nequiEnabled) : true),
      breBKey: plan.breBKey?.trim() || plan.nequiNumber?.trim() || DEFAULT_SUBSCRIPTION_PLAN.breBKey,
      breBKeyType: plan.breBKeyType || "CELULAR",
      accountHolderName: plan.accountHolderName?.trim() || plan.nequiAccountName?.trim() || DEFAULT_SUBSCRIPTION_PLAN.accountHolderName,
      accountDocumentId: plan.accountDocumentId?.trim() || plan.nequiDocumentId?.trim() || DEFAULT_SUBSCRIPTION_PLAN.accountDocumentId || "",
      bankName: plan.bankName?.trim() || "BBVA Colombia",
      bankAccountType: plan.bankAccountType || "Ahorros",
      bankAccountNumber: plan.bankAccountNumber?.trim() || DEFAULT_SUBSCRIPTION_PLAN.bankAccountNumber || "",
      qrImageUrl: plan.qrImageUrl?.trim() || plan.nequiQrImageUrl?.trim() || "",
      paymentInstructions: plan.paymentInstructions?.trim() || DEFAULT_SUBSCRIPTION_PLAN.paymentInstructions,
      // Backward compatibility aliases
      nequiEnabled: plan.breBEnabled !== undefined ? Boolean(plan.breBEnabled) : Boolean(plan.nequiEnabled),
      nequiNumber: plan.breBKey?.trim() || plan.nequiNumber?.trim() || DEFAULT_SUBSCRIPTION_PLAN.breBKey,
      nequiAccountName: plan.accountHolderName?.trim() || plan.nequiAccountName?.trim() || DEFAULT_SUBSCRIPTION_PLAN.accountHolderName,
      nequiDocumentId: plan.accountDocumentId?.trim() || plan.nequiDocumentId?.trim() || DEFAULT_SUBSCRIPTION_PLAN.accountDocumentId || "",
      nequiQrImageUrl: plan.qrImageUrl?.trim() || plan.nequiQrImageUrl?.trim() || "",
      updatedAt: new Date().toISOString(),
      updatedBy: requesterEmail || requesterUid || "admin",
    };

    inMemoryPlanConfig = planToSave;

    if (adminDb) {
      try {
        await adminDb.collection("system_config").doc("subscription_plan").set(planToSave, { merge: true });
      } catch (dbErr) {
        console.warn("Aviso al guardar subscription_plan en Firestore (guardado en memoria):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Plan de suscripción y datos de Bre-B / BBVA guardados exitosamente.",
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
