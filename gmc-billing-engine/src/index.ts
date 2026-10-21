/**
 * GMC FINSEC BILLING ENGINE - MAIN SDK ENTRYPOINT
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Orquestador principal desacoplado y plug-and-play para suscripciones,
 * trial de 7 días, cobros recurrentes y protección financiera de grado bancario.
 */

export * from './core/types';
export * from './core/config';
export * from './core/entitlementGuard';
export * from './core/idempotencyLock';
export * from './providers/openpay/client';
export * from './agents/sentinelAntiFraud';
export * from './agents/idempotencyLockGuard';
export * from './agents/webhookCryptoRouter';
export * from './agents/netflixLifecycleDunning';
export * from './agents/forensicLedgerAuditor';
export * from './core/openpayErrors';

import { OpenpayClient } from './providers/openpay/client';
import { OpenpayServerConfig } from './core/config';
import { SentinelAntiFraudAgent } from './agents/sentinelAntiFraud';
import { IdempotencyLockGuardAgent } from './agents/idempotencyLockGuard';
import { WebhookCryptoRouterAgent, OpenpayWebhookPayload } from './agents/webhookCryptoRouter';
import { NetflixLifecycleAgent } from './agents/netflixLifecycleDunning';
import { ForensicLedgerAuditorAgent } from './agents/forensicLedgerAuditor';
import { resolveSubscriberAccess } from './core/entitlementGuard';
import { generateDeterministicOrderId } from './core/idempotencyLock';
import { TenantBillingConfig, AccessResolution, SubscriberBillingRecord } from './core/types';

export class GmcBillingEngine {
  private client: OpenpayClient;

  constructor(customConfig?: Partial<OpenpayServerConfig>) {
    this.client = new OpenpayClient(customConfig);
  }

  /** Obtiene o crea el cliente en Openpay */
  async getOrCreateCustomer(params: {
    tenantId: string;
    subscriberId: string;
    name: string;
    email: string;
  }): Promise<string> {
    const existing = await NetflixLifecycleAgent.getSubscriberRecord(params.tenantId, params.subscriberId);
    if (existing?.openpayCustomerId) return existing.openpayCustomerId;

    const customer = await this.client.createCustomer({
      name: params.name,
      email: params.email,
      external_id: `${params.tenantId}_${params.subscriberId}`,
    });
    return customer.id;
  }

  /** Crea sesión de Hosted Checkout en Openpay (BBVA) - PCI-DSS SAQ-A */
  async createHostedCheckoutSession(params: {
    tenantId: string;
    subscriberId: string;
    name: string;
    email: string;
    amountCop: number;
    description: string;
    redirectUrl: string;
  }): Promise<{ checkoutUrl: string; orderId: string; transactionId: string }> {
    const attemptNonce = Math.random().toString(36).slice(2, 6);
    let orderId = generateDeterministicOrderId(params.tenantId, params.subscriberId, new Date(), attemptNonce);
    if (orderId.length > 64) {
      orderId = generateDeterministicOrderId(params.tenantId, params.subscriberId, new Date());
      if (orderId.length > 64) orderId = orderId.slice(0, 64);
    }
    const [firstName, ...restName] = (params.name || 'Atleta').split(' ');
    const lastName = restName.join(' ') || 'Pulse';

    const res = await this.client.createHostedCheckout({
      amount: params.amountCop,
      currency: 'COP',
      description: params.description,
      orderId,
      customer: { name: firstName || 'Atleta', lastName, email: params.email },
      redirectUrl: params.redirectUrl,
    });

    const checkoutUrl = res.checkout_link || res.payment_method?.url;
    if (!checkoutUrl) throw new Error(`[GMC_ENGINE_ERROR] Openpay no devolvió la URL de redirección bancaria.`);

    return { checkoutUrl, orderId, transactionId: res.id };
  }

  /** ESCENARIO 1: Alta con Tarjeta Obligatoria (Trial de 7 Días o Cobro Inmediato) */
  async startSubscriptionFlow(params: {
    tenantConfig: TenantBillingConfig;
    subscriberId: string;
    name: string;
    email: string;
    planCode: string;
    tokenId: string;
    deviceSessionId: string;
    clientIp?: string;
  }): Promise<{
    record: SubscriberBillingRecord;
    isTrial: boolean;
    trialDaysApplied: number;
    message: string;
  }> {
    const plan = params.tenantConfig.plans.find((p) => p.planCode === params.planCode);
    if (!plan) {
      throw new Error(`[GMC_ENGINE_ERROR] El plan ${params.planCode} no existe en la configuración del tenant ${params.tenantConfig.tenantId}.`);
    }

    return IdempotencyLockGuardAgent.executeProtectedOperation(
      {
        tenantId: params.tenantConfig.tenantId,
        subscriberId: params.subscriberId,
        operation: 'SUBSCRIBE',
      },
      async (orderId) => {
        // 1. AGENTE 1: Sentinel Anti-Fraud Pre-Flight Check
        const preFlight = await SentinelAntiFraudAgent.executePreFlightCheck({
          tenantId: params.tenantConfig.tenantId,
          subscriberId: params.subscriberId,
          email: params.email,
          deviceSessionId: params.deviceSessionId,
          clientIp: params.clientIp,
          rawPayloadToSanitize: { tokenId: params.tokenId },
        });

        // Determinar días de trial efectivos
        const effectiveTrialDays = preFlight.forcedTrialDays !== null ? preFlight.forcedTrialDays : plan.trialDays;

        // 2. Obtener o crear Cliente en Openpay
        const customerId = await this.getOrCreateCustomer({
          tenantId: params.tenantConfig.tenantId,
          subscriberId: params.subscriberId,
          name: params.name,
          email: params.email,
        });

        // 3. Vincular Tarjeta en Openpay con el token seguro
        const card = await this.client.addCardToCustomer({
          customerId,
          tokenId: params.tokenId,
          deviceSessionId: params.deviceSessionId,
        });

        const cardFingerprint = SentinelAntiFraudAgent.generateCardFingerprint(
          card.card_number.slice(0, 6),
          card.card_number.slice(-4),
          card.holder_name
        );

        // 4. Crear o reutilizar Plan en Openpay con los trialDays correspondientes
        let openpayPlanId = `${params.tenantConfig.tenantId}_${params.planCode}_T${effectiveTrialDays}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        try {
          await this.client.getPlan(openpayPlanId);
        } catch {
          const createdPlan = await this.client.createPlan({
            name: `${params.tenantConfig.displayName} - ${plan.name} (${effectiveTrialDays}d Trial)`,
            amount: plan.amountCop,
            currency: 'COP',
            repeatEvery: 1,
            repeatUnit: plan.interval === 'YEAR' ? 'year' : 'month',
            retryTimes: 2,
            statusAfterRetry: 'unpaid',
            trialDays: effectiveTrialDays,
          });
          openpayPlanId = createdPlan.id;
        }

        // 5. Crear la Suscripción en Openpay
        const subscription = await this.client.createSubscription({
          customerId,
          planId: openpayPlanId,
          cardId: card.id,
        });

        // 6. AGENTE 4: Inicializar máquina de estados de Ciclo de Vida
        const record = await NetflixLifecycleAgent.startTrialSubscription({
          tenantId: params.tenantConfig.tenantId,
          subscriberId: params.subscriberId,
          email: params.email,
          planCode: plan.planCode,
          trialDays: effectiveTrialDays,
          openpayCustomerId: customerId,
          openpaySubscriptionId: subscription.id,
          openpayCardId: card.id,
          cardLast4: card.card_number.slice(-4),
          cardBrand: card.brand,
        });

        if (effectiveTrialDays > 0) {
          await SentinelAntiFraudAgent.recordTrialConsumption({
            tenantId: params.tenantConfig.tenantId,
            subscriberId: params.subscriberId,
            email: params.email,
            cardFingerprint,
          });
        }

        // 8. AGENTE 5: Asiento contable de apertura
        await ForensicLedgerAuditorAgent.recordLedgerEntry({
          id: `LEDGER_START_${orderId}`,
          tenantId: params.tenantConfig.tenantId,
          subscriberId: params.subscriberId,
          orderId,
          openpayTransactionId: subscription.id,
          type: effectiveTrialDays > 0 ? 'TRIAL_START' : 'SUBSCRIPTION_CHARGE',
          grossAmountCop: effectiveTrialDays > 0 ? 0 : plan.amountCop,
          currency: 'COP',
          status: 'COMPLETED',
          metadata: {
            planCode: plan.planCode,
            trialDays: effectiveTrialDays,
            cardBrand: card.brand,
            cardLast4: card.card_number.slice(-4),
          },
          timestamp: new Date().toISOString(),
        });

        const isTrial = effectiveTrialDays > 0;
        const message = isTrial
          ? `¡Periodo de prueba iniciado! Tienes ${effectiveTrialDays} días gratis. Tu primer cobro automático se realizará el ${new Date(record.trialEndDate!).toLocaleDateString('es-CO')}.`
          : '¡Suscripción activada exitosamente con cobro inmediato!';

        return {
          record,
          isTrial,
          trialDaysApplied: effectiveTrialDays,
          message,
        };
      }
    );
  }

  /**
   * Resuelve el acceso de un atleta o usuario ("Efecto Netflix")
   */
  async resolveAccess(tenantId: string, subscriberId: string): Promise<AccessResolution> {
    const record = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, subscriberId);
    return resolveSubscriberAccess(record);
  }

  /**
   * Cancela la suscripción respetando el tiempo ya pagado o días de prueba restantes
   */
  async scheduleCancellation(tenantId: string, subscriberId: string): Promise<void> {
    await IdempotencyLockGuardAgent.executeProtectedOperation(
      {
        tenantId,
        subscriberId,
        operation: 'CANCEL',
      },
      async () => {
        const record = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, subscriberId);
        if (record?.openpayCustomerId && record.openpaySubscriptionId) {
          try {
            await this.client.cancelSubscription(record.openpayCustomerId, record.openpaySubscriptionId);
          } catch (e) {
            console.warn('[GMC_ENGINE_CANCEL_WARN] Fallo al cancelar suscripción en Openpay:', e);
          }
        }
        await NetflixLifecycleAgent.scheduleCancellation({ tenantId, subscriberId });
      }
    );
  }

  /**
   * Reanuda la suscripción si el usuario se arrepiente antes de que venza el ciclo
   */
  async resumeSubscription(tenantId: string, subscriberId: string): Promise<void> {
    await IdempotencyLockGuardAgent.executeProtectedOperation(
      {
        tenantId,
        subscriberId,
        operation: 'RESUME',
      },
      async () => {
        await NetflixLifecycleAgent.resumeSubscription({ tenantId, subscriberId });
      }
    );
  }

  /** Procesa webhook de Openpay con verificación criptográfica y doble chequeo */
  async processWebhook(authHeader: string | null, payload: OpenpayWebhookPayload): Promise<{
    processed: boolean;
    reason?: string;
  }> {
    // 1. Verificación Timing-Safe
    if (!WebhookCryptoRouterAgent.verifyTimingSafeAuth(authHeader)) {
      return { processed: false, reason: 'UNAUTHORIZED_TIMING_SAFE_MISMATCH' };
    }
    const tx = payload.transaction;
    if (!tx || !tx.id) return { processed: true, reason: 'NO_TRANSACTION_PAYLOAD' };

    // 2. Deduplicación
    if (await WebhookCryptoRouterAgent.isTransactionProcessed(tx.id)) {
      return { processed: true, reason: 'ALREADY_PROCESSED_DEDUPLICATED' };
    }

    // 3. Double-Check con Openpay si fue cargo exitoso
    if (payload.type === 'charge.succeeded') {
      const isValid = await WebhookCryptoRouterAgent.verifyChargeWithOpenpay(tx.id);
      if (!isValid) return { processed: false, reason: 'DOUBLE_CHECK_FAILED_AT_OPENPAY' };
    }

    // 4. Parsear Order ID
    const parsed = WebhookCryptoRouterAgent.parseOrderId(tx.order_id);
    if (!parsed) return { processed: true, reason: 'ORDER_ID_NOT_GMC_FORMAT' };

    const { tenantId, subscriberId } = parsed;

    // 5. Aplicar reglas según el evento
    if (payload.type === 'charge.succeeded') {
      await NetflixLifecycleAgent.handleSuccessfulCharge({ tenantId, subscriberId });
      await ForensicLedgerAuditorAgent.recordLedgerEntry({
        id: tx.id,
        tenantId,
        subscriberId,
        orderId: tx.order_id || tx.id,
        openpayTransactionId: tx.id,
        type: 'SUBSCRIPTION_CHARGE',
        grossAmountCop: tx.amount,
        currency: 'COP',
        status: 'COMPLETED',
        metadata: { authorization: tx.authorization, method: tx.method },
        timestamp: payload.event_date || new Date().toISOString(),
      });
    } else if (payload.type === 'charge.failed') {
      const sub = await NetflixLifecycleAgent.getSubscriberRecord(tenantId, subscriberId);
      await NetflixLifecycleAgent.handleFailedCharge({
        tenantId,
        subscriberId,
        isFirstChargePostTrial: sub?.status === 'TRIAL_ACTIVE',
      });
    }

    return { processed: true };
  }
}
