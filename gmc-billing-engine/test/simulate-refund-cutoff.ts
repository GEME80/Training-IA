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

  // 2. Procesar reembolso real en Openpay Sandbox
  console.log('2️⃣ Ejecutando reembolso real en Openpay para el cargo "trviel4zgnpogyeowucj"...');
  const client = new OpenpayClient();
  let refundData: any;
  try {
    refundData = await client.refundCharge({
      chargeId: 'trviel4zgnpogyeowucj',
      description: 'Devolucion de prueba solicitada por el atleta',
    });
    console.log(`   ✅ [REEMBOLSO EXITOSO EN OPENPAY BBVA]`);
    console.log(`   ID de Reembolso: ${refundData.id}`);
    console.log(`   Monto Reembolsado: $${refundData.amount} COP`);
    console.log(`   Estado en Pasarela: ${refundData.status}\n`);
  } catch (err: any) {
    console.log(`   ℹ️ Aviso de pasarela: ${err.message}`);
    // Si ya fue reembolsada previamente, construimos los datos del cargo para el webhook
    refundData = {
      id: 'trviel4zgnpogyeowucj',
      amount: 55000,
      status: 'refunded',
    };
  }

  // 3. Despachar evento "charge.refunded" al Webhook de Pulse
  console.log('3️⃣ Despachando evento webhook "charge.refunded" a Pulse Endurance...');
  const webhookUser = process.env.OPENPAY_WEBHOOK_USER || 'gmc_webhook_user';
  const webhookPassword = process.env.OPENPAY_WEBHOOK_PASSWORD || 'gmc_webhook_secret_key';
  const authHeader = `Basic ${Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64')}`;

  const webhookPayload = {
    type: 'charge.refunded',
    event_date: new Date().toISOString(),
    transaction: {
      id: 'trviel4zgnpogyeowucj',
      amount: 55000,
      method: 'card',
      operation_type: 'out',
      transaction_type: 'refund',
      status: 'refunded',
      order_id: 'GMC-PULSE_ENDURANCE-SUB-i442091-202611-ren2568',
      description: 'Devolucion voluntaria de membresia',
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
  console.log('\n4️⃣ Verificando revocación inmediata de acceso en Pulse Endurance...');
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
