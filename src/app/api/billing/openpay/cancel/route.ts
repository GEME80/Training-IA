/**
 * API ROUTE: CANCELACIÓN PROGRAMADA DE SUSCRIPCIÓN (EFECTO NETFLIX)
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
    await engine.scheduleCancellation(tenantId, subscriberId);

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente. Seguirás teniendo acceso activo hasta el fin de tu periodo actual sin cobros futuros.',
    });
  } catch (error: any) {
    console.error('[CANCEL_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error al programar cancelación' }, { status: 500 });
  }
}
