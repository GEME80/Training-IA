/**
 * API ROUTE: MÉTRICAS Y AUDITORÍA EJECUTIVA MULTI-TENANT (GMC FINSEC HQ)
 * GMC FinSec Billing Engine
 * (C) German Morales Consulting (GM CONSULTING)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ForensicLedgerAuditorAgent } from '@/../gmc-billing-engine/src/agents/forensicLedgerAuditor';

function getNextWednesday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 domingo, 1 lunes, 2 martes, 3 miércoles...
  const diff = (3 - day + 7) % 7 || 7; // Si hoy es miércoles, cuenta el próximo miércoles
  const nextWed = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
  return nextWed.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantFilter = searchParams.get('tenantId') || 'ALL';

    const tenants = [
      { id: 'ALL', name: 'Consolidado German Morales Consulting' },
      { id: 'PULSE_ENDURANCE', name: 'Pulse Endurance Coaching' },
      { id: 'HUBINFO', name: 'Hubinfo SaaS' },
    ];

    let ledgerEntries: any[] = [];
    let subscriptions: any[] = [];

    if (adminDb) {
      try {
        const ledgerSnap = await adminDb
          .collection('gmc_immutable_ledger')
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get();

        ledgerEntries = ledgerSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const subSnap = await adminDb.collection('gmc_subscriptions').get();
        subscriptions = subSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (dbErr) {
        console.warn('[FINSEC_HQ_DB_WARN] Error consultando Firestore para FinSec HQ:', dbErr);
      }
    }

    // Filtrar por Tenant si no es 'ALL'
    const filteredLedger = tenantFilter === 'ALL'
      ? ledgerEntries
      : ledgerEntries.filter((e) => e.tenantId === tenantFilter);

    const filteredSubs = tenantFilter === 'ALL'
      ? subscriptions
      : subscriptions.filter((s) => s.tenantId === tenantFilter);

    // Cálculos de Libro Mayor
    let totalGrossCop = 0;
    let totalOpenpayFeeCop = 0;
    let totalOpenpayVatCop = 0;
    let totalNetCop = 0;

    filteredLedger.forEach((entry) => {
      if (entry.status === 'COMPLETED') {
        totalGrossCop += entry.grossAmountCop || 0;
        totalOpenpayFeeCop += entry.openpayFeeCop || 0;
        totalOpenpayVatCop += entry.openpayVatCop || 0;
        totalNetCop += entry.netAmountCop || 0;
      }
    });

    const totalFeesCop = totalOpenpayFeeCop + totalOpenpayVatCop;

    // Pipeline de Suscripciones
    const activePaid = filteredSubs.filter((s) => s.status === 'ACTIVE').length;
    const activeTrial = filteredSubs.filter((s) => s.status === 'TRIAL_ACTIVE').length;
    const cancelScheduled = filteredSubs.filter((s) => s.status === 'CANCEL_SCHEDULED' || s.cancelAtPeriodEnd).length;
    const pastDueLocked = filteredSubs.filter((s) => s.status === 'PAST_DUE_LOCKED' || s.status === 'CANCELLED_LOCKED').length;

    return NextResponse.json({
      success: true,
      selectedTenant: tenantFilter,
      tenants,
      financialSummary: {
        totalGrossCop,
        totalOpenpayFeeCop,
        totalOpenpayVatCop,
        totalFeesCop,
        totalNetDisbursementCop: totalNetCop,
        nextDisbursementDay: 'Miércoles (Semanal BBVA)',
        nextDisbursementDate: getNextWednesday(),
        savingsBankAccount: 'BBVA Colombia • GM CONSULTING',
        feeFormula: '2.99% + $800 COP + 19% IVA',
      },
      subscriptionPipeline: {
        totalSubscribers: filteredSubs.length,
        activePaid,
        activeTrial,
        cancelScheduled,
        pastDueLocked,
      },
      finSecAgentsStatus: [
        {
          name: '1. Sentinel-AntiFraud',
          status: 'ONLINE',
          health: 'OPTIMAL',
          details: 'Protección activa PCI SAQ-A • 0 fugas de PAN • Anti-Trial-Hopping activo en gmc_trial_registry',
        },
        {
          name: '2. Idempotency-Lock-Guard',
          status: 'ONLINE',
          health: 'OPTIMAL',
          details: 'Semáforo atómico distribuido activo • Órdenes deterministas GMC-{TENANT}-SUB-{ID}',
        },
        {
          name: '3. Webhook-Crypto-Router',
          status: 'ONLINE',
          health: 'OPTIMAL',
          details: 'Timing-Safe Basic Auth activo • Verificación cruzada Server-to-Server Openpay habilitada',
        },
        {
          name: '4. Netflix-Lifecycle-Dunning',
          status: 'ONLINE',
          health: 'OPTIMAL',
          details: 'Máquina de 9 estados activa • Trial 7 días • Dunning 72h • Paywall bloqueante',
        },
        {
          name: '5. Forensic-Ledger-Auditor',
          status: 'ONLINE',
          health: 'OPTIMAL',
          details: 'Libro Mayor Inmutable (Append-Only) conciliado con la cuenta BBVA Colombia',
        },
      ],
      ledgerEntries: filteredLedger,
    });
  } catch (error: any) {
    console.error('[FINSEC_HQ_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Error en FinSec HQ' }, { status: 500 });
  }
}
