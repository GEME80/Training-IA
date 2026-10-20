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
    let record: any = null;
    try {
      const rawRecord = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, subscriberId);
      if (rawRecord) {
        record = {
          status: rawRecord.status,
          currentPlanCode: rawRecord.currentPlanCode,
          cardLast4: rawRecord.cardLast4 || null,
          cardBrand: rawRecord.cardBrand || null,
          currentPeriodStart: rawRecord.currentPeriodStart,
          currentPeriodEnd: rawRecord.currentPeriodEnd,
          trialEndDate: rawRecord.trialEndDate || null,
          cancelAtPeriodEnd: Boolean(rawRecord.cancelAtPeriodEnd),
          hasConsumedTrial: Boolean(rawRecord.hasConsumedTrial),
        };
      }
    } catch (recErr) {
      console.warn('[STATUS_GET_RECORD_WARN] No se pudo leer record:', recErr);
    }

    // Si gmc_subscriptions no tenía la tarjeta, consultar en la colección users
    if ((!record || !record.cardLast4) && adminDb) {
      try {
        let userDoc = await adminDb.collection('users').doc(subscriberId).get();
        if (!userDoc.exists) {
          const snap = await adminDb.collection('users').where('intervalsAthleteId', '==', subscriberId).limit(1).get();
          if (!snap.empty) userDoc = snap.docs[0];
        }
        if (userDoc.exists) {
          const uData = userDoc.data();
          if (uData) {
            record = {
              status: uData.gmcSubscriptionStatus || (uData.billingStatus === 'PAID' ? 'ACTIVE' : 'TRIAL_ACTIVE'),
              currentPlanCode: 'PULSE_PRO_MONTHLY',
              cardLast4: uData.cardLast4 || null,
              cardBrand: uData.cardBrand || null,
              currentPeriodStart: uData.gmcCurrentPeriodStart || uData.lastPaymentDate,
              currentPeriodEnd: uData.gmcCurrentPeriodEnd,
              cancelAtPeriodEnd: Boolean(uData.cancelAtPeriodEnd),
              hasConsumedTrial: Boolean(uData.hasUsedTrial),
            };
          }
        }
      } catch (uErr) {
        console.warn('[STATUS_GET_USER_DOC_WARN]', uErr);
      }
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
