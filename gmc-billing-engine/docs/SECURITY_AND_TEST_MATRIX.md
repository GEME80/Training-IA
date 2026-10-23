# POLÍTICAS DE SEGURIDAD BANCARIA (ZERO-TRUST FINSEC) Y MATRIZ DE PRUEBAS
## Estándares de Blindaje y Certificación para el GMC FinSec Billing Engine

**Propiedad de:** German Morales Consulting (`GM CONSULTING`)  
**Alcance:** Todas las aplicaciones presentes y futuras conectadas al motor de pagos (*Pulse Endurance*, *Hubinfo*, etc.)  
**Cumplimiento:** PCI-DSS Nivel SAQ-A, OWASP API Security Top 10 (2026), Normativa Antifraude BBVA / Openpay Colombia

---

## 1. Los 7 Mandamientos de Seguridad del Motor de Pagos

Ningún desarrollador ni agente de IA puede modificar el código del motor sin cumplir estrictamente estas 7 reglas:

1. **Cero Secretos Hardcodeados (`Zero Hardcoded Secrets`):**
   * Queda estrictamente prohibido escribir llaves privadas (`sk_...`), llaves públicas (`pk_...`), `MERCHANT_ID` reales, ni contraseñas de webhooks dentro de archivos `.ts`, `.tsx`, `.js` o `.md`.
   * Todo secreto se lee exclusivamente desde `process.env` en el servidor y es validado al iniciar mediante esquemas estrictos de **Zod**.
2. **Aislamiento Absoluto PCI-DSS SAQ-A:**
   * Los inputs del formulario de tarjeta (`card_number`, `cvv2`, `expiration_month`, `expiration_year`) **jamás tendrán el atributo HTML `name`**, garantizando que el navegador nunca los incluya en un `POST` hacia nuestro servidor.
   * La tarjeta viaja directamente desde el navegador del usuario hacia los servidores de Openpay BBVA mediante `Openpay.token.extractFormAndCreate()`.
3. **Verificación Cruzada Obligatoria (*Server-to-Server Double Check*):**
   * Ningún Webhook se da por válido únicamente por su payload entrante. Al recibir un evento `charge.succeeded` o `charge.refunded`, el backend consulta directamente la API oficial de Openpay (`GET /v1/{MERCHANT_ID}/charges/{id}`) con la llave privada del servidor antes de otorgar o revocar permisos.
4. **Protección Anti-Carding, Velocity Limiting y Anti-Trial-Hopping:**
   * Todo endpoint público de suscripción aplica límites de velocidad por IP y por `subscriberId` (máximo 3 intentos fallidos cada 15 minutos) para impedir que atacantes usen nuestros formularios para probar lotes de tarjetas robadas.
   * La colección `gmc_trial_registry` registra quién ya usó sus 7 días de prueba gratis (por usuario y huella de tarjeta) para impedir múltiples periodos gratuitos con la misma persona o tarjeta.
5. **Huella Digital Antifraude Obligatoria (`DeviceSessionId`):**
   * Ninguna solicitud de suscripción o cargo será enviada a Openpay si no incluye el `device_session_id` generado en vivo por la librería antifraude `openpay-data.js`.
6. **Idempotencia y Bloqueo Distribuido (`Distributed Mutex Lock`):**
   * Toda operación financiera adquiere un bloqueo atómico en base de datos antes de contactar a Openpay y utiliza un `order_id` determinista (`GMC-{TENANT}-SUB-{SUBSCRIBER}-{YYYYMM}`). Es matemáticamente imposible ejecutar dos cobros para el mismo usuario en el mismo periodo.
7. **Libro Mayor Inmutable (`Append-Only Immutable Ledger`):**
   * En la colección `gmc_immutable_ledger` **solo se permite crear registros (`create`), jamás editar (`update`) ni borrar (`delete`)**. Toda corrección o devolución se registra como un nuevo asiento contable de contrapartida.

---

## 2. Reglas de Seguridad de Base de Datos (Firestore Security Rules para el Motor)

El esquema de datos del motor se aísla en colecciones dedicadas donde el cliente (navegador) tiene **cero permisos de escritura**:

```javascript
// Reglas de Seguridad para las colecciones del GMC FinSec Billing Engine
match /gmc_subscriptions/{subscriptionDocId} {
  // El usuario solo puede leer su propio estado de suscripción
  allow read: if request.auth != null && resource.data.subscriberId == request.auth.uid;
  // PROHIBIDO escribir desde el navegador: Solo el Backend Admin puede modificar estados de pago
  allow write: if false;
}

match /gmc_trial_registry/{registryId} {
  // Registro antifraude de periodos de prueba de 7 días: 100% privado del servidor
  allow read, write: if false;
}

match /gmc_immutable_ledger/{ledgerEntryId} {
  // Solo administradores verificados pueden leer el libro mayor contable
  allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
  // PROHIBIDO modificar o borrar desde cliente
  allow write: if false;
}

match /gmc_billing_locks/{lockId} {
  allow read, write: if false; // Exclusivo para el Agente de Idempotencia en Backend
}
```

---

## 3. Matriz Exhaustiva de 15 Pruebas de Seguridad, Ciclo de Vida y Caos en Sandbox (`TC-01` a `TC-15`)

Antes de activar dinero real en **Pulse Endurance** (Fase 3), el motor debe superar los siguientes **15 escenarios de certificación**:

| ID | Categoría | Escenario de Prueba | Entrada / Simulación | Respuesta Esperada del Motor y Agentes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Trial 7 Días** | **Alta de 7 Días Gratis con Tarjeta Válida** | Tarjeta Sandbox Aprobada (`4242...`) de un usuario nuevo + `device_session_id`. | Se registra la tarjeta en Openpay con `trial_days: 7`, monto cobrado hoy = `$0`. Estado pasa a `TRIAL_ACTIVE` hasta `Hoy + 7 días`. Se registra en `gmc_trial_registry`. |
| **TC-02** | **Fin de Trial** | **Cobro Automático en Día 8 Exitoso** | Llega el Día 8 con tarjeta válida (`4242...`). | Openpay ejecuta el cargo mensual $\rightarrow$ Webhook verificado en servidor $\rightarrow$ Estado pasa a `ACTIVE` y suma 1 mes completo de acceso. |
| **TC-03** | **Fin de Trial** | **Cobro Fallido en Día 8 (Tarjeta sin Fondos)** | Llega el Día 8 pero la tarjeta registrada no tiene cupo (`4111...`). | Como es el primer cobro post-trial, **no hay días extra de gracia**: pasa inmediatamente a `PAST_DUE_LOCKED` (Paywall bloqueante). |
| **TC-04** | **Antifraude Trial** | **Intento de Doble Trial (*Anti-Trial Hopping*)** | Usuario que ya usó sus 7 días gratis cancela y vuelve a suscribirse (o usa la misma tarjeta en otra cuenta). | `Sentinel-AntiFraud` detecta registro en `gmc_trial_registry` (`Regla TRIAL-01`) y fuerza `trial_days: 0` (Cobro inmediato en el Día 1). |
| **TC-05** | **Cancelación** | **Cancelación Durante los 7 Días de Prueba (Ej. Día 3)** | Usuario en `TRIAL_ACTIVE` oprime *"Cancelar suscripción"* en el Día 3. | Se anula el cobro del Día 8 en Openpay. El usuario **conserva acceso los 4 días restantes** hasta el Día 7 y en el Día 8 se bloquea con `CANCELLED_LOCKED` sin cobrarle nada. |
| **TC-06** | **Cancelación** | **Cancelación a Mitad de Mes Ya Pagado (Ej. Día 18 de 30)** | Usuario en `ACTIVE` (pagó del 10 Oct al 10 Nov) cancela el 22 de Octubre. | Pasa a `CANCEL_SCHEDULED` (`cancelAtPeriodEnd = true`). **Conserva acceso total hasta el 10 de Noviembre**. El 11 de Noviembre no se le cobra y pasa a `CANCELLED_LOCKED`. |
| **TC-07** | **Retención** | **"Arrepentimiento" (Reanudar antes del vencimiento)** | Usuario en `CANCEL_SCHEDULED` oprime *"Reanudar Suscripción"* antes del 10 de Noviembre. | Vuelve a estado `ACTIVE` manteniendo su fecha de corte original (10 de Noviembre) **sin generar un cobro doble ese día**. |
| **TC-08** | **Reactivación** | **Reactivación Después de Estar Bloqueado** | Usuario cuyo plan venció el 10 de Noviembre regresa el 25 de Noviembre y paga. | Como ya usó su trial antes, se le cobra inmediatamente el 25 de Noviembre, se desbloquea al instante y su nueva fecha de corte queda anclada al **día 25 de cada mes**. |
| **TC-09** | **Dunning Mes 2+** | **Fallo de Cobro en Renovación de Cliente Antiguo** | Cliente que ya llevaba meses pagando sufre rechazo en el Mes 3. | Entra en `GRACE_PERIOD` por 72h mientras Openpay hace 2 reintentos. Ve banner de alerta. Si tras 72h no paga, pasa a `PAST_DUE_LOCKED` (Paywall Netflix). |
| **TC-10** | **Autogestión** | **Cambio de Tarjeta a Mitad de Mes (*Card Swap*)** | Usuario activo reemplaza su tarjeta Visa por una Mastercard el día 15. | Se tokeniza la nueva tarjeta, se actualiza en la suscripción de Openpay y se borra la anterior **sin cobrarle de nuevo ese día**. |
| **TC-11** | **Concurrencia** | **Ataque de Doble Clic / Red Lenta** | 5 peticiones `POST /subscribe` enviadas en el mismo milisegundo. | `Idempotency-Lock-Guard` procesa solo la #1 y aborta las 4 restantes con `409 Conflict`. Cero cobros duplicados. |
| **TC-12** | **Ciberseguridad** | **Ataque de Webhook Falso (*Spoofing*) y *Replay*** | Enviar `POST /webhook` falso desde Postman o repetir un webhook antiguo 3 veces. | Rechaza con `401` si no tiene Basic Auth, falla la verificación cruzada `GET /charges` si el ID es falso, e ignora si ya está en `gmc_immutable_ledger`. |
| **TC-13** | **Antifraude** | **Ataque de *Carding* e Inyección PCI** | Intentar 4 tarjetas fallidas seguidas o enviar `"card_number"` en el JSON al backend. | Bloquea por 24h al 4to intento (`429`) y aborta inmediatamente con `422 PCI_VIOLATION_ABORT` si detecta un PAN en texto plano. |
| **TC-14** | **Reversiones** | **Reembolso Administrativo Total/Parcial (`Refund`)** | Administrador ejecuta reembolso desde la consola. | Openpay devuelve fondos a la tarjeta $\rightarrow$ `Forensic-Auditor` registra el reembolso en el Libro Mayor y revoca el acceso (`CANCELLED_LOCKED`) al instante. |
| **TC-15** | **Multi-Tenant** | **Aislamiento entre Apps (*Pulse Endurance* vs *Hubinfo*)** | Procesar suscripciones de ambas apps en la misma cuenta Openpay. | Los prefijos `GMC-PULSE_ENDURANCE-...` y `GMC-HUBINFO-...` mantienen sus ingresos, clientes y permisos 100% separados y auditables en `GMC FinSec HQ`. |

---

## 4. Checklist de Auditoría por Fases (Sign-Off)

- [x] **Fase 1 (Núcleo):** Verificado al 100%. `gmc-billing-engine/` opera de forma completamente desacoplada con 17 pruebas unitarias superadas (`gmc-billing-engine/test/verify-phase1.ts`).
- [x] **Fase 2 (Pulse Endurance):** Verificado al 100%. Integración completada con modal PCI SAQ-A, flujo de 7 días gratis con tarjeta obligatoria, cancelación a mitad de ciclo respetando días pagados y Paywall Netflix (`gmc-billing-engine/test/verify-phase2.ts`).
- [x] **Fase 3 (Certificación):** Verificado al 100%. Matriz exhaustiva de 15 escenarios `TC-01` a `TC-15` aprobada exitosamente en Sandbox (`gmc-billing-engine/test/verify-phase3-matrix.ts`).
- [x] **Fase 4 (`GMC FinSec HQ`):** Verificado al 100%. Consola ejecutiva `/admin/finsec` y API `/api/admin/finsec/metrics` operativas con desglose semanal BBVA, pipeline de suscripciones, monitor en vivo de los 5 agentes y Libro Mayor Multi-Tenant descargable en CSV.
- [x] **Fase 5 (Blindaje Antifraude CISO y Certificación Openpay BBVA):** Verificado al 100%.
  * `gmc-billing-engine/test/audit-phase1-antifraud.ts`: 7/7 vectores de fraude bloqueados al 100% (Bypass URL, Transaction Hijacking, Price/Currency Tampering, Fake Resume, Email Spoofing, PCI Injection, Velocity Rate Limiting).
  * `gmc-billing-engine/test/audit-phase2-ux-currency.ts`: 5/5 controles de moneda única COP (\$55.000 COP) y redirección directa en 1 clic superados al 100%.
  * `gmc-billing-engine/test/audit-phase3-legal-compliance.ts`: 6/6 controles legales de German Morales Consulting, Ley 1480 (Retracto Art. 47 / Reversión Art. 51), Ley 1581 (Habeas Data) y Openpay `send_email: true` superados al 100%.
  * Transacciones de prueba en vivo registradas en Sandbox de Openpay con Merchant ID `muujkkywmqgrlisleaen`:
    - MasterCard Live: `tr1d2v2wbouv8gz305sc` (Auth: 1363732459)
    - American Express Live: `tr8cyjgy5wbqq3mflfar` (Auth: 1722296990)
    - Rechazo Bancario: Código 3006
    - Hosted Checkout Session: `ckm0za6yvj1vnpvdxdro`
    - Webhook ID: `wzwcbnsi4bnu0tqijyd2` (Verificado con código `wuF0CxFR`).
