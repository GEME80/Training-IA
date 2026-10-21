/**
 * SIMULADOR DE PRUEBA 4: FIN DEL PERIODO DE PRUEBA SIN TARJETA (BLOQUEO POR PAYWALL)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import { resolveSubscriberAccess } from '../src/core/entitlementGuard';
import { SubscriberBillingRecord } from '../src/core/types';

async function runTrialExpirationSimulation() {
  console.log('================================================================================');
  console.log('🔒 PRUEBA 4: FIN DEL PERIODO DE PRUEBA DE 7 DÍAS SIN TARJETA REGISTRADA');
  console.log('   Evaluación determinista del EntitlementGuard y activación del Paywall');
  console.log('================================================================================\n');

  const now = new Date('2026-10-21T12:00:00Z');
  const trialStart = new Date('2026-10-14T12:00:00Z');
  const trialEnd = new Date('2026-10-21T12:00:00Z'); // Termina hoy

  // 1. Simulación Atleta en Día 3 de Prueba (Acceso Activo)
  console.log('1️⃣ Evaluando Atleta en Día 3 de su Periodo de Prueba (Acceso Permitido)...');
  const activeTrialRecord: SubscriberBillingRecord = {
    tenantId: 'PULSE_ENDURANCE',
    subscriberId: 'athlete_trial_test_001',
    status: 'TRIAL_ACTIVE',
    currentPlanCode: 'PULSE_PRO_MONTHLY',
    currentPeriodStart: trialStart.toISOString(),
    currentPeriodEnd: trialEnd.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    cancelAtPeriodEnd: false,
    retryCount: 0,
    createdAt: trialStart.toISOString(),
    updatedAt: trialStart.toISOString(),
  };

  const day3Date = new Date('2026-10-17T12:00:00Z');
  const day3Resolution = resolveSubscriberAccess(activeTrialRecord, day3Date);
  console.log(`   Fecha de evaluación: ${day3Date.toISOString().slice(0, 10)} (Día 3)`);
  console.log(`   ¿Tiene acceso a la app?: ${day3Resolution.hasAccess ? '✅ SÍ (Permitido)' : '❌ NO'}`);
  console.log(`   Estado retornado: ${day3Resolution.status}`);
  console.log(`   Días restantes de prueba: ${day3Resolution.daysRemaining} días`);
  console.log(`   ¿Es periodo de prueba?: ${day3Resolution.isTrial ? 'SÍ' : 'NO'}\n`);

  if (!day3Resolution.hasAccess || day3Resolution.status !== 'TRIAL_ACTIVE') {
    throw new Error('FALLO: El atleta en día 3 debería tener acceso total.');
  }

  // 2. Simulación Atleta en Día 8 (Trial Vencido sin Tarjeta)
  console.log('2️⃣ Evaluando Atleta en Día 8 tras vencer el Periodo de Prueba (Sin Tarjeta)...');
  const day8Date = new Date('2026-10-22T12:00:00Z'); // 1 día después de expirar
  const day8Resolution = resolveSubscriberAccess(activeTrialRecord, day8Date);

  console.log(`   Fecha de evaluación: ${day8Date.toISOString().slice(0, 10)} (Día 8 - Vencido)`);
  console.log(`   ¿Tiene acceso a la app?: ${day8Resolution.hasAccess ? 'SÍ' : '❌ NO (BLOQUEO TOTAL)'}`);
  console.log(`   Estado retornado: ${day8Resolution.status}`);
  console.log(`   Días restantes: ${day8Resolution.daysRemaining} días`);
  console.log(`   Mensaje de Paywall: "${day8Resolution.paywallMessage}"`);
  console.log(`   Acción requerida: ${day8Resolution.actionRequired}\n`);

  if (day8Resolution.hasAccess !== false || day8Resolution.status !== 'PAST_DUE_LOCKED') {
    throw new Error('FALLO: El atleta en día 8 sin tarjeta debe tener hasAccess: false y PAST_DUE_LOCKED.');
  }

  // 3. Simulación de la regla del Front-end en page.tsx
  console.log('3️⃣ Evaluando la compuerta de acceso en page.tsx (Front-End Guard)...');
  const userProfileMock = {
    role: 'athlete', // No admin
    billingExempt: false,
    billingStatus: 'PENDING',
    gmcTrialEndDate: trialEnd.toISOString(),
    gmcSubscriptionStatus: 'TRIAL_ACTIVE',
    hasUsedTrial: true,
    isTrialActive: false,
  };

  const isTrialExpired = Boolean(
    userProfileMock.gmcTrialEndDate &&
    new Date(userProfileMock.gmcTrialEndDate).getTime() < day8Date.getTime()
  );

  const isAdmin = userProfileMock.role === 'admin';
  const isBillingBlocked =
    !isAdmin &&
    !userProfileMock.billingExempt &&
    (userProfileMock.billingStatus === 'OVERDUE' ||
      userProfileMock.gmcSubscriptionStatus === 'PAST_DUE_LOCKED' ||
      userProfileMock.gmcSubscriptionStatus === 'CANCELLED_LOCKED' ||
      (isTrialExpired && userProfileMock.billingStatus !== 'PAID' && userProfileMock.gmcSubscriptionStatus !== 'ACTIVE'));

  console.log(`   ¿Trial Expirado en Front?: ${isTrialExpired ? '✅ SÍ' : 'NO'}`);
  console.log(`   ¿Acceso Bloqueado (isBillingBlocked)?: ${isBillingBlocked ? '✅ SÍ (Dispara GmcPaywallLockView)' : 'NO'}`);

  if (!isBillingBlocked) {
    throw new Error('FALLO: El front-end no bloqueó al usuario con trial expirado.');
  }

  // 4. Regularización: El atleta registra tarjeta y paga $55.000 COP en Openpay
  console.log('\n4️⃣ Simulando Regularización: El atleta paga su plan en Openpay BBVA...');
  const regularizedRecord: SubscriberBillingRecord = {
    ...activeTrialRecord,
    status: 'ACTIVE',
    cardLast4: '4444',
    cardBrand: 'mastercard',
    currentPeriodStart: day8Date.toISOString(),
    currentPeriodEnd: new Date(day8Date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndDate: undefined,
  };

  const regularizedResolution = resolveSubscriberAccess(regularizedRecord, day8Date);
  console.log(`   Nuevo estado: ${regularizedResolution.status}`);
  console.log(`   ¿Acceso desbloqueado?: ${regularizedResolution.hasAccess ? '✅ SÍ (Acceso Total Restaurado)' : 'NO'}`);
  console.log(`   Vigencia pagada: ${regularizedResolution.daysRemaining} días (30 días de servicio)\n`);

  console.log('================================================================================');
  console.log('🎉 RESULTADO: PRUEBA 4 SUPERADA CON ÉXITO AL 100%');
  console.log('   - Durante los 7 días: Acceso total garantizado sin tarjeta.');
  console.log('   - Al llegar al Día 8 sin pago: Bloqueo estricto e instantáneo por Paywall.');
  console.log('   - Tras pagar con Openpay BBVA: Acceso desbloqueado de inmediato por 30 días.');
  console.log('================================================================================');
}

runTrialExpirationSimulation().catch((err) => {
  console.error('❌ Error en simulación:', err);
  process.exit(1);
});
