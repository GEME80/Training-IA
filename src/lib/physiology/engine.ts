import { AthleteProfile, AthleteWellness, CalendarEvent } from "../intervals/types";

export interface PhysiologicalStatus {
  ctl: number;
  atl: number;
  tsb: number;
  rampRate: number;
  currentHrv: number | null;
  baselineHrvMean: number;
  baselineHrvSd: number;
  hrvZScore: number | null;
  restingHR: number | null;
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  recommendations: string[];
}

/**
 * Calcula la media y desviación estándar de una serie numérica.
 */
function calculateStats(values: number[]): { mean: number; sd: number } {
  if (values.length === 0) return { mean: 0, sd: 0 };
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (values.length === 1) return { mean, sd: 0 };
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (values.length - 1);
  return { mean, sd: Math.sqrt(variance) };
}

/**
 * Motor Fisiológico de Evaluación y Reglas de Carga Banister / HRV Rolling Z-Score.
 */
export class PhysiologicalEngine {
  /**
   * Evalúa el estado fisiológico global combinando el PMC (CTL/ATL/TSB) con la serie temporal de HRV (rMSSD).
   */
  static evaluateAthlete(
    profile: AthleteProfile,
    wellnessHistory: AthleteWellness[]
  ): PhysiologicalStatus {
    // Buscar el registro más reciente que contenga métricas de carga PMC calculadas
    const reversedWellness = [...wellnessHistory].reverse();
    const latestWithLoad = reversedWellness.find(
      (w) =>
        (typeof w.ctl === "number" && w.ctl > 0) ||
        (typeof w.ctlLoad === "number" && w.ctlLoad > 0)
    );

    const ctl =
      latestWithLoad?.ctl ??
      latestWithLoad?.ctlLoad ??
      (typeof profile.ctl === "number" && profile.ctl > 0 ? profile.ctl : 0);

    const atl =
      latestWithLoad?.atl ??
      latestWithLoad?.atlLoad ??
      (typeof profile.atl === "number" && profile.atl > 0 ? profile.atl : 0);

    const tsb =
      latestWithLoad?.tsb ??
      (typeof profile.tsb === "number" ? profile.tsb : Math.round((ctl - atl) * 10) / 10);

    const rampRate =
      latestWithLoad?.rampRate ??
      (typeof profile.rampRate === "number" ? profile.rampRate : 0);

    // Extraer valores válidos de HRV para la línea base móvil (Rolling Baseline) soportando múltiples campos de Intervals
    const getHrvValue = (w: any): number | null => {
      const val = w?.hrv ?? w?.hrvSDNN ?? w?.icu_hrv ?? w?.avgOvernightHrv ?? w?.rmssd;
      return typeof val === "number" && val > 0 ? val : null;
    };

    const validHrvRecords = wellnessHistory
      .map(getHrvValue)
      .filter((v): v is number => v !== null);

    const latestWithHrv = reversedWellness.find((w) => getHrvValue(w) !== null);
    const currentHrv = latestWithHrv ? getHrvValue(latestWithHrv) : null;

    const latestWithRhr = reversedWellness.find(
      (w) => typeof w.restingHR === "number" && w.restingHR > 0
    );
    const restingHR =
      latestWithRhr?.restingHR ??
      profile.restingHR ??
      profile.icu_resting_hr ??
      null;

    let hrvZScore: number | null = null;
    const { mean: baselineHrvMean, sd: baselineHrvSd } = calculateStats(
      validHrvRecords.length > 5 ? validHrvRecords.slice(-30) : validHrvRecords
    );

    if (currentHrv !== null) {
      if (baselineHrvSd > 0) {
        hrvZScore = (currentHrv - baselineHrvMean) / baselineHrvSd;
        hrvZScore = Math.round(hrvZScore * 100) / 100;
      } else {
        hrvZScore = 0.0; // HRV presente y estable
      }
    }

    // Reglas de Clasificación Fisiológica
    const recommendations: string[] = [];
    let status: PhysiologicalStatus["status"] = "OPTIMAL";

    // 1. Fatiga extrema o supresión vagal severa
    if (tsb < -25 || (hrvZScore !== null && hrvZScore < -1.5)) {
      status = "OVERTRAINING_RISK";
      recommendations.push(
        "🚨 ALERTA: Fatiga aguda crítica o caída significativa del tono parasimpático (HRV Z-Score < -1.5). Se aconseja convertir la sesión clave en rodaje Z1 regenerativo o descanso pasivo."
      );
    }
    // 2. Fatiga moderada / zona de precaución
    else if (tsb < -15 || (hrvZScore !== null && hrvZScore < -1.0)) {
      status = "CAUTION";
      recommendations.push(
        "⚠️ PRECAUCIÓN: Carga de fatiga elevada. Monitorear sensaciones de esfuerzo percibido y evitar picos de intensidad no asimilados."
      );
    }
    // 3. Ramp Rate acelerado
    if (rampRate > 8) {
      recommendations.push(
        "⚠️ Ramp Rate Semanal elevado (> +8 pts/sem). Riesgo de sobrecarga rápida; se sugiere planificar microciclo de consolidación."
      );
    }
    // 4. Estado de supercompensación / Taper
    if (tsb > 10) {
      recommendations.push(
        "🟢 Forma física alta (TSB > +10). Excelente momento para competiciones objetivo o sesiones de ritmo específico con alta frescura."
      );
    }
    // 5. Estado adaptativo óptimo estándar
    if (status === "OPTIMAL") {
      recommendations.push(
        "🟢 Equilibrio autonómico y carga de estrés en rango óptimo de adaptación biológica."
      );
    }

    return {
      ctl,
      atl,
      tsb,
      rampRate,
      currentHrv,
      baselineHrvMean: Math.round(baselineHrvMean * 10) / 10,
      baselineHrvSd: Math.round(baselineHrvSd * 10) / 10,
      hrvZScore,
      restingHR,
      status,
      recommendations,
    };
  }

  /**
   * Genera la sintaxis estructurada para Intervals.icu asegurando compatibilidad con Stryd y Garmin.
   */
  static generateWorkoutSyntax(
    discipline: "Run" | "Ride" | "WeightTraining",
    workoutType: "RECOVERY" | "Z2_BASE" | "THRESHOLD_INTERVALS" | "VO2MAX" | "LONG_RUN" | "STRENGTH",
    targetPowerPercentage: number = 100
  ): string {
    if (discipline === "WeightTraining" || workoutType === "STRENGTH") {
      return `Rutina de Fuerza y Prevención Neuromuscular (SGEA):
- Calentamiento articular y movilidad dinámica: 10m
- Sentadilla búlgara con mancuernas: 4 series x 8 reps (RIR 2)
- Peso muerto rumano (cadena posterior): 4 series x 8 reps
- Elevación de talones sóleo sentado: 4 series x 15 reps
- Pliometría suave (Saltos al cajón reactivos): 3 series x 6 reps
- Plancha frontal y anti-rotación Pallof: 3 series x 45s`;
    }

    if (discipline === "Ride") {
      if (workoutType === "RECOVERY") {
        return `Warmup\n- 10m 50% FTP\n\nMain\n- 40m 55% FTP\n\nCooldown\n- 10m 45% FTP`;
      }
      if (workoutType === "LONG_RUN" || workoutType === "Z2_BASE") {
        return `Warmup\n- 15m 55% FTP\n\nMain\n- 1h30m 65% FTP\n\nCooldown\n- 15m 50% FTP`;
      }
      return `Warmup\n- 15m 55% FTP\n\n4x\n- 8m ${targetPowerPercentage}% FTP\n- 3m 55% FTP\n\nCooldown\n- 12m 50% FTP`;
    }

    // Carrera por Potencia Stryd (% FTP / CP)
    switch (workoutType) {
      case "RECOVERY":
        return `Warmup\n- 10m 65% FTP\n\nMain\n- 30m 70% FTP\n\nCooldown\n- 10m 60% FTP`;

      case "Z2_BASE":
        return `Warmup\n- 15m 68% FTP\n\nMain\n- 40m 75% FTP\n\nCooldown\n- 10m 65% FTP`;

      case "THRESHOLD_INTERVALS":
        return `Warmup\n- 15m 70% FTP\n\n4x\n- 8m ${targetPowerPercentage}% FTP\n- 3m 65% FTP\n\nCooldown\n- 10m 62% FTP`;

      case "VO2MAX":
        return `Warmup\n- 20m 70% FTP\n\n5x\n- 3m 108% FTP\n- 3m 60% FTP\n\nCooldown\n- 10m 60% FTP`;

      case "LONG_RUN":
        return `Warmup\n- 20m 72% FTP\n\nMain\n- 1h15m 78% FTP\n- 20m ${targetPowerPercentage}% FTP\n\nCooldown\n- 10m 65% FTP`;

      default:
        return `Warmup\n- 15m 70% FTP\n\nMain\n- 35m 75% FTP\n\nCooldown\n- 10m 60% FTP`;
    }
  }
}
