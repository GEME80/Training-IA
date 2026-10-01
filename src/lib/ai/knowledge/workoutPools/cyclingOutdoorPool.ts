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

export const ALL_CYCLING_OUTDOOR_WORKOUTS = [
  BIKE_OUTDOOR_REPECHOS_LIBRES,
  BIKE_OUTDOOR_CADENCIA_FLUIDEZ,
  BIKE_OUTDOOR_FAST_FINISH,
  BIKE_OUTDOOR_ASIMILACION_SOCIAL,
  BIKE_OUTDOOR_GRAN_FONDO_MONTAÑA,
];
