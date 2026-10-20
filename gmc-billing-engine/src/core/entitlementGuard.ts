/**
 * GMC FINSEC BILLING ENGINE - ENTITLEMENT GUARD ("Efecto Netflix")
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Determina de forma matemática y determinista si un suscriptor tiene acceso activo
 * a la aplicación o si debe mostrarse la pantalla de bloqueo (Paywall).
 */

import { SubscriberBillingRecord, AccessResolution, EntitlementStatus } from './types';

export function resolveSubscriberAccess(
  record: SubscriberBillingRecord | null | undefined,
  nowDate: Date = new Date()
): AccessResolution {
  // 0. Si el usuario está en la Lista Blanca / Becado por la Administración (Cortesía)
  if ((record as any)?.billingExempt === true) {
    return {
      hasAccess: true,
      status: 'ACTIVE',
      daysRemaining: 999,
      isTrial: false,
      willCancelAtPeriodEnd: false,
    };
  }

  // 1. Si no existe registro de suscripción, bloqueo total inmediato
  if (!record) {
    return {
      hasAccess: false,
      status: 'PAST_DUE_LOCKED',
      daysRemaining: 0,
      isTrial: false,
      willCancelAtPeriodEnd: false,
      paywallMessage: 'No cuentas con una suscripción activa. Elige un plan para comenzar.',
      actionRequired: 'RENEW_SUBSCRIPTION',
    };
  }

  const now = nowDate.getTime();
  const currentPeriodEnd = new Date(record.currentPeriodEnd).getTime();
  const trialEnd = record.trialEndDate ? new Date(record.trialEndDate).getTime() : 0;
  const msInDay = 1000 * 60 * 60 * 24;

  // 2. Suspensión por sospecha de fraude o contracargo bancario
  if (record.status === 'SUSPENDED_FRAUD') {
    return {
      hasAccess: false,
      status: 'SUSPENDED_FRAUD',
      daysRemaining: 0,
      isTrial: false,
      willCancelAtPeriodEnd: false,
      paywallMessage: 'Tu cuenta ha sido congelada preventivamente por una alerta de seguridad bancaria. Contacta a soporte.',
      actionRequired: 'RESOLVE_FRAUD',
    };
  }

  // 3. Caso: Periodo de Prueba de 7 Días Activo (TRIAL_ACTIVE)
  if (record.status === 'TRIAL_ACTIVE') {
    if (now <= trialEnd) {
      const daysRemaining = Math.max(0, Math.ceil((trialEnd - now) / msInDay));
      return {
        hasAccess: true,
        status: 'TRIAL_ACTIVE',
        daysRemaining,
        isTrial: true,
        willCancelAtPeriodEnd: false,
      };
    } else {
      // Venció el trial y aún no se registra el cobro exitoso del Día 8
      return {
        hasAccess: false,
        status: 'PAST_DUE_LOCKED',
        daysRemaining: 0,
        isTrial: false,
        willCancelAtPeriodEnd: false,
        paywallMessage: 'Tus días de prueba gratuita han finalizado. Actualiza tu método de pago para continuar entrenando.',
        actionRequired: 'UPDATE_CARD',
      };
    }
  }

  // 4. Caso: Cancelación Programada (CANCEL_SCHEDULED) — Efecto Netflix
  // El usuario canceló pero conserva acceso hasta el último segundo del periodo ya pagado
  if (record.status === 'CANCEL_SCHEDULED' || record.cancelAtPeriodEnd) {
    if (now <= currentPeriodEnd) {
      const daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd - now) / msInDay));
      return {
        hasAccess: true,
        status: 'CANCEL_SCHEDULED',
        daysRemaining,
        isTrial: false,
        willCancelAtPeriodEnd: true,
      };
    } else {
      return {
        hasAccess: false,
        status: 'CANCELLED_LOCKED',
        daysRemaining: 0,
        isTrial: false,
        willCancelAtPeriodEnd: false,
        paywallMessage: 'Tu suscripción ha finalizado. Reactívala cuando quieras continuar tu plan.',
        actionRequired: 'RENEW_SUBSCRIPTION',
      };
    }
  }

  // 5. Caso: Periodo de Gracia por Fallo de Cobro en Renovación (GRACE_PERIOD)
  if (record.status === 'GRACE_PERIOD') {
    // Si la fecha actual aún está dentro del periodo de gracia permitido
    if (now <= currentPeriodEnd) {
      const hoursRemaining = Math.max(0, Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60)));
      return {
        hasAccess: true,
        status: 'GRACE_PERIOD',
        daysRemaining: Math.ceil(hoursRemaining / 24),
        isTrial: false,
        willCancelAtPeriodEnd: false,
        paywallMessage: `Hubo un inconveniente con el cobro automático de tu tarjeta. Tienes ${hoursRemaining} horas para actualizarla antes del bloqueo de tu cuenta.`,
        actionRequired: 'UPDATE_CARD',
      };
    } else {
      return {
        hasAccess: false,
        status: 'PAST_DUE_LOCKED',
        daysRemaining: 0,
        isTrial: false,
        willCancelAtPeriodEnd: false,
        paywallMessage: 'Tu suscripción está vencida. Actualiza tu tarjeta para restaurar tu acceso de inmediato.',
        actionRequired: 'UPDATE_CARD',
      };
    }
  }

  // 6. Caso: Suscripción Activa Regular (ACTIVE)
  if (record.status === 'ACTIVE') {
    if (now <= currentPeriodEnd) {
      const daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd - now) / msInDay));
      return {
        hasAccess: true,
        status: 'ACTIVE',
        daysRemaining,
        isTrial: false,
        willCancelAtPeriodEnd: false,
      };
    } else {
      // Si la fecha de corte venció y no se recibió webhook de renovación
      return {
        hasAccess: false,
        status: 'PAST_DUE_LOCKED',
        daysRemaining: 0,
        isTrial: false,
        willCancelAtPeriodEnd: false,
        paywallMessage: 'Tu periodo mensual ha vencido. Renueva tu suscripción para continuar.',
        actionRequired: 'RENEW_SUBSCRIPTION',
      };
    }
  }

  // 7. Cualquier otro estado bloqueado (PAST_DUE_LOCKED, CANCELLED_LOCKED)
  return {
    hasAccess: false,
    status: record.status as EntitlementStatus,
    daysRemaining: 0,
    isTrial: false,
    willCancelAtPeriodEnd: false,
    paywallMessage: 'Tu cuenta requiere una suscripción activa para acceder a este servicio.',
    actionRequired: 'RENEW_SUBSCRIPTION',
  };
}
