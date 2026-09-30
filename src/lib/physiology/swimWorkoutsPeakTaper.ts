import { SwimWorkoutDefinition } from "./swimWorkoutsBaseBuild";

export const PEAK_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Simulación de Gran Travesía a Ritmo de Carrera (55m)",
    focus: "Ensayo General de Nado Continuo y Navegación",
    durationMin: 55,
    tss: 48,
    justification: "Consolidación del ritmo específico con técnica de avistamiento.",
    workoutDoc: `Warmup
- 200m 60% Pace
4x
- 50m 75% Pace
- 15s recovery

Main (Travesía)
- 1000m 85% Pace
- 2m recovery
4x
- 150m 88% Pace
- 20s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación de Afinamiento & Chispa Neuromuscular (40m)",
    focus: "Sensibilidad de Agua y Velocidad Reactiva sin Fatiga",
    durationMin: 40,
    tss: 34,
    justification: "Mantiene la velocidad punta y la sensación hidrodinámica reduciendo el estrés metabólico.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main (Cambios de Ritmo)
6x
- 25m 115% Pace
- 75m 55% Pace
- 35s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Simulación Específica de Boyas & Cambios de Ritmo (45m)",
    focus: "Giros de Boya con Aceleración y Retorno a Ritmo Crucero",
    durationMin: 45,
    tss: 41,
    justification: "Adaptación biomecánica a los giros de boya en aguas abiertas.",
    workoutDoc: `Warmup
- 250m 60% Pace

Main (Boyas)
5x
- 150m 88% Pace
- 20s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Broken Race Simulation (45m)",
    focus: "Simulación de la Dinámica Completa de Salida y Crucero",
    durationMin: 45,
    tss: 42,
    justification: "Simulación del ritmo de salida fuerte, crucero estable y aceleración previa a T1.",
    workoutDoc: `Warmup
- 250m 60% Pace

Main (Race Sim)
2x
- 100m 95% Pace
- 15s recovery
- 200m 85% Pace
- 20s recovery
- 100m 90% Pace
- 1m recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación de Eficiencia Hidrodinámica & SWOLF (45m)",
    focus: "Conteo de Brazadas y Economía Propulsiva",
    durationMin: 45,
    tss: 38,
    justification: "Conteo de brazadas y economía propulsiva a ritmo de carrera.",
    workoutDoc: `Warmup
- 300m 60% Pace

Main (SWOLF)
4x
- 200m 85% Pace
- 25s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación Reactiva Pre-Competición & Salidas T1 (40m)",
    focus: "Toque de Velocidad y Reactividad Previa al Evento",
    durationMin: 40,
    tss: 33,
    justification: "Toque de reactividad neuromuscular a pocos días del evento.",
    workoutDoc: `Warmup
- 300m 60% Pace

Activación
4x
- 50m 88% Pace
- 15s recovery
4x
- 25m 110% Pace
- 40s recovery

Cooldown
- 200m 50% Pace`,
  },
];

export const TAPER_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Natación de Descarga & Sensibilidad Acuática (35m)",
    focus: "Sensaciones Frescas y Soltura Pre-Competición",
    durationMin: 35,
    tss: 26,
    justification: "Conserva el 'tacto' del agua sin gastar glucógeno.",
    workoutDoc: `Warmup
- 250m 60% Pace

Activación
4x
- 50m 85% Pace
- 20s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación de Chispa Corta & Toques Pre-Carrera (30m)",
    focus: "Velocidad Pura con Recuperación Completa",
    durationMin: 30,
    tss: 22,
    justification: "Reactividad neuromuscular con cero fatiga metabólica.",
    workoutDoc: `Warmup
- 200m 60% Pace

Toques de Velocidad
4x
- 25m 95% Pace
- 30s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación de Conexión Hidrodinámica & Sensaciones (35m)",
    focus: "Flotabilidad, Crol y Espalda Relajada",
    durationMin: 35,
    tss: 24,
    justification: "Lavado muscular y soltura de cintura escapular.",
    workoutDoc: `Warmup
- 200m 60% Pace

Sensaciones
3x
- 100m 65% Pace
- 20s recovery
4x
- 25m 80% Pace
- 30s recovery

Cooldown
- 100m 50% Pace`,
  },
  {
    name: "Natación de Afinamiento y Soltura de Hombros (30m)",
    focus: "Alineación y Brazada Ligera",
    durationMin: 30,
    tss: 20,
    justification: "Mantenimiento del tono postural de hombros sin esfuerzo.",
    workoutDoc: `Warmup
- 200m 60% Pace

Soltura
3x
- 50m 70% Pace
- 30s recovery

Cooldown
- 150m 50% Pace`,
  },
  {
    name: "Natación Shakeout Pre-Carrera (25m)",
    focus: "Activación Suave de Agua el Día Previo",
    durationMin: 25,
    tss: 16,
    justification: "Sensación de agua en lago o piscina sin fatiga.",
    workoutDoc: `Warmup
- 400m 60% Pace

Chispa
4x
- 25m 85% Pace
- 30s recovery

Cooldown
- 100m 50% Pace`,
  },
];

export const RECOVERY_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Natación Regenerativa & Descarga Articular (35m)",
    focus: "Recuperación Activa y Soltura Miofascial",
    durationMin: 35,
    tss: 22,
    justification: "Elimina la pesadez muscular de las piernas tras fondos de bici y carrera.",
    workoutDoc: `Warmup
- 200m 55% Pace
- 100m 55% Pace

Main
4x
- 50m 60% Pace
- 15s recovery

Cooldown
- 100m 50% Pace`,
  },
  {
    name: "Natación Aeróbica Suave & Respiración Bilateral (35m)",
    focus: "Relajación Torácica y Flotabilidad",
    durationMin: 35,
    tss: 23,
    justification: "Apertura de la caja torácica y lavado de lactato con apoyo hidrodinámico.",
    workoutDoc: `Warmup
- 200m 55% Pace

Main
4x
- 100m 60% Pace
- 20s recovery
4x
- 50m 65% Pace
- 15s recovery

Cooldown
- 100m 50% Pace`,
  },
  {
    name: "Natación Regenerativa con Aletas Suaves (35m)",
    focus: "Descarga de Tren Inferior y Propulsión Ligera",
    durationMin: 35,
    tss: 22,
    justification: "Facilita la circulación linfática con mínimo esfuerzo muscular.",
    workoutDoc: `Warmup
- 300m 55% Pace

Main
4x
- 50m 60% Pace
- 20s recovery

Cooldown
- 200m 50% Pace`,
  },
  {
    name: "Natación de Descompresión Espinal y Flotabilidad (30m)",
    focus: "Alivio de Presión Lumbar y Estiramiento Activo",
    durationMin: 30,
    tss: 18,
    justification: "Descompresión vertebral en ingravidez para triatletas.",
    workoutDoc: `Warmup
- 200m 55% Pace

Main
3x
- 100m 60% Pace
- 30s recovery

Cooldown
- 100m 50% Pace`,
  },
];
