/**
 * Catálogo Científico y Progresivo de Entrenamientos de Fuerza Funcional (Brad Schoenfeld / Peter Attia).
 * Periodizado por fases: Base (Estructural) ➔ Build (Potencia & Reactividad) ➔ Peak (Mantenimiento) ➔ Taper (Movilidad).
 */

export interface StrengthWorkoutDefinition {
  name: string;
  focus: string;
  durationMin: number;
  tss: number;
  justification: string;
  workoutDoc: string;
}

export const STRENGTH_WORKOUT_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "Fuerza Estructural & Estabilidad de Cadera y Glúteo (35m)",
      focus: "Glúteo Medio, Cuádriceps y Estabilidad Lumbo-Pélvica",
      durationMin: 35,
      tss: 25,
      justification: "Corrige desequilibrios biomecánicos y refuerza las articulaciones de cadera y rodilla.",
      workoutDoc: `Calentamiento & Movilidad
- 5m Movilidad Dinámica de Tobillo y Cadera

Circuito Estructural (3 Rondas c/1m desc)
- 10x Sentadillas Búlgaras por pierna (control excéntrico)
- 15x Puentes de Glúteo Unipodales
- 30s Plancha Frontal con toque de hombros
- 12x Elevaciones de Talón en escalón (Sóleo y Gemelo)

Enfriamiento
- 5m Estiramiento Activo y Foam Roller`,
    },
    {
      name: "Fuerza y Estabilidad Escapular / Core para Triatletas (30m)",
      focus: "Hombro, Manguito Rotador y Core Anti-Rotación",
      durationMin: 30,
      tss: 22,
      justification: "Protección articular para el recobro en natación y postura aero en ciclismo.",
      workoutDoc: `Calentamiento
- 5m Dislocaciones con goma y círculos de hombros

Bloque Escapular y Core (3 Rondas)
- 12x Face-Pulls con elástico
- 10x 'Y-T-W' tumbado prono en colchoneta
- 30s Plancha Lateral por lado
- 12x Pallof Press con elástico (Core anti-rotación)

Enfriamiento
- 5m Movilidad Torácica`,
    },
  ],

  BUILD: [
    {
      name: "Potencia Reactiva, Pliometría & Elasticidad de Tobillos (30m)",
      focus: "Sóleo, Tendón de Aquiles y Stiffness Neuromuscular",
      durationMin: 30,
      tss: 26,
      justification: "Aumenta la reactividad del pie y el retorno elástico en cada zancada y pedaleo.",
      workoutDoc: `Calentamiento
- 5m Activación de sóleo y movilidad de tobillos

Circuito de Reactividad (3 Rondas)
- 30s Saltos a la comba rápidos y elásticos (pogo jumps)
- 8x Saltos al escalón con recepción controlada
- 12x Elevaciones rápidas de gemelo con pausa isométrica arriba
- 10x Zancadas explosivas alternadas

Enfriamiento
- 5m Soltura y Descarga Miofascial`,
    },
    {
      name: "Fuerza Funcional & Cadena Posterior (35m)",
      focus: "Isquiosurales, Glúteo Mayor y Zona Lumbar",
      durationMin: 35,
      tss: 28,
      justification: "Fortalece la cadena de propulsión posterior para evitar calambres y fatiga en carrera y bici.",
      workoutDoc: `Calentamiento
- 5m Movilidad Isquiosural y Cat-Cow

Bloque Principal (3 Rondas)
- 10x Peso Muerto Rumano Unilateral
- 12x Hip Thrust con pausa de 2s en contracción
- 10x Remo Invertido o Remo con banda elástica
- 30s Hollow Body Hold (Tensión de core continuo)

Enfriamiento
- 5m Estiramiento Suave de Psoas e Isquios`,
    },
  ],

  PEAK: [
    {
      name: "Fuerza de Mantenimiento Rápida & Tono Muscular (25m)",
      focus: "Tono Neuromuscular sin Fatiga Estructural",
      durationMin: 25,
      tss: 18,
      justification: "Preserva los niveles de fuerza sin interferir con los fondos clave ni generar agujetas.",
      workoutDoc: `Calentamiento
- 5m Movilidad articular global

Circuito Ligero de Tono (2 Rondas)
- 8x Sentadillas al cajón con peso corporal
- 10x Flexiones escapulares controladas
- 20s Plancha frontal isométrica
- 10x Elevación de gemelos con propio peso

Enfriamiento
- 5m Estiramiento Suave`,
    },
    {
      name: "Fuerza Funcional Ligera & Estabilidad Dinámica (25m)",
      focus: "Estabilidad de Cadera y Coordinación sin Carga",
      durationMin: 25,
      tss: 18,
      justification: "Ajuste fino de estabilidad unipodal protegiendo la zona lumbar.",
      workoutDoc: `Calentamiento
- 5m Movilidad dinámica

Circuito Ligero (2 Rondas)
- 8x Peso muerto a una pierna sin peso
- 10x Bird-Dog cruzado con control de core
- 20s Plancha lateral dinámica
- 10x Monster walks con elástico

Enfriamiento
- 5m Estiramiento y Respiración`,
    },
  ],

  TAPER: [
    {
      name: "Movilidad Articular & Descarga Miofascial (20m)",
      focus: "Liberación Miofascial y Flexibilidad Dinámica",
      durationMin: 20,
      tss: 10,
      justification: "Descomprime articulaciones y maximiza la frescura muscular previa al evento.",
      workoutDoc: `Calentamiento
- 5m Respiración diafragmática y rotaciones suaves

Bloque de Descarga
- 10m Masaje con Foam Roller en cuádriceps, glúteos y gemelos
- 5m Movilidad de cadera (90/90) y apertura torácica`,
    },
    {
      name: "Activación Neuromuscular & Movilidad Dinámica (20m)",
      focus: "Despertar Articular y Postural",
      durationMin: 20,
      tss: 10,
      justification: "Mantiene la alineación biomecánica reduciendo tensiones residuales.",
      workoutDoc: `Bloque de Movilidad y Tono Ligero
- 5m Cat-Cow y movilidad de tobillos
- 5m Activación de glúteo con banda elástica
- 10m Estiramientos activos globales`,
    },
  ],
};

/**
 * Selecciona una sesión de fuerza rotativa según la fase y la semana del macrociclo.
 */
export function selectStrengthWorkout(
  phase: string,
  weekNumber: number,
  isRecovery: boolean,
  sessionIndex: number = 0
): StrengthWorkoutDefinition {
  const globalIdx = Math.max(0, (weekNumber - 1) + Math.max(0, sessionIndex - 1));

  if (phase === "TAPER" || phase === "RACE_WEEK" || isRecovery) {
    const list = STRENGTH_WORKOUT_POOL.TAPER;
    return list[globalIdx % list.length] || list[0];
  }

  if (phase === "PEAK") {
    const list = STRENGTH_WORKOUT_POOL.PEAK;
    return list[globalIdx % list.length] || list[0];
  }

  if (phase === "BUILD") {
    const list = STRENGTH_WORKOUT_POOL.BUILD;
    return list[globalIdx % list.length] || list[0];
  }

  // BASE
  const list = STRENGTH_WORKOUT_POOL.BASE;
  return list[globalIdx % list.length] || list[0];
}
