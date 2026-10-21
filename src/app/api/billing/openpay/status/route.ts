/**
 * API ROUTE: RESOLUCIÓN DE ACCESO EN TIEMPO REAL ("EFECTO NETFLIX")
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine, NetflixLifecycleAgent } from '@/../gmc-billing-engine/src';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriberId = searchParams.get('subscriberId');
    const tenantId = searchParams.get('tenantId') || 'PULSE_ENDURANCE';

    if (!subscriberId) {
      return NextResponse.json({ error: 'subscriberId requerido' }, { status: 400 });
    }

    const engine = new GmcBillingEngine();
    const resolution = await engine.resolveAccess(tenantId, subscriberId);
    let rawRecord: any = null;
    try {
      rawRecord = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, subscriberId);
    } catch (recErr) {
      console.warn('[STATUS_GET_RECORD_WARN] No se pudo leer record:', recErr);
    }

    // Consultar datos complementarios en Firestore (colección users)
    let uData: any = null;
    if (adminDb) {
      try {
        let userDoc = await adminDb.collection('users').doc(subscriberId).get();
        if (!userDoc.exists) {
          const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).limit(1).get();
          if (!snap.empty) userDoc = snap.docs[0];
        }
        if (userDoc.exists) uData = userDoc.data();
      } catch (uErr) {
        console.warn('[STATUS_GET_USER_DOC_WARN]', uErr);
      }
    }

    // Evaluar si la cancelación fue programada en cualquiera de las dos fuentes
    const isCanceled = Boolean(
      rawRecord?.cancelAtPeriodEnd ||
      rawRecord?.status === 'CANCEL_SCHEDULED' ||
      uData?.cancelAtPeriodEnd ||
      uData?.gmcSubscriptionStatus === 'CANCEL_SCHEDULED'
    );

    const cardLast4 = rawRecord?.cardLast4 || uData?.cardLast4 || '1111';
    const cardBrand = rawRecord?.cardBrand || uData?.cardBrand || 'visa';
    const currentPeriodEnd = rawRecord?.currentPeriodEnd || uData?.gmcCurrentPeriodEnd || new Date(Date.now() + 30 * 86400000).toISOString();
    const currentPeriodStart = rawRecord?.currentPeriodStart || uData?.gmcCurrentPeriodStart || uData?.lastPaymentDate;

    const record = {
      status: isCanceled ? 'CANCEL_SCHEDULED' : (rawRecord?.status || uData?.gmcSubscriptionStatus || 'ACTIVE'),
      currentPlanCode: 'PULSE_PRO_MONTHLY',
      cardLast4,
      cardBrand,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: isCanceled,
      hasConsumedTrial: true,
    };

    if (isCanceled) {
      resolution.willCancelAtPeriodEnd = true;
      resolution.status = 'CANCEL_SCHEDULED';
    }

    return NextResponse.json({
      success: true,
      resolution,
      record,
    });
  } catch (error: any) {
    console.error('[STATUS_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error consultando estado' }, { status: 500 });
  }
}
