/**
 * GMC FINSEC BILLING ENGINE - AGENTE 2: IDEMPOTENCY & MUTEX LOCK GUARD
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Misión:
 * 1. Garantizar que ninguna operación financiera se procese por duplicado.
 * 2. Asignar claves de orden deterministas basadas en el periodo (GMC-{TENANT}-SUB-{SUBSCRIBER}-{YYYYMM}).
 * 3. Liberar bloqueos atómicos sin importar si la transacción tuvo éxito o falló.
 */

import { withBillingLock, generateDeterministicOrderId, LockOptions } from '../core/idempotencyLock';

export class IdempotencyLockGuardAgent {
  /**
   * Ejecuta una acción bancaria de forma 100% aislada e idempotente
   */
  static async executeProtectedOperation<T>(
    options: LockOptions,
    operationFn: (orderId: string) => Promise<T>
  ): Promise<T> {
    return withBillingLock(options, async (orderId) => {
      return await operationFn(orderId);
    });
  }

  static getDeterministicOrderId(tenantId: string, subscriberId: string, date: Date = new Date()): string {
    return generateDeterministicOrderId(tenantId, subscriberId, date);
  }
}
