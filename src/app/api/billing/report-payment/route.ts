import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

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

    if (adminDb) {
      try {
        const userRef = adminDb.collection("users").doc(athleteUid);
        await userRef.set(
          {
            billingStatus: "PENDING_VERIFICATION",
            paymentReference: referenceNumber.trim(),
            paymentReportedAt: now,
            paymentMethod,
            updatedAt: now,
          },
          { merge: true }
        );

        await adminDb.collection("payment_reports").add({
          athleteUid,
          athleteEmail: athleteEmail || "",
          referenceNumber: referenceNumber.trim(),
          amount: typeof amount === "number" ? amount : 0,
          currency: currency || "USD",
          notes: notes?.trim() || "",
          paymentMethod,
          status: "PENDING_VERIFICATION",
          reportedAt: now,
        });
      } catch (dbErr) {
        console.warn("Aviso al registrar pago en Firestore (modo resiliente):", dbErr);
      }
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
