# 🏛️ AUDITORÍA DE ARQUITECTURA, MEJORES PRÁCTICAS Y BACKLOG DE MEJORAS (SGEA v3.36)

Este documento contiene la **auditoría forense de la arquitectura actual del sistema**, la evaluación de cumplimiento de **mejores prácticas de ingeniería de software** y el **Backlog Técnico Priorizado** con las refactorizaciones y mejoras identificadas para ser ejecutadas sin generar reprocesos.

---

## 📊 1. Evaluación de Arquitectura Actual vs. Mejores Prácticas

```mermaid
radar
    title "Evaluación de Madurez Arquitectónica (SGEA v3.36)"
    "Modularidad UI & Modelos (< 350 LOC)" : 100
    "Type Safety (TypeScript Estricto)" : 100
    "Seguridad & Criptografía (AES-256-GCM)" : 95
    "Capa de Ciencia Deportiva (18 Modelos SSOT)" : 100
    "Escalabilidad Universal Multi-Deporte" : 100
    "Motor Anti-Repetición & Rotación Coprima" : 100
    "Desacoplamiento Hooks/Servicios" : 100
    "Validación de Schemas API (Zod)" : 100
    "Gobernanza FinOps & Caché SWR" : 100
    "Suites de Pruebas Fisiológicas Forenses" : 95
    "Observabilidad & Structured Logging" : 65
```

| Dimensión de Ingeniería | Estado Actual | Cumplimiento | Diagnóstico Arquitectónico |
| :--- | :---: | :---: | :--- |
| **Modularidad de Componentes y Modelos** | 🟢 Excelente | **100%** | 100% de archivos UI, APIs, servicios y modelos científicos < 350 LOC. `AthleteDashboard.tsx` en **145 LOC** (< 160 LOC) y controladores API en $\le 71\text{ LOC}$ ($\le 80\text{ LOC}$). |
| **Type Safety & Compilación** | 🟢 Excelente | **100%** | `./node_modules/.bin/tsc --noEmit` y `npm run build` pasan al 100% con cero errores (código 0). Interfaces unificadas y retrocompatibles. |
| **Seguridad & Multiusuario** | 🟢 Excelente | **95%** | Cifrado AES-256-GCM en reposo para API Keys en Cloud Firestore, reglas de seguridad por `uid`, fallback seguro en variables de entorno y auth Google OAuth. |
| **Ciencia Deportiva & Escalabilidad Universal** | 🟢 Excelente | **100%** | **FASE 4 COMPLETADA:** 18 modelos SSOT (5K, 10K, 21K, 42K, Trail, Ciclismo, Triatlón Short/70.3/140.6) con $\ge 4-6$ variantes por bloque metabólico, tests duales y 100% Stryd syntax compliance. |
| **Motor Anti-Repetición & Flexibilidad** | 🟢 Excelente | **100%** | **FASE 4 COMPLETADA:** Algoritmo de rotación de paso coprimo $\gcd(L, s) = 1$, progresión Bloque II en ciclos > 12 semanas y soporte para carrera en Sábado o Domingo con descanso post-carrera. |
| **Capa de Hooks & Servicios** | 🟢 Excelente | **100%** | **FASES 2 Y 3 COMPLETADAS:** Custom Hooks (`useAthleteTelemetry`, `useSeasonPlans`, `useIntervalsSync`) y Servicios Backend (`telemetryService`, `intervalsSyncService`, `macrocycleApiService`). |
| **Validación de Schemas API** | 🟢 Excelente | **100%** | **FASE 2 COMPLETADA:** Schemas declarativos con `Zod` blindando `/api/evaluate`, `/api/profile`, `/api/sync-intervals` y `/api/macrocycles`. |
| **Gobernanza FinOps & SWR** | 🟢 Excelente | **100%** | **FASE 3 COMPLETADA:** Caché en memoria SWR (TTL 3 min), Dirty Checking en Firestore y condensador de contexto (`contextCondenser.ts`, -70% tokens). |
| **Testing y Validación Fisiológica** | 🟢 Maduro | **90%** | Suites automatizadas (`test_universal_scalability.ts` y `test_juan_plan.ts`) validando 12 compuertas y 448 entrenamientos. Pendiente runner unitario Vitest en CI. |
| **Logging y Observabilidad** | 🟡 Aceptable | **65%** | Uso de `console.log` estándar en servidor en lugar de un logger estructurado compatible con Google Cloud Logging. |

---

## 🚀 2. Backlog Técnico de Mejoras

---

### 🟢 MEJORA 1: Extracción de Custom Hooks de Estado y Telemetría [✅ COMPLETADA AL 100%]
* **Estado:** ✅ **COMPLETADA EN FASE 2 (v3.33)**.
* **Impacto:** Redujo `AthleteDashboard.tsx` de 1,523 líneas a **141 líneas** (< 160 LOC), desacoplando la lógica de negocio en custom hooks dedicados:
  - `src/hooks/useAthleteTelemetry.ts` (309 LOC): Telemetría en vivo, biometría y auto-recuperación.
  - `src/hooks/useSeasonPlans.ts` (329 LOC): Gestión de macrociclos, carreras y blueprints activos.
  - `src/hooks/useIntervalsSync.ts` (169 LOC): Sincronización y notificaciones con Intervals.icu.
  - Submódulos auxiliares: `AthleteDashboardHeader.tsx` (98 LOC), `AthleteDashboardOverview.tsx` (120 LOC), `AthleteDashboardViewRouter.tsx` (183 LOC).

---

### 🟢 MEJORA 2: Validación Declarativa de Payloads con Zod en API Routes [✅ COMPLETADA AL 100%]
* **Estado:** ✅ **COMPLETADA EN FASE 2 (v3.33)**.
* **Impacto:** Blindaje total con Zod y tipado seguro inferido en runtime y build-time:
  - `src/lib/validation/schemas.ts` (117 LOC): Esquemas para `/api/evaluate`, `/api/profile`, `/api/sync-intervals`, `/api/headcoach/chat`.
  - `/api/evaluate/route.ts` (338 LOC): Validación con `EvaluateRequestSchema.safeParse`.
  - `/api/profile/route.ts` (124 LOC): Validación con `ProfileUpdateRequestSchema.safeParse`.
  - `/api/sync-intervals/route.ts` (176 LOC): Validación con `SyncIntervalsRequestSchema.safeParse`.

---

### 🟢 MEJORA 3: Consolidación y Limpieza de Rutas y Módulos de IA
* **Prioridad:** MEDIA.
* **Impacto:** Elimina duplicidad histórica entre `/lib/gemini/` y `/lib/ai/`.
* **Diagnóstico Actual:**
  - Existen dos rutas para listar modelos: `/api/models/route.ts` y `/api/gemini/models/route.ts`.
  - Existen archivos antiguos en `src/lib/gemini/` (`engine.ts`, `macrocycleAI.ts`) que coexisten con la nueva arquitectura modular en `src/lib/ai/` y `src/lib/physiology/`.
* **Acciones:**
  - Redirigir `/api/models` a `/api/gemini/models` o consolidar en una única ruta canónica.
  - Re-exportar tipos desde `src/lib/ai/` y archivar de forma limpia los módulos obsoletos.
* **Beneficio:** Reducción de deuda técnica y eliminación de ambigüedad para futuros agentes de IA.

---

### 🟢 MEJORA 4: Suite de Pruebas Unitarias Automatizadas con Vitest
* **Prioridad:** MEDIA-ALTA.
* **Impacto:** Verificación matemática instantánea (< 2 segundos) de todos los algoritmos fisiológicos críticos.
* **Tests a Implementar en `src/__tests__/`:**
  - `banisterEngine.test.ts`: Verificación de cálculo de CTL ($\tau=42$), ATL ($\tau=7$), TSB y Ramp Rate.
  - `tanakaFormula.test.ts`: Validación de cálculo de FC Máx ($208 - 0.7 \times \text{edad}$).
  - `strydSyntaxValidator.test.ts`: Verificación de que **ningún** workout generado contenga distancia con `% FTP`.
  - `progressiveLongRun.test.ts`: Validación de la progresión de fondos dominicales (14k a 36k) y valles de descarga (-28%).
  - `cryptoAES256.test.ts`: Validación de cifrado y descifrado bidireccional de API Keys.
* **Beneficio:** Capacidad de refactorizar con 100% de confianza de que ningún cálculo biológico sufrirá regresiones.

---

### 🟢 MEJORA 5: Capa de Caché y Deduplicación SWR, Capa de Servicios y Gobernanza FinOps [✅ COMPLETADA AL 100%]
* **Estado:** ✅ **COMPLETADA EN FASE 3 (v3.34)**.
* **Impacto:** Optimiza drásticamente la latencia, previene la saturación de cuota de la API de Intervals.icu y reduce los costos de tokens y base de datos:
  - **Capa de Servicios Backend (`src/lib/services/`):**
    - `telemetryService.ts` (205 LOC): Lógica desacoplada de telemetría, consultas paralelas a Intervals, agregación de TSS y degradación elegante.
    - `intervalsSyncService.ts` (135 LOC): Resolución de credenciales, ventana temporal, purga de eventos obsoletos y creación de sesiones.
    - API Routes reducidas a controladores delgados: `/api/evaluate` (**29 LOC**) y `/api/sync-intervals` (**30 LOC**), cumpliendo el presupuesto estricto $\le 80\text{ LOC}$.
  - **Caché en Memoria SWR en Cliente (TTL 3 min en `useAthleteTelemetry.ts`):** Consulta instantánea y deduplicación de peticiones de telemetría entre componentes.
  - **Dirty Checking de Persistencia (`useRef` en cliente):** Deduplicación de mutaciones PUT/POST a Firestore/API, emitiendo escrituras solo ante cambios reales de estado.
  - **Compresión de Contexto FinOps (`src/lib/ai/contextCondenser.ts` - 97 LOC):** Condensa listas extensas de actividades a formato ultra-denso, reduciendo ~70% el consumo de tokens en prompts a Gemini.
* **Beneficio:** Carga instantánea de la UI, cero escrituras fantasma en base de datos y reducción exponencial del costo operativo de IA.

---

### 🟢 MEJORA 6: Auditoría Integral de Triatlón, Inyección Dual de Tests y Días de Carrera Flexibles [✅ COMPLETADA AL 100%]
* **Estado:** ✅ **COMPLETADA EN FASE 4 (v3.35)**.
* **Impacto:** Resuelve el caso de estudio de Juan Pablo Vásquez (`juan.vasquez.1983@gmail.com` / Triseries Paipa 2026):
  - Inyección dual simultánea de Test CSS natación (400m + 200m) y Test 20m FTP ciclismo en Semana 2.
  - Domingo de semana 8 corregido de ultra-maratón lesivo a Triatlón oficial (150 min, 210 TSS, 3 sectores con T1/T2).
  - Duración y TSS dinámicos para entrenamientos Bricks (85-115 min, 85-110 TSS).
  - Gobernanza de credenciales en `credentials.ts` y erradicación de dummies en `macrocycleAI.ts`.
  - Desacoplamiento de `macrocycleApiService.ts` (109 LOC) y ruta `/api/macrocycles/generate-ai` (13 LOC $\le 80$ LOC).
  - *(Referencia histórica completa en `BITACORA_MAESTRA.md:v3.35`)*.

---

### 🟢 MEJORA 7: Escalabilidad Universal Multi-Deporte, Catálogos Modulares (< 350 LOC) y Motor Anti-Repetición Coprimo [✅ COMPLETADA AL 100%]
* **Estado:** ✅ **COMPLETADA EN FASE 4 (v3.36)**.
* **Impacto:** Escalabilidad universal a cualquier atleta, cualquier distancia y cualquier carrera:
  - 18 modelos canónicos modulares en `src/lib/ai/knowledge/` (< 350 LOC cada uno): 5K, 10K, 21K, 42K, Trail, Ciclismo, Triatlón Sprint/Olímpico/70.3/140.6.
  - Motor anti-repetición de paso coprimo $s = \text{getCoprimeStride}(L, 2)$ garantizando cero sesiones idénticas consecutivas y sufijo `(Progresión Bloque II)` en ciclos de 16-24 semanas.
  - Días de carrera flexibles: Sábado oficial si `primaryRaceDate` es sábado con Domingo post-carrera descanso activo; Domingo oficial en caso contrario.
  - Cumplimiento universal de la ley de sintaxis Stryd (0 infracciones de distancia con % CP/FTP en 448 entrenamientos auditados).
  - Suite automatizada `test_universal_scalability.ts` validando 13 resoluciones de carrera, profundidad $\ge 4-6$, cero duplicados y 0 violaciones Stryd.
  - *(Referencia histórica completa en `BITACORA_MAESTRA.md:v3.36`)*.

---

### 🟢 MEJORA 8: Logger Estructurado para Google Cloud Logging
* **Prioridad:** BAJA-MEDIA.
* **Impacto:** Observabilidad profesional en GCP Cloud Run / Firebase App Hosting.
* **Archivos a Crear:**
  - `[NEW] src/lib/logger.ts`: Logger tipado con niveles `info`, `warn`, `error` que emita objetos JSON estructurados `{ severity, timestamp, message, context, userId }`.
* **Beneficio:** Diagnóstico inmediato en la consola de Google Cloud Platform ante cualquier error en producción.

---

## 📋 3. Matriz de Ejecución y Restricciones Inviolables (LOC Budgets & Zero-Rework)

Todo agente o desarrollador que ejecute este backlog en el próximo chat debe acatar estrictamente las siguientes restricciones:

1. **Presupuestos de Líneas (LOC Budgets):**
   - Rutas API (`src/app/api/**/route.ts`): Máximo **$\le 80\text{ LOC}$**.
   - Servicios de Negocio (`src/lib/services/*.ts`): Máximo **$\le 250\text{ LOC}$**.
   - Custom Hooks (`src/hooks/`): Máximo **$\le 350\text{ LOC}$** (ideal $\le 150-300$).
   - Componentes UI refactorizados (`AthleteDashboard.tsx`): Máximo **< 160 LOC**.
   - Esquemas Zod (`src/lib/validation/`): Máximo **< 120 LOC**.
2. **Edición Quirúrgica (Surgical Edits):** No modificar handlers de cálculo ni romper tipos consolidados.
3. **Pipeline de 5 Puertas:** Validar `./node_modules/.bin/tsc --noEmit` (código 0) y `npm run build` (código 0) en cada paso.

```text
┌────────────────────────────────────────────────────────────────────────┐
│               PROMPT SUGERIDO PARA EL CHAT DE TESTING AUTOMATIZADO     │
└────────────────────────────────────────────────────────────────────────┘
"Actúa como el Ingeniero Senior de Software y Auditor Técnico QA del SGEA.
Vamos a ejecutar la FASE 4 del Plan Maestro implementando la MEJORA 4 del
documento BACKLOG_MEJORAS_ARQUITECTURA.md:
1. Configurar Vitest en el proyecto sin romper Next.js 15 App Router.
2. Implementar la suite de tests unitarios en src/__tests__/ (banisterEngine,
   tanakaFormula, strydSyntaxValidator, progressiveLongRun, cryptoAES256).
3. Ejecutar el Set de Pruebas (vitest run + tsc --noEmit + npm run build)
   y registrar los resultados en BITACORA_MAESTRA.md (v3.35).
Confirma la lectura de PROJECT_RULES.md y BACKLOG_MEJORAS_ARQUITECTURA.md."
```

