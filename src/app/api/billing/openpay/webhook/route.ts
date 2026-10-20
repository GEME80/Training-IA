/**
 * OPENPAY COLOMBIA - SECURE WEBHOOK ROUTE
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Protegido por:
 * 1. Verificación criptográfica Timing-Safe de HTTP Basic Auth
 * 2. Double-Check Server-to-Server contra la API privada de Openpay
 * 3. Deduplicación en el Libro Mayor Inmutable (gmc_immutable_ledger)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GmcBillingEngine } from '@/../gmc-billing-engine/src';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const payload = await req.json().catch(() => null);

    if (!payload) {
      return NextResponse.json(
        { error: 'Cuerpo de la petición inválido o vacío' },
        { status: 400 }
      );
    }

    const engine = new GmcBillingEngine();
    const result = await engine.processWebhook(authHeader, payload);

    if (!result.processed) {
      if (result.reason?.includes('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'No autorizado: Credenciales de webhook incorrectas' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Fallo procesando webhook: ${result.reason}` },
        { status: 422 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Evento de webhook procesado y conciliado en Libro Mayor',
      detail: result.reason,
    });
  } catch (error: any) {
    console.error('[OPENPAY_WEBHOOK_HANDLER_ERROR]', error);
    return NextResponse.json(
      { error: 'Error interno en el procesamiento del webhook' },
      { status: 500 }
    );
  }
}
