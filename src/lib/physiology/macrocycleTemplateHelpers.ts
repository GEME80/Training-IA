import { PlanItem } from "../gemini/engine";
import { resolveTrainingModel } from "../ai/knowledge";
import { MacrocycleDistanceType } from "./macrocycleLibrary";

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function getCoprimeStride(length: number, preferred: number = 2): number {
  if (length <= 1) return 1;
  let s = preferred;
  while (gcd(s, length) !== 1) {
    s++;
  }
  return s;
}

export function buildRestDay(day: string, dateStr: string, formattedDate: string): PlanItem {
  return {
    day, date: dateStr, formattedDate, discipline: "Descanso",
    workoutName: "Descanso Pasivo Total", action: "MANTENER",
    durationMinutes: 0, tss: 0,
    justification: "Recuperación biológica y descanso neuromuscular absoluto.",
    isRestDay: true,
  };
}

export function selectQualityWorkout(
  phase: string,
  weekNumber: number,
  curatedModel: ReturnType<typeof resolveTrainingModel>
): { name: string; powerTarget: string; justification: string; workoutDoc: string; durationMin?: number; tss?: number } {
  const vars = curatedModel.workoutVariations.qualityWorkouts;
  let rawList = vars.base;
  if (phase === "PEAK") {
    rawList = vars.peak && vars.peak.length > 0 ? vars.peak : vars.build;
  } else if (phase === "BUILD") {
    rawList = vars.build && vars.build.length > 0 ? vars.build : vars.base;
  } else if (phase === "TAPER" || phase === "RACE_WEEK") {
    rawList = vars.taper && vars.taper.length > 0 ? vars.taper : vars.base;
  }

  const runOnly = (rawList || []).filter((w) => {
    const txt = (w.name + " " + w.justification + " " + w.workoutDoc).toLowerCase();
    const isSwim = txt.includes("nataci") || txt.includes("nado") || txt.includes("swim") || txt.includes("brazada") || txt.includes("css ");
    const isPureBike = txt.includes("ciclismo") && !txt.includes("carrera") && !txt.includes("run") && !txt.includes("brick");
    return !isSwim && !isPureBike;
  });

  const list = runOnly.length > 0 ? runOnly : [
    {
      name: "Series de Potencia Crítica en Carrera (5x3m @ 90% CP)",
      powerTarget: "90% CP",
      justification: "Estímulo de calidad aeróbica en carrera a pie con aclaramiento eficiente de lactato.",
      workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 3m 90% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
    }
  ];

  const stride = getCoprimeStride(list.length, 2);
  const idx = ((weekNumber - 1) * stride) % list.length;
  return list[idx >= 0 ? idx : 0] || list[0];
}

export function resolveRaceSundayWorkout(params: {
  curatedModel: ReturnType<typeof resolveTrainingModel>;
  longRun: any;
  dateStr: string;
  formattedDate: string;
  runFtp?: number;
  bikeFtp?: number;
}): PlanItem {
  const { curatedModel, longRun, dateStr, formattedDate, runFtp, bikeFtp } = params;
  const sportCat = curatedModel.sportCategory;

  if (sportCat === "Triathlon") {
    const triKm = curatedModel.targetDistanceKm || (curatedModel.modelId === "TRIATHLON_SHORT" ? 51.5 : 113);
    const isShort = triKm <= 60;
    const isIron = triKm > 150;
    const durMins = isIron ? 660 : isShort ? 150 : 310;
    const raceTss = isIron ? 520 : isShort ? 210 : 305;
    const pwrTarget = bikeFtp && runFtp ? `Bike ${Math.round(bikeFtp * 0.78)}W / Run ${Math.round(runFtp * 0.84)}W` : "Ritmo Objetivo Triatlón";

    return {
      day: "Domingo", date: dateStr, formattedDate, discipline: "Carrera", activityType: "Triatlón",
      workoutName: `🏆 COMPETICIÓN OBJETIVO: ${curatedModel.displayName.split("(")[0].trim()} (${triKm} km)`,
      action: "MANTENER", durationMinutes: durMins, tss: raceTss, powerTarget: pwrTarget,
      justification: `🏆 DÍA DE COMPETICIÓN TRIATLÓN (${triKm} km). Ejecutar transiciones T1/T2 fluidas y nutrición programada.`,
      workoutDoc: isIron
        ? "Sector 1: Natación\n- 3.8 km Aguas Abiertas @ Ritmo Medido\n\nTransición T1 (< 6 min)\n\nSector 2: Ciclismo 180 km\n- 180 km @ 68-72% FTP (60-80g CHO/h)\n\nTransición T2 (< 4 min)\n\nSector 3: Maratón Final\n- 42.2 km @ 72-76% CP"
        : isShort
        ? "Sector 1: Natación\n- 1.5 km Aguas Abiertas @ Ritmo Objetivo\n\nTransición T1 (< 3 min)\n\nSector 2: Ciclismo\n- 40 km @ 85% FTP\n\nTransición T2 (< 2 min)\n\nSector 3: Carrera a pie\n- 10 km @ 88-90% CP"
        : "Sector 1: Natación\n- 1.9 km Aguas Abiertas @ Ritmo Constante\n\nTransición T1 (< 4 min)\n\nSector 2: Ciclismo 70.3\n- 90 km @ 76-80% FTP\n\nTransición T2 (< 3 min)\n\nSector 3: Medio Maratón\n- 21.1 km @ 82-84% CP",
      isRestDay: false,
    };
  }

  if (sportCat === "Cycling") {
    const bikeKm = curatedModel.targetDistanceKm || 120;
    return {
      day: "Domingo", date: dateStr, formattedDate, discipline: "Ciclismo",
      workoutName: `🏆 COMPETICIÓN CICLISMO: ${curatedModel.displayName.split("(")[0].trim()} (${bikeKm} km)`,
      action: "MANTENER", durationMinutes: Math.round(bikeKm * 2.1), tss: Math.round(bikeKm * 1.8),
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.75)}W (75% FTP)` : "75-80% FTP",
      justification: `🏆 DÍA DE PRUEBA CICLISTA (${bikeKm} km). Gestión de potencia en repechos y nutrición en ruta.`,
      workoutDoc: `Warmup\n- 15m 60% FTP Activación\n\nMain (Prueba Ciclista Oficial)\n- ${bikeKm} km @ Ritmo de Carrera (75-82% FTP)\n\nCooldown\n- 10m 50% FTP`,
      isRestDay: false,
    };
  }

  return {
    day: "Domingo", date: dateStr, formattedDate, discipline: "Carrera",
    workoutName: longRun.workoutName, action: "MANTENER", durationMinutes: longRun.minutes,
    tss: longRun.km >= 40 ? 280 : Math.round(longRun.km * 6), powerTarget: longRun.powerTarget,
    justification: `🏆 DÍA DE COMPETICIÓN (${longRun.km} km). Ejecutar estrategia de nutrición y ritmo objetivo.`,
    workoutDoc: longRun.workoutDoc, isRestDay: false,
  };
}

export function resolveWeekendRide(params: {
  distanceType?: MacrocycleDistanceType;
  phase: string;
  weekNumber: number;
  isRecovery: boolean;
  bikeFtp?: number;
}): { rideMins: number; rideTitle: string; rideJust: string; rideTarget: string } {
  const { distanceType, phase, weekNumber, isRecovery, bikeFtp } = params;
  let rideMins = 90;
  let rideTitle = "Fondo Resistencia Ciclismo";
  let rideJust = "Volumen mitocondrial continuo.";
  let rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.65)}W (65% FTP)` : "65% FTP";

  if (distanceType === "triathlon_1406") {
    if (phase === "PEAK") rideMins = [270, 300, 240][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [240, 270, 210, 285][(weekNumber - 1) % 4];
    else if (phase === "BASE") rideMins = [180, 210, 195, 240][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 120 : (weekNumber % 2 === 0 ? 90 : 135);
    rideTitle = `Fondo Ciclismo Ironman (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2)`;
  } else if (distanceType === "triathlon_703") {
    if (phase === "PEAK") rideMins = [150, 165, 135][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [140, 160, 135, 165][(weekNumber - 1) % 4];
    else if (phase === "BASE") rideMins = [110, 125, 120, 135][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 75 : 60;
    rideTitle = `Fondo Ciclismo 70.3 (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2)`;
  } else if (distanceType === "triathlon_short") {
    if (phase === "PEAK") rideMins = 80;
    else if (phase === "BUILD") rideMins = [75, 85, 80][(weekNumber - 1) % 3];
    else if (phase === "BASE") rideMins = [70, 80, 75][(weekNumber - 1) % 3];
    else rideMins = 45;
    rideTitle = `Fondo Ciclismo Olímpico (${rideMins}m Z2)`;
  } else if (phase === "TAPER") {
    rideMins = weekNumber % 2 === 0 ? 45 : 55;
    rideTitle = `Pedaleo Ciclista de Descarga Pre-Carrera (${rideMins}m Z1)`;
    rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.58)}W (58% FTP)` : "58% FTP";
  } else if (isRecovery) {
    rideMins = 60;
    rideTitle = "Fondo Suave de Asimilación Ciclismo (1h Z1-Z2)";
    rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.60)}W (60% FTP)` : "60% FTP";
  } else if (phase === "PEAK") {
    rideMins = [110, 120, 105][(weekNumber - 1) % 3];
    rideTitle = `Fondo Específico Ciclismo (${rideMins}m Z2/Z3)`;
  } else {
    rideMins = [85, 95, 90, 100][(weekNumber - 1) % 4];
    rideTitle = `Fondo Resistencia Continua Z2 (${rideMins}m)`;
  }

  return { rideMins, rideTitle, rideJust, rideTarget };
}
