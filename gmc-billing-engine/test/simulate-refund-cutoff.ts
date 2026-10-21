/**
 * SIMULADOR DE PRUEBA 3: DEVOLUCIÓN / REEMBOLSO (REFUND INSTANT CUTOFF)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch {}

import { OpenpayClient } from '../src/providers/openpay/client';

async function runRefundSimulation() {
  console.log('================================================================================');
  console.log('💸 PRUEBA 3: SIMULACIÓN DE DEVOLUCIÓN / REEMBOLSO EN VIVO (REFUND CUTOFF)');
  console.log('   Suscripción Pulse Atleta Pro ($55.000 COP) - Suscriptor: i442091');
  console.log('================================================================================\n');

  // 1. Consultar estado actual
  console.log('1️⃣ Consultando estado previo del suscriptor en Pulse Endurance...');
  const initialRes = await fetch('https://pulseendurance.co/api/billing/openpay/status?subscriberId=i442091');
  const initialData = await initialRes.json().catch(() => null);

  console.log(`   Estado previo: ${initialData?.record?.status}`);
  console.log(`   Acceso activo: ${initialData?.resolution?.hasAccess}`);
  console.log(`   Días restantes antes del reembolso: ${initialData?.resolution?.daysRemaining} días\n`);

  // 2. Crear un cargo real en Openpay Sandbox y luego reembolsarlo inmediatamente
  console.log('2️⃣ Creando cargo de prueba en Openpay Sandbox para procesar la reversión...');
  const client = new OpenpayClient();
  const timestamp = Date.now().toString().slice(-4);
  const orderId = `GMC-PULSE_ENDURANCE-SUB-i442091-202611-rf${timestamp}`;

  const token = await (client as any).request('/tokens', {
    method: 'POST',
    body: JSON.stringify({
      holder_name: 'German Morales',
      card_number: '5555555555554444',
      expiration_year: '28',
      expiration_month: '12',
      cvv2: '123',
    }),
  });

  const charge = await (client as any).request('/charges', {
    method: 'POST',
    body: JSON.stringify({
      source_id: token.id,
      method: 'card',
      amount: 55000,
      currency: 'COP',
      description: 'Cargo a Reembolsar Pulse Pro',
      order_id: orderId,
      device_session_id: 'k62f9a1b0c3d4e5f6a7b8c9d0e1f2a3b',
      customer: {
        name: 'German',
        last_name: 'Morales',
        email: 'gerkof@gmail.com',
        phone_number: '3001234567',
      },
    }),
  });

  console.log(`   ✅ [CARGO GENERADO EN OPENPAY] ID: ${charge.id} | Monto: $${charge.amount} COP`);

  console.log(`\n3️⃣ Ejecutando reembolso oficial en Openpay BBVA para el cargo "${charge.id}"...`);
  const refundData = await client.refundCharge({
    chargeId: charge.id,
    description: 'Devolucion voluntaria de prueba por el suscriptor',
  });
  console.log(`   ✅ [REEMBOLSO PROCESADO EN OPENPAY] ID: ${refundData.id} | Estado: ${refundData.status}`);

  // 3. Despachar evento "charge.refunded" al Webhook de Pulse
  console.log('\n4️⃣ Despachando evento webhook "charge.refunded" a Pulse Endurance...');
  const webhookUser = process.env.OPENPAY_WEBHOOK_USER || 'gmc_webhook_user';
  const webhookPassword = process.env.OPENPAY_WEBHOOK_PASSWORD || 'gmc_webhook_secret_key';
  const authHeader = `Basic ${Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64')}`;

  const webhookPayload = {
    type: 'charge.refunded',
    event_date: new Date().toISOString(),
    transaction: {
      id: charge.id,
      amount: 55000,
      method: 'card',
      operation_type: 'out',
      transaction_type: 'refund',
      status: 'refunded',
      order_id: orderId,
      description: 'Devolucion de membresia',
    },
  };

  const webhookRes = await fetch('https://pulseendurance.co/api/billing/openpay/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify(webhookPayload),
  });

  const webhookResult = await webhookRes.json().catch(() => null);
  console.log(`   Respuesta del Webhook HTTP ${webhookRes.status}:`, JSON.stringify(webhookResult));

  // 4. Verificar revocación inmediata de acceso
  console.log('\n5️⃣ Verificando revocación inmediata de acceso en Pulse Endurance...');
  const updatedRes = await fetch('https://pulseendurance.co/api/billing/openpay/status?subscriberId=i442091');
  const updatedData = await updatedRes.json().catch(() => null);

  console.log(`   Nuevo Estado: ${updatedData?.record?.status}`);
  console.log(`   Acceso Habilitado: ${updatedData?.resolution?.hasAccess}`);
  console.log(`   Días Restantes: ${updatedData?.resolution?.daysRemaining}`);

  console.log('\n================================================================================');
  if (updatedData?.resolution?.hasAccess === false && updatedData?.record?.status === 'CANCELLED_LOCKED') {
    console.log('🎉 RESULTADO: PRUEBA 3 DE REEMBOLSO / CORTE INMEDIATO SUPERADA CON ÉXITO');
    console.log('   El dinero fue devuelto y el acceso a la plataforma fue revocado inmediatamente.');
  } else {
    console.log('❌ Verificando respuesta de estado:', JSON.stringify(updatedData));
  }
  console.log('================================================================================');
}

runRefundSimulation().catch(console.error);
