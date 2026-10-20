/**
 * VERIFICACIÓN AUTOMATIZADA DE LA FASE 2: INTEGRACIÓN EN PULSE ENDURANCE (TENANT #1)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { TENANT_PULSE_ENDURANCE } from '../../src/config/pulseBillingTenant';
import { resolveSubscriberAccess } from '../src/core/entitlementGuard';
import { NetflixLifecycleAgent } from '../src/agents/netflixLifecycleDunning';

function runPhase2Assertions() {
  console.log('====================================================');
  console.log('🚀 INICIANDO VERIFICACIÓN DE FASE 2 (PULSE ENDURANCE)');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(description: string, condition: boolean) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
      process.exitCode = 1;
    }
  }

  // 1. Configuración del Tenant Pulse Endurance
  console.log('--- 1. Contrato Plug & Play de Pulse Endurance ---');
  assert('Tenant ID es PULSE_ENDURANCE', TENANT_PULSE_ENDURANCE.tenantId === 'PULSE_ENDURANCE');
  assert('Nombre de exhibición configurado', TENANT_PULSE_ENDURANCE.displayName.includes('Pulse Endurance'));
  
  const proPlan = TENANT_PULSE_ENDURANCE.plans.find((p) => p.planCode === 'PULSE_PRO_MONTHLY');
  assert('Existe el Plan Atleta Pro Mensual', Boolean(proPlan));
  assert('El plan Pro define 7 días de prueba gratuita (trialDays: 7)', proPlan?.trialDays === 7);
  assert('Tarifa mensual es de $99.000 COP', proPlan?.amountCop === 99000);
  assert('Periodo de gracia dunning es de 72 horas', proPlan?.dunningGraceHours === 72);

  // 2. Simulación de Flujo de Suscripción con Trial de 7 Días
  console.log('\n--- 2. Simulación de Ciclo de Vida en Pulse ---');
  const now = new Date('2026-10-20T10:00:00Z');
  
  // Atleta inicia trial de 7 días
  const subRecord = {
    tenantId: TENANT_PULSE_ENDURANCE.tenantId,
    subscriberId: 'atleta_demo_01',
    email: 'atleta@pulseendurance.com',
    status: 'TRIAL_ACTIVE' as const,
    currentPlanCode: 'PULSE_PRO_MONTHLY',
    openpayCustomerId: 'cust_openpay_123',
    openpaySubscriptionId: 'sub_openpay_456',
    cardLast4: '4242',
    cardBrand: 'visa',
    trialStartDate: '2026-10-20T10:00:00Z',
    trialEndDate: '2026-10-27T10:00:00Z',
    currentPeriodStart: '2026-10-20T10:00:00Z',
    currentPeriodEnd: '2026-10-27T10:00:00Z',
    cancelAtPeriodEnd: false,
    hasConsumedTrial: true,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  };

  const day1Access = resolveSubscriberAccess(subRecord, now);
  assert('Día 1: Atleta tiene acceso total con status TRIAL_ACTIVE', day1Access.hasAccess === true && day1Access.status === 'TRIAL_ACTIVE');
  assert('Día 1: Quedan 7 días de prueba', day1Access.daysRemaining === 7);

  // Día 4: Atleta decide cancelar a mitad de prueba
  const day4 = new Date('2026-10-24T10:00:00Z');
  const cancelledInTrial = {
    ...subRecord,
    status: 'CANCEL_SCHEDULED' as const,
    cancelAtPeriodEnd: true,
  };
  const day4Access = resolveSubscriberAccess(cancelledInTrial, day4);
  assert('Día 4: Canceló pero conserva acceso hasta el Día 7 (trialEndDate)', day4Access.hasAccess === true);
  assert('Día 4: Quedan 3 días de acceso gratuito', day4Access.daysRemaining === 3);
  assert('Día 4: willCancelAtPeriodEnd está activado', day4Access.willCancelAtPeriodEnd === true);

  // Día 8: Fin del periodo de prueba cancelado
  const day8 = new Date('2026-10-28T10:00:00Z');
  const day8Access = resolveSubscriberAccess(cancelledInTrial, day8);
  assert('Día 8: Al terminar los 7 días cancelados, el Paywall bloquea el acceso', day8Access.hasAccess === false);
  assert('Día 8: Status pasa a CANCELLED_LOCKED', day8Access.status === 'CANCELLED_LOCKED');

  console.log('\n====================================================');
  console.log(`🏁 RESULTADO FASE 2: ${passed}/${total} PRUEBAS SUPERADAS EXITOSAMENTE`);
  console.log('====================================================\n');
}

runPhase2Assertions();
