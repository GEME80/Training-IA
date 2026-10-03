import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      athleteUid,
      athleteEmail,
      referenceNumber,
      amount,
      currency,
      notes,
      paymentMethod = "TRANSFER",
    } = body;

    if (!athleteUid || !referenceNumber) {
      return NextResponse.json(
        { success: false, error: "athleteUid y referenceNumber son obligatorios." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Actualizar estado del atleta en Firestore
    const userRef = doc(db, "users", athleteUid);
    await setDoc(
      userRef,
      {
        billingStatus: "PENDING_VERIFICATION",
        paymentReference: referenceNumber.trim(),
        paymentReportedAt: now,
        paymentMethod,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Registrar reporte en histórico de transacciones
    try {
      const reportsRef = collection(db, "payment_reports");
      await addDoc(reportsRef, {
        athleteUid,
        athleteEmail: athleteEmail || "",
        referenceNumber: referenceNumber.trim(),
        amount: typeof amount === "number" ? amount : undefined,
        currency: currency || "USD",
        notes: notes?.trim() || "",
        paymentMethod,
        status: "PENDING_VERIFICATION",
        reportedAt: now,
      });
    } catch (auditErr) {
      console.warn("Aviso al crear reporte de pago en payment_reports:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "¡Pago reportado con éxito! Tu Head Coach validará la transferencia en la consola.",
      billingStatus: "PENDING_VERIFICATION",
      paymentReference: referenceNumber.trim(),
    });
  } catch (err: unknown) {
    console.error("Error en POST /api/billing/report-payment:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error al reportar pago." },
      { status: 500 }
    );
  }
}
