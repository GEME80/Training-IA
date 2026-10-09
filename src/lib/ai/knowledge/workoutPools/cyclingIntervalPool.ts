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

export const BIKE_SEILER_4X8_THRESHOLD: CyclingWorkoutItem = {
  name: "Intervalos Polarizados de Umbral Seiler (4x 8m @ 104% FTP)",
  powerTarget: "104% FTP",
  justification: "Protocolo del Dr. Stephen Seiler comprobado como el estímulo más efectivo para maximizar el FTP y la fracción de utilización de VO2max.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloque Polarizado Seiler)
4x
- 8m 104% FTP
- 3m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 65,
};

export const BIKE_BILLAT_30_30_VO2MAX: CyclingWorkoutItem = {
  name: "Micro-Intervalos Véronique Billat 30/30 (2 bloques de 10x [30s / 30s])",
  powerTarget: "125% FTP en picos / 50% FTP recuperación",
  justification: "Maximiza el tiempo acumulado en o cerca del VO2max (>90% VO2max) minimizando la acumulación de fatiga neuromuscular periférica.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloque 1 Billat 30/30)
10x
- 30s 125% FTP
- 30s 50% FTP

Recuperación Activa
- 4m 50% FTP

Main (Bloque 2 Billat 30/30)
10x
- 30s 125% FTP
- 30s 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 55,
};

export const BIKE_SWEETSPOT_PIRAMIDE: CyclingWorkoutItem = {
  name: "Pirámide Sweetspot de Progresión Continua (10m-15m-10m @ 90% FTP)",
  powerTarget: "90% FTP",
  justification: "Genera una gran densidad mitocondrial acumulando 35 minutos netos de Sweetspot sin picos excesivos de estrés biológico.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Pirámide Sweetspot)
- 10m 90% FTP
- 3m 50% FTP
- 15m 90% FTP
- 4m 50% FTP
- 10m 90% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 60,
};

export const BIKE_OVER_UNDERS_CRISS_CROSS: CyclingWorkoutItem = {
  name: "Criss-Cross Over-Unders de Umbral Dinámico (3x 12m [2m @ 92% / 1m @ 106% FTP])",
  powerTarget: "92% sub-umbral / 106% supra-umbral FTP",
  justification: "Entrena al músculo a aclimatarse a la producción y reutilización continua de iones de hidrógeno y lactato en puertos y repechos.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloques Criss-Cross)
3x
- 2m 92% FTP
- 1m 106% FTP
- 2m 92% FTP
- 1m 106% FTP
- 2m 92% FTP
- 1m 106% FTP
- 2m 92% FTP
- 1m 106% FTP
- 3m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 70,
};

export const BIKE_THRESHOLD_TT_SIMULATION: CyclingWorkoutItem = {
  name: "Simulación de Potencia Contrarreloj & Umbral (2x 18m @ 98-100% FTP)",
  powerTarget: "98-100% FTP",
  justification: "Capacidad mental y fisiológica de mantener potencia de umbral sostenida en posición aerodinámica continua.",
  workoutDoc: `Warmup
- 15m 55% FTP
- 3x 30s 100% FTP (recup 1m)

Main (Bloques de Umbral TT)
2x
- 18m 99% FTP
- 5m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 70,
};

export const BIKE_MICROBURSTS_15_15: CyclingWorkoutItem = {
  name: "Micro-Bursts de Ataque & Capacidad Anaeróbica (3 series de 10x [15s / 15s])",
  powerTarget: "135% FTP en ataques / 50% FTP recuperación",
  justification: "Aumenta la tasa de producción glucolítica y la tolerancia a arrancadas bruscas repetidas, clave para criterium y escapadas.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Serie 1 Micro-Bursts)
10x
- 15s 135% FTP
- 15s 50% FTP

Recuperación
- 3m 50% FTP

Main (Serie 2 Micro-Bursts)
10x
- 15s 135% FTP
- 15s 50% FTP

Recuperación
- 3m 50% FTP

Main (Serie 3 Micro-Bursts)
10x
- 15s 135% FTP
- 15s 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 55,
};

export const BIKE_TEMPO_CADENCIA_VARIABLE: CyclingWorkoutItem = {
  name: "Tempo Aeróbico Z3 con Variaciones de Cadencia (3x 12m @ 82% FTP)",
  powerTarget: "82% FTP (alternando 70 rpm y 100 rpm)",
  justification: "Desarrolla versatilidad neuromuscular enseñando a producir la misma potencia tanto con torque muscular como con alta cadencia cardiovascular.",
  workoutDoc: `Warmup
- 15m 55% FTP

Main (Bloques de Tempo y Cadencia)
3x
- 6m 82% FTP (70-75 rpm fuerza)
- 6m 82% FTP (95-100 rpm fluidez)
- 3m 50% FTP

Cooldown
- 10m 45% FTP`,
  durationMin: 65,
};

export const ALL_CYCLING_INTERVAL_WORKOUTS = [
  BIKE_RONNESTAD_30_15,
  BIKE_TABATA_40_20,
  BIKE_ESCALERA_PIRAMIDAL_VAM,
  BIKE_OVER_UNDERS_SHUTTLING,
  BIKE_TORQUE_BAJA_CADENCIA,
  BIKE_SWEETSPOT_EXTENSIVO,
  BIKE_VO2MAX_COGGAN_5X3,
  BIKE_SEILER_4X8_THRESHOLD,
  BIKE_BILLAT_30_30_VO2MAX,
  BIKE_SWEETSPOT_PIRAMIDE,
  BIKE_OVER_UNDERS_CRISS_CROSS,
  BIKE_THRESHOLD_TT_SIMULATION,
  BIKE_MICROBURSTS_15_15,
  BIKE_TEMPO_CADENCIA_VARIABLE,
];
