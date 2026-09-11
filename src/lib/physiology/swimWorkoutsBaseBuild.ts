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
    workoutDoc: "Calentamiento\n- 300m Nado Suave Variado\n\nTécnica (6x)\n- 50m Ejercicio Técnica (Punto muerto / 1 brazo) c/15s\n- 50m Nado Continuo aplicando apoyo\n\nParte Principal\n- 4x 100m Nado Aeróbico Z2 c/20s\n\nEnfriamiento\n- 150m Nado Suave Regenerativo",
  },
  {
    name: "Natación Aeróbica de Resistencia Base & Pull Buoy (50m)",
    focus: "Capacidad Aeróbica Continua y Posición Alta",
    durationMin: 50,
    tss: 39,
    justification: "Fortalecimiento de la musculatura dorsal y mantenimiento de cadera alta con fatiga mínima.",
    workoutDoc: "Calentamiento\n- 250m Progresivo\n\nResistencia Continua\n- 4x 200m Z2 con Pull Buoy c/20s\n- 4x 50m Progresivos 1 a 4 c/15s\n\nEnfriamiento\n- 150m Espalda suave",
  },
  {
    name: "Natación Progresiva con Cambios de Cadencia (45m)",
    focus: "Control de Frecuencia de Brazada y Eficiencia",
    durationMin: 45,
    tss: 38,
    justification: "Adaptación del ritmo de brazada a diferentes velocidades de nado.",
    workoutDoc: "Calentamiento\n- 200m Suave + 4x 50m Estilos\n\nBloque Progresivo (3x)\n- 100m Z1 c/15s\n- 100m Z2 c/15s\n- 100m Z3 c/20s\n\nEnfriamiento\n- 200m Nado Relajado",
  },
  {
    name: "Natación de Capacidad Mitocondrial Continua (50m)",
    focus: "Volumen Mitocondrial Continuo con Palas Medianas",
    durationMin: 50,
    tss: 40,
    justification: "Desarrollo de densidad mitocondrial en dorsal ancho y pectoral.",
    workoutDoc: "Calentamiento\n- 300m Suave\n\nBloque Mitocondrial\n- 1x 800m Z2 continuo con Pull y Palas c/2m desc\n- 2x 300m Z2 crol sin material c/25s\n\nEnfriamiento\n- 200m Regenerativo",
  },
  {
    name: "Natación Piramidal Aeróbica (50m)",
    focus: "Control de Respiración Bilateral y Dosificación",
    durationMin: 50,
    tss: 39,
    justification: "Regulación del esfuerzo en bloques fraccionados de distancia variable.",
    workoutDoc: "Calentamiento\n- 200m Suave\n\nPirámide Aeróbica Z2\n- 50m - 100m - 150m - 200m - 200m - 150m - 100m - 50m c/20s desc\n\nEnfriamiento\n- 200m Nado Suave",
  },
  {
    name: "Natación Fuerza Propulsiva & Propiocepción con Aletas (45m)",
    focus: "Impulsión desde la Cadera y Elasticidad de Tobillos",
    durationMin: 45,
    tss: 37,
    justification: "Mejora de la patada de apoyo y alineación hidrodinámica.",
    workoutDoc: "Calentamiento\n- 250m Suave\n\nPropiocepción con Aletas (6x)\n- 100m (50m Batido lateral + 50m Crol fluido) c/20s\n- 4x 100m Z2 sin material c/20s\n\nEnfriamiento\n- 150m Soltura",
  },
];

export const BUILD_SWIM_WORKOUTS: SwimWorkoutDefinition[] = [
  {
    name: "Natación Series de Umbral CSS & Resistencia Específica (50m)",
    focus: "Critical Swim Speed (CSS) y Tolerancia al Ritmo de Competición",
    durationMin: 50,
    tss: 44,
    justification: "Eleva el umbral de lactato en agua y automatiza el ritmo objetivo de competición.",
    workoutDoc: "Calentamiento\n- 300m Suave\n\nActivación (4x)\n- 50m (25m Ritmo Carrera + 25m Suave) c/15s\n\nBloque CSS\n- 6x 100m @ Ritmo CSS c/15s\n- 200m Pull Buoy Z1\n\nEnfriamiento\n- 150m Suave",
  },
  {
    name: "Natación Fuerza Específica con Palas y Pull Buoy (50m)",
    focus: "Fuerza Propulsiva y Tracción Dorsal",
    durationMin: 50,
    tss: 45,
    justification: "Desarrollo de potencia propulsiva en la fase de tracción y empuje acuático.",
    workoutDoc: "Calentamiento\n- 300m Suave\n\nFuerza Propulsiva (4x)\n- 150m Firme con Palas y Pull c/25s\n- 50m Nado sin material elástico c/15s\n- 2x 100m Z2\n\nEnfriamiento\n- 200m Regenerativo",
  },
  {
    name: "Simulación de Ritmo Competitivo & Salidas Rápidas (50m)",
    focus: "Gestión de Salida, Olas y Ritmo Crucero",
    durationMin: 50,
    tss: 43,
    justification: "Simula el estrés inicial de natación en triatlón y la transición a ritmo de crucero estable.",
    workoutDoc: "Calentamiento\n- 250m Variado\n\nSimulación (3x)\n- 50m Salida Fuerte @ 95% esfuerzo\n- 200m Ritmo Crucero @ 80% c/30s\n- 200m Pull Buoy suave\n\nEnfriamiento\n- 200m Relajado",
  },
  {
    name: "Natación Broken Sets Umbral CSS (50m)",
    focus: "Tolerancia al Lactato en Bloques Fraccionados",
    durationMin: 50,
    tss: 45,
    justification: "Sostenibilidad de velocidad crítica con micro-descansos.",
    workoutDoc: "Calentamiento\n- 300m Suave\n\nBroken Sets (3x)\n- 4x 50m @ CSS -1s c/10s desc\n- 100m Enlace suave c/45s desc\n\nEnfriamiento\n- 200m Suave",
  },
  {
    name: "Natación Potencia Aeróbica VO2 & Aclaramiento (45m)",
    focus: "Consumo Máximo de Oxígeno y Remate Acuático",
    durationMin: 45,
    tss: 44,
    justification: "Estímulo de alta intensidad y capacidad de mantener técnica en acidosis.",
    workoutDoc: "Calentamiento\n- 300m Suave\n\nIntervalos VO2\n- 8x 50m @ 95% esfuerzo c/30s\n- 300m Z2 continuo con Pull Buoy\n- 4x 25m Sprint suave c/30s\n\nEnfriamiento\n- 150m Regenerativo",
  },
  {
    name: "Natación Aguas Abiertas en Piscina & Control de Boyas (50m)",
    focus: "Nado sin Apoyo en Pared y Avistamiento Frontal",
    durationMin: 50,
    tss: 42,
    justification: "Navegación visual eficiente sin perder hidrodinámica.",
    workoutDoc: "Calentamiento\n- 300m Suave con 2 avistamientos cada 50m\n\nBloque Boyas\n- 4x 250m Ritmo carrera sin tocar pared en giros c/30s\n\nEnfriamiento\n- 200m Espalda soltura",
  },
];
