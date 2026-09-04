import { AthleteProfile, AthleteWellness } from "../intervals/types";
import { PhysiologicalStatus } from "../physiology/engine";
import { MacrocyclePhaseInfo, MacrocycleBlueprint } from "../physiology/macrocycle";
import { WeeklyAvailabilityMap, PlanItem } from "../gemini/engine";
import { WizardPlanConfig } from "../physiology/macrocycleWizard";

export interface SpecializedAgentMeta {
  id: "headCoach" | "macrocycle" | "dailyAudit";
  title: string;
  name: string;
  badgeLabel: string;
  badgeColor: "amber" | "cyan" | "emerald";
  specialty: string;
  roleDescription: string;
  charCountTarget: string;
}

export const SPECIALIZED_AGENTS_METADATA: Record<string, SpecializedAgentMeta> = {
  headCoach: {
    id: "headCoach",
    title: "Agente 01: Head Coach Adaptativo & Prescripción en Vivo",
    name: "PULSE Live Coach",
    badgeLabel: "PULSE Live Coach",
    badgeColor: "amber",
    specialty: "Dictámenes de Cierre de Semana • Calibración por Viajes • Prescripción Stryd CP & FTP • Chat Interactivo",
    roleDescription: "Entrenador en jefe de élite especializado en modulación fisiológica adaptativa en tiempo real por telemetría HRV y TSB.",
    charCountTarget: "1200+ caracteres",
  },
  macrocycle: {
    id: "macrocycle",
    title: "Agente 02: Arquitecto de Macrociclos & Periodización Banister",
    name: "PULSE Macrocycle Architect",
    badgeLabel: "PULSE Macrocycle Architect",
    badgeColor: "cyan",
    specialty: "Diseño de Bloques Multimes • Modelado Banister 3:1 / 2:1 • Curvas de Fitness (CTL) y Fatiga (ATL)",
    roleDescription: "Diseñador estratégico de temporadas completas, periodización multimes y límites volumétricos de seguridad articular.",
    charCountTarget: "1400+ caracteres",
  },
  dailyAudit: {
    id: "dailyAudit",
    title: "Agente 03: Auditor Fisiológico Diario & Modulación por Fatiga",
    name: "PULSE Daily Physio Auditor",
    badgeLabel: "PULSE Daily Physio Auditor",
    badgeColor: "emerald",
    specialty: "Cumplimiento de Vatios • HRV rMSSD Z-Score Rolling • Sustitución Reactiva a Z1 / Descanso",
    roleDescription: "Auditor continuo de carga post-actividad y estado del sistema nervioso autónomo para reajuste inmediato de vatios.",
    charCountTarget: "1100+ caracteres",
  },
};

import { DEFAULT_PROMPTS, AgentPromptsLibrary } from "./defaultPrompts";
export { DEFAULT_PROMPTS, type AgentPromptsLibrary };

export interface HeadCoachPromptContext {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus;
  targetPlanningWeekNum: number;
  planningStartDateStr: string;
  planningEndDateStr: string;
  isInitialAudit: boolean;
  isCurrentWeek: boolean;
  todayDayName: string;
  todayDateStr: string;
  todayDayIndex: number;
  macrocyclePhase: MacrocyclePhaseInfo | null;
  weeklyAvailability: WeeklyAvailabilityMap;
  availabilityFormatted: string;
  currentPlanSummary: string;
  hasExistingPlan: boolean;
  plannedWeekTss: number;
  actualTss: number;
  compliancePct: number;
  targetMinTss: number;
  targetMaxTss: number;
  formDiagnostic: string;
  coachProfile: string;
  customPromptDirective?: string;
}

/**
 * Constructor SSOT para el Prompt de Sistema del Agente 01 (PULSE Live Coach)
 */
export function buildHeadCoachSystemPrompt(
  basePrompt: string = DEFAULT_PROMPTS.headCoachPrompt,
  ctx: HeadCoachPromptContext
): string {
  const {
    profile,
    physioStatus,
    targetPlanningWeekNum,
    planningStartDateStr,
    planningEndDateStr,
    isInitialAudit,
    isCurrentWeek,
    todayDayName,
    todayDateStr,
    todayDayIndex,
    macrocyclePhase,
    availabilityFormatted,
    currentPlanSummary,
    hasExistingPlan,
    plannedWeekTss,
    actualTss,
    compliancePct,
    targetMinTss,
    targetMaxTss,
    formDiagnostic,
    coachProfile,
    customPromptDirective,
  } = ctx;

  const directiveBlock = customPromptDirective?.trim()
    ? `\nDIRECTRICES PERSONALIZADAS ADICIONALES DEL ATLETA:\n${customPromptDirective.trim()}\n`
    : "";

  return `${basePrompt}

=== CONTEXTO TEMPORAL Y DE PLANIFICACIÓN DEL ATLETA ===
- Atleta: ${profile.name || "Atleta"}${profile.id ? ` (ID: ${profile.id})` : ""}
- Edad: ${profile.age ? `${profile.age} años` : "No especificada"} | Género: ${profile.gender === "F" ? "Femenino" : profile.gender === "M" ? "Masculino" : "No especificado"}
- Stryd CP (Potencia Carrera): ${profile.run_ftp ? `${profile.run_ftp} W` : "No configurado"}
- Bike FTP (Potencia Ciclismo): ${profile.bike_ftp ? `${profile.bike_ftp} W` : "No configurado"}
- Pulso en Reposo Base: ${profile.restingHR ? `${profile.restingHR} bpm` : "No configurado"} | FC Máx: ${profile.maxHR ? `${profile.maxHR} bpm` : "No configurada"} | LTHR: ${profile.lthr ? `${profile.lthr} bpm` : "No configurado"}
- Fecha Actual del Sistema: Hoy es ${todayDayName} (${todayDateStr})
- Semana en Evaluación: Semana ${isCurrentWeek ? "1 (Actual)" : "Histórica/Futura"}
- SEMANA OBJETIVO A PLANIFICAR: SEMANA ${targetPlanningWeekNum} (${planningStartDateStr} - ${planningEndDateStr})
- Modo de Auditoría: ${isInitialAudit ? "Auditoría de Cierre de Semana / Inicio de Chat" : "Conversación Interactiva de Adaptación"}
- Fase de Macrociclo Activa: ${macrocyclePhase?.phaseLabel || "Construcción Aeróbica"} (${macrocyclePhase?.suggestedFocus || "Desarrollo de Capacidad Aeróbica"})

=== TELEMETRÍA FISIOLÓGICA EN VIVO (INTERVALS.ICU) ===
- Forma Fisiológica (TSB): ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)} (${formDiagnostic})
- Aptitud Acumulada (CTL / Fitness): ${physioStatus.ctl.toFixed(1)}
- Fatiga Aguda (ATL): ${physioStatus.atl.toFixed(1)}
- Variabilidad Cardíaca (HRV): ${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "Estable"} (Rango para asimilación biológica)
- Ramp Rate Semanal: ${Number(physioStatus.rampRate || 0).toFixed(1)} CTL/semana
- Carga Ejecutada en Semana Previa: ${actualTss} TSS (${compliancePct}% de cumplimiento sobre ${plannedWeekTss} TSS previstos)
- Rango de Carga Prescrita para Semana ${targetPlanningWeekNum}: ~${targetMinTss}-${targetMaxTss} TSS
- Perfil del Entrenador: ${coachProfile.toUpperCase()}

=== DISPONIBILIDAD SEMANAL PROGRAMADA ===
${availabilityFormatted}

=== ESTADO DEL PLAN ACTUAL DE LA SEMANA ===
${hasExistingPlan ? `Plan Activo Cargado (${plannedWeekTss} TSS):\n${currentPlanSummary}` : "No hay plan estructurado previo. Se debe generar la propuesta completa."}
${directiveBlock}
=== INSTRUCCIONES DE EJECUCIÓN INMEDIATA ===
1. Si el atleta inicia el chat (${isInitialAudit ? "SÍ" : "NO"}), genera el dictamen fisiológico motivador de la semana previa y presenta la propuesta estructurada para la SEMANA ${targetPlanningWeekNum}.
2. Si el atleta solicita cambios por viaje o imprevistos, adapta estrictamente los días futuros (a partir de ${todayDayName} / día siguiente), asignando los días de viaje a Descanso y reubicando la carga en días disponibles.
3. Asegura que todas las sesiones de running incluyan su duración en minutos (ej. 45m, 60m), vatios a Stryd CP y TSS estimado. En ciclismo, vatios calculados a % Bike FTP.
4. Genera siempre un JSON válido y bien cerrado.`;
}

import { resolveTrainingModel } from "./knowledge";

export interface MacrocyclePromptContext {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus;
  config: WizardPlanConfig & {
    periodization?: string;
    trainingApproach?: string;
    targetDistance?: string;
    weeklyAvailability?: WeeklyAvailabilityMap;
  };
  customPromptDirective?: string;
}

/**
 * Constructor SSOT para el Prompt de Sistema del Agente 02 (PULSE Macrocycle Architect)
 */
export function buildMacrocycleArchitectSystemPrompt(
  basePrompt: string = DEFAULT_PROMPTS.macrocyclePrompt,
  ctx: MacrocyclePromptContext
): string {
  const { profile, physioStatus, config, customPromptDirective } = ctx;

  const curatedModel = resolveTrainingModel({
    targetDistance: config.targetDistance,
    raceDistance: config.raceDistance,
    athleteMoment: config.athleteMoment,
    trainingApproach: config.trainingApproach,
    raceName: config.raceName,
  });

  const directiveBlock = customPromptDirective?.trim()
    ? `\nDIRECTRICES PERSONALIZADAS DEL ATLETA:\n${customPromptDirective.trim()}\n`
    : "";

  const availabilityBlock = config.weeklyAvailability
    ? `\n=== MATRIZ SEMANAL DE DISPONIBILIDAD DEPORTIVA ===\n${Object.entries(config.weeklyAvailability)
        .map(([day, discs]) => `- ${day}: ${Array.isArray(discs) ? discs.join(" + ") : discs} ${Array.isArray(discs) && discs.length > 1 ? "(DOBLE SESIÓN: prescribir ambos estímulos)" : ""}`)
        .join("\n")}\n`
    : "";

  const testsBlock = curatedModel.mandatoryTests.length > 0
    ? `\n=== PROTOCOLOS DE TESTS FISIOLÓGICOS REQUERIDOS ===\n${curatedModel.mandatoryTests
        .map(
          (t) =>
            `- Semana ${t.recommendedWeekIndex}: ${t.testName} (${t.sport}, Métrica: ${t.targetMetric})\n  Pauta: ${t.protocolDescription}`
        )
        .join("\n")}\n`
    : "";

  return `${basePrompt}

=== MODELO CIENTÍFICO RECTOR APLICADO (GROUNDING CURADO) ===
- Metodología: ${curatedModel.displayName}
- Autores Científicos: ${curatedModel.scientificAuthors.join(" • ")}
- Pauta de Tirada Larga: ${curatedModel.longRunRules.description} (${curatedModel.longRunRules.targetIntensityPercentCpOrFtp})
- Entrenamiento Cruzado: ${curatedModel.crossTrainingRules.notes}

=== TELEMETRÍA Y UMBRALES BIOLÓGICOS DEL ATLETA (INTERVALS.ICU) ===
- Atleta: ${profile.name || "Atleta"}
- Edad: ${profile.age ? `${profile.age} años` : "No especificada"} | Género: ${profile.gender === "F" ? "Femenino" : profile.gender === "M" ? "Masculino" : "No especificado"}
- CTL Actual (Fitness): ${physioStatus.ctl.toFixed(1)} | ATL (Fatiga): ${physioStatus.atl.toFixed(1)} | TSB (Forma): ${physioStatus.tsb.toFixed(1)}
- Stryd Potencia Crítica (Run CP): ${profile.run_ftp ? `${profile.run_ftp} W` : "No configurado / Usar Ritmo"}
- Bike FTP: ${profile.bike_ftp ? `${profile.bike_ftp} W` : "No configurado / Usar RPE"}
- Frecuencia Cardíaca Umbral (LTHR): ${profile.lthr ? `${profile.lthr} bpm` : "No configurado"}

=== PARÁMETROS DEL PLAN RECTOR SOLICITADO POR EL ATLETA ===
- Evento / Desafío: ${config.hasRace || config.raceName ? `Competición (${config.raceName || "Carrera Objetivo"}, Distancia: ${config.targetDistance || config.raceDistance || "42.2k"})` : `Foco de Temporada (${config.athleteMoment || "Construcción de Base"})`}
- Fecha de la Carrera: ${config.raceDate || "No definida"}
- Semanas Totales Solicitadas: ${config.weeksCount || 16} semanas exactas
- Enfoque Deportivo: ${config.trainingApproach || "Entrenamiento Cruzado"}
- Estrategia de Asimilación: ${config.periodization === "2:1" ? "Ratio 2:1 Preventivo (2 sem carga : 1 sem descarga)" : config.periodization === "3:1" ? "Ratio 3:1 Clásico (3 sem carga : 1 sem descarga)" : "Progresión Continua"}
${availabilityBlock}${testsBlock}${directiveBlock}
=== INSTRUCCIONES DE RESPUESTA (FORMATO JSON) ===
Genera un análisis arquitectónico en JSON con:
- reasoningHeadline (Título estratégico claro y motivador)
- reasoningNotes (3 a 4 notas concisas de justificación metodológica según ${curatedModel.displayName})
- projectedPeakCtl (CTL pico proyectado al final de las ${config.weeksCount || 16} semanas)
- recommendedRampRate (Tasa de rampa recomendada en CTL/semana: ${curatedModel.banisterRampRateLimits.minCtlPerWeek}-${curatedModel.banisterRampRateLimits.maxCtlPerWeek} pts/sem)
- blueprint (Estructura semana a semana con fases, TSS target, microciclos modelo y semanas de test programadas). Si un día tiene 2 disciplinas en la matriz (ej. Carrera + Fuerza), DEBES contemplar la Doble Sesión completa (ambos entrenamientos) en el diseño de microciclos de ese día.`;
}

export interface DailyAuditPromptContext {
  profile: AthleteProfile;
  physioStatus: PhysiologicalStatus;
  yesterdayActivity?: {
    name: string;
    type: string;
    durationMinutes: number;
    actualTss: number;
    averageWatts?: number;
    plannedTss?: number;
  };
  morningHrv?: number;
  restingHr?: number;
  customPromptDirective?: string;
}

/**
 * Constructor SSOT para el Prompt de Sistema del Agente 03 (PULSE Daily Physio Auditor)
 */
export function buildDailyAuditSystemPrompt(
  basePrompt: string = DEFAULT_PROMPTS.dailyAuditPrompt,
  ctx: DailyAuditPromptContext
): string {
  const { profile, physioStatus, yesterdayActivity, morningHrv, restingHr, customPromptDirective } = ctx;

  const directiveBlock = customPromptDirective?.trim()
    ? `\nDIRECTRICES:\n${customPromptDirective.trim()}\n`
    : "";

  return `${basePrompt}

=== TELEMETRÍA BIOLÓGICA DIARIA ===
- Atleta: ${profile.name || "Atleta"}${profile.run_ftp ? ` (Stryd CP: ${profile.run_ftp}W)` : ""}${profile.bike_ftp ? ` (Bike FTP: ${profile.bike_ftp}W)` : ""}
- CTL: ${physioStatus.ctl.toFixed(1)} | ATL: ${physioStatus.atl.toFixed(1)} | TSB: ${physioStatus.tsb.toFixed(1)}
- HRV Matutino: ${morningHrv ?? physioStatus.currentHrv ?? 52} ms | Pulso Reposo: ${restingHr ?? profile.restingHR ?? 46} bpm
- Sesión de Ayer: ${yesterdayActivity ? `${yesterdayActivity.name} (${yesterdayActivity.type}, ${yesterdayActivity.durationMinutes}m, ${yesterdayActivity.actualTss} TSS vs ${yesterdayActivity.plannedTss || yesterdayActivity.actualTss} planificados)` : "Día de Descanso Pasivo"}
${directiveBlock}
=== INSTRUCCIONES DE AUDITORÍA ===
Evalúa si el atleta está en condiciones de asimilar la sesión de hoy o si se requiere sustitución por protección neuromuscular.`;
}
