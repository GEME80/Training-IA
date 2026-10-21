/**
 * API ROUTE: REANUDAR SUSCRIPCIÓN ANTES DEL CORTE
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
    await engine.resumeSubscription(tenantId, subscriberId);

    // Sincronizar reactivación en Firestore para el perfil del atleta
    if (adminDb) {
      const now = new Date().toISOString();
      const resumePayload = {
        cancelAtPeriodEnd: false,
        gmcSubscriptionStatus: 'ACTIVE',
        updatedAt: now,
      };

      try {
        await adminDb.collection('users').doc(subscriberId).set(resumePayload, { merge: true });
        const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).get();
        for (const doc of snap.docs) {
          await doc.ref.set(resumePayload, { merge: true });
        }
      } catch (dbErr) {
        console.warn('[RESUME_DB_SYNC_WARN]', dbErr);
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
    return NextResponse.json({ error: error.message || 'Error al reanudar suscripción' }, { status: 500 });
  }
}
