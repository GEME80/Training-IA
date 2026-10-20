/**
 * GMC FINSEC BILLING ENGINE - AGENTE 4: NETFLIX LIFECYCLE & DUNNING
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Misión:
 * Gobernar con precisión quirúrgica los 9 escenarios del ciclo de vida:
 * 1. Alta con Trial de 7 días (cobro diferido a $0 en Día 1).
 * 2. Cobro exitoso del Día 8 / Renovación mensual.
 * 3. Fallo de cobro Día 8 (bloqueo inmediato sin gracia).
 * 4. Fallo de cobro mensual en cliente antiguo (72h de gracia y dunning).
 * 5. Cancelación a mitad de mes (conservar acceso hasta currentPeriodEnd).
 * 6. Arrepentimiento de cancelación (reactivación antes de corte sin cobrar doble).
 * 7. Vencimiento final y despliegue del Paywall.
 * 8. Reembolso con corte inmediato.
 * 9. Bloqueo por fraude/contracargo.
 */

import { adminDb } from '@/lib/firebase/admin';
import { SubscriberBillingRecord, EntitlementStatus } from '../core/types';

export class NetflixLifecycleAgent {
  private static getDocRef(tenantId: string, subscriberId: string) {
    if (!adminDb) return null;
    return adminDb.collection('gmc_subscriptions').doc(`${tenantId}_${subscriberId}`);
  }

  /**
   * ESCENARIO 1: Registro e inicio de Periodo de Prueba con Tarjeta Obligatoria
   */
  static async startTrialSubscription(params: {
    tenantId: string;
    subscriberId: string;
    email: string;
    planCode: string;
    trialDays: number;
    openpayCustomerId: string;
    openpaySubscriptionId?: string;
    openpayCardId?: string;
    cardLast4?: string;
    cardBrand?: string;
  }): Promise<SubscriberBillingRecord> {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + params.trialDays * 24 * 60 * 60 * 1000);

    const record: SubscriberBillingRecord = {
      tenantId: params.tenantId,
      subscriberId: params.subscriberId,
      email: params.email,
      status: params.trialDays > 0 ? 'TRIAL_ACTIVE' : 'ACTIVE',
      currentPlanCode: params.planCode,
      openpayCustomerId: params.openpayCustomerId,
      openpaySubscriptionId: params.openpaySubscriptionId,
      openpayCardId: params.openpayCardId,
      cardLast4: params.cardLast4,
      cardBrand: params.cardBrand,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      cancelAtPeriodEnd: false,
      hasConsumedTrial: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (docRef) {
      try {
        await docRef.set(record, { merge: true });
      } catch (err) {
        console.warn('[NETFLIX_LIFECYCLE_WARN] Firestore no disponible para set:', err);
      }
    }

    return record;
  }

  /**
   * ESCENARIO 2: Cobro Exitoso en Día 8 o Renovación Mensual
   */
  static async handleSuccessfulCharge(params: {
    tenantId: string;
    subscriberId: string;
    periodMonths?: number;
  }): Promise<void> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (!docRef) return;

    try {
      const doc = await docRef.get();
      const now = new Date();
      const months = params.periodMonths || 1;
      
      let baseDate = now;
      if (doc && doc.exists) {
        const prevEnd = new Date(doc.data()?.currentPeriodEnd || 0);
        if (prevEnd > now) {
          baseDate = prevEnd;
        }
      }

      const nextEnd = new Date(baseDate);
      nextEnd.setMonth(nextEnd.getMonth() + months);

      await docRef.set(
        {
          status: 'ACTIVE' as EntitlementStatus,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: nextEnd.toISOString(),
          cancelAtPeriodEnd: false,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NETFLIX_LIFECYCLE_WARN] Fallo actualizando cobro exitoso en Firestore:', err);
    }
  }

  /**
   * ESCENARIOS 3 y 7: Fallo de Cobro Automático (Día 8 vs Renovación Mes 2+)
   */
  static async handleFailedCharge(params: {
    tenantId: string;
    subscriberId: string;
    isFirstChargePostTrial: boolean;
    dunningGraceHours?: number;
  }): Promise<EntitlementStatus> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    const now = new Date();

    if (params.isFirstChargePostTrial) {
      // Regla de Oro: En el cobro post-trial NO hay días de gracia para evitar abuso de tarjetas vacías
      const newStatus: EntitlementStatus = 'PAST_DUE_LOCKED';
      if (docRef) {
        try {
          await docRef.set(
            {
              status: newStatus,
              updatedAt: now.toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('[NETFLIX_LIFECYCLE_WARN] Firestore no disponible para fail charge:', err);
        }
      }
      return newStatus;
    }

    // Cliente recurrente: Se conceden 72 horas de gracia
    const graceHours = params.dunningGraceHours || 72;
    const graceEnd = new Date(now.getTime() + graceHours * 60 * 60 * 1000);
    const newStatus: EntitlementStatus = 'GRACE_PERIOD';

    if (docRef) {
      try {
        await docRef.set(
          {
            status: newStatus,
            currentPeriodEnd: graceEnd.toISOString(),
            updatedAt: now.toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('[NETFLIX_LIFECYCLE_WARN] Firestore no disponible para grace period:', err);
      }
    }
    return newStatus;
  }

  /**
   * ESCENARIOS 3 y 4: Cancelación a Mitad de Ciclo (Efecto Netflix)
   * Respeta el tiempo restante sin bloquear hoy
   */
  static async scheduleCancellation(params: {
    tenantId: string;
    subscriberId: string;
  }): Promise<void> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (!docRef) return;

    const now = new Date();
    try {
      await docRef.set(
        {
          status: 'CANCEL_SCHEDULED' as EntitlementStatus,
          cancelAtPeriodEnd: true,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NETFLIX_LIFECYCLE_WARN] Fallo programando cancelación en Firestore:', err);
    }
  }

  /**
   * ESCENARIO 5: Arrepentimiento de Cancelación (Reanudar antes de que venza el ciclo pagado)
   */
  static async resumeSubscription(params: {
    tenantId: string;
    subscriberId: string;
  }): Promise<void> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (!docRef) return;

    const now = new Date();
    try {
      await docRef.set(
        {
          status: 'ACTIVE' as EntitlementStatus,
          cancelAtPeriodEnd: false,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NETFLIX_LIFECYCLE_WARN] Fallo reanudando suscripción en Firestore:', err);
    }
  }

  /**
   * ESCENARIO 9: Reembolso Aprobado (Corte Inmediato)
   */
  static async processRefundCutoff(params: {
    tenantId: string;
    subscriberId: string;
  }): Promise<void> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (!docRef) return;

    const now = new Date();
    try {
      await docRef.set(
        {
          status: 'CANCELLED_LOCKED' as EntitlementStatus,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NETFLIX_LIFECYCLE_WARN] Fallo procesando corte de reembolso en Firestore:', err);
    }
  }

  /**
   * Congelamiento por Fraude o Contracargo
   */
  static async processFraudSuspension(params: {
    tenantId: string;
    subscriberId: string;
  }): Promise<void> {
    const docRef = this.getDocRef(params.tenantId, params.subscriberId);
    if (!docRef) return;

    const now = new Date();
    try {
      await docRef.set(
        {
          status: 'SUSPENDED_FRAUD' as EntitlementStatus,
          updatedAt: now.toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[NETFLIX_LIFECYCLE_WARN] Fallo congelando por fraude en Firestore:', err);
    }
  }

  /**
   * Obtiene el registro actual de suscripción de un suscriptor
   */
  static async getSubscriberRecord(
    tenantId: string,
    subscriberId: string
  ): Promise<SubscriberBillingRecord | null> {
    const docRef = this.getDocRef(tenantId, subscriberId);
    if (!docRef) return null;

    try {
      const doc = await docRef.get();
      if (!doc.exists) return null;
      return doc.data() as SubscriberBillingRecord;
    } catch (err) {
      console.error(`[NETFLIX_LIFECYCLE_ERROR] Error leyendo suscripción para ${tenantId}_${subscriberId}:`, err);
      return null;
    }
  }
}
