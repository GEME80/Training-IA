/**
 * API ROUTE: RESOLUCIÓN DE ACCESO EN TIEMPO REAL ("EFECTO NETFLIX")
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';

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

    return NextResponse.json({
      success: true,
      resolution,
    });
  } catch (error: any) {
    console.error('[STATUS_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error consultando estado' }, { status: 500 });
  }
}
