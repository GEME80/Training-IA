export interface TargetRace {
  id: string;
  name: string; // e.g. "Maratón de Valencia", "Media Maratón de Bogotá"
  date: string; // "YYYY-MM-DD"
  distance: "5k" | "10k" | "21k" | "42k" | "cycling_fondo" | "triathlon_703" | "triathlon_1406" | "custom";
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
  | "MANTENIMIENTO";

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
}

export interface MacrocycleBlueprint {
  mode: "MARATHON_SPECIFIC" | "PRE_SEASON_MAINTENANCE" | "GENERAL_MAINTENANCE";
  cycleTitle: string; // "Ciclo de Mantenimiento Adaptativo" vs "Ciclo Específico de Maratón"
  primaryRace: TargetRace | null;
  startDate: string; // Fecha de inicio de preparación específica de 16 semanas
  raceDate: string | null;
  weeksUntilKickoff: number | null; // Semanas que faltan para arrancar el ciclo de 16 sem
  totalWeeks: number;
  currentWeekIndex: number;
  currentWeek: MacrocycleWeek;
  weeks: MacrocycleWeek[];
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
): MacrocycleBlueprint {
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

  // CASO 1: SIN CARRERA PRINCIPAL (Mantenimiento General Continuo)
  if (!primaryRace) {
    const totalWeeks = 8;
    const weeks: MacrocycleWeek[] = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekMon = new Date(currentMonday);
      weekMon.setDate(currentMonday.getDate() + i * 7);
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);

      const isRecovery = (i + 1) % 4 === 0;
      const isCurrent = i === 0;

      weeks.push({
        weekNumber: i + 1,
        countdownWeeks: totalWeeks - i,
        startDate: formatDate(weekMon),
        endDate: formatDate(weekSun),
        formattedRange: formatRange(weekMon, weekSun),
        phase: "MAINTENANCE",
        phaseLabel: "Mantenimiento General Adaptativo",
        microcycleType: isRecovery ? "DESCARGA_ASIMILACION" : "MANTENIMIENTO",
        microcycleLabel: isRecovery ? "Asimilación / Descarga (3:1)" : "Mantenimiento Estable",
        microcycleBadgeColor: isRecovery
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : "bg-slate-800 text-slate-300 border-slate-700",
        targetTss: isRecovery ? 260 : 330,
        maxLongRunMinutes: isRecovery ? 45 : 55,
        focusDescription: isRecovery
          ? "Descarga de volumen y asimilación biológica para refrescar el TSB."
          : "Estabilidad de CTL, salud articular (sóleo/Aquiles) y consistencia.",
        isCurrentWeek: isCurrent,
      });
    }

    return {
      mode: "GENERAL_MAINTENANCE",
      cycleTitle: "Ciclo de Mantenimiento General",
      primaryRace: null,
      startDate: weeks[0].startDate,
      raceDate: null,
      weeksUntilKickoff: null,
      totalWeeks,
      currentWeekIndex: 0,
      currentWeek: weeks[0],
      weeks,
    };
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
      focus = "Descarga de fatiga aguda para elevar el TSB sin perder tono muscular.";
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
      maxLongRun = isPeakRecovery ? 75 : 115;
      focus = isPeakRecovery
        ? "Supercompensación intermedia tras fondos clave."
        : "Fondo específico de 28-32km con bloques a potencia Stryd de maratón.";
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
      maxLongRun = isBuildRecovery ? 65 : 95;
      focus = isBuildRecovery
        ? "Consolidación de meseta de CTL y recuperación miofibrilar."
        : "Series de umbral Stryd Z4 y extensión de durabilidad aeróbica.";
    } else {
      phase = countdown > 14 ? "BASE_1" : "BASE_2";
      phaseLabel = countdown > 14 ? "Base Aeróbica I" : "Base Aeróbica II";
      const isBaseRecovery = countdown === 13;
      microType = isBaseRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isBaseRecovery ? "Descarga / Asimilación" : "Base & Capilarización";
      badgeColor = isBaseRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-teal-500/20 text-teal-300 border-teal-500/30";
      targetTss = isBaseRecovery ? 300 : 410;
      maxLongRun = isBaseRecovery ? 55 : 75;
      focus = "Desarrollo mitocondrial, cuestas cortas y reactividad de sóleo.";
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
      focusDescription: focus,
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
): MacrocyclePhaseInfo {
  const blueprint = generateMacrocycleBlueprint(races, baseDate);
  const currentWeek = blueprint.currentWeek;
  const primaryRace = blueprint.primaryRace;

  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);

  if (!primaryRace) {
    return {
      phase: "MAINTENANCE",
      phaseLabel: "Mantenimiento General Adaptativo",
      cycleBadgeLabel: "🔵 CICLO ACTIVO: MANTENIMIENTO",
      cycleBadgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      weeksRemaining: null,
      daysRemaining: null,
      primaryRace: null,
      guideline: "Sin carrera principal próxima. Prioriza desarrollo aeróbico base, salud articular de sóleo/Aquiles y asimilación sin sobrecargas.",
      suggestedFocus: "Mantenimiento de fitness (CTL estable). Tirada larga dominical de máximo 55 min.",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      maxLongRunMinutes: 55,
      isSpecificMarathonPhase: false,
      weeklyTssTarget: "280 - 360 TSS",
      blueprint,
    };
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
