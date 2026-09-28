# 📋 PLAN MAESTRO DE EJECUCIÓN: Sistema Dual de Running (Potencia Stryd vs. Modelo Híbrido HR + Ritmo) — SGEA v3.80

> **REGLA FUNDAMENTAL Y DEFINITIVA:**
> El sistema soporta **exclusivamente dos modelos de running**:
> 1. **⚡ MODELO 1: POTENCIA EXCLUSIVA (STRYD):** Para atletas con potenciómetro. Entrenan **100% por vatios (% CP)**. El código y flujo actual se mantiene **intacto e idéntico**.
> 2. **⏱️❤️ MODELO 2: HÍBRIDO (RITMO + HR):** Para atletas sin potenciómetro. **NO hay modos aislados de "solo ritmo" ni "solo pulso"**. Todo corredor sin Stryd entrena en el **Modelo Híbrido**:
>    - **Series, intervalos y calidad:** Se prescriben por **Ritmo (`% Pace` en Intervals / `min/km` en tarjeta)**.
>    - **Fondos largos, rodajes suaves y regenerativos:** Se prescriben por **Frecuencia Cardíaca (`% LTHR` en Intervals / `bpm` en tarjeta)**.
> 3. **Zonas en el Perfil del Atleta:**
>    - Atleta Potencia: Zonas Stryd Power.
>    - Atleta Híbrido: **Zonas de Ritmo (Pace Zones Z1-Z6 en `min/km`)** + **Zonas de Frecuencia Cardíaca (Z1-Z7 en `bpm`)**.
> 4. Los 18 modelos existentes **no se duplican**. El adaptador fisiológico traduce la carrera al vuelo entre Potencia e Híbrido.

---

## 🎯 COMPARATIVA DIRECTA DE LOS 2 MODELOS

```
                    ¿TIENES POTENCIÓMETRO DE CARRERA (STRYD)?
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
           [ SÍ: CHECKBOX MARCADO ]          [ NO: CHECKBOX DESMARCADO ]
                      │                                 │
           ⚡ MODELO POTENCIA                ⏱️❤️ MODELO HÍBRIDO
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

> [!NOTE]
> **Disciplinas Complementarias:**
> - **Ciclismo:** Siempre se rige por vatios de pedaleo (`bikeFtp` / `% FTP`).
> - **Fuerza:** Siempre se prescribe como rutinas funcionales (`WeightTraining`).
> - **Natación:** Siempre se rige por ritmo técnico (`CSS` / `100m`).

---

## 🏃 TABLA DE ZONAS POR RITMO (A CREAR EN EL PERFIL PARA MODO HÍBRIDO)

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
    P1["Paso 1: Tipos & DB (Solo 2 Modos)"] --> P2["Paso 2: Adaptador Universal"]
    P2 --> P3["Paso 3: Zonas por Ritmo en UI"]
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

### PASO 2: Adaptador Fisiológico Universal (`runningWorkoutAdapter.ts`)
**Archivo nuevo a crear:**
- `src/lib/physiology/runningWorkoutAdapter.ts` (< 150 LOC)

**Acciones concretas:**
1. `resolveRunningMode(profile)`:
   - Si `hasRunningPowerMeter === true` o `runFtp > 0` -> Retorna `"POWER"`.
   - Si no -> Retorna `"HYBRID"`.
2. `calculatePaceZones(thresholdPaceSec: number)`:
   - Calcula dinámicamente las 6 zonas de ritmo (Z1 a Z6) en `min/km`.
3. `adaptRunningWorkoutDoc(workoutDoc, discipline, isQuality, mode)`:
   - Si `discipline !== "Carrera"` o `mode === "POWER"` -> Retorna el texto intacto con `% FTP`.
   - Si `mode === "HYBRID"`:
     - Calidad (series, intervalos, fartlek, tempo) -> Reemplaza `% FTP` por `% Pace`.
     - Suaves y Fondos (regenerativo, fondo Z2, tirada larga) -> Reemplaza `% FTP` por `% LTHR`.
4. `formatIntensityTarget(params)`:
   - Potencia o Ciclismo -> `240W (80% CP)` o `180W (70% FTP)`.
   - Híbrido en Calidad -> `4:15/km (105% Pace)`.
   - Híbrido en Fondos/Suaves -> `145 bpm (82% LTHR)`.

---

### PASO 3: Zonas por Ritmo en el Perfil y UI
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
   - Si el atleta es Híbrido, se muestran activas tanto las Zonas de Ritmo como las Zonas de Frecuencia Cardíaca con la insignia `[MODO HÍBRIDO ACTIVO]`.
   - Si el atleta es Potencia, se resalta la columna de Stryd Power con `[MODO POTENCIA ACTIVO]`.
2. **Tarjeta de Cabecera del Atleta (`AthleteProfileHeroCard.tsx`):**
   - Si es Potencia: Badge ⚡ `Potencia Stryd (${runFtp}W)`.
   - Si es Híbrido: Badge ⏱️❤️ `Modo Híbrido (${paceStr}/km • ${lthr} bpm)`.
3. **Modal de Edición y Pestaña de Fisiología:**
   - Checkbox directo:
     `[x] Entreno con Potenciómetro de Carrera (Stryd)`
   - Si está marcado: Modo Potencia (muestra campo de Stryd CP).
   - Si está desmarcado: Muestra badge *"Modo Híbrido Activo (Series por Ritmo + Fondos por Pulso)"* con campos para calibrar:
     - **Ritmo Umbral (`min/km`)** (sincronizable con Intervals.icu `threshold_pace`).
     - **FC Umbral (LTHR)** en bpm.
4. **Gráfico `WorkoutChart.tsx`:**
   - Tooltips interactivos: vatios en modo Potencia, o ritmo/pulso según corresponda en modo Híbrido.

---

### PASO 4: Generadores de Planes y Sincronización con Intervals.icu
**Archivos a modificar:**
- `src/lib/gemini/deterministicPlanGenerator.ts`
- `src/lib/ai/knowledge/longRunPeriodization.ts`
- `src/lib/services/intervalsSyncService.ts`

**Acciones concretas:**
1. En `deterministicPlanGenerator.ts`:
   - En sesiones de carrera, aplicar `adaptRunningWorkoutDoc` y `formatIntensityTarget`.
   - En ciclismo: mantener vatios y `% FTP`.
2. En `longRunPeriodization.ts`:
   - En modo `POWER`: vatios y `% CP`.
   - En modo `HYBRID`: pulso en `bpm` y `% LTHR`.
3. En `intervalsSyncService.ts`:
   - Despachar a Intervals.icu el `workoutDoc` adaptado (`% FTP` para potencia; `% Pace` en series y `% LTHR` en fondos para híbrido).

---

### PASO 5: Agente Head Coach & Prompts
**Archivos a modificar:**
- `src/lib/ai/prompts.ts`
- `src/lib/ai/headcoach/chatContext.ts`

**Acciones concretas:**
1. Inyectar en el prompt del Head Coach:
   - Si el atleta es `POWER`: Hablar exclusivamente en vatios Stryd (% CP).
   - Si el atleta es `HYBRID`: Hablar en **Ritmo (`min/km`) para series y calidad**, y en **Frecuencia Cardíaca (`bpm` y `% LTHR`) para rodajes suaves y tiradas largas**.

---

### PASO 6: Set de Pruebas & Validación Obligatoria
1. **Tipado:** `./node_modules/.bin/tsc --noEmit` (Código 0).
2. **Compilación de Producción:** `npm run build` (Código 0).
3. **Auditoría de Atleta Stryd:** Verificar que un atleta con potenciómetro activo no experimenta ningún cambio en vatios ni sintaxis.
4. **Auditoría de Atleta Híbrido:** Verificar que las series salen con ritmo y los fondos con pulso, y que las zonas de ritmo se calculan correctamente en el perfil.

---

## 🚀 CONFIRMACIÓN PARA EJECUTAR

El plan ahora es **100% nítido: Solo existen 2 modelos (Potencia Stryd vs. Híbrido HR + Ritmo)** y se incluye la creación de las **Zonas por Ritmo en el perfil**.

Si estás de acuerdo, responde **"Procede"** o pulsa **Proceed** y comenzamos con la ejecución inmediata del **Paso 1**.
