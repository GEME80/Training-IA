/**
 * CLIENT-SIDE OPENPAY CHECKOUT REDIRECTOR
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 * 
 * Redirección directa y sin fricción al portal seguro de Openpay (BBVA Colombia).
 * Cumple PCI-DSS SAQ-A: Cero manipulación de números de tarjeta en Pulse.
 */

export interface OpenpayCheckoutParams {
  subscriberId: string;
  athleteName?: string;
  athleteEmail?: string;
  planCode?: string;
}

export async function redirectToOpenpayCheckout(params: OpenpayCheckoutParams): Promise<void> {
  const response = await fetch('/api/billing/openpay/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriberId: params.subscriberId,
      athleteName: params.athleteName || 'Atleta Pulse',
      athleteEmail: params.athleteEmail,
      planCode: params.planCode || 'PULSE_PRO_MONTHLY',
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.checkoutUrl) {
    throw new Error(data?.error || 'No se pudo generar la sesión de pago con Openpay BBVA.');
  }

  window.location.href = data.checkoutUrl;
}
