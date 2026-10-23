# INSTRUCCIÓN MAESTRA PARA EL NUEVO CHAT: CONEXIÓN HOSTED OPENPAY (BBVA)

> **PROPÓSITO:** Esta instrucción debe ser copiada o leída al iniciar el nuevo chat para que el agente entienda con absoluta precisión el estado actual de la plataforma, las reglas de arquitectura y la tarea pendiente exacta, evitando cualquier tipo de alucinación o paso atrás.

---

## 1. Contexto y Arquitectura Actual del Proyecto

1. **Plataforma:** **Pulse Endurance** (`https://pulseendurance.co`), SaaS de entrenamiento atlético adaptativo con IA, métricas Stryd e integración con Intervals.icu.
2. **Motor Financiero:** **GMC FinSec Billing Engine** (`gmc-billing-engine/`), un módulo desacoplado y multitenant (`@gmc/billing-engine`) que gestiona pagos y suscripciones en **Openpay Colombia (BBVA)**.
3. **Certificación FinSec:** **47 de 47 pruebas superadas** (`npm run test:finsec`), abarcando:
   - Los 5 Agentes de Seguridad: `SentinelAntiFraud`, `IdempotencyLockGuard`, `WebhookCryptoRouter`, `NetflixLifecycleDunning`, y `ForensicLedgerAuditor`.
   - La Matriz de Pruebas de Certificación en Sandbox: `TC-01` a `TC-15`.
4. **Precios Unificados:** La suscripción mensual oficial está fijada en **$55.000 COP** en toda la plataforma:
   - Firestore: `system_config/subscription_plan` (precio: 55000).
   - Componente de Checkout: [`src/components/billing/GmcCardCheckoutModal.tsx`](src/components/billing/GmcCardCheckoutModal.tsx).
   - Componente de Perfil: [`src/components/profile/AthleteSubscriptionTab.tsx`](src/components/profile/AthleteSubscriptionTab.tsx).
5. **Módulo de Suscripción en el Perfil:**
   - Ubicado en el menú lateral de Perfil del Atleta (`AthleteSubscriptionTab.tsx`).
   - Permite consultar el estado de la suscripción, los últimos 4 dígitos de la tarjeta guardada, la próxima fecha de corte, y los botones para **"Modificar Tarjeta"** y **"Cancelar Suscripción"** (con confirmación que respeta el periodo ya pagado).

---

## 2. REGLA INQUEBRANTABLE DE SEGURIDAD Y FLUJO (NO NEGOCIABLE)

> ⛔ **PROHIBIDO PEDIR O CAPTURAR DATOS DE TARJETA DENTRO DE PULSE ENDURANCE.**
> Ningún formulario dentro de Pulse debe tener campos de número de tarjeta, vencimiento o CVV.
> 
> ✅ **FLUJO REQUERIDO (HOSTED CHECKOUT):**
> 1. El atleta hace clic en *"Pagar con Openpay"* o *"Modificar Tarjeta"*.
> 2. Se abre el modal informativo de alto contraste de Pulse (`GmcCardCheckoutModal.tsx`) que resume el plan ($55.000 COP) y tiene el botón **"Continuar a Openpay (BBVA)"**.
> 3. Al hacer clic, Pulse genera una sesión mediante `POST /api/billing/openpay/create-checkout-session` y redirige al atleta a la **página web oficial hospedada de Openpay BBVA**.
> 4. El atleta ingresa sus datos de tarjeta **exclusivamente en el espacio seguro de Openpay**.
> 5. Al finalizar el pago o registro de tarjeta en Openpay, el banco lo devuelve automáticamente a la URL de retorno: `https://pulseendurance.co/?payment=complete` (o `/?payment=failed`), donde Pulse sincroniza el estado y activa la membresía.

---

## 3. Estado de la Conexión con Openpay y Problema a Resolver

### ¿Qué se ha probado y qué funciona?
- Las credenciales Sandbox de Openpay Colombia (`muujkkywmqgrlisleaen`) están configuradas y responden correctamente.
- La creación de la sesión de pago desde el backend hacia la API de Openpay funciona y devuelve la URL hospedada (`payment_method.url`).
- La redirección desde Pulse hacia Openpay funciona correctamente.

### ¿Cuál es el problema exacto identificado en el Sandbox de Openpay?
Al ser transferido a la URL de captura de tarjeta hospedada por Openpay (`https://sandbox-api.openpay.co/card_capture?...`), al llenar los datos de la tarjeta de prueba y presionar el botón **"Realizar Pago"**, la página de Openpay **no hace nada**.

**Causa Raíz en la Consola del Navegador:**
1. Openpay en su servidor Sandbox incluye un script con un hash de integridad SRI erróneo:
   `Failed to find a valid digest in the 'integrity' attribute for resource 'https://sandbox-api.openpay.co/js/openpay/CardCapture/openpay-cardCapture-1.1.js?v=1.2.157.r947' with computed SHA-256 integrity '...'`
2. El navegador bloquea la descarga de ese archivo JavaScript por seguridad web.
3. En consecuencia, la función de Openpay queda indefinida:
   `Uncaught ReferenceError: OpenpayCardCapture is not defined`
4. Al hacer clic en "Realizar Pago", el botón falla silenciosamente y la página queda inerte.

---

## 4. Tarea Concreta para el Nuevo Chat

Revisar la configuración de la sesión de checkout hospedada generada por `GmcBillingEngine` y `openpayClient.ts` / `/create-checkout-session` para:

1. **Revisar el Endpoint de Checkout Hospedado de Openpay:**
   - Actualmente se usa `POST /v1/{merchantId}/charges` con `confirm: false`, `method: 'card'` y `redirect_url`, el cual redirige a `/card_capture`.
   - Evaluar si al usar el endpoint oficial de Checkouts de Openpay (`POST /v1/{merchantId}/checkouts`) o modificando los headers/parámetros, Openpay sirve su Webcheckout estándar sin el script con SRI roto de `/card_capture`.
2. **Revisar si es un problema exclusivo del Sandbox o de versión:**
   - Verificar la documentación oficial de Openpay Colombia para Hosted Checkout / Webcheckout.
   - Determinar si en producción ese error de SRI no existe o si hay un flag/parámetro para deshabilitar o evitar ese script en Sandbox.
3. **Validar el Retorno y Activación (`redirect_url`):**
   - Garantizar que una vez procesado el pago en Openpay, la redirección a `https://pulseendurance.co/?payment=complete` capture los parámetros (`id`, `order_id`), verifique la transacción mediante `confirm-session` y active la membresía Pro en Firestore en tiempo real.

---

## 5. Archivos Clave del Módulo

- **Modal de Checkout en Pulse:** [`src/components/billing/GmcCardCheckoutModal.tsx`](src/components/billing/GmcCardCheckoutModal.tsx)
- **Pestaña de Suscripción en Perfil:** [`src/components/profile/AthleteSubscriptionTab.tsx`](src/components/profile/AthleteSubscriptionTab.tsx)
- **API Creación de Sesión:** [`src/app/api/billing/openpay/create-checkout-session/route.ts`](src/app/api/billing/openpay/create-checkout-session/route.ts)
- **API Confirmación de Retorno:** [`src/app/api/billing/openpay/confirm-session/route.ts`](src/app/api/billing/openpay/confirm-session/route.ts)
- **Cliente Openpay:** [`gmc-billing-engine/src/providers/openpay/client.ts`](gmc-billing-engine/src/providers/openpay/client.ts)
- **Núcleo del Motor:** [`gmc-billing-engine/src/index.ts`](gmc-billing-engine/src/index.ts)
- **Bitácora Maestra:** [`BITACORA_MAESTRA.md`](BITACORA_MAESTRA.md) (Sección 185)
