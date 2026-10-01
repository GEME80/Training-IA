/**
 * 🏃 Catálogo de Entrenamientos de Pista y Ruta por Distancia Métrica Canónica
 * Gobernanza: Renato Canova, Jack Daniels y Pete Pfitzinger.
 * Estandarización oficial: Metros = 'mtr', Kilómetros = 'km', Descansos = 'm' o 's'.
 */

export interface RunningWorkoutItem {
  name: string;
  powerTarget: string;
  justification: string;
  workoutDoc: string;
  durationMin?: number;
}

export const RUN_DISTANCE_SERIES_8X_400M: RunningWorkoutItem = {
  name: "Series Clásicas de Velocidad Pura en Pista (8x 400m @ 106% Pace)",
  powerTarget: "106% Pace (106-108% CP)",
  justification: "Reclutamiento de fibras glucolíticas rápidas, reactividad elástica y cadencia ágil con pausas completas.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Series de 400m)
8x
- 400mtr 106% Pace
- 1m 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 50,
};

export const RUN_DISTANCE_SERIES_6X_800M: RunningWorkoutItem = {
  name: "Series Rectoras de VO2max en Pista (6x 800m @ 102% Pace)",
  powerTarget: "102% Pace (102-105% CP)",
  justification: "Estímulo de consumo máximo de oxígeno y capacidad de sostener esfuerzo severo durante 2.5 a 3 minutos.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Series de 800m)
6x
- 800mtr 102% Pace
- 1m30s 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 55,
};

export const RUN_DISTANCE_SERIES_5X_1000M: RunningWorkoutItem = {
  name: "Series de Umbral Funcional Daniels (5x 1000m @ 100% Pace)",
  powerTarget: "100% Pace (100% CP)",
  justification: "Elevación del ritmo umbral y tolerancia láctica específica en repeticiones de un kilómetro.",
  workoutDoc: `Warmup
- 15m 68% Pace

Main (Series de 1000m)
5x
- 1000mtr 100% Pace
- 2m 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 55,
};

export const RUN_DISTANCE_ESCALERA_200_800: RunningWorkoutItem = {
  name: "Escalera Progresiva de Pista (200m -> 400m -> 600m -> 800m)",
  powerTarget: "100-112% Pace",
  justification: "Reclutamiento piramidal de unidades motoras con descansos metabólicos proporcionales por tiempo.",
  workoutDoc: `Warmup
- 12m 65% Pace

Main (Escalera Progresiva)
- 200mtr 112% Pace
- 1m 55% Pace
- 400mtr 108% Pace
- 1m30s 55% Pace
- 600mtr 104% Pace
- 2m 55% Pace
- 800mtr 100% Pace
- 2m30s 55% Pace
- 600mtr 104% Pace
- 2m 55% Pace
- 400mtr 108% Pace
- 1m30s 55% Pace
- 200mtr 112% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 55,
};

export const RUN_DISTANCE_PIRAMIDAL_DESCENDENTE: RunningWorkoutItem = {
  name: "Piramidal de Descenso y Velocidad (1200m + 800m + 400m + 200m)",
  powerTarget: "98% a 114% Pace",
  justification: "Enseña a correr rápido sobre fatiga previa simulando la aceleración de los últimos kilómetros de carrera.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Piramidal Descendente)
- 1200mtr 98% Pace
- 2m30s 55% Pace
- 800mtr 102% Pace
- 2m 55% Pace
- 400mtr 108% Pace
- 1m30s 55% Pace
- 200mtr 114% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 50,
};

export const RUN_DISTANCE_BLOQUES_3X_2000M: RunningWorkoutItem = {
  name: "Bloques Largos de Umbral Canova (3x 2000m @ 98% Pace)",
  powerTarget: "98% Pace (98% CP)",
  justification: "Sostenimiento metabólico extensivo en máximo estado estable de lactato para 10K y 21K.",
  workoutDoc: `Warmup
- 15m 68% Pace

Main (Bloques de 2000m)
3x
- 2000mtr 98% Pace
- 2m30s 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 60,
};

export const RUN_DISTANCE_EXTENSIVO_3X_4KM: RunningWorkoutItem = {
  name: "Intervalos Extensivos de Asfalto Canova (3x 4km @ 82% Pace)",
  powerTarget: "82% Pace (82% CP - Ritmo Maratón)",
  justification: "Automatización de economía de carrera a potencia y ritmo maratón con descansos activos.",
  workoutDoc: `Warmup
- 15m 68% Pace

Main (Bloques de 4km)
3x
- 4km 82% Pace
- 5m 68% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 85,
};

export const RUN_DISTANCE_REPETICIONES_12X_200M: RunningWorkoutItem = {
  name: "Series Cortas de Reactividad & Economía (12x 200m @ 112% Pace)",
  powerTarget: "112% Pace",
  justification: "Stiffness de tobillo, reactividad elástica del pie y cadencia ágil (185+ spm) sin acumulación de lactato.",
  workoutDoc: `Warmup
- 15m 65% Pace

Main (Series de 200m)
12x
- 200mtr 112% Pace
- 50s 50% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 45,
};

export const RUN_DISTANCE_MILLA_4X_1600M: RunningWorkoutItem = {
  name: "Intervalos de Milla Clásica Daniels (4x 1600m @ 98% Pace)",
  powerTarget: "98% Pace (98% CP)",
  justification: "Resistencia específica a la fatiga en distancias de umbral extendido para medio maratón y maratón.",
  workoutDoc: `Warmup
- 15m 68% Pace

Main (Series de 1600m)
4x
- 1600mtr 98% Pace
- 2m30s 55% Pace

Cooldown
- 10m 55% Pace`,
  durationMin: 65,
};

export const ALL_RUNNING_DISTANCE_WORKOUTS = [
  RUN_DISTANCE_SERIES_8X_400M,
  RUN_DISTANCE_SERIES_6X_800M,
  RUN_DISTANCE_SERIES_5X_1000M,
  RUN_DISTANCE_ESCALERA_200_800,
  RUN_DISTANCE_PIRAMIDAL_DESCENDENTE,
  RUN_DISTANCE_BLOQUES_3X_2000M,
  RUN_DISTANCE_EXTENSIVO_3X_4KM,
  RUN_DISTANCE_REPETICIONES_12X_200M,
  RUN_DISTANCE_MILLA_4X_1600M,
];
