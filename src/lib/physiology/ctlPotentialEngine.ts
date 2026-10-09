import { PMCHistoricalSummary } from "./pmcEngine";
import { WeeklyAvailabilityMap } from "../gemini/engine";
import { MacrocycleBlueprint } from "./macrocycle";

export interface SportCtlCeiling {
  min: number;
  optimal: number;
  maxSafe: number;
  runRampCap?: number;
}

export interface CtlPotentialInput {
  currentCtl: number;
  histPeak?: number;
  totalWeeks?: number;
  weeksCount?: number;
  historicalMetrics?: PMCHistoricalSummary;
  sportCategory?: string;
  targetDistanceKm?: number;
  distanceType?: string;
  weeklyAvailability?: WeeklyAvailabilityMap;
  age?: number;
}

export interface CtlPotentialOutput {
  targetPeakCtl: number;
  targetPeakWeeklyTss: number;
  startWeeklyTss: number;
  weeklyRampRate: number;
  isExpansion: boolean;
  reconquestWeeks: number;
  expansionWeeks: number;
  histPeak?: number;
}

/**
 * Techos fisiológicos de CTL seguro por disciplina y distancia según SSOT científico.
 */
export function getSportCtlCeiling(
  sportCategory?: string,
  distanceType?: string,
  targetDistanceKm?: number
): SportCtlCeiling {
  const normDist = (distanceType || "").toLowerCase();
  const normSport = (sportCategory || "").toLowerCase();

  if (normDist.includes("140_6") || normDist.includes("full") || normDist.includes("ironman")) {
    return { min: 80, optimal: 110, maxSafe: 140, runRampCap: 1.5 };
  }
  if (normDist.includes("70_3") || normDist.includes("half_triathlon") || normDist.includes("medio")) {
    return { min: 65, optimal: 85, maxSafe: 110, runRampCap: 1.5 };
  }
  if (normDist.includes("short") || normDist.includes("olympic") || normDist.includes("sprint") || normSport.includes("triathlon")) {
    return { min: 45, optimal: 65, maxSafe: 80, runRampCap: 1.5 };
  }
  if (normDist.includes("gran_fondo") || normDist.includes("fondo") || normDist.includes("cycling") || normSport.includes("cycling")) {
    return { min: 65, optimal: 90, maxSafe: 125 };
  }
  if (normDist.includes("trail") || normDist.includes("ultra") || normSport.includes("trail")) {
    return { min: 60, optimal: 85, maxSafe: 115 };
  }
  if (normDist.includes("42k") || normDist.includes("marathon") || (targetDistanceKm && targetDistanceKm >= 40 && targetDistanceKm <= 45)) {
    return { min: 65, optimal: 85, maxSafe: 105 };
  }
  if (normDist.includes("21k") || normDist.includes("half_marathon") || (targetDistanceKm && targetDistanceKm >= 20 && targetDistanceKm <= 25)) {
    return { min: 50, optimal: 70, maxSafe: 85 };
  }
  if (normDist.includes("5k") || normDist.includes("10k") || (targetDistanceKm && targetDistanceKm <= 12)) {
    return { min: 40, optimal: 60, maxSafe: 75 };
  }
  return { min: 45, optimal: 65, maxSafe: 80 };
}

/**
 * Regla de Congelamiento Pre-Competencia (Freeze Window):
 * A falta de <= 4 semanas para el evento principal, queda congelado cualquier incremento de CTL/volumen.
 */
export function isFreezeWindowActive(countdownWeeks: number): boolean {
  return countdownWeeks <= 4;
}

/**
 * Motor de Potencial Fisiológico CTL (CTL Potential Engine).
 * Implementa el ascenso bietápico (Reconquista con memoria biológica + Expansión a tasa adaptativa).
 */
export function calculateTargetPeakCtlPotential(input: CtlPotentialInput): CtlPotentialOutput {
  const currentCtl = Math.max(12, input.currentCtl || 30);
  const histPeak = input.histPeak || input.historicalMetrics?.peakCtlLastYear;
  const totalWeeks = input.totalWeeks || input.weeksCount || 12;
  const buildWeeks = Math.max(2, totalWeeks - 2);
  const sportCeiling = getSportCtlCeiling(input.sportCategory, input.distanceType, input.targetDistanceKm);
  const hasStrongEngine = (histPeak || currentCtl) >= 65 && currentCtl < (histPeak || 70) * 0.85;

  let targetPeakCtl: number;
  let isExpansion = false;
  let reconquestWeeks = 0;
  let expansionWeeks = 0;

  if (histPeak && histPeak > currentCtl) {
    const reconRampRate = hasStrongEngine ? (buildWeeks <= 8 ? 3.8 : 3.2) : 2.8;
    const weeksToReconquer = (histPeak - currentCtl) / reconRampRate;

    if (buildWeeks > weeksToReconquer) {
      reconquestWeeks = Math.round(weeksToReconquer * 10) / 10;
      expansionWeeks = Math.round((buildWeeks - weeksToReconquer) * 10) / 10;
      const expansionRampRate = 1.8;
      const rawPotential = histPeak + expansionWeeks * expansionRampRate;

      const isMaster = typeof input.age === "number" && input.age >= 45;
      const annualCapRatio = isMaster ? 1.10 : 1.15;
      const annualCap = histPeak * annualCapRatio;

      targetPeakCtl = Math.round(Math.min(sportCeiling.maxSafe, Math.min(annualCap, rawPotential)) * 10) / 10;
      isExpansion = targetPeakCtl > histPeak;
    } else {
      reconquestWeeks = buildWeeks;
      targetPeakCtl = Math.round(Math.min(histPeak, currentCtl + buildWeeks * reconRampRate) * 10) / 10;
    }
  } else {
    // Si no hay histPeak demostrable, progresión base gradual
    const safeRampRate = hasStrongEngine ? (buildWeeks <= 8 ? 3.8 : 3.2) : 2.2;
    const attainableCtl = currentCtl + buildWeeks * safeRampRate;
    let optimal = 65;
    if (input.targetDistanceKm && input.targetDistanceKm > 100) optimal = 80;
    targetPeakCtl = Math.round(Math.min(optimal + 10, Math.max(45, attainableCtl)) * 10) / 10;
  }

  const targetPeakWeeklyTss = Math.round(Math.max(7 * targetPeakCtl + 45 * 1.5, (targetPeakCtl * 7) / 0.84));
  const startWeeklyTss = Math.round(7 * currentCtl + 45 * (hasStrongEngine ? 2.2 : 1.8));
  const weeklyRampRate = Math.round(((targetPeakCtl - currentCtl) / buildWeeks) * 10) / 10;

  return {
    targetPeakCtl,
    targetPeakWeeklyTss,
    startWeeklyTss,
    weeklyRampRate,
    isExpansion,
    reconquestWeeks,
    expansionWeeks,
    histPeak,
  };
}

export interface UpgradeDiffItem {
  day: string;
  currentWorkout: string;
  proposedWorkout: string;
  changeSummary: string;
  isKeyWorkout: boolean;
}

export interface MacrocycleUpgradeProposal {
  id: string;
  athleteId: string;
  createdAt: string;
  triggerType: "FIELD_TEST" | "CAPACITY_EXPANSION";
  triggerDetail: string;
  currentPeakCtl: number;
  proposedPeakCtl: number;
  weeklyTimeDeltaMin: number;
  keyLongWorkoutDelta: string;
  nextWeekDiff: UpgradeDiffItem[];
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface TestEvaluationResult {
  eligibleForUpgrade: boolean;
  reason: string;
  isMalDia?: boolean;
  isFreezeWindow?: boolean;
  proposal?: MacrocycleUpgradeProposal;
}

function buildDynamicUpgradeDiff(
  testSport: "Ride" | "Run" | "Swim",
  prevVal: number,
  newVal: number
): { diffItems: UpgradeDiffItem[]; keyDeltaText: string } {
  if (testSport === "Ride") {
    const prevW = Math.round(prevVal), newW = Math.round(newVal), dW = newW - prevW;
    return {
      keyDeltaText: `Fondo ciclista ajusta potencia crucero de ${Math.round(prevW * 0.68)}W a ${Math.round(newW * 0.68)}W`,
      diffItems: [
        { day: "Martes", currentWorkout: `Intervalos de Umbral (4x8m @ ${Math.round(prevW * 1.04)}W)`, proposedWorkout: `Intervalos de Umbral (4x8m @ ${Math.round(newW * 1.04)}W)`, changeSummary: `+${Math.round(dW * 1.04)}W por nuevo FTP`, isKeyWorkout: true },
        { day: "Jueves", currentWorkout: `Rodaje Z2 60m (${Math.round(prevW * 0.65)}W)`, proposedWorkout: `Rodaje Z2 60m (${Math.round(newW * 0.65)}W)`, changeSummary: `+${Math.round(dW * 0.65)}W en rodaje aeróbico`, isKeyWorkout: false },
        { day: "Sábado", currentWorkout: "Descanso Total / Soltura", proposedWorkout: "Descanso Total / Soltura", changeSummary: "Sin modificaciones", isKeyWorkout: false },
        { day: "Domingo", currentWorkout: `Fondo Resistencia Z2 (${Math.round(prevW * 0.68)}W)`, proposedWorkout: `Fondo Resistencia Z2 (${Math.round(newW * 0.68)}W)`, changeSummary: `+${Math.round(dW * 0.68)}W en ritmo crucero`, isKeyWorkout: true },
      ],
    };
  }

  if (testSport === "Swim") {
    const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.round(s % 60) < 10 ? "0" : ""}${Math.round(s % 60)}`;
    const prevCSS = fmt(prevVal), newCSS = fmt(newVal), dSec = Math.round(prevVal - newVal);
    return {
      keyDeltaText: `Ritmo de referencia CSS se ajusta de ${prevCSS}/100m a ${newCSS}/100m`,
      diffItems: [
        { day: "Martes", currentWorkout: `Series CSS (8x 100m @ ${prevCSS}/100m)`, proposedWorkout: `Series CSS (8x 100m @ ${newCSS}/100m)`, changeSummary: `${dSec > 0 ? dSec : 2}s/100m más rápido por nuevo CSS`, isKeyWorkout: true },
        { day: "Jueves", currentWorkout: "Fondo Aeróbico Pull/Palas Z2", proposedWorkout: "Fondo Aeróbico Pull/Palas Z2 (Pacing optimizado)", changeSummary: "Tracción y economía de nado adaptadas", isKeyWorkout: false },
        { day: "Sábado", currentWorkout: "Descanso Total", proposedWorkout: "Descanso Total", changeSummary: "Sin modificaciones", isKeyWorkout: false },
        { day: "Domingo", currentWorkout: "Nado Continuo de Resistencia (2000m)", proposedWorkout: "Nado Continuo de Resistencia (2200m)", changeSummary: "+200m de volumen aeróbico asimilable", isKeyWorkout: true },
      ],
    };
  }

  // Running
  const isPwr = prevVal > 120;
  if (isPwr) {
    const prevU = Math.round(prevVal * 0.95), newU = Math.round(newVal * 0.95);
    return {
      keyDeltaText: "Tirada dominical sube volumen de forma gradual con potencia recalculada",
      diffItems: [
        { day: "Martes", currentWorkout: `Series de Umbral (5x1000m @ ${prevU}W)`, proposedWorkout: `Series de Umbral (5x1000m @ ${newU}W)`, changeSummary: `+${newU - prevU}W por nuevo CP`, isKeyWorkout: true },
        { day: "Jueves", currentWorkout: `Rodaje Z2 60m (${Math.round(prevVal * 0.72)}W)`, proposedWorkout: `Rodaje Z2 60m (${Math.round(newVal * 0.72)}W)`, changeSummary: `+${Math.round((newVal - prevVal) * 0.72)}W aeróbico`, isKeyWorkout: false },
        { day: "Sábado", currentWorkout: "Descanso Total", proposedWorkout: "Descanso Total", changeSummary: "Sin modificaciones", isKeyWorkout: false },
        { day: "Domingo", currentWorkout: `Tirada Larga Z2 (${Math.round(prevVal * 0.72)}W)`, proposedWorkout: `Tirada Larga Z2 (${Math.round(newVal * 0.72)}W, +2 km)`, changeSummary: "+2 km adicionales y potencia recalculada", isKeyWorkout: true },
      ],
    };
  }

  const fmtP = (s: number) => `${Math.floor(s / 60)}:${Math.round(s % 60) < 10 ? "0" : ""}${Math.round(s % 60)}/km`;
  const dP = Math.round(prevVal - newVal);
  return {
    keyDeltaText: "Tirada dominical incrementa volumen manteniendo nuevo ritmo base",
    diffItems: [
      { day: "Martes", currentWorkout: `Series de Umbral (5x1000m @ ${fmtP(prevVal)})`, proposedWorkout: `Series de Umbral (5x1000m @ ${fmtP(newVal)})`, changeSummary: `${dP > 0 ? dP : 4}s/km más rápido por nuevo ritmo umbral`, isKeyWorkout: true },
      { day: "Jueves", currentWorkout: `Rodaje Z2 60m (${fmtP(prevVal + 45)})`, proposedWorkout: `Rodaje Z2 60m (${fmtP(newVal + 45)})`, changeSummary: "Ritmo aeróbico recalibrado", isKeyWorkout: false },
      { day: "Sábado", currentWorkout: "Descanso Total", proposedWorkout: "Descanso Total", changeSummary: "Sin modificaciones", isKeyWorkout: false },
      { day: "Domingo", currentWorkout: "Tirada Larga Z2", proposedWorkout: "Tirada Larga Z2 (+2 km)", changeSummary: "+2 km de fondo aeróbico a ritmo actualizado", isKeyWorkout: true },
    ],
  };
}

/**
 * Evalúa el resultado de un test oficial según el Principio de No-Degradación:
 * - Si es mejora (>= +2%): Genera propuesta de UPGRADE si no está en Freeze Window.
 * - Si está a <= 4 semanas de la carrera (Freeze Window): Bloquea aumento de carga.
 * - Si es caída (> -5%): Filtro de Mal Día (no deprime el macrociclo).
 */
export function evaluateTestForUpgrade(
  athleteId: string,
  testSport: "Ride" | "Run" | "Swim",
  newThresholdValue: number,
  previousThresholdValue: number,
  currentBlueprint: MacrocycleBlueprint | null,
  weeksUntilRace: number = 10
): TestEvaluationResult {
  if (previousThresholdValue <= 0) {
    return { eligibleForUpgrade: false, reason: "Sin valor previo de referencia para comparar." };
  }

  const deltaPercent = ((newThresholdValue - previousThresholdValue) / previousThresholdValue) * 100;

  // 1. Filtro de Mal Día
  if (deltaPercent < -5.0) {
    return {
      eligibleForUpgrade: false,
      isMalDia: true,
      reason: `Rendimiento atípico detectado (${deltaPercent.toFixed(1)}%). No se deprime el macrociclo. Se sugiere repetir el test en 7-10 días.`,
    };
  }

  // 2. Filtro de Congelamiento Pre-Competencia (Freeze Window)
  if (isFreezeWindowActive(weeksUntilRace)) {
    return {
      eligibleForUpgrade: false,
      isFreezeWindow: true,
      reason: `Freeze Window activo (faltan ${weeksUntilRace} semanas). Solo se actualizan zonas fisiológicas; volumen y CTL quedan blindados para el Tapering.`,
    };
  }

  // 3. Verificación de Mejora Real (>= +2%)
  if (deltaPercent < 2.0) {
    return {
      eligibleForUpgrade: false,
      reason: `Variación menor (+${deltaPercent.toFixed(1)}%). El plan actual es adecuado y se mantiene firme.`,
    };
  }

  const currentCtl = currentBlueprint?.athleteCtlAtCreation || 45;
  const currentPeak = currentBlueprint?.targetPeakCtl || 70;
  const unit = testSport === "Ride" ? "W" : (testSport === "Run" ? "W / seg" : "s/100m");
  const diffVal = newThresholdValue - previousThresholdValue;
  const sign = diffVal >= 0 ? "+" : "";

  // Proyección con el motor de potencial
  const potential = calculateTargetPeakCtlPotential({
    currentCtl,
    histPeak: currentPeak,
    totalWeeks: currentBlueprint?.totalWeeks || 16,
    distanceType: currentBlueprint?.distanceType,
  });

  const proposedPeak = Math.max(currentPeak + 2, potential.targetPeakCtl);

  const dynamicDiff = buildDynamicUpgradeDiff(testSport, previousThresholdValue, newThresholdValue);

  const proposal: MacrocycleUpgradeProposal = {
    id: `upgrade-${athleteId}-${Date.now()}`,
    athleteId,
    createdAt: new Date().toISOString(),
    triggerType: "FIELD_TEST",
    triggerDetail: `Test de ${testSport} arrojó ${newThresholdValue}${unit} (${sign}${diffVal}${unit}, +${deltaPercent.toFixed(1)}%)`,
    currentPeakCtl: currentPeak,
    proposedPeakCtl: proposedPeak,
    weeklyTimeDeltaMin: 35,
    keyLongWorkoutDelta: dynamicDiff.keyDeltaText,
    nextWeekDiff: dynamicDiff.diffItems,
    status: "PENDING",
  };

  return {
    eligibleForUpgrade: true,
    reason: `¡Nuevo récord en test! Se superó el umbral en +${deltaPercent.toFixed(1)}%. Propuesta de upgrade lista.`,
    proposal,
  };
}
