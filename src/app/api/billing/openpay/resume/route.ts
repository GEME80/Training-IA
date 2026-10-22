/**
 * API ROUTE: REANUDACIÓN DE SUSCRIPCIÓN (BLINDADO CISO)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 *
 * Controles Antifraude:
 * Solo permite reanudar sin cobro si el suscriptor cuenta con una suscripción
 * previamente pagada (PAID / CANCEL_SCHEDULED), sin reembolsos ni bloqueos,
 * y cuya fecha de corte (currentPeriodEnd) sea estrictamente futura (> Date.now()).
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine, NetflixLifecycleAgent } from '@/../gmc-billing-engine/src';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscriberId, tenantId = 'PULSE_ENDURANCE' } = body;

    if (!subscriberId || typeof subscriberId !== 'string') {
      return NextResponse.json({ error: 'subscriberId válido requerido' }, { status: 400 });
    }

    const candidateIds = new Set<string>([subscriberId]);
    let uData: any = null;
    let subRecord: any = null;

    if (adminDb) {
      try {
        let userDoc = await adminDb.collection('users').doc(subscriberId).get();
        if (!userDoc.exists) {
          const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).limit(1).get();
          if (!snap.empty) userDoc = snap.docs[0];
        }
        if (!userDoc.exists) {
          const snap = await adminDb.collection('users').where('email', '==', subscriberId).limit(1).get();
          if (!snap.empty) userDoc = snap.docs[0];
        }
        if (userDoc.exists) {
          uData = userDoc.data();
          candidateIds.add(userDoc.id);
          if (uData?.intervalsAthleteId) candidateIds.add(uData.intervalsAthleteId);
          if (uData?.email) candidateIds.add(uData.email);
        }
      } catch (err) {
        console.warn('[RESUME_RESOLVE_CANDIDATES_WARN]', err);
      }
    }

    for (const cid of candidateIds) {
      try {
        const r = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, cid);
        if (r) {
          subRecord = r;
          break;
        }
      } catch {}
    }

    // BLINDAJE ANTIFRAUDE: Verificar elegibilidad estricta antes de reanudar sin cobro
    const lockedStatuses = ['CANCELLED_LOCKED', 'PAST_DUE_LOCKED', 'SUSPENDED_FRAUD', 'REFUNDED'];
    const isLockedOrRefunded =
      lockedStatuses.includes(String(uData?.gmcSubscriptionStatus || '')) ||
      lockedStatuses.includes(String(uData?.billingStatus || '')) ||
      lockedStatuses.includes(String(subRecord?.status || ''));

    const effectivePeriodEnd = uData?.gmcCurrentPeriodEnd || subRecord?.currentPeriodEnd;
    const periodEndMs = effectivePeriodEnd ? new Date(effectivePeriodEnd).getTime() : 0;
    const hasFuturePaidPeriod = !isNaN(periodEndMs) && periodEndMs > Date.now();

    const isEligiblePaidCancel =
      Boolean(
        uData?.billingStatus === 'PAID' ||
        uData?.gmcSubscriptionStatus === 'CANCEL_SCHEDULED' ||
        subRecord?.status === 'CANCEL_SCHEDULED' ||
        subRecord?.cancelAtPeriodEnd === true
      ) && !uData?.isTrialActive;

    if (isLockedOrRefunded || !hasFuturePaidPeriod || !isEligiblePaidCancel) {
      return NextResponse.json(
        {
          error: 'Tu periodo pagado no se encuentra vigente o fue reembolsado. Para reactivar tu membresía, realiza el pago en el checkout de Openpay BBVA.',
          requiresPayment: true,
        },
        { status: 402 }
      );
    }

    const engine = new GmcBillingEngine();
    for (const cid of candidateIds) {
      try {
        await engine.resumeSubscription(tenantId, cid);
      } catch {}
    }

    if (adminDb) {
      const now = new Date().toISOString();
      const resumePayload = {
        cancelAtPeriodEnd: false,
        gmcSubscriptionStatus: 'ACTIVE',
        updatedAt: now,
      };

      for (const cid of candidateIds) {
        try {
          await adminDb.collection('users').doc(cid).set(resumePayload, { merge: true });
          await adminDb.collection('gmc_subscriptions').doc(`${tenantId}_${cid}`).set(
            { status: 'ACTIVE', cancelAtPeriodEnd: false, updatedAt: now },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('[RESUME_DB_SYNC_WARN]', dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción reanudada con éxito. Tu ciclo mensual continuará de forma automática en tu fecha de corte.',
      willCancelAtPeriodEnd: false,
      status: 'ACTIVE',
    });
  } catch (error: any) {
    console.error('[RESUME_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error reanudando suscripción' }, { status: 500 });
  }
}
