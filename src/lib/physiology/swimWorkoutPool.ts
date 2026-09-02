/**
 * Catálogo Científico y Progresivo de Entrenamientos de Natación (Joe Friel / Jan Olbrecht).
 * Elimina la clonación repetitiva mediante rotación estructurada según fase y microciclo.
 */

export interface SwimWorkoutDefinition {
  name: string;
  focus: string;
  durationMin: number;
  tss: number;
  justification: string;
  workoutDoc: string;
}

export const SWIM_WORKOUT_POOL: Record<string, SwimWorkoutDefinition[]> = {
  BASE: [
    {
      name: "Natación Técnica & Sensibilidad Acuática (45m)",
      focus: "Técnica de Agarre, Rolido y Apoyo",
      durationMin: 45,
      tss: 36,
      justification: "Mejora de la hidrodinámica, alineación corporal y reducción de la resistencia al avance.",
      workoutDoc: `Calentamiento
- 300m Nado Suave Variado (Crol y Espalda)

Bloque de Técnica (Punto Muerto y Apoyos)
6x
- 50m Ejercicio de Técnica (Punto muerto / Crol 1 brazo) con 15s desc
- 50m Nado Continuo aplicando la sensación de apoyo

Parte Principal
- 4x 100m Nado Aeróbico Cómodo Z2 con 20s desc

Enfriamiento
- 150m Nado Suave Regenerativo y Soltura`,
    },
    {
      name: "Natación Aeróbica de Resistencia Base & Pull Buoy (45m)",
      focus: "Capacidad Aeróbica Continua y Posición Alta",
      durationMin: 45,
      tss: 38,
      justification: "Fortalecimiento de la musculatura dorsal y mantenimiento de cadera alta con fatiga mínima.",
      workoutDoc: `Calentamiento
- 250m Nado Cómodo Progresivo

Bloque de Resistencia Continua
- 4x 200m Ritmo Aeróbico Z2 (Pull Buoy) con 20s desc
- 4x 50m Progresivos 1 a 4 con 15s desc

Enfriamiento
- 150m Nado Suave de Espalda / Braza para soltar hombros`,
    },
    {
      name: "Natación Progresiva con Cambios de Cadencia (45m)",
      focus: "Control de Frecuencia de Brazada y Eficiencia",
      durationMin: 45,
      tss: 37,
      justification: "Adaptación del ritmo de brazada a diferentes velocidades de nado.",
      workoutDoc: `Calentamiento
- 200m Nado Suave + 4x 50m Estilos Variados

Bloque Progresivo
3x
- 100m Ritmo Suave Z1 c/15s desc
- 100m Ritmo Medio Z2 c/15s desc
- 100m Ritmo Firme Z3 c/20s desc

Enfriamiento
- 200m Nado Relajado y Respiración Bilateral`,
    },
  ],

  BUILD: [
    {
      name: "Natación Series de Umbral CSS & Resistencia Específica (45m)",
      focus: "Critical Swim Speed (CSS) y Tolerancia al Ritmo de Carrera",
      durationMin: 45,
      tss: 42,
      justification: "Eleva el umbral de lactato en agua y automatiza el ritmo objetivo de competición 70.3.",
      workoutDoc: `Calentamiento
- 300m Nado Suave Progresivo

Activación con Aceleraciones
4x
- 50m (25m Rápido @ Ritmo 70.3 + 25m Suave) c/15s desc

Bloque Principal de Umbral CSS
- 6x 100m @ Ritmo CSS (Ritmo Umbral) con 15s desc
- 200m Nado Fácil con Pull Buoy

Enfriamiento
- 150m Nado Suave Regenerativo`,
    },
    {
      name: "Natación Fuerza Específica con Palas y Pull Buoy (50m)",
      focus: "Fuerza Propulsiva y Tracción Dorsal",
      durationMin: 50,
      tss: 44,
      justification: "Desarrollo de potencia propulsiva en la fase de tracción y empuje acuático.",
      workoutDoc: `Calentamiento
- 300m Nado Suave

Bloque de Fuerza Propulsiva (Palas Medianas + Pull)
4x
- 150m Nado Firme con Palas y Pull Buoy (Enfoque en agarre profundo) c/25s desc
- 50m Nado sin material muy suelto y elástico c/15s desc

Enfriamiento
- 200m Nado Regenerativo`,
    },
    {
      name: "Simulación de Ritmo Competitivo & Salidas Rápidas (45m)",
      focus: "Gestión de Salida, Olas y Ritmo Crucero 70.3",
      durationMin: 45,
      tss: 41,
      justification: "Simula el estrés inicial de natación en triatlón y la transición a ritmo de crucero estable.",
      workoutDoc: `Calentamiento
- 250m Nado Variado

Simulación 70.3 (Salida Rápida + Crucero)
3x
- 50m Salida Fuerte @ 95% esfuerzo (sin descanso)
- 200m Ritmo Crucero Estable @ 80% esfuerzo (descanso 30s)

Enfriamiento
- 200m Nado Relajado con recobro subacuático`,
    },
  ],

  PEAK: [
    {
      name: "Simulación de Natación 70.3 / Aguas Abiertas (50m)",
      focus: "Ensayo General de 1.900m y Navegación Visual",
      durationMin: 50,
      tss: 45,
      justification: "Consolidación del ritmo específico de 1.9 km con técnica de avistamiento.",
      workoutDoc: `Calentamiento
- 200m Nado Suave + 4x 50m con 3 miradas al frente (Avistamiento de boya)

Bloque Cumbre de Competición
- 1x 800m Continuo @ Ritmo Objetivo de Carrera 70.3
- 2m Descanso e Hidratación
- 4x 150m @ Ritmo 70.3 + 2s/100m con 20s desc

Enfriamiento
- 200m Nado Regenerativo Suave`,
    },
    {
      name: "Natación de Afinamiento & Chispa Neuromuscular (40m)",
      focus: "Sensibilidad de Agua y Velocidad Reactiva sin Fatiga",
      durationMin: 40,
      tss: 34,
      justification: "Mantiene la velocidad punta y la sensación hidrodinámica reduciendo el estrés metabólico.",
      workoutDoc: `Calentamiento
- 300m Nado Suave y Progresivo

Cambios de Ritmo Cortos
6x
- 25m All-Out Sprint con técnica perfecta
- 75m Nado Muy Suave Regenerativo c/30s desc

Enfriamiento
- 200m Nado Fácil y Estiramiento Suave en agua`,
    },
    {
      name: "Simulación Específica de Boyas & Ritmo Crucero (45m)",
      focus: "Cambios de Dirección y Ritmo de Crucero Continuo",
      durationMin: 45,
      tss: 40,
      justification: "Adaptación biomecánica a los giros de boya en aguas abiertas.",
      workoutDoc: `Calentamiento
- 250m Nado Progresivo

Bloque de Boyas
5x
- 150m Ritmo 70.3 con aceleración de 15m al inicio de cada 50m c/20s desc

Enfriamiento
- 150m Nado Suave`,
    },
  ],

  TAPER: [
    {
      name: "Natación de Descarga & Sensibilidad Acuática (35m)",
      focus: "Sensaciones Frescas y Soltura Pre-Competición",
      durationMin: 35,
      tss: 26,
      justification: "Conserva el 'tacto' del agua sin gastar energía.",
      workoutDoc: `Calentamiento
- 250m Nado Cómodo y Relajado

Activación Suave
4x
- 50m (15m Rápido + 35m Muy Suave) c/20s desc

Enfriamiento
- 150m Nado Regenerativo`,
    },
    {
      name: "Natación de Chispa Corta & Toques Pre-Carrera (30m)",
      focus: "Velocidad Pura con Recuperación Completa",
      durationMin: 30,
      tss: 22,
      justification: "Reactividad neuromuscular con cero fatiga metabólica.",
      workoutDoc: `Calentamiento
- 200m Nado Suave y Progresivo

Toques de Velocidad
4x
- 25m Ritmo Objetivo 70.3 con salida ágil c/30s desc

Enfriamiento
- 150m Soltura Total y Respiración Relajada`,
    },
  ],

  RECOVERY: [
    {
      name: "Natación Regenerativa & Descarga Articular (35m)",
      focus: "Recuperación Activa y Soltura Miofascial",
      durationMin: 35,
      tss: 24,
      justification: "Elimina la pesadez muscular de las piernas tras fondos de bici y carrera.",
      workoutDoc: `Nado Suave Continuo y Variado
- 200m Crol suave
- 100m Espalda suave
- 4x 50m Pull Buoy muy cómodo c/15s desc
- 100m Soltura total y respiraciones profundas`,
    },
    {
      name: "Natación Aeróbica Suave & Técnica de Respiración (35m)",
      focus: "Relajación Torácica y Flotabilidad",
      durationMin: 35,
      tss: 23,
      justification: "Apertura de la caja torácica y lavado de lactato con apoyo hidrodinámico.",
      workoutDoc: `Calentamiento
- 200m Nado Lento y Controlado

Bloque de Respiración y Soltura
- 4x 100m Suave alternando crol y espalda c/20s desc
- 4x 50m Nado con aletas suaves c/15s desc

Enfriamiento
- 100m Nado Relajado`,
    },
  ],
};

/**
 * Selecciona una sesión de natación rotativa sin repeticiones consecutivas.
 */
export function selectSwimWorkout(
  phase: string,
  weekNumber: number,
  isRecovery: boolean,
  sessionIndex: number = 0
): SwimWorkoutDefinition {
  const globalIdx = Math.max(0, (weekNumber - 1) * 2 + Math.max(0, sessionIndex - 1));

  if (isRecovery) {
    const list = SWIM_WORKOUT_POOL.RECOVERY;
    return list[globalIdx % list.length] || list[0];
  }

  if (phase === "TAPER" || phase === "RACE_WEEK") {
    const list = SWIM_WORKOUT_POOL.TAPER;
    return list[globalIdx % list.length] || list[0];
  }

  if (phase === "PEAK") {
    const list = SWIM_WORKOUT_POOL.PEAK;
    return list[globalIdx % list.length] || list[0];
  }

  if (phase === "BUILD") {
    const list = SWIM_WORKOUT_POOL.BUILD;
    return list[globalIdx % list.length] || list[0];
  }

  // BASE
  const list = SWIM_WORKOUT_POOL.BASE;
  return list[globalIdx % list.length] || list[0];
}
