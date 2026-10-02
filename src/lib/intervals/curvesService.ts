import {
  SportCurvesResponse,
  PowerCurveDataSet,
  PowerCurvePoint,
  PaceCurveDataSet,
  PaceRecordPoint,
  BestEffortRow,
} from "./curvesTypes";

const BASE_URL = "https://intervals.icu/api/v1";

const DURATION_SECS_GRID = [
  1, 2, 5, 10, 15, 30, 45, 60, 90, 120, 180, 300, 480, 600, 900, 1200, 1800, 2700, 3600, 5400, 7200, 10800, 14400,
];

const STANDARD_DISTANCES = [
  { distanceMeters: 400, label: "400m" },
  { distanceMeters: 1000, label: "1 km" },
  { distanceMeters: 2000, label: "2 km" },
  { distanceMeters: 5000, label: "5 km" },
  { distanceMeters: 10000, label: "10 km" },
  { distanceMeters: 21097, label: "21.1 km" },
];

function formatTime(totalSec: number): string {
  if (!totalSec || totalSec <= 0) return "—";
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.round(totalSec % 60);
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatPace(paceSecPerKm: number): string {
  if (!paceSecPerKm || paceSecPerKm <= 0 || !isFinite(paceSecPerKm)) return "— /km";
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${String(secs).padStart(2, "0")}/km`;
}

function parsePowerCurveItem(item: any, weightKg: number): PowerCurveDataSet {
  const points: PowerCurvePoint[] = [];
  const secs: number[] = item.secs || [];
  const watts: number[] = item.watts || [];

  DURATION_SECS_GRID.forEach((targetSec) => {
    let bestVal = 0;
    const directIdx = secs.indexOf(targetSec);
    if (directIdx !== -1) {
      bestVal = watts[directIdx] || 0;
    } else {
      let closestIdx = -1;
      let minDiff = Infinity;
      for (let i = 0; i < secs.length; i++) {
        const diff = Math.abs(secs[i] - targetSec);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      if (closestIdx !== -1 && minDiff <= targetSec * 0.25) {
        bestVal = watts[closestIdx] || 0;
      }
    }

    if (bestVal > 0) {
      let label = `${targetSec}s`;
      if (targetSec >= 3600) label = `${Math.round(targetSec / 3600)}h`;
      else if (targetSec >= 60) label = `${Math.round(targetSec / 60)}m`;

      const wkg = weightKg > 0 ? parseFloat((bestVal / weightKg).toFixed(2)) : 0;
      points.push({ sec: targetSec, label, watts: Math.round(bestVal), wattsPerKg: wkg });
    }
  });

  const pModels = item.powerModels || [];
  const fft = pModels.find((m: any) => m.type === "FFT_CURVES") || pModels[0];
  const eftp = fft?.ftp || fft?.criticalPower;
  const wPrime = fft?.wPrime;

  return {
    id: item.id || "curve",
    label: item.id === "42d" ? "42 días" : item.id === "s0" ? "Esta temporada" : item.label || "Curva",
    startDate: item.start_date_local,
    endDate: item.end_date_local,
    points,
    eftp,
    wPrime,
    vo2max: item.vo2max_5m ? parseFloat(item.vo2max_5m.toFixed(1)) : undefined,
    cs5m: item.compound_score_5m ? Math.round(item.compound_score_5m) : undefined,
    tteSec: item.mapPlot?.mapSecs || undefined,
  };
}

function parsePaceCurveItem(item: any): PaceCurveDataSet {
  const records: PaceRecordPoint[] = [];
  const distances: number[] = item.distance || [];
  const values: number[] = item.values || [];

  STANDARD_DISTANCES.forEach((std) => {
    let closestIdx = -1;
    let minDiff = Infinity;
    for (let i = 0; i < distances.length; i++) {
      const diff = Math.abs(distances[i] - std.distanceMeters);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    if (closestIdx !== -1 && minDiff <= std.distanceMeters * 0.15) {
      const dist = distances[closestIdx];
      const timeSec = values[closestIdx];
      if (timeSec > 0 && dist > 0) {
        const paceSec = (timeSec / dist) * 1000;
        records.push({
          distanceMeters: Math.round(dist),
          label: std.label,
          timeSec: Math.round(timeSec),
          timeFormatted: formatTime(timeSec),
          paceSecPerKm: Math.round(paceSec),
          paceFormatted: formatPace(paceSec),
        });
      }
    }
  });

  return {
    id: item.id || "pace-curve",
    label: item.id === "42d" ? "42 días" : item.id === "s0" ? "Esta temporada" : item.label || "Curva Ritmo",
    startDate: item.start_date_local,
    endDate: item.end_date_local,
    records,
  };
}

export async function fetchAthleteCurvesFromIntervals(params: {
  athleteId: string;
  apiKey: string;
  sport: "Ride" | "Run";
  weightKg?: number;
}): Promise<SportCurvesResponse> {
  const { athleteId, apiKey, sport, weightKg = 82 } = params;
  const authHeader = "Basic " + Buffer.from(`API_KEY:${apiKey}`).toString("base64");

  try {
    const powerUrl = `${BASE_URL}/athlete/${athleteId}/power-curves?type=${sport}&curves=42d&curves=s0`;
    const powerRes = await fetch(powerUrl, {
      headers: { Authorization: authHeader, Accept: "application/json" },
      next: { revalidate: 300 },
    });

    let recent42dPower: PowerCurveDataSet | undefined;
    let seasonPower: PowerCurveDataSet | undefined;

    if (powerRes.ok) {
      const data = await powerRes.json();
      const list: any[] = data.list || [];
      const item42d = list.find((l) => l.id === "42d");
      const itemSeason = list.find((l) => l.id === "s0") || list[1];

      if (item42d) recent42dPower = parsePowerCurveItem(item42d, weightKg);
      if (itemSeason) seasonPower = parsePowerCurveItem(itemSeason, weightKg);
    }

    let recent42dPace: PaceCurveDataSet | undefined;
    let seasonPace: PaceCurveDataSet | undefined;

    if (sport === "Run") {
      const paceUrl = `${BASE_URL}/athlete/${athleteId}/pace-curves?curves=42d&curves=s0`;
      const paceRes = await fetch(paceUrl, {
        headers: { Authorization: authHeader, Accept: "application/json" },
        next: { revalidate: 300 },
      });
      if (paceRes.ok) {
        const data = await paceRes.json();
        const list: any[] = data.list || [];
        const item42d = list.find((l) => l.id === "42d");
        const itemSeason = list.find((l) => l.id === "s0") || list[1];

        if (item42d) recent42dPace = parsePaceCurveItem(item42d);
        if (itemSeason) seasonPace = parsePaceCurveItem(itemSeason);
      }
    }

    const bestEfforts: BestEffortRow[] = [
      {
        durationLabel: "5s",
        sec: 5,
        val42d: recent42dPower?.points.find((p) => p.sec === 5)?.watts,
        val42dWkg: recent42dPower?.points.find((p) => p.sec === 5)?.wattsPerKg,
        valSeason: seasonPower?.points.find((p) => p.sec === 5)?.watts,
        valSeasonWkg: seasonPower?.points.find((p) => p.sec === 5)?.wattsPerKg,
      },
      {
        durationLabel: "60s",
        sec: 60,
        val42d: recent42dPower?.points.find((p) => p.sec === 60)?.watts,
        val42dWkg: recent42dPower?.points.find((p) => p.sec === 60)?.wattsPerKg,
        valSeason: seasonPower?.points.find((p) => p.sec === 60)?.watts,
        valSeasonWkg: seasonPower?.points.find((p) => p.sec === 60)?.wattsPerKg,
      },
      {
        durationLabel: "5m",
        sec: 300,
        val42d: recent42dPower?.points.find((p) => p.sec === 300)?.watts,
        val42dWkg: recent42dPower?.points.find((p) => p.sec === 300)?.wattsPerKg,
        valSeason: seasonPower?.points.find((p) => p.sec === 300)?.watts,
        valSeasonWkg: seasonPower?.points.find((p) => p.sec === 300)?.wattsPerKg,
      },
      {
        durationLabel: "20m",
        sec: 1200,
        val42d: recent42dPower?.points.find((p) => p.sec === 1200)?.watts,
        val42dWkg: recent42dPower?.points.find((p) => p.sec === 1200)?.wattsPerKg,
        valSeason: seasonPower?.points.find((p) => p.sec === 1200)?.watts,
        valSeasonWkg: seasonPower?.points.find((p) => p.sec === 1200)?.wattsPerKg,
      },
      {
        durationLabel: "eFTP",
        sec: 0,
        val42d: recent42dPower?.eftp,
        valSeason: seasonPower?.eftp,
        unit: "W",
      },
      {
        durationLabel: "W'",
        sec: 0,
        val42d: recent42dPower?.wPrime,
        valSeason: seasonPower?.wPrime,
        unit: "J",
      },
      {
        durationLabel: "VO2max",
        sec: 0,
        val42d: recent42dPower?.vo2max,
        valSeason: seasonPower?.vo2max,
        unit: "ml/kg/min",
      },
      {
        durationLabel: "CS 5m",
        sec: 0,
        val42d: recent42dPower?.cs5m,
        valSeason: seasonPower?.cs5m,
        unit: "pts",
      },
    ];

    return {
      success: true,
      sport,
      weightKg,
      powerCurves: { recent42d: recent42dPower, season: seasonPower },
      paceCurves: { recent42d: recent42dPace, season: seasonPace },
      bestEfforts,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al consultar curvas";
    return { success: false, sport, weightKg, error: msg };
  }
}
