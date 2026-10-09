/**
 * 🏃 Catálogo de Entrenamientos de Tempo, Umbral Funcional y Cruise Intervals
 * Gobernanza: Jack Daniels (Cruise Intervals), Renato Canova y Pete Pfitzinger (Lactate Threshold).
 */

import { RunningWorkoutItem } from "./runningDistancePool";

export const RUN_TEMPO_CRUISE_4X_2000M: RunningWorkoutItem = {
  name: "Cruise Intervals Daniels en Asfalto (4x 2000m @ 92% Pace)",
  powerTarget: "92% Pace (92% CP - Ritmo Umbral)",
  justification: "Entrenamiento clásico de Jack Daniels para acumular gran volumen a ritmo umbral con micro-pausas que evitan la sobreproducción de ácido láctico.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Cruise Intervals)
4x
- 2000mtr 92% Pace
- 2m 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 55,
};

export const RUN_TEMPO_CONTINUO_30M: RunningWorkoutItem = {
  name: "Tempo Run Continuo en Estado Estable (30m @ 88-90% Pace)",
  powerTarget: "88-90% Pace (88-90% CP)",
  justification: "Desarrollo de la capacidad de mantener concentración mental y estabilidad mecánica en la frontera del umbral de lactato.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Tempo Continuo)
- 30m 89% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 50,
};

export const RUN_TEMPO_PROGRESIVO_CANOVA: RunningWorkoutItem = {
  name: "Carrera Progresiva Canova Z2 -> Z4 (45m Progresivo)",
  powerTarget: "72% a 95% Pace",
  justification: "Transición metabólica escalonada: inicia en quema de grasas pura y culmina a ritmo de competición de 10K.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main (Escalones Canova)
- 15m 72% Pace
- 12m 82% Pace
- 8m 92% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 50,
};

export const RUN_TEMPO_ALTERNANCIAS_3X_8M: RunningWorkoutItem = {
  name: "Alternancias de Umbral & Flotación Aeróbica (3x [8m Z4 / 2m Z2])",
  powerTarget: "94% vs 72% Pace",
  justification: "Enseña a los miocitos a reciclar el lactato como combustible muscular durante la fase de flotación sin detener el avance.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Alternancias)
3x
- 8m 94% Pace
- 2m 72% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 53,
};

export const RUN_TEMPO_FRACCIONADO_2X_15M: RunningWorkoutItem = {
  name: "Tempo Fraccionado Pfitzinger (2x 15m @ 90% Pace)",
  powerTarget: "90% Pace (90% CP)",
  justification: "30 minutos totales de estímulo umbral dividido en dos series para mantener la calidad técnica y la zancada sin fatiga terminal.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Tempo Fraccionado)
2x
- 15m 90% Pace
- 3m 55% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 53,
};

export const RUN_TEMPO_ONDULADO_ESTRUCTURADO: RunningWorkoutItem = {
  name: "Tempo en Terreno Ondulado con Cambios de Ritmo (45m)",
  powerTarget: "80-92% Pace",
  justification: "Adaptación neuromuscular y control de la cadencia en pendientes variadas manteniendo el pulso y la potencia bajo control.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Ondulaciones)
4x
- 3m 92% Pace
- 2m 70% Pace

Continuo
- 10m 78% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 50,
};

export const RUN_TEMPO_EXTENSIVO_2X_20M: RunningWorkoutItem = {
  name: "Umbral Extensivo de Medio Maratón (2x 20m @ 86-88% Pace)",
  powerTarget: "86-88% Pace (Ritmo Medio Maratón)",
  justification: "Específico para dominar el ritmo objetivo de 21K con un descanso corto de recuperación que restaura los sustratos.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Extensivo)
2x
- 20m 87% Pace
- 3m 55% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 63,
};

export const RUN_TEMPO_SPLIT_3X_10M_PROGRESIVO: RunningWorkoutItem = {
  name: "Tempo Split Progresivo Escalado (3x 10m @ 88% -> 92% -> 96%)",
  powerTarget: "88% a 96% Pace",
  justification: "Estimula la aceleración controlada en 3 bloques consecutivos para simular el esfuerzo creciente de una competición de ruta.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Bloque 1)
- 10m 88% Pace
- 2m30s 55% Pace

Main (Bloque 2)
- 10m 92% Pace
- 2m30s 55% Pace

Main (Bloque 3)
- 10m 96% Pace

Cooldown
- 8m 55% Pace`,
  durationMin: 55,
};

export const ALL_RUNNING_TEMPO_WORKOUTS = [
  RUN_TEMPO_CRUISE_4X_2000M,
  RUN_TEMPO_CONTINUO_30M,
  RUN_TEMPO_PROGRESIVO_CANOVA,
  RUN_TEMPO_ALTERNANCIAS_3X_8M,
  RUN_TEMPO_FRACCIONADO_2X_15M,
  RUN_TEMPO_ONDULADO_ESTRUCTURADO,
  RUN_TEMPO_EXTENSIVO_2X_20M,
  RUN_TEMPO_SPLIT_3X_10M_PROGRESIVO,
];
