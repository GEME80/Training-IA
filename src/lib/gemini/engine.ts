import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";
import { PhysiologicalStatus, PhysiologicalEngine } from "../physiology/engine";
import { MacrocyclePhaseInfo } from "../physiology/macrocycle";

export type DisciplineType = "Descanso" | "Carrera" | "Ciclismo" | "Fuerza";
export type WeeklyAvailabilityMap = Record<string, DisciplineType>;

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMap = {
  Lunes: "Descanso",
  Martes: "Carrera",
  Miércoles: "Ciclismo",
  Jueves: "Fuerza",
  Viernes: "Carrera",
  Sábado: "Ciclismo",
  Domingo: "Carrera",
};

export interface PlanItem {
  day: string; // "Lunes", "Martes", etc.
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "18 Ago"
  discipline: DisciplineType;
  workoutName: string;
  action: "MANTENER" | "MODIFICAR" | "REDUCIR_INTENSIDAD" | "DESCANSO_ACTIVO";
  powerTarget?: string;
  justification: string;
  workoutDoc?: string;
  isRestDay?: boolean;
  isCustomized?: boolean;
}

export interface AgentDecisionOutput {
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  summaryHeadline: string;
  reasoningTree: string[];
  suggestedPlan: PlanItem[];
  modelUsed?: string;
  macrocyclePhase?: string;
}

/**
 * Obtiene el array de fechas (ISO y formateada) para los 7 días de la semana (Lunes a Domingo)
 * a partir de un offset de semana (0 = esta semana, 1 = próxima semana) o una fecha base.
 */
export function getWeekDates(
  weekOffset: number = 0,
  baseDate?: Date
): Array<{ day: string; date: string; formattedDate: string }> {
  const now = baseDate ? new Date(baseDate) : new Date();
  const dayOfWeek = now.getDay(); // 0 = Dom, 1 = Lun ... 6 = Sab
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday + weekOffset * 7);

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return days.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formatted = `${d.getDate()} ${months[d.getMonth()]}`;
    return { day, date: dateStr, formattedDate: formatted };
  });
}

/**
 * Motor de Inteligencia Fisiológica con Descubrimiento Dinámico de Modelos Google Gemini API.
 */
export class GeminiPhysiologicalAgent {
  /**
   * Genera un análisis adaptativo del microciclo semanal a partir de los datos biométricos, directrices y matriz personalizada.
   */
  static async analyzeMicrocycle(
    profile: AthleteProfile,
    wellness: AthleteWellness[],
    events: CalendarEvent[],
    physioStatus: PhysiologicalStatus,
    weekOffset: number = 0,
    options?: {
      customApiKey?: string;
      preferredModel?: string;
      customDirectives?: string;
      macrocyclePhase?: MacrocyclePhaseInfo;
      weeklyAvailability?: WeeklyAvailabilityMap;
      skipAI?: boolean;
    }
  ): Promise<AgentDecisionOutput> {
    const apiKey = options?.customApiKey || process.env.GEMINI_API_KEY;
    const weekDates = getWeekDates(weekOffset);
    const availability = options?.weeklyAvailability || DEFAULT_WEEKLY_AVAILABILITY;

    // Si se solicita omitir la IA (para actualización rápida de telemetría) o no hay clave:
    if (options?.skipAI || !apiKey) {
      return this.generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
    }

    // Cascada de modelos dinámicos priorizando los alias oficiales activos de Google AI
    const preferred = options?.preferredModel;
    const candidateModels = Array.from(
      new Set([
        preferred,
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-flash-lite-latest",
        "gemini-3.7-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
      ].filter(Boolean) as string[])
    );

    const customDirectivesText = options?.customDirectives
      ? `\nDIRECTRICES ESPECÍFICAS DEL ATLETA:\n${options.customDirectives}\n`
      : "";

    const macroInfo = options?.macrocyclePhase;
    const macrocycleText = macroInfo?.primaryRace
      ? `\nCONTEXTO DE MACROCICLO & CARRERA OBJETIVO:
- Carrera Principal (Prioridad A): ${macroInfo.primaryRace.name} (${macroInfo.primaryRace.distance}) el ${macroInfo.primaryRace.date}
- Conteo regresivo: ${macroInfo.weeksRemaining} semanas restantes (${macroInfo.daysRemaining} días)
- Fase Actual del Macrociclo: ${macroInfo.phaseLabel} (${macroInfo.phase})
- Enfoque Sugerido: ${macroInfo.suggestedFocus}
- Pauta Metodológica: ${macroInfo.guideline}
- Límite Máximo de Tirada Larga: ${macroInfo.maxLongRunMinutes} minutos
- Fase Específica de Maratón Activa: ${macroInfo.isSpecificMarathonPhase ? "SÍ" : "NO"}
- Carga Semanal Sugerida: ${macroInfo.weeklyTssTarget}\n`
      : `\nCONTEXTO DE MACROCICLO:
- Fase Actual: Mantenimiento General Adaptativo (Sin carrera A próxima definida)
- Enfoque: Estabilidad de CTL, salud articular (sóleo/Aquiles) y prevención de sobrecargas.
- Límite Máximo de Tirada Larga Dominical: 55-65 minutos (Queda terminantemente prohibido programar fondos de 90m o 2 horas en mantenimiento).
- Carga Semanal Sugerida: 280 - 360 TSS.\n`;

    const availabilityText = Object.entries(availability)
      .map(([day, disc]) => `- ${day}: ${disc === "Descanso" ? "Descanso total obligatorio" : `${disc} (${disc === "Carrera" ? "Stryd Running Power % FTP" : disc === "Ciclismo" ? "Ciclismo % FTP" : "Fuerza / Prevención"})`}`)
      .join("\n");

    const currentPhase = macroInfo?.phase || "MAINTENANCE";

    const prompt = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia, potenciómetros Stryd, periodización de macrociclos y modelos Banister (CTL, ATL, TSB, Rolling HRV).
Analiza el siguiente atleta y genera un diagnóstico semanal con ajustes para cada día de la semana (Lunes a Domingo):

PERFIL Y MÉTRICAS BIOMÉTRICAS:
- CTL (Fitness): ${physioStatus.ctl}
- ATL (Fatiga): ${physioStatus.atl}
- TSB (Forma): ${physioStatus.tsb}
- Ramp Rate: ${physioStatus.rampRate} pts/semana
- HRV Actual (rMSSD): ${physioStatus.currentHrv ?? "N/A"} ms (Z-Score: ${physioStatus.hrvZScore ?? "N/A"}, Media Base: ${physioStatus.baselineHrvMean})
- FC Reposo: ${physioStatus.restingHR ?? "N/A"} bpm
- Potencia Crítica Carrera (Stryd Run FTP / CP): ${profile.run_ftp ?? 285} W
- FTP Ciclismo: ${profile.bike_ftp ?? 260} W
${macrocycleText}${customDirectivesText}
MATRIZ PERSONALIZADA DE DISPONIBILIDAD DEL ATLETA (Respeta estrictamente esta estructura de días):
${availabilityText}

REGLAS FISIOLÓGICAS DE DURACIÓN Y ESPECIFICIDAD POR FASE (${currentPhase}):
1. FASE DE MANTENIMIENTO:
   - La tirada dominical NO DEBE SUPERAR los 55-65 minutos (Z1-Z2 cómoda). NO programar fondos largos de 90m o 2 horas.
   - Rodajes entre semana de 35 a 45 minutos.
   - Ciclismo: 60 a 75 minutos en Z2 suave.
   - Carga semanal total: 280 a 360 TSS.
2. FASE BASE I & II:
   - Tirada dominical contenida entre 65 y 80 minutos.
   - Ciclismo Z2: 75 a 90 minutos.
3. FASE DE CONSTRUCCIÓN (BUILD):
   - Progresión de tirada dominical a 85-95 minutos.
   - Series de umbral Stryd Z4 (4x6m / 4x8m @ 100% CP).
4. FASE DE PICO (PEAK - Solo si hay Maratón 42k objetivo):
   - Fondos largos específicos clave de 1h35m a 1h55m con bloques a potencia de maratón (78-82% CP). Fuera de esta fase específica de maratón, NO programar fondos largos desgastantes.
5. FASE DE TAPER (Puesta a Punto - Últimas 1 a 2 semanas):
   - Reducción drástica del volumen (-40% a -50%).
   - Tirada de domingo reducida a 40-50 minutos muy suaves.
   - Toques de activación breves (ej. 3x2m a ritmo objetivo) sin generar fatiga.
6. SEMANA DE COMPETICIÓN (RACE WEEK):
   - Rodajes de activación previa de 25-30 minutos con 3-4 rectas de 50m.

REGLAS DE REAJUSTE POR FATIGA:
- Si TSB < -20: Reducir carga drásticamente (convertir calidad en rodaje suave Z1 de 35m o descanso activo).
- Si Ramp Rate > +8: No aumentar volumen, consolidar meseta.
- En el campo 'action', indica claramente si el entrenamiento es 'MANTENER', 'MODIFICAR' (ej. atenuado por fatiga o intensificado por pico), 'REDUCIR_INTENSIDAD' o 'DESCANSO_ACTIVO'.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "status": "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED",
  "summaryHeadline": "Diagnóstico conciso en 1 frase",
  "reasoningTree": ["Paso 1 del análisis...", "Paso 2...", "Paso 3...", "Paso 4..."],
  "suggestedPlan": [
    {
      "day": "Lunes",
      "discipline": "Descanso",
      "workoutName": "Descanso Pasivo",
      "action": "MANTENER",
      "justification": "Recuperación biológica y asimilación neurovegetativa"
    },
    ... (hasta Domingo)
  ]
}`;

    // Intentar inferencia en la cascada de modelos
    for (const modelName of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          }
        );

        if (!res.ok) {
          console.warn(`Modelo ${modelName} no respondió OK (${res.status}), probando siguiente...`);
          continue;
        }

        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const parsed = JSON.parse(rawText) as AgentDecisionOutput;
        parsed.modelUsed = modelName;
        parsed.macrocyclePhase = macroInfo?.phaseLabel;

        // Asignar fechas y documentos de sintaxis con formato estructurado
        parsed.suggestedPlan = parsed.suggestedPlan.map((item, idx) => {
          const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };
          const isRest = item.discipline === "Descanso" || item.action === "DESCANSO_ACTIVO";
          const disc = item.discipline || availability[item.day] || "Carrera";

          return {
            ...item,
            discipline: disc,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            isRestDay: isRest,
            workoutDoc:
              item.workoutDoc ||
              (isRest
                ? undefined
                : PhysiologicalEngine.generateWorkoutSyntax(
                    disc === "Ciclismo" ? "Ride" : disc === "Fuerza" ? "WeightTraining" : "Run",
                    item.workoutName.includes("Series") || item.workoutName.includes("Umbral")
                      ? "THRESHOLD_INTERVALS"
                      : item.workoutName.includes("Larga") || item.workoutName.includes("Fondo")
                      ? "LONG_RUN"
                      : "RECOVERY",
                    100,
                    macroInfo?.phase
                  )),
          };
        });

        return parsed;
      } catch (err) {
        console.warn(`Error en inferencia con modelo ${modelName}:`, err);
      }
    }

    console.warn("Todos los modelos de Gemini fallaron o límite de tasa alcanzado. Usando motor fisiológico determinístico.");
    return this.generateDeterministicAnalysis(profile, physioStatus, weekDates, options?.macrocyclePhase, availability);
  }

  /**
   * Generador determinístico de alta precisión adaptado a la fase del macrociclo.
   */
  private static generateDeterministicAnalysis(
    profile: AthleteProfile,
    status: PhysiologicalStatus,
    weekDates: Array<{ day: string; date: string; formattedDate: string }>,
    macrocyclePhase?: MacrocyclePhaseInfo,
    availability: WeeklyAvailabilityMap = DEFAULT_WEEKLY_AVAILABILITY
  ): AgentDecisionOutput {
    const isFatigued = status.status === "OVERTRAINING_RISK" || status.status === "CAUTION";
    const runFtp = profile.run_ftp ?? 285;
    const bikeFtp = profile.bike_ftp ?? 260;
    const phase = macrocyclePhase?.phase || "MAINTENANCE";

    const macroTitle = macrocyclePhase?.primaryRace
      ? `Macrociclo: ${macrocyclePhase.phaseLabel} (${macrocyclePhase.weeksRemaining} sem para ${macrocyclePhase.primaryRace.name}).`
      : `Macrociclo: Mantenimiento General Adaptativo.`;

    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    const suggestedPlan: PlanItem[] = days.map((day, idx) => {
      const disc = availability[day] || "Carrera";
      const dateInfo = weekDates[idx] || { date: "", formattedDate: "" };

      if (disc === "Descanso") {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Descanso",
          workoutName: "Descanso Pasivo Total",
          action: "MANTENER",
          justification: "Recuperación pasiva y asimilación neurovegetativa.",
          isRestDay: true,
        };
      }

      if (disc === "Ciclismo") {
        const isLong = day === "Sábado" || day === "Domingo";
        const isPeakBuild = phase === "BUILD" || phase === "PEAK";
        const rideDuration = isLong ? (isPeakBuild ? "1h45m" : "1h15m") : "55m";

        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Ciclismo",
          workoutName: isLong
            ? `Fondo Resistencia Ciclismo (${rideDuration} Z2)`
            : "Ciclismo Z2 Base Aeróbica (55m)",
          action: "MANTENER",
          powerTarget: `${Math.round(bikeFtp * 0.65)}W (65% FTP)`,
          justification: "Volumen aeróbico mitocondrial sin impacto osteoarticular.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Ride", isLong ? "LONG_RUN" : "Z2_BASE", 65, phase),
          isRestDay: false,
        };
      }

      if (disc === "Fuerza") {
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Fuerza",
          workoutName: "Fuerza Sóleo / Pliometría Reactiva",
          action: "MANTENER",
          justification: "Optimización neuromuscular, rigidez del tendón de Aquiles y prevención de lesiones.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("WeightTraining", "STRENGTH"),
          isRestDay: false,
        };
      }

      // Carrera por defecto
      const isQuality = day === "Martes" || day === "Jueves";
      const isLongRun = day === "Domingo" || day === "Sábado";

      if (isQuality && !isFatigued) {
        if (phase === "MAINTENANCE" || phase === "TAPER") {
          return {
            day,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            discipline: "Carrera",
            workoutName: phase === "TAPER"
              ? "Activación Breve con Cambios de Ritmo (35m)"
              : "Rodaje Progresivo con Toques Z3 Stryd (45m)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.85)}W (85% CP)`,
            justification: "Estímulo neuromuscular controlado sin acumular fatiga residual.",
            workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "Z2_BASE", 85, phase),
            isRestDay: false,
          };
        }

        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Carrera",
          workoutName: "Series Umbral Stryd (4x6m @ 100% FTP)",
          action: "MANTENER",
          powerTarget: `${runFtp}W (100% CP)`,
          justification: "Estímulo de potencia crítica y tolerancia al lactato.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "THRESHOLD_INTERVALS", 100, phase),
          isRestDay: false,
        };
      }

      if (isLongRun && !isFatigued) {
        // En MANTENIMIENTO: Tirada controlada de 55m
        if (phase === "MAINTENANCE") {
          return {
            day,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            discipline: "Carrera",
            workoutName: "Rodaje Largo Aeróbico Z2 (55m)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.74)}W (74% CP)`,
            justification: "Consistencia aeróbica y economía de carrera sin castigo biomecánico excesivo.",
            workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 74, "MAINTENANCE"),
            isRestDay: false,
          };
        }

        // En TAPER / SEMANA DE CARRERA: 45m suave
        if (phase === "TAPER" || phase === "RACE_WEEK") {
          return {
            day,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            discipline: "Carrera",
            workoutName: "Rodaje Suave Puesta a Punto (45m)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
            justification: "Descarga de volumen para maximizar el TSB previo al objetivo.",
            workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 70, "TAPER"),
            isRestDay: false,
          };
        }

        // En BASE I / II: 70m
        if (phase === "BASE_1" || phase === "BASE_2") {
          return {
            day,
            date: dateInfo.date,
            formattedDate: dateInfo.formattedDate,
            discipline: "Carrera",
            workoutName: "Tirada Larga Base Aeróbica (70m)",
            action: "MANTENER",
            powerTarget: `${Math.round(runFtp * 0.75)}W (75% CP)`,
            justification: "Desarrollo mitocondrial y volumen controlado.",
            workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 75, phase),
            isRestDay: false,
          };
        }

        // En BUILD / PEAK (Específico Maratón)
        return {
          day,
          date: dateInfo.date,
          formattedDate: dateInfo.formattedDate,
          discipline: "Carrera",
          workoutName: phase === "PEAK"
            ? "Fondo Específico Maratón Stryd (1h45m)"
            : "Tirada Larga Progresiva Stryd (1h25m)",
          action: "MANTENER",
          powerTarget: `${Math.round(runFtp * 0.78)}W (78% CP)`,
          justification: "Desarrollo de durabilidad y potencia específica de competición.",
          workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "LONG_RUN", 85, phase),
          isRestDay: false,
        };
      }

      // Rodajes estándar entre semana
      return {
        day,
        date: dateInfo.date,
        formattedDate: dateInfo.formattedDate,
        discipline: "Carrera",
        workoutName: isFatigued
          ? "Rodaje Suave Z1 Regenerativo Stryd (35m)"
          : "Rodaje Progresivo Z1-Z2 Stryd (45m)",
        action: isFatigued ? "MODIFICAR" : "MANTENER",
        powerTarget: `${Math.round(runFtp * 0.70)}W (70% CP)`,
        justification: isFatigued
          ? "Atenuación a Z1 para proteger tono parasimpático y acelerar recuperación."
          : "Rodaje aeróbico base para consistencia de fitness.",
        workoutDoc: PhysiologicalEngine.generateWorkoutSyntax("Run", "RECOVERY", 70, phase),
        isRestDay: false,
      };
    });

    return {
      status: status.status,
      summaryHeadline: isFatigued
        ? `Fatiga acumulada (TSB: ${status.tsb}). Se modulan las cargas a intensidades suaves para acelerar la asimilación.`
        : `Estado adaptativo óptimo (${macroTitle}). Microciclo calibrado a ${macrocyclePhase?.weeklyTssTarget || "cargas moderadas"}.`,
      macrocyclePhase: macrocyclePhase?.phaseLabel,
      reasoningTree: [
        `1. Contexto de Temporada: ${macroTitle}`,
        `2. Restricción de Volumen: Duración máxima de tirada dominical = ${macrocyclePhase?.maxLongRunMinutes ?? 60} min (${macrocyclePhase?.isSpecificMarathonPhase ? "Fase específica de maratón activa" : "Fase sin fondos largos desgastantes"}).`,
        `3. Evaluación Banister: CTL=${status.ctl.toFixed(1)}, ATL=${status.atl.toFixed(1)}, TSB=${status.tsb.toFixed(1)}.`,
        `4. Tasa de incremento: Ramp Rate Semanal=${status.rampRate.toFixed(1)} pts/semana (${status.rampRate > 8 ? "Elevado" : "Seguro"}).`,
        `5. Matriz Base: ${Object.entries(availability).map(([d, disc]) => `${d}: ${disc}`).join(", ")}.`,
      ],
      modelUsed: "Motor Fisiológico Determinístico",
      suggestedPlan,
    };
  }
}
