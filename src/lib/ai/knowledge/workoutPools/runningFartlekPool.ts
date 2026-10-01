/**
 * 🏃 Catálogo de Fartleks Fisiológicos y Entrenamientos por Tiempo
 * Gobernanza: Steve Monegetti, Veronique Billat, Gosta Holmer y Jack Daniels.
 */

import { RunningWorkoutItem } from "./runningDistancePool";

export const RUN_FARTLEK_MONEGETTI: RunningWorkoutItem = {
  name: "Fartlek Monegetti Australiano (2x90s + 4x60s + 4x30s + 4x15s)",
  powerTarget: "102-115% Pace (102-115% CP)",
  justification: "Clásico del fondismo australiano. Cambios de ritmo decrecientes con recuperación idéntica al esfuerzo para estimular el VO2max y la soltura neuromuscular.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Fartlek Monegetti)
2x
- 90s 102% Pace
- 90s 65% Pace
4x
- 60s 106% Pace
- 60s 65% Pace
4x
- 30s 110% Pace
- 30s 65% Pace
4x
- 15s 115% Pace
- 15s 60% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 45,
};

export const RUN_FARTLEK_POLACO_FLOTACION: RunningWorkoutItem = {
  name: "Fartlek Polaco con Flotación Activa Z2 (4x [3m Fuerte / 2m Flotación])",
  powerTarget: "98% vs 74% Pace",
  justification: "Enseña al organismo a procesar y reutilizar el lactato mientras se corre en zona aeróbica continua sin detenerse.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Fartlek Polaco)
4x
- 3m 98% Pace
- 2m 74% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 42,
};

export const RUN_FARTLEK_SUECO_PIRAMIDAL: RunningWorkoutItem = {
  name: "Fartlek Sueco Piramidal Clásico (1m-2m-3m-2m-1m @ 92% Pace)",
  powerTarget: "90-94% Pace",
  justification: "Juego de ritmos continuo para desarrollo de umbral aeróbico y flexibilidad metabólica en terreno llano u ondulado.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Pirámide Sueca)
- 1m 92% Pace
- 1m 65% Pace
- 2m 90% Pace
- 1m30s 65% Pace
- 3m 88% Pace
- 2m 65% Pace
- 2m 90% Pace
- 1m30s 65% Pace
- 1m 92% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 42,
};

export const RUN_BILLAT_30_30: RunningWorkoutItem = {
  name: "Micro-Intervalos Dinámicos Billat vVO2max (2x 10x [30s / 30s])",
  powerTarget: "108% Pace",
  justification: "Protocolo de Veronique Billat que maximiza el tiempo en consumo máximo de oxígeno con mínima fatiga periférica muscular.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Bloque 1 Billat)
10x
- 30s 108% Pace
- 30s 55% Pace

Recuperación Activa
- 3m 55% Pace

Main (Bloque 2 Billat)
10x
- 30s 108% Pace
- 30s 55% Pace

Cooldown
- 7m 55% Pace`,
  durationMin: 45,
};

export const RUN_FARTLEK_CUESTAS_NEUROMUSCULAR: RunningWorkoutItem = {
  name: "Fartlek de Cuestas Cortas & Potencia Elástica (6x 45s en Cuesta)",
  powerTarget: "98% Pace en cuesta",
  justification: "Reclutamiento de unidades motoras rápidas y rigidez del tobillo sin impacto articular severo gracias a la inclinación.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Cuestas Cortas)
6x
- 45s 98% Pace
- 1m15s 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 40,
};

export const RUN_TEMPO_BLOQUES_3X_10M: RunningWorkoutItem = {
  name: "Bloques Continuos de Umbral de Lactato (3x 10m @ 98% Pace)",
  powerTarget: "98% Pace (98% CP)",
  justification: "Elevación del ritmo de crucero y fortalecimiento de la resistencia mental en tramos prolongados de umbral.",
  workoutDoc: `Warmup
- 15m 68% Pace

Main (Bloques de Umbral)
3x
- 10m 98% Pace
- 3m 60% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 55,
};

export const RUN_PIRAMIDE_CONTINUA_Z2_Z3: RunningWorkoutItem = {
  name: "Carrera Continua en Pirámide Aeróbica (45m progresivo Z1 a Z3)",
  powerTarget: "70% a 85% Pace",
  justification: "Desarrollo mitocondrial con aceleración final controlada para enseñar al cuerpo a gastar grasas a intensidades progresivas.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Progresión Continua)
- 15m 74% Pace
- 10m 82% Pace
- 5m 86% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 50,
};

export const ALL_RUNNING_FARTLEK_WORKOUTS = [
  RUN_FARTLEK_MONEGETTI,
  RUN_FARTLEK_POLACO_FLOTACION,
  RUN_FARTLEK_SUECO_PIRAMIDAL,
  RUN_BILLAT_30_30,
  RUN_FARTLEK_CUESTAS_NEUROMUSCULAR,
  RUN_TEMPO_BLOQUES_3X_10M,
  RUN_PIRAMIDE_CONTINUA_Z2_Z3,
];
