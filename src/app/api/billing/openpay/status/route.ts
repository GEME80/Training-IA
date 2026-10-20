/**
 * API ROUTE: RESOLUCIÓN DE ACCESO EN TIEMPO REAL ("EFECTO NETFLIX")
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine, NetflixLifecycleAgent } from '@/../gmc-billing-engine/src';

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
    let record = null;
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
