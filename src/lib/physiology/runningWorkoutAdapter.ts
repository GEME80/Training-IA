import { RunningTrainingMode } from "../db/types";
import { parseWorkoutDoc } from "./workoutDocParser";

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
  swimCssSecPer100m?: number;
  swimCssStr?: string;
  swim_threshold_pace?: number;
}

export interface PaceZoneItem {
  id: string;
  name: string;
  nameColor: string;
  pct: string;
  range: string;
}

export interface SwimZoneItem {
  id: string;
  name: string;
  nameColor: string;
  pct: string;
  range: string;
}

/**
 * Resuelve la modalidad de carrera del atleta garantizando 100% de retrocompatibilidad.
 * Atletas con Stryd CP o modo explícito POWER -> "POWER" (blindado).
 * Atletas sin potenciómetro o modo HYBRID previo -> "PACE" (100% por ritmo).
 */
export function resolveRunningMode(profile?: RunningProfileMetrics | null): RunningTrainingMode {
  if (!profile) return "POWER";
  if (profile.hasRunningPowerMeter === true || profile.runningTrainingMode === "POWER") return "POWER";
  if (profile.hasRunningPowerMeter === false || profile.runningTrainingMode === "PACE" || profile.runningTrainingMode === "HYBRID") return "PACE";
  const effFtp = profile.runFtp ?? profile.run_ftp ?? 0;
  return effFtp > 0 ? "POWER" : "PACE";
}

/**
 * Convierte segundos por 100m a string de ritmo "M:SS"
 */
export function formatSwimPace(secPer100m?: number): string {
  if (!secPer100m || secPer100m <= 0 || !Number.isFinite(secPer100m)) return "—";
  const mins = Math.floor(secPer100m / 60);
  const secs = Math.round(secPer100m % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Parsea string de ritmo natación "1:45" o "1:45/100m" a segundos por 100m
 */
export function parseSwimPaceToSeconds(paceStr?: string): number {
  if (!paceStr) return 105; // 1:45 por defecto
  const clean = paceStr.replace("/100m", "").replace("/100", "").trim();
  const parts = clean.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const numeric = parseFloat(clean);
  return !Number.isNaN(numeric) && numeric > 0 ? Math.round(numeric * 60) : 105;
}

/**
 * Calcula dinámicamente las 5 zonas de natación basadas en CSS (Jan Olbrecht / Joe Friel)
 */
export function calculateSwimCssZones(cssSec: number = 105): SwimZoneItem[] {
  const css = cssSec > 0 ? cssSec : 105;
  const z1Start = Math.round(css / 0.65);
  const z1End = Math.round(css / 0.75);
  const z2Start = Math.round(css / 0.75);
  const z2End = Math.round(css / 0.85);
  const z3Start = Math.round(css / 0.85);
  const z3End = Math.round(css / 0.94);
  const z4Start = Math.round(css / 0.95);
  const z4End = Math.round(css / 1.05);
  const z5End = Math.round(css / 1.15);

  return [
    { id: "Z1", name: "Suave / Técnica", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 75% CSS", range: `${formatSwimPace(z1End)} - ${formatSwimPace(z1Start)} /100m` },
    { id: "Z2", name: "Resistencia Base", nameColor: "text-sky-600 dark:text-sky-400", pct: "75 - 85% CSS", range: `${formatSwimPace(z2End)} - ${formatSwimPace(z2Start)} /100m` },
    { id: "Z3", name: "Tempo / Crucero", nameColor: "text-teal-600 dark:text-teal-400", pct: "85 - 94% CSS", range: `${formatSwimPace(z3End)} - ${formatSwimPace(z3Start)} /100m` },
    { id: "Z4", name: "Umbral CSS", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "95 - 105% CSS", range: `${formatSwimPace(z4End)} - ${formatSwimPace(z4Start)} /100m` },
    { id: "Z5", name: "Sprint / VO2max", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 105% CSS", range: `< ${formatSwimPace(z5End)} /100m` },
  ];
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
  const p1S = Math.round(tp / 0.65), p1E = Math.round(tp / 0.75), p2E = Math.round(tp / 0.85);
  const p3E = Math.round(tp / 0.94), p4E = Math.round(tp / 1.04), p5S = Math.round(tp / 1.05), p5E = Math.round(tp / 1.15);

  return [
    { id: "Z1", name: "Fácil", nameColor: "text-slate-600 dark:text-slate-400", pct: "< 75% Pace", range: `${formatPace(p1E)} - ${formatPace(p1S)} /km` },
    { id: "Z2", name: "Moderado", nameColor: "text-sky-600 dark:text-sky-400", pct: "75 - 85% Pace", range: `${formatPace(p2E)} - ${formatPace(p1E)} /km` },
    { id: "Z3", name: "Tempo", nameColor: "text-teal-600 dark:text-teal-400", pct: "85 - 94% Pace", range: `${formatPace(p3E)} - ${formatPace(p2E)} /km` },
    { id: "Z4", name: "Umbral", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "95 - 104% Pace", range: `${formatPace(p4E)} - ${formatPace(p3E)} /km` },
    { id: "Z5", name: "Intervalo", nameColor: "text-orange-500 dark:text-orange-400", pct: "105 - 115% Pace", range: `${formatPace(p5E)} - ${formatPace(p5S)} /km` },
    { id: "Z6", name: "Repetición", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 115% Pace", range: `< ${formatPace(p5E)} /km` },
  ];
}

/**
 * Determina si una sesión de carrera es estímulo de calidad (series, tempo, umbral, VO2)
 */
export function isQualityRunningWorkout(workoutName?: string, doc?: string, day?: string): boolean {
  const c = `${workoutName || ""} ${doc || ""} ${day || ""}`.toLowerCase();
  return /serie|umbral|threshold|tempo|fartlek|cuesta|vo2|interval|velocidad|reactiv/.test(c) || day === "Martes";
}

/**
 * Mapea porcentajes de potencia (Stryd % CP) a zonas fisiológicas de ritmo (% Pace)
 * asegurando biomecánica real y zonas de esfuerzo Daniels / Intervals.icu:
 * - >=95%: Umbral / VO2max / Repeticiones (invariante 1:1)
 * - 80-94%: Ritmo Tempo / Maratón / 70.3 -> 86-94% Pace (Z3)
 * - 68-79%: Aeróbico Base Z2 -> 78-84% Pace (Z2 Moderada)
 * - 60-67%: Calentamiento / trote fluido -> 74-77% Pace (Z1-Z2 activa)
 * - <60%: Enfriamiento / recuperación activa -> 68-73% Pace (¡nunca <68% para evitar caminar!)
 */
export function mapPowerPctToPacePct(pwrPct: number): number {
  if (pwrPct >= 95) return pwrPct;
  if (pwrPct >= 80) return Math.round(86 + ((pwrPct - 80) / 14) * 8);
  if (pwrPct >= 68) return Math.round(78 + ((pwrPct - 68) / 11) * 6);
  if (pwrPct >= 60) return Math.round(74 + ((pwrPct - 60) / 7) * 3);
  return Math.max(68, Math.round(68 + ((Math.max(40, pwrPct) - 40) / 20) * 5));
}

/**
 * Traduce el workoutDoc al vuelo según la modalidad del atleta.
 * En modo POWER devuelve el texto 100% idéntico con % FTP (INVARIANZA TOTAL).
 * En modo PACE sustituye y escala fisiológicamente a % Pace (calidad, tempo y fondos).
 */
export function adaptRunningWorkoutDoc(
  workoutDoc: string, discipline: string, isQuality: boolean, mode: RunningTrainingMode = "POWER"
): string {
  if (!workoutDoc || discipline !== "Carrera" || mode === "POWER") return workoutDoc;
  let inCyclingBlock = false;
  return workoutDoc.split("\n").map((line) => {
    if (/ciclismo|bici\b|bike|sector\s*2/i.test(line)) inCyclingBlock = true;
    else if (/carrera|run\b|trote|sector\s*3|transici[oó]n\s*t2|bloque\s*2/i.test(line)) inCyclingBlock = false;
    if (inCyclingBlock) return line;

    const scaled = line.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:Stryd\s*)?(?:CP|FTP)/gi, (_, p1, p2) => {
      const pace1 = mapPowerPctToPacePct(parseInt(p1, 10));
      if (p2) return `${pace1}-${mapPowerPctToPacePct(parseInt(p2, 10))}% Pace`;
      return `${pace1}% Pace`;
    });

    return scaled
      .replace(/%\s*(?:Stryd\s*)?(?:CP|FTP)/gi, "% Pace")
      .replace(/\bStryd\s*CP\b/gi, "Pace")
      .replace(/\bStryd\b/gi, "Ritmo")
      .replace(/Potencia\s*Cr[íi]tica/gi, "Ritmo Umbral")
      .replace(/\s*\(\d+W\)/gi, "");
  }).join("\n");
}

function stripNestedTarget(str: string, pattern: RegExp): string {
  let s = str;
  while (pattern.test(s)) s = s.replace(pattern, "$1");
  return s.replace(/^\(+([^\(\)]+)\)+$/, "$1").trim();
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
    swimCssSec?: number;
    lthr?: number;
    isQuality?: boolean;
  } = {}
): string {
  if (!rawTarget) return rawTarget;
  const { discipline = "Carrera", mode = "POWER", runFtp, bikeFtp, thresholdPaceSec = 270, swimCssSec = 105 } = opts;

  // 1. Ciclismo: 100% vatios FTP
  if (discipline === "Ciclismo") {
    if (!bikeFtp || bikeFtp <= 0) return rawTarget;
    const cleanBike = stripNestedTarget(rawTarget, /\b\d+\s*(?:-\s*\d+)?\s*W\s*\(([^()]+)\)/gi);
    return cleanBike
      .replace(/(?:(\d+)\s*%\s*a\s*(\d+)\s*%\s*FTP|(\d+)\s*-\s*(\d+)\s*%\s*FTP)/gi, (_, a1, a2, r1, r2) => {
        const p1 = parseInt(a1 || r1, 10), p2 = parseInt(a2 || r2, 10);
        return `${Math.round(bikeFtp * (p1 / 100))}-${Math.round(bikeFtp * (p2 / 100))}W (${p1}-${p2}% FTP)`;
      })
      .replace(/(?<![(-])\b(\d+)\s*%\s*FTP/gi, (_, p) => `${Math.round(bikeFtp * (parseInt(p, 10) / 100))}W (${p}% FTP)`);
  }

  // 2. Natación: Ritmo CSS por 100m
  if (discipline === "Natacion") {
    const css = swimCssSec > 0 ? swimCssSec : 105;
    const cleanSwim = stripNestedTarget(rawTarget, /\b\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\/100m\s*\(([^()]+)\)/gi);
    return cleanSwim.replace(/(?:(\d+)\s*-\s*(\d+)\s*%\s*(?:CSS|Pace)|(\d+)\s*%\s*(?:CSS|Pace))/gi, (_, r1, r2, s1) => {
      if (r1 && r2) {
        const p1 = parseInt(r1, 10), p2 = parseInt(r2, 10);
        const sec1 = Math.round(css / (p1 / 100)), sec2 = Math.round(css / (p2 / 100));
        return `${formatSwimPace(Math.max(sec1, sec2))}-${formatSwimPace(Math.min(sec1, sec2))}/100m (${p1}-${p2}% CSS)`;
      }
      const p = parseInt(s1, 10);
      return `${formatSwimPace(Math.round(css / (p / 100)))}/100m (${p}% CSS)`;
    });
  }

  if (discipline !== "Carrera") return rawTarget;

  // 3. Carrera en Modo Potencia: 100% vatios Stryd (% CP) (BLINDADO - CERO CAMBIOS)
  if (mode === "POWER") {
    if (!runFtp || runFtp <= 0) return rawTarget;
    const cleanPwr = stripNestedTarget(rawTarget, /\b\d+\s*(?:-\s*\d+)?\s*W\s*\(([^()]+)\)/gi);
    return cleanPwr
      .replace(/(?:(\d+)\s*%\s*a\s*(\d+)\s*%\s*CP|(\d+)\s*-\s*(\d+)\s*%\s*CP)/gi, (_, a1, a2, r1, r2) => {
        const p1 = parseInt(a1 || r1, 10), p2 = parseInt(a2 || r2, 10);
        return `${Math.round(runFtp * (p1 / 100))}-${Math.round(runFtp * (p2 / 100))}W (${p1}-${p2}% CP)`;
      })
      .replace(/(?<![(-])\b(\d+)\s*%\s*CP/gi, (_, p) => `${Math.round(runFtp * (parseInt(p, 10) / 100))}W (${p}% CP)`);
  }

  // 4. Carrera en Modo Ritmo (PACE): 100% min/km y % Pace (CERO VATIOS, IDEMPOTENTE)
  const tp = thresholdPaceSec > 0 ? thresholdPaceSec : 270;
  let cleanPace = rawTarget
    .replace(/Stryd\s*Critical\s*Power\s*\(CP\)/gi, "Ritmo Umbral (Pace)")
    .replace(/Stryd\s*CP/gi, "Ritmo Umbral (Pace)")
    .replace(/Potencia\s*Cr[íi]tica/gi, "Ritmo Umbral")
    .replace(/\bStryd\b/gi, "Ritmo")
    .replace(/\s*\(\d+\s*W\)/gi, "")
    .replace(/\b\d+\s*W\b\s*/gi, "");

  cleanPace = stripNestedTarget(cleanPace, /\b\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\/km\s*\(([^()]+)\)/gi);

  return cleanPace.replace(/(?:(\d+)\s*-\s*(\d+)\s*%\s*(?:CP|FTP|Pace|LTHR)|(\d+)\s*%\s*(?:CP|FTP|Pace|LTHR))/gi, (match, r1, r2, s1) => {
    if (r1 && r2) {
      let p1 = parseInt(r1, 10), p2 = parseInt(r2, 10);
      if (/CP|FTP/i.test(match)) { p1 = mapPowerPctToPacePct(p1); p2 = mapPowerPctToPacePct(p2); }
      const sec1 = Math.round(tp / (p1 / 100)), sec2 = Math.round(tp / (p2 / 100));
      return `${formatPace(Math.max(sec1, sec2))}-${formatPace(Math.min(sec1, sec2))}/km (${p1}-${p2}% Pace)`;
    }
    let p = parseInt(s1, 10);
    if (/CP|FTP/i.test(match)) p = mapPowerPctToPacePct(p);
    return `${formatPace(Math.round(tp / (p / 100)))}/km (${p}% Pace)`;
  });
}

/**
 * Adapta un PlanItem completo de carrera si el atleta entrena en Modo Ritmo.
 * Si el atleta entrena con Stryd (POWER), retorna el PlanItem intacto sin mutaciones (INVARIANZA 100%).
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
  if (mode === "POWER") return item; // BLINDAJE INVIOLABLE: Atletas Stryd quedan 100% intactos

  const isQuality = isQualityRunningWorkout(item.workoutName || "", item.workoutDoc, item.day);
  const adaptedDoc = item.workoutDoc ? adaptRunningWorkoutDoc(item.workoutDoc, item.discipline, isQuality, mode) : item.workoutDoc;
  const rawTarget = item.powerTarget
    ? interpolateWorkoutTarget(item.powerTarget, { discipline: "Carrera", mode: "PACE", thresholdPaceSec: opts.thresholdPaceSec, lthr: opts.lthr, isQuality })
    : item.powerTarget;
  const adaptedTarget = rawTarget
    ?.replace(/Stryd\s*Critical\s*Power\s*\(CP\)/gi, "Ritmo Umbral (Pace)")
    .replace(/Stryd\s*CP/gi, "Ritmo Umbral (Pace)")
    .replace(/Potencia\s*Cr[íi]tica/gi, "Ritmo Umbral");

  const adaptedName = item.workoutName
    ? item.workoutName
        .replace(/\s*\(\d+W\)/gi, "")
        .replace(/%\s*(?:Stryd\s*)?(?:CP|FTP)/gi, "% Pace")
        .replace(/\bStryd\s*CP\b/gi, "Pace")
        .replace(/\bStryd\b/gi, "Ritmo")
        .replace(/Potencia\s*Cr[íi]tica|Critical\s*Power/gi, "Ritmo Umbral")
        .replace(/Test Oficial Stryd CP/gi, "Test Oficial Ritmo Umbral (Pace)")
    : item.workoutName;

  let adaptedTss = (item as any).tss;
  if (adaptedDoc && adaptedDoc !== item.workoutDoc) {
    const parsed = parseWorkoutDoc(adaptedDoc, "Carrera");
    if (parsed.estimatedTss && parsed.estimatedTss > (adaptedTss || 0)) {
      adaptedTss = parsed.estimatedTss;
    }
  }

  return {
    ...item,
    workoutName: adaptedName || item.workoutName,
    workoutDoc: adaptedDoc,
    powerTarget: adaptedTarget || item.powerTarget,
    tss: adaptedTss,
  };
}

