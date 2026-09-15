import { StrengthWorkoutDefinition } from "./strengthWorkoutPool";
import { getCoprimeStride } from "./macrocycleTemplateHelpers";

/**
 * 🏋️ SUITE DE 5 COACHES DE FORTALECIMIENTO ESPECIALIZADOS (S&C)
 * Gobernanza científica: Peter Attia, Brad Schoenfeld, Tim Gabbett y Frans Bosch.
 */

// S1: Running & Marathon Strength Coach
const S1_RUNNING_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
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
  ],
  BUILD: [
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
  ],
};

// S2: Cycling & Climbing Strength Coach
const S2_CYCLING_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "S2: Torque en Cuádriceps & Fase de Empuje de Pedaleo (35m)",
      focus: "Cuádriceps (fase 1:00 a 5:00), Glúteo Mayor y Prensa",
      durationMin: 35,
      tss: 26,
      justification: "Desarrolla el torque máximo necesario para subir puertos a 50-60 rpm sin claudicación muscular.",
      workoutDoc: "Calentamiento (5m)\n- Movilidad de cadera y rodilla dinámicas\n\nBloque Principal (3 Rondas)\n- 8x Sentadilla pesada controlada (80% 1RM)\n- 10x Prensa de piernas unilateral\n- 12x Subidas a escalón alto con carga\n- 35s Plancha prona isométrica en codos\n\nEnfriamiento (5m)\n- Estiramiento profundo de cuádriceps",
    },
    {
      name: "S2: Resistencia Postural Isométrica Aero & Lumbar (35m)",
      focus: "Erectores Espinales, Core Anti-Extensión y Trapecios",
      durationMin: 35,
      tss: 24,
      justification: "Previene el dolor lumbar y cervical al mantener la posición aerodinámica durante 3-5 horas.",
      workoutDoc: "Activación (5m)\n- Cat-cow y dislocaciones con banda\n\nBloque Postural (3 Rondas)\n- 45s Plancha en posición de acoples aero\n- 10x Bird-dog resistido con minibanda\n- 12x Face-pulls para romboides y trapecio medio\n- 12x Hip thrust con apoyo de escápulas\n\nEnfriamiento (5m)\n- Descompresión espinal colgado",
    },
  ],
  BUILD: [
    {
      name: "S2: Potencia Crítica en Subida & Fuerza-Resistencia (35m)",
      focus: "Fuerza Unipodal y Rendimiento en W/kg en Puertos",
      durationMin: 35,
      tss: 28,
      justification: "Optimiza la transferencia de potencia al pedal y reduce la fatiga neuromuscular periférica.",
      workoutDoc: "Activación (5m)\n- Movilidad articular completa\n\nBloque Principal (3 Rondas)\n- 8x Sentadilla búlgara pesada con mancuernas por pierna\n- 10x Peso muerto rumano con mancuernas pesadas\n- 12x Extensiones de cadera en banco inclinado\n- 12x Pallof press anti-rotación\n\nEnfriamiento (5m)\n- Foam roller en banda iliotibial y glúteos",
    },
  ],
};

// S3: Triathlon Multi-Sport Strength Coach
const S3_TRIATHLON_POOL: Record<string, StrengthWorkoutDefinition[]> = {
  BASE: [
    {
      name: "S3: Escápula & Manguito Rotador (Swimmer's Shoulder Shield) (35m)",
      focus: "Serrato Anterior, Dorsal Ancho y Manguito Rotador",
      durationMin: 35,
      tss: 24,
      justification: "Protege la articulación glenohumeral contra sobreuso en natación y fortalece la tracción acuática.",
      workoutDoc: "Calentamiento (5m)\n- Dislocaciones y círculos de hombro con banda\n\nBloque Escapular (3 Rondas)\n- 12x Rotaciones externas de hombro con codo pegado\n- 10x 'Y-T-W' prono en suelo o fitball\n- 12x Jalón al pecho con elástico concentrado\n- 35s Plancha lateral con apoyo de antebrazo\n\nEnfriamiento (5m)\n- Apertura torácica y estiramiento de pectoral",
    },
    {
      name: "S3: Core Hidrodinámico & Estabilidad de Transición Brick (35m)",
      focus: "Transverso Abdominal, Glúteo Medio y Cadera",
      durationMin: 35,
      tss: 25,
      justification: "Alineación hidrodinámica en el agua y estabilización neuromuscular en la bajada de la bici a correr.",
      workoutDoc: "Activación (5m)\n- Activación pélvica en suelo\n\nBloque Transición (3 Rondas)\n- 30s Hollow body hold con piernas extendidas\n- 10x Step-ups rápidos a escalón simulando ritmo T2\n- 12x Puente supino unilateral\n- 12x Monster walks con banda\n\nEnfriamiento (5m)\n- Descarga miofascial de piernas",
    },
  ],
  BUILD: [
    {
      name: "S3: Fuerza Neuromuscular Concurrente & Resistencia Postural (35m)",
      focus: "Fuerza Integral Concurrente Bici-Carrera",
      durationMin: 35,
      tss: 27,
      justification: "Soporte metabólico y mecánico para sostener el ritmo en el sector final de carrera a pie en triatlón.",
      workoutDoc: "Calentamiento (5m)\n- Movilidad dinámica de cadera y tobillo\n\nBloque Concurrente (3 Rondas)\n- 8x Sentadillas búlgaras con pausa abajo 2s\n- 10x Peso muerto rumano con mancuernas\n- 10x Remo con banda elástica cerrado\n- 30s Plancha prono con elevación de talón\n\nEnfriamiento (5m)\n- Estiramiento dinámico y respiración",
    },
  ],
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
