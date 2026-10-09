/**
 * 🚴 Catálogo de Fondos de Ciclismo Outdoor de Fin de Semana (Libres con Misión Fisiológica)
 * Diseñados para adaptarse a la orografía y terreno exterior del atleta sin atarlo a vatios rígidos de rodillo.
 */

import { CyclingWorkoutItem } from "./cyclingIntervalPool";

export const BIKE_OUTDOOR_REPECHOS_LIBRES: CyclingWorkoutItem = {
  name: "Fondo Libre Outdoor con Repechos en Subida (2h30m)",
  powerTarget: "Z2 Libre (60-72% FTP) + 3-5 Repechos Libres (85-95% FTP)",
  justification: "Salida outdoor libre de resistencia aeróbica en terreno ondulado. En cada subida o repecho natural, acelerar a ritmo vivo según sensaciones.",
  workoutDoc: `Calentamiento & Salida
- 20m 55-65% FTP Rodaje progresivo hacia ruta abierta

Bloque Principal (Fondo Libre con Misión en Subidas)
- 1h50m Zona 2 Libre (60-75% FTP)
- Misión: Subir de 3 a 5 repechos o cotas del recorrido de forma libre y ágil (85-95% FTP)
- En llano y bajadas: Mantener pedaleo fluido sin esfuerzos agónicos

Vuelta a Casa & Enfriamiento
- 20m 50-60% FTP Pedaleo suave de soltura`,
  durationMin: 150,
};

export const BIKE_OUTDOOR_CADENCIA_FLUIDEZ: CyclingWorkoutItem = {
  name: "Fondo Libre Outdoor de Cadencia & Fluidez (2h30m)",
  powerTarget: "Z2 Continuo (65-72% FTP) @ 88-98 rpm",
  justification: "Mejora la coordinación neuromuscular y la economía de pedaleo en carretera abierta evitando trancar desarrollos pesados.",
  workoutDoc: `Calentamiento Inicial
- 20m 55% FTP Enfoque en cadencia ágil y soltura

Bloque de Resistencia Fluida
- 1h50m 65-72% FTP
- Misión: Mantener cadencia sostenida entre 88 y 98 rpm tanto en plano como en falsos llanos
- Control nutricional: Beber 500-750ml/hora y consumir 50-60g carbohidratos/hora

Enfriamiento
- 20m 50% FTP Rodaje regenerativo final`,
  durationMin: 150,
};

export const BIKE_OUTDOOR_FAST_FINISH: CyclingWorkoutItem = {
  name: "Fondo Libre con Final Progresivo Fast-Finish (2h45m)",
  powerTarget: "Z2 Base (65-72% FTP) + Final Progresivo Z3 (80-88% FTP)",
  justification: "Simula las exigencias de un gran fondo o marcha cicloturista enseñando a producir vatios eficaces con fatiga glucogénica previa.",
  workoutDoc: `Calentamiento & Enlace
- 20m 55-65% FTP Rodaje suave

Bloque Aeróbico Base
- 1h45m 68% FTP Zona 2 cómoda y controlada en grupo o solitario

Misión Fast-Finish
- 30m 80-88% FTP Progresión viva de ritmo en los últimos kilómetros de regreso

Enfriamiento
- 10m 50% FTP Soltura de piernas a 95 rpm`,
  durationMin: 165,
};

export const BIKE_OUTDOOR_ASIMILACION_SOCIAL: CyclingWorkoutItem = {
  name: "Fondo Puro de Asimilación & Resistencia Z2 (2h15m)",
  powerTarget: "60-70% FTP (Zona 2 Pura y Cómoda)",
  justification: "Volumen cardiovascular de base sin acumulación de fatiga central ni picos de lactato, ideal para semanas de descarga o fondos grupales.",
  workoutDoc: `Salida Libre
- 15m 55% FTP Adaptación progresiva

Fondo Continuo Z2
- 1h50m 65% FTP Conversacional y cómodo, sin apretar en repechos
- Foco en respiración nasal o ritmo charlado, hidratación constante

Regreso
- 10m 50% FTP Vuelta a la calma`,
  durationMin: 135,
};

export const BIKE_OUTDOOR_GRAN_FONDO_MONTAÑA: CyclingWorkoutItem = {
  name: "Fondo de Montaña & Puertos Libres (3h30m)",
  powerTarget: "Z2 en Valle (65% FTP) + Ritmo de Ascensión Libre (80-90% FTP)",
  justification: "Preparación específica de resistencia a la fatiga en ascensiones largas para pruebas de desnivel y marchas cicloturistas.",
  workoutDoc: `Aproximación
- 25m 60% FTP Rodaje suave hacia los puertos

Sector de Montaña
- 2h45m Fondo con ascensiones continuas
- Misión: Ascender puertos a ritmo constante (80-90% FTP) regulando esfuerzo según pendiente
- En descensos: Trazada limpia y recuperación activa con pedaleo suave

Retorno
- 20m 50% FTP Enfriamiento progresivo`,
  durationMin: 210,
};

export const BIKE_OUTDOOR_TEMPO_FALSOS_LLANOS: CyclingWorkoutItem = {
  name: "Fondo Outdoor con Bloques de Tempo en Falsos Llanos (2h45m)",
  powerTarget: "Z2 Base (65% FTP) + 3x 15m Tempo (78-84% FTP)",
  justification: "Aumenta la velocidad media y la capacidad aeróbica en terrenos rápidos o falsos llanos sin degradar la resistencia de fondo.",
  workoutDoc: `Aproximación & Calentamiento
- 20m 55-65% FTP Rodaje progresivo hacia carretera abierta

Fondo con Bloques de Tempo
- 1h15m 65% FTP Zona 2 fluida
3x
- 15m 78-84% FTP Mantener ritmo vivo en falsos llanos o tramos rodadores
- 5m 60% FTP Retorno a Z2 cómoda

Vuelta & Soltura
- 15m 50-55% FTP Pedaleo ligero a 95 rpm`,
  durationMin: 165,
};

export const BIKE_OUTDOOR_ESCALADA_TORQUE: CyclingWorkoutItem = {
  name: "Fondo de Puertos con Escalada a Baja Cadencia (3h00m)",
  powerTarget: "Z2 Rodaje (65% FTP) + 4x 8m en Cota a 55-60 rpm (82-88% FTP)",
  justification: "Entrena el torque muscular específico en carretera real para superar rampas duras sin disparar la frecuencia cardíaca.",
  workoutDoc: `Salida & Aproximación
- 25m 60% FTP Activación y búsqueda de terreno quebrado

Circuito de Escalada & Torque
- 2h10m Fondo mixto
- Misión: En cada puerto o cota (4 repeticiones de 8 min), meter desarrollo y subir a 55-60 rpm sentado @ 82-88% FTP
- En coronar: Pasar a plato ágil y rodar a 90 rpm

Retorno Suave
- 25m 50% FTP Rodaje regenerativo final`,
  durationMin: 180,
};

export const BIKE_OUTDOOR_POLARIZADO_Z2_ESTRICTO: CyclingWorkoutItem = {
  name: "Fondo Polarizado Z2 Puro & Control Metabólico (3h15m)",
  powerTarget: "Zona 2 Estricta (62-68% FTP continua)",
  justification: "Estimula la máxima lipólisis y la densidad mitocondrial de fibras tipo I evitando cualquier incursión en umbral glucolítico.",
  workoutDoc: `Salida & Enlace
- 20m 55% FTP Progresión a ritmo crucero

Bloque Polarizado Z2 Estricto
- 2h40m 62-68% FTP
- Regla de oro: No superar 70% FTP en ninguna subida; usar desarrollos suaves
- Nutrición: 60g carbohidratos/hora y 500-750ml electrolitos/hora

Llegada
- 15m 50% FTP Pedaleo regenerativo final`,
  durationMin: 195,
};

export const BIKE_OUTDOOR_FARTLEK_TERRENO: CyclingWorkoutItem = {
  name: "Fondo Fartlek Ondulado Libre de Sensaciones (2h30m)",
  powerTarget: "Ritmo libre adaptado a la orografía (65-90% FTP)",
  justification: "Aprovecha la orografía natural del recorrido para alternar ritmos vivos en repechos y descanso en bajadas, mejorando la lectura de carrera.",
  workoutDoc: `Salida Progresiva
- 20m 55-65% FTP Salida de la ciudad

Fartlek Natural en Terreno Ondulado
- 1h55m Ritmo según terreno:
  * Subidas cortas: Acelerar de pie o sentado a ritmo ágil (85-95% FTP)
  * Planos: Rodar fluido en Zona 2 (65-72% FTP)
  * Bajadas: Descanso de piernas y trazada limpia

Enfriamiento
- 15m 50% FTP Soltura final`,
  durationMin: 150,
};

export const BIKE_OUTDOOR_SIMULACION_MARCHA: CyclingWorkoutItem = {
  name: "Simulación de Marcha Cicloturista / Gran Fondo (3h45m)",
  powerTarget: "72-78% FTP constante con avituallamiento programado",
  justification: "Ensayo general de ritmo de competición de larga distancia, control de hidratación (600ml/h) y carbohidratos (60-80g/h).",
  workoutDoc: `Salida de Simulación
- 20m 60% FTP Calentamiento en ruta

Simulación de Ritmo Competitivo
- 3h10m 72-78% FTP sostenido
- Incluye 2 pasos por subidas largas a 85-90% FTP
- Pautas de avituallamiento cada 40 min

Retorno
- 15m 50% FTP Vuelta a la calma`,
  durationMin: 225,
};

export const BIKE_OUTDOOR_REGENERATIVO_CAFE: CyclingWorkoutItem = {
  name: "Rodaje Regenerativo Suave & Soltura de Piernas (1h30m)",
  powerTarget: "Zona 1-2 Muy Suave (50-60% FTP) @ 92-100 rpm",
  justification: "Oxigenación muscular y lavado metabólico sin fatiga, ideal para semanas de descarga o post-competición.",
  workoutDoc: `Salida Regenerativa
- 15m 50% FTP Rodaje muy fácil

Soltura Continua de Piernas
- 1h05m 55-60% FTP (92-100 rpm)
- Terreno plano, sin forzar nunca el desarrollo

Regreso
- 10m 45% FTP Vuelta a la calma`,
  durationMin: 90,
};

export const ALL_CYCLING_OUTDOOR_WORKOUTS = [
  BIKE_OUTDOOR_REPECHOS_LIBRES,
  BIKE_OUTDOOR_CADENCIA_FLUIDEZ,
  BIKE_OUTDOOR_FAST_FINISH,
  BIKE_OUTDOOR_ASIMILACION_SOCIAL,
  BIKE_OUTDOOR_GRAN_FONDO_MONTAÑA,
  BIKE_OUTDOOR_TEMPO_FALSOS_LLANOS,
  BIKE_OUTDOOR_ESCALADA_TORQUE,
  BIKE_OUTDOOR_POLARIZADO_Z2_ESTRICTO,
  BIKE_OUTDOOR_FARTLEK_TERRENO,
  BIKE_OUTDOOR_SIMULACION_MARCHA,
  BIKE_OUTDOOR_REGENERATIVO_CAFE,
];
