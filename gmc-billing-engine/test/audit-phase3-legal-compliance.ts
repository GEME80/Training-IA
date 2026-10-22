/**
 * AUDITORÍA AUTOMATIZADA — FASE 3 (IDENTIDAD COMERCIAL GERMAN MORALES CONSULTING, LEY 1480 Y LEY 1581)
 * GMC FinSec Billing Engine - Tenant Pulse Endurance
 * (C) German Morales Consulting
 */

import * as fs from 'fs';
import * as path from 'path';

function runPhase3Audit() {
  console.log('==================================================================');
  console.log('⚖️  INICIANDO AUDITORÍA FASE 3 — CUMPLIMIENTO LEGAL & OPENPAY');
  console.log('==================================================================\n');

  const landingFooterPath = path.resolve(__dirname, '../../src/components/landing/LandingFooter.tsx');
  const dashboardPath = path.resolve(__dirname, '../../src/components/AthleteDashboard.tsx');
  const termsPath = path.resolve(__dirname, '../../src/app/terms/page.tsx');
  const privacyPath = path.resolve(__dirname, '../../src/app/privacy/page.tsx');

  const landingFooter = fs.readFileSync(landingFooterPath, 'utf-8');
  const dashboard = fs.readFileSync(dashboardPath, 'utf-8');
  const terms = fs.readFileSync(termsPath, 'utf-8');
  const privacy = fs.readFileSync(privacyPath, 'utf-8');

  let passed = 0;
  const total = 6;

  // 1. Verificar "German Morales Consulting" en los 4 pies de página / vistas y correo solo en páginas legales
  if (
    landingFooter.includes('German Morales Consulting') &&
    !landingFooter.includes('@') &&
    dashboard.includes('German Morales Consulting') &&
    terms.includes('German Morales Consulting') &&
    terms.includes('germanmoralesconsulting@gmail.com') &&
    !terms.includes('gerkof@gmail.com') &&
    privacy.includes('German Morales Consulting') &&
    privacy.includes('germanmoralesconsulting@gmail.com') &&
    !privacy.includes('gerkof@gmail.com')
  ) {
    console.log('✅ [CONTROL 3.1] Razón "German Morales Consulting" en los 4 archivos; correo germanmoralesconsulting@gmail.com únicamente en /terms y /privacy (sin correo en Home).');
    passed++;
  } else {
    throw new Error('❌ [FALLO 3.1] Error en identidad comercial o correo de contacto.');
  }

  // 2. Verificar cláusula de Moneda Única COP y conversión internacional en /terms
  if (
    terms.includes('Pesos Colombianos (COP)') &&
    terms.includes('conversión a su moneda local') &&
    terms.includes('Openpay Colombia S.A.S.')
  ) {
    console.log('✅ [CONTROL 3.2] Cláusula de facturación exclusiva en COP y conversión bancaria internacional presente en /terms.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 3.2] Falta cláusula de facturación en COP o conversión internacional en /terms.');
  }

  // 3. Verificar Derecho de Retracto (Art. 47 Ley 1480) y Reversión del Pago (Art. 51 Ley 1480 / Decreto 587)
  if (
    terms.includes('Artículo 47') &&
    terms.includes('Artículo 51') &&
    terms.includes('Ley 1480 de 2011') &&
    terms.includes('Decreto 587 de 2016')
  ) {
    console.log('✅ [CONTROL 3.3] Cláusulas de Derecho de Retracto (Art. 47) y Reversión del Pago (Art. 51 Ley 1480 / Decreto 587) verificadas en /terms.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 3.3] Faltan referencias normativas de Ley 1480 / Decreto 587 en /terms.');
  }

  // 4. Verificar Ley 1581 de 2012 (Habeas Data) y PCI-DSS SAQ-A en /privacy
  if (
    privacy.includes('Ley Estatutaria 1581 de 2012') &&
    privacy.includes('Openpay Colombia S.A.S.') &&
    privacy.includes('PCI-DSS Nivel 1 (Arquitectura SAQ-A)')
  ) {
    console.log('✅ [CONTROL 3.4] Ley 1581 de 2012 (Habeas Data), Openpay Colombia S.A.S. y PCI-DSS SAQ-A verificados en /privacy.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 3.4] Faltan referencias a Ley 1581 o PCI-DSS SAQ-A en /privacy.');
  }

  // 5. Verificar notificación automática de pago de Openpay (send_email: true) en el cliente Openpay
  const openpayClientPath = path.resolve(__dirname, '../src/providers/openpay/client.ts');
  const openpayClient = fs.readFileSync(openpayClientPath, 'utf-8');
  if (openpayClient.includes('send_email: true')) {
    console.log('✅ [CONTROL 3.5] Despacho automático de comprobante oficial por Openpay BBVA (send_email: true) activo.');
    passed++;
  } else {
    throw new Error('❌ [FALLO 3.5] send_email: true no está activo en gmc-billing-engine/src/providers/openpay/client.ts');
  }

  // 6. Verificar Gate 1 (<= 348 líneas) en los 4 archivos de Fase 3
  const filesToCheck = [
    { name: 'LandingFooter.tsx', lines: landingFooter.split('\n').length },
    { name: 'AthleteDashboard.tsx', lines: dashboard.split('\n').length },
    { name: 'terms/page.tsx', lines: terms.split('\n').length },
    { name: 'privacy/page.tsx', lines: privacy.split('\n').length },
  ];
  const anyExceeds = filesToCheck.find((f) => f.lines > 348);
  if (!anyExceeds) {
    console.log(
      `✅ [CONTROL 3.6] Gate 1 cumplido en todos los archivos legales (${filesToCheck
        .map((f) => `${f.name}: ${f.lines}L`)
        .join(', ')}).`
    );
    passed++;
  } else {
    throw new Error(`❌ [FALLO 3.6] ${anyExceeds.name} excede 348 líneas (${anyExceeds.lines}).`);
  }

  console.log(`\n🏆 RESULTADO AUDITORÍA FASE 3: ${passed}/${total} CONTROLES LEGALES SUPERADOS AL 100%.\n`);
}

runPhase3Audit();
