import { sanitizeWorkoutDoc } from "@/lib/physiology/workoutSyntaxSanitizer";

export interface IntervalSegment {
  durationMins: number;
  intensityPercent: number;
  label?: string;
}

export interface StrengthExercise {
  reps: string;
  name: string;
  raw: string;
}

export interface StrengthCircuitInfo {
  rounds: number;
  circuitTitle: string;
  warmupMins: number;
  cooldownMins: number;
  exercises: StrengthExercise[];
  totalMins: number;
}

export function isStrengthDoc(doc?: string, discipline?: string): boolean {
  if (discipline) {
    const d = discipline.toLowerCase();
    return d === "fuerza" || d === "weighttraining" || d === "gym" || d === "fortalecimiento";
  }
  if (!doc) return false;
  if (/% ftp|% cp|pace|ritmo|w\/kg|\bftp\b|\bcp\b/i.test(doc)) return false;
  return /(?:circuito|bloque)[^\n]*\(\d+\s*rondas?\)|(?:rondas?|estaciones).*sentadilla|plancha.*face-pull/i.test(doc);
}

export function parseStrengthDoc(doc?: string, workoutName?: string): StrengthCircuitInfo {
  if (!doc || doc.trim().length === 0) {
    return { rounds: 3, circuitTitle: "Circuito Funcional", warmupMins: 5, cooldownMins: 5, exercises: [], totalMins: 35 };
  }

  const titleMinsMatch = (workoutName || doc).match(/\((\d+)\s*m(?:in)?\)/i);
  const totalMins = titleMinsMatch ? parseInt(titleMinsMatch[1], 10) : 35;

  const roundsMatch = doc.match(/\((\d+)\s*rondas?\)/i) || doc.match(/(\d+)\s*rondas?/i);
  const rounds = roundsMatch ? parseInt(roundsMatch[1], 10) : 3;

  const circuitTitleMatch = doc.match(/(?:Circuito|Bloque)\s+([^\n(]+)/i);
  const circuitTitle = circuitTitleMatch ? circuitTitleMatch[0].trim() : "Circuito Estructural";

  const lines = doc.split("\n").map((l) => l.trim()).filter(Boolean);
  const exercises: StrengthExercise[] = [];

  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      const clean = line.replace(/^[-•*]+\s*/, "").trim();
      const repMatch = clean.match(/^(\d+\s*[xs]|\d+\s*reps?|\d+\s*seg)\s+(.*)$/i);
      if (repMatch) {
        const reps = repMatch[1].trim();
        const fullName = repMatch[2].trim();
        const shortName = fullName.replace(/\s*\([^)]*\)/g, "").split(/\s+/).slice(0, 2).join(" ");
        exercises.push({ reps, name: shortName || fullName, raw: clean });
      }
    }
  }

  return { rounds, circuitTitle, warmupMins: 5, cooldownMins: 5, exercises, totalMins };
}

export function parseWorkoutDoc(doc?: string, discipline?: string): {
  segments: IntervalSegment[];
  totalMins: number;
  estimatedTss: number;
} {
  if (!doc || doc.trim().length === 0) {
    return { segments: [], totalMins: 0, estimatedTss: 0 };
  }

  if (isStrengthDoc(doc, discipline)) {
    const stInfo = parseStrengthDoc(doc);
    return {
      segments: [],
      totalMins: stInfo.totalMins,
      estimatedTss: Math.round(stInfo.totalMins * 0.72),
    };
  }

  const sanitizedDoc = sanitizeWorkoutDoc(doc, { discipline });
  const lines = sanitizedDoc.split("\n").map((l) => l.trim()).filter(Boolean);
  const segments: IntervalSegment[] = [];

  let repeatCount = 1;
  let inRepeatBlock = false;
  let repeatBuffer: IntervalSegment[] = [];
  let inIgnoredSection = false;

  const parseDuration = (raw: string): number => {
    const isCycling = /ciclismo|bike|ride/i.test(discipline || "") || /ftp/i.test(raw) || /ftp/i.test(doc || "");
    const isSwim = !isCycling && (/nataci|swim/i.test(discipline || "") || /nado|crol|espalda|braza/i.test(raw));
    const clean = raw.replace(/\s*\(.*?\)/g, "").replace(/\s*".*?"/g, "").trim();

    const kmMatch = clean.match(/(\d+(?:\.\d+)?)\s*km\b/i);
    if (kmMatch) return Math.max(0.5, Math.round(parseFloat(kmMatch[1]) * 4.5 * 10) / 10);

    const mtrMatch = clean.match(/(\d+)\s*(?:mtr|metros?)\b/i);
    if (mtrMatch) {
      const mVal = parseInt(mtrMatch[1], 10);
      if (isCycling) return mVal;
      if (isSwim) return Math.max(0.5, Math.round((mVal / 50) * 10) / 10);
      return Math.max(0.3, Math.round((mVal / 225) * 10) / 10);
    }

    const hoursMatch = clean.match(/(\d+)\s*h\b/i);
    const minsMatch = clean.match(/(\d+)\s*m(?:in)?\b/i);
    const secsMatch = clean.match(/(\d+)\s*s\b/i);

    let total = 0;
    if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
    if (minsMatch) {
      const val = parseInt(minsMatch[1], 10);
      if (isSwim && val >= 25) {
        total += Math.max(0.5, Math.round((val / 50) * 10) / 10);
      } else {
        total += val;
      }
    }
    if (secsMatch) total += Math.max(0.2, parseInt(secsMatch[1], 10) / 60);
    return total > 0 ? total : 5;
  };

  const parseIntensity = (raw: string): number => {
    if (/recovery|descanso|rest|pausa/i.test(raw)) return 50;
    const rangeMatch = raw.match(/(\d+)\s*-\s*(\d+)\s*%/);
    if (rangeMatch) return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
    const pctMatch = raw.match(/(\d+)\s*%/);
    if (pctMatch) return parseInt(pctMatch[1], 10);
    if (/z1|recup|f[aá]cil/i.test(raw)) return 60;
    if (/z2|aer[oó]b|base/i.test(raw)) return 72;
    if (/z3|tempo|sweetspot/i.test(raw)) return 85;
    if (/z4|umbral|threshold/i.test(raw)) return 98;
    if (/z5|vo2|acelerac/i.test(raw)) return 112;
    return 70;
  };

  for (const line of lines) {
    if (/activaci[oó]n neuromuscular|estrategia nutricional|pulse fueling/i.test(line)) {
      inIgnoredSection = true;
      continue;
    }
    if (/^(?:warmup|main|cooldown|calentamiento|principal|series|bloque|enfriamiento|recuperaci[oó]n|interval)/i.test(line)) {
      inIgnoredSection = false;
    }
    if (inIgnoredSection) {
      continue;
    }

    const repeatMatch = line.match(/^(\d+)\s*x(?:\s*\(.*?\)|:|\s+.*)?$/i) || line.match(/^(?:.*?\s+)?(\d+)\s*x\s*$/i);
    if (repeatMatch) {
      if (inRepeatBlock && repeatBuffer.length > 0) {
        for (let r = 0; r < repeatCount; r++) {
          segments.push(...repeatBuffer);
        }
        repeatBuffer = [];
      }
      repeatCount = parseInt(repeatMatch[1], 10);
      inRepeatBlock = true;
      continue;
    }

    if (line.startsWith("-")) {
      const segText = line.replace(/^-+\s*/, "").trim();
      const dur = parseDuration(segText);
      const intensity = parseIntensity(segText);
      const seg: IntervalSegment = {
        durationMins: dur,
        intensityPercent: intensity,
        label: segText,
      };

      if (inRepeatBlock) {
        repeatBuffer.push(seg);
      } else {
        segments.push(seg);
      }
    } else if (!line.startsWith("-") && inRepeatBlock && repeatBuffer.length > 0) {
      for (let r = 0; r < repeatCount; r++) {
        segments.push(...repeatBuffer);
      }
      repeatBuffer = [];
      inRepeatBlock = false;
    }
  }

  if (inRepeatBlock && repeatBuffer.length > 0) {
    for (let r = 0; r < repeatCount; r++) {
      segments.push(...repeatBuffer);
    }
  }

  const totalMins = segments.reduce((sum, s) => sum + s.durationMins, 0);

  const estimatedTss = Math.round(
    segments.reduce((sum, s) => {
      const hours = s.durationMins / 60;
      const intensityFactor = s.intensityPercent / 100;
      return sum + hours * Math.pow(intensityFactor, 2) * 100;
    }, 0)
  );

  return { segments, totalMins: Math.round(totalMins), estimatedTss };
}
