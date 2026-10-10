/**
 * 🏃 Catálogo de Entrenamientos Aeróbicos Base Z2 y Regenerativos Z1
 * Gobernanza: Arthur Lydiard (Base Aeróbica), Stephen Seiler (Polarized Z1/Z2) y Phil Maffetone (MAF).
 */

export interface RunningAerobicWorkoutItem {
  name: string;
  powerTarget: string;
  justification: string;
  workoutDoc: string;
  durationMin: number;
}

export const RUN_AEROBIC_Z1_REGENERATIVO_PURO_35M: RunningAerobicWorkoutItem = {
  name: "Trote Suave Z1 Regenerativo Puro (35m)",
  powerTarget: "62-68% Pace (Z1 Puro)",
  justification: "Recuperación biológica activa, aclaramiento neuromuscular y protección estricta del tono parasimpático.",
  workoutDoc: `Warmup
- 5m 60% Pace

Main (Trote Suave)
- 25m 65% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 35,
};

export const RUN_AEROBIC_Z2_CAPILARIZACION_45M: RunningAerobicWorkoutItem = {
  name: "Rodaje Base Aeróbico Z2 (45m)",
  powerTarget: "72-76% Pace (Z2 Aeróbico)",
  justification: "Desarrollo aeróbico continuo y eficiente quema de grasas a ritmo cómodo y conversacional.",
  workoutDoc: `Warmup
- 8m 65% Pace

Main (Rodaje Base)
- 32m 74% Pace

Cooldown
- 5m 60% Pace`,
  durationMin: 45,
};

export const RUN_AEROBIC_Z1_Z2_PROGRESIVO_40M: RunningAerobicWorkoutItem = {
  name: "Carrera Progresiva Z1-Z2 con Rectas de Soltura (40m + 4 Rectas)",
  powerTarget: "68% a 78% Pace + Rectas",
  justification: "Transición de ritmo suave a aeróbico estable culminando con toques neuromusculares de zancada sin acumular fatiga.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main
- 22m 74% Pace

Rectas de Soltura
4x
- 20s 90% Pace
- 40s 55% Pace

Cooldown
- 4m 55% Pace`,
  durationMin: 40,
};

export const RUN_AEROBIC_CADENCIA_180SPM_45M: RunningAerobicWorkoutItem = {
  name: "Rodaje Aeróbico con Enfoque en Cadencia Ágil (45m @ 180 spm)",
  powerTarget: "72-75% Pace (178-182 spm)",
  justification: "Optimización de la economía biomecánica reduciendo el tiempo de contacto con el suelo (GCT) y oscilación vertical.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main (Cadencia 180 spm)
- 30m 73% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 45,
};

export const RUN_AEROBIC_DESCARGA_FASCIAL_30M: RunningAerobicWorkoutItem = {
  name: "Trote Suave de Descarga Fascial & Respiración Nasal (30m)",
  powerTarget: "60-65% Pace",
  justification: "Oxigenación celular suave con respiración puramente nasal para controlar el estrés nervioso y liberar tensión.",
  workoutDoc: `Main (Respiración Nasal)
- 30m 62% Pace`,
  durationMin: 30,
};

export const RUN_AEROBIC_SUPERFICIE_BLANDA_45M: RunningAerobicWorkoutItem = {
  name: "Carrera Continua en Césped / Superficie Blanda (45m Z2)",
  powerTarget: "70-74% Pace",
  justification: "Amortiguación articular y estimulación propioceptiva en terreno blando para descargar la columna y rodillas.",
  workoutDoc: `Warmup
- 8m 65% Pace

Main (Césped / Tierra)
- 32m 72% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 45,
};

export const RUN_AEROBIC_ONDULADO_SUAVE_40M: RunningAerobicWorkoutItem = {
  name: "Rodaje Aeróbico en Terreno Ondulado Suave (40m Z2)",
  powerTarget: "68-76% Pace",
  justification: "Fuerza elástica natural al superar pequeños desniveles manteniendo el pulso y la potencia siempre en Zona 2.",
  workoutDoc: `Warmup
- 8m 65% Pace

Main (Ondulado Suave)
- 27m 72% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 40,
};

export const RUN_AEROBIC_CORE_INTEGRADO_45M: RunningAerobicWorkoutItem = {
  name: "Carrera Aeróbica Z2 con Enfoque Postural Erguido (45m)",
  powerTarget: "73-77% Pace",
  justification: "Mantenimiento consciente de la postura pélvica neutra y apertura torácica durante el kilometraje aeróbico.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main (Postura Alta)
- 30m 75% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 45,
};

export const RUN_AEROBIC_POST_CICLISMO_35M: RunningAerobicWorkoutItem = {
  name: "Trote Suave Z1 de Absorción Post-Ciclismo (35m)",
  powerTarget: "65-70% Pace",
  justification: "Regeneración activa diseñada para días posteriores a fondos de ciclismo, soltando el tren inferior sin impacto duro.",
  workoutDoc: `Warmup
- 5m 62% Pace

Main (Soltura)
- 25m 67% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 35,
};

export const RUN_AEROBIC_STRIDES_6X_45M: RunningAerobicWorkoutItem = {
  name: "Rodaje Aeróbico Z2 con 6 Progresivos Cortos (45m + 6 Strides)",
  powerTarget: "74% Pace + Strides @ 95% CP",
  justification: "Consistencia aeróbica básica rematada con progresivos de 100m para mantener reactividad neural en las piernas.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main
- 25m 74% Pace

Strides Progresivos
6x
- 15s 95% Pace
- 45s 55% Pace

Cooldown
- 4m 55% Pace`,
  durationMin: 45,
};

export const RUN_AEROBIC_ESTABLE_FONDO_Z2_50M: RunningAerobicWorkoutItem = {
  name: "Carrera Continua Estable Z2 Puro de Volumen (50m)",
  powerTarget: "74-78% Pace",
  justification: "Sólido bloque aeróbico continuo para afianzar el kilometraje semanal sin generar estrés metabólico alto.",
  workoutDoc: `Warmup
- 10m 65% Pace

Main (Volumen Estable)
- 35m 76% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 50,
};

export const RUN_AEROBIC_NEUROMUSCULAR_CHISPA_35M: RunningAerobicWorkoutItem = {
  name: "Trote Regenerativo de Soltura & Acentos Neuromusculares (35m)",
  powerTarget: "65-70% Pace",
  justification: "Sesión corta y revitalizante diseñada para días previos a sesiones de alta intensidad o descargas de fin de semana.",
  workoutDoc: `Warmup
- 8m 62% Pace

Main
- 22m 68% Pace

Cooldown
- 5m 55% Pace`,
  durationMin: 35,
};

export const ALL_RUNNING_AEROBIC_WORKOUTS: RunningAerobicWorkoutItem[] = [
  RUN_AEROBIC_Z1_REGENERATIVO_PURO_35M,
  RUN_AEROBIC_Z2_CAPILARIZACION_45M,
  RUN_AEROBIC_Z1_Z2_PROGRESIVO_40M,
  RUN_AEROBIC_CADENCIA_180SPM_45M,
  RUN_AEROBIC_DESCARGA_FASCIAL_30M,
  RUN_AEROBIC_SUPERFICIE_BLANDA_45M,
  RUN_AEROBIC_ONDULADO_SUAVE_40M,
  RUN_AEROBIC_CORE_INTEGRADO_45M,
  RUN_AEROBIC_POST_CICLISMO_35M,
  RUN_AEROBIC_STRIDES_6X_45M,
  RUN_AEROBIC_ESTABLE_FONDO_Z2_50M,
  RUN_AEROBIC_NEUROMUSCULAR_CHISPA_35M,
];
