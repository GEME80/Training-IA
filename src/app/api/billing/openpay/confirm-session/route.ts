/**
 * API ROUTE: CONFIRMACIÓN Y RETORNO DE SESIÓN DE PAGO OPENPAY BBVA
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { OpenpayClient } from '@/../gmc-billing-engine/src/providers/openpay/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || (!body.subscriberId && !body.orderId && !body.transactionId)) {
      return NextResponse.json({ error: 'subscriberId o orderId requerido' }, { status: 400 });
    }

    let subscriberId = body.subscriberId;
    const orderId = body.orderId;
    const transactionId = body.transactionId || body.id;

    // Si subscriberId no fue pasado, extraerlo del orderId determinista
    if (!subscriberId && orderId) {
      const match = orderId.match(/^GMC-[^-]+-SUB-([^-]+)-/);
      if (match) subscriberId = match[1];
    }

    if (!subscriberId) subscriberId = 'default_subscriber';

    // Obtener detalles de la transacción directamente desde Openpay BBVA
    let cardLast4 = '1111';
    let cardBrand = 'visa';
    let cardHolder = 'German Morales';
    let openpayCustomerId = '';
    let authCode = '';

    if (transactionId) {
      try {
        const client = new OpenpayClient();
        const charge = await client.getCharge(transactionId);
        if (charge) {
          if (charge.card) {
            cardLast4 = charge.card.card_number ? charge.card.card_number.slice(-4) : '1111';
            cardBrand = charge.card.brand || 'visa';
            cardHolder = charge.card.holder_name || cardHolder;
          }
          openpayCustomerId = (charge as any).customer_id || '';
          authCode = charge.authorization || '';

          // Si subscriberId no fue pasado o es default, extraerlo de charge.order_id
          const chargeOrderId = (charge as any).order_id;
          if ((!subscriberId || subscriberId === 'default_subscriber') && chargeOrderId) {
            const match = chargeOrderId.match(/^GMC-[^-]+-SUB-([^-]+)-/);
            if (match) subscriberId = match[1];
          }
        }
      } catch (fetchErr) {
        console.warn('[CONFIRM_SESSION_OPENPAY_FETCH_WARN]', fetchErr);
      }
    }

    if (!subscriberId) subscriberId = 'default_subscriber';

    if (adminDb) {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const userBillingPayload = {
        billingStatus: 'PAID',
        gmcSubscriptionStatus: 'ACTIVE',
        cancelAtPeriodEnd: false, // Reset estricto de cualquier cancelación previa
        isTrialActive: false,
        hasUsedTrial: true,
        cardLast4,
        cardBrand,
        cardHolder,
        lastPaymentDate: now.toISOString(),
        gmcCurrentPeriodStart: now.toISOString(),
        gmcCurrentPeriodEnd: periodEnd.toISOString(),
        paymentMethod: 'OPENPAY_CHECKOUT_HOSTED',
        paymentReference: orderId || transactionId || `order_${now.getTime()}`,
        openpayTransactionId: transactionId || '',
        openpayAuthorization: authCode,
        openpayCustomerId,
        updatedAt: now.toISOString(),
      };

      // 1. Actualizar por subscriberId directo
      await adminDb.collection('users').doc(subscriberId).set(userBillingPayload, { merge: true });

      // 2. Si subscriberId es un intervalsAthleteId, buscar también el doc con UID de Firebase
      let resolvedIntervalsId = subscriberId;
      try {
        const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).get();
        for (const doc of snap.docs) {
          await doc.ref.set(userBillingPayload, { merge: true });
        }
      } catch (qErr) {
        console.warn('[CONFIRM_SESSION_QUERY_UID_WARN]', qErr);
      }

      // 2.5 Si subscriberId era el UID, buscar también su intervalsAthleteId y actualizarlo
      try {
        const uDoc = await adminDb.collection('users').doc(subscriberId).get();
        if (uDoc.exists && uDoc.data()?.intervalsAthleteId) {
          resolvedIntervalsId = uDoc.data()!.intervalsAthleteId;
        }
      } catch (err) {}

      // 3. Sincronizar registro oficial de suscripción en gmc_subscriptions para ambos IDs
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
        openpayTransactionId: transactionId || '',
        updatedAt: now.toISOString(),
      };

      await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${subscriberId}`).set(subPayload, { merge: true });
      if (resolvedIntervalsId && resolvedIntervalsId !== subscriberId) {
        await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${resolvedIntervalsId}`).set({
          ...subPayload,
          subscriberId: resolvedIntervalsId,
        }, { merge: true });
      }

      // 4. Marcar sesión de checkout como completada
      if (orderId) {
        try {
          await adminDb.collection('gmc_checkout_sessions').doc(orderId).set({
            status: 'COMPLETED',
            cardLast4,
            cardBrand,
            completedAt: now.toISOString(),
          }, { merge: true });
        } catch (sessErr) {
          console.warn('[CONFIRM_SESSION_LOG_WARN]', sessErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción activada exitosamente tras retorno de Openpay BBVA',
      cardLast4,
      cardBrand,
    });
  } catch (error: any) {
    console.error('[CONFIRM_SESSION_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Error confirmando retorno de pago' },
      { status: 500 }
    );
  }
}
