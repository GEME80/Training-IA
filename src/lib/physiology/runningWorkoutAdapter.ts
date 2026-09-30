import { RunningTrainingMode } from "../db/types";

export interface RunningProfileMetrics {
  hasRunningPowerMeter?: boolean;
  runningTrainingMode?: RunningTrainingMode;
  runFtp?: number;
  run_ftp?: number;
  bikeFtp?: number;
  bike_ftp?: number;
  lthr?: number;
  maxHR?: number;
  runThresholdPaceSecPerKm?: number;
  runThresholdPaceStr?: string;
  threshold_pace?: number; // m/s en Intervals.icu
}

export interface PaceZoneItem {
  id: string;
  name: string;
  nameColor: string;
  pct: string;
  range: string;
}

/**
 * Resuelve la modalidad de carrera del atleta garantizando 100% de retrocompatibilidad.
 */
export function resolveRunningMode(profile?: RunningProfileMetrics | null): RunningTrainingMode {
  if (!profile) return "POWER";
  if (profile.hasRunningPowerMeter === true || profile.runningTrainingMode === "POWER") {
    return "POWER";
  }
  if (profile.hasRunningPowerMeter === false || profile.runningTrainingMode === "HYBRID") {
    return "HYBRID";
  }
  // Si no está definido pero tiene Stryd CP calibrado -> MODO POTENCIA INTACTO
  const effFtp = profile.runFtp ?? profile.run_ftp ?? 0;
  if (effFtp > 0) {
    return "POWER";
  }
  return "HYBRID";
}

/**
 * Convierte segundos por kilómetro a string de ritmo "M:SS"
 */
export function formatPace(secPerKm?: number): string {
  if (!secPerKm || secPerKm <= 0 || !Number.isFinite(secPerKm)) return "—";
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.round(secPerKm % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Parsea string de ritmo "4:30" o "4:30/km" a segundos por kilómetro
 */
export function parsePaceToSeconds(paceStr?: string): number {
  if (!paceStr) return 270; // 4:30 por defecto
  const clean = paceStr.replace("/km", "").trim();
  const parts = clean.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const numeric = parseFloat(clean);
  return !Number.isNaN(numeric) && numeric > 0 ? Math.round(numeric * 60) : 270;
}

/**
 * Calcula dinámicamente las 6 zonas de ritmo de carrera (Jack Daniels / Intervals.icu)
 */
export function calculatePaceZones(thresholdPaceSec: number = 270): PaceZoneItem[] {
  const tp = thresholdPaceSec > 0 ? thresholdPaceSec : 270;

  // En ritmo: a mayor porcentaje de velocidad (% Pace), menor tiempo en segundos por km
  const pZ1Start = Math.round(tp / 0.65);
  const pZ1End = Math.round(tp / 0.75);

  const pZ2Start = Math.round(tp / 0.75);
  const pZ2End = Math.round(tp / 0.85);

  const pZ3Start = Math.round(tp / 0.85);
  const pZ3End = Math.round(tp / 0.94);

  const pZ4Start = Math.round(tp / 0.95);
  const pZ4End = Math.round(tp / 1.04);

  const pZ5Start = Math.round(tp / 1.05);
  const pZ5End = Math.round(tp / 1.15);

  const pZ6End = Math.round(tp / 1.15);

  return [
    { id: "Z1", name: "Fácil", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 75% Pace", range: `${formatPace(pZ1End)} - ${formatPace(pZ1Start)} /km` },
    { id: "Z2", name: "Moderado", nameColor: "text-sky-600 dark:text-sky-400", pct: "75 - 85% Pace", range: `${formatPace(pZ2End)} - ${formatPace(pZ2Start)} /km` },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "85 - 94% Pace", range: `${formatPace(pZ3End)} - ${formatPace(pZ3Start)} /km` },
    { id: "Z4", name: "Umbral", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "95 - 104% Pace", range: `${formatPace(pZ4End)} - ${formatPace(pZ4Start)} /km` },
    { id: "Z5", name: "Intervalo", nameColor: "text-orange-500 dark:text-orange-400", pct: "105 - 115% Pace", range: `${formatPace(pZ5End)} - ${formatPace(pZ5Start)} /km` },
    { id: "Z6", name: "Repetición", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 115% Pace", range: `< ${formatPace(pZ6End)} /km` },
  ];
}

/**
 * Determina si una sesión de carrera es estímulo de calidad (series, tempo, umbral, VO2)
 */
export function isQualityRunningWorkout(workoutName?: string, doc?: string, day?: string): boolean {
  const combined = `${workoutName || ""} ${doc || ""} ${day || ""}`.toLowerCase();
  return (
    combined.includes("serie") ||
    combined.includes("umbral") ||
    combined.includes("threshold") ||
    combined.includes("tempo") ||
    combined.includes("fartlek") ||
    combined.includes("cuesta") ||
    combined.includes("vo2") ||
    combined.includes("interval") ||
    combined.includes("velocidad") ||
    combined.includes("reactiv") ||
    day === "Martes"
  );
}

/**
 * Traduce el workoutDoc al vuelo según la modalidad del atleta.
 * En modo POWER devuelve el texto 100% idéntico con % FTP.
 * En modo HYBRID sustituye por % Pace (calidad) o % LTHR (suaves y fondos).
 */
export function adaptRunningWorkoutDoc(
  workoutDoc: string,
  discipline: string,
  isQuality: boolean,
  mode: RunningTrainingMode = "POWER"
): string {
  if (!workoutDoc || discipline !== "Carrera" || mode === "POWER") {
    return workoutDoc;
  }
  const targetDirective = isQuality ? "% Pace" : "% LTHR";
  return workoutDoc.replace(/%\s*FTP/gi, targetDirective).replace(/%\s*CP/gi, targetDirective);
}

/**
 * Motor universal de recalibración: calcula y formatea el target de intensidad
 * actualizándose dinámicamente cuando el atleta actualiza Potencia, Ritmo o FC.
 */
export function interpolateWorkoutTarget(
  rawTarget: string,
  opts: {
    discipline?: string;
    mode?: RunningTrainingMode;
    runFtp?: number;
    bikeFtp?: number;
    thresholdPaceSec?: number;
    lthr?: number;
    isQuality?: boolean;
  } = {}
): string {
  if (!rawTarget) return rawTarget;
  const { discipline = "Carrera", mode = "POWER", runFtp, bikeFtp, thresholdPaceSec = 270, lthr = 165, isQuality = false } = opts;

  // 1. Ciclismo: 100% vatios FTP
  if (discipline === "Ciclismo") {
    if (!bikeFtp || bikeFtp <= 0) return rawTarget;
    return rawTarget
      .replace(/(?:(\d+)\s*%\s*a\s*(\d+)\s*%\s*FTP|(\d+)\s*-\s*(\d+)\s*%\s*FTP)/gi, (_, a1, a2, r1, r2) => {
        const p1 = parseInt(a1 || r1, 10);
        const p2 = parseInt(a2 || r2, 10);
        return `${Math.round(bikeFtp * (p1 / 100))}-${Math.round(bikeFtp * (p2 / 100))}W (${p1}-${p2}% FTP)`;
      })
      .replace(/(?<![(-])\b(\d+)\s*%\s*FTP/gi, (_, p) => `${Math.round(bikeFtp * (parseInt(p, 10) / 100))}W (${p}% FTP)`);
  }

  if (discipline !== "Carrera") return rawTarget;

  // 2. Carrera en Modo Potencia: 100% vatios Stryd (% CP)
  if (mode === "POWER") {
    if (!runFtp || runFtp <= 0) return rawTarget;
    return rawTarget
      .replace(/(?:(\d+)\s*%\s*a\s*(\d+)\s*%\s*CP|(\d+)\s*-\s*(\d+)\s*%\s*CP)/gi, (_, a1, a2, r1, r2) => {
        const p1 = parseInt(a1 || r1, 10);
        const p2 = parseInt(a2 || r2, 10);
        return `${Math.round(runFtp * (p1 / 100))}-${Math.round(runFtp * (p2 / 100))}W (${p1}-${p2}% CP)`;
      })
      .replace(/(?<![(-])\b(\d+)\s*%\s*CP/gi, (_, p) => `${Math.round(runFtp * (parseInt(p, 10) / 100))}W (${p}% CP)`);
  }

  // 3. Carrera en Modo Híbrido:
  // Si es calidad -> Recalibra en Ritmo (min/km)
  if (isQuality) {
    const tp = thresholdPaceSec > 0 ? thresholdPaceSec : 270;
    return rawTarget.replace(/(?:(\d+)\s*-\s*(\d+)\s*%\s*(?:CP|FTP|Pace)|(\d+)\s*%\s*(?:CP|FTP|Pace))/gi, (_, r1, r2, s1) => {
      if (r1 && r2) {
        const p1 = parseInt(r1, 10);
        const p2 = parseInt(r2, 10);
        const sec1 = Math.round(tp / (p1 / 100));
        const sec2 = Math.round(tp / (p2 / 100));
        return `${formatPace(Math.max(sec1, sec2))}-${formatPace(Math.min(sec1, sec2))}/km (${p1}-${p2}% Pace)`;
      }
      const p = parseInt(s1, 10);
      const sec = Math.round(tp / (p / 100));
      return `${formatPace(sec)}/km (${p}% Pace)`;
    });
  }

  // Si es suave o fondo largo -> Recalibra en Frecuencia Cardíaca (bpm)
  const hr = lthr > 0 ? lthr : 165;
  return rawTarget.replace(/(?:(\d+)\s*-\s*(\d+)\s*%\s*(?:CP|FTP|LTHR)|(\d+)\s*%\s*(?:CP|FTP|LTHR))/gi, (_, r1, r2, s1) => {
    if (r1 && r2) {
      const p1 = parseInt(r1, 10);
      const p2 = parseInt(r2, 10);
      const bpm1 = Math.round(hr * (p1 / 100));
      const bpm2 = Math.round(hr * (p2 / 100));
      return `${bpm1}-${bpm2} bpm (${p1}-${p2}% LTHR)`;
    }
    const p = parseInt(s1, 10);
    const bpm = Math.round(hr * (p / 100));
    return `${bpm} bpm (${p}% LTHR)`;
  });
}

/**
 * Adapta un PlanItem completo de carrera si el atleta entrena en Modo Híbrido.
 * Si el atleta entrena con Stryd (POWER), retorna el PlanItem intacto sin mutaciones.
 */
export function adaptRunningPlanItem<T extends { discipline?: string; workoutName?: string; workoutDoc?: string; powerTarget?: string; day?: string; isRestDay?: boolean }>(
  item: T,
  opts: {
    mode?: RunningTrainingMode;
    thresholdPaceSec?: number;
    lthr?: number;
  } = {}
): T {
  if (item.discipline !== "Carrera" || item.isRestDay) return item;
  const mode = opts.mode || "POWER";
  if (mode === "POWER") return item;

  const isQuality = isQualityRunningWorkout(item.workoutName || "", item.workoutDoc, item.day);
  const adaptedDoc = item.workoutDoc ? adaptRunningWorkoutDoc(item.workoutDoc, item.discipline, isQuality, mode) : item.workoutDoc;
  const adaptedTarget = item.powerTarget
    ? interpolateWorkoutTarget(item.powerTarget, {
        discipline: "Carrera",
        mode: "HYBRID",
        thresholdPaceSec: opts.thresholdPaceSec,
        lthr: opts.lthr,
        isQuality,
      })
    : item.powerTarget;

  return {
    ...item,
    workoutDoc: adaptedDoc,
    powerTarget: adaptedTarget || item.powerTarget,
  };
}

