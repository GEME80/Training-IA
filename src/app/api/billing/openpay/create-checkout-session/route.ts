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
    let planPrice = 55000;
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
    const redirectUrl = `${baseUrl}/?payment=complete&subscriberId=${encodeURIComponent(subscriberId)}`;

    // 3. Consultar si existen credenciales de Openpay configuradas en Firestore
    let customConfig: any = undefined;
    if (adminDb) {
      try {
        const credsDoc = await adminDb.collection('system_config').doc('openpay_credentials').get();
        if (credsDoc.exists) {
          const creds = credsDoc.data();
          if (creds?.merchantId && creds?.privateKey) {
            customConfig = {
              OPENPAY_MERCHANT_ID: creds.merchantId,
              OPENPAY_PRIVATE_KEY: creds.privateKey,
              OPENPAY_PUBLIC_KEY: creds.publicKey || creds.merchantId,
              OPENPAY_SANDBOX_MODE: creds.sandboxMode !== false,
              apiBaseUrl: creds.sandboxMode !== false ? 'https://sandbox-api.openpay.co/v1' : 'https://api.openpay.co/v1',
            };
          }
        }
      } catch (cErr) {
        console.warn('[OPENPAY_CUSTOM_CREDS_WARN]', cErr);
      }
    }

    // 4. Invocar al GMC Billing Engine para crear la orden y la sesión hospedada en Openpay BBVA
    const engine = new GmcBillingEngine(customConfig);

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

      // Registrar la orden pendiente en Firestore para trazabilidad
      if (adminDb && session.orderId) {
        try {
          await adminDb.collection('gmc_checkout_sessions').doc(session.orderId).set({
            orderId: session.orderId,
            subscriberId,
            athleteEmail,
            amountCop: planPrice,
            currency: 'COP',
            openpayTransactionId: session.transactionId,
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
        checkoutUrl: session.checkoutUrl,
        orderId: session.orderId,
        transactionId: session.transactionId,
      });
    } catch (openpayErr: any) {
      console.error('[OPENPAY_CHECKOUT_API_ERROR]', openpayErr);
      const isPlaceholder = (process.env.OPENPAY_MERCHANT_ID || '').includes('placeholder');
      const helpfulMsg = isPlaceholder
        ? 'Aviso de Sandbox Openpay: Se requieren las credenciales reales de tu cuenta de Openpay Sandbox (Merchant ID y Llave Privada creadas en sandbox-dashboard.openpay.co).'
        : `Error al conectar con la pasarela bancaria de Openpay BBVA: ${openpayErr.message}`;

      return NextResponse.json(
        {
          error: helpfulMsg,
          rawError: openpayErr.message,
          isPlaceholderCredentials: isPlaceholder,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[CREATE_CHECKOUT_SESSION_ERROR]', error);
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Error al generar la sesión de pago con Openpay BBVA' },
      { status: statusCode }
    );
  }
}
