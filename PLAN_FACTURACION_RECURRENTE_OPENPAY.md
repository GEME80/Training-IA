# PLAN MAESTRO EJECUTIVO: GMC FINSEC BILLING ENGINE (OPENPAY BBVA)
## Arquitectura Independiente Multi-Aplicación (Plug & Play), Trial de 7 Días, Casuística de Cancelaciones y Hoja de Ruta Faseada

* **Marca Corporativa Paraguas:** German Morales Consulting (`OPENPAY *GM CONSULTING`)
* **Naturaleza del Módulo:** Motor Independiente y Desacoplado (`@gmc/billing-engine`), 100% agnóstico del dominio.
* **Primer Proyecto (Tenant #1):** **Pulse Endurance** (Fases 1, 2 y 3)
* **Expansión Corporativa (Fase 4):** Consola Maestra **GMC FinSec Headquarters** + Conexión de **Hubinfo** y futuros SaaS.
* **Entidad Bancaria de Desembolso:** BBVA Colombia (Liquidación semanal consolidada los miércoles)
* **Ubicación de la Documentación Independiente:** [`gmc-billing-engine/docs/`](./gmc-billing-engine/docs/README.md)

---

## 1. Documentación Oficial del Módulo Independiente (`gmc-billing-engine/docs/`)

Toda la arquitectura técnica está separada del código deportivo de Pulse para servir como estándar en todos los productos de **German Morales Consulting**:

1. 📘 **[Arquitectura Maestra, Reglas de Ciclo de Vida y Plan Faseado (`gmc-billing-engine/docs/README.md`)](./gmc-billing-engine/docs/README.md)**
2. 🤖 **[Escuadrón de 5 Agentes de Monitoreo Financiero (`gmc-billing-engine/docs/AGENTS_FINSEC_MONITORING.md`)](./gmc-billing-engine/docs/AGENTS_FINSEC_MONITORING.md)**
3. 🛡️ **[Políticas Zero-Trust y Matriz de 15 Pruebas (`gmc-billing-engine/docs/SECURITY_AND_TEST_MATRIX.md`)](./gmc-billing-engine/docs/SECURITY_AND_TEST_MATRIX.md)**

---

## 2. Resumen de Reglas del Ciclo de Vida (Trial 7 Días, Cancelaciones y Casos Borde)

El motor contempla y resuelve de forma automática los **9 casos críticos** que ocurren en suscripciones reales tipo Netflix / Strava:

| Caso de Uso | Qué hace el Usuario / Banco | Cómo actúa el Motor (`@gmc/billing-engine`) |
| :--- | :--- | :--- |
| **1. Alta con 7 Días Gratis + Tarjeta Obligatoria** | Usuario nuevo registra su tarjeta en el Día 1. | Se valida la tarjeta en Openpay con `trial_days: 7`. Cobro en Día 1 = **$0**. Estado = `TRIAL_ACTIVE` hasta el Día 7. El **Día 8** Openpay ejecuta automáticamente el primer cobro mensual. |
| **2. Intento de Abuso de Doble Trial (*Anti-Trial Hopping*)** | Usuario cancela en su prueba y luego intenta suscribirse de nuevo (o usa la misma tarjeta en otra cuenta) para pedir otros 7 días gratis. | El Agente `Sentinel-AntiFraud` verifica `gmc_trial_registry` (por usuario, email y huella de tarjeta). Detecta que ya usó su prueba antes y fuerza **`trial_days: 0` (Cobro inmediato en el Día 1)**. |
| **3. Cancelación Durante los 7 Días de Prueba (Día 1 al 7)** | Usuario cancela en el Día 3 porque no quiere que le cobren. | Se cancela inmediatamente la orden de cobro del Día 8 en Openpay (**$0 cobrados**). El usuario conserva sus 4 días restantes de prueba hasta el Día 7 y en el Día 8 se bloquea (`CANCELLED_LOCKED`). |
| **4. Cancelación a Mitad de Mes Ya Pagado (Ej. Día 18 de 30)** | Pagó del 10 de Octubre al 10 de Noviembre, y el 22 de Octubre cancela su plan. | Se detiene el cobro futuro en Openpay (`cancelAtPeriodEnd = true`, estado `CANCEL_SCHEDULED`). **NO pierde los días que ya pagó**: sigue teniendo acceso total hasta el **10 de Noviembre** y el 11 de Noviembre se bloquea sin cobrarle. |
| **5. "Arrepentimiento" de Cancelación (Reanudar antes del corte)** | Canceló el 22 de Octubre, pero el 28 de Octubre decide continuar antes de que venza su mes el 10 de Noviembre. | Oprime `[ Reanudar Suscripción ]`. **No se le cobra doble ese día**; simplemente se reactiva la renovación programada para el 10 de Noviembre. |
| **6. Reactivación Después de Estar Vencido y Bloqueado** | Su plan venció el 10 de Noviembre (quedó bloqueado) y regresa el 25 de Noviembre a pagar. | Se le cobra inmediatamente el 25 de Noviembre (sin nuevo trial), se desbloquea al instante y su **nueva fecha de corte mensual pasa a ser el 25 de cada mes** (no paga por días que estuvo inactivo). |
| **7. Fallo de Cobro en el Día 8 (Fin del Trial sin fondos)** | Termina los 7 días gratis, pero en el Día 8 la tarjeta no tiene fondos. | **Cero días de gracia adicionales post-trial:** pasa inmediatamente a `PAST_DUE_LOCKED` (Paywall bloqueante) hasta que pague con una tarjeta con cupo. |
| **8. Fallo de Cobro en Renovación de Cliente Antiguo (Mes 2+)** | Cliente que ya venía pagando sufre rechazo en el Mes 3 (ej. tarjeta sin cupo temporal). | Entra en `GRACE_PERIOD` por **72 horas** mientras Openpay ejecuta **2 reintentos automáticos**. Ve alerta en pantalla. Si tras 72h no pasa, se activa el bloqueo `PAST_DUE_LOCKED`. |
| **9. Cambio de Tarjeta (*Card Swap*) o Reembolso (`Refund`)** | Cambia su plástico a mitad de mes, o el Administrador le devuelve el dinero. | *Card Swap:* actualiza la tarjeta en la suscripción sin cobrar doble. *Refund:* devuelve el dinero a la tarjeta en Openpay y corta el acceso (`CANCELLED_LOCKED`) en ese mismo segundo. |

---

## 3. Estrategia de Implementación Faseada (Paso a Paso sin Hacer Todo de Golpe)

Para avanzar con orden y seguridad total, dividimos el proyecto en **4 Fases secuenciales**:

### 🔹 FASE 1: Construcción del Núcleo Independiente y Conexión Openpay (`gmc-billing-engine`)
* Crear la carpeta aislada del motor con configuración sin secretos hardcodeados, contratos Multi-Tenant, cliente seguro de Openpay BBVA, Webhook blindado y los **5 Agentes FinSec** (`Sentinel`, `Idempotency`, `Webhook-Router`, `Netflix-Lifecycle`, `Forensic-Auditor`).

### 🔹 FASE 2: Conexión y Puesta en Marcha en `PULSE ENDURANCE` (Primer Proyecto)
* Conectar **Pulse Endurance** al motor mediante el adaptador Plug & Play.
* Habilitar el flujo completo en Pulse: Registro de tarjeta con **7 días gratuitos**, cobro automático en Día 8, gestión de cancelaciones a mitad de ciclo, cambio de tarjeta, coexistencia con Bre-B manual y **Paywall bloqueante estilo Netflix**.

### 🔹 FASE 3: Certificación de las 15 Pruebas en Sandbox (`TC-01` a `TC-15`)
* Probar exhaustivamente todos los casos borde en Sandbox con tarjetas de prueba antes de pasar **Pulse Endurance** a producción con dinero real.

### 🔹 FASE 4: Construcción del Front Ejecutivo `GMC FinSec Headquarters` y Expansión a Nuevas Apps
* Una vez **Pulse Endurance** esté operando al 100%, construir la consola maestra **GMC FinSec Headquarters** para que tú, como cabeza de **German Morales Consulting**, veas todas las transacciones consolidadas y filtradas por aplicación, el cuadre de los miércoles en BBVA y el estado de los agentes, conectando a continuación *Hubinfo* y futuros proyectos.
