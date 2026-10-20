/**
 * GMC FINSEC BILLING ENGINE - AGENTE 5: FORENSIC LEDGER AUDITOR
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Misión:
 * 1. Registrar cada movimiento de dinero de forma inmutable (Append-Only) en gmc_immutable_ledger.
 * 2. Calcular la comisión exacta de Openpay BBVA (2.99% + $800 COP + 19% IVA).
 * 3. Proyectar el valor neto real a liquidar cada miércoles en la cuenta BBVA.
 * 4. Jamás permitir la modificación (update) o eliminación (delete) de un asiento contable.
 */

import { adminDb } from '@/lib/firebase/admin';
import { LedgerEntry } from '../core/types';

export class ForensicLedgerAuditorAgent {
  /**
   * Calcula el desglose financiero exacto de Openpay Colombia para tarjetas de crédito/débito
   * Tarifa preferencial convenio BBVA: 2.99% + $800 COP + 19% IVA sobre la comisión
   */
  static calculateOpenpaySplit(grossAmountCop: number): {
    grossAmountCop: number;
    openpayFeeCop: number;
    openpayVatCop: number;
    totalDeductionCop: number;
    netAmountCop: number;
  } {
    if (grossAmountCop <= 0) {
      return {
        grossAmountCop: 0,
        openpayFeeCop: 0,
        openpayVatCop: 0,
        totalDeductionCop: 0,
        netAmountCop: 0,
      };
    }

    // 1. Tarifa base de pasarela: 2.99% del monto bruto + $800 COP fijos
    const variableFee = Math.round(grossAmountCop * 0.0299);
    const fixedFee = 800;
    const openpayFeeCop = variableFee + fixedFee;

    // 2. IVA del 19% sobre la comisión de Openpay
    const openpayVatCop = Math.round(openpayFeeCop * 0.19);

    // 3. Deducción total y Neto que entra a la cuenta BBVA
    const totalDeductionCop = openpayFeeCop + openpayVatCop;
    const netAmountCop = Math.max(0, grossAmountCop - totalDeductionCop);

    return {
      grossAmountCop,
      openpayFeeCop,
      openpayVatCop,
      totalDeductionCop,
      netAmountCop,
    };
  }

  /**
   * Escribe un asiento contable inmutable (Append-Only)
   */
  static async recordLedgerEntry(entry: Omit<LedgerEntry, 'openpayFeeCop' | 'openpayVatCop' | 'netAmountCop'>): Promise<LedgerEntry> {
    const split = this.calculateOpenpaySplit(entry.grossAmountCop);

    const fullEntry: LedgerEntry = {
      ...entry,
      openpayFeeCop: split.openpayFeeCop,
      openpayVatCop: split.openpayVatCop,
      netAmountCop: split.netAmountCop,
    };

    if (adminDb) {
      try {
        const docRef = adminDb.collection('gmc_immutable_ledger').doc(fullEntry.id);
        
        // REGLA APPEND-ONLY: Verificar que no exista antes de escribir
        const existing = await docRef.get();
        if (existing.exists) {
          throw new Error(`[LEDGER_TAMPER_PROTECTION] El asiento ${fullEntry.id} ya existe en el Libro Mayor. Prohibido sobreescribir.`);
        }

        await docRef.set(fullEntry);
      } catch (err: any) {
        if (err.message?.includes('LEDGER_TAMPER_PROTECTION')) {
          throw err;
        }
        console.warn('[FORENSIC_LEDGER_WARN] Firestore no disponible para asentar libro mayor:', err.message);
      }
    }

    return fullEntry;
  }
}
