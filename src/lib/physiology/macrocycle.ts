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
  mode: "MARATHON_SPECIFIC" | "MAINTENANCE";
  primaryRace: TargetRace | null;
  startDate: string;
  raceDate: string | null;
  totalWeeks: number;
  currentWeekIndex: number;
  currentWeek: MacrocycleWeek;
  weeks: MacrocycleWeek[];
}

export interface MacrocyclePhaseInfo {
  phase: MacrocyclePhaseType;
  phaseLabel: string;
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

  // CASO A: MANTENIMIENTO GENERAL (Sin maratón próxima o modo base)
  if (!primaryRace || primaryRace.distance !== "42k") {
    const totalWeeks = 8;
    const weeks: MacrocycleWeek[] = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekMon = new Date(currentMonday);
      weekMon.setDate(currentMonday.getDate() + (i - 1) * 7); // -1 semana previa, actual y 6 futuras
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);

      const isRecovery = (i + 1) % 4 === 0; // Semana 4 y 8 de asimilación
      const isCurrent = i === 1;

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
      mode: "MAINTENANCE",
      primaryRace,
      startDate: weeks[0].startDate,
      raceDate: primaryRace ? primaryRace.date : null,
      totalWeeks,
      currentWeekIndex: 1,
      currentWeek: weeks[1],
      weeks,
    };
  }

  // CASO B: PLAN ESPECÍFICO DE MARATÓN (16 Semanas)
  const totalWeeks = 16;
  const raceDateObj = new Date(primaryRace.date);
  const raceMonday = getMonday(raceDateObj);

  // Fecha de inicio del macrociclo (15 semanas antes del lunes de la carrera = 16 semanas en total)
  const planStartMonday = new Date(raceMonday);
  planStartMonday.setDate(raceMonday.getDate() - (totalWeeks - 1) * 7);

  const weeks: MacrocycleWeek[] = [];
  let currentWeekIndex = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const weekMon = new Date(planStartMonday);
    weekMon.setDate(planStartMonday.getDate() + i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const countdown = totalWeeks - i;
    const weekNumber = i + 1;

    // Determinar Fase del Macrociclo
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
    primaryRace,
    startDate: weeks[0].startDate,
    raceDate: primaryRace.date,
    totalWeeks,
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

  return {
    phase: currentWeek.phase,
    phaseLabel: currentWeek.phaseLabel,
    weeksRemaining,
    daysRemaining,
    primaryRace,
    guideline: currentWeek.focusDescription,
    suggestedFocus: `Semana ${currentWeek.weekNumber} de ${blueprint.totalWeeks} (${currentWeek.microcycleLabel}). Target: ${currentWeek.targetTss} TSS.`,
    badgeColor: currentWeek.microcycleBadgeColor,
    maxLongRunMinutes: currentWeek.maxLongRunMinutes,
    isSpecificMarathonPhase: blueprint.mode === "MARATHON_SPECIFIC" && currentWeek.phase === "PEAK",
    weeklyTssTarget: `${currentWeek.targetTss} TSS (~${currentWeek.microcycleLabel})`,
    blueprint,
  };
}
