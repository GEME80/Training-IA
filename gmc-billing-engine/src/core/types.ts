/**
 * GMC FINSEC BILLING ENGINE - UNIVERSAL MULTI-TENANT TYPES
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Totalmente desacoplado de las aplicaciones cliente.
 * Diseñado bajo principios de seguridad bancaria PCI-DSS SAQ-A y modelos de suscripción "Efecto Netflix".
 */

export type TenantId = 'PULSE_ENDURANCE' | 'HUBINFO' | string;

export type EntitlementStatus =
  | 'TRIAL_ACTIVE'          // En periodo de prueba (tarjeta registrada, cobro a $0 hoy)
  | 'ACTIVE'                // Suscripción pagada y activa
  | 'CANCEL_SCHEDULED'      // Canceló a mitad de ciclo; acceso activo hasta currentPeriodEnd
  | 'GRACE_PERIOD'          // Cobro de renovación falló; periodo de gracia de 72h con reintentos
  | 'PAST_DUE_LOCKED'       // Venció el periodo de gracia sin pago; Paywall bloqueante
  | 'CANCELLED_LOCKED'      // Llegó el fin de ciclo tras cancelación; Paywall bloqueante
  | 'SUSPENDED_FRAUD';      // Congelada preventivamente por contracargo o alerta de seguridad

export interface BillingPlanDefinition {
  planCode: string;               // Identificador único (ej: "PULSE_PRO_MONTHLY")
  name: string;                   // Nombre visible (ej: "Pulse Pro Atleta")
  amountCop: number;              // Monto en Pesos Colombianos (ej: 99000)
  interval: 'MONTH' | 'YEAR';     // Frecuencia de cobro
  trialDays: number;              // Días de prueba gratis (Pulse = 7; Otras apps pueden ser 0)
  dunningGraceHours: number;      // Horas de gracia para reintentos en clientes antiguos (ej: 72)
}

export interface TenantBillingConfig {
  tenantId: TenantId;
  displayName: string;
  supportEmail: string;
  plans: BillingPlanDefinition[];
}

export interface CardTokenPayload {
  tokenId: string;                // Token generado de forma segura en navegador por Openpay.js
  deviceSessionId: string;        // Huella antifraude generada por openpay-data.js
}

export interface SubscriberBillingRecord {
  id?: string;
  tenantId: TenantId;
  subscriberId: string;           // UID del usuario en la aplicación conectada
  email: string;
  status: EntitlementStatus;
  currentPlanCode: string;
  openpayCustomerId: string;
  openpaySubscriptionId?: string;
  openpayCardId?: string;
  cardLast4?: string;
  cardBrand?: string;
  trialStartDate?: string;        // Formato ISO
  trialEndDate?: string;          // Formato ISO
  currentPeriodStart: string;     // Formato ISO
  currentPeriodEnd: string;       // Formato ISO
  cancelAtPeriodEnd: boolean;
  hasConsumedTrial: boolean;      // Bandera antifraude para impedir múltiples trials
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  tenantId: TenantId;
  subscriberId: string;
  orderId: string;
  openpayTransactionId: string;
  type: 
    | 'TRIAL_START'
    | 'SUBSCRIPTION_CHARGE'
    | 'RENEWAL_CHARGE'
    | 'REFUND'
    | 'CHARGEBACK'
    | 'MANUAL_BRE_B';
  grossAmountCop: number;
  openpayFeeCop: number;          // Tarifa Openpay (ej: 2.99% + $800 COP)
  openpayVatCop: number;          // IVA del 19% sobre la tarifa de Openpay
  netAmountCop: number;           // Monto neto liquidable en BBVA
  currency: 'COP';
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TrialRegistryRecord {
  id: string;
  fingerprint: string;            // SHA-256 de BIN + Últimos 4 + Nombre + Email
  subscriberId: string;
  tenantId: TenantId;
  consumedAt: string;
}

export interface AccessResolution {
  hasAccess: boolean;             // true si puede usar la app; false si debe ver Paywall
  status: EntitlementStatus;
  daysRemaining: number;
  isTrial: boolean;
  willCancelAtPeriodEnd: boolean;
  paywallMessage?: string;
  actionRequired?: 'NONE' | 'UPDATE_CARD' | 'RENEW_SUBSCRIPTION' | 'RESOLVE_FRAUD';
}
