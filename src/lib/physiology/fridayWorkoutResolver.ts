/**
 * fridayWorkoutResolver.ts
 * Generador y rotador periodizado de sesiones de los Viernes.
 * Diseñado para evitar la monotonía semana a semana y proporcionar
 * estímulos específicos (fartlek aeróbico, ritmo progresivo Z3, strides de cadencia y soltura).
 */

export interface FridayWorkoutParams {
  runFtp?: number;
  isMultisport?: boolean;
  weekNumber?: number;
  phase?: string;
  isRecovery?: boolean;
}

export interface FridayWorkoutResult {
  workoutName: string;
  durationMinutes: number;
  tss: number;
  powerTarget: string;
  justification: string;
  workoutDoc: string;
}

export function resolveFridayWorkout(params: FridayWorkoutParams): FridayWorkoutResult {
  const { runFtp, isMultisport = false, weekNumber = 1, phase = "BASE", isRecovery = false } = params;
  const isPwr = runFtp !== undefined && runFtp > 0;

  // 1. SEMANA DE COMPETICIÓN (RACE WEEK)
  if (phase === "RACE_WEEK") {
    return {
      workoutName: "Trote Suave Pre-Carrera con Strides de Activación (25m)",
      durationMinutes: 25,
      tss: 16,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.72)}W (Z1-Z2)` : "72-75% Pace (Z1)",
      justification: "Trote regenerativo y 3 rectas muy fluidas para activar el tono neuromuscular y calmar nervios pre-competición con cero fatiga.",
      workoutDoc: isPwr
        ? "Warmup\n- 10m 70% CP\n\nMain (Soltura)\n- 10m 74% CP\n\nStrides de Activación (Chispa sin forzar)\n3x\n- 20s 88% CP\n- 40s 65% CP\n\nCooldown\n- 5m 68% CP"
        : "Warmup\n- 10m 72% Pace\n\nMain (Soltura)\n- 10m 75% Pace\n\nStrides de Activación (Chispa sin forzar)\n3x\n- 20s 88% Pace\n- 40s 68% Pace\n\nCooldown\n- 5m 70% Pace",
    };
  }

  // 2. FASE DE AFINAMIENTO (TAPER)
  if (phase === "TAPER") {
    return {
      workoutName: "Carrera Suave de Puesta a Punto con Strides (30m)",
      durationMinutes: 30,
      tss: 22,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.76)}W (76% CP)` : "76% Pace",
      justification: "Oxigenación aeróbica en fase de tapering con 4 rectas de frecuencia reactiva para mantener tono muscular sin drenar reservas de glucógeno.",
      workoutDoc: isPwr
        ? "Warmup\n- 10m 72% CP\n\nMain (Z2 Cómoda)\n- 12m 76% CP\n\nRectas (Strides de Frecuencia)\n4x\n- 20s 105% CP\n- 40s 65% CP\n\nCooldown\n- 4m 70% CP"
        : "Warmup\n- 10m 73% Pace\n\nMain (Z2 Cómoda)\n- 12m 76% Pace\n\nRectas (Strides de Frecuencia)\n4x\n- 20s 105% Pace\n- 40s 68% Pace\n\nCooldown\n- 4m 70% Pace",
    };
  }

  // 3. SEMANA DE DESCARGA / ASIMILACIÓN
  if (isRecovery) {
    return {
      workoutName: "Carrera de Soltura & Asimilación Z1-Z2 (35m)",
      durationMinutes: 35,
      tss: 24,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.74)}W (74% CP • Z1-Z2)` : "74-76% Pace",
      justification: "Trote regenerativo de descarga biológica y lavado de lactato para consolidar adaptaciones mitocondriales antes del fin de semana.",
      workoutDoc: isPwr
        ? "Warmup\n- 10m 70% CP\n\nMain (Soltura Regenerativa)\n- 20m 74% CP\n\nCooldown\n- 5m 68% CP"
        : "Warmup\n- 10m 72% Pace\n\nMain (Soltura Regenerativa)\n- 20m 76% Pace\n\nCooldown\n- 5m 70% Pace",
    };
  }

  // 4. MULTIDEPORTE / TRIATLÓN (Variación rotativa por semanas)
  if (isMultisport) {
    const rot = (weekNumber - 1) % 4;

    if (rot === 1) {
      // Semana 2, 6, 10... Fartlek Dinámico Aeróbico con estímulo Z3
      return {
        workoutName: "Fartlek Aeróbico Dinámico Z2-Z3 (40m)",
        durationMinutes: 40,
        tss: 38,
        powerTarget: isPwr ? `${Math.round(runFtp * 0.76)}-${Math.round(runFtp * 0.88)}W (Z2-Z3)` : "76-88% Pace",
        justification: "Fartlek continuo con 6 cambios cortos de 1 min a ritmo Z3 Tempo y 2 min de flotación en Z2 activa para estimular fibras tipo IIa sin fatigar para la tirada.",
        workoutDoc: isPwr
          ? "Warmup\n- 10m 74% CP\n\nMain (Fartlek Dinámico Z2-Z3)\n6x\n- 1m 88% CP\n- 2m 76% CP (flotación Z2)\n\nCooldown\n- 6m 72% CP"
          : "Warmup\n- 10m 74% Pace\n\nMain (Fartlek Dinámico Z2-Z3)\n6x\n- 1m 88% Pace\n- 2m 76% Pace (flotación Z2)\n\nCooldown\n- 6m 72% Pace",
      };
    }

    if (rot === 2) {
      // Semana 3, 7, 11... Carrera Progresiva con Final a Ritmo 70.3 (Z3)
      return {
        workoutName: "Carrera Progresiva con Final a Ritmo 70.3 (40m)",
        durationMinutes: 40,
        tss: 37,
        powerTarget: isPwr ? `${Math.round(runFtp * 0.76)}-${Math.round(runFtp * 0.87)}W (Z2->Z3)` : "76-87% Pace",
        justification: "Rodaje en progresión aeróbica desde Z2 cómoda cerrando con 12 minutos sólidos a ritmo específico de carrera 70.3 (Z3 Tempo).",
        workoutDoc: isPwr
          ? "Warmup\n- 10m 74% CP\n\nMain (Z2 Cómoda)\n- 15m 78% CP\n\nFinal Vivo (Ritmo Carrera 70.3)\n- 12m 87% CP\n\nCooldown\n- 3m 70% CP"
          : "Warmup\n- 10m 74% Pace\n\nMain (Z2 Cómoda)\n- 15m 78% Pace\n\nFinal Vivo (Ritmo Carrera 70.3)\n- 12m 87% Pace\n\nCooldown\n- 3m 71% Pace",
      };
    }

    if (rot === 3) {
      // Semana 4, 8, 12... Rodaje de Cadencia con 6 Strides Reactivos
      return {
        workoutName: "Rodaje de Cadencia Z2 con Strides Reactivos (40m)",
        durationMinutes: 40,
        tss: 36,
        powerTarget: isPwr ? `${Math.round(runFtp * 0.78)}W (78% CP + Strides)` : "78% Pace + Strides",
        justification: "Rodaje continuo enfatizando zancada económica (180 spm) y 6 rectas reactivas para optimizar el ciclo estiramiento-acortamiento antes del fin de semana.",
        workoutDoc: isPwr
          ? "Warmup\n- 10m 74% CP\n\nMain (Z2 Cadencia 180 spm)\n- 18m 78% CP\n\nRectas Reactivas de Cadencia\n6x\n- 20s 110% CP\n- 40s 65% CP\n\nCooldown\n- 6m 70% CP"
          : "Warmup\n- 10m 74% Pace\n\nMain (Z2 Cadencia 180 spm)\n- 18m 78% Pace\n\nRectas Reactivas de Cadencia\n6x\n- 20s 110% Pace\n- 40s 68% Pace\n\nCooldown\n- 6m 71% Pace",
      };
    }

    // Semana 1, 5, 9... Carrera Aeróbica Z2 Fluida con Rectas (Estándar Base)
    return {
      workoutName: "Carrera Aeróbica Z2 Fluida con Rectas (40m)",
      durationMinutes: 40,
      tss: 35,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.78)}W (78% CP • Z2 Activa)` : "78% Pace",
      justification: "Rodaje aeróbico continuo Z2 con 5 rectas de reactividad neuromuscular al 105% sin fatiga glucolítica antes del fin de semana.",
      workoutDoc: isPwr
        ? "Warmup\n- 10m 74% CP\n\nMain (Z2 Activa)\n- 20m 78% CP\n\nRectas (Strides)\n5x\n- 20s 105% CP\n- 40s 65% CP\n\nCooldown\n- 5m 70% CP"
        : "Warmup\n- 10m 74% Pace\n\nMain (Z2 Activa)\n- 20m 78% Pace\n\nRectas (Strides)\n5x\n- 20s 105% Pace\n- 40s 68% Pace\n\nCooldown\n- 5m 71% Pace",
    };
  }

  // 5. RUNNING PURO (Atletas de carrera exclusivamente)
  const rotRun = (weekNumber - 1) % 3;
  if (rotRun === 1) {
    return {
      workoutName: "Carrera Progresiva Aeróbica (45m con Final Z3)",
      durationMinutes: 45,
      tss: 43,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.76)}-${Math.round(runFtp * 0.88)}W (Z2->Z3)` : "76-88% Pace",
      justification: "Rodaje progresivo comenzando cómodo y consolidando 15 minutos en Z3 Tempo sostenido.",
      workoutDoc: isPwr
        ? "Warmup\n- 12m 74% CP\n\nMain (Z2 Cómoda)\n- 15m 78% CP\n\nFinal Vivo (Z3 Tempo)\n- 15m 87% CP\n\nCooldown\n- 3m 70% CP"
        : "Warmup\n- 12m 74% Pace\n\nMain (Z2 Cómoda)\n- 15m 78% Pace\n\nFinal Vivo (Z3 Tempo)\n- 15m 87% Pace\n\nCooldown\n- 3m 71% Pace",
    };
  }

  if (rotRun === 2) {
    return {
      workoutName: "Rodaje Z2 con Aceleraciones de Cadencia (45m)",
      durationMinutes: 45,
      tss: 40,
      powerTarget: isPwr ? `${Math.round(runFtp * 0.78)}W (78% CP)` : "78% Pace",
      justification: "Rodaje aeróbico con 6 aceleraciones de 30s para soltar piernas y trabajar reactividad neuromuscular.",
      workoutDoc: isPwr
        ? "Warmup\n- 12m 74% CP\n\nMain (Z2 Base)\n- 23m 78% CP\n\nRectas (Strides)\n6x\n- 30s 105% CP\n- 45s 65% CP\n\nCooldown\n- 5m 70% CP"
        : "Warmup\n- 12m 74% Pace\n\nMain (Z2 Base)\n- 23m 78% Pace\n\nRectas (Strides)\n6x\n- 30s 105% Pace\n- 45s 68% Pace\n\nCooldown\n- 5m 71% Pace",
    };
  }

  return {
    workoutName: "Carrera - Fartlek Dinámico & Activación Aeróbica (45m)",
    durationMinutes: 45,
    tss: 42,
    powerTarget: isPwr ? `${Math.round(runFtp * 0.74)}-${Math.round(runFtp * 0.90)}W (Z2-Z4)` : "74-90% Pace",
    justification: "Cambios de ritmo alegres y controlados para activar reactividad neuromuscular sin agotar las piernas antes de la tirada larga.",
    workoutDoc: isPwr
      ? "Warmup\n- 15m 74% CP\n\nMain (Fartlek Ágil)\n6x\n- 1m 90% CP\n- 2m 72% CP\n\nCooldown\n- 12m 70% CP"
      : "Warmup\n- 15m 74% Pace\n\nMain (Fartlek Ágil)\n6x\n- 1m 90% Pace\n- 2m 72% Pace\n\nCooldown\n- 12m 71% Pace",
  };
}
