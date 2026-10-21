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

    const candidateIds = new Set<string>([subscriberId]);
    let uData: any = null;

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
      } catch (uErr) {
        console.warn('[STATUS_GET_USER_DOC_WARN]', uErr);
      }
    }

    // Buscar el registro oficial en gmc_subscriptions para cualquiera de los candidateIds
    let rawRecord: any = null;
    let matchedId = subscriberId;

    for (const cid of candidateIds) {
      try {
        const r = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, cid);
        if (r) {
          rawRecord = r;
          matchedId = cid;
          break;
        }
      } catch {
        // continue
      }
    }

    const engine = new GmcBillingEngine();
    const resolution = await engine.resolveAccess(tenantId, matchedId);

    // Evaluar estado activo en users si existe pago registrado
    const isPaidInUsers = Boolean(
      uData?.billingStatus === 'PAID' ||
      uData?.gmcSubscriptionStatus === 'ACTIVE'
    );

    // Si el usuario pagó pero gmc_subscriptions aún no existía en el engine, asegurar acceso
    if (!rawRecord && isPaidInUsers) {
      resolution.hasAccess = true;
      resolution.status = 'ACTIVE';
      resolution.daysRemaining = 30;
    }

    // Evaluar si la cancelación fue programada en cualquiera de las fuentes
    const isCanceled = Boolean(
      rawRecord?.cancelAtPeriodEnd ||
      rawRecord?.status === 'CANCEL_SCHEDULED' ||
      uData?.cancelAtPeriodEnd ||
      uData?.gmcSubscriptionStatus === 'CANCEL_SCHEDULED'
    );

    const hasActiveSub = Boolean(
      rawRecord?.status === 'ACTIVE' ||
      rawRecord?.status === 'TRIAL_ACTIVE' ||
      isPaidInUsers
    );

    const cardLast4 = rawRecord?.cardLast4 || uData?.cardLast4 || null;
    const cardBrand = rawRecord?.cardBrand || uData?.cardBrand || null;
    const currentPeriodEnd =
      rawRecord?.currentPeriodEnd ||
      uData?.gmcCurrentPeriodEnd ||
      (hasActiveSub ? new Date(Date.now() + 30 * 86400000).toISOString() : null);
    const currentPeriodStart =
      rawRecord?.currentPeriodStart ||
      uData?.gmcCurrentPeriodStart ||
      uData?.lastPaymentDate ||
      null;

    let finalStatus = 'INACTIVE';
    if (isCanceled) {
      finalStatus = 'CANCEL_SCHEDULED';
      resolution.willCancelAtPeriodEnd = true;
      resolution.status = 'CANCEL_SCHEDULED';
    } else if (hasActiveSub) {
      finalStatus = rawRecord?.status || uData?.gmcSubscriptionStatus || 'ACTIVE';
    }

    const record = {
      status: finalStatus,
      currentPlanCode: 'PULSE_PRO_MONTHLY',
      cardLast4,
      cardBrand,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: isCanceled,
      hasConsumedTrial: Boolean(rawRecord?.hasConsumedTrial || uData?.hasUsedTrial),
      hasActiveSubscription: Boolean(hasActiveSub || isCanceled),
    };

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
