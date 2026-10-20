/**
 * API ROUTE: CONFIRMACIÓN Y RETORNO DE SESIÓN DE PAGO OPENPAY BBVA
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.subscriberId) {
      return NextResponse.json({ error: 'subscriberId requerido' }, { status: 400 });
    }

    const { subscriberId, orderId } = body;

    if (adminDb) {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await adminDb.collection('users').doc(subscriberId).set(
        {
          billingStatus: 'PAID',
          gmcSubscriptionStatus: 'ACTIVE',
          isTrialActive: false,
          hasUsedTrial: true,
          lastPaymentDate: now.toISOString(),
          gmcCurrentPeriodEnd: periodEnd.toISOString(),
          paymentMethod: 'OPENPAY_CHECKOUT_HOSTED',
          paymentReference: orderId || `order_${now.getTime()}`,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción activada exitosamente tras retorno de Openpay BBVA',
    });
  } catch (error: any) {
    console.error('[CONFIRM_SESSION_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Error confirmando retorno de pago' },
      { status: 500 }
    );
  }
}
