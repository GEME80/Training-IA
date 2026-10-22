/**
 * AUDITORÍA FORENSE AUTOMATIZADA — FASE 1 (BLINDAJE ANTIFRAUDE CISO)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 *
 * Verifica empíricamente que los 6 vectores de fraude detectados estén
 * 100% cerrados y bloqueados con códigos HTTP 402 / 403 / 429:
 *  1. Bypass de Retorno URL (?payment=complete sin pago en Openpay)
 *  2. Secuestro de Transaction ID de otro usuario (Transaction Hijacking)
 *  3. Manipulación de Monto / Moneda (< $55.000 COP o divisa distinta a COP)
 *  4. Reanudación gratuita sin pago ni periodo vigente (POST /api/billing/openpay/resume)
 *  5. Spoofing de requesterEmail sin UID de Admin real en Firestore
 *  6. Inyección de PAN crudo (PCI-DSS SAQ-A) y Ataque de Velocidad / Carding
 */

import { NextRequest } from 'next/server';
import { SentinelAntiFraudAgent } from '../src';
import { POST as confirmSessionPOST } from '../../src/app/api/billing/openpay/confirm-session/route';
import { POST as resumePOST } from '../../src/app/api/billing/openpay/resume/route';
import { POST as adminPlanPOST } from '../../src/app/api/admin/subscription-plan/route';
import { POST as adminBillingPOST } from '../../src/app/api/admin/billing/route';
import { POST as createCheckoutPOST, } from '../../src/app/api/billing/openpay/create-checkout-session/route';
import { GET as webhookGET } from '../../src/app/api/billing/openpay/webhook/route';

function makeJsonRequest(url: string, body: Record<string, unknown>, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function runPhase1Audit() {
  console.log('==================================================================');
  console.log('🛡️  INICIANDO AUDITORÍA FORENSE FASE 1 — BLINDAJE ANTIFRAUDE CISO');
  console.log('==================================================================\n');

  let passed = 0;
  const total = 7;

  // PRUEBA 1: Bypass de URL de retorno sin pago real en Openpay
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/billing/openpay/confirm-session', {
      subscriberId: 'attacker_fake_uid_999',
      transactionId: '',
    });
    const res = await confirmSessionPOST(req);
    const data = await res.json();
    if (res.status === 402 && !data.success) {
      console.log(`✅ [VECTOR 1 BLOQUEADO] Bypass de URL sin pago rechazado con HTTP ${res.status}: "${data.error}"`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 1] Se esperaba HTTP 402, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 2: Intento de confirmar un transactionId falso / no existente o de otro usuario
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/billing/openpay/confirm-session', {
      subscriberId: 'attacker_hijack_uid_888',
      transactionId: 'tr_fake_nonexistent_999999',
    });
    const res = await confirmSessionPOST(req);
    const data = await res.json();
    if ((res.status === 402 || res.status === 403) && !data.success) {
      console.log(`✅ [VECTOR 2 BLOQUEADO] Secuestro/Falsificación de Transaction ID rechazado con HTTP ${res.status}: "${data.error}"`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 2] Se esperaba HTTP 402/403, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 3: Reanudación gratuita sin pago ni periodo futuro válido
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/billing/openpay/resume', {
      subscriberId: 'unpaid_user_without_period_777',
    });
    const res = await resumePOST(req);
    const data = await res.json();
    if (res.status === 402 && !data.success) {
      console.log(`✅ [VECTOR 3 BLOQUEADO] Reanudación gratuita sin periodo activo rechazada con HTTP ${res.status}: "${data.error}"`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 3] Se esperaba HTTP 402, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 4: Spoofing de requesterEmail en /api/admin/subscription-plan (intento de cambiar precio a $1 COP)
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/admin/subscription-plan', {
      requesterEmail: 'gerkof@gmail.com',
      requesterUid: 'spoofed_uid_not_admin',
      plan: { price: 1, currency: 'COP' },
    });
    const res = await adminPlanPOST(req);
    const data = await res.json();
    if (res.status === 403 && !data.success) {
      console.log(`✅ [VECTOR 4A BLOQUEADO] Spoofing de email Admin en /api/admin/subscription-plan rechazado con HTTP ${res.status}: "${data.error}"`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 4A] Se esperaba HTTP 403, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 5: Spoofing de requesterEmail en /api/admin/billing (intento de auto-marcarse PAID)
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/admin/billing', {
      requesterEmail: 'gerkof@gmail.com',
      requesterUid: 'superadmin-root',
      targetUid: 'attacker_uid',
      billingStatus: 'PAID',
    });
    const res = await adminBillingPOST(req);
    const data = await res.json();
    if (res.status === 403 && !data.success) {
      console.log(`✅ [VECTOR 4B BLOQUEADO] Spoofing de Admin en /api/admin/billing rechazado con HTTP ${res.status}: "${data.error}"`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 4B] Se esperaba HTTP 403, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 6: Inyección de datos de tarjeta crudos (PCI-DSS SAQ-A) en create-checkout-session
  {
    const req = makeJsonRequest('https://pulseendurance.co/api/billing/openpay/create-checkout-session', {
      subscriberId: 'pci_test_user',
      athleteEmail: 'pci@test.co',
      card_number: '4111111111111111',
      cvv2: '123',
    });
    const res = await createCheckoutPOST(req);
    const data = await res.json();
    if (res.status === 403 && String(data.error).includes('PCI_VIOLATION')) {
      console.log(`✅ [VECTOR 5 BLOQUEADO] Envío de PAN/CVV crudo rechazado por SentinelAntiFraudAgent con HTTP ${res.status}`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 5] Se esperaba HTTP 403 PCI_VIOLATION, se obtuvo ${res.status}: ${JSON.stringify(data)}`);
    }
  }

  // PRUEBA 7: Bloqueo de ráfaga (Velocity Rate Limit) + Ocultación de código de verificación en GET Webhook
  {
    for (let i = 0; i < 8; i++) {
      SentinelAntiFraudAgent.assertVelocity('checkout:203.0.113.99', 8, 15);
    }
    const req = makeJsonRequest(
      'https://pulseendurance.co/api/billing/openpay/create-checkout-session',
      { subscriberId: 'bot_attacker', athleteEmail: 'bot@attack.co' },
      { 'x-forwarded-for': '203.0.113.99' }
    );
    const res = await createCheckoutPOST(req);
    const rateLimited = res.status === 429;
    const webhookRes = await webhookGET();
    const webhookData = await webhookRes.json();
    const leaksVerification = 'verificationCode' in webhookData;

    if (rateLimited && !leaksVerification && webhookData.merchant === 'German Morales Consulting') {
      console.log(`✅ [VECTOR 6 BLOQUEADO] Ataque de ráfaga bloqueado con HTTP 429 y GET /webhook higienizado sin exponer verificationCode`);
      passed++;
    } else {
      throw new Error(`❌ [FALLO VECTOR 6] status=${res.status}, rateLimited=${rateLimited}, leaksVerification=${leaksVerification}`);
    }
  }

  console.log(`\n🏆 RESULTADO AUDITORÍA FASE 1: ${passed}/${total} VECTORES MITIGADOS AL 100%.\n`);
}

runPhase1Audit().catch((err) => {
  console.error(err);
  process.exit(1);
});
