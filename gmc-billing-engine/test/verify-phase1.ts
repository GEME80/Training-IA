/**
 * VERIFICACIÓN AUTOMATIZADA DE LA FASE 1: NÚCLEO FINANCIERO Y AGENTES FINSEC
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting
 */

import { resolveSubscriberAccess } from '../src/core/entitlementGuard';
import { SentinelAntiFraudAgent } from '../src/agents/sentinelAntiFraud';
import { ForensicLedgerAuditorAgent } from '../src/agents/forensicLedgerAuditor';
import { WebhookCryptoRouterAgent } from '../src/agents/webhookCryptoRouter';
import { generateDeterministicOrderId } from '../src/core/idempotencyLock';
import { SubscriberBillingRecord } from '../src/core/types';

function runAssertions() {
  console.log('====================================================');
  console.log('🚀 INICIANDO VERIFICACIÓN DE FASE 1 (GMC BILLING ENGINE)');
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

  // ------------------------------------------------------------------
  // 1. ENTITLEMENT GUARD (Efecto Netflix)
  // ------------------------------------------------------------------
  console.log('--- 1. Pruebas de Entitlement Guard (Máquina de Estados) ---');
  const now = new Date('2026-10-20T12:00:00Z');

  // Caso A: Atleta en Día 3 de 7 de prueba
  const trialSub: SubscriberBillingRecord = {
    tenantId: 'PULSE_ENDURANCE',
    subscriberId: 'atleta_101',
    email: 'atleta@pulse.com',
    status: 'TRIAL_ACTIVE',
    currentPlanCode: 'PULSE_PRO',
    openpayCustomerId: 'cust_101',
    trialStartDate: '2026-10-17T12:00:00Z',
    trialEndDate: '2026-10-24T12:00:00Z',
    currentPeriodStart: '2026-10-17T12:00:00Z',
    currentPeriodEnd: '2026-10-24T12:00:00Z',
    cancelAtPeriodEnd: false,
    hasConsumedTrial: true,
    createdAt: '2026-10-17T12:00:00Z',
    updatedAt: '2026-10-17T12:00:00Z',
  };
  const resTrial = resolveSubscriberAccess(trialSub, now);
  assert('Trial activo otorga acceso', resTrial.hasAccess === true);
  assert('Trial activo identifica que es trial', resTrial.isTrial === true);
  assert('Trial activo calcula 4 días restantes', resTrial.daysRemaining === 4);

  // Caso B: Trial vencido sin cobro
  const expiredTrialSub: SubscriberBillingRecord = {
    ...trialSub,
    trialEndDate: '2026-10-19T12:00:00Z',
  };
  const resExpiredTrial = resolveSubscriberAccess(expiredTrialSub, now);
  assert('Trial vencido bloquea acceso con Paywall', resExpiredTrial.hasAccess === false);
  assert('Trial vencido marca PAST_DUE_LOCKED', resExpiredTrial.status === 'PAST_DUE_LOCKED');

  // Caso C: Cancelación a mitad de mes pagado (Efecto Netflix)
  const cancelScheduledSub: SubscriberBillingRecord = {
    ...trialSub,
    status: 'CANCEL_SCHEDULED',
    currentPeriodEnd: '2026-11-10T12:00:00Z',
    cancelAtPeriodEnd: true,
  };
  const resCancel = resolveSubscriberAccess(cancelScheduledSub, now);
  assert('Cancelación programada respeta acceso hasta fin de mes', resCancel.hasAccess === true);
  assert('Cancelación programada marca willCancelAtPeriodEnd = true', resCancel.willCancelAtPeriodEnd === true);

  // Caso D: Atleta Becado / Lista Blanca de Cortesía
  const exemptSub: any = {
    ...trialSub,
    status: 'PAST_DUE_LOCKED',
    currentPeriodEnd: '2026-01-01T00:00:00Z',
    billingExempt: true,
  };
  const resExempt = resolveSubscriberAccess(exemptSub, now);
  assert('Atleta becado en lista blanca tiene acceso permanente activo', resExempt.hasAccess === true);
  assert('Atleta becado marca status ACTIVE', resExempt.status === 'ACTIVE');

  // ------------------------------------------------------------------
  // 2. AGENTE 1: SENTINEL-ANTIFRAUD (PCI Sanitize & Device Session)
  // ------------------------------------------------------------------
  console.log('\n--- 2. Pruebas de Agente 1: Sentinel Anti-Fraud ---');
  let pciBlocked = false;
  try {
    SentinelAntiFraudAgent.assertNoRawPci({
      name: 'Germán',
      card_number: '4111111111111111', // Prohibido
    });
  } catch (err: any) {
    pciBlocked = err.message.includes('PCI_VIOLATION_ABORT');
  }
  assert('Sentinel bloquea inmediatamente cualquier campo card_number o PAN (PCI-DSS SAQ-A)', pciBlocked);

  let devSessionBlocked = false;
  try {
    SentinelAntiFraudAgent.assertValidDeviceSession('');
  } catch (err: any) {
    devSessionBlocked = err.message.includes('ANTIFRAUD_DEV01_FAIL');
  }
  assert('Sentinel exige obligatoriamente device_session_id para el motor antifraude de BBVA', devSessionBlocked);

  const fp1 = SentinelAntiFraudAgent.generateCardFingerprint('411111', '1111', 'GERMAN MORALES');
  const fp2 = SentinelAntiFraudAgent.generateCardFingerprint('411111', '1111', 'GERMAN MORALES');
  const fpDiff = SentinelAntiFraudAgent.generateCardFingerprint('555555', '4444', 'OTRO USUARIO');
  assert('Fingerprint de tarjeta es determinista e inmutable', fp1 === fp2 && fp1 !== fpDiff);

  // ------------------------------------------------------------------
  // 3. AGENTE 2: IDEMPOTENCY & MUTEX LOCK
  // ------------------------------------------------------------------
  console.log('\n--- 3. Pruebas de Agente 2: Idempotency & Order IDs ---');
  const orderId = generateDeterministicOrderId('PULSE_ENDURANCE', 'atleta_777', now);
  assert('Order ID determinista cumple formato GMC-TENANT-SUB-ID-YYYYMM', orderId === 'GMC-PULSE_ENDURANCE-SUB-atleta_777-202610');

  // ------------------------------------------------------------------
  // 4. AGENTE 3: WEBHOOK CRYPTO ROUTER
  // ------------------------------------------------------------------
  console.log('\n--- 4. Pruebas de Agente 3: Webhook Crypto Router ---');
  const parsedOrder = WebhookCryptoRouterAgent.parseOrderId(orderId);
  assert('Parser de Order ID extrae tenantId correctamente', parsedOrder?.tenantId === 'PULSE_ENDURANCE');
  assert('Parser de Order ID extrae subscriberId correctamente', parsedOrder?.subscriberId === 'atleta_777');

  // ------------------------------------------------------------------
  // 5. AGENTE 5: FORENSIC LEDGER AUDITOR (Desglose BBVA Openpay)
  // ------------------------------------------------------------------
  console.log('\n--- 5. Pruebas de Agente 5: Forensic Ledger Auditor ---');
  // Plan de $99.000 COP
  // Variable: 99.000 * 2.99% = 2.960 COP
  // Fijo: 800 COP
  // Comisión base: 3.760 COP
  // IVA 19%: 714 COP
  // Deducción Total: 4.474 COP
  // Neto: 94.526 COP
  const split = ForensicLedgerAuditorAgent.calculateOpenpaySplit(99000);
  assert('Cálculo de comisión variable + fija de Openpay es exacto (3.760 COP)', split.openpayFeeCop === 3760);
  assert('Cálculo de IVA sobre comisión es exacto (714 COP)', split.openpayVatCop === 714);
  assert('Deducción total es exacta (4.474 COP)', split.totalDeductionCop === 4474);
  assert('Neto a liquidar en BBVA es exacto (94.526 COP)', split.netAmountCop === 94526);

  console.log('\n====================================================');
  console.log(`🏁 RESULTADO: ${passed}/${total} PRUEBAS SUPERADAS EXITOSAMENTE`);
  console.log('====================================================\n');
}

runAssertions();
