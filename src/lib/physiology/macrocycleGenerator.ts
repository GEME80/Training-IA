import {
  MacrocycleDefinition,
  getMacrocycleDefinitionById,
  getMacrocycleDefinitionByDistance,
  MacrocycleDistanceType,
} from "./macrocycleLibrary";
import {
  MacrocycleBlueprint,
  MacrocycleWeek,
  MacrocyclePhaseType,
  MicrocycleType,
  TargetRace,
} from "./macrocycle";

export interface CustomMacrocycleConfig {
  definitionId?: string;
  distanceType?: MacrocycleDistanceType;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  weeksCount?: number;
  primaryRace?: TargetRace | null;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  customGoal?: string;
}

/**
 * Obtiene el lunes de una fecha dada
 */
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
 * Generador dinámico de Macrociclos a partir de la Biblioteca y Calendario Personalizado.
 */
export function generateCustomMacrocycleBlueprint(
  config: CustomMacrocycleConfig,
  baseDate: Date = new Date()
): MacrocycleBlueprint {
  // 1. Obtener la definición base de la biblioteca
  let def: MacrocycleDefinition | undefined;
  if (config.definitionId) {
    def = getMacrocycleDefinitionById(config.definitionId);
  }
  if (!def && config.distanceType) {
    def = getMacrocycleDefinitionByDistance(config.distanceType);
  }
  if (!def) {
    def = getMacrocycleDefinitionById("marathon-specific")!;
  }

  // 2. Determinar Fechas y Número de Semanas
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(now);

  const startRaw = new Date(config.startDate + "T00:00:00");
  const startMonday = getMonday(startRaw);

  let totalWeeks = config.weeksCount || def.defaultWeeks;

  if (config.endDate) {
    const endRaw = new Date(config.endDate + "T00:00:00");
    const endMonday = getMonday(endRaw);
    const diffMs = endMonday.getTime() - startMonday.getTime();
    const calculatedWeeks = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1);
    totalWeeks = calculatedWeeks;
  } else if (config.primaryRace?.date) {
    const raceRaw = new Date(config.primaryRace.date + "T00:00:00");
    const raceMonday = getMonday(raceRaw);
    const diffMs = raceMonday.getTime() - startMonday.getTime();
    const calculatedWeeks = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1);
    totalWeeks = calculatedWeeks;
  }

  // Clampear semanas a rangos fisiológicos
  totalWeeks = Math.min(Math.max(totalWeeks, Math.max(2, def.minWeeks - 2)), def.maxWeeks + 4);

  // 3. Distribución de Semanas por Fases
  const isEventDriven = def.category === "RACE_TARGET";
  const taperWeeksCount = isEventDriven
    ? Math.max(1, Math.round(totalWeeks * def.phaseRatios.taper))
    : 0;
  const peakWeeksCount = isEventDriven
    ? Math.max(1, Math.round(totalWeeks * def.phaseRatios.peak))
    : 0;
  const remainingWeeksForBaseAndBuild = Math.max(1, totalWeeks - taperWeeksCount - peakWeeksCount);
  
  const baseRatioPortion = def.phaseRatios.base / (def.phaseRatios.base + def.phaseRatios.build || 1);
  const baseWeeksCount = Math.max(1, Math.round(remainingWeeksForBaseAndBuild * baseRatioPortion));
  const buildWeeksCount = Math.max(0, remainingWeeksForBaseAndBuild - baseWeeksCount);

  const baseEndWeek = baseWeeksCount;
  const buildEndWeek = baseEndWeek + buildWeeksCount;
  const peakEndWeek = buildEndWeek + peakWeeksCount;

  // 4. Construir Semanas
  const weeks: MacrocycleWeek[] = [];
  let currentWeekIndex = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const weekMon = new Date(startMonday);
    weekMon.setDate(startMonday.getDate() + i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const weekNumber = i + 1;
    const countdown = totalWeeks - i;

    // Determinar Fase
    let phase: MacrocyclePhaseType = "BASE_1";
    let phaseLabel = "Fase Base (GPP)";
    let microType: MicrocycleType = "CARGA";
    let microLabel = "Microciclo de Carga";
    let badgeColor = "bg-teal-500/20 text-teal-300 border-teal-500/30";
    let targetTss = 360;
    let maxLongRunMinutes = 60;
    let focusDescription = "";

    // Regla 3:1 de descarga de asimilación
    const is3to1Recovery = (i + 1) % 4 === 0 && countdown > 1 && weekNumber !== totalWeeks;

    if (isEventDriven && countdown === 1) {
      // Semana de Carrera
      phase = "RACE_WEEK";
      phaseLabel = "Semana de Competición";
      microType = "COMPETICION";
      microLabel = "🏆 Competición Objetivo";
      badgeColor = "bg-amber-500/25 text-amber-300 border-amber-500/40";
      targetTss = 180;
      maxLongRunMinutes = 25;
      focusDescription = `Máxima frescura neuromuscular, recarga de glucógeno y ritmo de carrera para ${config.primaryRace?.name || def.title}.`;
    } else if (isEventDriven && weekNumber > peakEndWeek) {
      // Tapering
      phase = "TAPER";
      phaseLabel = "Tapering & Puesta a Punto";
      microType = "TAPER";
      microLabel = `Puesta a Punto (-${countdown === 2 ? "40" : "25"}% Vol)`;
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
      targetTss = countdown === 2 ? 240 : 290;
      maxLongRunMinutes = def.distanceType === "42k" ? (countdown === 2 ? 45 : 55) : 40;
      focusDescription = "Descarga de fatiga aguda acumulada para elevar el TSB sin perder tono neuromuscular.";
    } else if (isEventDriven && weekNumber > buildEndWeek) {
      // Pico / Fondos Clave
      phase = "PEAK";
      phaseLabel = "Pico de Forma & Fondos Clave";
      microType = is3to1Recovery ? "DESCARGA_ASIMILACION" : "IMPACTO_CHOQUE";
      microLabel = is3to1Recovery ? "Descarga de Asimilación (3:1)" : "🔥 Choque / Fondos Clave";
      badgeColor = is3to1Recovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-orange-500/25 text-orange-300 border-orange-500/40";
      targetTss = is3to1Recovery ? 370 : 520;
      maxLongRunMinutes = def.distanceType === "42k" ? (is3to1Recovery ? 75 : 115) : def.distanceType === "21k" ? 90 : 70;
      focusDescription = is3to1Recovery
        ? "Supercompensación intermedia tras los bloques más intensos de la temporada."
        : `Fondos específicos y densidad de potencia a ritmo objetivo de ${def.title}.`;
    } else if (weekNumber > baseEndWeek) {
      // Construcción / Umbral
      phase = "BUILD";
      phaseLabel = "Construcción Específica & Umbral";
      microType = is3to1Recovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = is3to1Recovery ? "Descarga / Asimilación (3:1)" : "Construcción & Umbral";
      badgeColor = is3to1Recovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      targetTss = is3to1Recovery ? 320 : 450;
      maxLongRunMinutes = def.distanceType === "42k" ? (is3to1Recovery ? 65 : 90) : def.distanceType === "21k" ? 80 : 60;
      focusDescription = is3to1Recovery
        ? "Consolidación de meseta de CTL y descanso miofibrilar."
        : "Series de umbral lactato Z4 (% CP) y extensión de durabilidad aeróbica.";
    } else {
      // Base / Mantenimiento / GPP
      phase = weekNumber <= Math.ceil(baseWeeksCount / 2) ? "BASE_1" : "BASE_2";
      phaseLabel = phase === "BASE_1" ? "Base Aeróbica I" : "Base Aeróbica II";
      microType = is3to1Recovery ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = is3to1Recovery ? "Descarga / Asimilación" : "Base & Capilarización";
      badgeColor = is3to1Recovery
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-teal-500/20 text-teal-300 border-teal-500/30";
      targetTss = is3to1Recovery ? 280 : 380;
      maxLongRunMinutes = def.distanceType === "42k" ? (is3to1Recovery ? 50 : 70) : 55;
      focusDescription = is3to1Recovery
        ? "Asimilación biológica para mantener balance de frescura."
        : "Desarrollo mitocondrial, cuestas cortas y acondicionamiento tendinoso de sóleo.";
    }

    // Ajustes para momentos no competitivos
    if (def.category === "ATHLETE_MOMENT") {
      if (def.distanceType === "post_race_recovery") {
        phase = "RECOVERY";
        phaseLabel = "Recuperación Post-Carrera";
        microType = "DESCARGA_ASIMILACION";
        microLabel = "Regeneración Total";
        badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
        targetTss = 160 + weekNumber * 40;
        maxLongRunMinutes = 20 + weekNumber * 10;
        focusDescription = "Descarga pasiva, ciclismo regenerativo suave y cero impacto articular agudo.";
      } else if (def.distanceType === "injury_rehab") {
        phase = "RECOVERY";
        phaseLabel = "Reacondicionamiento Gradual";
        microType = "DESCARGA_ASIMILACION";
        microLabel = "Carga Mecánica Gradual";
        badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
        targetTss = 180 + weekNumber * 30;
        maxLongRunMinutes = 25 + weekNumber * 5;
        focusDescription = "Intervalos de caminar-correr (CaCo), fortalecimiento excéntrico y control de síntomas.";
      } else if (def.distanceType === "maintenance") {
        phase = "MAINTENANCE";
        phaseLabel = "Mantenimiento Adaptativo";
        microType = is3to1Recovery ? "DESCARGA_ASIMILACION" : "MANTENIMIENTO";
        microLabel = is3to1Recovery ? "Asimilación (3:1)" : "Mantenimiento Estable";
        badgeColor = is3to1Recovery
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : "bg-slate-800 text-slate-300 border-slate-700";
        targetTss = is3to1Recovery ? 260 : 330;
        maxLongRunMinutes = is3to1Recovery ? 45 : 55;
        focusDescription = "Estabilidad de CTL, salud articular (sóleo/Aquiles) y consistencia sin fatiga crónica.";
      }
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
      maxLongRunMinutes,
      focusDescription,
      isCurrentWeek: isCurrent,
    });
  }

  // Si la fecha actual está fuera del rango del macrociclo, asegurar un índice válido
  if (currentMonday.getTime() < startMonday.getTime()) {
    currentWeekIndex = 0;
  } else if (currentWeekIndex === 0 && currentMonday.getTime() > new Date(weeks[weeks.length - 1].endDate).getTime()) {
    currentWeekIndex = weeks.length - 1;
  }

  const primaryRace: TargetRace | null = config.primaryRace || (isEventDriven ? {
    id: `race-${Date.now()}`,
    name: config.customGoal || def.title,
    date: weeks[weeks.length - 1]?.endDate || formatDate(now),
    distance: def.distanceType as any,
    priority: "A",
    goalTarget: config.customGoal || "Completar con pico de forma",
  } : null);

  return {
    mode: isEventDriven ? "MARATHON_SPECIFIC" : "GENERAL_MAINTENANCE",
    cycleTitle: `${def.title} (${totalWeeks} semanas)`,
    primaryRace,
    startDate: weeks[0]?.startDate || formatDate(startMonday),
    raceDate: primaryRace?.date || null,
    weeksUntilKickoff: 0,
    totalWeeks,
    currentWeekIndex,
    currentWeek: weeks[currentWeekIndex] || weeks[0],
    weeks,
  };
}
