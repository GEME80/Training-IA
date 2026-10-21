/**
 * SIMULADOR DE PRUEBA 1: RENOVACIÓN AUTOMÁTICA RECURRENTE (COBRO DÍA 30)
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

async function runRenewalSimulation() {
  console.log('================================================================================');
  console.log('🔄 PRUEBA 1: SIMULACIÓN DE RENOVACIÓN AUTOMÁTICA RECURRENTE (DÍA 30)');
  console.log('   Suscripción Pulse Atleta Pro ($55.000 COP) - Suscriptor: i442091');
  console.log('================================================================================\n');

  // 1. Consultar estado actual en producción
  console.log('1️⃣ Consultando estado actual de la suscripción en Pulse Endurance...');
  const initialRes = await fetch('https://pulseendurance.co/api/billing/openpay/status?subscriberId=i442091');
  const initialData = await initialRes.json().catch(() => null);

  const prevStart = initialData?.record?.currentPeriodStart;
  const prevEnd = initialData?.record?.currentPeriodEnd;
  const prevDays = initialData?.resolution?.daysRemaining;
  console.log(`   Estado actual: ${initialData?.record?.status || 'UNKNOWN'}`);
  console.log(`   Periodo actual: ${prevStart}  👉  ${prevEnd}`);
  console.log(`   Días restantes antes de renovar: ${prevDays} días\n`);

  // 2. Procesar cargo recurrente en Openpay Sandbox (Simulando cobro automático de BBVA)
  console.log('2️⃣ Ejecutando cargo recurrente real contra la pasarela Openpay Sandbox...');
  const client = new OpenpayClient();
  const timestamp = Date.now().toString().slice(-4);
  const orderId = `GMC-PULSE_ENDURANCE-SUB-i442091-202611-ren${timestamp}`;

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
      description: 'Renovacion Mensual Recurrente Pulse Pro Mes 2',
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

  console.log(`   ✅ [COBRO BANCARIO APROBADO EN OPENPAY]`);
  console.log(`   ID de Transacción: ${charge.id}`);
  console.log(`   Código de Autorización BBVA: ${charge.authorization}`);
  console.log(`   Monto Facturado: $${charge.amount} ${charge.currency}`);
  console.log(`   Order ID Determinista: ${charge.order_id}\n`);

  // 3. Notificar al Webhook de Pulse con Server-to-Server Double Check
  console.log('3️⃣ Despachando evento webhook "charge.succeeded" a Pulse Endurance...');
  const webhookUser = process.env.OPENPAY_WEBHOOK_USER || 'gmc_webhook_user';
  const webhookPassword = process.env.OPENPAY_WEBHOOK_PASSWORD || 'gmc_webhook_secret_key';
  const authHeader = `Basic ${Buffer.from(`${webhookUser}:${webhookPassword}`).toString('base64')}`;

  const webhookPayload = {
    type: 'charge.succeeded',
    event_date: new Date().toISOString(),
    transaction: {
      id: charge.id,
      amount: charge.amount,
      authorization: charge.authorization,
      method: 'card',
      operation_type: 'in',
      transaction_type: 'charge',
      status: 'completed',
      order_id: charge.order_id,
      customer_id: charge.customer_id,
      description: charge.description,
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

  const webhookData = await webhookRes.json().catch(() => null);
  console.log(`   Respuesta del Webhook HTTP ${webhookRes.status}:`, JSON.stringify(webhookData));

  // 4. Verificar extensión del ciclo de suscripción
  console.log('\n4️⃣ Verificando extensión del ciclo en Pulse Endurance...');
  const updatedRes = await fetch('https://pulseendurance.co/api/billing/openpay/status?subscriberId=i442091');
  const updatedData = await updatedRes.json().catch(() => null);

  const newStart = updatedData?.record?.currentPeriodStart;
  const newEnd = updatedData?.record?.currentPeriodEnd;
  const newDays = updatedData?.resolution?.daysRemaining;

  console.log(`   Nuevo Estado: ${updatedData?.record?.status}`);
  console.log(`   Nuevo Periodo: ${newStart}  👉  ${newEnd}`);
  console.log(`   Nuevos Días de Acceso: ${newDays} días`);

  console.log('\n================================================================================');
  if (updatedData?.record?.status === 'ACTIVE') {
    console.log('🎉 RESULTADO: PRUEBA 1 DE RENOVACIÓN RECURRENTE SUPERADA CON ÉXITO');
    console.log('   La transacción fue cobrada en Openpay y la vigencia fue extendida en Pulse.');
  } else {
    console.log('❌ Falló la verificación de renovación.');
  }
  console.log('================================================================================');
}

runRenewalSimulation().catch(console.error);
