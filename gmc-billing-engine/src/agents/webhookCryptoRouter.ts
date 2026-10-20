/**
 * GMC FINSEC BILLING ENGINE - AGENTE 3: WEBHOOK CRYPTO ROUTER
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Misión:
 * 1. Validación criptográfica en tiempo constante (timingSafeEqual) de credenciales HTTP Basic Auth.
 * 2. Doble verificación Servidor a Servidor (Double-Check) contra la API de Openpay antes de conceder accesos.
 * 3. Deduplicación estricta contra el Libro Mayor Inmutable.
 * 4. Enrutamiento del evento hacia el tenant correspondiente (Pulse Endurance, Hubinfo, etc.).
 */

import crypto from 'crypto';
import { getOpenpayConfig } from '../core/config';
import { OpenpayClient } from '../providers/openpay/client';
import { adminDb } from '@/lib/firebase/admin';

export interface OpenpayWebhookPayload {
  type: string;                 // Ej: "charge.succeeded", "charge.failed", "charge.refunded"
  event_date: string;
  transaction?: {
    id: string;
    amount: number;
    authorization?: string;
    method: string;
    operation_type: string;
    transaction_type: string;
    status: string;             // "completed", "failed", "cancelled"
    order_id?: string;
    customer_id?: string;
    description?: string;
    error_message?: string;
  };
}

export class WebhookCryptoRouterAgent {
  /**
   * Valida la cabecera Authorization usando timingSafeEqual para blindar contra ataques de temporización
   */
  static verifyTimingSafeAuth(authHeader: string | null | undefined): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }

    try {
      const config = getOpenpayConfig();
      const expectedCredentials = `${config.OPENPAY_WEBHOOK_USER}:${config.OPENPAY_WEBHOOK_PASSWORD}`;
      const expectedBase64 = Buffer.from(expectedCredentials).toString('base64');
      const expectedHeader = `Basic ${expectedBase64}`;

      const providedBuffer = Buffer.from(authHeader);
      const expectedBuffer = Buffer.from(expectedHeader);

      if (providedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    } catch (err) {
      console.error('[WEBHOOK_CRYPTO_ERROR] Error comparando cabeceras de webhook:', err);
      return false;
    }
  }

  /**
   * REGLA SERVER-TO-SERVER DOUBLE CHECK:
   * Consulta directamente la API de Openpay con nuestra llave privada para verificar que
   * la transacción exista y esté completada en los sistemas de BBVA.
   */
  static async verifyChargeWithOpenpay(chargeId: string): Promise<boolean> {
    try {
      const client = new OpenpayClient();
      const charge = await client.getCharge(chargeId);
      return charge && charge.status === 'completed';
    } catch (err) {
      console.error(`[WEBHOOK_DOUBLE_CHECK_FAILED] No se pudo verificar la transacción ${chargeId} con Openpay:`, err);
      return false;
    }
  }

  /**
   * Verifica si la transacción ya fue procesada anteriormente en el Libro Mayor
   */
  static async isTransactionProcessed(transactionId: string): Promise<boolean> {
    if (!adminDb) return false;

    try {
      const doc = await adminDb.collection('gmc_immutable_ledger').doc(transactionId).get();
      return doc.exists;
    } catch {
      return false;
    }
  }

  /**
   * Extrae el tenantId y subscriberId a partir del order_id determinista
   * Formato: GMC-{TENANT}-SUB-{SUBSCRIBER}-{YYYYMM}
   */
  static parseOrderId(orderId?: string): { tenantId: string; subscriberId: string } | null {
    if (!orderId || !orderId.startsWith('GMC-')) return null;

    const parts = orderId.split('-');
    // [0]: 'GMC', [1]: TENANT, [2]: 'SUB', [3]: SUBSCRIBER, [4]: YYYYMM
    if (parts.length >= 5) {
      return {
        tenantId: parts[1],
        subscriberId: parts[3],
      };
    }
    return null;
  }
}
