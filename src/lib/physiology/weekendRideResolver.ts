/**
 * weekendRideResolver.ts
 * Generador y rotador periodizado de fondos y salidas ciclistas de fin de semana.
 * Elimina la monotonía proporcionando estructuras específicas según especialidad
 * (Ironman 140.6, 70.3, Olímpico, Gran Fondo, Escalada de Puertos, Criterium)
 * y fase de periodización (BASE, BUILD, PEAK, TAPER, RECOVERY).
 */

import { MacrocycleDistanceType } from "./macrocycleLibrary";
import { interpolateWorkoutTarget } from "./runningWorkoutAdapter";
import { ALL_CYCLING_OUTDOOR_WORKOUTS } from "../ai/knowledge/workoutPools/cyclingOutdoorPool";
import { PlanItem } from "../gemini/engine";
import { resolveTrainingModel } from "../ai/knowledge";

export interface WeekendRideParams {
  distanceType?: MacrocycleDistanceType;
  phase: string;
  weekNumber: number;
  isRecovery: boolean;
  bikeFtp?: number;
}

export interface WeekendRideResult {
  rideMins: number;
  rideTitle: string;
  rideJust: string;
  rideTarget: string;
  workoutDoc: string;
}

function pwr(ftp: number | undefined, pct: number, label?: string): string {
  if (!ftp || ftp <= 0) return label || `${Math.round(pct * 100)}% FTP`;
  return `${Math.round(ftp * pct)}W (${Math.round(pct * 100)}% FTP)`;
}

export function resolveWeekendRide(params: WeekendRideParams): WeekendRideResult {
  const { distanceType, phase, weekNumber, isRecovery, bikeFtp } = params;

  // 1. TRIATLÓN 140.6 (IRONMAN)
  if (distanceType === "triathlon_1406") {
    if (isRecovery) {
      return {
        rideMins: 120,
        rideTitle: "Fondo de Asimilación Aeróbica Ironman (2h Z1-Z2)",
        rideJust: "Recuperación biológica activa, pedaleo suave a cadencia 90-95 rpm sin drenaje glucogénico.",
        rideTarget: pwr(bikeFtp, 0.60),
        workoutDoc: `Calentamiento\n- 20m 55% FTP Enfoque en soltura articular\n\nMain (Rodaje de Asimilación)\n- 1h25m 60% FTP Pedaleo fluido y cómodo\n- Hidratación con electrolitos\n\nEnfriamiento\n- 15m 50% FTP`,
      };
    }
    if (phase === "PEAK") {
      const mins = [270, 300, 240][(weekNumber - 1) % 3];
      const h = Math.floor(mins / 60);
      const m = mins % 60 ? `${mins % 60}m` : "";
      return {
        rideMins: mins,
        rideTitle: `Simulación Oficial Sector Ciclismo Ironman (${h}h${m} Pacing 140.6)`,
        rideJust: `Ensayo general de potencia objetivo 140.6 (${pwr(bikeFtp, 0.72)}), posición aerodinámica continua y nutrición de 60-80g CHO/h.`,
        rideTarget: pwr(bikeFtp, 0.72),
        workoutDoc: `Salida & Aproximación\n- 25m 60% FTP Salida suave\n\nMain (Pacing Específico Ironman)\n- ${mins - 45}m 72% FTP Posición acoplada continua\n- Ingesta obligatoria: 60-80g carbohidratos/hora y 600-800ml líquido/hora\n\nRetorno\n- 20m 50% FTP`,
      };
    }
    if (phase === "BUILD") {
      const mins = [240, 270, 210, 285][(weekNumber - 1) % 4];
      const h = Math.floor(mins / 60);
      const m = mins % 60 ? `${mins % 60}m` : "";
      const cycle = (weekNumber - 1) % 3;
      const subDoc = cycle === 0
        ? `Main (Bloques de Ritmo Ironman)\n- 1h15m 68% FTP Base Z2\n3x\n- 35m 74% FTP Acoplado en posición de carrera\n- 10m 60% FTP Recuperación activa\n- 25m 68% FTP`
        : cycle === 1
        ? `Main (Fondo con Repechos en Acople)\n- 1h30m 68% FTP\n4x\n- 20m 76% FTP Subidas y falsos llanos sostenidos\n- 10m 62% FTP\n- 30m 68% FTP`
        : `Main (Progresión Continua hacia Ritmo 140.6)\n- 1h30m 66% FTP Base aeróbica sólida\n- 1h00m 73% FTP Ritmo crucero medio\n- 30m 75% FTP Cierre firme en acoples`;
      return {
        rideMins: mins,
        rideTitle: `Fondo Específico Ironman (${h}h${m} con Bloques Aerodinámicos)`,
        rideJust: "Desarrollo de potencia submáxima sostenible y adaptaciones neuromusculares en postura contra-reloj.",
        rideTarget: pwr(bikeFtp, 0.73),
        workoutDoc: `Aproximación\n- 20m 60% FTP\n\n${subDoc}\n\nCooldown\n- 15m 50% FTP`,
      };
    }
    // BASE
    const mins = [180, 210, 195, 240][(weekNumber - 1) % 4];
    const h = Math.floor(mins / 60);
    const m = mins % 60 ? `${mins % 60}m` : "";
    return {
      rideMins: mins,
      rideTitle: `Fondo de Base Aeróbica Ironman (${h}h${m} Z2 Continua)`,
      rideJust: "Construcción mitocondrial y eficiencia de pedaleo prolongado sin estrés glucolítico.",
      rideTarget: pwr(bikeFtp, 0.68),
      workoutDoc: `Salida\n- 20m 58% FTP\n\nMain (Volumen Mitocondrial)\n- ${mins - 35}m 68% FTP Cadencia 88-94 rpm, respiración aeróbica controlada\n\nEnfriamiento\n- 15m 50% FTP`,
    };
  }

  // 2. TRIATLÓN 70.3 (MEDIO IRONMAN)
  if (distanceType === "triathlon_703") {
    if (isRecovery) {
      return {
        rideMins: 75,
        rideTitle: "Fondo Suave de Asimilación 70.3 (1h15m Z1-Z2)",
        rideJust: "Descanso activo y soltura de piernas para asimilar la carga previa.",
        rideTarget: pwr(bikeFtp, 0.60),
        workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- 50m 60% FTP Cadencia ágil 92-96 rpm\n\nCooldown\n- 10m 50% FTP`,
      };
    }
    if (phase === "TAPER") {
      const mins = [55, 60][(weekNumber - 1) % 2];
      return {
        rideMins: mins,
        rideTitle: `Puesta a Punto Ciclismo 70.3 (${mins}m con Chispas de Ritmo)`,
        rideJust: "Frescura neuromuscular con activaciones cortas a ritmo de carrera.",
        rideTarget: pwr(bikeFtp, 0.75),
        workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain (Activación 70.3)\n- 25m 65% FTP\n3x\n- 3m 82% FTP Ritmo 70.3 en acoples\n- 3m 55% FTP\n\nCooldown\n- 10m 50% FTP`,
      };
    }
    if (phase === "PEAK") {
      const mins = [150, 165, 135][(weekNumber - 1) % 3];
      const h = Math.floor(mins / 60);
      const m = mins % 60 ? `${mins % 60}m` : "";
      return {
        rideMins: mins,
        rideTitle: `Simulación de Competición 70.3 (${h}h${m} Pacing 80-84% FTP)`,
        rideJust: `Ensayo específico del sector ciclismo 70.3 con bloques a potencia de carrera (${pwr(bikeFtp, 0.82)}).`,
        rideTarget: pwr(bikeFtp, 0.82),
        workoutDoc: `Aproximación\n- 20m 60% FTP\n\nMain (Simulación Ritmo 70.3)\n- 30m 68% FTP\n2x\n- 35m 82% FTP Posición acoplada aero continua\n- 10m 62% FTP\n- 15m 70% FTP\n\nCooldown\n- 15m 50% FTP`,
      };
    }
    if (phase === "BUILD") {
      const mins = [140, 160, 135, 165][(weekNumber - 1) % 4];
      const h = Math.floor(mins / 60);
      const m = mins % 60 ? `${mins % 60}m` : "";
      return {
        rideMins: mins,
        rideTitle: `Fondo con Bloques de Ritmo 70.3 (${h}h${m})`,
        rideJust: "Adaptación a potencia de umbral aeróbico y fatiga neuromuscular en posición contra-reloj.",
        rideTarget: pwr(bikeFtp, 0.80),
        workoutDoc: `Warmup\n- 20m 60% FTP\n\nMain (Bloques de Ritmo)\n- 40m 68% FTP\n3x\n- 18m 80-83% FTP en acoples aero\n- 7m 60% FTP\n- 15m 68% FTP\n\nCooldown\n- 15m 50% FTP`,
      };
    }
    // BASE
    const mins = [110, 125, 120, 135][(weekNumber - 1) % 4];
    return {
      rideMins: mins,
      rideTitle: `Fondo de Base Aeróbica 70.3 (${mins}m Z2 Continua)`,
      rideJust: "Fondo mitocondrial y control de postura aerodinámica.",
      rideTarget: pwr(bikeFtp, 0.68),
      workoutDoc: `Warmup\n- 15m 55% FTP\n\nMain\n- ${mins - 25}m 68% FTP Cadencia 90 rpm\n\nCooldown\n- 10m 50% FTP`,
    };
  }

  // 3. TRIATLÓN CORTO / OLÍMPICO
  if (distanceType === "triathlon_short") {
    if (isRecovery) {
      return {
        rideMins: 45,
        rideTitle: "Soltura y Asimilación Ciclismo Olímpico (45m Z1-Z2)",
        rideJust: "Recuperación activa y lavado metabólico.",
        rideTarget: pwr(bikeFtp, 0.60),
        workoutDoc: `Warmup\n- 10m 55% FTP\n\nMain\n- 30m 60% FTP\n\nCooldown\n- 5m 50% FTP`,
      };
    }
    const mins = phase === "PEAK" ? [80, 90, 85][(weekNumber - 1) % 3]
      : phase === "BUILD" ? [75, 85, 80][(weekNumber - 1) % 3]
      : [65, 75, 70][(weekNumber - 1) % 3];
    return {
      rideMins: mins,
      rideTitle: `Fondo Ciclismo Olímpico (${mins}m con Ritmo de Prueba)`,
      rideJust: "Potencia específica de 40 km y tolerancia a cambios de ritmo.",
      rideTarget: pwr(bikeFtp, 0.82),
      workoutDoc: `Warmup\n- 15m 60% FTP\n\nMain\n- 25m 70% FTP\n3x\n- 8m 88% FTP Ritmo Olímpico\n- 4m 55% FTP\n\nCooldown\n- 10m 50% FTP`,
    };
  }

  // 4. CICLISMO: ESCALADA & PUERTOS
  if (distanceType === "cycling_climbing") {
    if (isRecovery) {
      return {
        rideMins: 75,
        rideTitle: "Rodaje Suave de Asimilación & Piernas Ligeras (1h15m Z1-Z2)",
        rideJust: "Recuperación activa sin desnivel para regenerar fibras musculares.",
        rideTarget: pwr(bikeFtp, 0.60),
        workoutDoc: `Main (Terreno Llano)\n- 1h15m 60% FTP (92-98 rpm fluidez total)`,
      };
    }
    const mins = phase === "PEAK" ? [180, 210, 195][(weekNumber - 1) % 3]
      : phase === "BUILD" ? [150, 180, 165, 195][(weekNumber - 1) % 4]
      : [120, 150, 135, 165][(weekNumber - 1) % 4];
    const h = Math.floor(mins / 60);
    const m = mins % 60 ? `${mins % 60}m` : "";
    return {
      rideMins: mins,
      rideTitle: `Fondo de Puertos & Escalada Específica (${h}h${m})`,
      rideJust: "Fuerza resistente en rampas largas y modulación de cadencia entre 55 y 75 rpm.",
      rideTarget: pwr(bikeFtp, 0.78, "78-88% FTP en subida"),
      workoutDoc: `Aproximación\n- 20m 60% FTP\n\nSector de Escalada\n- ${mins - 40}m Fondo con ascensiones\n- Misión: Subir los puertos principales a 82-90% FTP (55-65 rpm de fuerza)\n- En llano: Rodar a 65% FTP con cadencia ligera\n\nRetorno\n- 20m 50% FTP`,
    };
  }

  // 5. CICLISMO: GRAN FONDO & CRITERIUM
  if (distanceType === "cycling_fondo" || distanceType === "cycling_criterium") {
    if (isRecovery) {
      return {
        rideMins: 70,
        rideTitle: "Rodaje Suave Regenerativo Gran Fondo (1h10m Z1)",
        rideJust: "Asimilación biológica sin fatiga central.",
        rideTarget: pwr(bikeFtp, 0.58),
        workoutDoc: `Main\n- 1h10m 58% FTP Cadencia constante a 92 rpm`,
      };
    }
    const mins = phase === "PEAK" ? [180, 210, 190][(weekNumber - 1) % 3]
      : phase === "BUILD" ? [150, 175, 160, 190][(weekNumber - 1) % 4]
      : [120, 140, 130, 155][(weekNumber - 1) % 4];
    const h = Math.floor(mins / 60);
    const m = mins % 60 ? `${mins % 60}m` : "";
    return {
      rideMins: mins,
      rideTitle: `Fondo Gran Fondo con Variaciones de Ritmo (${h}h${m})`,
      rideJust: "Simulación de pelotón, pasos por cotas vivas y resistencia a la fatiga glucogénica.",
      rideTarget: pwr(bikeFtp, 0.74, "68-80% FTP"),
      workoutDoc: `Salida\n- 20m 60% FTP\n\nMain (Gran Fondo)\n- ${mins - 35}m 72% FTP con repechos libres a ritmo vivo (85% FTP)\n\nCooldown\n- 15m 50% FTP`,
    };
  }

  // 6. CASO GENERAL / CROSS-TRAINING / ROTACIÓN MULTIDEPORTE
  if (phase === "TAPER") {
    const mins = weekNumber % 2 === 0 ? 45 : 55;
    return {
      rideMins: mins,
      rideTitle: `Pedaleo Ciclista de Descarga Pre-Carrera (${mins}m Z1)`,
      rideJust: "Soltura de piernas y lavado láctico pre-competición con cero fatiga.",
      rideTarget: pwr(bikeFtp, 0.58),
      workoutDoc: `Warmup\n- 10m 50% FTP\n\nMain\n- ${mins - 18}m 58% FTP (95 rpm)\n- 3x 30s aceleración 90% FTP sin forzar\n\nCooldown\n- 5m 45% FTP`,
    };
  }

  if (isRecovery) {
    return {
      rideMins: 60,
      rideTitle: "Fondo Suave de Asimilación Ciclismo (1h Z1-Z2)",
      rideJust: "Lavado muscular y descanso activo.",
      rideTarget: pwr(bikeFtp, 0.60),
      workoutDoc: `Main\n- 1h 60% FTP Cadencia ágil continua`,
    };
  }

  // Rotación rica sobre el catálogo outdoor ampliado (11 sesiones distintas)
  const outdoorPool = ALL_CYCLING_OUTDOOR_WORKOUTS;
  const stride = 3; // Coprimo con 11 para alternancia óptima
  const idx = ((weekNumber - 1) * stride) % outdoorPool.length;
  const sel = outdoorPool[idx >= 0 ? idx : 0] || outdoorPool[0];

  return {
    rideMins: sel.durationMin,
    rideTitle: sel.name,
    rideJust: sel.justification,
    rideTarget: interpolateWorkoutTarget(sel.powerTarget, { bikeFtp, discipline: "Ciclismo" }),
    workoutDoc: sel.workoutDoc,
  };
}

export function resolveTriathlonBrick(params: {
  day: string;
  dateStr: string;
  formattedDate: string;
  curatedModel: ReturnType<typeof resolveTrainingModel>;
  phase: string;
  isRecovery: boolean;
  isRaceWeek: boolean;
  distanceType?: MacrocycleDistanceType;
  runFtp?: number;
}): PlanItem | null {
  const { day, dateStr, formattedDate, curatedModel, phase, isRecovery, isRaceWeek, distanceType, runFtp } = params;
  if (curatedModel.sportCategory !== "Triathlon" || isRecovery || isRaceWeek) return null;

  const isBuildOrPeak = phase === "BUILD" || phase === "PEAK";
  const isTaper = phase === "TAPER";
  const t2M = isTaper
    ? 12
    : isBuildOrPeak
    ? (distanceType === "triathlon_1406" ? 30 : distanceType === "triathlon_703" ? 25 : 15)
    : (distanceType === "triathlon_1406" ? 20 : 15);

  const t2Pct = isTaper ? 75 : isBuildOrPeak ? 85 : 72;
  const t2Pwr = runFtp ? `${Math.round(runFtp * (t2Pct / 100))}W (${t2Pct}% CP)` : `${t2Pct}% Pace`;
  const t2Title = isTaper
    ? `Mini-Transición T2 de Activación (${t2M}m @ ${t2Pct}% ${runFtp ? "CP" : "Pace"})`
    : isBuildOrPeak
    ? `Transición T2 Post-Ciclismo (${t2M}m @ ${t2Pct}% ${runFtp ? "CP" : "Pace"})`
    : `Transición T2 Técnica & Adaptación (${t2M}m @ ${t2Pct}% ${runFtp ? "CP" : "Pace"})`;

  const t2Tss = Math.max(12, Math.round(t2M * (t2Pct / 100)));
  return {
    day, date: dateStr, formattedDate, discipline: "Carrera", activityType: "Brick",
    workoutName: t2Title, action: "MANTENER", durationMinutes: t2M, tss: t2Tss, powerTarget: t2Pwr,
    justification: isBuildOrPeak
      ? "Transición inmediata T2 (< 3-5 min) tras el sector de ciclismo para automatizar la zancada sobre fatiga muscular acumulada."
      : isTaper
      ? "Mini-transición rápida para mantener la agilidad de zancada post-pedaleo y la memoria muscular."
      : "Transición suave T2 para acostumbrar al sistema cardiovascular y neuromuscular a la redistribución del flujo sanguíneo.",
    workoutDoc: `Warmup\n- 3m 65% CP Adaptación\n\nMain (Ritmo de Carrera en Fatiga)\n- ${t2M - 5}m ${t2Pct}% CP (180 spm)\n\nCooldown\n- 2m 55% CP`,
    isRestDay: false,
  };
}
