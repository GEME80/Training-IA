/**
 * Catálogo Científico y Progresivo de Entrenamientos de Natación (Joe Friel / Jan Olbrecht).
 * Motor de rotación coprima anti-repetición según fase y microciclo.
 */

import {
  SwimWorkoutDefinition,
  BASE_SWIM_WORKOUTS,
  BUILD_SWIM_WORKOUTS,
} from "./swimWorkoutsBaseBuild";
import {
  PEAK_SWIM_WORKOUTS,
  TAPER_SWIM_WORKOUTS,
  RECOVERY_SWIM_WORKOUTS,
} from "./swimWorkoutsPeakTaper";

export type { SwimWorkoutDefinition };

export const SWIM_WORKOUT_POOL: Record<string, SwimWorkoutDefinition[]> = {
  BASE: BASE_SWIM_WORKOUTS,
  BUILD: BUILD_SWIM_WORKOUTS,
  PEAK: PEAK_SWIM_WORKOUTS,
  TAPER: TAPER_SWIM_WORKOUTS,
  RECOVERY: RECOVERY_SWIM_WORKOUTS,
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function getCoprimeStride(length: number, preferred: number = 3): number {
  if (length <= 1) return 1;
  let s = preferred;
  while (gcd(s, length) !== 1) {
    s++;
  }
  return s;
}

/**
 * Selecciona una sesión de natación rotativa sin repeticiones consecutivas
 * utilizando paso coprimo sobre el catálogo de la fase correspondiente.
 */
export function selectSwimWorkout(
  phase: string,
  weekNumber: number,
  isRecovery: boolean,
  sessionIndex: number = 1
): SwimWorkoutDefinition {
  let list = SWIM_WORKOUT_POOL.BASE;

  if (isRecovery) {
    list = SWIM_WORKOUT_POOL.RECOVERY;
  } else if (phase === "TAPER" || phase === "RACE_WEEK") {
    list = SWIM_WORKOUT_POOL.TAPER;
  } else if (phase === "PEAK") {
    list = SWIM_WORKOUT_POOL.PEAK;
  } else if (phase === "BUILD") {
    list = SWIM_WORKOUT_POOL.BUILD;
  }

  const strideWeek = getCoprimeStride(list.length, 2);
  const strideSession = getCoprimeStride(list.length, 1);
  const idx = ((weekNumber - 1) * strideWeek + (sessionIndex - 1) * strideSession) % list.length;

  return list[idx >= 0 ? idx : 0] || list[0];
}
