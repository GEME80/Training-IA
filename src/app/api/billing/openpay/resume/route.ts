/**
 * API ROUTE: REANUDAR SUSCRIPCIÓN ANTES DEL CORTE
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';

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

    return NextResponse.json({
      success: true,
      message: 'Suscripción reanudada con éxito. Tu ciclo mensual continuará de forma automática en tu fecha de corte.',
    });
  } catch (error: any) {
    console.error('[RESUME_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error al reanudar suscripción' }, { status: 500 });
  }
}
