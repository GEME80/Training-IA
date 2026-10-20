import { formatPace, mapPowerPctToPacePct } from "./runningWorkoutAdapter";

export interface RaceSplitItem {
  distance?: string;
  intensity?: string;
  notes?: string;
  raw: string;
}

export interface TriathlonSector {
  sectorKey: "SWIM" | "T1" | "BIKE" | "T2" | "RUN";
  title: string;
  discipline: "Natacion" | "Ciclismo" | "Carrera" | "Transición";
  distance?: string;
  intensity?: string;
  timeLimit?: string;
  notes: string[];
}

export interface ParsedRacePlan {
  isRacePlan: boolean;
  isTriathlon: boolean;
  sport: "Running" | "Cycling" | "Triathlon" | "Swimming" | "Generic";
  title?: string;
  preRaceProtocol: string[];
  pacingSplits: RaceSplitItem[];
  nutritionStrategy?: string;
  postRaceProtocol: string[];
  triathlonSectors: TriathlonSector[];
  unparsedRemaining: string[];
}

interface ParseRaceOptions {
  discipline?: string;
  workoutName?: string;
  activityType?: string;
  effRunFtp?: number;
  effBikeFtp?: number;
  thresholdPaceSec?: number;
  isRunPace?: boolean;
}

/** Interpola métricas numéricas (% FTP -> Watts, % CP -> Watts / Pace) en una línea */
export function formatRaceIntensity(
  text: string,
  opts: {
    effRunFtp?: number;
    effBikeFtp?: number;
    thresholdPaceSec?: number;
    isRunPace?: boolean;
    discipline?: string;
  }
): string {
  let res = text;
  const { effRunFtp = 0, effBikeFtp = 0, thresholdPaceSec = 285, isRunPace = false, discipline = "Carrera" } = opts;

  if (discipline === "Ciclismo" && effBikeFtp > 0) {
    res = res.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*FTP/gi, (_, p1, p2) => {
      const n1 = parseInt(p1, 10);
      const w1 = Math.round((effBikeFtp * n1) / 100);
      if (p2) {
        const n2 = parseInt(p2, 10);
        return `${n1}-${n2}% FTP (${w1}-${Math.round((effBikeFtp * n2) / 100)}W)`;
      }
      return `${n1}% FTP (${w1}W)`;
    });
  }

  if (discipline === "Carrera" && !isRunPace && effRunFtp > 0) {
    res = res.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:CP|FTP)/gi, (_, p1, p2) => {
      const n1 = parseInt(p1, 10);
      const w1 = Math.round((effRunFtp * n1) / 100);
      if (p2) {
        const n2 = parseInt(p2, 10);
        return `${n1}-${n2}% CP (${w1}-${Math.round((effRunFtp * n2) / 100)}W)`;
      }
      return `${n1}% CP (${w1}W)`;
    });
  }

  if (discipline === "Carrera" && isRunPace) {
    res = res.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:CP|FTP)/gi, (_, p1, p2) => {
      const n1 = mapPowerPctToPacePct(parseInt(p1, 10));
      return p2 ? `${n1}-${mapPowerPctToPacePct(parseInt(p2, 10))}% Pace` : `${n1}% Pace`;
    });
    res = res.replace(/(\d+)(?:\s*-\s*(\d+))?\s*%\s*(?:Pace|pace|Ritmo)/gi, (_, p1, p2) => {
      const n1 = parseInt(p1, 10);
      const pace1 = formatPace(Math.round(thresholdPaceSec / (n1 / 100)));
      if (p2) {
        const pace2 = formatPace(Math.round(thresholdPaceSec / (parseInt(p2, 10) / 100)));
        return `${n1}-${p2}% Pace (${pace2}-${pace1}/km)`;
      }
      return `${n1}% Pace (~${pace1}/km)`;
    });
  }

  return res;
}

export function parseRaceExecutionPlan(cleanDoc: string, options: ParseRaceOptions = {}): ParsedRacePlan {
  const { workoutName = "", activityType = "", discipline = "Carrera" } = options;
  const isTriathlon =
    activityType === "Triatlón" || activityType === "Triatlon" ||
    /triatl|ironman|70\.3|140\.6/i.test(workoutName) ||
    /triatl|ironman|70\.3|140\.6/i.test(cleanDoc) ||
    /sector 1:\s*nataci/i.test(cleanDoc);

  const isCycling = discipline === "Ciclismo" || activityType === "Ride" || /ciclismo|gran fondo|clásica/i.test(workoutName) || /prueba ciclista|gran fondo/i.test(cleanDoc);
  const isSwimming = discipline === "Natacion" || /nataci/i.test(cleanDoc);
  const lines = cleanDoc.split("\n").map((l) => l.trim()).filter(Boolean);

  if (isTriathlon) return parseTriathlonPlan(lines, options);
  const sport: "Running" | "Cycling" | "Swimming" | "Generic" = isCycling ? "Cycling" : isSwimming ? "Swimming" : "Running";
  return parseSingleSportRacePlan(lines, sport, options);
}

function parseSingleSportRacePlan(lines: string[], sport: "Running" | "Cycling" | "Swimming" | "Generic", opts: ParseRaceOptions): ParsedRacePlan {
  const preRaceProtocol: string[] = [];
  const pacingSplits: RaceSplitItem[] = [];
  let nutritionStrategy: string | undefined;
  const postRaceProtocol: string[] = [];
  const unparsedRemaining: string[] = [];
  let currentSection: "NONE" | "PRE" | "PACING" | "POST" = "NONE";

  for (const line of lines) {
    if (/protocolo pre-(?:carrera|prueba)|warmup|activaci[oó]n pre/i.test(line)) { currentSection = "PRE"; continue; }
    if (/pacing plan|competicion oficial|competición oficial|main\s*\(/i.test(line)) { currentSection = "PACING"; continue; }
    if (/protocolo post-meta|cooldown|recuperaci[oó]n post/i.test(line)) { currentSection = "POST"; continue; }

    const clean = line.replace(/^[•\-\*]\s*/, "");
    if (currentSection === "PRE") {
      if (clean) preRaceProtocol.push(clean);
    } else if (currentSection === "POST") {
      if (clean) postRaceProtocol.push(clean);
    } else if (currentSection === "PACING") {
      if (/nutrici[oó]n|hidrataci[oó]n|avituallamiento/i.test(line)) {
        nutritionStrategy = clean.replace(/^(?:estrategia\s*)?(?:nutricional|hidrataci[oó]n)?[:\s]*/i, "").trim();
      } else {
        const match = clean.match(/^(\d+(?:\.\d+)?\s*(?:km|k|mtr|m))\s+([^\(]+)(?:\((.*)\))?$/i);
        if (match) {
          const formattedInt = formatRaceIntensity(match[2].trim(), {
            effRunFtp: opts.effRunFtp, effBikeFtp: opts.effBikeFtp,
            thresholdPaceSec: opts.thresholdPaceSec, isRunPace: opts.isRunPace,
            discipline: sport === "Cycling" ? "Ciclismo" : "Carrera",
          });
          pacingSplits.push({ distance: match[1].trim(), intensity: formattedInt, notes: match[3]?.trim(), raw: clean });
        } else {
          const formatted = formatRaceIntensity(clean, {
            effRunFtp: opts.effRunFtp, effBikeFtp: opts.effBikeFtp,
            thresholdPaceSec: opts.thresholdPaceSec, isRunPace: opts.isRunPace,
            discipline: sport === "Cycling" ? "Ciclismo" : "Carrera",
          });
          pacingSplits.push({ raw: formatted });
        }
      }
    } else {
      unparsedRemaining.push(line);
    }
  }

  return { isRacePlan: true, isTriathlon: false, sport, preRaceProtocol, pacingSplits, nutritionStrategy, postRaceProtocol, triathlonSectors: [], unparsedRemaining };
}

function parseTriathlonPlan(lines: string[], opts: ParseRaceOptions): ParsedRacePlan {
  const triathlonSectors: TriathlonSector[] = [];
  let currentSector: TriathlonSector | null = null;

  for (const line of lines) {
    if (/sector\s*1[:\s]+nataci/i.test(line)) {
      if (currentSector) triathlonSectors.push(currentSector);
      currentSector = { sectorKey: "SWIM", title: "Sector 1: Natación", discipline: "Natacion", notes: [] };
      continue;
    }
    if (/transici[oó]n\s*t1/i.test(line)) {
      if (currentSector) triathlonSectors.push(currentSector);
      const timeMatch = line.match(/\((.*?)\)/);
      currentSector = { sectorKey: "T1", title: "Transición T1", discipline: "Transición", timeLimit: timeMatch ? timeMatch[1] : "< 4 min", notes: [] };
      continue;
    }
    if (/sector\s*2[:\s]+ciclismo/i.test(line)) {
      if (currentSector) triathlonSectors.push(currentSector);
      currentSector = { sectorKey: "BIKE", title: "Sector 2: Ciclismo", discipline: "Ciclismo", notes: [] };
      continue;
    }
    if (/transici[oó]n\s*t2/i.test(line)) {
      if (currentSector) triathlonSectors.push(currentSector);
      const timeMatch = line.match(/\((.*?)\)/);
      currentSector = { sectorKey: "T2", title: "Transición T2", discipline: "Transición", timeLimit: timeMatch ? timeMatch[1] : "< 3 min", notes: [] };
      continue;
    }
    if (/sector\s*3[:\s]+(?:carrera|marat[oó]n|medio marat[oó]n)/i.test(line)) {
      if (currentSector) triathlonSectors.push(currentSector);
      currentSector = { sectorKey: "RUN", title: "Sector 3: Carrera a Pie", discipline: "Carrera", notes: [] };
      continue;
    }

    if (currentSector) {
      const clean = line.replace(/^[•\-\*]\s*/, "");
      if (currentSector.sectorKey === "SWIM") {
        const distMatch = clean.match(/^(\d+(?:\.\d+)?\s*(?:km|mtr|m))\b/i);
        if (distMatch) currentSector.distance = distMatch[1];
        currentSector.notes.push(clean);
      } else if (currentSector.sectorKey === "BIKE") {
        const distMatch = clean.match(/^(\d+(?:\.\d+)?\s*(?:km|k))\b/i);
        if (distMatch) currentSector.distance = distMatch[1];
        currentSector.notes.push(formatRaceIntensity(clean, { effBikeFtp: opts.effBikeFtp, discipline: "Ciclismo" }));
      } else if (currentSector.sectorKey === "RUN") {
        const distMatch = clean.match(/^(\d+(?:\.\d+)?\s*(?:km|k))\b/i);
        if (distMatch) currentSector.distance = distMatch[1];
        currentSector.notes.push(formatRaceIntensity(clean, { effRunFtp: opts.effRunFtp, thresholdPaceSec: opts.thresholdPaceSec, isRunPace: opts.isRunPace, discipline: "Carrera" }));
      } else {
        currentSector.notes.push(clean);
      }
    }
  }

  if (currentSector) triathlonSectors.push(currentSector);
  return { isRacePlan: true, isTriathlon: true, sport: "Triathlon", preRaceProtocol: [], pacingSplits: [], postRaceProtocol: [], triathlonSectors, unparsedRemaining: [] };
}
