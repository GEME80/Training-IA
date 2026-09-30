export interface SwimWorkoutDefinition {
  name: string;
  focus: string;
  durationMin: number;
  tss: number;
  justification: string;
  workoutDoc: string;
}

export const BASE_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Natación Técnica & Sensibilidad Acuática (45m)",
    focus: "Técnica de Agarre, Rolido y Apoyo",
    durationMin: 45,
    tss: 36,
    justification: "Mejora de la hidrodinámica, alineación corporal y reducción de la resistencia al avance.",
    workoutDoc: `Warmup
- 300m 60% Pace

Técnica (Drills)
6x
- 50m Drill
- 15s recovery
- 50m 65% Pace
- 15s recovery

Main
4x
- 100m 75% Pace
- 20s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Aeróbica de Resistencia Base & Pull Buoy (50m)",
    focus: "Capacidad Aeróbica Continua y Posición Alta",
    durationMin: 50,
    tss: 39,
    justification: "Fortalecimiento de la musculatura dorsal y mantenimiento de cadera alta con fatiga mínima.",
    workoutDoc: `Warmup
- 250m 60% Pace

Main
4x
- 200m 75% Pace
- 20s recovery
4x
- 50m 85% Pace
- 15s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Progresiva con Cambios de Cadencia (45m)",
    focus: "Control de Frecuencia de Brazada y Eficiencia",
    durationMin: 45,
    tss: 38,
    justification: "Adaptación del ritmo de brazada a diferentes velocidades de nado.",
    workoutDoc: `Warmup
- 200m 60% Pace
4x
- 50m 65% Pace
- 15s recovery

Main
3x
- 100m 65% Pace
- 15s recovery
- 100m 75% Pace
- 15s recovery
- 100m 85% Pace
- 20s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación de Capacidad Mitocondrial Continua (50m)",
    focus: "Volumen Mitocondrial Continuo con Palas Medianas",
    durationMin: 50,
    tss: 40,
    justification: "Desarrollo de densidad mitocondrial en dorsal ancho y pectoral.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main
- 800m 75% Pace
- 2m recovery
2x
- 300m 75% Pace
- 25s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación Piramidal Aeróbica (50m)",
    focus: "Control de Respiración Bilateral y Dosificación",
    durationMin: 50,
    tss: 39,
    justification: "Regulación del esfuerzo en bloques fraccionados de distancia variable.",
    workoutDoc: `Warmup
- 200m 60% Pace

Main (Pirámide Z2)
- 50m 75% Pace
- 20s recovery
- 100m 75% Pace
- 20s recovery
- 150m 75% Pace
- 20s recovery
- 200m 75% Pace
- 20s recovery
- 200m 75% Pace
- 20s recovery
- 150m 75% Pace
- 20s recovery
- 100m 75% Pace
- 20s recovery
- 50m 75% Pace
- 20s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación Fuerza Propulsiva & Propiocepción con Aletas (45m)",
    focus: "Impulsión desde la Cadera y Elasticidad de Tobillos",
    durationMin: 45,
    tss: 37,
    justification: "Mejora de la patada de apoyo y alineación hidrodinámica.",
    workoutDoc: `Warmup
- 250m 60% Pace

Técnica con Aletas
6x
- 100m Drill
- 20s recovery

Main
4x
- 100m 75% Pace
- 20s recovery

Cooldown
- 150m 50% Pace`,
  },
];

export const BUILD_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Natación Series de Umbral CSS & Resistencia Específica (50m)",
    focus: "Critical Swim Speed (CSS) y Tolerancia al Ritmo de Competición",
    durationMin: 50,
    tss: 44,
    justification: "Eleva el umbral de lactato en agua y automatiza el ritmo objetivo de competición.",
    workoutDoc: `Warmup
- 300m 60% Pace

Activación
4x
- 50m 90% Pace
- 15s recovery

Main (Bloque CSS)
6x
- 100m 100% Pace
- 15s recovery

Recuperación Activa
- 200m 65% Pace

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Fuerza Específica con Palas y Pull Buoy (50m)",
    focus: "Fuerza Propulsiva y Tracción Dorsal",
    durationMin: 50,
    tss: 45,
    justification: "Desarrollo de potencia propulsiva en la fase de tracción y empuje acuático.",
    workoutDoc: `Warmup
- 300m 60% Pace

Fuerza Propulsiva
4x
- 150m 85% Pace
- 25s recovery
- 50m 70% Pace
- 15s recovery

Main
2x
- 100m 75% Pace
- 20s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Simulación de Ritmo Competitivo & Salidas Rápidas (50m)",
    focus: "Gestión de Salida, Olas y Ritmo Crucero",
    durationMin: 50,
    tss: 43,
    justification: "Simula el estrés inicial de natación en triatlón y la transición a ritmo de crucero estable.",
    workoutDoc: `Warmup
- 250m 60% Pace

Main (Simulación)
3x
- 50m 105% Pace
- 15s recovery
- 200m 85% Pace
- 30s recovery

Recuperación Activa
- 200m 60% Pace

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación Broken Sets Umbral CSS (50m)",
    focus: "Tolerancia al Lactato en Bloques Fraccionados",
    durationMin: 50,
    tss: 45,
    justification: "Sostenibilidad de velocidad crítica con micro-descansos.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main (Broken Sets)
3x
- 4x 50m 102% Pace
- 10s recovery
- 100m 60% Pace
- 45s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación Potencia Aeróbica VO2 & Aclaramiento (45m)",
    focus: "Consumo Máximo de Oxígeno y Remate Acuático",
    durationMin: 45,
    tss: 44,
    justification: "Estímulo de alta intensidad y capacidad de mantener técnica en acidosis.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main VO2max
8x
- 50m 108% Pace
- 30s recovery

Bloque Aeróbico
- 300m 75% Pace
- 1m recovery

Velocidad
4x
- 25m 115% Pace
- 30s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Aguas Abiertas en Piscina & Control de Boyas (50m)",
    focus: "Nado sin Apoyo en Pared y Avistamiento Frontal",
    durationMin: 50,
    tss: 42,
    justification: "Navegación visual eficiente sin perder hidrodinámica.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main (Aguas Abiertas)
4x
- 250m 85% Pace
- 30s recovery

Cooldown
- 200m 50% Pace`,
  },
];
