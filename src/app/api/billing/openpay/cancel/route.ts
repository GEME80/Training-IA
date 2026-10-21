/**
 * API ROUTE: CANCELACIÓN PROGRAMADA DE SUSCRIPCIÓN (EFECTO NETFLIX)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const subscriberId = body?.subscriberId;
    const tenantId = body?.tenantId || 'PULSE_ENDURANCE';

    if (!subscriberId) {
      return NextResponse.json({ error: 'subscriberId requerido' }, { status: 400 });
    }

    const engine = new GmcBillingEngine();
    await engine.scheduleCancellation(tenantId, subscriberId);

    // Sincronizar cancelación en Firestore para el perfil del atleta
    if (adminDb) {
      const now = new Date().toISOString();
      const cancelPayload = {
        cancelAtPeriodEnd: true,
        gmcSubscriptionStatus: 'CANCEL_SCHEDULED',
        updatedAt: now,
      };

      try {
        await adminDb.collection('users').doc(subscriberId).set(cancelPayload, { merge: true });
        const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).get();
        for (const doc of snap.docs) {
          await doc.ref.set(cancelPayload, { merge: true });
        }
      } catch (dbErr) {
        console.warn('[CANCEL_DB_SYNC_WARN]', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente. Seguirás teniendo acceso activo hasta el fin de tu periodo actual sin cobros futuros.',
      willCancelAtPeriodEnd: true,
      status: 'CANCEL_SCHEDULED',
    });
  } catch (error: any) {
    console.error('[CANCEL_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error al programar cancelación' }, { status: 500 });
  }
}
