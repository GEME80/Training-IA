/**
 * OPENPAY COLOMBIA - SECURE WEBHOOK ROUTE
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Protegido por:
 * 1. Verificación criptográfica Timing-Safe de HTTP Basic Auth
 * 2. Double-Check Server-to-Server contra la API privada de Openpay
 * 3. Deduplicación en el Libro Mayor Inmutable (gmc_immutable_ledger)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine, WebhookCryptoRouterAgent } from '@/../gmc-billing-engine/src';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const payload = await req.json().catch(() => null);

    if (!payload) {
      return NextResponse.json(
        { error: 'Cuerpo de la petición inválido o vacío' },
        { status: 400 }
      );
    }

    // Manejo automático de verificación inicial de webhook de Openpay
    if (payload.type === 'verification' || payload.verification_code) {
      console.log('🔔 [OPENPAY_VERIFICATION_CODE_RECEIVED]', payload.verification_code);
      if (adminDb && payload.verification_code) {
        try {
          await adminDb.collection('system_config').doc('openpay_webhook_verification').set({
            verificationCode: payload.verification_code,
            receivedAt: new Date().toISOString(),
          });
        } catch {}
      }
      return NextResponse.json({ success: true, status: 'verified', code: payload.verification_code });
    }

    const engine = new GmcBillingEngine();
    const result = await engine.processWebhook(authHeader, payload);

    if (!result.processed) {
      if (result.reason?.includes('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'No autorizado: Credenciales de webhook incorrectas' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Fallo procesando webhook: ${result.reason}` },
        { status: 422 }
      );
    }

    // Sincronizar usuario en Firestore si el cobro fue exitoso
    if (payload.type === 'charge.succeeded' && payload.transaction?.order_id && adminDb) {
      const parsed = WebhookCryptoRouterAgent.parseOrderId(payload.transaction.order_id);
      if (parsed?.subscriberId) {
        try {
          const now = new Date();
          let baseDate = now;

          // Si el atleta ya tiene un periodo activo futuro, extender a partir de esa fecha
          try {
            const userDoc = await adminDb.collection('users').doc(parsed.subscriberId).get();
            if (userDoc.exists && userDoc.data()?.gmcCurrentPeriodEnd) {
              const prevEnd = new Date(userDoc.data()!.gmcCurrentPeriodEnd);
              if (prevEnd > now) baseDate = prevEnd;
            }
          } catch {}

          const periodEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const billingUpdate = {
            billingStatus: 'PAID',
            gmcSubscriptionStatus: 'ACTIVE',
            isTrialActive: false,
            hasUsedTrial: true,
            cancelAtPeriodEnd: false,
            lastPaymentDate: now.toISOString(),
            gmcCurrentPeriodStart: now.toISOString(),
            gmcCurrentPeriodEnd: periodEnd.toISOString(),
            paymentMethod: 'OPENPAY_RECURRING',
            openpayTransactionId: payload.transaction.id,
            planPrice: payload.transaction.amount || 55000,
            planCurrency: payload.transaction.currency || 'COP',
            updatedAt: now.toISOString(),
          };

          // 1. Actualizar por subscriberId directo
          await adminDb.collection('users').doc(parsed.subscriberId).set(billingUpdate, { merge: true });

          // 2. Sincronizar doc vinculado por intervalsAthleteId
          try {
            const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', parsed.subscriberId).get();
            for (const doc of snap.docs) {
              await doc.ref.set(billingUpdate, { merge: true });
            }
          } catch {}

          // 3. Sincronizar registro oficial en gmc_subscriptions
          try {
            await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${parsed.subscriberId}`).set({
              status: 'ACTIVE',
              currentPeriodStart: now.toISOString(),
              currentPeriodEnd: periodEnd.toISOString(),
              cancelAtPeriodEnd: false,
              updatedAt: now.toISOString(),
            }, { merge: true });
          } catch {}
        } catch (dbErr) {
          console.warn('[WEBHOOK_FIRESTORE_SYNC_WARN]', dbErr);
        }
      }
    }

    // Revocación inmediata en Firestore si hubo reembolso o devolución bancaria
    if (payload.type === 'charge.refunded' && payload.transaction?.order_id && adminDb) {
      const parsed = WebhookCryptoRouterAgent.parseOrderId(payload.transaction.order_id);
      if (parsed?.subscriberId) {
        try {
          const now = new Date().toISOString();
          const refundPayload = {
            billingStatus: 'REFUNDED',
            gmcSubscriptionStatus: 'CANCELLED_LOCKED',
            isTrialActive: false,
            cancelAtPeriodEnd: false,
            gmcCurrentPeriodEnd: now,
            updatedAt: now,
          };

          await adminDb.collection('users').doc(parsed.subscriberId).set(refundPayload, { merge: true });
          try {
            const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', parsed.subscriberId).get();
            for (const doc of snap.docs) {
              await doc.ref.set(refundPayload, { merge: true });
              try {
                await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${doc.id}`).set({
                  status: 'CANCELLED_LOCKED',
                  currentPeriodEnd: now,
                  cancelAtPeriodEnd: false,
                  updatedAt: now,
                }, { merge: true });
              } catch {}
            }
          } catch {}
          try {
            await adminDb.collection('gmc_subscriptions').doc(`PULSE_ENDURANCE_${parsed.subscriberId}`).set({
              status: 'CANCELLED_LOCKED',
              currentPeriodEnd: now,
              cancelAtPeriodEnd: false,
              updatedAt: now,
            }, { merge: true });
          } catch {}
        } catch (dbErr) {
          console.warn('[WEBHOOK_REFUND_SYNC_WARN]', dbErr);
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Evento de webhook procesado y conciliado en Libro Mayor',
      detail: result.reason,
    });
  } catch (error: any) {
    console.error('[OPENPAY_WEBHOOK_HANDLER_ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno en el procesamiento del webhook' },
      { status: 500 }
    );
  }
}
