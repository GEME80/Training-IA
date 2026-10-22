/**
 * AUDITORÍA AUTOMATIZADA — FASE 2 (MONEDA ÚNICA COP, RETIRO SANDBOX TEST Y REDIRECCIÓN DIRECTA)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import * as fs from 'fs';
import * as path from 'path';

function runPhase2Audit() {
  console.log('==================================================================');
  console.log('🎨  INICIANDO AUDITORÍA FASE 2 — MONEDA ÚNICA COP & UX DE PAGO');
  console.log('==================================================================\n');

  const pricingFaqPath = path.resolve(__dirname, '../../src/components/landing/PricingAndFaqSection.tsx');
  const paywallPath = path.resolve(__dirname, '../../src/components/billing/GmcPaywallLockView.tsx');
  const bannerPath = path.resolve(__dirname, '../../src/components/dashboard/AthleteBillingBanner.tsx');
  const subTabPath = path.resolve(__dirname, '../../src/components/profile/AthleteSubscriptionTab.tsx');

  const pricingContent = fs.readFileSync(pricingFaqPath, 'utf-8');
  const paywallContent = fs.readFileSync(paywallPath, 'utf-8');
  const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
  const subTabContent = fs.readFileSync(subTabPath, 'utf-8');

  let passed = 0;
  const total = 5;

  // 1. Verificar eliminación total de USD $14.99 y toggle de moneda en PricingAndFaqSection.tsx
  if (!pricingContent.includes('14.99') && !pricingContent.includes('USD $') && !pricingContent.includes('setCurrency')) {
    console.log('✅ [CONTROL 2.1] Eliminado el selector USD ($14.99 / mo). Moneda única oficial en COP confirmada.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 2.1] Aún existen referencias a 14.99 o setCurrency en PricingAndFaqSection.tsx');
  }

  // 2. Verificar presencia de nota informativa para tarjetas internacionales (conversión bancaria automática)
  if (
    pricingContent.includes('Tarjetas internacionales convierten automáticamente a tu moneda local') &&
    pricingContent.includes('German Morales Consulting')
  ) {
    console.log('✅ [CONTROL 2.2] Nota de conversión automática para tarjetas internacionales e identidad German Morales Consulting presentes.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 2.2] Falta la nota de conversión internacional o identidad comercial en PricingAndFaqSection.tsx');
  }

  // 3. Verificar eliminación del bloque negro de Sandbox Test (4111 1111 1111 1111)
  if (!pricingContent.includes('4111') && !pricingContent.includes('Sandbox Test')) {
    console.log('✅ [CONTROL 2.3] Bloque de pruebas "Sandbox Test (4111 1111...)" erradicado de la vista pública.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 2.3] Aún existe tarjeta de prueba 4111 o Sandbox Test en PricingAndFaqSection.tsx');
  }

  // 4. Verificar que los 4 puntos de checkout usan redirectToOpenpayCheckout sin GmcCardCheckoutModal
  const allUseDirectRedirect =
    pricingContent.includes('redirectToOpenpayCheckout') &&
    paywallContent.includes('redirectToOpenpayCheckout') &&
    bannerContent.includes('redirectToOpenpayCheckout') &&
    subTabContent.includes('redirectToOpenpayCheckout');

  const noneUseIntermediateModal =
    !pricingContent.includes('GmcCardCheckoutModal') &&
    !paywallContent.includes('GmcCardCheckoutModal') &&
    !bannerContent.includes('GmcCardCheckoutModal') &&
    !subTabContent.includes('GmcCardCheckoutModal');

  if (allUseDirectRedirect && noneUseIntermediateModal) {
    console.log('✅ [CONTROL 2.4] Los 4 puntos de pago redirigen en 1 clic a Openpay BBVA sin modal intermedio.');
    passed++;
  } else {
    throw new Error(`❌ [FALLO 2.4] allUseDirectRedirect=${allUseDirectRedirect}, noneUseIntermediateModal=${noneUseIntermediateModal}`);
  }

  // 5. Verificar Gate 1 (<= 348 líneas) en PricingAndFaqSection.tsx
  const lines = pricingContent.split('\n').length;
  if (lines <= 348) {
    console.log(`✅ [CONTROL 2.5] Gate 1 cumplido en PricingAndFaqSection.tsx (${lines} líneas <= 348).`);
    passed++;
  } else {
    throw new Error(`❌ [FALLO 2.5] PricingAndFaqSection.tsx excede 348 líneas (${lines}).`);
  }

  console.log(`\n🏆 RESULTADO AUDITORÍA FASE 2: ${passed}/${total} CONTROLES SUPERADOS AL 100%.\n`);
}

runPhase2Audit();
