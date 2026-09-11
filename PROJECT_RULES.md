# 🛡️ DIRECTRICES Y REGLAS DE GOBERNANZA ANTI-REPROCESO (SGEA v3.34)
> **MANDATO PARA TODO AGENTE DE IA O DESARROLLADOR:** Este archivo contiene las leyes inmutables del proyecto. Todo agente que participe en este repositorio debe leer este documento y cumplirlo sin excepción antes de proponer cambios, escribir código o ejecutar comandos.

---

## 🎯 PROMPT MAESTRO INTEGRAL (PARA INICIAR CUALQUIER NUEVO CHAT)

Copia y pega este bloque completo al abrir cualquier nuevo chat con un agente:

```text
Actúa como el Arquitecto de Software Principal, Especialista en Sistemas Multi-Agente de IA y Auditor Líder del Sistema SGEA (v3.34).

Contexto Actual del Proyecto:
- La Fase 1 (Modularización UI < 350 LOC), Fase 2 (Custom Hooks, AthleteDashboard < 160 LOC, Zod) y Fase 3 (Capa de Servicios, Rutas API <= 30 LOC, FinOps y SWR) fueron COMPLETADAS AL 100% con 0 errores de compilación (`npm run build` exit code 0).
- La arquitectura frontend está modularizada (< 350 líneas por archivo) en: `src/components/admin/`, `profile/`, `season/`, `dashboard/` y `macrocycle/`, operada por Custom Hooks en `src/hooks/` (`useAthleteTelemetry`, `useSeasonPlans`, `useIntervalsSync`).
- El backend desacopla su lógica en `src/lib/services/` (`telemetryService.ts`, `intervalsSyncService.ts`), con controladores API delgados (<= 30 LOC) y validación declarativa con Zod en `src/lib/validation/schemas.ts`.
- Gobernanza FinOps: Compresor de contexto en `src/lib/ai/contextCondenser.ts` (-70% tokens en prompts Gemini) y persistencia con Dirty Checking y caché SWR (3 min TTL).

Tu Misión en esta Sesión:
Ayudar a organizar, diseñar e implementar una ARQUITECTURA SÓLIDA, MODULAR Y ESCALABLE para los Agentes de IA del SGEA:
1. Agente Head Coach Fisiológico On-Demand (Adaptación de microciclos y chat interactivo en `/api/headcoach/chat`).
2. Agente Diseñador de Macrociclos y Periodización IA (Generación de planes rectores de temporada en `/api/macrocycles/generate-ai`).
3. Agente Evaluador y Diagnóstico de Carga (Análisis de fatiga aguda, desacoplamiento aeróbico EF y HRV en `/api/evaluate`).
4. Centralización de Prompts Maestros, Inyección Dinámica de Contexto Fisiológico y Gestión de Modelos Gemini.

Leyes Inviolables de Gobernanza:
1. Fuente Única de Verdad: Intervals.icu es la ÚNICA fuente para telemetría deportiva. Firestore almacena perfiles con AES-256-GCM y macrociclos activos.
2. Puerto 3000 Único: El servidor corre exclusivamente en el puerto 3000 vía `npm run dev:clean`. Prohibido abrir puertos 3001 o 3002.
3. Modularidad Estricta: Ningún archivo puede superar las 350 líneas de código; `AthleteDashboard.tsx` estrictamente < 160 LOC; Rutas API <= 80 LOC.
4. Sintaxis Stryd: La potencia de carrera se prescribe siempre por Tiempo + % FTP (¡NUNCA Distancia con % FTP!).
5. Modo 100% Manual: Cero cron jobs o Cloud Scheduler en background. Toda invocación es disparada manualmente por el atleta.
6. Robustez y Resiliencia: NODE_OPTIONS='--max-http-header-size=131072' obligatorio, auto-recuperador en <head> y RootLayout, transpilación de Firebase y límites de error en App Router.
7. Set de Pruebas Obligatorio: Cuando reciba la orden "Actualiza la bitácora maestra" o "Cierre de tarea", ejecutaré automáticamente `./node_modules/.bin/tsc --noEmit` y `npm run build` antes de documentar el avance en BITACORA_MAESTRA.md.

Por favor, confirma que leíste PROJECT_RULES.md y BITACORA_MAESTRA.md (Sección 15), resume el estado actual y presenta tu propuesta de arquitectura para los Agentes de IA.
```

---

## 🧪 PROTOCOLO AUTOMÁTICO: ORDEN "ACTUALIZA LA BITÁCORA MAESTRA"

Cada vez que el usuario dé la orden **`"Actualiza la bitácora maestra"`** o **`"Cierre de tarea"`**, el agente debe ejecutar obligatoriamente y en orden estricto el siguiente **Set de Pruebas**:

```mermaid
flowchart TD
    CMD["Orden del Usuario: Actualiza la Bitácora Maestra"] --> T1["Test 1: Verificación TypeScript (tsc --noEmit)"]
    T1 -->|Código 0| T2["Test 2: Compilación de Producción (npm run build)"]
    T1 -->|Errores| FIX1["Corregir Tipado Inmediatamente"]
    FIX1 --> T1
    T2 -->|Código 0| T3["Test 3: Auditoría de Sintaxis Stryd (% FTP + Tiempo)"]
    T2 -->|Errores| FIX2["Corregir Rutas / Módulos"]
    FIX2 --> T2
    T3 --> T4["Test 4: Registro Detallado en BITACORA_MAESTRA.md"]
    T4 --> REPORT["Entrega de Reporte de Éxito al Usuario"]
```

### El Set de Pruebas Obligatorio:
1. **Prueba 1 (Tipado Estricto):** Ejecutar `./node_modules/.bin/tsc --noEmit` (o `npx tsc --noEmit`). Debe arrojar **código 0 (cero errores)**.
2. **Prueba 2 (Compilación de Producción):** Ejecutar `npm run build`. Todas las rutas de Next.js deben compilar y empaquetar limpiamente.
3. **Prueba 3 (Auditoría de Sintaxis Stryd):** Verificar que los generadores de microciclos usen minutos/segundos + `% FTP` (cero distancias con % FTP).
4. **Prueba 4 (Actualización del Dossier):** Documentar en la Sección correspondiente de [`BITACORA_MAESTRA.md`](./BITACORA_MAESTRA.md):
   - Fecha y hora del cambio.
   - Lista de archivos modificados/creados y su conteo de líneas (< 350 líneas).
   - Resultado explícito del set de pruebas (`tsc` y `build`).

---

## 🏛️ 1. LEY SUPREMA: FUENTE ÚNICA DE VERDAD (SSOT)
1. **Dossier Histórico:** Antes de iniciar cualquier tarea, lee obligatoriamente [`BITACORA_MAESTRA.md`](./BITACORA_MAESTRA.md). Queda prohibido asumir requerimientos o reinventar contratos ya documentados.
2. **Telemetría Fisiológica:** **Intervals.icu API** es la **ÚNICA fuente de verdad** para métricas deportivas (CTL, ATL, TSB, HRV, entrenamientos realizados y planeados). Cero almacenamiento redundante de entrenamientos en Firestore.
3. **Base de Datos:** **Cloud Firestore (`users/{uid}`)** es la única fuente de verdad para metadatos de usuario, credenciales cifradas con AES-256-GCM y macrociclos activos.
4. **Registro Continuo:** Todo cambio o mejora debe registrarse en la Sección correspondiente de `BITACORA_MAESTRA.md`.

---

## ⚡ 2. CONTROL DE PUERTO ÚNICO Y DAEMONS
1. **Puerto Obligatorio:** El servidor de desarrollo corre **exclusivamente en el puerto `3000`** (`http://localhost:3000`).
2. **Prohibición:** Queda terminantemente prohibido abrir instancias en puertos alternativos (`3001`, `3002`, etc.) o dejar procesos zombis en segundo plano.
3. **Script de Arranque:** Utiliza siempre `npm run dev:clean` (que ejecuta `kill-port 3000` antes de iniciar `next dev -p 3000`).

---

## 🧩 3. REGLA DE MODULARIDAD ESTRICTA (< 350 LÍNEAS)
1. **No a los Monolitos ("God Components"):** Ningún archivo nuevo o refactorizado debe exceder las **350 líneas de código**.
2. **Estructura Atómica:** Las vistas complejas deben dividirse en subcomponentes por dominio:
   - `src/components/admin/` (Submódulos del Panel de SuperAdmin)
   - `src/components/profile/` (Pestañas de Conexiones, Disponibilidad y Fisiología)
   - `src/components/season/` (Generador de Planes y Gestor de Carreras)
   - `src/components/dashboard/` (Hero Banner, Banners de Onboarding y Modales)
   - `src/components/macrocycle/` (Timeline Bar, Workspaces y Detalle de Sesiones)
3. **Ergonomía Móvil y Acordeones Táctiles:** En vistas multicard complejas (como Perfil y Fisiología), las secciones secundarias (Zonas de Potencia, Matriz de Disponibilidad, Conexión Intervals) deben estructurarse en acordeones táctiles colapsables (`<AthleteCollapsibleSection />`) que en pantallas móviles arranquen colapsadas con badges de estado, previniendo la sobrecarga vertical. Toda nomenclatura mostrada en móvil debe ser concisa y libre de redundancias (ej. "Conexión Intervals" en lugar de "Sincronización Cloud con Intervals.icu").

---

## 🏃 4. SINTAXIS Y REGLAS DE WORKOUTS PARA INTERVALS.ICU
1. **Carrera por Potencia Stryd:** Debe especificarse siempre por **Tiempo + % FTP** (ej. `- 45m 75-80%`). **¡NUNCA uses distancia (km/m) con % FTP!** (evita el error crítico de 80h en relojes Garmin).
2. **Carrera por Distancia / Ritmo:** Usa Metros/Km (`km`/`mtr`) + `% Pace` (ej. `- 10km 85-90% Pace`).
3. **Ciclismo:** Usa Tiempo + `% FTP` (ej. `- 60m 70%`).
4. **Fuerza / Gimnasio:** Formato texto plano descriptivo (`WeightTraining`).
5. **Días de Descanso:** Se configuran como descansos pasivos con 0 TSS (`isRestDay: true`).

---

## 🔒 5. SEGURIDAD, MULTIUSUARIO Y MODO 100% MANUAL
1. **Aislamiento Multiusuario y Almacenamiento con Prefijo (userStorage):** Cada usuario opera en un espacio estrictamente independiente identificado por su `uid`. Queda terminantemente prohibido usar `localStorage` global directo sin prefijo para almacenar datos sensibles o telemetría del atleta. Toda persistencia en cliente debe canalizarse a través de `userStorage.ts` con prefijo unívoco (`sgea:user:${safeUid}:${key}`), previniendo cualquier fuga o colisión de datos entre sesiones e incólume ante cambios de cuenta.
2. **Cifrado en Reposo:** Las API Keys de Intervals.icu se cifran con **AES-256-GCM** en el servidor (`src/lib/db/userProfile.ts`).
3. **Modo 100% Manual On-Demand:** Las evaluaciones fisiológicas y sincronizaciones con Intervals.icu son disparadas manualmente por el atleta. **Cero cron jobs automáticos de fondo** (no se utiliza Cloud Scheduler).
4. **Gobernanza de Mutación de Usuarios y Privilegios Admin:** Toda alteración del ciclo de vida de atletas (pausa / reactivación / deshabilitar) o eliminación debe ejecutarse exclusivamente en el backend mediante **Firebase Admin SDK (`adminDb`)**, validando la autorización de `requesterUid`/`requesterEmail`. Queda **estrictamente prohibido usar el SDK de cliente `deleteDoc`** sobre `/users/{uid}`, ya que `firestore.rules` bloquea el borrado desde cliente. El Superadministrador Raíz (`gerkof@gmail.com`) está blindado de forma inviolable contra eliminación o suspensión.
5. **Prevalencia de Biometría Antropométrica (SSOT):** Los datos antropométricos manuales del atleta (peso, altura, género, fecha de nacimiento) guardados en Firestore / `userStorage` prevalecen sobre campos `undefined` o desfasados retornados por APIs externas de telemetría deportiva (Intervals.icu), impidiendo sobrescrituras accidentales en `refreshTelemetry`.
6. **Erradicación de Biometría Dummy en Cuentas Sin Calibrar:** Ningún componente o vista de atleta puede mostrar valores hardcodeados de prueba (ej. 313W Stryd CP, 238W FTP, 168 bpm LTHR, 45 bpm FC Reposo, 70 kg, 175 cm, 46 años). Los perfiles de nuevos atletas o sin configurar deben mostrar invariablemente placeholders limpios con guion largo (`— W`, `— bpm`, `— kg`, `— cm`, `—`).
7. **Resolución Unificada de Credenciales con UID y Email:** Todos los endpoints que consumen o sincronizan con Intervals.icu (`/api/sync-intervals`, `/api/sync-settings`, `/api/test-connection`, `/api/macrocycles/generate-ai`, `/api/evaluate`) deben recibir obligatoriamente `uid` y `email` en su payload. Esto garantiza que el servidor pueda descifrar la clave AES-256-GCM desde Firestore en memoria o resolver las credenciales rectoras del Superadministrador sin falsos positivos de 401.
8. **Desplazamiento Dinámico y Sincronización Anticipada de Calendario:** La semana en curso se calcula en tiempo real a partir del lunes actual del sistema (`getMondayOfWeekStr()`). Los controles de "Sincronizar a Intervals" y "Head Coach & Adaptación IA" se desplazan automáticamente semana a semana sin intervención manual, y permanecen disponibles para cualquier semana seleccionada por el atleta para permitir planificación anticipada.

---

## 🧬 6. GOBERNANZA DE MODELOS CIENTÍFICOS Y LENGUAJE
1. **Cero Código Hardcodeado:** Todos los porcentajes de FTP, zonas, cargas, duraciones y protocolos de test (ej. test de VAM, Test CSS) deben originarse de los modelos tipados y curados bajo `src/lib/ai/knowledge/`. Queda **estrictamente prohibido hardcodear** valores lógicos o descripciones directamente en los componentes de UI o endpoints de API.
2. **Lenguaje Amigable y Accesible:** Aunque los modelos tienen un alto rigor científico y matemático en el backend, el lenguaje, los títulos y las descripciones mostradas al atleta deben ser claras, positivas, motivadoras y libres de jerga hipertécnica innecesaria (ej. prefiere "Carrera Continua de Soltura" en lugar de "Z1 Depleción LISS").
3. **Erradicación Absoluta de HYROX:** El sistema está enfocado 100% en deportes de resistencia cíclica pura (Carrera a pie, Trail, Ciclismo y Triatlón) junto con sus momentos de preparación física. Quedan excluidos los modelos o entrenamientos tipo HYROX o "Acondicionamiento Híbrido".
4. **Leyes Inviolables de Fisiología y Carga (v3.5):**
   - *Cap Fisiológico de Tirada Larga de Maratón (3h / 180 min):* Para 42K Maratón, el fondo cumbre alcanza entre 28 km (debutante, ~165 min) y 32-34 km (intermedio/avanzado, 175-180 min / 20-miler de Canova & Pfitzinger). El techo máximo de seguridad no supera los 180 min (3 horas) para prevenir catabolismo y agotamiento de glucógeno.
   - *Escalado por Nivel (`athleteLevelCaps`):* Todos los modelos deben definir cotas de volumen e intensidad adaptadas al $CTL$ inicial (`BEGINNER`: 28 km / 165m, `INTERMEDIATE`: 32 km / 175m, `ADVANCED_ELITE`: 36 km / 185m).
   - *Tapering Científico Mujika & Bosquet (`taperingRules`):* 3 semanas para 42K/Ultra/IRONMAN, 2 semanas para 21K/70.3/Gran Fondo, 1.5 semanas para 10K y 1 semana para 5K/Sprint/Crit, en secuencia decreciente (ej. 32 km $\rightarrow$ 22 km $\rightarrow$ 16 km $\rightarrow$ 42.2 km) preservando el 100% de la intensidad de competición.
   - *Ecosistema Completo de Fuerza (100% SSOT):* Todo workout de fuerza o entrenamiento cruzado debe invocarse desde `strengthAndCrossModels.ts`.

---

## 🛡️ 7. ARQUITECTURA DE ROBUSTEZ, REDUNDANCIA Y TOLERANCIA A REINICIOS (v3.0)
1. **Capacidad de Encabezados HTTP (128 KB) a Nivel Sistema:** Toda ejecución del servidor Next.js debe garantizar `NODE_OPTIONS='--max-http-header-size=131072'`. Esta variable está exportada globalmente en `~/.zshrc` y `~/.zprofile`, y blindada en `scripts/start-server.sh` y `package.json` para evitar el error crítico `400 Bad Request (Request Header Fields Too Large)` cuando se acumulan cookies de sesión OAuth.
2. **Auto-Recuperación Temprana y Purga de Cookies en Cliente:** El `RootLayout` incluye el script interceptor de fase de captura en `<head>` y el componente `<ClientAutoRecovery />`. Si un chunk estático falla o `document.cookie` supera 4 KB, se purgan automáticamente cookies obsoletas antes de la auto-recarga limpia.
3. **Transpilación Segura y Aislamiento de Módulos:** En `next.config.mjs`, los paquetes cliente de Firebase (`@firebase/*`, `firebase`) deben transpilarse en `transpilePackages`, y las librerías de servidor (`firebase-admin`, `@google-cloud/firestore`, `protobufjs`, `google-gax`) deben aislarse en `serverExternalPackages` para evitar fallos `ENOENT` en disco.
4. **Límites de Error Nativos del App Router:** Toda la captura de errores debe manejarse en `src/app/error.tsx` y `src/app/global-error.tsx`, previniendo que Next.js recurra al Pages Router heredado (`pages/_document.js` o `./611.js`).
5. **Cero Bloqueo de UI por Latencia Externa:** Las vistas (Dashboard, Perfil, Season Studio) deben renderizar en 0ms con caché local, resolviendo la telemetría e interacciones de red en segundo plano con timeouts de red máximos de 3.5 segundos.
6. **Script de Arranque Blindado:** Para reiniciar el servidor tras cambios de código o fallos, usar prioritariamente `npm run start:robust` (o `bash scripts/start-server.sh`), que libera el puerto 3000 y recompila limpiamente.
7. **Renderizado Dinámico en Root:** En `src/app/layout.tsx`, debe mantenerse incondicionalmente `export const dynamic = "force-dynamic"` y `export const revalidate = 0` para evitar que Next.js almacene en caché shells HTML estáticos (`○ (Static)`) con hashes de scripts desfasados.
8. **Ruptura Forzada de Caché en Error Boundaries:** En `src/app/error.tsx` y `src/app/global-error.tsx`, ante cualquier `ChunkLoadError`, debe invocarse `window.location.replace(url + '?_v=' + Date.now())` para invalidar la memoria de scripts del navegador y sincronizar transparentemente con los nuevos hashes del servidor.

---

## 🤖 9. ARQUITECTURA INTEGRAL DE AGENTES Y SUBAGENTES (RUNTIME & DESARROLLO)

El sistema opera bajo un modelo de **Doble Capa de Agentes** para garantizar tanto el rigor científico con el atleta como la excelencia técnica del código:

```mermaid
flowchart TD
    subgraph CAPA_RUNTIME [" CAPA 1: AGENTES DE IA EN TIEMPO DE EJECUCIÓN (DEPORTIVOS) "]
        A1["Agente 01: PULSE Live Coach (Head Coach Adaptativo /api/headcoach/chat)"]
        A2["Agente 02: PULSE Macrocycle Architect (Periodizador /api/macrocycles/generate-ai)"]
        A3["Agente 03: PULSE Daily Physio Auditor (Evaluador /api/evaluate)"]
        A4["Agente 04: PULSE Program Library Curator (Curador de Catálogo /api/admin/programs)"]
    end

    subgraph CAPA_DEV [" CAPA 2: AGENTES DE INGENIERÍA, ARQUITECTURA & QA (DESARROLLO) "]
        ORQ["👑 Agente Principal: Lead Architect & Systems Orchestrator"]
        BE["⚙️ Agente Lead Backend & Motores Fisiológicos (Subagentes: Sync, Security, LLM, Math)"]
        FE["🎨 Agente Lead Frontend & Sports UX/UI (Subagentes: Calendar, Season, Chat, Profile)"]
        QA["🛡️ Agente Lead Auditor Técnico, QA & Debugging (Subagentes: Types, Ports, Stryd, Crypto)"]
        ORQ --> BE
        ORQ --> FE
        ORQ --> QA
    end
```

### 🏃 9.1. Capa 1: Agentes de IA en Runtime (Fisiología y Entrenamiento)
1. **Agente 01 — `PULSE Live Coach` (Head Coach Fisiológico On-Demand):**
   - **Endpoint:** `POST /api/headcoach/chat` | **Jurisdicción:** `src/lib/ai/headcoach/` y `src/components/HeadCoachChatDrawer.tsx`.
   - **Contexto Requerido (Input):** Biometría (edad, peso, categoría máster), umbrales (Stryd CP 327W / Bike FTP 240W), telemetría Banister en vivo (CTL, ATL, TSB, HRV Z-Score, sueño), desglose de actividades ejecutadas día a día vs planeadas, matriz semanal snapshot y fase de macrociclo.
   - **Salida Estructurada (Output):** Dictamen fisiológico en markdown, array de `quickReplies` contextuales de 1 toque, objeto `workoutDiff` para sustitución visual y `workoutStructure` con pasos estructurados para el reloj Garmin / Intervals.icu.
2. **Agente 02 — `PULSE Macrocycle Architect` (Periodizador de Temporada):**
   - **Endpoint:** `POST /api/macrocycles/generate-ai` | **Jurisdicción:** `src/lib/physiology/macrocycleGenerator.ts` y `src/lib/ai/knowledge/`.
   - **Contexto Requerido (Input):** Carrera objetivo (A/B/C), distancia, fecha límite, fecha de inicio seleccionada, matriz de 7 días y modelos científicos SSOT (`marathonModel`, `triathlonModel`, `cyclingModel`).
   - **Salida Estructurada (Output):** Macrociclo completo (8 a 40 semanas) con fases encadenadas (GPP + Específico), curva matemática continua de TSS, CTL peak proyectado y tiradas progresivas con cotas máximas según nivel (`athleteLevelCaps`).
3. **Agente 03 — `PULSE Daily Physio Auditor` (Diagnóstico de Carga):**
   - **Endpoint:** `POST /api/evaluate` | **Jurisdicción:** `src/lib/physiology/engine.ts` y `src/lib/intervals/client.ts`.
   - **Contexto Requerido (Input):** Wellness diario de Intervals.icu (rMSSD, RHR, sueño, fatiga, DOMS), actividades de los últimos 90 días y potencia ejecutada.
   - **Salida Estructurada (Output):** Estado fisiológico (`FRESH`, `OPTIMAL`, `OVERLOAD`, `EXTREME_FATIGUE`), factor de desacoplamiento aeróbico EF y recomendación de modulación inmediata (Z1 o descanso).
4. **Agente 04 — `PULSE Program Library Curator` (Curador del Catálogo):**
   - **Endpoint:** `POST /api/admin/programs` | **Jurisdicción:** `src/lib/physiology/macrocycleLibrary.ts`.
   - **Contexto Requerido (Input):** Parámetros de disciplina, nivel del atleta y duración en semanas.
   - **Salida Estructurada (Output):** Programas maestros estructurados con inyección de protocolos de test de campo en semanas 2 y 8.

---

### 💻 9.2. Capa 2: Agentes Especializados de Ingeniería y Desarrollo
1. **Agente Lead Backend & Motores Fisiológicos:**
   - **Jurisdicción:** `src/app/api/`, `src/lib/services/`, `src/lib/validation/`, `src/lib/intervals/`, `src/lib/db/`, `src/lib/ai/`, `src/lib/physiology/`.
   - **Subagentes:**
     - *Subagente 1.1 (Intervals Sync Engine & Services):* Servicios desacoplados (`telemetryService.ts`, `intervalsSyncService.ts`), sincronización bidireccional, sanitización de credenciales y controladores API delgados.
     - *Subagente 1.2 (Cloud Persistence & Security):* Cifrado AES-256-GCM, transacciones en Cloud Firestore, dirty checking de escrituras y guardas de SuperAdmin.
     - *Subagente 1.3 (Physiological LLM Orchestrator & FinOps):* Enrutamiento de modelos Gemini, compresor de contexto (`contextCondenser.ts`), manejo de fallback determinista y optimización de tokens.
     - *Subagente 1.4 (Periodization & Macrocycle Generator):* Algoritmos de balance 3:1, cálculo de CTL y asignación progresiva de volumen.
2. **Agente Lead Frontend & Sports UX/UI Specialist:**
   - **Jurisdicción:** `src/components/`, `src/hooks/`, `src/app/`, layout, Tailwind CSS, SVG.
   - **Subagentes:**
     - *Subagente 2.1 (Continuous Calendar & PMC Telemetry):* Cuadrícula de 8 columnas, doble tarjeta (planeado vs ejecutado) y mini-cintas PMC.
     - *Subagente 2.2 (Custom Hooks & State Governor):* Custom Hooks (`useAthleteTelemetry`, `useSeasonPlans`, `useIntervalsSync`), caché en memoria SWR (3 min TTL) y desacoplamiento de estado.
     - *Subagente 2.3 (Head Coach Chat & Workout Diffing):* Interfaz de chat interactivo, drawer responsivo y visualizador de diffing de sesiones.
     - *Subagente 2.4 (Biometrics & Zones Configurator):* Visor tabular de zonas (Stryd CP, Bike FTP, FC LTHR) y matriz de disponibilidad semanal.
3. **Agente Lead Auditor Técnico, QA & Debugging:**
   - **Jurisdicción:** `tsconfig.json`, `next.config.mjs`, `package.json`, tests, scripts de despliegue.
   - **Subagentes:**
     - *Subagente 3.1 (Type Safety Sentinel):* Ejecución estricta de `./node_modules/.bin/tsc --noEmit` y erradicación de `any`.
     - *Subagente 3.2 (Port & Process Governor):* Garantía de puerto `3000` exclusivo (`npm run dev:clean`) y eliminación de procesos zombis.
     - *Subagente 3.3 (Stryd Workout Syntax Validator):* Auditoría estricta de que **ningún** workout use distancia con `% FTP`.
     - *Subagente 3.4 (Security & Modular Architecture Auditor):* Control estricto del límite de **350 líneas por archivo**, APIs $\le 80\text{ LOC}$, `AthleteDashboard` < 160 LOC, desacoplamiento de dependencias y auditoría de `firestore.rules`.

---

## 📏 10. PRESUPUESTOS DE CÓDIGO (LOC BUDGETS) Y PROTOCOLO ANTI-REFACTORIZACIONES DESTRUCTIVAS

Para evitar la deuda técnica, la degradación del rendimiento de los LLMs y los ciclos de retrabajo ("reprocesos"), todo desarrollo en el SGEA debe acatar este estándar:

```mermaid
flowchart LR
    subgraph PRESUPUESTO [" 1. Presupuestos de Código (LOC) "]
        UI["UI: $\le 200$ (Max 350)"]
        HK["Hooks: $\le 100$ (Max 150)"]
        API["APIs: $\le 80$ (Max 120)"]
        SRV["Services: $\le 150$ (Max 200)"]
    end

    subgraph PROTOCOLO [" 2. Protocolo Quirúrgico "]
        P1["Edición Quirúrgica"]
        P2["Extracción Preventiva a 250 LOC"]
        P3["Contratos Tipados Inmutables"]
    end

    subgraph PIPELINE [" 3. 5-Gate Quality Pipeline "]
        G1["LOC Check"] --> G2["tsc --noEmit"]
        G2 --> G3["next build"]
        G3 --> G4["Scope Audit"]
        G4 --> G5["Bitácora Sync"]
    end

    PRESUPUESTO --> PROTOCOLO --> PIPELINE
```

### 📊 10.1. Tabla Oficial de Presupuestos de Código (LOC Budgets)
| Tipo de Archivo / Capa | Límite Objetivo Recomendado | Límite Inviolable (Hard Cap) | Acción Mandatoria al Superar Límite |
| :--- | :---: | :---: | :--- |
| **Componentes de UI / Vistas (`.tsx`)** | $\le 200\text{ LOC}$ | **$350\text{ LOC}$** | Extraer sub-componentes atómicos en `src/components/{dominio}/`. |
| **Custom Hooks de Estado (`use*.ts`)** | $\le 100\text{ LOC}$ | **$150\text{ LOC}$** | Dividir por responsabilidad única (ej. `useTelemetry`, `usePlans`). |
| **Rutas API Backend (`src/app/api/**/route.ts`)** | $\le 60\text{ LOC}$ | **$80\text{ LOC}$** | Controladores delgados obligatorios; delegar 100% a la Capa de Servicios en `src/lib/services/`. |
| **Capa de Servicios de Negocio (`src/lib/services/*.ts`)** | $\le 150\text{ LOC}$ | **$250\text{ LOC}$** | Aislar por dominio (ej. `telemetryService.ts`, `intervalsSyncService.ts`). |
| **Servicios Backend / Base de Datos** | $\le 150\text{ LOC}$ | **$200\text{ LOC}$** | Aislar por entidad o subdominio en `src/lib/db/`. |
| **Modelos Científicos Fisiológicos SSOT** | $\le 180\text{ LOC}$ | **$250\text{ LOC}$** | Crear un archivo por disciplina o momento en `src/lib/ai/knowledge/`. |
| **Tipos e Interfaces (`types.ts`)** | $\le 80\text{ LOC}$ | **$120\text{ LOC}$** | Agrupar tipos por dominio, evitando mega-archivos monolíticos. |

---

### 🛡️ 10.2. Las 5 Leyes Anti-Refactorizaciones Destructivas ("Zero-Rework Protocol")
1. **La Regla de la Edición Quirúrgica (Surgical Edits):**
   - Ante solicitudes puntuales (cambiar un color, botón, texto o margen), el agente tiene **estrictamente prohibido reescribir el archivo completo** o modificar los hooks y funciones fisiológicas asociadas. Debe intervenir únicamente las líneas exactas del cambio.
2. **Extracción Preventiva Temprana (A las 250 LOC):**
   - No esperar a que un archivo alcance el límite crítico de 350 líneas para modularizarlo. Al llegar a **250 líneas**, cualquier nueva sub-característica **debe nacer en un archivo nuevo**.
3. **Patrón Container-Presenter (Orquestador vs. Presentador):**
   - El archivo contenedor principal (ej. `AthleteDashboard.tsx`, `AthleteContinuousCalendar.tsx`) actúa únicamente como **Orquestador** (< 150 LOC) gestionando estado y callbacks; los submódulos hijos son puramente **Presentadores** que renderizan y emiten eventos.
4. **Inmutabilidad de Contratos Tipados:**
   - Queda prohibido renombrar campos en interfaces consolidadas (`PlanItem`, `AthleteProfile`, `MacrocycleBlueprint`). Si se requiere una nueva propiedad, se agrega como opcional (`?`) preservando 100% de retrocompatibilidad.
5. **Gobernanza FinOps y Resiliencia SWR (Token Minimizer & Write Deduplication):**
   - **Compresión de Contexto FinOps (`src/lib/ai/contextCondenser.ts`):** Reducción de listas masivas de actividades a cadenas de texto condensadas de alta densidad, ahorrando ~70% de tokens de entrada en prompts a Gemini.
   - **Caché en Memoria SWR en Cliente (TTL 3 min en `useAthleteTelemetry.ts`):** Las consultas de telemetría recientes se sirven desde caché en memoria para proteger cuotas de API de Intervals.icu y evitar degradación por re-render.
   - **Dirty Checking de Persistencia (`useRef` en cliente):** Solo emitir mutaciones HTTP PUT/POST a Firestore o APIs si el estado serializado ha cambiado respecto a la última sincronización, eliminando escrituras fantasma y sobrecostos de base de datos.

---

### 🧪 10.3. Pipeline de Calidad de 5 Puertas (5-Gate Quality Pipeline)
Todo agente debe verificar secuencialmente antes de dar por cerrada cualquier tarea:
- **Gate 1 (LOC Budget):** Verificar que ningún archivo modificado o creado supere las **350 líneas** (y API routes $\le 80\text{ LOC}$).
- **Gate 2 (Type Safety):** Ejecutar `./node_modules/.bin/tsc --noEmit` $\rightarrow$ **Debe retornar código 0 (cero errores)**.
- **Gate 3 (Production Build):** Ejecutar `npm run build` $\rightarrow$ **Todas las rutas compilan y empaquetan con éxito**.
- **Gate 4 (Scope Integrity):** Confirmar con `git diff` que no se tocaron archivos fuera del alcance acordado.
- **Gate 5 (Master Log Sync):** Registrar la intervención en `BITACORA_MAESTRA.md` con fecha, archivos modificados y resultados de pruebas.
