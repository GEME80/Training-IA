/**
 * API ROUTE: CANCELACIÓN PROGRAMADA DE SUSCRIPCIÓN ("EFECTO NETFLIX")
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
          candidateIds.add(userDoc.id);
          if (u?.intervalsAthleteId) candidateIds.add(u.intervalsAthleteId);
          if (u?.email) candidateIds.add(u.email);
        }
      } catch (err) {
        console.warn('[CANCEL_RESOLVE_CANDIDATES_WARN]', err);
      }
    }

    const engine = new GmcBillingEngine();
    for (const cid of candidateIds) {
      try {
        await engine.scheduleCancellation(tenantId, cid);
      } catch {
        // continue
      }
    }

    if (adminDb) {
      const now = new Date().toISOString();
      const cancelPayload = {
        cancelAtPeriodEnd: true,
        gmcSubscriptionStatus: 'CANCEL_SCHEDULED',
        updatedAt: now,
      };

      for (const cid of candidateIds) {
        try {
          await adminDb.collection('users').doc(cid).set(cancelPayload, { merge: true });
          await adminDb.collection('gmc_subscriptions').doc(`${tenantId}_${cid}`).set(
            { status: 'CANCEL_SCHEDULED', cancelAtPeriodEnd: true, updatedAt: now },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('[CANCEL_DB_SYNC_WARN]', dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente. Conservarás tu acceso activo completo hasta el fin de tu periodo actual y no se te cobrará nada.',
      willCancelAtPeriodEnd: true,
      status: 'CANCEL_SCHEDULED',
    });
  } catch (error: any) {
    console.error('[CANCEL_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error procesando cancelación' }, { status: 500 });
  }
}
