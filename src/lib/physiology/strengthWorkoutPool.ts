/**
 * Catálogo Científico y Progresivo de Entrenamientos de Fuerza Funcional (Brad Schoenfeld / Peter Attia).
 * Periodizado por fases con rotación coprima anti-repetición.
 */

export interface StrengthWorkoutDefinition {
  name: string;
  focus: string;
  durationMin: number;
  tss: number;
  justification: string;
  workoutDoc: string;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function getCoprimeStride(length: number, preferred: number = 2): number {
  if (length <= 1) return 1;
  let s = preferred;
  while (gcd(s, length) !== 1) {
    s++;
  }
  return s;
}

export const STRENGTH_WORKOUT_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "Fuerza Estructural & Estabilidad de Cadera y Glúteo (35m)",
      focus: "Glúteo Medio, Cuádriceps y Estabilidad Lumbo-Pélvica",
      durationMin: 35,
      tss: 25,
      justification: "Corrige desequilibrios biomecánicos y refuerza las articulaciones de cadera y rodilla.",
      workoutDoc: "Movilidad (5m)\n- Movilidad de tobillo y cadera\n\nCircuito Estructural (3 Rondas)\n- 10x Sentadillas búlgaras por pierna\n- 15x Puentes de glúteo unipodales\n- 30s Plancha frontal con toques\n- 12x Elevaciones de talón en escalón (sóleo)\n\nEnfriamiento\n- 5m Estiramiento y foam roller",
    },
    {
      name: "Fuerza y Estabilidad Escapular / Core para Triatletas (30m)",
      focus: "Hombro, Manguito Rotador y Core Anti-Rotación",
      durationMin: 30,
      tss: 22,
      justification: "Protección articular para el recobro en natación y postura aero en ciclismo.",
      workoutDoc: "Movilidad (5m)\n- Dislocaciones con goma\n\nBloque Escapular & Core (3 Rondas)\n- 12x Face-pulls con elástico\n- 10x 'Y-T-W' prono\n- 30s Plancha lateral por lado\n- 12x Pallof press con elástico\n\nEnfriamiento\n- 5m Movilidad torácica",
    },
    {
      name: "Fuerza de Tobillo, Tendón de Aquiles & Sóleo (35m)",
      focus: "Sóleo, Gemelos y Stiffness Tendinoso",
      durationMin: 35,
      tss: 24,
      justification: "Aumenta la absorción elástica del pie y previene fascitis y tendinopatías.",
      workoutDoc: "Activación (5m)\n- Movilidad dinámica de tobillo\n\nBloque Principal (3 Rondas)\n- 15x Sóleo excéntrico rodilla flexionada\n- 10x Pogo hops elásticos sobre punta\n- 10x Peso muerto rumano unipodal sin carga\n- 30s Plancha con elevación de talones\n\nEnfriamiento\n- 5m Descarga miofascial",
    },
    {
      name: "Fuerza Anti-Rotacional de Core & Estabilidad Lumbo-Pélvica (30m)",
      focus: "Transverso, Oblicuos y Zona Lumbar",
      durationMin: 30,
      tss: 23,
      justification: "Estabilidad de tronco en la bicicleta y prevención de basculación pélvica.",
      workoutDoc: "Activación (5m)\n- Cat-cow y activación de transverso\n\nBloque Core (3 Rondas)\n- 10x Bird-dog resistido con minibanda\n- 12x Press Pallof dinámico\n- 25s Hollow body hold\n- 12x Monster walks con elástico\n\nEnfriamiento\n- 5m Estiramiento de psoas",
    },
    {
      name: "Cadena Posterior & Bisagra de Cadera Funcional (35m)",
      focus: "Isquiosurales, Glúteo Mayor y Erector Espinal",
      durationMin: 35,
      tss: 26,
      justification: "Fortalece la propulsión de pedaleo y la zancada de carrera.",
      workoutDoc: "Movilidad (5m)\n- Bisagra de cadera con pica\n\nBloque Propulsivo (3 Rondas)\n- 10x Peso muerto rumano unilateral\n- 12x Hip thrust con pausa de 2s arriba\n- 10x Remo con banda elástica cerrado\n- 30s Plancha prono isométrica\n\nEnfriamiento\n- 5m Foam roller en isquios",
    },
    {
      name: "Movilidad Torácica & Prevención del 'Swimmer Shoulder' (30m)",
      focus: "Manguito Rotador, Serrato y Columna Torácica",
      durationMin: 30,
      tss: 20,
      justification: "Prevención de pinzamiento subacromial en natación y postura aero cómoda.",
      workoutDoc: "Movilidad (5m)\n- Círculos articulares y apertura torácica\n\nCircuito Funcional (3 Rondas)\n- 12x Rotaciones externas con goma pegada al cuerpo\n- 10x Deslizamientos en pared para serrato anterior\n- 12x Aperturas de pecho con banda elástica\n- 30s Puente supino con apoyo escapular\n\nEnfriamiento\n- 5m Respiración diafragmática",
    },
  ],

  BUILD: [
    {
      name: "Potencia Reactiva, Pliometría & Elasticidad de Tobillos (30m)",
      focus: "Sóleo, Tendón de Aquiles y Stiffness Neuromuscular",
      durationMin: 30,
      tss: 26,
      justification: "Aumenta la reactividad del pie y el retorno elástico en cada zancada y pedaleo.",
      workoutDoc: "Calentamiento (5m)\n- Movilidad de tobillos y activación\n\nCircuito de Reactividad (3 Rondas)\n- 30s Pogo jumps elásticos con comba\n- 8x Saltos a escalón con recepción suave\n- 12x Elevaciones rápidas de gemelo con pausa arriba\n- 8x Zancadas reactivas alternadas\n\nEnfriamiento\n- 5m Descarga miofascial",
    },
    {
      name: "Fuerza Funcional & Cadena Posterior (35m)",
      focus: "Isquiosurales, Glúteo Mayor y Zona Lumbar",
      durationMin: 35,
      tss: 28,
      justification: "Fortalece la cadena de propulsión posterior para evitar calambres en carrera y bici.",
      workoutDoc: "Movilidad (5m)\n- Movilidad isquiosural\n\nBloque Principal (3 Rondas)\n- 10x Peso muerto rumano unilateral\n- 12x Hip thrust con pausa de 2s\n- 10x Remo con banda elástica\n- 30s Hollow body hold\n\nEnfriamiento\n- 5m Estiramiento de psoas e isquios",
    },
    {
      name: "Estabilidad de Core en Posición Aero de Fatiga (30m)",
      focus: "Soporte Isométrico y Resistencia Postural",
      durationMin: 30,
      tss: 24,
      justification: "Capacidad de sostener la posición aerodinámica durante horas en la bicicleta.",
      workoutDoc: "Movilidad (5m)\n- Movilidad de cadera\n\nCircuito Aero (3 Rondas)\n- 40s Plancha sobre antebrazos en postura acople aero\n- 10x Dead bug con banda elástica\n- 30s Paseo del granjero unilateral\n- 12x Puente de glúteo con talones elevados\n\nEnfriamiento\n- 5m Relajación lumbar",
    },
    {
      name: "Fuerza Unipodal Dinámica & Control de Rodilla (35m)",
      focus: "Vasto Medial, Glúteo Medio y Alineación de Pierna",
      durationMin: 35,
      tss: 27,
      justification: "Previene el valgo dinámico de rodilla y estabiliza la zancada en fatiga.",
      workoutDoc: "Calentamiento (5m)\n- Sentadillas dinámicas suaves\n\nBloque Unipodal (3 Rondas)\n- 8x Step-ups controlados a escalón por pierna\n- 10x Sentadillas split con peso corporal\n- 15x Elevaciones tibiales contra pared\n- 30s Plancha lateral con pierna en abducción\n\nEnfriamiento\n- 5m Estiramiento de cuádriceps",
    },
    {
      name: "Pliometría Bipodal/Unipodal & Retorno Elástico (30m)",
      focus: "Tiempo de Contacto Breve y Reactividad",
      durationMin: 30,
      tss: 26,
      justification: "Reduce el tiempo de contacto en suelo durante la carrera a pie.",
      workoutDoc: "Activación (5m)\n- Pogo hops suaves\n\nBloque Pliométrico (3 Rondas)\n- 10x Saltos laterales coordinados sobre línea\n- 6x Drop jumps con caída amortiguada\n- 8x Zancadas con salto suave alternadas\n- 20s Isometría de cuádriceps en pared\n\nEnfriamiento\n- 5m Movilidad articular",
    },
    {
      name: "Tracción Escapular & Potencia de Empuje Acuático (30m)",
      focus: "Dorsal Ancho, Pectoral y Serrato Anterior",
      durationMin: 30,
      tss: 25,
      justification: "Potencia específica para el final de brazada en natación.",
      workoutDoc: "Calentamiento (5m)\n- Rotaciones articulares de hombro\n\nBloque Tracción (3 Rondas)\n- 10x Jalón al pecho con elástico cerrado\n- 12x Flexiones escapulares en suelo\n- 10x Renegade rows sin carga o con banda\n- 30s Plancha frontal isométrica\n\nEnfriamiento\n- 5m Movilidad torácica",
    },
  ],

  PEAK: [
    {
      name: "Fuerza de Mantenimiento Rápida & Tono Muscular (25m)",
      focus: "Tono Neuromuscular sin Fatiga Estructural",
      durationMin: 25,
      tss: 18,
      justification: "Preserva los niveles de fuerza sin interferir con los fondos clave ni generar agujetas.",
      workoutDoc: "Movilidad (5m)\n- Movilidad articular global\n\nCircuito de Tono (2 Rondas)\n- 8x Sentadillas al cajón con peso corporal\n- 10x Flexiones escapulares controladas\n- 20s Plancha frontal isométrica\n- 10x Elevación de gemelos con propio peso\n\nEnfriamiento\n- 5m Estiramiento suave",
    },
    {
      name: "Estabilidad Dinámica Unipodal & Coordinación (25m)",
      focus: "Estabilidad de Cadera y Coordinación sin Carga",
      durationMin: 25,
      tss: 18,
      justification: "Ajuste fino de estabilidad unipodal protegiendo la zona lumbar.",
      workoutDoc: "Movilidad (5m)\n- Movilidad dinámica de tobillos\n\nCircuito Ligero (2 Rondas)\n- 8x Peso muerto a una pierna sin peso\n- 10x Bird-dog cruzado con control de core\n- 20s Plancha lateral dinámica\n- 10x Monster walks con elástico\n\nEnfriamiento\n- 5m Respiración y soltura",
    },
    {
      name: "Tono Isométrico de Core & Manguito Rotador (20m)",
      focus: "Activación Refleja sin Desgaste",
      durationMin: 20,
      tss: 15,
      justification: "Preserva la activación postural para natación y ciclismo.",
      workoutDoc: "Activación Rápida (2 Rondas)\n- 10x Rotaciones externas con banda ligera\n- 25s Puente de glúteo isométrico\n- 20s Plancha lateral por lado\n- 8x Sentadilla isométrica en pared\n\nEnfriamiento\n- 5m Estiramiento",
    },
    {
      name: "Reactividad Elástica Suave de Pies y Tobillos (20m)",
      focus: "Elasticidad de Tendones sin Sobrecarga",
      durationMin: 20,
      tss: 16,
      justification: "Mantiene la reactividad del tendón de Aquiles pre-carrera.",
      workoutDoc: "Activación (2 Rondas)\n- 20s Pogo jumps muy ligeros\n- 10x Elevaciones de talón en suelo\n- 8x Zancadas suaves sin rebote\n\nEnfriamiento\n- 5m Masaje de planta del pie",
    },
    {
      name: "Activación Postural & Cadena Posterior Ligera (25m)",
      focus: "Alineación y Descompresión",
      durationMin: 25,
      tss: 17,
      justification: "Tono ligero para evitar rigidez en viajes o descansos.",
      workoutDoc: "Circuito Ligero (2 Rondas)\n- 10x Buenos días sin peso\n- 12x Puentes de glúteo dobles\n- 20s Plancha frontal suave\n\nEnfriamiento\n- 5m Apertura torácica",
    },
  ],

  TAPER: [
    {
      name: "Movilidad Articular & Descarga Miofascial (20m)",
      focus: "Liberación Miofascial y Flexibilidad Dinámica",
      durationMin: 20,
      tss: 10,
      justification: "Descomprime articulaciones y maximiza la frescura muscular previa al evento.",
      workoutDoc: "Respiración (5m)\n- Respiración diafragmática y rotaciones suaves\n\nDescarga (10m)\n- Foam roller en cuádriceps, glúteos y gemelos\n- Movilidad de cadera (90/90) y apertura torácica\n\nEnfriamiento\n- 5m Relajación total",
    },
    {
      name: "Activación Neuromuscular & Movilidad Dinámica (20m)",
      focus: "Despertar Articular y Postural Pre-Carrera",
      durationMin: 20,
      tss: 10,
      justification: "Mantiene la alineación biomecánica reduciendo tensiones residuales.",
      workoutDoc: "Movilidad & Tono (2 Rondas)\n- 5m Cat-cow y movilidad de tobillos contra pared\n- 10x Activación de glúteo medio con minibanda suave\n- 8x Sentadillas con propio peso fluidas\n\nEnfriamiento\n- 5m Estiramiento dinámico",
    },
    {
      name: "Descompresión Espinal & Apertura Torácica (20m)",
      focus: "Relajación Muscular y Alineación",
      durationMin: 20,
      tss: 8,
      justification: "Elimina la tensión en trapecios y lumbares tras los viajes.",
      workoutDoc: "Rutina Relajante\n- 5m Descompresión colgado de barra o en suelo\n- 10m Estiramientos suaves de psoas, pectoral y cuello\n- 5m Respiración diafragmática",
    },
    {
      name: "Activación Refleja Rápida & Movilidad de Cadera (15m)",
      focus: "Tono Ligero el Día Previo",
      durationMin: 15,
      tss: 8,
      justification: "Sensación de ligereza en piernas antes del triatlón.",
      workoutDoc: "Activación Breve\n- 5m Swings de pierna controlados\n- 5m Movilidad de tobillo y cadera 90/90\n- 2x 15s Plancha frontal suave",
    },
  ],
};

/**
 * Selecciona una sesión de fuerza rotativa según la fase y la semana del macrociclo
 * utilizando paso coprimo para garantizar rotación sin repeticiones consecutivas.
 */
export function selectStrengthWorkout(
  phase: string,
  weekNumber: number,
  isRecovery: boolean,
  sessionIndex: number = 1
): StrengthWorkoutDefinition {
  let list = STRENGTH_WORKOUT_POOL.BASE;

  if (phase === "TAPER" || phase === "RACE_WEEK" || isRecovery) {
    list = STRENGTH_WORKOUT_POOL.TAPER;
  } else if (phase === "PEAK") {
    list = STRENGTH_WORKOUT_POOL.PEAK;
  } else if (phase === "BUILD") {
    list = STRENGTH_WORKOUT_POOL.BUILD;
  }

  const stride = getCoprimeStride(list.length, 2);
  const idx = ((weekNumber - 1) * stride + (sessionIndex - 1)) % list.length;

  return list[idx >= 0 ? idx : 0] || list[0];
}
