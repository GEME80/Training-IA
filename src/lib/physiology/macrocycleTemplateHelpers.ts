import { PlanItem, WeeklyAvailabilityMap, getDayDisciplines } from "../gemini/engine";
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

export function interpolatePowerTarget(rawTarget: string, runFtp?: number, bikeFtp?: number): string {
  if (!rawTarget) return rawTarget;
  let res = rawTarget;

  // Interpolar % CP con runFtp (Stryd)
  if (runFtp && runFtp > 0) {
    // Caso rango: "88-92% CP" o "100-112% CP"
    res = res.replace(/(\d+)\s*-\s*(\d+)\s*%\s*CP/gi, (_, p1, p2) => {
      const w1 = Math.round(runFtp * (parseInt(p1, 10) / 100));
      const w2 = Math.round(runFtp * (parseInt(p2, 10) / 100));
      return `${w1}-${w2}W (${p1}-${p2}% CP)`;
    });
    // Caso rango con "a": "72% a 84% CP"
    res = res.replace(/(\d+)\s*%\s*a\s*(\d+)\s*%\s*CP/gi, (_, p1, p2) => {
      const w1 = Math.round(runFtp * (parseInt(p1, 10) / 100));
      const w2 = Math.round(runFtp * (parseInt(p2, 10) / 100));
      return `${w1}-${w2}W (${p1}% a ${p2}% CP)`;
    });
    // Caso individual: "90% CP" o "100% CP"
    res = res.replace(/(\d+)\s*%\s*CP/gi, (_, p) => {
      const w = Math.round(runFtp * (parseInt(p, 10) / 100));
      return `${w}W (${p}% CP)`;
    });
  }

  // Interpolar % FTP con bikeFtp (Ciclismo)
  if (bikeFtp && bikeFtp > 0) {
    // Caso rango: "85-95% FTP"
    res = res.replace(/(\d+)\s*-\s*(\d+)\s*%\s*FTP/gi, (_, p1, p2) => {
      const w1 = Math.round(bikeFtp * (parseInt(p1, 10) / 100));
      const w2 = Math.round(bikeFtp * (parseInt(p2, 10) / 100));
      return `${w1}-${w2}W (${p1}-${p2}% FTP)`;
    });
    // Caso individual: "85% FTP"
    res = res.replace(/(\d+)\s*%\s*FTP/gi, (_, p) => {
      const w = Math.round(bikeFtp * (parseInt(p, 10) / 100));
      return `${w}W (${p}% FTP)`;
    });
  }

  return res;
}

export function selectQualityWorkout(
  phase: string,
  weekNumber: number,
  curatedModel: ReturnType<typeof resolveTrainingModel>,
  runFtp?: number,
  bikeFtp?: number
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
      powerTarget: runFtp && runFtp > 0 ? `${Math.round(runFtp * 0.90)}W (90% CP)` : "90% CP",
      justification: "Estímulo de calidad aeróbica en carrera a pie con aclaramiento eficiente de lactato.",
      workoutDoc: "Warmup\n- 12m 65% FTP\n\n5x\n- 3m 90% FTP\n- 2m 60% FTP\n\nCooldown\n- 8m 60% FTP",
    }
  ];

  const stride = getCoprimeStride(list.length, 2);
  const idx = ((weekNumber - 1) * stride) % list.length;
  const baseWorkout = list[idx >= 0 ? idx : 0] || list[0];
  const cycleRound = Math.floor((weekNumber - 1) / list.length);
  const dynPowerTarget = interpolatePowerTarget(baseWorkout.powerTarget, runFtp, bikeFtp);

  if (cycleRound > 0) {
    return {
      ...baseWorkout,
      name: `${baseWorkout.name} (Progresión Bloque II)`,
      powerTarget: dynPowerTarget,
      justification: `${baseWorkout.justification} Estímulo consolidado en fase avanzada.`,
    };
  }
  return {
    ...baseWorkout,
    powerTarget: dynPowerTarget,
  };
}

export function resolveRaceWorkout(params: {
  curatedModel: ReturnType<typeof resolveTrainingModel>;
  longRun: any;
  dateStr: string;
  formattedDate: string;
  day?: string;
  runFtp?: number;
  bikeFtp?: number;
}): PlanItem {
  const { curatedModel, longRun, dateStr, formattedDate, day = "Domingo", runFtp, bikeFtp } = params;
  const sportCat = curatedModel.sportCategory;

  if (sportCat === "Triathlon") {
    const triKm = curatedModel.targetDistanceKm || (curatedModel.modelId === "TRIATHLON_SHORT" ? 51.5 : 113);
    const isShort = triKm <= 60;
    const isIron = triKm > 150;
    const durMins = isIron ? 660 : isShort ? 150 : 310;
    const raceTss = isIron ? 520 : isShort ? 210 : 305;
    const pwrTarget = bikeFtp && runFtp ? `Bike ${Math.round(bikeFtp * 0.78)}W / Run ${Math.round(runFtp * 0.84)}W` : "Ritmo Objetivo Triatlón";

    return {
      day, date: dateStr, formattedDate, discipline: "Carrera", activityType: "Triatlón",
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
      day, date: dateStr, formattedDate, discipline: "Ciclismo",
      workoutName: `🏆 COMPETICIÓN CICLISMO: ${curatedModel.displayName.split("(")[0].trim()} (${bikeKm} km)`,
      action: "MANTENER", durationMinutes: Math.round(bikeKm * 2.1), tss: Math.round(bikeKm * 1.8),
      powerTarget: bikeFtp ? `${Math.round(bikeFtp * 0.75)}W (75% FTP)` : "75-80% FTP",
      justification: `🏆 DÍA DE PRUEBA CICLISTA (${bikeKm} km). Gestión de potencia en repechos y nutrición en ruta.`,
      workoutDoc: `Warmup\n- 15m 60% FTP Activación\n\nMain (Prueba Ciclista Oficial)\n- ${bikeKm} km @ Ritmo de Carrera (75-82% FTP)\n\nCooldown\n- 10m 50% FTP`,
      isRestDay: false,
    };
  }

  if (sportCat === "Trail") {
    const trailKm = curatedModel.targetDistanceKm || 50;
    const durMins = Math.min(360, Math.round(trailKm * 5.5));
    const raceTss = Math.min(380, Math.round(trailKm * 5.0));
    return {
      day, date: dateStr, formattedDate, discipline: "Carrera", activityType: "Trail",
      workoutName: `🏆 COMPETICIÓN TRAIL: ${curatedModel.displayName.split("(")[0].trim()} (${trailKm} km)`,
      action: "MANTENER", durationMinutes: durMins, tss: raceTss,
      powerTarget: runFtp ? `${Math.round(runFtp * 0.76)}W (76% CP)` : "72-78% CP (RPE 5-6 en subidas)",
      justification: `🏆 DÍA DE COMPETICIÓN TRAIL (${trailKm} km). Gestión de esfuerzo en desniveles y nutrición programada cada 45m.`,
      workoutDoc: `Sector 1: Salida y Primer Ascenso\n- Ritmo controlado (68-75% CP), caminar rampas >15%\n\nSector 2: Terreno Mixto y Crestas\n- Ritmo de crucero (75-80% CP), avituallamiento constante 50-70g CHO/h\n\nSector 3: Bajada Final y Meta\n- Agilidad técnica y zancada corta hasta cruzar meta`,
      isRestDay: false,
    };
  }

  const raceDist = curatedModel.targetDistanceKm || longRun.km || 42.2;
  const is5K = raceDist <= 6;
  const is10K = raceDist > 6 && raceDist <= 12;
  const is21K = raceDist > 12 && raceDist <= 25;
  const durMins = is5K ? 25 : is10K ? 50 : is21K ? 105 : 195;
  const raceTss = is5K ? 45 : is10K ? 85 : is21K ? 160 : 260;

  return {
    day, date: dateStr, formattedDate, discipline: "Carrera",
    workoutName: longRun.workoutName, action: "MANTENER", durationMinutes: durMins,
    tss: raceTss, powerTarget: longRun.powerTarget,
    justification: `🏆 DÍA DE COMPETICIÓN (${raceDist} km). Ejecutar estrategia de nutrición y ritmo objetivo.`,
    workoutDoc: longRun.workoutDoc, isRestDay: false,
  };
}

export const resolveRaceSundayWorkout = resolveRaceWorkout;

export function resolveWeekendRide(params: {
  distanceType?: MacrocycleDistanceType;
  phase: string;
  weekNumber: number;
  isRecovery: boolean;
  bikeFtp?: number;
}): { rideMins: number; rideTitle: string; rideJust: string; rideTarget: string; workoutDoc?: string } {
  const { distanceType, phase, weekNumber, isRecovery, bikeFtp } = params;
  let rideMins = 90;
  let rideTitle = "Fondo Resistencia Ciclismo";
  let rideJust = "Volumen mitocondrial continuo.";
  let rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.65)}W (65% FTP)` : "65% FTP";
  let workoutDoc: string | undefined = undefined;

  if (distanceType === "triathlon_1406") {
    if (phase === "PEAK") rideMins = [270, 300, 240][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [240, 270, 210, 285][(weekNumber - 1) % 4];
    else if (phase.startsWith("BASE")) rideMins = [180, 210, 195, 240][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 120 : (weekNumber % 2 === 0 ? 90 : 135);
    rideTitle = `Fondo Ciclismo Ironman (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2)`;
  } else if (distanceType === "triathlon_703") {
    if (phase === "PEAK") rideMins = [150, 165, 135][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [140, 160, 135, 165][(weekNumber - 1) % 4];
    else if (phase.startsWith("BASE")) rideMins = [110, 125, 120, 135][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 75 : 60;
    rideTitle = `Fondo Ciclismo 70.3 (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2)`;
  } else if (distanceType === "triathlon_short") {
    if (phase === "PEAK") rideMins = [80, 90, 85][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [75, 85, 80][(weekNumber - 1) % 3];
    else if (phase.startsWith("BASE")) rideMins = [65, 75, 70][(weekNumber - 1) % 3];
    else if (phase === "TAPER") rideMins = [45, 50][(weekNumber - 1) % 2];
    else rideMins = 50;
    if (isRecovery) rideMins = Math.max(40, Math.round(rideMins * 0.75));
    rideTitle = `Fondo Ciclismo Olímpico (${rideMins}m Z2)`;
  } else if (distanceType === "cycling_climbing") {
    if (phase === "PEAK") rideMins = [180, 210, 195][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [150, 180, 165, 195][(weekNumber - 1) % 4];
    else if (phase.startsWith("BASE")) rideMins = [120, 150, 135, 165][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 90 : 75;
    if (isRecovery) rideMins = Math.max(60, Math.round(rideMins * 0.75));
    rideTitle = `Fondo Ciclismo de Puertos & Escalada (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2-Z3)`;
    rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.70)}W (70% FTP)` : "70% FTP";
  } else if (distanceType === "cycling_fondo" || distanceType === "cycling_criterium") {
    if (phase === "PEAK") rideMins = [180, 210, 190][(weekNumber - 1) % 3];
    else if (phase === "BUILD") rideMins = [150, 175, 160, 190][(weekNumber - 1) % 4];
    else if (phase.startsWith("BASE")) rideMins = [120, 140, 130, 155][(weekNumber - 1) % 4];
    else rideMins = isRecovery ? 80 : 60;
    if (isRecovery) rideMins = Math.max(60, Math.round(rideMins * 0.75));
    rideTitle = `Fondo Ciclismo Gran Fondo (${Math.floor(rideMins / 60)}h${rideMins % 60 ? rideMins % 60 + "m" : ""} Z2)`;
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
    // Alternancia dinámica de estímulo de fin de semana para Ciclismo
    const style = (weekNumber - 1) % 3;
    if (style === 0) {
      rideMins = [90, 100, 95][(weekNumber - 1) % 3];
      rideTitle = `Fondo Ciclismo con Variaciones de Cadencia (${rideMins}m)`;
      rideJust = "Fuerza y eficiencia neuromuscular alternando 60 y 100 rpm.";
      rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.68)}W (68% FTP)` : "68% FTP";
      workoutDoc = `Warmup\n- 15m 55% FTP\n\n4x (Cadencia Dinámica)\n- 6m 72% FTP (60 rpm)\n- 4m 65% FTP (100 rpm)\n\nMain\n- ${Math.max(15, rideMins - 65)}m 66% FTP\n\nCooldown\n- 10m 50% FTP`;
    } else if (style === 1) {
      rideMins = [85, 95, 90][(weekNumber - 1) % 3];
      rideTitle = `Fondo Ciclismo con Bloques Sweetspot (${rideMins}m)`;
      rideJust = "Estímulo aeróbico profundo sin impacto sobre tendón de Aquiles.";
      rideTarget = bikeFtp ? `${Math.round(bikeFtp * 0.72)}W` : "Z2 con 2x10m Sweetspot";
      workoutDoc = `Warmup\n- 15m 55% FTP\n\n2x (Sweetspot)\n- 10m 85% FTP\n- 5m 55% FTP\n\nMain (Z2)\n- ${Math.max(15, rideMins - 55)}m 66% FTP\n\nCooldown\n- 10m 50% FTP`;
    } else {
      rideMins = [85, 95, 90, 100][(weekNumber - 1) % 4];
      rideTitle = `Fondo Resistencia Continua Z2 (${rideMins}m)`;
      rideJust = "Densidad mitocondrial y volumen continuo.";
      workoutDoc = `Warmup\n- 15m 55% FTP\n\nMain\n- ${rideMins - 25}m 65% FTP\n\nCooldown\n- 10m 50% FTP`;
    }
  }

  return { rideMins, rideTitle, rideJust, rideTarget, workoutDoc };
}

/**
 * Resuelve dinámicamente el día óptimo para la Tirada Larga de Carrera
 * respetando la matriz semanal del atleta (fin de semana o último día disponible).
 */
export function resolveLongRunDay(availability: WeeklyAvailabilityMap = {}): string {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const runDays = days.filter((d) => getDayDisciplines(availability, d).includes("Carrera"));
  if (runDays.includes("Domingo")) return "Domingo";
  if (runDays.includes("Sábado")) return "Sábado";
  return runDays[runDays.length - 1] || "Domingo";
}

/**
 * Resuelve dinámicamente el día óptimo para el Fondo de Ciclismo
 * coordinando con la Tirada Larga para prevenir interferencias concurrentes.
 */
export function resolveLongRideDay(availability: WeeklyAvailabilityMap = {}): string {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const bikeDays = days.filter((d) => getDayDisciplines(availability, d).includes("Ciclismo"));
  const runsSunday = getDayDisciplines(availability, "Domingo").includes("Carrera");
  if (bikeDays.includes("Sábado") && runsSunday) return "Sábado";
  if (bikeDays.includes("Domingo")) return "Domingo";
  if (bikeDays.includes("Sábado")) return "Sábado";
  return bikeDays[bikeDays.length - 1] || "Sábado";
}
