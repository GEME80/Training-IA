/**
 * GMC FINSEC BILLING ENGINE - OPENPAY ERROR CATALOG & UX NORMALIZER
 * (C) German Morales Consulting
 */

export interface OpenpayErrorDefinition {
  code: number | string;
  category: 'INSUFFICIENT_FUNDS' | 'EXPIRED_CARD' | 'DECLINED_BANK' | 'INTERNATIONAL_RESTRICTION' | 'SECURITY_3DS' | 'RESTRICTED_CARD' | 'UNKNOWN';
  bankReason: string;
  dashboardBanner: string;
  profileMessage: string;
  actionText: string;
}

export const OPENPAY_ERROR_CATALOG: Record<string, OpenpayErrorDefinition> = {
  '3003': {
    code: 3003,
    category: 'INSUFFICIENT_FUNDS',
    bankReason: 'Fondos insuficientes en la cuenta del tarjetahabiente',
    dashboardBanner: 'Cobro no procesado por saldo insuficiente. Tienes {hours}h de gracia con acceso activo. Por favor recarga tu cuenta o registra otra tarjeta.',
    profileMessage: 'Tu banco reportó fondos insuficientes en tu tarjeta {cardText} para el cobro de {amount}. Conservas tu acceso activo mientras regularizas tu saldo.',
    actionText: 'Actualizar Tarjeta o Reintentar',
  },
  '3004': {
    code: 3004,
    category: 'EXPIRED_CARD',
    bankReason: 'La tarjeta se encuentra vencida o la fecha de expiración es inválida',
    dashboardBanner: 'Tu tarjeta registrada ha vencido. Actualiza tu método de pago para evitar la interrupción de tus entrenamientos.',
    profileMessage: 'La tarjeta registrada {cardText} expiró. Registra la nueva fecha de vencimiento o un nuevo plástico para continuar activo.',
    actionText: 'Registrar Tarjeta Vigente',
  },
  '3006': {
    code: 3006,
    category: 'INTERNATIONAL_RESTRICTION',
    bankReason: 'La tarjeta no soporta compras en línea o transacciones internacionales en COP',
    dashboardBanner: 'Transacción internacional rechazada. Tu banco emisor no autorizó el cargo en Pesos Colombianos ({amount}).',
    profileMessage: 'Tu banco emisor en el exterior declinó el cargo en moneda colombiana. Habilita compras internacionales en tu app bancaria o usa otra tarjeta.',
    actionText: 'Pagar con Otra Tarjeta',
  },
  '3001': {
    code: 3001,
    category: 'DECLINED_BANK',
    bankReason: 'La tarjeta fue declinada por el banco emisor por políticas internas',
    dashboardBanner: 'Transacción declinada por tu entidad bancaria. Comunícate con tu banco para autorizar el cargo a Pulse Endurance.',
    profileMessage: 'El banco emisor de tu tarjeta {cardText} rechazó el cobro por políticas de seguridad o compras recurrentes en internet.',
    actionText: 'Usar Otra Tarjeta o Reintentar',
  },
  '3005': {
    code: 3005,
    category: 'DECLINED_BANK',
    bankReason: 'Rechazo general o código de seguridad inválido',
    dashboardBanner: 'Transacción rechazada por el banco emisor. Verifica los datos o registra otro medio de pago.',
    profileMessage: 'El banco emisor no autorizó la operación. Te sugerimos reintentar con otra tarjeta de crédito o débito.',
    actionText: 'Cambiar Medio de Pago',
  },
  '3010': {
    code: 3010,
    category: 'SECURITY_3DS',
    bankReason: 'Autenticación 3D Secure no completada, cancelada o tiempo de espera expirado',
    dashboardBanner: 'Verificación de seguridad bancaria no completada. No se recibió la confirmación del código de tu banco.',
    profileMessage: 'La autenticación de dos pasos (3DS) requerida por tu banco no se finalizó o la ventana expiró.',
    actionText: 'Reintentar Verificación 3DS',
  },
  '3002': {
    code: 3002,
    category: 'RESTRICTED_CARD',
    bankReason: 'Tarjeta reportada como extraviada, robada o con bloqueo preventivo',
    dashboardBanner: 'Medio de pago no disponible. Tu entidad financiera reportó este plástico como restringido.',
    profileMessage: 'Por seguridad bancaria, este método de pago no puede procesar cobros recurrentes. Ingresa un nuevo medio de pago.',
    actionText: 'Registrar Nueva Tarjeta',
  },
};

export function resolveOpenpayError(
  errorCode?: number | string | null,
  options?: { hoursRemaining?: number; cardLast4?: string | null; amountCop?: number }
): OpenpayErrorDefinition {
  const codeStr = String(errorCode || '3003');
  const def = OPENPAY_ERROR_CATALOG[codeStr] || OPENPAY_ERROR_CATALOG['3003'];
  const hours = options?.hoursRemaining ?? 72;
  const cardText = options?.cardLast4 ? `•••• ${options.cardLast4}` : 'en archivo';
  const amount = options?.amountCop ? `$${options.amountCop.toLocaleString('es-CO')} COP` : '$55.000 COP';

  return {
    ...def,
    dashboardBanner: def.dashboardBanner.replace('{hours}', String(hours)).replace('{amount}', amount),
    profileMessage: def.profileMessage.replace('{cardText}', cardText).replace('{amount}', amount),
  };
}
