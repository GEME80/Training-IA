# DOSSIER MAESTRO DE CERTIFICACIÓN TÉCNICA Y LEGAL — OPENPAY COLOMBIA (GRUPO BBVA)
## Plataforma: PULSE ENDURANCE (`https://pulseendurance.co`)
**Comercio Titular:** German Morales Consulting  
**Identificador de Comercio (Merchant ID):** `muujkkywmqgrlisleaen`  
**Canal Oficial de Notificaciones y Soporte:** `germanmoralesconsulting@gmail.com`  
**Vigencia del Documento:** Octubre 2026 — Certificación Oficial Pase a Producción  

---

## 1. Ficha Técnica del Comercio y Credenciales

| Parámetro | Detalle en Sandbox | Detalle en Producción (Post-Cita) |
| :--- | :--- | :--- |
| **Razón Comercial** | **German Morales Consulting** | **German Morales Consulting** |
| **Domicilio Principal** | Bogotá D.C., Colombia | Bogotá D.C., Colombia |
| **Correo Legal / PQR** | `germanmoralesconsulting@gmail.com` | `germanmoralesconsulting@gmail.com` |
| **Sitio Web en Vivo** | `https://pulseendurance.co/` (HTTPS / TLS 1.3) | `https://pulseendurance.co/` |
| **Tipo de Integración** | API Rest + Hosted Checkout (PCI SAQ-A) | API Rest + Hosted Checkout (PCI SAQ-A) |
| **Tecnología de Servidor** | Node.js (Next.js App Router 15) en Cloud Run | Node.js (Next.js App Router 15) en Cloud Run |
| **Merchant ID** | `muujkkywmqgrlisleaen` | *Asignado al certificar* |
| **Llave Pública** | `pk_2c247078c0ac4fd2b5a8d1836300bf66` | *Asignada al certificar* |
| **Llave Privada** | `sk_4044892efb524b9587761b419daf8c80` | *Asignada al certificar* |
| **Webhook ID Oficial** | `wzwcbnsi4bnu0tqijyd2` | *A registrar en Live* |
| **URL de Webhook** | `https://pulseendurance.co/api/billing/openpay/webhook` | `https://pulseendurance.co/api/billing/openpay/webhook` |
| **Estado del Webhook** | **Verificado con Éxito (Check Verde)** | Verificado con código inicial |

---

## 2. Cumplimiento de Políticas y Estándares de Openpay BBVA

### 2.1. Arquitectura Cero Fuga PCI-DSS (Cumplimiento Estricto SAQ-A)
* **Principio Rector:** PULSE ENDURANCE y los servidores de German Morales Consulting **jamás reciben, procesan ni almacenan números completos de tarjeta (PAN) ni códigos de seguridad (CVV)**.
* **Mecanismo:** El atleta hace clic en *"Suscribirme con Openpay BBVA"* en la web y el backend genera una sesión segura mediante `engine.createHostedCheckoutSession()` utilizando la API oficial de Openpay Colombia (`POST /v1/{MERCHANT_ID}/checkouts`).
* **Transferencia Segura:** El usuario es transferido al dominio oficial y certificado de Openpay BBVA (`https://sandbox-api.openpay.co/ck/...` en pruebas o `https://api.openpay.co/ck/...` en producción).
* **Despacho Automático de Comprobante:** Se envía `send_email: true` a Openpay para que la pasarela envíe el comprobante de pago oficial por correo electrónico directamente al atleta, sin costos de infraestructura SMTP para el comercio.

### 2.2. Política de Moneda Única Oficial (Pesos Colombianos - COP)
* **Regulación:** En cumplimiento de las directrices comerciales de Openpay Colombia, todos los cobros se liquidan exclusivamente en **COP**.
* **Tarifa del Plan:** **\$55.000 COP / mes** (Membresía Pulse Endurance Pro).
* **Atletas en el Exterior:** La interfaz (`PricingAndFaqSection.tsx`), el pie de página y los Términos de Servicio especifican que si un atleta paga desde fuera de Colombia con tarjeta internacional (Visa, Mastercard, Amex), su entidad bancaria emisora realizará la conversión automática a su moneda local al tipo de cambio de su banco.
* **Erradicación de Divisas de Referencia:** No existen selectores en dólares ni valores en USD en la Landing Page ni en el Checkout.

### 2.3. Blindaje Legal y Normativo (Leyes Colombianas)
1. **Identidad Visible del Comercio:** **German Morales Consulting** figura explícitamente en el pie de página de la Landing (`LandingFooter.tsx`), en el panel del atleta (`AthleteDashboard.tsx`), en los Términos y Condiciones (`/terms`) y en la Política de Privacidad (`/privacy`).
2. **Derecho de Retracto (Art. 47, Ley 1480 de 2011):** Consagrado en la Cláusula 7 de `/terms`, otorgando 5 días hábiles al consumidor.
3. **Reversión del Pago (Art. 51, Ley 1480 de 2011 y Decreto 587 de 2016):** Consagrado en `/terms` ante eventos de fraude, operaciones no solicitadas o fallos de servicio.
4. **Habeas Data (Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013):** Consagrado en `/privacy` con identificación de German Morales Consulting como Responsable del Tratamiento y canal oficial `germanmoralesconsulting@gmail.com`.
5. **Cancelación sin Permanencia:** Cancelación con 1 solo clic desde el perfil del usuario.

---

## 3. Matriz de Evidencias de Pruebas en Sandbox

Todas las transacciones de ciclo de vida fueron disparadas y conciliadas en el panel oficial de Openpay Colombia:

| ID Transacción Openpay | Fecha y Hora | Tipo / Marca | Monto | Resultado Bancario | Propósito de Prueba |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tr1d2v2wbouv8gz305sc` | 22-Oct-2026 17:55:01 | MasterCard Live Sandbox | \$55.000 COP | **APROBADA** (Auth: 1363732459) | Verificación de cargo con token MasterCard |
| `tr8cyjgy5wbqq3mflfar` | 22-Oct-2026 17:55:05 | American Express Live Sandbox | \$55.000 COP | **APROBADA** (Auth: 1722296990) | Verificación de cargo con token Amex |
| `Simulación Error` | 22-Oct-2026 17:55:09 | Tarjeta sin Fondos | \$55.000 COP | **RECHAZO** (Código 3006) | Verificación de manejo de rechazo bancario |
| `ckm0za6yvj1vnpvdxdro` | 22-Oct-2026 17:56:49 | Hosted Checkout Session | \$55.000 COP | **CREADA** (`/ck/eWzSv7TziPNw`) | Sesión hospedada PCI-DSS SAQ-A |
| `wzwcbnsi4bnu0tqijyd2` | 21-Oct-2026 18:00:00 | Webhook Server-to-Server | N/A | **VERIFICADO** (Código: `wuF0CxFR`) | Escucha de eventos `charge.succeeded` y `charge.refunded` |

---

## 4. Escudo Antifraude CISO (6 Vectores Auditados y Mitigados al 100%)

El sistema cuenta con una batería de pruebas automatizadas que se ejecuta en el pipeline CI/CD:

| Vector de Ataque | Mecanismo de Blindaje Implementado | Código HTTP | Script de Auditoría |
| :--- | :--- | :--- | :--- |
| **1. Bypass por URL (`?payment=complete`)** | Consulta Server-to-Server contra Openpay; exige `charge.status === 'completed'`. | `402 Payment Required` | `audit-phase1-antifraud.ts` ✅ |
| **2. Secuestro de Transacción (*Hijacking*)** | Valida que el `subscriberId` sea el dueño original en `charge.order_id` y en `gmc_immutable_ledger`. | `403 Forbidden` | `audit-phase1-antifraud.ts` ✅ |
| **3. Alteración de Precio / Moneda** | Comprueba que `charge.amount >= expectedPrice` (\$55.000) y `currency === 'COP'`. | `402 Payment Required` | `audit-phase1-antifraud.ts` ✅ |
| **4. Reanudación Gratuita sin Pago** | Bloquea `resume` si el usuario no tiene `gmcCurrentPeriodEnd` futuro vigente. | `402 Payment Required` | `audit-phase1-antifraud.ts` ✅ |
| **5. Spoofing de Admin en Endpoints** | Exige verificación criptográfica de `requesterUid` en Firestore con rol `admin`. | `403 Forbidden` | `audit-phase1-antifraud.ts` ✅ |
| **6. Inyección PCI y Ataque de Carding** | `SentinelAntiFraudAgent` rechaza campos de tarjeta (`403`) y bloquea ráfagas (>8 peticiones/15 min, `429`). | `403 / 429` | `audit-phase1-antifraud.ts` ✅ |

---

## 5. Guía de Respuestas para la Videollamada de Certificación

Durante la llamada con el ingeniero de Openpay BBVA, estas son las preguntas frecuentes que realizará y cómo responder con precisión:

### Pregunta 1: "¿Qué tipo de integración utilizan y cómo manejan los datos de tarjeta?"
> *"Utilizamos una arquitectura **Hosted Checkout bajo estándar PCI-DSS SAQ-A**. Cuando el atleta pulsa en suscribirse, nuestro backend genera una sesión segura con la API de Openpay y redirige al usuario a la URL de pago de Openpay BBVA. En nuestros servidores jamás ingresa ni se almacena un número de tarjeta ni CVV."*

### Pregunta 2: "¿Cómo validan que una suscripción fue pagada exitosamente?"
> *"Tenemos doble validación: por un lado, nuestro **Webhook oficial** recibe la notificación `charge.succeeded` firmada con HTTP Basic Auth y realiza una consulta Server-to-Server a la API de Openpay para verificar que el cargo esté `completed`. Por otro lado, en la URL de retorno nuestro endpoint `/api/billing/openpay/confirm-session` vuelve a verificar contra Openpay antes de habilitar el acceso al atleta."*

### Pregunta 3: "¿Dónde está visible la razón social de la cuenta y sus políticas?"
> *"La razón social registrada **German Morales Consulting** está visible en el pie de página de la plataforma (`https://pulseendurance.co`), en el dashboard del usuario y en los enlaces legales `/terms` y `/privacy`. En `/terms` tenemos detallado el Derecho de Retracto (Art. 47) y la Reversión del Pago (Art. 51 de la Ley 1480 de 2011), y en `/privacy` el tratamiento de datos personales conforme a la Ley 1581 de 2012."*

### Pregunta 4: "¿En qué moneda cobran y cómo gestionan clientes internacionales?"
> *"Cobramos exclusivamente en **Pesos Colombianos (COP)** por un valor de \$55.000 COP al mes. Para tarjetas internacionales de Visa, Mastercard o American Express, informamos al atleta en la web y en los términos que su banco emisor realizará la conversión automática a su divisa local."*

---

## 6. Procedimiento Post-Certificación (Activación en Producción)

Una vez el ingeniero otorgue el visto bueno en la llamada:
1. Openpay habilitará la consola de producción: `https://dashboard.openpay.co/`.
2. Extraer las credenciales de Producción:
   - `OPENPAY_MERCHANT_ID_PROD`
   - `OPENPAY_PUBLIC_KEY_PROD`
   - `OPENPAY_PRIVATE_KEY_PROD`
3. Configurar el Webhook de producción apuntando a: `https://pulseendurance.co/api/billing/openpay/webhook`.
4. Registrar el código de verificación que Openpay envíe en el primer ping del webhook.
5. Cambiar `OPENPAY_SANDBOX_MODE=false` en las variables de entorno de Cloud Run.
6. Realizar una compra real de \$55.000 COP con tarjeta de crédito propia para validar el flujo completo en vivo y comprobar que el comprobante llegue a la bandeja de entrada.
