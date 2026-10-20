/**
 * GMC FINSEC BILLING ENGINE - AGENTE 1: SENTINEL-ANTIFRAUD
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Misión:
 * 1. Prevenir abuso de pruebas de 7 días (Anti-Trial Hopping).
 * 2. Bloquear ataques de carding y fuerza bruta (Velocity Rate Limiter).
 * 3. Impedir fugas de datos de tarjeta hacia nuestros servidores (PCI-DSS SAQ-A Sanitize).
 * 4. Validar la presencia de la huella antifraude de BBVA (device_session_id).
 */

import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';

// Memoria volátil para velocity limiting en servidor (complementado con persistencia si aplica)
const velocityMap = new Map<string, { count: number; firstAttempt: number }>();

export interface PreFlightCheckParams {
  tenantId: string;
  subscriberId: string;
  email: string;
  deviceSessionId: string;
  clientIp?: string;
  cardFingerprint?: string; // SHA-256 de BIN + Últimos 4 + Nombre
  rawPayloadToSanitize?: any;
}

export interface PreFlightCheckResult {
  allowed: boolean;
  eligibleForTrial: boolean;
  forcedTrialDays: number | null; // null si no se altera; 0 si se revoca el trial por reincidencia
  reasons: string[];
}

export class SentinelAntiFraudAgent {
  /**
   * REGLA PCI-01: Destruye el payload y aborta si detecta números PAN o CVV en texto plano.
   */
  static assertNoRawPci(payload: any): void {
    if (!payload || typeof payload !== 'object') return;

    const forbiddenKeys = ['card_number', 'pan', 'cvv', 'cvv2', 'security_code', 'numero_tarjeta'];
    const panRegex = /\b(?:\d[ -]*?){13,19}\b/;

    const inspect = (obj: any, path: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (forbiddenKeys.some((f) => lowerKey.includes(f))) {
          throw new Error(`[PCI_VIOLATION_ABORT] Intento de transmitir campo sensible '${key}' hacia el servidor. Prohibido por PCI-DSS SAQ-A.`);
        }
        if (typeof value === 'string' && panRegex.test(value.replace(/\s+/g, ''))) {
          throw new Error(`[PCI_VIOLATION_ABORT] Patrón numérico de tarjeta detectado en '${path}.${key}'. Prohibido por PCI-DSS.`);
        }
        if (value && typeof value === 'object') {
          inspect(value, `${path}.${key}`);
        }
      }
    };

    inspect(payload);
  }

  /**
   * REGLA DEV-01: Exige que el device_session_id de Openpay esté presente y sea válido.
   */
  static assertValidDeviceSession(deviceSessionId: string | undefined): void {
    if (!deviceSessionId || typeof deviceSessionId !== 'string' || deviceSessionId.trim().length < 10) {
      throw new Error('[ANTIFRAUD_DEV01_FAIL] device_session_id ausente o inválido. Requerido por la pasarela antifraude de BBVA.');
    }
  }

  /**
   * REGLA VEL-01: Máximo 3 intentos de tarjeta en 15 minutos por suscriptor o IP.
   */
  static assertVelocity(identifier: string, maxAttempts: number = 3, windowMinutes: number = 15): void {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const record = velocityMap.get(identifier);

    if (!record) {
      velocityMap.set(identifier, { count: 1, firstAttempt: now });
      return;
    }

    if (now - record.firstAttempt > windowMs) {
      velocityMap.set(identifier, { count: 1, firstAttempt: now });
      return;
    }

    if (record.count >= maxAttempts) {
      throw new Error(`[VELOCITY_RATE_LIMIT_EXCEEDED] Límite de ${maxAttempts} intentos superado en 15 minutos. Bloqueo temporal preventivo.`);
    }

    record.count += 1;
  }

  /**
   * REGLA TRIAL-01: Verifica si el suscriptor o la tarjeta ya disfrutaron de los días gratis.
   */
  static async checkTrialEligibility(params: {
    tenantId: string;
    subscriberId: string;
    email: string;
    cardFingerprint?: string;
  }): Promise<{ isEligible: boolean; reason?: string }> {
    if (!adminDb) {
      return { isEligible: true };
    }

    const tenantId = params.tenantId;

    // 1. Revisar si el usuario ya consumió el trial en su registro de suscriptor
    try {
      const subDoc = await adminDb
        .collection('gmc_subscriptions')
        .doc(`${tenantId}_${params.subscriberId}`)
        .get();

      if (subDoc.exists && subDoc.data()?.hasConsumedTrial === true) {
        return {
          isEligible: false,
          reason: 'El suscriptor ya consumió sus días de prueba gratuita anteriormente en esta aplicación.',
        };
      }
    } catch (e) {
      console.warn('[SENTINEL_WARN] Error consultando suscripción previa:', e);
    }

    // 2. Revisar si la huella de la tarjeta ya fue usada en gmc_trial_registry
    if (params.cardFingerprint) {
      try {
        const registryDoc = await adminDb
          .collection('gmc_trial_registry')
          .doc(`${tenantId}_${params.cardFingerprint}`)
          .get();

        if (registryDoc.exists) {
          return {
            isEligible: false,
            reason: 'Esta tarjeta bancaria ya fue registrada previamente para un periodo de prueba gratuita en este servicio.',
          };
        }
      } catch (e) {
        console.warn('[SENTINEL_WARN] Error consultando registro de tarjetas trial:', e);
      }
    }

    return { isEligible: true };
  }

  /**
   * Registra de forma inmutable la huella de tarjeta que acaba de iniciar un trial
   */
  static async recordTrialConsumption(params: {
    tenantId: string;
    subscriberId: string;
    email: string;
    cardFingerprint?: string;
  }): Promise<void> {
    if (!adminDb) return;

    try {
      if (params.cardFingerprint) {
        await adminDb
          .collection('gmc_trial_registry')
          .doc(`${params.tenantId}_${params.cardFingerprint}`)
          .set({
            tenantId: params.tenantId,
            subscriberId: params.subscriberId,
            cardFingerprint: params.cardFingerprint,
            emailHash: crypto.createHash('sha256').update(params.email.toLowerCase().trim()).digest('hex'),
            consumedAt: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error('[SENTINEL_ERROR] No se pudo escribir en gmc_trial_registry:', err);
    }
  }

  /**
   * Helper para generar el fingerprint seguro de tarjeta sin guardar datos sensibles
   */
  static generateCardFingerprint(bin: string, last4: string, holderName: string): string {
    const cleanBin = bin.replace(/\D/g, '').slice(0, 6);
    const cleanLast4 = last4.replace(/\D/g, '').slice(-4);
    const cleanHolder = holderName.trim().toUpperCase().replace(/[^A-Z ]/g, '');
    const seed = `${cleanBin}:${cleanLast4}:${cleanHolder}`;
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Orquestador Pre-Flight completo
   */
  static async executePreFlightCheck(params: PreFlightCheckParams): Promise<PreFlightCheckResult> {
    const reasons: string[] = [];

    // 1. Sanitizar Payload (Cero PAN en backend)
    if (params.rawPayloadToSanitize) {
      this.assertNoRawPci(params.rawPayloadToSanitize);
    }

    // 2. Validar huella de dispositivo BBVA
    this.assertValidDeviceSession(params.deviceSessionId);

    // 3. Rate limiting contra Carding
    const rateLimitTarget = params.clientIp || params.subscriberId;
    this.assertVelocity(rateLimitTarget, 3, 15);

    // 4. Elegibilidad de Trial
    const trialCheck = await this.checkTrialEligibility({
      tenantId: params.tenantId,
      subscriberId: params.subscriberId,
      email: params.email,
      cardFingerprint: params.cardFingerprint,
    });

    if (!trialCheck.isEligible) {
      reasons.push(trialCheck.reason || 'Trial no elegible');
      return {
        allowed: true, // Se le permite suscribirse, pero cobrando de inmediato
        eligibleForTrial: false,
        forcedTrialDays: 0,
        reasons,
      };
    }

    return {
      allowed: true,
      eligibleForTrial: true,
      forcedTrialDays: null,
      reasons,
    };
  }
}
