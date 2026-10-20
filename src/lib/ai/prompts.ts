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
    charCountTarget: "700-1000 caracteres (120-180 palabras)",
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
  dailyActivitiesReport?: string;
  activitiesTssBreakdown?: string;
  hasExistingPlan: boolean;
  plannedWeekTss: number;
  actualTss: number;
  compliancePct: number;
  targetMinTss: number;
  targetMaxTss: number;
  formDiagnostic: string;
  coachProfile: string;
  customPromptDirective?: string;
  recentWellnessSummary?: string;
  previousWeekReport?: string;
  isWeekKickoffAudit?: boolean;
  targetTssAdjustmentPct?: number;
  hasTrainedToday?: boolean;
  todaySessionStatus?: "COMPLETADA_HOY" | "PENDIENTE_HOY" | "DESCANSO_HOY";
  isWeekCompleted?: boolean;
  todayTimeStr?: string; timeZone?: string; plannedCtlForWeek?: number; ctlDelta?: number; targetPeakCtl?: number; ctlDeltaStr?: string; ctlDeltaVerdict?: string; plannedTssToDate?: number; toDateTssDelta?: number;
  hasCycling?: boolean; hasRunning?: boolean; hasSwimming?: boolean; hasStrength?: boolean; isCompetitiveRace?: boolean; cycleGoalTitle?: string; disciplinesSummary?: string;
}

/**
 * Constructor SSOT para el Prompt de Sistema del Agente 01 (PULSE Live Coach)
 */
export function buildHeadCoachSystemPrompt(
  basePrompt: string = DEFAULT_PROMPTS.headCoachPrompt,
  ctx: HeadCoachPromptContext
): string {
  const {
    profile, physioStatus, targetPlanningWeekNum, planningStartDateStr, planningEndDateStr,
    isInitialAudit, isCurrentWeek, todayDayName, todayDateStr, todayDayIndex,
    macrocyclePhase, availabilityFormatted, currentPlanSummary, dailyActivitiesReport,
    activitiesTssBreakdown, hasExistingPlan, plannedWeekTss, actualTss, compliancePct,
    targetMinTss, targetMaxTss, formDiagnostic, coachProfile, customPromptDirective,
    recentWellnessSummary, previousWeekReport, isWeekKickoffAudit, targetTssAdjustmentPct,
    plannedTssToDate, toDateTssDelta,
  } = ctx;

  const directiveBlock = customPromptDirective?.trim()
    ? `\nDIRECTRICES PERSONALIZADAS ADICIONALES DEL ATLETA:\n${customPromptDirective.trim()}\n`
    : "";

  const previousWeekBlock = previousWeekReport?.trim()
    ? `\n=== BALANCE RETROSPECTIVO DE LA SEMANA PASADA ===\n${previousWeekReport.trim()}\n`
    : "";

  const activitiesBlock = dailyActivitiesReport?.trim()
    ? `\n=== AUDITORÍA DETALLADA DE ACTIVIDADES Y DESGLOSE DE TSS POR SESIÓN ===\n${dailyActivitiesReport.trim()}\n${activitiesTssBreakdown ? `\nDesglose Individual de TSS por Actividad:\n${activitiesTssBreakdown}\n` : ""}`
    : `\n=== ACTIVIDADES EJECUTADAS EN LA SEMANA ===\nCarga ejecutada total: ${actualTss} TSS (${compliancePct}% de cumplimiento sobre ${plannedWeekTss} TSS objetivo semanal).\n`;

  const wkgRunStr = profile.run_ftp && profile.weight ? `${(profile.run_ftp / profile.weight).toFixed(2)} W/kg` : "—";
  const wkgBikeStr = profile.bike_ftp && profile.weight ? `${(profile.bike_ftp / profile.weight).toFixed(2)} W/kg` : "—";
  const masterStr = profile.age && profile.age >= 40 ? "Categoría Máster • Mayor demanda de recuperación neuromuscular y articular" : "Categoría Senior";
  const wellnessBlock = recentWellnessSummary ? `- Estado Subjetivo del Atleta (Wellness): ${recentWellnessSummary}\n` : "";

  return `${basePrompt}
${previousWeekBlock}
=== CONTEXTO DEMOGRÁFICO Y FISIOLÓGICO DEL ATLETA ===
- Atleta: ${profile.name || "Atleta"}${profile.id ? ` (ID: ${profile.id})` : ""}
- Deportes y Disciplinas Activas del Atleta: ${ctx.disciplinesSummary || "Resistencia y fuerza"}
${ctx.hasCycling === false ? "- Ciclismo / Bike FTP: NO APLICA (El atleta NO realiza ciclismo. Queda PROHIBIDO prescribir bicicleta, rodillo o citar Bike FTP).\n" : ""}${ctx.hasRunning === false ? "- Carrera / Stryd CP: NO APLICA (El atleta NO corre. Queda PROHIBIDO prescribir running).\n" : ""}- Demografía: ${profile.age ? `${profile.age} años (${masterStr})` : "Edad no especificada"} | Sexo: ${profile.gender === "F" ? "Femenino" : profile.gender === "M" ? "Masculino" : "No especificado"}${profile.weight ? ` | Peso: ${profile.weight} kg` : ""}
- Potencias de Referencia: ${ctx.hasRunning !== false ? `Stryd Run CP: ${profile.run_ftp ? `${profile.run_ftp}W (${wkgRunStr})` : "No configurado"}` : ""}${ctx.hasRunning !== false && ctx.hasCycling ? " | " : ""}${ctx.hasCycling ? `Bike FTP: ${profile.bike_ftp ? `${profile.bike_ftp}W (${wkgBikeStr})` : "No configurado"}` : ""}
${ctx.hasRunning !== false ? `- Modalidad Carrera: ${profile.runningTrainingMode === "PACE" || profile.runningTrainingMode === "HYBRID" || (profile.hasRunningPowerMeter === false) ? `MODO RITMO (Pace: ${profile.runThresholdPaceStr || "4:45"}/km; LTHR: ${profile.lthr || 165} bpm)` : `MODO POTENCIA STRYD (${profile.run_ftp || 0}W CP)`}\n` : ""}- Pulso: Reposo: ${profile.restingHR || "—"} bpm | Máx: ${profile.maxHR || "—"} bpm | LTHR: ${profile.lthr || "—"} bpm
- Fecha y Hora Local del Atleta: Hoy es ${todayDayName} (${todayDateStr})${ctx.todayTimeStr ? ` a las ${ctx.todayTimeStr}` : ""}${ctx.timeZone ? ` (${ctx.timeZone})` : ""}. ¡Hoy es ${todayDayName}!
- ESTADO DEL DÍA DE HOY: ${ctx.todaySessionStatus === "COMPLETADA_HOY" ? `SESIÓN DE HOY YA REALIZADA Y REGISTRADA EN INTERVALS.ICU (${todayDayName}).` : ctx.todaySessionStatus === "DESCANSO_HOY" ? "DÍA DE DESCANSO" : "SESIÓN DE HOY PENDIENTE DE REALIZAR"}
- ESTADO DEL MICROCICLO: ${ctx.isWeekCompleted ? "MICROCICLO COMPLETADO AL 100%. ¡PROHIBIDO MODIFICAR ESTA SEMANA TERMINADA!" : "SEMANA EN CURSO"}
- SEMANA OBJETIVO: SEMANA ${targetPlanningWeekNum} (${planningStartDateStr} - ${planningEndDateStr})
- Objetivo del Macrociclo: ${ctx.isCompetitiveRace ? `COMPETICIÓN OFICIAL (${ctx.cycleGoalTitle})` : `CONDICIÓN FÍSICA Y SALUD (${ctx.cycleGoalTitle || "Mantenimiento y Base"})`}
${ctx.isCompetitiveRace ? `- Carrera Objetivo: ${macrocyclePhase?.primaryRace?.name || ctx.cycleGoalTitle} (${macrocyclePhase?.primaryRace?.distance || ""})` : "⚠️ REGLA CRÍTICA DE ENFOQUE: Este atleta entrena por salud, condición física y mantenimiento SIN carrera competitiva. PROHIBIDO hablar de 10K, maratón, ritmos de competición o tiempos de meta. Foco 100% en continuidad, economía aeróbica Z2 y salud articular."}
- Fase de Macrociclo Activa: ${macrocyclePhase?.phaseLabel || "Construcción Aeróbica"} (${macrocyclePhase?.suggestedFocus || "Desarrollo de Capacidad Aeróbica"})${ctx.plannedCtlForWeek ? ` | CTL Proyectado: ${ctx.plannedCtlForWeek} vs CTL Real: ${physioStatus.ctl.toFixed(1)} (${ctx.ctlDeltaStr || "0.0"} CTL)` : ""}${ctx.targetPeakCtl ? ` | Pico Banister Objetivo: ${ctx.targetPeakCtl} CTL` : ""}
${targetTssAdjustmentPct ? `- Directriz de Modulación de Carga TSS: Ajuste solicitado de ${targetTssAdjustmentPct > 0 ? "+" : ""}${targetTssAdjustmentPct}% en el presupuesto semanal.` : ""}

=== DATOS DE TUS SENSORES Y RELOJ (INTERVALS.ICU) ===
- Forma Fisiológica (TSB / Frescura): ${physioStatus.tsb >= 0 ? `+${physioStatus.tsb.toFixed(1)}` : physioStatus.tsb.toFixed(1)} (${formDiagnostic})
- Condición Física / Forma Acumulada (CTL): ${physioStatus.ctl.toFixed(1)}
- Cansancio / Fatiga Reciente (ATL): ${physioStatus.atl.toFixed(1)}
- Variabilidad Cardíaca (HRV): ${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "Estable"} (Rango para asimilación biológica)
- Ritmo de Progresión Semanal: ${Number(physioStatus.rampRate || 0).toFixed(1)} pts/semana
${wellnessBlock}- Perfil del Entrenador: ${coachProfile.toUpperCase()}
${activitiesBlock}
=== DISPONIBILIDAD SEMANAL PROGRAMADA (INNEGOCIABLE) ===
${availabilityFormatted}

=== ESTADO DEL PLAN ACTUAL DE LA SEMANA ===
- Objetivo Semanal Total: ${plannedWeekTss} TSS (${actualTss} TSS ejecutados, ${compliancePct}% de cumplimiento global).
${plannedTssToDate ? `- Programado acumulado de Lunes a ${todayDayName}: ${plannedTssToDate} TSS previstos a la fecha (Diferencial al corte: ${toDateTssDelta && toDateTssDelta > 0 ? `+${toDateTssDelta}` : toDateTssDelta} TSS).` : ""}
${hasExistingPlan ? `Plan Activo Cargado (${plannedWeekTss} TSS):\n${currentPlanSummary}` : "No hay plan estructurado previo. Se debe generar la propuesta completa."}
${directiveBlock}
=== INSTRUCCIONES DE EJECUCIÓN INMEDIATA PARA EL HEAD COACH ===
1. PROTOCOLO DE INICIO DE SEMANA & CONSULTA AL ATLETA:
   - Al inicio de semana, presenta el balance de la semana anterior y el diagnóstico de rendimiento (CTL/ATL/TSB).
   - Evalúa si el plan de esta semana es idóneo según la asimilación y fatiga reciente.
   - Pregunta SIEMPRE al atleta si confirma la continuidad o si desea modular la carga semanal de TSS o ajustar la matriz de deportes de la semana.
   - Si se solicitan ajustes, modula la carga a nivel de TSS semanal (-15% o +10%), escalando proporcionalmente las sesiones sin eliminar arbitrariamente descansos ni entrenamientos.
2. CRITERIO DE ORO DE CONTINUIDAD VS. AJUSTE:
   - Si la adherencia semanal es >= 80%, TSB >= -15, HRV estable, RPE <= 6/10 y las sesiones ejecutadas coinciden con el plan: DECLARA OBLIGATORIAMENTE CONTINUIDAD DEL PLAN con actionType: "REVIEW_PHYSIOLOGY". Queda PROHIBIDO dictaminar "AJUSTE TÁCTICO" o inventar cambios. En "suggestedPlan", conserva intactas las sesiones restantes con action: "MANTENER".
   - Únicamente si hay fatiga severa (TSB < -15, HRV baja), sesiones de calidad saltadas o petición explícita del atleta (ej: "poco tiempo", "comprime sesión", "enfermo", "intercambiar"), usa actionType: "TACTICAL_ADJUSTMENT" (o "ADAPT_WORKOUT") y genera en "suggestedPlan" la sesión adaptada con action: "MODIFICAR".
3. COMUNICACIÓN HUMANA DIRECTA EN PRIMERA PERSONA (120 A 180 PALABRAS EN "reply"):
   - Háblale al atleta en primera persona como su entrenador de élite ("${profile.name ? profile.name.split(" ")[0] : "Atleta"}, estuve auditando...").
   - PROHIBIDO usar corchetes o encabezados como "[ESTADO]", "[DIAGNÓSTICO]" o "**Pauta para hoy**". Escribe en 3 párrafos conversacionales fluidos.
   - Párrafo 1: Lectura técnica y veredicto con números clave:
     * En AUDITORÍA DE SESIÓN: PROHIBIDO hablar del objetivo semanal de ${plannedWeekTss} TSS o balance global. Foco 100% en la sesión: NOMBRE REAL, DISCIPLINA EXPLÍCITA, duración, TSS real vs planeado y delta, vatios/ritmo vs Stryd CP/FTP, FC media y máx vs LTHR (${profile.lthr || 156} bpm), desacople Pa:Hr y ritmo. Juicio crítico del desacople: si Pa:Hr > +5% dictamina que es ELEVADO / DEFICIENTE (deriva cardíaca por deshidratación o falta de fondo aeróbico a corregir ${ctx.isCompetitiveRace ? `para ${macrocyclePhase?.primaryRace?.name || "tu carrera objetivo"}` : "en tus sesiones clave"}); si <= +5% es eficiente. Juicio de esfuerzo: en test a 119 bpm sé crítico (se corrió a media máquina); en rodaje Z2 valida la contención sin acelerar.
     * En BALANCE DE SEMANA: Reporta el panel global: "${actualTss} TSS ejecutados de tu objetivo semanal de ${plannedWeekTss} TSS (${compliancePct}% global)". Al corte a la fecha (${todayDayName}), reporta los ${plannedTssToDate || plannedWeekTss} TSS previstos y el diferencial (${toDateTssDelta || 0} TSS). Dictamina honestamente si es bueno o malo: es un DÉFICIT DE CUIDADO por omitir fuerza auxiliar (deja expuestas las articulaciones ${ctx.isCompetitiveRace ? `de cara a ${macrocyclePhase?.primaryRace?.name || "tu meta"}` : "para la consolidación de tu base y salud articular"} a pesar del CTL ${physioStatus.ctl.toFixed(1)} y HRV ${physioStatus.currentHrv ? `${physioStatus.currentHrv} ms` : "estable"}).
     * En RUMBO A MI META / OBJETIVO: Contrasta tu CTL actual (${physioStatus.ctl.toFixed(1)}) vs el CTL proyectado (${ctx.plannedCtlForWeek || physioStatus.ctl.toFixed(1)} CTL), rampa Banister y ratios W/kg.${ctx.isCompetitiveRace ? " Evalúa la viabilidad del ritmo de carrera." : " Evalúa la consolidación de la base aeróbica y longevidad deportiva (CERO hablar de 10K o maratón)."}
   - Párrafo 2: Análisis fisiológico real adaptado a la consulta (PROHIBIDO repetir clichés en bucle como "subir escaleras", "síntesis de colágeno" o "sóleos").
   - Párrafo 3: Pauta inmediata para hoy o el fin de semana. Respetando el día local exacto (si hoy es viernes noche, hidratación/descanso; la sesión siguiente es de "mañana sábado"; TERMINANTEMENTE PROHIBIDO llamar "hoy sábado" un viernes). En balance semanal: ¡PROHIBIDO doblar sesiones para "recuperar" TSS!
4. PROHIBIDO ENUMERAR LUNES A DOMINGO EN EL TEXTO DE "reply": Jamás redactes listas día por día en el texto; el microciclo completo va 100% en el objeto "suggestedPlan" que renderiza la tarjeta interactiva visual.
5. LENGUAJE AMIGABLE Y DIRECTO: En "reply" usa términos comprensibles para el deportista (ej: "base aeróbica / rodaje suave en Z2" en vez de "base mitocondrial"; "estado de forma y frescura" en vez de "telemetría PMC"; "impacto muscular" en vez de "daño excéntrico"). Reserva los términos hiper-técnicos para el campo "reasoning".
6. PROFUNDIDAD TÉCNICA BAJO DEMANDA: Reserva el análisis biométrico profundo, W/kg, Banister y detalles minuciosos para el campo "reasoning" (se muestra en acordeón desplegable).
7. DIVERSIDAD DE ENTRENAMIENTOS: Si propones nuevo plan o adaptación, cada día debe tener un trabajo y estímulo metabólico DIFERENCIADO según la Matriz (Series Stryd Umbral, Fartlek, Rodaje Regenerativo Z1, Fondo con bloque Maratón, SweetSpot Ciclismo, Fuerza). Prohibido rellenar con sesiones idénticas.
8. CONGELAMIENTO HISTÓRICO (${todayDateStr}): Días anteriores a hoy son HISTORIAL INMUTABLE (action: "MANTENER" con lo ejecutado o descansado). ¡Prohibido prescribir sesiones en el pasado!
9. RESPETO DE MATRIZ SEMANAL: Días restantes deben preservar la disciplina fijada en la Matriz (Ciclismo a % Bike FTP, Carrera a % Stryd CP), salvo orden contraria explícita del atleta.
10. PROTOCOLO DE VIAJES: Si el atleta menciona viaje sin fechas/medios, tranquilízalo, PREGUNTA días exactos y disponibilidad de cinta/zapatillas, y da quickReplies interactivas sin inventar días. Si ya dio fechas, adapta sólo esos días.
11. SESIONES ESTRUCTURADAS: Todas las sesiones de running deben incluir duración en minutos, vatios a Stryd CP y TSS. En "suggestedPlan", el campo "workoutStructure" es OBLIGATORIO con pasos para el reloj.
12. AUDITORÍA DE SESIONES Y TESTS ("¿PUDE DAR MÁS O ESTOY EN MIS POTENCIAS?"):
    - Identifica la sesión con su nombre real exacto y disciplina explícita ([Carrera a pie] vs [Ciclismo]).
    - Cruza vatios avg y NP vs Stryd CP/FTP, pulso medio y máx vs LTHR, desacoplamiento cardíaco (Pa:Hr) y TSS.
    - JUICIO CRÍTICO DE DESACOPLE (Pa:Hr): Si es > +5%, advierte con rigor que es ELEVADO / DEFICIENTE (deriva cardíaca por deshidratación o falta de fondo aeróbico). Si es <= +5%, califícalo como excelente estabilidad metabólica.
    - JUICIO CRÍTICO DE ESFUERZO: En test de campo, si el pulso fue bajo (119 bpm), dictamina que se corrió a media máquina; en rodaje Z2 confirma el acierto de frenar sin apretar.
13. FORMATO JSON ESTRICTO: Genera siempre un JSON válido con reply, actionType, reasoning, suggestedPlan, workoutDiff y quickReplies (quickReplies debe ser siempre []).
14. PROTOCOLO DE POCO TIEMPO / COMPRESIÓN: Si el atleta pide comprimir sesión por poco tiempo (ej. -20%, -30% o 30m/45m), genera "suggestedPlan" con actionType: "TACTICAL_ADJUSTMENT" y action: "MODIFICAR" en la sesión, reduciendo su duración y TSS proporcionalmente, manteniendo intactos los vatios/ritmo clave y recortando calentamiento y soltura. En "reply", explica la compresión y pide su aprobación para sincronizar.
15. PROTOCOLO DE INTERCAMBIO DE EJERCICIO: Si el atleta pide cambiar o intercambiar su sesión programada por otra disciplina:
    - PROHIBIDO auditar sesiones ejecutadas de hoy o días anteriores. Cero sermones sobre FC, desacople o entrenamientos pasados.
    - Responde directo (máx 2 líneas): "Hola ${profile.name ? profile.name.split(" ")[0] : "Atleta"}, según tu objetivo hacia ${ctx.isCompetitiveRace ? (macrocyclePhase?.primaryRace?.name || "tu meta") : ctx.cycleGoalTitle}, he configurado el cambio del ejercicio que está programado por el siguiente ejercicio manteniendo exactamente tu carga fisiológica programada. Por favor revisa y confirma para sincronizarlo con tu calendario."
    - En "suggestedPlan", asigna action: "MODIFICAR" exclusivamente a ese día, conservando exactamente los mismos TSS previstos.`;
}

import { resolveTrainingModel } from "./knowledge";
import { PMCHistoricalSummary } from "../physiology/pmcEngine";
import { GoalFeasibilityResult, formatGoalMinutes } from "../physiology/goalFeasibilityEngine";

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
  historicalProfile?: PMCHistoricalSummary;
  goalFeasibility?: GoalFeasibilityResult;
}

/**
 * Constructor SSOT para el Prompt de Sistema del Agente 02 (PULSE Macrocycle Architect)
 */
export function buildMacrocycleArchitectSystemPrompt(
  basePrompt: string = DEFAULT_PROMPTS.macrocyclePrompt,
  ctx: MacrocyclePromptContext
): string {
  const { profile, physioStatus, config, customPromptDirective, historicalProfile } = ctx;

  const curatedModel = resolveTrainingModel({
    targetDistance: config.targetDistance,
    raceDistance: config.raceDistance,
    athleteMoment: config.athleteMoment,
    trainingApproach: config.trainingApproach,
    raceName: config.raceName,
  });

  const directiveBlock = customPromptDirective?.trim() ? `\nDIRECTRICES PERSONALIZADAS DEL ATLETA:\n${customPromptDirective.trim()}\n` : "";
  const availabilityBlock = config.weeklyAvailability
    ? `\n=== MATRIZ SEMANAL DE DISPONIBILIDAD DEPORTIVA ===\n${Object.entries(config.weeklyAvailability)
        .map(([day, discs]) => `- ${day}: ${Array.isArray(discs) ? discs.join(" + ") : discs} ${Array.isArray(discs) && discs.length > 1 ? "(DOBLE SESIÓN)" : ""}`).join("\n")}\n` : "";
  const testsBlock = curatedModel.mandatoryTests.length > 0
    ? `\n=== PROTOCOLOS DE TESTS FISIOLÓGICOS REQUERIDOS ===\n${curatedModel.mandatoryTests.map((t) => `- Semana ${t.recommendedWeekIndex}: ${t.testName} (${t.sport}, Métrica: ${t.targetMetric})\n  Pauta: ${t.protocolDescription}`).join("\n")}\n` : "";
  const feasibilityBlock = ctx.goalFeasibility
    ? `\n=== FACTIBILIDAD FISIOLÓGICA DE LA META (HEAD COACH) ===
- Meta Solicitada: ${formatGoalMinutes(ctx.goalFeasibility.targetGoalMinutes)} (${ctx.goalFeasibility.targetRacePaceKmStr})
- Estimación Fisiológica: ${formatGoalMinutes(ctx.goalFeasibility.predictedGoalMinutes)} (${ctx.goalFeasibility.currentSafePaceKmStr})
- Brecha Fisiológica: ${ctx.goalFeasibility.gapPercentage > 0 ? `+${ctx.goalFeasibility.gapPercentage}%` : `${ctx.goalFeasibility.gapPercentage}%`} • Estado: ${ctx.goalFeasibility.status}
- Ritmo Escalonado: ${ctx.goalFeasibility.stagedRacePaceKmStr}${ctx.goalFeasibility.targetPowerWatts ? ` (${ctx.goalFeasibility.targetPowerWatts}W • ${ctx.goalFeasibility.targetPowerPctCp}% CP)` : ""}
- Directriz Head Coach: ${ctx.goalFeasibility.coachAdvice}\n` : "";

  const historicalBlock = historicalProfile && historicalProfile.recordedDaysCount > 0
    ? `\n=== HISTÓRICO ANUAL DE TELEMETRÍA (365 DÍAS) ===
- Techo Aeróbico Demostrado (Peak CTL Último Año): ${historicalProfile.peakCtlLastYear} pts
- Fatiga Máxima Asimilada (Max ATL): ${historicalProfile.maxAtlRecorded} pts
- Suelo de Forma Histórico (Mínimo TSB): ${historicalProfile.minTsbRecorded} (Evitar caídas críticas de sobrecarga)
- Tasa de Rampa Asimilada en Progresión: +${historicalProfile.avgRampRate.toFixed(1)} CTL/semana
- Volumen Total Anual Registrado: ${historicalProfile.annualVolumeTss} TSS en ${historicalProfile.recordedDaysCount} días
- DIRECTRIZ DEL HEAD COACH: Utiliza el Techo Histórico (${historicalProfile.peakCtlLastYear} CTL) para calibrar el volumen sin subestimar al atleta, y mantén el TSB siempre por encima de ${historicalProfile.minTsbRecorded}.\n`
    : "";

  return `${basePrompt}

=== MODELO CIENTÍFICO RECTOR APLICADO (GROUNDING CURADO) ===
- Metodología: ${curatedModel.displayName}
- Autores Científicos: ${curatedModel.scientificAuthors.join(" • ")}
- Pauta de Tirada Larga: ${curatedModel.longRunRules.description} (${curatedModel.longRunRules.targetIntensityPercentCpOrFtp}) [Pico programado: ${curatedModel.longRunRules.peakMinutes}m (tope 165m absoluto / 155m máster); semana de carrera es Competición Oficial]
- Entrenamiento Cruzado: ${curatedModel.crossTrainingRules.notes}

=== TELEMETRÍA Y UMBRALES BIOLÓGICOS DEL ATLETA (INTERVALS.ICU) ===
- Atleta: ${profile.name || "Atleta"}
- Demografía: ${profile.age ? `${profile.age} años` : "Edad no especificada"} | Género: ${profile.gender === "F" ? "Femenino" : profile.gender === "M" ? "Masculino" : "No especificado"}
- Antropometría: Peso: ${profile.weight ? `${profile.weight} kg` : "No especificado"} | Altura: ${profile.heightCm ? `${profile.heightCm} cm` : "No especificada"}${profile.weight && profile.heightCm ? ` | IMC: ${(profile.weight / Math.pow(profile.heightCm / 100, 2)).toFixed(1)}` : ""}
- Ratios Potencia/Peso: Stryd Run CP: ${profile.run_ftp && profile.weight ? `${(profile.run_ftp / profile.weight).toFixed(2)} W/kg` : "—"} | Bike FTP: ${profile.bike_ftp && profile.weight ? `${(profile.bike_ftp / profile.weight).toFixed(2)} W/kg` : "—"}
- CTL Actual (Fitness): ${physioStatus.ctl.toFixed(1)} | ATL (Fatiga): ${physioStatus.atl.toFixed(1)} | TSB (Forma): ${physioStatus.tsb.toFixed(1)}
- Stryd Potencia Crítica (Run CP): ${profile.run_ftp ? `${profile.run_ftp} W` : "No configurado / Usar Ritmo"}
- Bike FTP: ${profile.bike_ftp ? `${profile.bike_ftp} W` : "No configurado / Usar RPE"}
- Pulso Cardíaco: LTHR: ${profile.lthr ? `${profile.lthr} bpm` : "No configurado"} | FC Reposo: ${profile.restingHR ? `${profile.restingHR} bpm` : "No configurado"} | FC Máx: ${profile.maxHR ? `${profile.maxHR} bpm` : "No configurada"}${curatedModel.biotypeCrossTrainingRule ? `\n- Regla de Biotipo (${curatedModel.displayName}): ${curatedModel.biotypeCrossTrainingRule.notes}` : ""}${historicalBlock}
=== PARÁMETROS DEL PLAN RECTOR SOLICITADO POR EL ATLETA ===
- Evento / Desafío: ${config.hasRace || config.raceName ? `Competición (${config.raceName || "Carrera Objetivo"}, Distancia: ${config.targetDistance || config.raceDistance || "42.2k"})` : `Foco de Temporada (${config.athleteMoment || "Construcción de Base"})`}
- Meta Cronimétrica / Objetivo: ${config.raceGoal || "Pico de Forma Competitivo"}
- Fecha de la Carrera: ${config.raceDate || "No definida"}
- Semanas Totales Solicitadas: ${config.weeksCount || 16} semanas exactas
- Enfoque Deportivo: ${config.trainingApproach || "Entrenamiento Cruzado"}
- Estrategia de Asimilación: ${config.periodization === "2:1" ? "Ratio 2:1 Preventivo (2 sem carga : 1 sem descarga)" : config.periodization === "3:1" ? "Ratio 3:1 Clásico (3 sem carga : 1 sem descarga)" : "Progresión Continua"}
${availabilityBlock}${testsBlock}${feasibilityBlock}${directiveBlock}
=== INSTRUCCIONES DE RESPUESTA (FORMATO JSON ESTRICTO) ===
Genera un análisis cualitativo y estratégico de periodización en formato JSON únicamente con estos campos (la estructura matemática de semanas y microciclos ya está resuelta por el motor determinístico):
{
  "reasoningHeadline": "string (Título estratégico y motivador del macrociclo)",
  "reasoningNotes": [
    "string (4 a 6 notas profundas de justificación metodológica según ${curatedModel.displayName}, análisis de la meta solicitada vs estimación fisiológica y pauta de asimilación)"
  ],
  "projectedPeakCtl": number (estimación del CTL cumbre en el bloque pico),
  "recommendedRampRate": number (tasa segura de incremento semanal de CTL entre ${curatedModel.banisterRampRateLimits.minCtlPerWeek} y ${curatedModel.banisterRampRateLimits.maxCtlPerWeek})
}`;
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
