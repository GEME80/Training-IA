export interface TelemetrySamplePoint {
  sampleIdx: number;
  timeSec: number;
  hr?: number;
  watts?: number;
  alt?: number;
  paceSec?: number;
  paceStr?: string;
}

export function formatSec(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function formatPaceSec(secs: number): string {
  if (!secs || isNaN(secs) || secs <= 0) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}/km`;
}

/**
 * Muestrea series temporales a un número manejable de puntos (default 200)
 * filtrando anomalías de desconexión de sensores de FC (<40 bpm) y picos de GPS.
 */
export function buildSampledData(
  timeArray: number[],
  hrArray: number[],
  wattsArray: number[],
  altArray: number[],
  velocityArray: number[] = [],
  maxSamples = 200
): TelemetrySamplePoint[] {
  const total = timeArray.length;
  if (total === 0) return [];
  const step = Math.max(1, Math.floor(total / maxSamples));
  const result: TelemetrySamplePoint[] = [];

  let sIdx = 0;
  for (let i = 0; i < total; i += step) {
    const rawHr = hrArray[i];
    const validHr = typeof rawHr === "number" && !isNaN(rawHr) && rawHr >= 40 ? Math.round(rawHr) : undefined;
    const rawW = wattsArray[i];
    const validW = typeof rawW === "number" && !isNaN(rawW) && rawW >= 0 ? Math.round(rawW) : undefined;
    const rawA = altArray[i];
    const validA = typeof rawA === "number" && !isNaN(rawA) ? rawA : undefined;

    // velocity_smooth viene en m/s desde Intervals.icu
    const rawV = velocityArray[i];
    let validPaceSec: number | undefined = undefined;
    let paceStr: string | undefined = undefined;
    if (typeof rawV === "number" && !isNaN(rawV) && rawV >= 1.0 && rawV <= 12.0) {
      validPaceSec = Math.round(1000 / rawV);
      paceStr = formatPaceSec(validPaceSec);
    }

    result.push({
      sampleIdx: sIdx++,
      timeSec: timeArray[i] ?? i,
      hr: validHr,
      watts: validW,
      alt: validA,
      paceSec: validPaceSec,
      paceStr,
    });
  }
  return result;
}

/**
 * Agrupa lecturas válidas contiguas para evitar que una pérdida de señal
 * caiga a 0 en el gráfico, permitiendo trazar puentes punteados.
 */
export function buildContinuousSegments<K extends "hr" | "watts" | "paceSec">(
  data: TelemetrySamplePoint[],
  key: K
): Array<Array<{ sampleIdx: number; val: number }>> {
  const segs: Array<Array<{ sampleIdx: number; val: number }>> = [];
  let cur: Array<{ sampleIdx: number; val: number }> = [];

  data.forEach((d) => {
    const v = d[key];
    if (v !== undefined) {
      cur.push({ sampleIdx: d.sampleIdx, val: v });
    } else {
      if (cur.length > 0) {
        segs.push(cur);
        cur = [];
      }
    }
  });
  if (cur.length > 0) segs.push(cur);
  return segs;
}

export function createScaleHelpers(params: {
  totalSamples: number;
  chartWidth: number;
  chartHeight: number;
  padding: { left: number; right: number; top: number; bottom: number };
  minHr: number;
  maxHr: number;
  minAlt: number;
  maxAlt: number;
  maxWatts: number;
  minPaceSec?: number;
  maxPaceSec?: number;
}) {
  const { totalSamples, chartWidth, chartHeight, padding, minHr, maxHr, minAlt, maxAlt, maxWatts, minPaceSec = 180, maxPaceSec = 480 } = params;
  const plotW = chartWidth - padding.left - padding.right;
  const plotH = chartHeight - padding.top - padding.bottom;

  return {
    plotW,
    plotH,
    getX: (index: number) => {
      if (totalSamples <= 1) return padding.left;
      return padding.left + (index / (totalSamples - 1)) * plotW;
    },
    getHrY: (val?: number) => {
      if (val === undefined) return padding.top + plotH;
      const norm = (val - minHr) / (maxHr - minHr || 1);
      return padding.top + plotH - Math.max(0, Math.min(1, norm)) * (plotH * 0.75);
    },
    getWattsY: (val?: number) => {
      if (val === undefined) return padding.top + plotH;
      const norm = val / (maxWatts || 1);
      return padding.top + plotH - Math.max(0, Math.min(1, norm)) * (plotH * 0.85);
    },
    getAltY: (val?: number) => {
      if (val === undefined) return padding.top + plotH;
      const norm = (val - minAlt) / (maxAlt - minAlt || 1);
      return padding.top + plotH - Math.max(0, Math.min(1, norm)) * (plotH * 0.4);
    },
    getPaceY: (val?: number) => {
      if (val === undefined) return padding.top + plotH;
      // Invertido: minPaceSec (más rápido, menor seg/km) arriba; maxPaceSec (más lento) abajo
      const norm = (val - minPaceSec) / (maxPaceSec - minPaceSec || 1);
      return padding.top + Math.max(0, Math.min(1, norm)) * (plotH * 0.8);
    },
  };
}
