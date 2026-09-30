# 📋 PLAN MAESTRO DE EJECUCIÓN: Sistema Dual de Running (Potencia Stryd vs. Modelo Híbrido HR + Ritmo) con Recalibración Dinámica Automática — SGEA v3.80

> **REGLA FUNDAMENTAL Y DEFINITIVA:**
> 1. **⚡ MODELO 1: POTENCIA EXCLUSIVA (STRYD):** Para atletas con potenciómetro. Entrenan **100% por vatios (% CP)**. El código y flujo actual se mantiene **intacto e idéntico**.
> 2. **⏱️❤️ MODELO 2: HÍBRIDO (RITMO + HR):** Para atletas sin potenciómetro. **NO hay modos aislados de solo ritmo o solo pulso**. Todo corredor sin Stryd entrena en el **Modelo Híbrido**:
>    - **Series, intervalos y calidad:** Se prescriben por **Ritmo (`% Pace` en Intervals / `min/km` en tarjeta)**.
>    - **Fondos largos, rodajes suaves y regenerativos:** Se prescriben por **Frecuencia Cardíaca (`% LTHR` en Intervals / `bpm` en tarjeta)**.
> 3. **🔄 RECALIBRACIÓN DINÁMICA REACTIVA:** Al actualizarse cualquiera de los datos fisiológicos (**Potencia Stryd, Ritmo Umbral o LTHR/FC**), los entrenamientos del calendario, macrociclo y gráficas **se ajustan y recalculan automáticamente en tiempo real**:
>    - Si cambia Stryd CP: Se recalculan todos los vatios planificados en carrera.
>    - Si cambia el Ritmo Umbral: Se recalculan los `min/km` de todas las series de calidad.
>    - Si cambia el LTHR / FC: Se recalculan las pulsaciones `bpm` de todos los fondos y rodajes.
>    - Si cambia de Potencia a Híbrido (o viceversa): El plan transmuta su métrica rectora al instante.
> 4. **Zonas en el Perfil:** Zonas Stryd Power para atletas con potencia, y **Zonas por Ritmo (Z1-Z6 min/km)** + **Zonas HR (Z1-Z7 bpm)** para atletas híbridos.
> 5. Cero duplicación de los 18 modelos existentes.

---

## 🎯 COMPARATIVA DIRECTA DE LOS 2 MODELOS

```
                    ¿TIENES POTENCIÓMETRO DE CARRERA (STRYD)?
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
           [ SÍ: CHECKBOX MARCADO ]          [ NO: CHECKBOX DESMARCADO ]
                      │                                 │
           ⚡ MODELO POTENCIA                ⏱️❤️ MODELO HÍBRIDO (HR + RITMO)
           • 100% Vatios (% CP)              • Series/Calidad: RITMO (min/km)
           • Cero mezcla de variables        • Fondos/Suaves: CORAZÓN (bpm / % LTHR)
           • Código actual 100% intacto      • Zonas de Ritmo + Zonas de Pulso
```

| Aspecto | ⚡ 1. Modelo Potencia (Stryd) | ⏱️❤️ 2. Modelo Híbrido (HR + Ritmo) |
| :--- | :--- | :--- |
| **Población Objetivo** | Corredores con podómetro Stryd | Corredores sin podómetro de carrera |
| **Prescripción en Calidad (Series)** | Vatios Stryd (`240W • 95% CP`) | Ritmo en min/km (`4:15/km • 105% Pace`) |
| **Prescripción en Fondos / Suaves** | Vatios Stryd (`195W • 78% CP`) | Frecuencia Cardíaca (`142-148 bpm • 80-84% LTHR`) |
| **Sintaxis en Intervals.icu** | `- 45m 80% FTP` (constante) | Series: `- 4x 1000m 105% Pace` • Fondos: `- 1h30m 80% LTHR` |
| **Zonas en Perfil** | Zonas Stryd Power (W) | **Zonas por Ritmo (Z1-Z6 min/km)** + **Zonas HR (Z1-Z7 bpm)** |
| **Activación en Perfil** | `[x] Entreno con Potenciómetro` | `[ ] Entreno con Potenciómetro` (Automático Híbrido) |
| **Respuesta a Nuevos Datos** | Recalcula Vatios en vivo | Recalcula Ritmos (`min/km`) y Pulsaciones (`bpm`) en vivo |

---

## 🔄 MOTOR DE RECALIBRACIÓN DINÁMICA AUTOMÁTICA

> [!IMPORTANT]
> **Cero Datos Quemados y Reactividad Inmediata:**
> Toda sesión de entrenamiento almacena porcentajes relativos de intensidad (`% CP`, `% Pace`, `% LTHR`). Al cambiar una métrica en el perfil del atleta, los targets absolutos se recalculan en caliente:
> 1. **Al actualizar Stryd CP (ej. de 250W a 275W):**
>    - Sesión al 80% CP: Pasa de `200W` a `220W` automáticamente.
>    - `WorkoutChart` recalcula los tooltips de vatios de inmediato.
> 2. **Al actualizar Ritmo Umbral (ej. de 4:30/km a 4:15/km):**
>    - Serie al 105% Pace: Pasa de `4:17/km` a `4:03/km` automáticamente.
>    - Las 6 Zonas de Ritmo (Z1 a Z6) en el perfil se reajustan en tiempo real.
> 3. **Al actualizar LTHR / Frecuencia Cardíaca (ej. de 165 a 168 bpm):**
>    - Fondo al 82% LTHR: Pasa de `135 bpm` a `138 bpm` automáticamente.
>    - Las Zonas de Frecuencia Cardíaca en el perfil se reajustan en tiempo real.
> 4. **Al conmutar entre Potencia e Híbrido:**
>    - El calendario transmuta inmediatamente los badges (⚡ vs ⏱️❤️) y las unidades de prescripción sin necesidad de regenerar el macrociclo desde cero.
> 5. **Sincronización Cloud con Intervals.icu:**
>    - Al pulsar "Sincronizar a Intervals", los eventos del calendario externo se sobrescriben con los targets recalibrados.

---

## 🏃 TABLA DE ZONAS POR RITMO (EN EL PERFIL PARA MODO HÍBRIDO)

Calculadas dinámicamente a partir del **Ritmo Umbral** (Threshold Pace / VAM, ej. 4:30/km):

| Zona de Ritmo | Nombre Fisiológico | % del Ritmo Umbral | Rango Calculado (Umbral 4:30/km) | Uso en el Modelo Híbrido |
| :--- | :--- | :--- | :--- | :--- |
| **Z1 - Fácil** | Recuperación Activa | < 75% Pace | `5:45 - 6:30 /km` | Calentamiento y enfriamiento |
| **Z2 - Moderado** | Fondo Aeróbico | 75 - 85% Pace | `5:00 - 5:45 /km` | Referencia de paso en fondos Z2 |
| **Z3 - Tempo** | Tempo / Aeróbico Alto | 85 - 94% Pace | `4:35 - 5:00 /km` | Bloques a ritmo maratón |
| **Z4 - Umbral** | Umbral de Lactato (LT) | 95 - 104% Pace | `4:20 - 4:35 /km` | **Series de Umbral (Pace rector)** |
| **Z5 - Intervalo** | Potencia Aeróbica (VO2max) | 105 - 115% Pace | `3:55 - 4:20 /km` | **Series VO2max (Pace rector)** |
| **Z6 - Repetición** | Capacidad Anaeróbica | > 115% Pace | `< 3:55 /km` | **Rectas y Cuestas (Pace rector)** |

---

## 🛠️ PASO A PASO DE IMPLEMENTACIÓN

```mermaid
flowchart LR
    P1["Paso 1: Tipos & DB (2 Modos)"] --> P2["Paso 2: Adaptador & Recalibrador"]
    P2 --> P3["Paso 3: Zonas en Perfil & UI"]
    P3 --> P4["Paso 4: Generadores & Sync"]
    P4 --> P5["Paso 5: Head Coach IA"]
    P5 --> P6["Paso 6: Set de Pruebas"]
```

---

### PASO 1: Tipos y Modelo de Datos (SSOT)
**Archivos a modificar:**
- `src/lib/db/types.ts`
- `src/lib/intervals/types.ts`
- `src/lib/validation/schemas.ts`

**Acciones concretas:**
1. Definir los dos únicos modos:
   ```typescript
   export type RunningTrainingMode = "POWER" | "HYBRID";
   ```
2. Agregar a `UserProfileData` y `AthleteProfile`:
   - `hasRunningPowerMeter?: boolean;` (checkbox de Stryd)
   - `runningTrainingMode?: RunningTrainingMode;` (por defecto "POWER" si tiene Stryd, o "HYBRID")
   - `runThresholdPaceSecPerKm?: number;` (ritmo umbral en segundos, ej. 270s = 4:30/km)
   - `runThresholdPaceStr?: string;` (ritmo umbral legible, ej. "4:30")
3. Validación en Zod (`schemas.ts`).

---

### PASO 2: Adaptador Fisiológico Universal y Motor de Recalibración
**Archivo nuevo a crear:**
- `src/lib/physiology/runningWorkoutAdapter.ts` (< 180 LOC)

**Acciones concretas:**
1. `resolveRunningMode(profile)`:
   - Si `hasRunningPowerMeter === true` o `runFtp > 0` -> Retorna `"POWER"`.
   - Si no -> Retorna `"HYBRID"`.
2. `calculatePaceZones(thresholdPaceSec: number)`:
   - Calcula dinámicamente las 6 zonas de ritmo (Z1 a Z6) en `min/km`.
3. `adaptRunningWorkoutDoc(workoutDoc, discipline, isQuality, mode)`:
   - Si `discipline !== "Carrera"` o `mode === "POWER"` -> Retorna texto intacto con `% FTP`.
   - Si `mode === "HYBRID"`:
     - Calidad (series, intervalos, fartlek, tempo) -> Reemplaza `% FTP` por `% Pace`.
     - Suaves y Fondos (regenerativo, fondo Z2, tirada larga) -> Reemplaza `% FTP` por `% LTHR`.
4. `recalculateWorkoutTarget(rawTarget, metrics)`:
   - **Función de recalibración universal:** Toma cualquier string de target (ej. `80% CP` o `105% Pace` o `82% LTHR`) y, al recibir los nuevos valores de `runFtp`, `thresholdPaceSec` o `lthr`, calcula y formatea inmediatamente:
     - En Potencia: `220W (80% CP)`
     - En Híbrido (Calidad): `4:03/km (105% Pace)`
     - En Híbrido (Fondos): `138 bpm (82% LTHR)`

---

### PASO 3: Zonas por Ritmo en el Perfil y Reactividad UI
**Archivos a modificar:**
- `src/components/profile/AthleteZonesViewer.tsx`
- `src/components/profile/AthleteEditProfileModal.tsx`
- `src/components/profile/ProfilePhysiologyTab.tsx`
- `src/components/profile/AthleteProfileHeroCard.tsx`
- `src/components/WorkoutChart.tsx`
- `src/components/dashboard/AthleteCalendarDayTile.tsx`
- `src/components/dashboard/AthleteMobileWorkoutCard.tsx`

**Acciones concretas:**
1. **Zonas por Ritmo en `AthleteZonesViewer.tsx`:**
   - Crear la columna **"Zonas de Carrera por Ritmo (Pace Zones)"** con las 6 zonas en `min/km`.
   - Reactiva: si el atleta edita su ritmo umbral en el perfil, los rangos de Z1 a Z6 se recalculan instantáneamente.
   - Mostrar insignias `[MODO ACTIVO]`: Zonas Stryd para potencia, o Zonas Ritmo + Zonas LTHR para híbrido.
2. **Tarjeta de Cabecera del Atleta (`AthleteProfileHeroCard.tsx`):**
   - Si es Potencia: Badge ⚡ `Potencia Stryd (${runFtp}W)`.
   - Si es Híbrido: Badge ⏱️❤️ `Modo Híbrido (${paceStr}/km • ${lthr} bpm)`.
3. **Modal de Edición y Pestaña de Fisiología:**
   - Checkbox: `[x] Entreno con Potenciómetro de Carrera (Stryd)`.
   - Si está desmarcado: Muestra campos para calibrar:
     - **Ritmo Umbral (`min/km`)** (sincronizable con Intervals.icu `threshold_pace`).
     - **FC Umbral (LTHR)** en bpm.
   - **Efecto Inmediato:** Al hacer clic en Guardar, el estado global se actualiza y recalcula todas las sesiones del calendario sin requerir recargar la página.
4. **Gráfico `WorkoutChart.tsx`:**
   - Tooltips reactivos: muestra vatios calculados con el `runFtp` vigente, o min/km y bpm con el ritmo/lthr vigente.

---

### PASO 4: Generadores de Planes, Sincronización y Recalibración
**Archivos a modificar:**
- `src/lib/gemini/deterministicPlanGenerator.ts`
- `src/lib/physiology/macrocycleTemplateHelpers.ts`
- `src/lib/physiology/macrocycleTemplates.ts`
- `src/lib/ai/knowledge/longRunPeriodization.ts`
- `src/lib/services/intervalsSyncService.ts`

**Acciones concretas:**
1. En `macrocycleTemplateHelpers.ts`:
   - Extender `interpolatePowerTarget` para soportar `interpolateWorkoutTarget(rawTarget, { runFtp, bikeFtp, thresholdPaceSec, lthr, mode })`.
   - Al cambiar `runFtp`, `thresholdPace` o `lthr`, los textos descriptivos de las tarjetas se interpolan con los nuevos valores numéricos.
2. En `deterministicPlanGenerator.ts` y `macrocycleTemplates.ts`:
   - Incorporar `runningMode` y métricas fisiológicas para prescribir las sesiones adaptadas.
3. En `intervalsSyncService.ts`:
   - Despachar a Intervals.icu el `workoutDoc` recalibrado (`% FTP` para potencia; `% Pace` en series y `% LTHR` en fondos para híbrido).

---

### PASO 5: Agente Head Coach & Prompts
**Archivos a modificar:**
- `src/lib/ai/prompts.ts`
- `src/lib/ai/headcoach/chatContext.ts`

**Acciones concretas:**
1. Inyectar en el prompt del Head Coach:
   - Si el atleta es `POWER`: Prescribir y evaluar exclusivamente en vatios Stryd (% CP).
   - Si el atleta es `HYBRID`: Prescribir series por Ritmo (`min/km`), y fondos por Frecuencia Cardíaca (`bpm` y `% LTHR`).
   - El Head Coach reconoce las recalibraciones recientes de ritmo, pulso o potencia para justificar sus recomendaciones.

---

### PASO 6: Set de Pruebas & Validación Obligatoria
1. **Tipado:** `./node_modules/.bin/tsc --noEmit` (Código 0).
2. **Compilación de Producción:** `npm run build` (Código 0).
3. **Auditoría de Invarianza Stryd:** Verificar que un atleta con potenciómetro activo no experimenta ningún cambio en vatios ni sintaxis.
4. **Auditoría de Recalibración Dinámica en Vivo:**
   - Test: Cambiar `runFtp` de 250 a 280W -> Verificar que los vatios de las tarjetas de carrera se incrementan proporcionalmente.
   - Test: Cambiar Ritmo Umbral de 4:30 a 4:15/km -> Verificar que las series en modo Híbrido se recalculan a ritmos más rápidos y las Zonas de Ritmo se actualizan.
   - Test: Cambiar LTHR de 165 a 170 bpm -> Verificar que los fondos en modo Híbrido se recalculan a pulsaciones más altas.

---

## 🚀 CONFIRMACIÓN PARA EJECUTAR

El plan ahora incorpora formalmente el **Motor de Recalibración Dinámica Automática** para Potencia, Ritmo y Corazón. Si estás de acuerdo, responde **"Procede"** o pulsa **Proceed** y arrancamos inmediatamente con el **Paso 1**.
