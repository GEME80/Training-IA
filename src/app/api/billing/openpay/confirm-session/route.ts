/**
 * API ROUTE: CONFIRMACIÓN Y RETORNO DE SESIÓN DE PAGO OPENPAY BBVA (BLINDADO CISO)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 *
 * Controles Antifraude:
 * 1. Verificación Server-to-Server obligatoria contra Openpay BBVA (status === 'completed').
 * 2. Validación de monto íntegro (>= precio oficial del plan) y moneda COP.
 * 3. Prevención de Transaction ID Hijacking / Replay entre suscriptores distintos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { OpenpayClient } from '@/../gmc-billing-engine/src/providers/openpay/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || (!body.subscriberId && !body.orderId && !body.transactionId && !body.id)) {
      return NextResponse.json({ success: false, error: 'Parámetros de verificación requeridos' }, { status: 400 });
    }

    const requestedSubscriberId: string | undefined = body.subscriberId;
    let orderId: string | undefined = body.orderId;
    let transactionId: string | undefined = body.transactionId || body.id;

    // 1. Obtener tarifa oficial configurada en el sistema
    let expectedPrice = 55000;
    if (adminDb) {
      try {
        const planDoc = await adminDb.collection('system_config').doc('subscription_plan').get();
        if (planDoc.exists && typeof planDoc.data()?.price === 'number') {
          expectedPrice = planDoc.data()!.price;
        }
      } catch {}
    }

    // 2. Si no vino transactionId directo, buscarlo en gmc_checkout_sessions por orderId o subscriberId
    if (!transactionId && adminDb) {
      try {
        if (orderId) {
          const sessDoc = await adminDb.collection('gmc_checkout_sessions').doc(orderId).get();
          if (sessDoc.exists) {
            transactionId = sessDoc.data()?.openpayTransactionId;
          }
        } else if (requestedSubscriberId) {
          const snap = await adminDb
            .collection('gmc_checkout_sessions')
            .where('subscriberId', '==', requestedSubscriberId)
            .limit(5)
            .get();
          if (!snap.empty) {
            const sorted = snap.docs
              .map((d) => d.data())
              .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
            if (sorted[0]?.openpayTransactionId) {
              transactionId = sorted[0].openpayTransactionId;
              orderId = sorted[0].orderId;
            }
          }
        }
      } catch {}
    }

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'No se encontró una transacción de pago registrada para verificar.' },
        { status: 402 }
      );
    }

    // 3. Verificación Server-to-Server obligatoria contra Openpay BBVA
    const client = new OpenpayClient();
    let charge: any = null;
    try {
      charge = await client.getCharge(transactionId);
    } catch {
      return NextResponse.json(
        { success: false, error: 'La transacción indicada no existe en los registros de Openpay BBVA.' },
        { status: 402 }
      );
    }

    if (!charge || charge.status !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          status: charge?.status || 'NOT_COMPLETED',
          error: 'El pago aún no ha sido completado o fue rechazado por el banco emisor.',
        },
        { status: 402 }
      );
    }

    // 4. Validación antifraude de Monto y Moneda (COP)
    const chargedAmount = Number(charge.amount || 0);
    const chargedCurrency = String(charge.currency || 'COP').toUpperCase();
    if (chargedCurrency !== 'COP' || chargedAmount < expectedPrice) {
      return NextResponse.json(
        {
          success: false,
          error: `Alerta Antifraude: Monto (${chargedAmount} ${chargedCurrency}) inferior al valor oficial del plan (${expectedPrice} COP).`,
        },
        { status: 402 }
      );
    }

    // 5. Prevención de Secuestro de Transacción (Transaction ID Hijacking)
    const chargeOrderId: string = charge.order_id || orderId || '';
    const orderMatch = chargeOrderId.match(/^GMC-[^-]+-SUB-([^-]+)-/);
    const ownerFromOrder = orderMatch ? orderMatch[1] : undefined;

    if (ownerFromOrder && requestedSubscriberId && ownerFromOrder !== requestedSubscriberId) {
      // Verificar si son el mismo usuario vinculado por UID <-> intervalsAthleteId
      let isSameLinkedUser = false;
      if (adminDb) {
        try {
          const uDoc = await adminDb.collection('users').doc(requestedSubscriberId).get();
          if (uDoc.exists && uDoc.data()?.intervalsAthleteId === ownerFromOrder) {
            isSameLinkedUser = true;
          }
          const oDoc = await adminDb.collection('users').doc(ownerFromOrder).get();
          if (oDoc.exists && oDoc.data()?.intervalsAthleteId === requestedSubscriberId) {
            isSameLinkedUser = true;
          }
        } catch {}
      }
      if (!isSameLinkedUser) {
        return NextResponse.json(
          { success: false, error: 'Alerta Antifraude: Esta transacción pertenece a otro suscriptor.' },
          { status: 403 }
        );
      }
    }

    const subscriberId = ownerFromOrder || requestedSubscriberId;
    if (!subscriberId) {
      return NextResponse.json({ success: false, error: 'No se pudo determinar el titular de la suscripción.' }, { status: 400 });
    }

    // Verificar en Libro Mayor Inmutable que la transacción no haya sido reclamada por otro titular
    if (adminDb) {
      const ledgerRef = adminDb.collection('gmc_immutable_ledger').doc(transactionId);
      const ledgerSnap = await ledgerRef.get();
      if (ledgerSnap.exists) {
        const ledgerOwner = ledgerSnap.data()?.subscriberId;
        if (ledgerOwner && ledgerOwner !== subscriberId && ledgerOwner !== requestedSubscriberId) {
          return NextResponse.json(
            { success: false, error: 'Alerta Antifraude: Transacción previamente conciliada para otro usuario.' },
            { status: 403 }
          );
        }
      }
    }

    const cardLast4 = charge.card?.card_number ? String(charge.card.card_number).slice(-4) : '4444';
    const cardBrand = charge.card?.brand || 'mastercard';
    const cardHolder = charge.card?.holder_name || 'Atleta Pulse';
    const openpayCustomerId = charge.customer_id || '';
    const authCode = charge.authorization || '';

    if (adminDb) {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const userBillingPayload = {
        billingStatus: 'PAID',
        gmcSubscriptionStatus: 'ACTIVE',
        cancelAtPeriodEnd: false,
        isTrialActive: false,
        hasUsedTrial: true,
        cardLast4,
        cardBrand,
        cardHolder,
        planPrice: chargedAmount,
        planCurrency: 'COP',
        lastPaymentDate: now.toISOString(),
        gmcCurrentPeriodStart: now.toISOString(),
        gmcCurrentPeriodEnd: periodEnd.toISOString(),
        paymentMethod: 'OPENPAY_CHECKOUT_HOSTED',
        paymentReference: chargeOrderId || transactionId,
        openpayTransactionId: transactionId,
        openpayAuthorization: authCode,
        openpayCustomerId,
        updatedAt: now.toISOString(),
      };

      await adminDb.collection('users').doc(subscriberId).set(userBillingPayload, { merge: true });

      let resolvedIntervalsId = subscriberId;
      try {
        const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).get();
        for (const doc of snap.docs) {
          await doc.ref.set(userBillingPayload, { merge: true });
        }
        const uDoc = await adminDb.collection('users').doc(subscriberId).get();
        if (uDoc.exists && uDoc.data()?.intervalsAthleteId) {
          resolvedIntervalsId = uDoc.data()!.intervalsAthleteId;
        }
      } catch {}

      const subPayload = {
        tenantId: 'PULSE_ENDURANCE',
        subscriberId,
        status: 'ACTIVE',
        currentPlanCode: 'PULSE_PRO_MONTHLY',
        cardLast4,
        cardBrand,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        cancelAtPeriodEnd: false,
        hasConsumedTrial: true,
        openpayCustomerId,
        openpayTransactionId: transactionId,
        updatedAt: now.toISOString(),
      };

      await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${subscriberId}`).set(subPayload, { merge: true });
      if (resolvedIntervalsId && resolvedIntervalsId !== subscriberId) {
        await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${resolvedIntervalsId}`).set(
          { ...subPayload, subscriberId: resolvedIntervalsId },
          { merge: true }
        );
      }

      if (chargeOrderId) {
        await adminDb.collection('gmc_checkout_sessions').doc(chargeOrderId).set(
          { status: 'COMPLETED', cardLast4, cardBrand, completedAt: now.toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción verificada y activada exitosamente con Openpay BBVA',
      cardLast4,
      cardBrand,
      transactionId,
    });
  } catch (error: any) {
    console.error('[CONFIRM_SESSION_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error verificando la sesión de pago' },
      { status: 500 }
    );
  }
}
