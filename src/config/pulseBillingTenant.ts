/**
 * CONFIGURACIÓN DE FACTURACIÓN Y PLANES: PULSE ENDURANCE (TENANT #1)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Define la regla comercial para Pulse Endurance:
 * - 7 Días de prueba gratuita con tarjeta obligatoria (trialDays: 7).
 * - Tarifa mensual estándar: $99.000 COP.
 * - 72 horas de gracia en reintentos para atletas recurrentes (dunningGraceHours: 72).
 */

import { TenantBillingConfig } from '@/../gmc-billing-engine/src/core/types';

export const TENANT_PULSE_ENDURANCE: TenantBillingConfig = {
  tenantId: 'PULSE_ENDURANCE',
  displayName: 'Pulse Endurance Coaching',
  supportEmail: 'soporte@pulseendurance.com',
  plans: [
    {
      planCode: 'PULSE_PRO_MONTHLY',
      name: 'Plan Atleta Pro Mensual',
      amountCop: 99000,
      interval: 'MONTH',
      trialDays: 7, // 👈 Política comercial de Pulse: 7 días de prueba gratis con tarjeta
      dunningGraceHours: 72,
    },
    {
      planCode: 'PULSE_VIP_ANNUAL',
      name: 'Plan Anual Atleta Élite',
      amountCop: 990000, // 2 meses de regalo
      interval: 'YEAR',
      trialDays: 0, // Cobro inmediato sin trial para plan anual con descuento
      dunningGraceHours: 72,
    },
  ],
};
