import { StrengthModelDefinition, CrossTrainingModelDefinition } from "./types";

/**
 * 🏋️ MODELOS CIENTÍFICOS DE FORTALECIMIENTO APLICADO AL DEPORTE DE RESISTENCIA
 */

export const STRENGTH_MODEL_HEAVY_NEURAL: StrengthModelDefinition = {
  modelId: "strength_heavy_neural",
  name: "Fuerza Máxima Neural & Economía de Carrera (Heavy Strength)",
  category: "NEURAL_HEAVY",
  focus: "Economía de carrera, reclutamiento neural y potencia propulsiva sin hipertrofia",
  justification:
    "El entrenamiento de fuerza pesada (80-87% 1RM) enseña al sistema nervioso central a reclutar menos unidades motoras para sostener el ritmo de carrera, aumentando la economía en un 4-8% sin incrementar masa muscular.",
  workoutDoc: `Calentamiento Articular & Movilidad
- 5m Dinámico de cadera, tobillo y rodilla

Bloque Principal - Fuerza Máxima (80-87% 1RM)
3x
- 4x Sentadilla Búlgara con Mancuernas (3-4 min descanso)
- 4x Peso Muerto Rumano a una Pierna (3-4 min descanso)
- 5x Hip Thrust con Barra (3 min descanso)

Core & Estabilidad
- 3x 45s Plancha Frontal con Levantamiento de Pierna

Enfriamiento & Soltura
- 5m Movilidad pélvica`,
};

export const STRENGTH_MODEL_SPRING_ANKLE_SOLEUS: StrengthModelDefinition = {
  modelId: "strength_spring_ankle_soleus",
  name: "Resistencia Reactiva de Tobillo, Sóleo & Pliometría (Spring Ankle)",
  category: "SPRING_ANKLE_SOLEUS",
  focus: "Rigidez tendinosa (stiffness), tendón de Aquiles y absorción de impacto en el sóleo",
  justification:
    "El sóleo soporta hasta 8 veces el peso corporal en cada zancada de maratón. Fortalecer la fase isométrica/elástica evita la degradación del arco plantar y tendinopatías.",
  workoutDoc: `Calentamiento & Activación de Tobillo
- 5m Círculos de tobillo y elevaciones suaves de talón

Bloque Principal - Sóleo & Pliometría Reactiva
3x
- 12x Elevaciones de Talón Sentado con Carga (Enfoque Sóleo - 3s bajada)
- 10x Elevaciones de Talón de Pie en Escalón a una Pierna (Gastrocnemio)
- 15x Pogos / Saltos Reactivos de Tobillo (Mínimo contacto de suelo)
- 8x Drop Jumps Suaves desde Escalón a Recepción Elástica

Core & Estabilidad
- 3x 12x Clamshells con Banda elástica para Glúteo Medio

Enfriamiento
- 5m Estiramiento pasivo de sóleo y fascia plantar`,
};

export const STRENGTH_MODEL_DOWNHILL_ECCENTRIC: StrengthModelDefinition = {
  modelId: "strength_downhill_eccentric",
  name: "Fuerza Excéntrica para Cuestas & Bajadas (Trail & Mountain Shield)",
  category: "ECCENTRIC_DOWNHILL",
  focus: "Protección excéntrica del cuádriceps y resistencia al daño muscular inducido por desniveles",
  justification:
    "Las bajadas pronunciadas provocan daño miofascial severo por contracción excéntrica. La adaptación excéntrica previene el fallo prematuro de los cuádriceps en el km 30.",
  workoutDoc: `Calentamiento Dinámico
- 5m Zancadas cortas y movilidad de rodilla

Bloque Principal - Sobrecarga Excéntrica (4s Bajada Lenta)
3x
- 8x Sentadillas Excéntricas Lentas (4s en la fase de bajada, subida explosiva)
- 8x Zancadas Excéntricas de Frenado (Alternadas)
- 10x Peso Muerto a una Pierna con Control Estricto

Enfriamiento & Movilidad
- 5m Liberación de cuádriceps e isquios`,
};

export const STRENGTH_MODEL_PELVIC_CORE_PREHAB: StrengthModelDefinition = {
  modelId: "strength_pelvic_core_prehab",
  name: "Estabilidad Pélvica, Core Anti-Rotación & Prehab (Postural Guard)",
  category: "PELVIC_CORE_PREHAB",
  focus: "Control pélvico en fatiga, glúteo medio, isquiotibiales y prevención biomecánica",
  justification:
    "Evita la caída de la pelvis (inestabilidad pélvica) y el valgo de rodilla cuando la fatiga apaga el sistema nervioso en la segunda mitad de la carrera.",
  workoutDoc: `Calentamiento & Activación Glútea
- 5m Puentes de glúteo e isometría pélvica

Bloque Principal - Control Pélvico & Anti-Rotación
3x
- 12x Plancha Lateral con Elevación de Pierna (Glúteo Medio)
- 10x Isquiotibiales en Fitball (Flexión de rodilla con elevación de pelvis)
- 10x Pallof Press con Banda (Core Anti-Rotación)
- 12x Monster Walk Lateral con Banda en Tobillos

Enfriamiento
- 5m Respiración diafragmática y soltura de cadera`,
};

/**
 * 🌊 MODELOS REGENERATIVOS & FORTALECIMIENTO EN AGUA (HIDROTERAPIA)
 */

export const WATER_MODEL_REGENERATIVE_AQUA_RUN: CrossTrainingModelDefinition = {
  modelId: "water_regenerative_aqua_run",
  name: "Aqua-Running Regenerativo en Agua Profunda (Deep Water Running)",
  category: "WATER_AQUA_RUN",
  sport: "Swim",
  targetMetric: "HR Zone 1 / RPE 2-3",
  durationMin: 40,
  justification:
    "El trote en agua profunda con cinturón de flotación elimina al 100% el impacto contra el suelo, estimula la circulación sanguínea por presión hidrostática y descomprime la columna intervertebral.",
  workoutDoc: `Ingreso & Aclimatación
- 5m Nado suave o desplazamiento libre en agua

Bloque Principal - Aqua-Running Cadencia 180 spm
- 30m Trote simulado en agua profunda con cinturón de flotación (Mantener zancada alta y brazada fluida sin tocar fondo)

Enfriamiento
- 5m Flotación de espaldas y soltura articular`,
};

export const WATER_MODEL_HYDROTHERAPY_STRENGTH: StrengthModelDefinition = {
  modelId: "water_hydrotherapy_strength",
  name: "Fortalecimiento Hidrodinámico & Hidroterapia de Contraste",
  category: "WATER_HYDROTHERAPY",
  focus: "Resistencia hidrodinámica de cadera/core y recuperación vascular acelerada",
  justification:
    "Utiliza la resistencia del agua para fortalecer estabilizadores de cadera sin carga axial y combina contraste térmico para acelerar la eliminación de lactato y creatina quinasa.",
  workoutDoc: `Bloque 1 - Fortalecimiento Hidrodinámico en Piscina (Cintura sumergida)
3x
- 15x Patada Hidrodinámica Lateral de Cadera (Resistencia de agua)
- 15x Elevaciones de Rodilla al Pecho en Inmersión
- 12x Desplazamientos Laterales en Agua (Bajo impacto)

Bloque 2 - Protocolo de Hidroterapia de Contraste (Ducha / Bañera)
3x Ciclos
- 1m30s Agua Fría (12-15°C)
- 1m30s Agua Caliente / Templada (36-38°C)

Finalización
- 5m Descanso con piernas elevadas`,
};

/**
 * 🚴 MODELOS DE ENTRENAMIENTO CRUZADO EN BICICLETA / RODILLO
 */

export const CROSS_BIKE_Z2_MITO: CrossTrainingModelDefinition = {
  modelId: "cross_bike_z2_mito",
  name: "Ciclismo Z2 Mitocondrial & Protegido (Bici / Rodillo)",
  category: "BIKE_Z2_MITO",
  sport: "Ride",
  targetMetric: "Bike FTP 65-72%",
  durationMin: 60,
  justification:
    "Desarrolla el volumen aeróbico y la densidad mitocondrial acumulando horas de trabajo cardio-vascular con cero carga osteoarticular de impacto.",
  workoutDoc: `Calentamiento
- 10m 55% FTP

Main Z2 Mitocondrial (Cadencia 90 rpm)
- 40m 68% FTP

Enfriamiento
- 10m 50% FTP`,
};

export const CROSS_BIKE_HIIT_VO2: CrossTrainingModelDefinition = {
  modelId: "cross_bike_hiit_vo2",
  name: "HIIT Potencia Aeróbica sin Impacto en Bici (VO2max Shield)",
  category: "BIKE_HIIT_VO2",
  sport: "Ride",
  targetMetric: "Bike FTP 115% / 55%",
  durationMin: 45,
  justification:
    "Estimula el VO2max y la capacidad pulmonar al 100% mediante micro-intervalos de alta potencia sin machacar tendones o articulaciones de la carrera a pie.",
  workoutDoc: `Calentamiento Progresivo
- 15m 55-70% FTP

Bloque 1 (10x 30s/30s)
10x
- 30s 115% FTP
- 30s 50% FTP

Recuperación
- 5m 55% FTP

Bloque 2 (10x 30s/30s)
10x
- 30s 115% FTP
- 30s 50% FTP

Enfriamiento
- 5m 45% FTP`,
};

export const STRENGTH_MODEL_SWIM_SHOULDER_DORSAL: StrengthModelDefinition = {

  modelId: "strength_swim_shoulder_dorsal",

  name: "Fuerza Específica de Tracción Dorsal & Estabilidad Escapular (Swim & Upper Guard)",
  category: "SWIM_SHOULDER_DORSAL",
  focus: "Potencia de agarre/tirón en el agua, manguito rotador, dorsal ancho y estabilidad escapular",
  justification:
    "El 85% de la propulsión en natación proviene de la fase de agarre y tirón del dorsal ancho. Fortalecer manguito rotador y serrato previene la tendinitis supraespinosa (hombro del nadador).",
  workoutDoc: `Calentamiento & Movilidad de Hombro
- 5m Rotaciones externas con goma elástica y movilidad torácica

Bloque Principal - Tracción Dorsal & Estabilidad Escapular
3x
- 8x Dominadas Asistidas o Jalón al Pecho Agarre Neutro (RIR 2)
- 10x Remo con Mancuernas apoyado en Banco (Dorsal Ancho)
- 12x Face Pulls con Cuerda a la Frente (Manguito Rotador & Trapecio Medio)
- 12x Serrato Push-Ups / Plancha con Protracción Escapular

Core & Estabilidad Aero
- 3x 45s Plancha Frontal apoyando antebrazos

Enfriamiento & Movilidad
- 5m Estiramiento pasivo de pectoral mayor y dorsal ancho`,
};

export const ALL_STRENGTH_MODELS: Record<string, StrengthModelDefinition> = {
  strength_heavy_neural: STRENGTH_MODEL_HEAVY_NEURAL,
  strength_spring_ankle_soleus: STRENGTH_MODEL_SPRING_ANKLE_SOLEUS,
  strength_downhill_eccentric: STRENGTH_MODEL_DOWNHILL_ECCENTRIC,
  strength_pelvic_core_prehab: STRENGTH_MODEL_PELVIC_CORE_PREHAB,
  strength_swim_shoulder_dorsal: STRENGTH_MODEL_SWIM_SHOULDER_DORSAL,
  water_hydrotherapy_strength: WATER_MODEL_HYDROTHERAPY_STRENGTH,
};


export const ALL_CROSS_MODELS: Record<string, CrossTrainingModelDefinition> = {
  water_regenerative_aqua_run: WATER_MODEL_REGENERATIVE_AQUA_RUN,
  cross_bike_z2_mito: CROSS_BIKE_Z2_MITO,
  cross_bike_hiit_vo2: CROSS_BIKE_HIIT_VO2,
};
