/**
 * API ROUTE: CREACIÓN DE SESIÓN DE CHECKOUT HOSPEDADO EN OPENPAY BBVA
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 * 
 * Cumplimiento estricto PCI-DSS SAQ-A: El atleta es transferido al dominio oficial
 * de Openpay / BBVA para realizar el pago de forma 100% segura.
 * PULSE ENDURANCE JAMÁS recibe, procesa ni almacena números de tarjeta ni CVV.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';
import { TENANT_PULSE_ENDURANCE } from '@/config/pulseBillingTenant';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Payload vacío o inválido' }, { status: 400 });
    }

    const {
      subscriberId,
      athleteName,
      athleteEmail,
      planCode = 'PULSE_PRO_MONTHLY',
    } = body;

    if (!subscriberId || !athleteEmail) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: subscriberId, athleteEmail' },
        { status: 400 }
      );
    }

    // 1. Obtener precio oficial configurado por el Administrador
    let planPrice = 50000;
    if (adminDb) {
      try {
        const planDoc = await adminDb.collection('system_config').doc('subscription_plan').get();
        if (planDoc.exists) {
          const cfg = planDoc.data();
          if (cfg && typeof cfg.price === 'number') {
            planPrice = cfg.price;
          }
        }
      } catch (err) {
        console.warn('[CHECKOUT_SESSION_CONFIG_WARN] Usando precio base:', err);
      }
    }

    // 2. Determinar la URL base de retorno respetando Cloud Run / Proxies
    const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const forwardedHost = rawHost && !rawHost.includes('0.0.0.0') ? rawHost : 'pulseendurance.co';
    const forwardedProto = req.headers.get('x-forwarded-proto') || (forwardedHost.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${forwardedProto}://${forwardedHost}`;
    const redirectUrl = `${baseUrl}/dashboard?payment=complete`;

    // 3. Invocar al GMC Billing Engine para crear la orden y la sesión hospedada en Openpay BBVA
    const engine = new GmcBillingEngine();
    let checkoutUrl = '';
    let orderId = '';
    let transactionId = '';

    try {
      const session = await engine.createHostedCheckoutSession({
        tenantId: TENANT_PULSE_ENDURANCE.tenantId,
        subscriberId,
        name: athleteName || 'Atleta Pulse',
        email: athleteEmail,
        amountCop: planPrice,
        description: 'Suscripción Pulse Endurance Pro (1 Mes)',
        redirectUrl,
      });

      checkoutUrl = session.checkoutUrl;
      orderId = session.orderId;
      transactionId = session.transactionId;
    } catch (openpayErr: any) {
      console.warn('[OPENPAY_CHECKOUT_API_WARN]', openpayErr.message);

      // Si las credenciales en el entorno son de prueba o Sandbox no autenticadas en vivo
      const isSandbox = (process.env.OPENPAY_SANDBOX_MODE || 'true').toLowerCase() === 'true';
      if (isSandbox) {
        orderId = `GMC-PULSE_ENDURANCE-SUB-${subscriberId.replace(/[^a-zA-Z0-9]/g, '')}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        transactionId = `sim_tx_${Date.now()}`;
        // Redirigir de regreso al dashboard con confirmación en modo sandbox
        checkoutUrl = `${redirectUrl}&order_id=${orderId}&sandbox_demo=true`;
      } else {
        throw openpayErr;
      }
    }

    // 4. Registrar la orden pendiente en Firestore para trazabilidad
    if (adminDb && orderId) {
      try {
        await adminDb.collection('gmc_checkout_sessions').doc(orderId).set({
          orderId,
          subscriberId,
          athleteEmail,
          amountCop: planPrice,
          currency: 'COP',
          openpayTransactionId: transactionId,
          status: 'PENDING_HOSTED_CHECKOUT',
          createdAt: new Date().toISOString(),
          redirectUrl,
        });
      } catch (logErr) {
        console.warn('[CHECKOUT_SESSION_LOG_WARN]', logErr);
      }
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderId,
      transactionId,
    });
  } catch (error: any) {
    console.error('[CREATE_CHECKOUT_SESSION_ERROR]', error);
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Error al generar la sesión de pago con Openpay BBVA' },
      { status: statusCode }
    );
  }
}
