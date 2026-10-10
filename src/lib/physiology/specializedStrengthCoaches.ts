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
      name: "S1: Fuerza de Tobillos y Reactividad (35m)",
      focus: "Fuerza de Tobillos, Gemelos y Reactividad Elástica",
      durationMin: 35,
      tss: 25,
      justification: "Aumenta la absorción elástica del pie reduciendo el tiempo de contacto en el suelo y previene molestias en la fascia plantar.",
      workoutDoc: "Calentamiento & Movilidad (5m)\n- Movilidad de tobillo contra pared\n\nBloque Principal (3 Rondas)\n- 12x Elevación de talón sentado con carga (sóleo - 3s bajada)\n- 10x Saltos reactivos tipo pogo (mínimo contacto en suelo)\n- 10x Peso muerto rumano unilateral\n- 12x Monster walks con minibanda\n\nEnfriamiento (5m)\n- Descarga miofascial de gemelos y sóleo",
    },
    {
      name: "S1: Fuerza de Cadera y Glúteos (35m)",
      focus: "Glúteos, Cadera y Estabilidad de Rodilla",
      durationMin: 35,
      tss: 24,
      justification: "Fortalece los estabilizadores de cadera y previene la fatiga de rodilla y sobrecarga lumbar en carrera.",
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
    {
      name: "S1: Potencia Rotacional & Transferencia Frans Bosch (35m)",
      focus: "Cadera, Isquiosurales y Transferencia de Potencia",
      durationMin: 35,
      tss: 27,
      justification: "Fuerza reflexiva y aceleración en cadena abierta para máxima eficiencia mecánica en zancada rápida.",
      workoutDoc: "Activación (5m)\n- Zancadas dinámicas con rotación torácica\n\nBloque Frans Bosch (3 Rondas)\n- 8x Step-ups reactivos con aceleración y bloqueo de cadera arriba\n- 10x Peso muerto unipodal con alcance cruzado\n- 12x Salidas reactivas con resistencia elástica en cadera\n- 30s Plancha lateral con rodilla arriba flexionada a 90°\n\nEnfriamiento (5m)\n- Soltura y respiración profunda",
    },
    {
      name: "S1: Rigidez Tendinosa & Excéntrico Pesado Cuádriceps-Isquios (35m)",
      focus: "Rigidez Tendinosa, Cuádriceps e Isquios",
      durationMin: 35,
      tss: 28,
      justification: "Mejora la tolerancia al estrés excéntrico prolongado y reduce la fatiga neuromuscular al final del maratón.",
      workoutDoc: "Activación (5m)\n- Bisagra de cadera y movilidad de tobillos\n\nBloque Excéntrico (3 Rondas)\n- 8x Sentadillas con descenso lento de 4s\n- 6x Curl nórdico excéntrico asistido\n- 10x Saltos verticales reactivos desde semisentadilla\n- 30s Paseo del granjero con mancuerna pesada\n\nEnfriamiento (5m)\n- Foam roller en cuádriceps e isquiotibiales",
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
  RECOVERY: [
    {
      name: "S5: Movilidad Articular Dinámica & Descarga Muscular (25m)",
      focus: "Descompresión Articular y Liberación Miofascial",
      durationMin: 25,
      tss: 12,
      justification: "Descompresión cápsulo-articular y soltura fascial para acelerar la asimilación biológica sin fatiga mecánica.",
      workoutDoc: "Movilidad & Tono Suave (2 Rondas)\n- 5m Cat-cow y rotaciones suaves de cadera 90/90\n- 10x Activación glútea con minibanda ligera\n- 8x Sentadillas libres con respiración diafragmática\n\nDescarga Fascial (10m)\n- Foam roller suave en gemelos, sóleo e isquiotibiales\n- 5m Estiramiento de psoas y descompresión lumbar",
    },
    {
      name: "S5: Isometría Analgésica de Tendón Dr. Jill Cook (30m)",
      focus: "Isometría Analgésica y Refuerzo de Colágeno Tendinoso",
      durationMin: 30,
      tss: 18,
      justification: "Protocolo Dr. Jill Cook: Contracciones isométricas a 45s para inhibir dolor y reforzar tenocitos sin fatiga periférica.",
      workoutDoc: "Activación (5m)\n- Movilidad suave sin impacto\n\nBloque Isométrico (3 Rondas)\n- 4x 45s Spanish squat isométrica con banda en rodilla (tendón rotuliano)\n- 4x 45s Elevación de talón isométrica unipodal a 90° (sóleo y tendón de Aquiles)\n- 3x 30s Plancha frontal con activación glútea sostenida\n\nEnfriamiento (5m)\n- Respiración diafragmática 360° y soltura",
    },
    {
      name: "S5: Estabilidad Lumbo-Pélvica & Core Anti-Rotación Pallof (25m)",
      focus: "Control Postural, Pelvis Neutra y Cadenas Cruzadas",
      durationMin: 25,
      tss: 14,
      justification: "Refuerzo estabilizador profundo para mantener la pelvis alineada y reducir impacto en la fascia plantar.",
      workoutDoc: "Activación (5m)\n- Bird-dog con 3s de pausa isométrica en extensión\n\nBloque Estabilizador (3 Rondas)\n- 10x Pallof press con banda isométrica 3s\n- 10x Puentes de glúteo unipodales con control excéntrico\n- 8x Deadbug con resistencia contralateral en rodilla\n- 25s Plancha lateral con rodilla apoyada\n\nEnfriamiento (5m)\n- Estiramiento de piramidal y movilidad torácica",
    },
    {
      name: "S5: Descompresión Espinal, Cadenas Miofasciales & Reseteo Postural (25m)",
      focus: "Descompresión Axial, Diafragma y Cadena Posterior",
      durationMin: 25,
      tss: 12,
      justification: "Elimina la rigidez acumulada en la columna vertebral y restaura la simetría biomecánica tras semanas de impacto.",
      workoutDoc: "Activación (5m)\n- Respiración diafragmática con pies elevados en pared\n\nBloque Descompresión (2 Rondas)\n- 8x Bisagras de cadera suaves con pica (cadena posterior relajada)\n- 10x Deslizamiento neural del nervio ciático (nerve flossing)\n- 10x Elevaciones escapulares en pared (wall slides)\n- 30s Cuelgue pasivo o descompresión en espaldera/barra\n\nEnfriamiento (5m)\n- Foam roller en tensor de la fascia lata y glúteo medio",
    },
    STRENGTH_TRIAD_5_REGENERATIVE_MOBILITY_PREHAB,
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

  if (isRecovery) {
    const recPool = S5_PREHAB_POOL.RECOVERY || S5_PREHAB_POOL.TAPER;
    const stride = getCoprimeStride(recPool.length, 2);
    const idx = ((weekNumber - 1) * stride + (sessionIndex - 1)) % recPool.length;
    return recPool[idx >= 0 ? idx : 0] || recPool[0];
  }

  if (phase === "TAPER" || phase === "RACE_WEEK") {
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

  const stride = getCoprimeStride(list.length, 3);
  const idx = ((weekNumber - 1) * stride + (sessionIndex - 1)) % list.length;
  return list[idx >= 0 ? idx : 0] || list[0];
}
