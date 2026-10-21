/**
 * API ROUTE: REANUDACIÓN DE SUSCRIPCIÓN (REVERSIÓN DE CANCELACIÓN)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscriberId, tenantId = 'PULSE_ENDURANCE' } = body;

    if (!subscriberId) {
      return NextResponse.json({ error: 'subscriberId requerido' }, { status: 400 });
    }

    const candidateIds = new Set<string>([subscriberId]);
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
          const u = userDoc.data();
          // BLINDAJE FINSEC: Si el periodo pagado ya venció, NO se puede reanudar gratis; debe pagar
          if (u?.gmcCurrentPeriodEnd && new Date(u.gmcCurrentPeriodEnd).getTime() <= Date.now()) {
            return NextResponse.json({
              error: 'Tu periodo anterior ya ha finalizado. Para reactivar tu membresía, realiza el pago de tu suscripción.',
              requiresPayment: true,
            }, { status: 402 });
          }
          candidateIds.add(userDoc.id);
          if (u?.intervalsAthleteId) candidateIds.add(u.intervalsAthleteId);
          if (u?.email) candidateIds.add(u.email);
        }
      } catch (err) {
        console.warn('[RESUME_RESOLVE_CANDIDATES_WARN]', err);
      }
    }

    const engine = new GmcBillingEngine();
    for (const cid of candidateIds) {
      try {
        await engine.resumeSubscription(tenantId, cid);
      } catch {
        // continue
      }
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
