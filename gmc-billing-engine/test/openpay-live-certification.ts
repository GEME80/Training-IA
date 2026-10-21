/**
 * GMC FINSEC BILLING ENGINE - LIVE SANDBOX CERTIFICATION RUNNER
 * (C) German Morales Consulting
 * 
 * Ejecuta transacciones reales contra el API de Openpay Colombia Sandbox:
 * - MasterCard Oficial (5555 5555 5555 4444)
 * - American Express Oficial (345678000000007)
 * - Tarjeta Rechazada / Fondos Insuficientes (4444 4444 4444 4448)
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

async function runLiveCertification() {
  console.log('================================================================================');
  console.log('🚀 EJECUTANDO CARGOS REALES EN VIVO CONTRA OPENPAY COLOMBIA (SANDBOX)');
  console.log('================================================================================\n');

  const client = new OpenpayClient();
  const timestamp = Date.now().toString().slice(-4);

  // 1. Cargo Real con MasterCard (5555...4444)
  console.log('1️⃣ Procesando cargo en vivo con MasterCard...');
  try {
    const mcToken = await (client as any).request('/tokens', {
      method: 'POST',
      body: JSON.stringify({
        holder_name: 'German Morales',
        card_number: '5555555555554444',
        expiration_year: '28',
        expiration_month: '12',
        cvv2: '123',
      }),
    });

    const mcCharge = await (client as any).request('/charges', {
      method: 'POST',
      body: JSON.stringify({
        source_id: mcToken.id,
        method: 'card',
        amount: 55000,
        currency: 'COP',
        description: 'Suscripcion Pulse Pro Mastercard Live',
        order_id: `GMC-PULSE_ENDURANCE-SUB-i442091-202610-mc${timestamp}`,
        device_session_id: 'k62f9a1b0c3d4e5f6a7b8c9d0e1f2a3b',
        customer: {
          name: 'German',
          last_name: 'Morales',
          email: 'gerkof@gmail.com',
          phone_number: '3001234567',
        },
      }),
    });
    console.log(`   ✅ [MASTERCARD APROBADA] ID: ${mcCharge.id} | Auth: ${mcCharge.authorization} | Monto: $${mcCharge.amount} COP`);
  } catch (err: any) {
    console.error('   ❌ Fallo en MasterCard:', err.message);
  }

  // 2. Cargo Real con American Express (3456...0007)
  console.log('\n2️⃣ Procesando cargo en vivo con American Express...');
  try {
    const amexToken = await (client as any).request('/tokens', {
      method: 'POST',
      body: JSON.stringify({
        holder_name: 'German Morales',
        card_number: '345678000000007',
        expiration_year: '28',
        expiration_month: '12',
        cvv2: '1234',
      }),
    });

    const amexCharge = await (client as any).request('/charges', {
      method: 'POST',
      body: JSON.stringify({
        source_id: amexToken.id,
        method: 'card',
        amount: 55000,
        currency: 'COP',
        description: 'Suscripcion Pulse Pro Amex Live',
        order_id: `GMC-PULSE_ENDURANCE-SUB-i442091-202610-ax${timestamp}`,
        device_session_id: 'k62f9a1b0c3d4e5f6a7b8c9d0e1f2a3b',
        customer: {
          name: 'German',
          last_name: 'Morales',
          email: 'gerkof@gmail.com',
          phone_number: '3001234567',
        },
      }),
    });
    console.log(`   ✅ [AMEX APROBADA] ID: ${amexCharge.id} | Auth: ${amexCharge.authorization} | Monto: $${amexCharge.amount} COP`);
  } catch (err: any) {
    console.error('   ❌ Fallo en Amex:', err.message);
  }

  // 3. Cargo Rechazado en vivo con Tarjeta de Simulación (4444...4448)
  console.log('\n3️⃣ Procesando simulación de rechazo en vivo...');
  try {
    const failToken = await (client as any).request('/tokens', {
      method: 'POST',
      body: JSON.stringify({
        holder_name: 'German Morales',
        card_number: '4444444444444448',
        expiration_year: '28',
        expiration_month: '12',
        cvv2: '123',
      }),
    });

    await (client as any).request('/charges', {
      method: 'POST',
      body: JSON.stringify({
        source_id: failToken.id,
        method: 'card',
        amount: 55000,
        currency: 'COP',
        description: 'Suscripcion Pulse Pro Rechazo Simulado Live',
        order_id: `GMC-PULSE_ENDURANCE-SUB-i442091-202610-fl${timestamp}`,
        device_session_id: 'k62f9a1b0c3d4e5f6a7b8c9d0e1f2a3b',
        customer: {
          name: 'German',
          last_name: 'Morales',
          email: 'gerkof@gmail.com',
          phone_number: '3001234567',
        },
      }),
    });
  } catch (err: any) {
    console.log(`   ✅ [RECHAZO BANCARIO REGISTRADO] Código: ${err.details?.error_code || err.statusCode} | Causa: ${err.details?.description || err.message}`);
  }

  console.log('\n================================================================================');
  console.log('🏁 TRANSACCIONES EN VIVO COMPLETADAS: Ve a sandbox-dashboard.openpay.co');
  console.log('   y presiona "Actualizar" para ver las nuevas filas y marcas en tu gráfica.');
  console.log('================================================================================\n');
}

runLiveCertification().catch(console.error);
