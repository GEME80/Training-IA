export interface PowerCurvePoint {
  sec: number;
  label: string;
  watts: number;
  wattsPerKg: number;
}

export interface PowerCurveDataSet {
  id: string; // '42d' | 's0' | '1y' | 'all'
  label: string; // '42 días' | 'Esta temporada'
  startDate?: string;
  endDate?: string;
  points: PowerCurvePoint[];
  eftp?: number;
  wPrime?: number;
  vo2max?: number;
  cs5m?: number;
  tteSec?: number;
  mapWatts?: number;
}

export interface PaceRecordPoint {
  distanceMeters: number;
  label: string; // '400m' | '1 km' | '5 km' | '10 km' | '21.1 km'
  timeSec: number;
  timeFormatted: string; // '1:19' | '22:21'
  paceSecPerKm: number;
  paceFormatted: string; // '3:18/km'
}

export interface PaceCurveDataSet {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
  records: PaceRecordPoint[];
}

export interface BestEffortRow {
  durationLabel: string;
  sec: number;
  val42d?: number;
  val42dWkg?: number;
  valSeason?: number;
  valSeasonWkg?: number;
  unit?: string;
}

export interface SportCurvesResponse {
  success: boolean;
  sport: "Ride" | "Run";
  weightKg: number;
  powerCurves?: {
    recent42d?: PowerCurveDataSet;
    season?: PowerCurveDataSet;
  };
  paceCurves?: {
    recent42d?: PaceCurveDataSet;
    season?: PaceCurveDataSet;
  };
  bestEfforts?: BestEffortRow[];
  error?: string;
}
