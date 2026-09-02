import {
  MacrocycleDefinition,
  getMacrocycleDefinitionById,
  getMacrocycleDefinitionByDistance,
  MacrocycleDistanceType,
  MACROCYCLE_LIBRARY,
} from "./macrocycleLibrary";
import {
  MacrocycleBlueprint,
  MacrocycleWeek,
  MacrocyclePhaseType,
  MicrocycleType,
  TargetRace,
} from "./macrocycle";
import { WeeklyAvailabilityMap } from "../gemini/engine";
import {
  resolveTrainingModel,
  calculateProgressiveLongRun,
  calculateProgressiveWeeklyTss,
} from "../ai/knowledge";

export interface CustomMacrocycleConfig {
  definitionId?: string;
  distanceType?: MacrocycleDistanceType;
  startDate: string;
  endDate?: string;
  weeksCount?: number;
  primaryRace?: TargetRace | null;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  customGoal?: string;
  periodization?: "3:1" | "2:1" | "ESTANDAR" | "CONSERVADOR";
  athleteMetrics?: {
    ctl?: number;
    atl?: number;
    tsb?: number;
    runFtp?: number;
    bikeFtp?: number;
    weightKg?: number;
    restingHR?: number;
    maxHR?: number;
    lthr?: number;
    age?: number;
    gender?: "M" | "F" | "OTHER";
    weeklyAvailability?: WeeklyAvailabilityMap;
  };
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
 * Calcula el factor de escala de volumen según el CTL real del atleta.
 * Evita prescribir volúmenes lesivos para principiantes (CTL=0) o corredores en retorno.
 */
export function resolveVolumeScaleFactor(ctl?: number): number {
  if (!ctl || ctl <= 0) return 0.60;  // sin datos o sin actividad → carga mínima segura
  if (ctl <= 15) return 0.65;          // principiante / recuperación de lesión
  if (ctl <= 30) return 0.78;          // intermedio bajo
  if (ctl <= 50) return 0.90;          // intermedio
  if (ctl <= 70) return 1.00;          // avanzado (modelo canónico del SSOT)
  return 1.12;                          // élite
}

/**
 * Generador dinámico de Macrociclos gobernado por Modelos Científicos Curados (SSOT).
 * Incluye volumeScaleFactor por CTL, availabilitySnapshot y distanceType en el blueprint.
 */
export function generateCustomMacrocycleBlueprint(
  config: CustomMacrocycleConfig,
  baseDate: Date = new Date()
): MacrocycleBlueprint {
  let def: MacrocycleDefinition | undefined;
  if (config.definitionId) def = getMacrocycleDefinitionById(config.definitionId);
  if (!def && config.distanceType) def = getMacrocycleDefinitionByDistance(config.distanceType);
  if (!def) def = MACROCYCLE_LIBRARY[0];

  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(now);

  const startRaw = new Date(config.startDate + "T00:00:00");
  const startMonday = getMonday(startRaw);

  let totalWeeks = config.weeksCount || def.defaultWeeks;
  if (!config.weeksCount) {
    const endTarget = config.endDate || config.primaryRace?.date;
    if (endTarget) {
      const endRaw = new Date(endTarget + "T00:00:00");
      const endMonday = getMonday(endRaw);
      const diffMs = endMonday.getTime() - startMonday.getTime();
      totalWeeks = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1);
    }
  }
  totalWeeks = Math.min(Math.max(totalWeeks, 4), 40);

  // 1. Resolver modelo científico rector SSOT
  const curatedModel = resolveTrainingModel({
    targetDistance: config.distanceType,
    raceDistance: config.distanceType,
    raceName: config.primaryRace?.name,
    customGoal: config.customGoal,
  });

  const isEventDriven = def.category === "RACE_TARGET";
  const isConservative = config.periodization === "2:1" || config.periodization === "CONSERVADOR";
  const recoveryModulo = isConservative ? 3 : 4;

  const athleteCtl = config.athleteMetrics?.ctl;
  const hasRealCtl = typeof athleteCtl === "number" && athleteCtl > 10;
  const dynamicTssBaseline = hasRealCtl ? Math.round(athleteCtl * 7 * 0.95) : 280;

  // Factor de escala de volumen por CTL real del atleta (anti-lesión)
  const volumeScaleFactor = resolveVolumeScaleFactor(athleteCtl);

  // Distribución de fases según modelo curado y soporte de periodización encadenada GPP
  const maxSpecificWeeks = 20;
  const gppWeeksCount = Math.max(0, totalWeeks - maxSpecificWeeks);
  const effectiveSpecificWeeks = totalWeeks - gppWeeksCount;

  const taperWeeksCount = isEventDriven
    ? (curatedModel.taperingRules?.taperingWeeks
        ? Math.round(curatedModel.taperingRules.taperingWeeks)
        : Math.max(2, Math.round(effectiveSpecificWeeks * Math.max(0.15, (curatedModel.phaseDistributions.find(p => p.phaseKey === "TAPER")?.percentageDuration || 0.15)))))
    : 0;
  const peakWeeksCount = isEventDriven ? Math.max(2, Math.round(effectiveSpecificWeeks * (curatedModel.phaseDistributions.find(p => p.phaseKey === "PEAK")?.percentageDuration || 0.18))) : 0;
  const specificBaseBuild = Math.max(2, effectiveSpecificWeeks - taperWeeksCount - peakWeeksCount);
  const buildWeeksCount = Math.max(1, Math.round(specificBaseBuild * 0.50));
  const base2WeeksCount = Math.max(1, specificBaseBuild - buildWeeksCount);

  const gppEndWeek = gppWeeksCount;
  const baseEndWeek = gppEndWeek + base2WeeksCount;
  const buildEndWeek = baseEndWeek + buildWeeksCount;
  const peakEndWeek = buildEndWeek + peakWeeksCount;

  const weeks: MacrocycleWeek[] = [];
  let currentWeekIndex = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const weekMon = new Date(startMonday);
    weekMon.setDate(startMonday.getDate() + i * 7);
    const weekSun = new Date(weekMon);
    weekSun.setDate(weekMon.getDate() + 6);

    const weekNumber = i + 1;
    const countdown = totalWeeks - i;
    const isRecoveryWeek = (i + 1) % recoveryModulo === 0 && countdown > 1 && weekNumber !== totalWeeks;

    let phase: MacrocyclePhaseType = "BASE_1";
    let phaseLabel = "Base Aeróbica I";
    let microType: MicrocycleType = isRecoveryWeek ? "DESCARGA_ASIMILACION" : "CARGA";
    let microLabel = isRecoveryWeek ? `Descarga (${isConservative ? "2:1" : "3:1"})` : "Carga Progresiva";
    let badgeColor = isRecoveryWeek ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-teal-500/20 text-teal-300 border-teal-500/30";

    if (isEventDriven && countdown === 1) {
      phase = "RACE_WEEK";
      phaseLabel = "Semana de Competición";
      microType = "COMPETICION";
      microLabel = "🏆 Competición Oficial";
      badgeColor = "bg-amber-500/25 text-amber-300 border-amber-500/40";
    } else if (isEventDriven && weekNumber > peakEndWeek) {
      phase = "TAPER";
      phaseLabel = "Tapering & Puesta a Punto";
      microType = "TAPER";
      microLabel = `Puesta a Punto (W-${countdown - 1})`;
      badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    } else if (isEventDriven && weekNumber > buildEndWeek) {
      phase = "PEAK";
      phaseLabel = `Pico de Forma (${curatedModel.displayName.split("(")[0].trim()})`;
      microType = isRecoveryWeek ? "DESCARGA_ASIMILACION" : "IMPACTO_CHOQUE";
      microLabel = isRecoveryWeek ? `Asimilación (${isConservative ? "2:1" : "3:1"})` : "🔥 Fondo Cumbre Clave";
      badgeColor = isRecoveryWeek ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-orange-500/25 text-orange-300 border-orange-500/40";
    } else if (weekNumber > baseEndWeek) {
      phase = "BUILD";
      phaseLabel = "Construcción Específica & Umbral";
      microType = isRecoveryWeek ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isRecoveryWeek ? `Asimilación (${isConservative ? "2:1" : "3:1"})` : "Construcción & Umbral";
      badgeColor = isRecoveryWeek ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    } else if (gppWeeksCount > 0 && weekNumber <= gppEndWeek) {
      phase = "BASE_1";
      phaseLabel = "GPP: Base Mitocondrial";
      microType = isRecoveryWeek ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isRecoveryWeek ? `Descarga GPP (${isConservative ? "2:1" : "3:1"})` : "Base Aeróbica GPP";
      badgeColor = isRecoveryWeek ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-teal-500/20 text-teal-300 border-teal-500/30";
    } else {
      phase = "BASE_2";
      phaseLabel = "Base Específica & Capilarización";
      microType = isRecoveryWeek ? "DESCARGA_ASIMILACION" : "CARGA";
      microLabel = isRecoveryWeek ? `Descarga (${isConservative ? "2:1" : "3:1"})` : "Base Específica";
      badgeColor = isRecoveryWeek ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-teal-500/20 text-teal-300 border-teal-500/30";
    }

    // Cálculo dinámico progresivo desde el modelo curado (SSOT) con volumeScaleFactor y athleteCtl
    const longRun = calculateProgressiveLongRun(curatedModel, weekNumber, totalWeeks, isRecoveryWeek, phase, countdown, volumeScaleFactor, athleteCtl);

    const targetTss = calculateProgressiveWeeklyTss(curatedModel, weekNumber, totalWeeks, isRecoveryWeek, phase, dynamicTssBaseline);

    const scheduledTest = curatedModel.mandatoryTests.find(t => t.recommendedWeekIndex === weekNumber);
    const testBadge = scheduledTest ? `🧪 ${scheduledTest.testName} • ` : "";

    const focusDescription = `${testBadge}${phaseLabel}: Tirada dominical de ${longRun.km} km (${longRun.minutes}m). ${isRecoveryWeek ? "Semana de asimilación biológica." : "Sobrecarga progresiva aeróbica."}`;

    const isPast = weekMon.getTime() < currentMonday.getTime();
    const isCurrent = currentMonday.getTime() === weekMon.getTime();
    const isFuture = weekMon.getTime() > currentMonday.getTime();

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
      maxLongRunMinutes: longRun.minutes,
      focusDescription,
      isCurrentWeek: isCurrent,
      isPastWeek: isPast,
      isFutureWeek: isFuture,
    });
  }

  if (currentMonday.getTime() < startMonday.getTime()) currentWeekIndex = 0;
  else if (currentMonday.getTime() > new Date(weeks[weeks.length - 1].startDate).getTime()) currentWeekIndex = weeks.length - 1;

  const isMaintenancePlan = !isEventDriven || def.distanceType === "maintenance" || def.distanceType === "base_building";

  const primaryRace: TargetRace | null = isMaintenancePlan
    ? null
    : config.primaryRace || (isEventDriven ? {
        id: `race-${Date.now()}`,
        name: config.customGoal || def.title,
        date: weeks[weeks.length - 1]?.endDate || formatDate(now),
        distance: def.distanceType as any,
        priority: "A",
        goalTarget: config.customGoal || "Completar con pico de forma",
      } : null);

  return {
    mode: isMaintenancePlan ? "GENERAL_MAINTENANCE" : "MARATHON_SPECIFIC",
    cycleTitle: config.customGoal || `${curatedModel.displayName} (${totalWeeks} semanas)`,
    primaryRace,
    startDate: weeks[0]?.startDate || formatDate(startMonday),
    raceDate: primaryRace?.date || null,
    weeksUntilKickoff: 0,
    totalWeeks,
    currentWeekIndex,
    currentWeek: weeks[currentWeekIndex] || weeks[0],
    weeks,
    // Campos de trazabilidad
    availabilitySnapshot: config.athleteMetrics?.weeklyAvailability as any,
    distanceType: config.distanceType,
    athleteCtlAtCreation: athleteCtl,
  };
}
