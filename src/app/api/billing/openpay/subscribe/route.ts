/**
 * API ROUTE: ALTA DE SUSCRIPCIÓN CON TARJETA (TRIAL 7 DÍAS O COBRO INMEDIATO)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
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
      name,
      email,
      planCode = 'PULSE_PRO_MONTHLY',
      tokenId,
      deviceSessionId,
    } = body;

    if (!subscriberId || !email || !tokenId || !deviceSessionId) {
      return NextResponse.json(
        { error: 'Faltan parámetros obligatorios: subscriberId, email, tokenId, deviceSessionId' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;

    // Obtener la configuración dinámica del plan (precio y días de trial fijados por el Administrador)
    let dynamicTenantConfig = { ...TENANT_PULSE_ENDURANCE };
    let configuredPrice = 99000;
    if (adminDb) {
      try {
        const planDoc = await adminDb.collection('system_config').doc('subscription_plan').get();
        if (planDoc.exists) {
          const cfg = planDoc.data();
          if (cfg) {
            configuredPrice = typeof cfg.price === 'number' ? cfg.price : 99000;
            dynamicTenantConfig = {
              ...TENANT_PULSE_ENDURANCE,
              plans: TENANT_PULSE_ENDURANCE.plans.map((p) => {
                if (p.planCode === 'PULSE_PRO_MONTHLY') {
                  return {
                    ...p,
                    amountCop: configuredPrice,
                    trialDays: typeof cfg.trialDays === 'number' ? cfg.trialDays : p.trialDays,
                    dunningGraceHours: typeof cfg.dunningGraceHours === 'number' ? cfg.dunningGraceHours : p.dunningGraceHours,
                  };
                }
                return p;
              }),
            };
          }
        }
      } catch (e) {
        console.warn('[SUBSCRIBE_CONFIG_WARN] Usando configuración base de Pulse:', e);
      }
    }

    const engine = new GmcBillingEngine();
    const result = await engine.startSubscriptionFlow({
      tenantConfig: dynamicTenantConfig,
      subscriberId,
      name: name || 'Atleta Pulse',
      email,
      planCode,
      tokenId,
      deviceSessionId,
      clientIp,
    });

    // Sincronizar en el perfil del usuario en Firestore para compatibilidad con la plataforma
    if (adminDb) {
      try {
        const nextBillingDate = result.record.trialEndDate || result.record.currentPeriodEnd;
        const cycleDay = new Date(nextBillingDate).getDate();

        await adminDb.collection('users').doc(subscriberId).set(
          {
            billingStatus: 'PAID',
            billingCycleDay: cycleDay,
            planPrice: configuredPrice,
            planCurrency: 'COP',
            paymentMethod: 'OPENPAY_CARD',
            lastPaymentDate: new Date().toISOString(),
            gmcSubscriptionStatus: result.record.status,
            gmcCurrentPeriodEnd: result.record.currentPeriodEnd,
            gmcTrialEndDate: result.record.trialEndDate,
            isTrialActive: result.isTrial,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.error('[SYNC_PULSE_PROFILE_WARN] Error sincronizando perfil del atleta:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      isTrial: result.isTrial,
      trialDaysApplied: result.trialDaysApplied,
      status: result.record.status,
      currentPeriodEnd: result.record.currentPeriodEnd,
      trialEndDate: result.record.trialEndDate,
    });
  } catch (error: any) {
    console.error('[SUBSCRIBE_ROUTE_ERROR]', error);
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Error al procesar la suscripción con Openpay' },
      { status: statusCode }
    );
  }
}
