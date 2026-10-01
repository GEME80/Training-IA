/**
 * 🚴 Catálogo de Entrenamientos de Calidad Ciclista (Rodillo, Intervalos, VO2max y Escaleras)
 * Gobernanza: Dr. Bent Rønnestad, Dr. Andrew Coggan y Hunter Allen.
 * Sintaxis oficial: Tiempo ('m', 's') y porcentaje de potencia de umbral funcional ('% FTP').
 */

export interface CyclingWorkoutItem {
  name: string;
  powerTarget: string;
  justification: string;
  workoutDoc: string;
  durationMin: number;
}

export const BIKE_RONNESTAD_30_15: CyclingWorkoutItem = {
  name: "Micro-Intervalos Rønnestad 30/15 (3 bloques de 10x [30s / 15s])",
  powerTarget: "120% FTP en picos / 50% FTP recuperación",
  justification: "Protocolo del Dr. Rønnestad comprobado para elevar el VO2max y la potencia submáxima con menor acidosis que intervalos continuos.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloque 1 Rønnestad)
10x
- 30s 120% FTP
- 15s 50% FTP

Recuperación
- 3m 50% FTP

Main (Bloque 2 Rønnestad)
10x
- 30s 120% FTP
- 15s 50% FTP

Recuperación
- 3m 50% FTP

Main (Bloque 3 Rønnestad)
10x
- 30s 120% FTP
- 15s 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 55,
};

export const BIKE_TABATA_40_20: CyclingWorkoutItem = {
  name: "Micro-Aceleraciones Tabata Ciclistas (2 series de 8x [40s / 20s])",
  powerTarget: "115% FTP en aceleraciones",
  justification: "Estimula la capacidad anaeróbica y la potencia máxima aeróbica simulando repechos cortos de alta exigencia.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Serie 1 Tabata)
8x
- 40s 115% FTP
- 20s 50% FTP

Recuperación Activa
- 4m 50% FTP

Main (Serie 2 Tabata)
8x
- 40s 115% FTP
- 20s 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 50,
};

export const BIKE_ESCALERA_PIRAMIDAL_VAM: CyclingWorkoutItem = {
  name: "Escalera Piramidal de Potencia Aeróbica (1m-2m-3m-4m-3m-2m-1m)",
  powerTarget: "90% a 115% FTP",
  justification: "Pasa gradualmente de la potencia anaeróbica al umbral y sweetspot, enseñando al sistema neuromuscular a modular cadencia y vatios.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Escalera Piramidal)
- 1m 115% FTP
- 1m 50% FTP
- 2m 105% FTP
- 1m30s 50% FTP
- 3m 98% FTP
- 2m 50% FTP
- 4m 90% FTP
- 2m30s 50% FTP
- 3m 98% FTP
- 2m 50% FTP
- 2m 105% FTP
- 1m30s 50% FTP
- 1m 115% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 60,
};

export const BIKE_OVER_UNDERS_SHUTTLING: CyclingWorkoutItem = {
  name: "Over-Unders de Aclaramiento de Lactato (3x 9m [2m @ 92% / 1m @ 108% FTP])",
  powerTarget: "92% sub-umbral / 108% supra-umbral FTP",
  justification: "Optimiza los transportadores monocarboxilatos (MCT1 y MCT4) para eliminar y reciclar el lactato sobre la bicicleta sin reducir la potencia.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloque Over-Under)
3x
- 2m 92% FTP
- 1m 108% FTP
- 2m 92% FTP
- 1m 108% FTP
- 2m 92% FTP
- 1m 108% FTP
- 3m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 60,
};

export const BIKE_TORQUE_BAJA_CADENCIA: CyclingWorkoutItem = {
  name: "Fuerza Resistencia & Torque en Subida (4x 6m @ 82% FTP a 55-60 rpm)",
  powerTarget: "82% FTP a 55-60 rpm",
  justification: "Recluta unidades motoras de alto umbral mediante torque muscular puro sin sobrecargar el sistema cardiovascular.",
  workoutDoc: `Warmup
- 15m 55% FTP (90 rpm)

Main (Series de Torque 55-60 rpm)
4x
- 6m 82% FTP
- 3m 55% FTP (95 rpm)

Cooldown
- 10m 45% FTP`,
  durationMin: 55,
};

export const BIKE_SWEETSPOT_EXTENSIVO: CyclingWorkoutItem = {
  name: "Series de Sweetspot Extensivo (3x 15m @ 88-90% FTP)",
  powerTarget: "88-90% FTP",
  justification: "Maximiza la densidad mitocondrial y el almacenamiento de glucógeno muscular con un estrés neuromuscular perfectamente tolerable.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloques Sweetspot)
3x
- 15m 89% FTP
- 4m 55% FTP

Cooldown
- 10m 50% FTP`,
  durationMin: 75,
};

export const BIKE_VO2MAX_COGGAN_5X3: CyclingWorkoutItem = {
  name: "Series de VO2max Clásicas Coggan (5x 3m @ 112% FTP)",
  powerTarget: "112% FTP",
  justification: "Protocolo estándar de oro para expandir el techo aeróbico del ciclista y la capacidad de soportar ataques en subida.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Series VO2max)
5x
- 3m 112% FTP
- 3m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 55,
};

export const ALL_CYCLING_INTERVAL_WORKOUTS = [
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
  BIKE_VO2MAX_COGGAN_5X3,
];
