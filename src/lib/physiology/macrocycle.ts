import { MacrocycleDistanceType } from "./macrocycleLibrary";

export interface TargetRace {
  id: string;
  name: string; // e.g. "Maratón de Valencia", "Media Maratón de Bogotá"
  date: string; // "YYYY-MM-DD"
  distance: MacrocycleDistanceType;
  priority: "A" | "B" | "C"; // A: Principal (Rige Macrociclo), B: Test/Ajuste, C: Entrenamiento
  goalTarget?: string; // e.g. "Sub-3h00m", "275W Stryd", "Completar"
}

export type MacrocyclePhaseType =
  | "MAINTENANCE"
  | "PRE_SEASON_MAINTENANCE"
  | "BASE_1"
  | "BASE_2"
  | "BUILD"
  | "PEAK"
  | "TAPER"
  | "RACE_WEEK"
  | "RECOVERY";

export type MicrocycleType =
  | "CARGA"
  | "DESCARGA_ASIMILACION"
  | "IMPACTO_CHOQUE"
  | "TAPER"
  | "COMPETICION"
  | "MANTENIMIENTO"
  | "TEST_CONTROL"
  | "CIERRE_PLAN";

export interface MacrocycleWeek {
  weekNumber: number; // 1 a 16
  countdownWeeks: number; // 16 a 1
  startDate: string; // "YYYY-MM-DD" (Lunes)
  endDate: string; // "YYYY-MM-DD" (Domingo)
  formattedRange: string; // "17 Ago - 23 Ago"
  phase: MacrocyclePhaseType;
  phaseLabel: string;
  microcycleType: MicrocycleType;
  microcycleLabel: string;
  microcycleBadgeColor: string;
  targetTss: number;
  maxLongRunMinutes: number;
  focusDescription: string;
  isCurrentWeek: boolean;
  isPastWeek?: boolean;
  isFutureWeek?: boolean;
  milestone?: string;
  isRecoveryWeek?: boolean;
}

export interface MacrocycleBlueprint {
  mode: "MARATHON_SPECIFIC" | "PRE_SEASON_MAINTENANCE" | "GENERAL_MAINTENANCE";
  cycleTitle: string;
  cycleSubtitle?: string;
  primaryRace: TargetRace | null;
  startDate: string;
  raceDate: string | null;
  weeksUntilKickoff: number | null;
  totalWeeks: number;
  currentWeekIndex: number;
  currentWeek: MacrocycleWeek;
  weeks: MacrocycleWeek[];
  /** Snapshot de la Matriz Semanal del Atleta al momento de crear el plan */
  availabilitySnapshot?: Record<string, string | string[]>;
  /** Tipo de distancia/disciplina que rige los modelos de microciclo */
  distanceType?: string;
  /** CTL del atleta en el momento de generación (para auditoría y escalado) */
  athleteCtlAtCreation?: number;
}


export interface SeasonPlanItem {
  id: string;
  planName: string;
  goalType: string;
  blueprint: MacrocycleBlueprint;
  startDate: string; // "YYYY-MM-DD" (Lunes)
  endDate: string; // "YYYY-MM-DD" (Domingo)
  totalWeeks: number;
  status: "COMPLETED" | "ACTIVE" | "UPCOMING";
  orderIndex: number;
  linkedRaceId?: string;
  createdAt: string;
}

export interface MacrocyclePhaseInfo {
  phase: MacrocyclePhaseType;
  phaseLabel: string;
  cycleBadgeLabel: string; // "🔵 CICLO ACTIVO: MANTENIMIENTO" vs "🏃 CICLO ACTIVO: MARATÓN"
  cycleBadgeColor: string;
  weeksRemaining: number | null;
  daysRemaining: number | null;
  primaryRace: TargetRace | null;
  guideline: string;
  suggestedFocus: string;
  badgeColor: string;
  maxLongRunMinutes: number;
  isSpecificMarathonPhase: boolean;
  weeklyTssTarget: string;
  blueprint?: MacrocycleBlueprint;
}

/**
 * Calcula el estado de un plan en base a su rango de fechas y la fecha viva de hoy.
 */
export function calculatePlanStatus(
  startDateStr: string,
  endDateStr: string,
  baseDate: Date = new Date()
): "COMPLETED" | "ACTIVE" | "UPCOMING" {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(endDateStr + "T23:59:59");

  if (today > end) return "COMPLETED";
  if (today < start) return "UPCOMING";
  return "ACTIVE";
}

/**
 * Obtiene el lunes inmediatamente posterior a una fecha dada para encadenamiento sin superposición.
 */
export function getNextMondayAfterDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  // Si ya es domingo (0), el día siguiente es lunes (+1). Si no, días hasta el próximo lunes: (8 - day) % 7 o (1 + (7 - day))
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilNextMonday);
  return d.toISOString().split("T")[0];
}

/**
 * Obtiene el lunes de una fecha dada
 */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatRange(start: Date, end: Date): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
}

/**
 * Genera el Macrociclo Completo semana a semana (Plan Rector) con periodización 3:1 (Carga vs Descarga).
 */
export function generateMacrocycleBlueprint(
  races: TargetRace[] = [],
  baseDate: Date = new Date()
): MacrocycleBlueprint | null {
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(now);

  const futureRaces = races
    .filter((r) => {
      const raceDate = new Date(r.date);
      raceDate.setHours(0, 0, 0, 0);
      return raceDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const primaryRace = futureRaces.find((r) => r.priority === "A") || futureRaces[0] || null;

  // CASO 1: SIN CARRERA PRINCIPAL (Cero Absoluto)
  if (!primaryRace) {
    return null;
  }

  // CASO 2: CON CARRERA OBJETIVO
  const totalPrepWeeks = 16;
  const raceDateObj = new Date(primaryRace.date);
  const raceMonday = getMonday(raceDateObj);

  // Fecha de inicio del ciclo específico de 16 semanas
  const kickoffMonday = new Date(raceMonday);
  kickoffMonday.setDate(raceMonday.getDate() - (totalPrepWeeks - 1) * 7);

  const diffMs = raceDateObj.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(daysRemaining / 7);

  // 2A: SI HOY ES ANTES DE LA FECHA DE INICIO DEL CICLO DE 16 SEMANAS -> MANTENIMIENTO PRE-CARRERA
  if (currentMonday.getTime() < kickoffMonday.getTime() || weeksRemaining > 16) {
    const diffToKickoffMs = kickoffMonday.getTime() - currentMonday.getTime();
    const weeksUntilKickoff = Math.ceil(diffToKickoffMs / (1000 * 60 * 60 * 24 * 7));

    const totalWeeks = Math.max(8, weeksUntilKickoff + 4);
    const weeks: MacrocycleWeek[] = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekMon = new Date(currentMonday);
      weekMon.setDate(currentMonday.getDate() + i * 7);
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);

      const isRecovery = (i + 1) % 4 === 0;
      const isCurrent = i === 0;
      const isKickoffWeek = weekMon.getTime() === kickoffMonday.getTime();

      weeks.push({
        weekNumber: i + 1,
        countdownWeeks: weeksUntilKickoff - i,
        startDate: formatDate(weekMon),
        endDate: formatDate(weekSun),
        formattedRange: formatRange(weekMon, weekSun),
        phase: "PRE_SEASON_MAINTENANCE",
        phaseLabel: "Mantenimiento Pre-Maratón",
        microcycleType: isKickoffWeek ? "CARGA" : isRecovery ? "DESCARGA_ASIMILACION" : "MANTENIMIENTO",
        microcycleLabel: isKickoffWeek
          ? "🚀 KICKOFF MARATÓN (Sem 1/16)"
          : isRecovery
          ? "Asimilación / Descarga (3:1)"
          : "Mantenimiento Aeróbico",
        microcycleBadgeColor: isKickoffWeek
          ? "bg-amber-500/25 text-amber-300 border-amber-500/40 font-bold"
          : isRecovery
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : "bg-slate-800 text-slate-300 border-slate-700",
        targetTss: isRecovery ? 260 : 330,
        maxLongRunMinutes: isRecovery ? 45 : 55,
        focusDescription: isKickoffWeek
          ? `¡Inicio oficial del ciclo específico de 16 semanas para ${primaryRace.name}!`
          : isRecovery
          ? "Descarga de volumen y asimilación biológica para refrescar el TSB."
          : `Mantenimiento de fitness (CTL) y salud articular hasta iniciar el ciclo de 16 semanas el ${formatDate(kickoffMonday)}.`,
        isCurrentWeek: isCurrent,
      });
    }

    return {
      mode: "PRE_SEASON_MAINTENANCE",
      cycleTitle: `Ciclo de Mantenimiento Pre-${primaryRace.name}`,
      primaryRace,
      startDate: formatDate(kickoffMonday),
      raceDate: primaryRace.date,
      weeksUntilKickoff,
      totalWeeks,
      currentWeekIndex: 0,
      currentWeek: weeks[0],
      weeks,
    };
  }

  // 2B: DENTRO DE LAS 16 SEMANAS -> PLAN ESPECÍFICO DE MARATÓN ACTIVO
  const weeks: MacrocycleWeek[] = [];
  let currentWeekIndex = 0;

  for (let i = 0; i < totalPrepWeeks; i++) {
    const weekMon = new Date(kickoffMonday);
    weekMon.setDate(kickoffMonday.getDate() + i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const countdown = totalPrepWeeks - i;
    const weekNumber = i + 1;

    let phase: MacrocyclePhaseType = "BASE_1";
    let phaseLabel = "Base Aeróbica I";
    let microType: MicrocycleType = "CARGA";
    let microLabel = "Microciclo de Carga";
    let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    let targetTss = 360;
    let maxLongRun = 65;
    let focus = "Consistencia y acondicionamiento muscular base.";

    if (countdown === 1) {
      phase = "RACE_WEEK";
      phaseLabel = "Semana de Competición";
      microType = "COMPETICION";
      microLabel = "🏆 Competición Objetivo";
      badgeColor = "bg-amber-500/25 text-amber-300 border-amber-500/40";
      targetTss = 180;
      maxLongRun = 25;
      focus = "Máxima frescura neuromuscular, recarga de glucógeno y ritmo de carrera.";
    } else if (countdown <= 3) {
      phase = "TAPER";
      phaseLabel = "Tapering & Puesta a Punto";
      microType = "TAPER";
      microLabel = "Puesta a Punto (-40% Vol)";
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
      targetTss = countdown === 2 ? 240 : 280;
      maxLongRun = countdown === 2 ? 45 : 55;
      focus = "Puesta a punto (Taper): bajamos los kilómetros manteniendo toques de chispa para llegar descansado y muy rápido al día de la carrera.";
    } else if (countdown <= 6) {
      phase = "PEAK";
      phaseLabel = "Pico de Forma & Fondos Específicos";
      const isPeakRecovery = countdown === 4;
      microType = isPeakRecovery ? "DESCARGA_ASIMILACION" : "IMPACTO_CHOQUE";
      microLabel = isPeakRecovery ? "Descarga de Asimilación (3:1)" : "🔥 Impacto / Fondo Clave";
      badgeColor = isPeakRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-orange-500/25 text-orange-300 border-orange-500/40";
      targetTss = isPeakRecovery ? 380 : 540;
      maxLongRun = isPeakRecovery ? 90 : 165;
      focus = isPeakRecovery
        ? "Asimilación estratégica: descanso prioritario para consolidar las adaptaciones de los fondos clave."
        : "Máxima preparación: tiradas largas con tramos al ritmo objetivo de tu carrera para ganar confianza y ritmo.";
    } else if (countdown <= 12) {
      phase = "BUILD";
      phaseLabel = "Construcción Específica & Umbral";
      const isBuildRecovery = countdown === 8 || countdown === 12;
      microType = isBuildRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isBuildRecovery ? "Descarga / Asimilación (3:1)" : "Construcción & Umbral";
      badgeColor = isBuildRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      targetTss = isBuildRecovery ? 340 : 470;
      maxLongRun = isBuildRecovery ? 75 : 135;
      focus = isBuildRecovery
        ? "Recuperación estratégica: soltamos piernas y recargamos energía antes del siguiente bloque de intensidad."
        : "Ritmo de carrera y potencia: series a ritmo exigente y aumento gradual de la distancia en la tirada larga del fin de semana.";
    } else {
      phase = countdown > 14 ? "BASE_1" : "BASE_2";
      phaseLabel = countdown > 14 ? "Base Aeróbica I" : "Base Aeróbica II";
      const isBaseRecovery = countdown === 13;
      microType = isBaseRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isBaseRecovery ? "Descarga / Asimilación" : "Base & Resistencia";
      badgeColor = isBaseRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-teal-500/20 text-teal-300 border-teal-500/30";
      targetTss = isBaseRecovery ? 300 : 410;
      maxLongRun = isBaseRecovery ? 55 : 75;
      focus = isBaseRecovery
        ? "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas."
        : "Construcción de base aeróbica: carreras continuas suaves y repeticiones cortas en cuesta para ganar fuerza y resistencia en las piernas.";
    }

    const isCurrent = currentMonday.getTime() === weekMon.getTime();
    if (isCurrent) currentWeekIndex = i;

    weeks.push({
      weekNumber,
      countdownWeeks: countdown,
      startDate: formatDate(weekMon),
      endDate: formatDate(weekSun),
      formattedRange: formatRange(weekMon, weekSun),
      phase,
      phaseLabel,
      microcycleType: microType,
      microcycleLabel: microLabel,
      microcycleBadgeColor: badgeColor,
      targetTss,
      maxLongRunMinutes: maxLongRun,
      focusDescription: getCleanFocusDescription(focus, phase, microType === "DESCARGA_ASIMILACION"),
      isCurrentWeek: isCurrent,
    });
  }

  return {
    mode: "MARATHON_SPECIFIC",
    cycleTitle: "Ciclo de Preparación Específica de Maratón",
    primaryRace,
    startDate: weeks[0].startDate,
    raceDate: primaryRace.date,
    weeksUntilKickoff: 0,
    totalWeeks: totalPrepWeeks,
    currentWeekIndex,
    currentWeek: weeks[currentWeekIndex] || weeks[0],
    weeks,
  };
}

/**
 * Calcula la fase del macrociclo y la cuenta regresiva a partir de las carreras configuradas.
 */
export function calculateMacrocyclePhase(
  races: TargetRace[] = [],
  baseDate: Date = new Date()
): MacrocyclePhaseInfo | null {
  const blueprint = generateMacrocycleBlueprint(races, baseDate);
  if (!blueprint) {
    return null;
  }

  const currentWeek = blueprint.currentWeek;
  const primaryRace = blueprint.primaryRace;

  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);

  if (!primaryRace) {
    return null;
  }

  const raceDate = new Date(primaryRace.date);
  raceDate.setHours(0, 0, 0, 0);
  const diffTime = raceDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(daysRemaining / 7);

  const isPreSeason = blueprint.mode === "PRE_SEASON_MAINTENANCE";
  const isMarathonActive = blueprint.mode === "MARATHON_SPECIFIC";

  const cycleBadgeLabel = isPreSeason
    ? `🔵 CICLO ACTIVO: MANTENIMIENTO PRE-MARATÓN`
    : isMarathonActive
    ? `🏃 CICLO ACTIVO: MARATÓN (${currentWeek.phaseLabel})`
    : `🔵 CICLO ACTIVO: MANTENIMIENTO`;

  const cycleBadgeColor = isPreSeason
    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
    : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  return {
    phase: currentWeek.phase,
    phaseLabel: isPreSeason ? "Mantenimiento Pre-Maratón" : currentWeek.phaseLabel,
    cycleBadgeLabel,
    cycleBadgeColor,
    weeksRemaining,
    daysRemaining,
    primaryRace,
    guideline: currentWeek.focusDescription,
    suggestedFocus: isPreSeason
      ? `En Mantenimiento (Tirada 55m max). El ciclo de 16 semanas inicia el ${blueprint.startDate} (en ${blueprint.weeksUntilKickoff} semanas).`
      : `Semana ${currentWeek.weekNumber} de ${blueprint.totalWeeks} (${currentWeek.microcycleLabel}). Target: ${currentWeek.targetTss} TSS.`,
    badgeColor: currentWeek.microcycleBadgeColor,
    maxLongRunMinutes: currentWeek.maxLongRunMinutes,
    isSpecificMarathonPhase: blueprint.mode === "MARATHON_SPECIFIC" && currentWeek.phase === "PEAK",
    weeklyTssTarget: `${currentWeek.targetTss} TSS (~${currentWeek.microcycleLabel})`,
    blueprint,
  };
}

/**
 * Calcula el offset de semanas respecto a la semana actual (Lunes actual = offset 0).
 */
export function getOffsetForWeek(w: MacrocycleWeek): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const todayMonday = new Date(now.setDate(diff));
  todayMonday.setHours(0, 0, 0, 0);

  const weekMon = new Date(w.startDate + "T00:00:00");
  const diffTime = weekMon.getTime() - todayMonday.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
}

/**
 * Normaliza y traduce descripciones técnicas de macrociclo a lenguaje claro y motivador para el atleta.
 */
export function getCleanFocusDescription(
  rawFocus?: string,
  phase?: string,
  isRecovery?: boolean
): string {
  if (!rawFocus) {
    return isRecovery
      ? "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas."
      : "Construcción de base aeróbica: carreras continuas suaves y repeticiones cortas en cuesta para ganar fuerza y resistencia en las piernas.";
  }

  const lower = rawFocus.toLowerCase();

  if (lower.includes("mitocondrial") || lower.includes("sóleo") || lower.includes("capilarización") || lower.includes("tendinoso")) {
    if (isRecovery || lower.includes("asimilación") || lower.includes("balance de frescura")) {
      return "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas.";
    }
    return "Construcción de base aeróbica: carreras continuas suaves y repeticiones cortas en cuesta para ganar fuerza y resistencia en las piernas.";
  }

  if (lower.includes("miofibrilar") || lower.includes("meseta de ctl") || lower.includes("durabilidad aeróbica") || lower.includes("lactato z4")) {
    if (isRecovery || lower.includes("recuperación") || lower.includes("asimilación")) {
      return "Recuperación estratégica: soltamos piernas y recargamos energía antes del siguiente bloque de intensidad.";
    }
    return "Ritmo de carrera y potencia: series a ritmo exigente y aumento gradual de la distancia en la tirada larga del fin de semana.";
  }

  if (lower.includes("supercompensación intermedia") || lower.includes("fondos clave") || lower.includes("densidad de potencia")) {
    if (isRecovery || lower.includes("asimilación")) {
      return "Asimilación estratégica: descanso prioritario para consolidar las adaptaciones de los fondos clave.";
    }
    return "Máxima preparación: tiradas largas con tramos al ritmo objetivo de tu carrera para ganar confianza y ritmo.";
  }

  if (lower.includes("elevar el tsb sin perder tono") || lower.includes("puesta a punto (-") || lower.includes("fatiga aguda acumulada")) {
    return "Puesta a punto (Taper): bajamos los kilómetros manteniendo toques de chispa para llegar descansado y muy rápido al día de la carrera.";
  }

  if (lower.includes("máxima frescura neuromuscular") || lower.includes("recarga de glucógeno") || lower.includes("pre-evento")) {
    return "Semana de competición: entrenamientos cortos de activación, descanso prioritario y concentración para el día de la carrera.";
  }

  if (lower.includes("salud articular") || lower.includes("consistencia sin fatiga")) {
    if (isRecovery) {
      return "Descanso y regeneración: mantener el hábito sin acumular fatiga física ni mental.";
    }
    return "Mantenimiento equilibrado: carreras continuas cómodas, fuerza preventiva y ritmo constante para mantener un excelente nivel físico.";
  }

  return rawFocus;
}

