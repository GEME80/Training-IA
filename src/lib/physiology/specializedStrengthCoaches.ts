import { StrengthWorkoutDefinition } from "./strengthWorkoutPool";
import { getCoprimeStride } from "./macrocycleTemplateHelpers";
import {
  STRENGTH_TRIAD_1_SOLEUS_SCAPULA_ROTATION,
  STRENGTH_TRIAD_2_POSTERIOR_DORSAL_EXTENSION,
  STRENGTH_TRIAD_4_ECCENTRIC_TRAP_TRENDELENBURG,
  STRENGTH_TRIAD_5_REGENERATIVE_MOBILITY_PREHAB,
} from "../ai/knowledge/workoutPools/strengthTriadPool";
import {
  CYCLING_BASE_STRENGTH_WORKOUTS,
  CYCLING_BUILD_STRENGTH_WORKOUTS,
  TRIATHLON_BASE_STRENGTH_WORKOUTS,
  TRIATHLON_BUILD_STRENGTH_WORKOUTS,
} from "./cyclingAndTriStrengthPool";

/**
 * 🏋️ SUITE DE 5 COACHES DE FORTALECIMIENTO ESPECIALIZADOS (S&C)
 * Gobernanza científica: Peter Attia, Brad Schoenfeld, Tim Gabbett y Frans Bosch.
 */

// S1: Running & Marathon Strength Coach
const S1_RUNNING_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    STRENGTH_TRIAD_1_SOLEUS_SCAPULA_ROTATION,
    {
      name: "S1: Sóleo Excéntrico & Stiffness de Tobillo Stryd LSS (35m)",
      focus: "Sóleo, Tendón de Aquiles y Leg Spring Stiffness",
      durationMin: 35,
      tss: 25,
      justification: "Aumenta la absorción elástica del pie reduciendo el tiempo de contacto (GCT < 210ms) y previene fascitis plantar.",
      workoutDoc: "Calentamiento & Movilidad (5m)\n- Movilidad de tobillo contra pared\n\nBloque Principal (3 Rondas)\n- 12x Elevación de talón sentado con carga (sóleo - 3s bajada)\n- 10x Pogo hops elásticos (mínimo contacto en suelo)\n- 10x Peso muerto rumano unilateral\n- 12x Monster walks con minibanda\n\nEnfriamiento (5m)\n- Descarga miofascial de gemelos y sóleo",
    },
    {
      name: "S1: Estabilidad Pélvica & Glúteo Medio Anti-Trendelenburg (35m)",
      focus: "Glúteo Medio, Cuádriceps y Control Pélvico",
      durationMin: 35,
      tss: 24,
      justification: "Evita la basculación de la pelvis y el valgo dinámico de rodilla en el maratón.",
      workoutDoc: "Activación (5m)\n- Puentes de glúteo unipodales\n\nBloque Principal (3 Rondas)\n- 10x Sentadilla búlgara por pierna con mancuernas\n- 12x Plancha lateral con abducción de pierna\n- 12x Clamshells con banda de alta tensión\n- 15x Elevaciones tibiales contra pared\n\nEnfriamiento (5m)\n- Estiramiento de psoas y piramidal",
    },
    {
      name: "S1: Cadena Posterior & Peso Muerto Rumano Unipodal (35m)",
      focus: "Isquiotibiales, Glúteo Mayor y Control Lumbo-Pélvico",
      durationMin: 35,
      tss: 25,
      justification: "Equilibra la fuerza de la zancada posterior y previene desgarros musculares en aceleraciones.",
      workoutDoc: "Activación (5m)\n- Bisagra de cadera con pica\n\nBloque Principal (3 Rondas)\n- 10x Peso muerto rumano unipodal por pierna\n- 12x Puentes de glúteo con talón elevado\n- 12x Planchas dinámicas con apoyo alternado\n- 15x Tibiales anteriores con banda elástica\n\nEnfriamiento (5m)\n- Estiramiento miofascial de isquiotibiales",
    },
    {
      name: "S1: Core Anti-Rotación & Estabilidad de Columna Pallof (30m)",
      focus: "Transverso, Oblicuos y Transferencia de Fuerza",
      durationMin: 30,
      tss: 22,
      justification: "Elimina oscilaciones y torsiones parásitas del torso para una economía de carrera perfecta.",
      workoutDoc: "Activación (5m)\n- Bird-dog y respiración diafragmática 360°\n\nBloque Anti-Rotación (3 Rondas)\n- 12x Pallof press con banda isométrica 3s\n- 30s Paseo del granjero con mancuerna unilateral\n- 12x Deadbug con presión contra rodilla\n- 10x Elevación de caderas en plancha lateral\n\nEnfriamiento (5m)\n- Movilidad espinal y relajación",
    },
  ],
  BUILD: [
    STRENGTH_TRIAD_2_POSTERIOR_DORSAL_EXTENSION,
    {
      name: "S1: Cadena Posterior Propulsiva & Hip Thrust Pesado (35m)",
      focus: "Glúteo Mayor, Isquiosurales y Fase de Impulso",
      durationMin: 35,
      tss: 28,
      justification: "Maximiza la potencia propulsiva en cada zancada y mejora la economía de carrera (kJ/km).",
      workoutDoc: "Activación (5m)\n- Bisagra de cadera con pica\n\nBloque Principal (3 Rondas)\n- 8x Hip thrust pesado con pausa isométrica 2s\n- 8x Peso muerto a una pierna con mancuerna\n- 10x Saltos reactivos a escalón con recepción elástica\n- 30s Plancha frontal con apoyo unilateral\n\nEnfriamiento (5m)\n- Foam roller en isquiotibiales",
    },
    {
      name: "S1: Pliometría Reactiva & Fuerza Neural Máxima (30m)",
      focus: "Reclutamiento Neural Rápido y Rigidez Tendinosa",
      durationMin: 30,
      tss: 26,
      justification: "Enseña al sistema neuromuscular a absorber y transferir energía elástica instantánea sin fatiga metabólica.",
      workoutDoc: "Activación (5m)\n- Saltos suaves con comba\n\nBloque Pliométrico (3 Rondas)\n- 8x Drop jumps desde cajón bajo a salto vertical reactivo\n- 10x Zancadas explosivas alternadas\n- 15x Pogos reactivos unipodales\n- 30s Hollow body hold\n\nEnfriamiento (5m)\n- Soltura y respiración diafragmática",
    },
    {
      name: "S1: Fuerza Unipodal & Sentadilla Búlgara con Pausa Isométrica (35m)",
      focus: "Cuádriceps, Glúteo Medio y Absorción de Impacto",
      durationMin: 35,
      tss: 27,
      justification: "Desarrolla fuerza excéntrica en cadena cerrada para tolerar impactos acumulados sin pérdida de técnica.",
      workoutDoc: "Activación (5m)\n- Movilidad dinámica de cadera y tobillo\n\nBloque Principal (3 Rondas)\n- 8x Sentadilla búlgara con pausa abajo 2s\n- 10x Step-ups con elevación reactiva de rodilla contraria\n- 12x Clamshells resistidos con banda alta\n- 30s Plancha lateral con estrella\n\nEnfriamiento (5m)\n- Descarga miofascial de cuádriceps",
    },
    {
      name: "S1: Potencia Reactiva Sóleo-Aquiles & Saltos Reactivos Pogo (30m)",
      focus: "Tendón de Aquiles, Sóleo y Fuerza Elástica",
      durationMin: 30,
      tss: 25,
      justification: "Optimiza la restitución elástica del complejo gemelo-sóleo-Aquiles durante el ritmo de competición.",
      workoutDoc: "Activación (5m)\n- Saltos de tobillo suaves\n\nBloque Reactivo (3 Rondas)\n- 12x Saltos pogo elásticos a 180 bpm\n- 8x Elevación de talón con carga pesada a 1 pierna\n- 10x Saltos laterales reactivos sobre línea\n- 30s Hollow body en suelo\n\nEnfriamiento (5m)\n- Estiramiento pasivo de sóleo y gemelo",
    },
  ],
};

// S2: Cycling & Climbing Strength Coach
const S2_CYCLING_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: CYCLING_BASE_STRENGTH_WORKOUTS,
  BUILD: CYCLING_BUILD_STRENGTH_WORKOUTS,
};

// S3: Triathlon Multi-Sport Strength Coach
const S3_TRIATHLON_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: TRIATHLON_BASE_STRENGTH_WORKOUTS,
  BUILD: TRIATHLON_BUILD_STRENGTH_WORKOUTS,
};

// S4: Trail & Ultra Mountain Strength Coach
const S4_TRAIL_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "S4: Cuádriceps Excéntrico Pesado para Bajadas D- (35m)",
      focus: "Absorción Excéntrica en Cuádriceps y Tendón Rotuliano",
      durationMin: 35,
      tss: 27,
      justification: "Condiciona las fibras musculares contra el daño severo por contracción excéntrica en descensos de +1.000m D-.",
      workoutDoc: "Calentamiento (5m)\n- Sentadillas suaves y movilidad de tobillos\n\nBloque Excéntrico (3 Rondas)\n- 8x Sentadillas con descenso lento de 4 segundos\n- 8x Zancadas de frenado excéntrico alternadas\n- 12x Elevaciones de talón excéntricas unipodales\n- 30s Plancha frontal con toques de hombro\n\nEnfriamiento (5m)\n- Foam roller en cuádriceps e isquios",
    },
    {
      name: "S4: Estabilidad Multidireccional de Tobillo & Peroneos (30m)",
      focus: "Peroneos, Propiocepción y Tren Superior para Bastones",
      durationMin: 30,
      tss: 23,
      justification: "Refuerza la estabilidad del pie en terreno técnico irregular y la fuerza de brazos para uso de bastones.",
      workoutDoc: "Activación (5m)\n- Movilidad circular de tobillo en equilibrio\n\nBloque Propioceptivo (3 Rondas)\n- 12x Inversión/eversión resistida de tobillo con banda\n- 30s Equilibrio unipodal con ojos cerrados\n- 12x Remo cerrado con banda para empuje de bastones\n- 10x Peso muerto a una pierna en superficie inestable\n\nEnfriamiento (5m)\n- Movilidad y masaje de fascia plantar",
    },
  ],
  BUILD: [
    STRENGTH_TRIAD_4_ECCENTRIC_TRAP_TRENDELENBURG,
    {
      name: "S4: Resistencia Excéntrica Avanzada & Potencia en Cuesta (35m)",
      focus: "Propulsión en Cuesta y Mitigación de DOMS",
      durationMin: 35,
      tss: 28,
      justification: "Fortalece la tolerancia al daño muscular excéntrico prolongado en ultras y carreras de montaña.",
      workoutDoc: "Calentamiento (5m)\n- Zancadas dinámicas de calentamiento\n\nBloque Principal (3 Rondas)\n- 8x Sentadillas búlgaras con bajada en 4s\n- 10x Subidas a cajón con mancuernas pesadas\n- 12x Monster walks laterales con banda doble\n- 30s Plancha lateral con abducción\n\nEnfriamiento (5m)\n- Descarga miofascial de cuádriceps y sóleo",
    },
  ],
};

// S5: Prehab, Longevity & Injury Rehab Coach (Salud, Máster & Prevención)
const S5_PREHAB_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "S5: Isométricos Pesados de Tendón (Aquiles / Rotuliano) (30m)",
      focus: "Isometría Analgésica y Refuerzo de Colágeno Tendinoso",
      durationMin: 30,
      tss: 20,
      justification: "Protocolo Dr. Jill Cook: Las contracciones isométricas pesadas (45s) reducen el dolor tendinoso y aumentan la rigidez estructural.",
      workoutDoc: "Activación (5m)\n- Movilidad suave sin impacto\n\nBloque Isométrico (3 Rondas)\n- 4x 45s Spanish squat isométrica con banda en rodilla (rotuliano)\n- 4x 45s Elevación de talón isométrica unipodal a 90° (sóleo/Aquiles)\n- 3x 30s Plancha frontal con activación glútea\n\nEnfriamiento (5m)\n- Respiración diafragmática y soltura",
    },
    {
      name: "S5: Longevidad, Masa Magra & Equilibrio Isquio-Cuádriceps (30m)",
      focus: "Ratio H:Q, Prevención de Sarcopenia (Peter Attia) y Core",
      durationMin: 30,
      tss: 22,
      justification: "Preserva masa muscular magra en atletas máster y equilibra la fuerza entre cuádriceps e isquios.",
      workoutDoc: "Activación (5m)\n- Movilidad dinámica articular\n\nBloque Longevidad (3 Rondas)\n- 8x Peso muerto rumano controlado\n- 8x Curl femoral nórdico excéntrico asistido\n- 30s Paseo del granjero unilateral (agarre y core)\n- 10x Sentadillas libres con control postural\n\nEnfriamiento (5m)\n- Descompresión espinal y estiramientos suaves",
    },
  ],
  TAPER: [
    STRENGTH_TRIAD_5_REGENERATIVE_MOBILITY_PREHAB,
    {
      name: "S5: Movilidad Articular Dinámica & Descarga Pre-Competición (20m)",
      focus: "Descompresión Articular y Liberación Miofascial",
      durationMin: 20,
      tss: 10,
      justification: "Maximiza la frescura muscular y el rango articular sin fatiga periférica antes del evento.",
      workoutDoc: "Movilidad & Tono Suave (2 Rondas)\n- 5m Cat-cow y círculos suaves de cadera\n- 10x Activación glútea suave con minibanda\n- 8x Sentadillas con peso corporal fluidas\n\nDescarga (10m)\n- Foam roller suave en piernas y respiración diafragmática",
    },
  ],
};

/**
 * Resuelve la sesión de fuerza óptima seleccionando el Coach S&C adecuado
 * con paso coprimo anti-repetición y modulación por fase de macrociclo.
 */
export function resolveSpecializedStrengthWorkout(params: {
  sportCategory?: string;
  phase: string;
  weekNumber: number;
  isRecovery: boolean;
  sessionIndex?: number;
}): StrengthWorkoutDefinition {
  const { sportCategory = "Running", phase, weekNumber, isRecovery, sessionIndex = 1 } = params;

  if (phase === "TAPER" || phase === "RACE_WEEK" || isRecovery) {
    const taperPool = S5_PREHAB_POOL.TAPER || S5_PREHAB_POOL.BASE;
    return taperPool[(weekNumber - 1) % taperPool.length] || taperPool[0];
  }

  let coachPool: Record<string, StrengthWorkoutDefinition[]>;
  switch (sportCategory) {
    case "Cycling":
      coachPool = S2_CYCLING_POOL;
      break;
    case "Triathlon":
      coachPool = S3_TRIATHLON_POOL;
      break;
    case "Trail":
      coachPool = S4_TRAIL_POOL;
      break;
    case "Longevity":
      coachPool = S5_PREHAB_POOL;
      break;
    case "Running":
    default:
      coachPool = S1_RUNNING_POOL;
      break;
  }

  const phaseKey = phase === "PEAK" || phase === "BUILD" ? "BUILD" : "BASE";
  const list = coachPool[phaseKey] && coachPool[phaseKey].length > 0
    ? coachPool[phaseKey]
    : coachPool.BASE || S5_PREHAB_POOL.BASE;

  const stride = getCoprimeStride(list.length, 2);
  const idx = ((weekNumber - 1) * stride + (sessionIndex - 1)) % list.length;
  return list[idx >= 0 ? idx : 0] || list[0];
}
