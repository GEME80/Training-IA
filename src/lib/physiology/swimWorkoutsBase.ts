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
    workoutDoc: `Warmup\n- 300mtr 60% Pace\n\nTécnica (Drills)\n6x\n- 50mtr Drill\n- 15s recovery\n- 50mtr 65% Pace\n- 15s recovery\n\nMain\n4x\n- 100mtr 75% Pace\n- 20s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Aeróbica de Resistencia Base & Pull Buoy (50m)",
    focus: "Capacidad Aeróbica Continua y Posición Alta",
    durationMin: 50,
    tss: 39,
    justification: "Fortalecimiento de la musculatura dorsal y mantenimiento de cadera alta con fatiga mínima.",
    workoutDoc: `Warmup\n- 250mtr 60% Pace\n\nMain\n4x\n- 200mtr 75% Pace\n- 20s recovery\n4x\n- 50mtr 85% Pace\n- 15s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Progresiva con Cambios de Cadencia (45m)",
    focus: "Control de Frecuencia de Brazada y Eficiencia",
    durationMin: 45,
    tss: 38,
    justification: "Adaptación del ritmo de brazada a diferentes velocidades de nado.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nMain\n3x\n- 100mtr 70% Pace\n- 15s recovery\n- 100mtr 78% Pace\n- 20s recovery\n- 100mtr 85% Pace\n- 30s recovery\n\nCooldown\n- 100mtr 50% Pace`,
  },
  {
    name: "Natación de Capacidad Mitocondrial Continua (50m)",
    focus: "Resistencia Aeróbica y Eficiencia de Batido",
    durationMin: 50,
    tss: 40,
    justification: "Estímulo de volumen aeróbico continuo para optimizar el gasto energético por brazada.",
    workoutDoc: `Warmup\n- 300mtr 60% Pace\n\nMain\n2x\n- 400mtr 74% Pace\n- 30s recovery\n4x\n- 100mtr 80% Pace\n- 20s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Piramidal Aeróbica (50m)",
    focus: "Modulación de Ritmo y Control de Esfuerzo",
    durationMin: 50,
    tss: 41,
    justification: "Piramidal de volumen para desarrollar sensación de ritmo sostenido.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nPirámide\n- 100mtr 72% Pace\n- 15s recovery\n- 200mtr 74% Pace\n- 20s recovery\n- 300mtr 76% Pace\n- 30s recovery\n- 200mtr 78% Pace\n- 20s recovery\n- 100mtr 82% Pace\n- 30s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Fuerza Propulsiva & Propiocepción con Aletas (45m)",
    focus: "Propulsión del Batido y Posición Corporal Elevada",
    durationMin: 45,
    tss: 37,
    justification: "Sobrecarga específica de los flexores de tobillo y corrección de la postura hidrodinámica en superficie.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nMain (Aletas Cortas)\n6x\n- 50mtr Kick 80% Pace\n- 20s recovery\n6x\n- 100mtr Swim 78% Pace\n- 20s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Hidrodinámica & Alineación Torácica (45m)",
    focus: "Alineación y Reducción del Arrastre Frontal",
    durationMin: 45,
    tss: 35,
    justification: "Enfocado en eliminar el cabeceo excesivo y fijar la línea de flotación central.",
    workoutDoc: `Warmup\n- 250mtr 60% Pace\n\nDrills de Alineación\n4x\n- 50mtr Catch-up con pica/tabla\n- 20s recovery\n4x\n- 50mtr Nado con puños cerrados\n- 20s recovery\n\nMain\n3x\n- 200mtr 74% Pace\n- 25s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Aeróbica Extensiva con Palas Medianas & Pull (50m)",
    focus: "Fuerza-Resistencia Muscular de Dorsal y Tríceps",
    durationMin: 50,
    tss: 42,
    justification: "Desarrollo de tracción potente por brazada sin fatiga excesiva de hombro gracias al uso de palas medianas.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nMain (Pull + Palas)\n5x\n- 200mtr 75% Pace\n- 25s recovery\n\nVelocidad de Soltura\n4x\n- 25mtr 90% Pace\n- 30s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Control de Respiración Bilateral 3 y 5 Brazadas (45m)",
    focus: "Simetría del Rolido y Capacidad Hipóxica Controlada",
    durationMin: 45,
    tss: 37,
    justification: "Equilibra el balance muscular a ambos lados del cuerpo y mejora el confort respiratorio en aguas abiertas.",
    workoutDoc: `Warmup\n- 300mtr 60% Pace\n\nBloque Bilateral\n6x\n- 100mtr Respiración c/3 y c/5 alternada\n- 20s recovery\n\nMain\n4x\n- 75mtr 78% Pace\n- 15s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Eficiencia de Brazada & Conteo SWOLF (45m)",
    focus: "Distancia por Brazada (DPS) y Mínimo Número de Ciclos",
    durationMin: 45,
    tss: 36,
    justification: "Obliga a maximizar el deslizamiento por ciclo reduciendo el gasto metabólico por metro recorrido.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nBloque SWOLF\n8x\n- 50mtr Conteo de brazadas (buscar mínimo conteo)\n- 30s recovery\n\nMain Continuo\n- 400mtr 72% Pace\n\nCooldown\n- 150mtr 50% Pace`,
  },
  {
    name: "Natación Resistencia Muscular Dorsal & Brazada Larga (50m)",
    focus: "Tracción Continua y Apoyo Antebrazo Vertical (EVF)",
    durationMin: 50,
    tss: 40,
    justification: "Fija el agarre del codo alto temprano bajo el agua para evitar el escape de agua.",
    workoutDoc: `Warmup\n- 200mtr 60% Pace\n\nMain EVF\n6x\n- 150mtr 75% Pace (foco codo alto)\n- 20s recovery\n\nSoltura\n4x\n- 50mtr 80% Pace\n- 15s recovery\n\nCooldown\n- 100mtr 50% Pace`,
  },
  {
    name: "Natación Bloques Progresivos Continuos 3x 400m Z2 (55m)",
    focus: "Volumen Aeróbico Puro y Regularidad de Ritmo",
    durationMin: 55,
    tss: 44,
    justification: "Consolida la resistencia de base para pruebas de media y larga distancia de triatlón y travesías.",
    workoutDoc: `Warmup\n- 250mtr 60% Pace\n\nMain Progresivo\n3x\n- 400mtr (1° 72%, 2° 75%, 3° 78% Pace)\n- 40s recovery\n\nCooldown\n- 150mtr 50% Pace`,
  },
];
