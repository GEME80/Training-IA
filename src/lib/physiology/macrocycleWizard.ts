import {
  MacrocycleBlueprint,
  MacrocycleWeek,
  MacrocyclePhaseType,
  MicrocycleType,
  TargetRace,
  getCleanFocusDescription,
} from "./macrocycle";
import { MacrocycleDistanceType } from "./macrocycleLibrary";

export interface RaceTimelineCalculation {
  raceDateStr: string;
  raceDate: Date;
  currentMonday: Date;
  raceMonday: Date;
  kickoffMonday: Date;
  kickoffDateStr: string;
  totalWeeksUntilRace: number;
  daysUntilRace: number;
  weeksUntilKickoff: number;
  hasPreSeasonBridge: boolean;
  specificPrepWeeks: number;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function formatRange(start: Date, end: Date): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
}

/**
 * Calcula la línea de tiempo temporal hacia una carrera (ej. Maratón de Tokio 2027)
 */
export function calculateRaceTimeline(
  raceDateString: string,
  baseDate: Date = new Date(),
  targetSpecificWeeks: number = 16
): RaceTimelineCalculation {
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(now);

  const raceRaw = new Date(raceDateString + "T00:00:00");
  const raceMonday = getMonday(raceRaw);

  const diffRaceMs = raceRaw.getTime() - now.getTime();
  const daysUntilRace = Math.max(1, Math.ceil(diffRaceMs / (1000 * 60 * 60 * 24)));
  const totalWeeksUntilRace = Math.max(1, Math.ceil(daysUntilRace / 7));

  // La preparación específica de 16 semanas empieza 15 semanas antes de la semana de la carrera
  const specificPrepWeeks = Math.min(targetSpecificWeeks, totalWeeksUntilRace);
  const kickoffMonday = new Date(raceMonday);
  kickoffMonday.setDate(raceMonday.getDate() - (specificPrepWeeks - 1) * 7);

  const diffKickoffMs = kickoffMonday.getTime() - currentMonday.getTime();
  const weeksUntilKickoff = Math.max(0, Math.round(diffKickoffMs / (1000 * 60 * 60 * 24 * 7)));
  const hasPreSeasonBridge = weeksUntilKickoff > 0;

  return {
    raceDateStr: raceDateString,
    raceDate: raceRaw,
    currentMonday,
    raceMonday,
    kickoffMonday,
    kickoffDateStr: formatDate(kickoffMonday),
    totalWeeksUntilRace,
    daysUntilRace,
    weeksUntilKickoff,
    hasPreSeasonBridge,
    specificPrepWeeks,
  };
}

export interface WizardPlanConfig {
  hasRace: boolean;
  raceName?: string;
  raceDistance?: MacrocycleDistanceType;
  raceDate?: string;
  raceGoal?: string;
  athleteMoment?: "maintenance" | "base_building" | "post_race_recovery" | "injury_rehab";
  bridgeStrategy?: "MAINTENANCE" | "BASE_GPP" | "EXTENDED_SPECIFIC";
  weeksCount?: number;
  startDate?: string;
}

/**
 * Genera el Macrociclo Completo para el Asistente Wizard (incluyendo puente de mantenimiento previo).
 */
export function generateWizardMacrocycle(
  config: WizardPlanConfig,
  baseDate: Date = new Date()
): MacrocycleBlueprint {
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(now);

  // CASO 1: SIN CARRERA (Momento del Atleta)
  if (!config.hasRace) {
    const moment = config.athleteMoment || "maintenance";
    const totalWeeks = config.weeksCount || (moment === "post_race_recovery" ? 3 : moment === "injury_rehab" ? 6 : 8);
    const weeks: MacrocycleWeek[] = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekMon = new Date(currentMonday);
      weekMon.setDate(currentMonday.getDate() + i * 7);
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);

      const isRecovery = (i + 1) % 4 === 0;
      const isCurrent = i === 0;

      let phase: MacrocyclePhaseType = "MAINTENANCE";
      let phaseLabel = "Mantenimiento Adaptativo";
      let microType: MicrocycleType = isRecovery ? "DESCARGA_ASIMILACION" : "MANTENIMIENTO";
      let microLabel = isRecovery ? "Asimilación (3:1)" : "Mantenimiento Estable";
      let badgeColor = isRecovery ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-slate-800 text-slate-300 border-slate-700";
      let targetTss = isRecovery ? 260 : 330;
      let maxLongRunMinutes = isRecovery ? 45 : 55;
      let focusDescription = isRecovery
        ? "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas."
        : "Mantenimiento equilibrado: rodajes cómodos, fuerza preventiva y ritmo constante para mantener un excelente nivel físico.";

      if (moment === "base_building") {
        phase = i < Math.floor(totalWeeks / 2) ? "BASE_1" : "BASE_2";
        phaseLabel = "Construcción de Base GPP";
        microType = isRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
        microLabel = isRecovery ? "Asimilación (3:1)" : "Volumen Aeróbico Z2";
        badgeColor = isRecovery ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-teal-500/20 text-teal-300 border-teal-500/30";
        targetTss = isRecovery ? 280 : 390;
        maxLongRunMinutes = isRecovery ? 50 : 70;
        focusDescription = isRecovery
          ? "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas."
          : "Construcción de base aeróbica: rodajes suaves continuos y repeticiones cortas en cuesta para ganar fuerza y resistencia en las piernas.";
      } else if (moment === "post_race_recovery") {
        phase = "RECOVERY";
        phaseLabel = "Recuperación Post-Carrera";
        microType = "DESCARGA_ASIMILACION";
        microLabel = "Regeneración Total";
        badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
        targetTss = 160 + i * 40;
        maxLongRunMinutes = 25 + i * 10;
        focusDescription = "Descarga pasiva, ciclismo regenerativo suave y cero impacto articular agudo.";
      } else if (moment === "injury_rehab") {
        phase = "RECOVERY";
        phaseLabel = "Reacondicionamiento Gradual";
        microType = "DESCARGA_ASIMILACION";
        microLabel = "Carga Mecánica Gradual";
        badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
        targetTss = 180 + i * 30;
        maxLongRunMinutes = 25 + i * 5;
        focusDescription = "Intervalos de caminar-correr (CaCo) y fortalecimiento progresivo controlado.";
      }

      weeks.push({
        weekNumber: i + 1,
        countdownWeeks: totalWeeks - i,
        startDate: formatDate(weekMon),
        endDate: formatDate(weekSun),
        formattedRange: formatRange(weekMon, weekSun),
        phase,
        phaseLabel,
        microcycleType: microType,
        microcycleLabel: microLabel,
        microcycleBadgeColor: badgeColor,
        targetTss,
        maxLongRunMinutes,
        focusDescription: getCleanFocusDescription(focusDescription, phase, isRecovery),
        isCurrentWeek: isCurrent,
      });
    }

    return {
      mode: "GENERAL_MAINTENANCE",
      cycleTitle: `Plan de ${moment === "base_building" ? "Construcción de Base GPP" : moment === "post_race_recovery" ? "Recuperación Post-Carrera" : moment === "injury_rehab" ? "Reacondicionamiento" : "Mantenimiento Adaptativo"} (${totalWeeks} semanas)`,
      primaryRace: null,
      startDate: weeks[0].startDate,
      raceDate: null,
      weeksUntilKickoff: 0,
      totalWeeks,
      currentWeekIndex: 0,
      currentWeek: weeks[0],
      weeks,
    };
  }

  // CASO 2: CON CARRERA OBJETIVO (Ej. Maratón de Tokio 2027)
  const timeline = calculateRaceTimeline(config.raceDate || formatDate(new Date()), baseDate, 16);
  const primaryRace: TargetRace = {
    id: `race-${Date.now()}`,
    name: config.raceName || "Competición Objetivo",
    date: config.raceDate || timeline.raceDateStr,
    distance: config.raceDistance || "42k",
    priority: "A",
    goalTarget: config.raceGoal || "Pico de Forma",
  };

  // 2A: SI FALTAN SEMANAS HASTA EL KICKOFF (Ej. 13 semanas para Tokio) -> EL PLAN RECTOR ACTIVO ES EL MANTENIMIENTO (13 SEM)
  if (timeline.hasPreSeasonBridge) {
    const totalBridgeWeeks = timeline.weeksUntilKickoff;
    const weeks: MacrocycleWeek[] = [];

    for (let i = 0; i < totalBridgeWeeks; i++) {
      const weekMon = new Date(currentMonday);
      weekMon.setDate(currentMonday.getDate() + i * 7);
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);

      const isRecovery = (i + 1) % 4 === 0;
      const isCurrent = i === 0;
      const weeksToKickoff = totalBridgeWeeks - i;
      const isTestWeek = (i + 1) === 4 || (i + 1) === 8;

      let focus = `Consolidación de base aeróbica, estabilidad de CTL y consistencia semanal sin fatiga residual.`;
      if ((i + 1) === 4) {
        focus = `🎯 Semana de Test Stryd CP (3/9 min) para calibrar potencia crítica de carrera.`;
      } else if ((i + 1) === 8) {
        focus = `🚴 Semana de Test Bike FTP (Ramp Test) para calibrar umbral de ciclismo.`;
      } else if (weeksToKickoff === 1) {
        focus = `🏁 Semana final de mantenimiento. El ${new Date(new Date(timeline.kickoffDateStr + "T00:00:00").getTime() - 86400000).toISOString().split("T")[0]} la IA generará el Plan Específico de Maratón de 16 semanas.`;
      }

      weeks.push({
        weekNumber: i + 1,
        countdownWeeks: totalBridgeWeeks - i,
        startDate: formatDate(weekMon),
        endDate: formatDate(weekSun),
        formattedRange: formatRange(weekMon, weekSun),
        phase: "PRE_SEASON_MAINTENANCE",
        phaseLabel: isTestWeek ? "Calibración Fisiológica" : "Mantenimiento Adaptativo",
        microcycleType: isRecovery ? "DESCARGA_ASIMILACION" : isTestWeek ? "IMPACTO_CHOQUE" : "MANTENIMIENTO",
        microcycleLabel: isRecovery ? "Asimilación (3:1)" : isTestWeek ? "Test de Rendimiento" : `Mantenimiento (${weeksToKickoff} sem al Kickoff)`,
        microcycleBadgeColor: isRecovery
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : isTestWeek
          ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
          : "bg-slate-800 text-slate-300 border-slate-700",
        targetTss: isRecovery ? 260 : isTestWeek ? 350 : 330,
        maxLongRunMinutes: isRecovery ? 45 : 55,
        focusDescription: focus,
        isCurrentWeek: isCurrent,
      });
    }

    const currentWeekIdx = weeks.findIndex((w) => w.isCurrentWeek);
    const resolvedCurrentIndex = currentWeekIdx !== -1 ? currentWeekIdx : 0;

    return {
      mode: "PRE_SEASON_MAINTENANCE",
      cycleTitle: `Mantenimiento Pre-Competición: ${primaryRace.name} (${totalBridgeWeeks} semanas hasta Kickoff)`,
      primaryRace,
      startDate: weeks[0]?.startDate || formatDate(currentMonday),
      raceDate: primaryRace.date,
      weeksUntilKickoff: timeline.weeksUntilKickoff,
      totalWeeks: totalBridgeWeeks,
      currentWeekIndex: resolvedCurrentIndex,
      currentWeek: weeks[resolvedCurrentIndex] || weeks[0],
      weeks,
    };
  }

  // 2B: SI ESTAMOS DENTRO DE LAS 16 SEMANAS DE PREPARACIÓN ESPECÍFICA (O NO HAY PUENTE)
  const weeks: MacrocycleWeek[] = [];
  const totalWeeks = timeline.specificPrepWeeks;

  for (let i = 0; i < timeline.specificPrepWeeks; i++) {
    const weekMon = new Date(timeline.kickoffMonday);
    weekMon.setDate(timeline.kickoffMonday.getDate() + i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const countdownSpecific = timeline.specificPrepWeeks - i;
    const isRecovery = (i + 1) % 4 === 0 && countdownSpecific > 1;

    let phase: MacrocyclePhaseType = "BASE_1";
    let phaseLabel = "Base Aeróbica I";
    let microType: MicrocycleType = isRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
    let microLabel = isRecovery ? "Descarga de Asimilación (3:1)" : "Microciclo de Carga";
    let badgeColor = isRecovery ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-teal-500/20 text-teal-300 border-teal-500/30";
    let targetTss = 360;
    let maxLongRun = 65;
    let focus = "Consistencia y acondicionamiento muscular base.";

    if (countdownSpecific === 1) {
      phase = "RACE_WEEK";
      phaseLabel = "Semana de Competición";
      microType = "COMPETICION";
      microLabel = `🏆 DÍA DE CARRERA: ${primaryRace.name}`;
      badgeColor = "bg-amber-500/25 text-amber-300 border-amber-500/40 font-bold";
      targetTss = 220;
      // Calcular duración real según distancia de la carrera (no hardcodeado)
      const rDist = (primaryRace.distance || "42k").toString();
      maxLongRun = rDist.includes("21") || rDist.includes("half") ? 110
        : rDist.includes("10") ? 55
        : rDist.includes("5") ? 30
        : rDist.includes("70.3") || rDist.includes("703") ? 210
        : rDist.includes("trail") ? 240
        : 220; // Maratón 42K por defecto
      focus = `Máxima frescura neuromuscular, recarga de glucógeno y ejecución del ritmo de competición en ${primaryRace.name}.`;
    } else if (countdownSpecific <= 3) {
      phase = "TAPER";
      phaseLabel = "Tapering & Puesta a Punto";
      microType = "TAPER";
      microLabel = `Puesta a Punto (-${countdownSpecific === 2 ? "40" : "25"}% Vol)`;
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
      targetTss = countdownSpecific === 2 ? 240 : 280;
      maxLongRun = countdownSpecific === 2 ? 45 : 55;
      focus = "Descarga de fatiga aguda acumulada para elevar el TSB sin perder tono muscular.";
    } else if (countdownSpecific <= 6) {
      phase = "PEAK";
      phaseLabel = "Pico de Forma & Fondos Clave";
      microType = isRecovery ? "DESCARGA_ASIMILACION" : "IMPACTO_CHOQUE";
      microLabel = isRecovery ? "Descarga de Asimilación (3:1)" : "🔥 Fondos Clave & Impacto";
      badgeColor = isRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-orange-500/25 text-orange-300 border-orange-500/40";
      targetTss = isRecovery ? 380 : 540;
      maxLongRun = isRecovery ? 75 : 115;
      focus = isRecovery
        ? "Supercompensación intermedia tras los fondos más exigentes de la temporada."
        : "Fondos de 28-34km con bloques a potencia de maratón (% CP) y densidad de potencia.";
    } else if (countdownSpecific <= 12) {
      phase = "BUILD";
      phaseLabel = "Construcción Específica & Umbral";
      microType = isRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isRecovery ? "Descarga / Asimilación (3:1)" : "Construcción & Umbral Z4";
      badgeColor = isRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      targetTss = isRecovery ? 340 : 470;
      maxLongRun = isRecovery ? 65 : 95;
      focus = isRecovery
        ? "Recuperación estratégica: soltamos piernas y recargamos energía antes del siguiente bloque de intensidad."
        : "Ritmo de carrera y potencia: series a ritmo exigente y aumento gradual de la tirada larga del fin de semana.";
    } else {
      phase = countdownSpecific > 14 ? "BASE_1" : "BASE_2";
      phaseLabel = phase === "BASE_1" ? "Base Aeróbica I" : "Base Aeróbica II";
      microType = isRecovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isRecovery ? "Descarga / Asimilación" : "Base & Resistencia";
      badgeColor = isRecovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-teal-500/20 text-teal-300 border-teal-500/30";
      targetTss = isRecovery ? 300 : 410;
      maxLongRun = isRecovery ? 55 : 75;
      focus = isRecovery
        ? "Semana de asimilación: reducimos el volumen para absorber el entrenamiento previo y recuperar piernas frescas."
        : "Construcción de base aeróbica: rodajes suaves continuos y repeticiones cortas en cuesta para ganar fuerza y resistencia en las piernas.";
    }

    const isCurrent = currentMonday.getTime() === weekMon.getTime();

    weeks.push({
      weekNumber: i + 1,
      countdownWeeks: timeline.specificPrepWeeks - i,
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
      focusDescription: getCleanFocusDescription(focus, phase, isRecovery),
      isCurrentWeek: isCurrent,
    });
  }

  const currentWeekIdx = weeks.findIndex((w) => w.isCurrentWeek);
  const resolvedCurrentIndex = currentWeekIdx !== -1 ? currentWeekIdx : 0;

  return {
    mode: "MARATHON_SPECIFIC",
    cycleTitle: `Preparación Específica: ${primaryRace.name} (${totalWeeks} semanas)`,
    primaryRace,
    startDate: weeks[0]?.startDate || formatDate(currentMonday),
    raceDate: primaryRace.date,
    weeksUntilKickoff: timeline.weeksUntilKickoff,
    totalWeeks,
    currentWeekIndex: resolvedCurrentIndex,
    currentWeek: weeks[resolvedCurrentIndex] || weeks[0],
    weeks,
  };
}
