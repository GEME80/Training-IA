/**
 * 🏋️ Catálogo de Fortalecimiento Estructurado en Tríada Anatómica (S&C)
 * Gobernanza científica: Brad Schoenfeld, Peter Attia, Frans Bosch y Tim Gabbett.
 * Estructura obligatoria en cada sesión:
 * 1. Tren Inferior & Reactividad de Tobillo/Sóleo (LSS).
 * 2. Tren Superior, Postura & Estabilidad Escapular.
 * 3. Core Tridimensional Anti-Movimiento.
 */

export interface StrengthTriadWorkoutItem {
  name: string;
  focus: string;
  durationMin: number;
  tss: number;
  justification: string;
  workoutDoc: string;
}

export const STRENGTH_TRIAD_1_SOLEUS_SCAPULA_ROTATION: StrengthTriadWorkoutItem = {
  name: "Tríada S&C 1: Reactividad de Sóleo + Estabilidad Escapular + Core Anti-Rotación (35m)",
  focus: "Sóleo/Aquiles + Manguito Rotador/Romboides + Core Anti-Rotación",
  durationMin: 35,
  tss: 26,
  justification: "Fortalece el muelle elástico del tobillo (LSS), previene el hombro caído y la cifosis ciclista, y estabiliza la pelvis ante oscilaciones rotacionales.",
  workoutDoc: `Activación Dinámica (5m)
- Movilidad de tobillo contra pared y círculos articulares

Bloque 1: Tren Inferior & Reactividad (3 Rondas)
- 12x Elevación de talón sentado con carga (sóleo excéntrico 3s bajada)
- 12x Pogo hops elásticos sobre metatarso (mínimo contacto de suelo)
- 10x Peso muerto rumano unipodal por pierna

Bloque 2: Tren Superior & Postura (3 Rondas)
- 12x Face-pulls con banda elástica (enfoque romboides y deltoides posterior)
- 10x 'Y-T-W' prono en suelo para trapecio medio e inferior
- 12x Rotaciones externas de manguito con banda pegada al codo

Bloque 3: Core Tridimensional Anti-Rotación (3 Rondas)
- 12x Press Pallof con banda isométrica (pausa 3s)
- 30s Paseo de maleta unilateral con mancuerna (anti-flexión lateral)
- 12x Deadbug cruzado con presión rodilla-mano

Enfriamiento (5m)
- Descarga miofascial de sóleo, gemelos y apertura pectoral`,
};

export const STRENGTH_TRIAD_2_POSTERIOR_DORSAL_EXTENSION: StrengthTriadWorkoutItem = {
  name: "Tríada S&C 2: Cadena Posterior Hip Thrust + Remo Dorsal Postural + Core Anti-Extensión (35m)",
  focus: "Glúteo Mayor/Isquios + Dorsal Ancho/Tracción + Core Anti-Extensión",
  durationMin: 35,
  tss: 28,
  justification: "Desarrolla potencia propulsiva en la zancada y pedaleo, fortalece la tracción dorsal para acoples aero y natación, y blinda la zona lumbar.",
  workoutDoc: `Activación & Movilidad (5m)
- Bisagra de cadera con pica y activación glútea con puente

Bloque 1: Tren Inferior & Propulsión (3 Rondas)
- 8x Hip thrust pesado con barra o mancuerna (pausa 2s arriba)
- 10x Puentes de glúteo con talones elevados a una pierna
- 10x Saltos reactivos al cajón/escalón con recepción suave

Bloque 2: Tren Superior & Tracción Dorsal (3 Rondas)
- 10x Remo unilateral con mancuerna apoyado en banco
- 12x Deslizamientos en pared para serrato anterior (Wall slides)
- 12x Tirones al pecho con banda elástica (apertura escapular)

Bloque 3: Core Anti-Extensión & Lumbar (3 Rondas)
- 35s Hollow body hold en suelo
- 10x Rollout abdominal con rueda o fitball
- 10x Bird-dog resistido con minibanda

Enfriamiento (5m)
- Estiramiento miofascial de isquiotibiales y descompresión espinal`,
};

export const STRENGTH_TRIAD_3_BULGARIAN_SERRATUS_PELVIS: StrengthTriadWorkoutItem = {
  name: "Tríada S&C 3: Fuerza Unipodal Búlgara + Prevención de Hombro + Estabilidad Pélvica (35m)",
  focus: "Cuádriceps/Glúteo Medio + Serrato/Escápula + Estabilidad Lumbo-Pélvica",
  durationMin: 35,
  tss: 27,
  justification: "Absorbe fuerzas de impacto asimétricas, protege el espacio subacromial del hombro y erradica el valgo de rodilla en fatiga.",
  workoutDoc: `Calentamiento (5m)
- Movilidad articular de cadera y tobillo dinámica

Bloque 1: Tren Inferior Unipodal (3 Rondas)
- 8x Sentadilla búlgara por pierna con pausa isométrica 2s abajo
- 10x Step-ups con elevación reactiva de rodilla contraria
- 15x Elevaciones de talón unipodales en escalón

Bloque 2: Tren Superior & Hombro Libre (3 Rondas)
- 12x Despegues de escápula en suelo (Scapular push-ups)
- 12x Aperturas de pecho con banda elástica invertida
- 10x Rotación externa de hombro en 90° con banda

Bloque 3: Estabilidad Pélvica & Glúteo Medio (3 Rondas)
- 12x Clamshells con banda de alta resistencia
- 15x Monster walks laterales con banda en tobillos
- 30s Plancha lateral con elevación de pierna en estrella

Enfriamiento (5m)
- Descarga de cuádriceps y piramidal con foam roller`,
};

export const STRENGTH_TRIAD_4_ECCENTRIC_TRAP_TRENDELENBURG: StrengthTriadWorkoutItem = {
  name: "Tríada S&C 4: Excéntrico Cuádriceps (Bajadas) + Tracción Escapular + Anti-Trendelenburg (35m)",
  focus: "Fuerza Excéntrica + Trapecio Medio/Romboides + Glúteo Medio Anti-Trendelenburg",
  durationMin: 35,
  tss: 27,
  justification: "Blindaje muscular contra el daño excéntrico en bajadas y desniveles, postura erguida de torso y marcha sin balanceo de cadera.",
  workoutDoc: `Activación (5m)
- Zancadas suaves y estiramiento activo de flexores de cadera

Bloque 1: Tren Inferior Excéntrico (3 Rondas)
- 8x Sentadilla excéntrica lenta (4s bajada controlada, subida explosiva)
- 8x Zancadas de frenado alternadas con control estricto de rodilla
- 10x Peso muerto rumano a una pierna con mancuerna

Bloque 2: Tren Superior & Cadena Cruzada (3 Rondas)
- 12x Remo cerrado con banda o mancuerna a dos manos
- 12x Retracción escapular colgado de barra o con toalla
- 10x Face-pulls con pausa de 2s en contracción

Bloque 3: Core & Anti-Trendelenburg (3 Rondas)
- 12x Elevación de cadera lateral en banco para glúteo medio profundo
- 30s Paseo del granjero pesado a una mano (Maleta)
- 12x Plancha frontal con toques alternados a hombros contrarios

Enfriamiento (5m)
- Soltura miofascial y respiración diafragmática 360°`,
};

export const STRENGTH_TRIAD_5_REGENERATIVE_MOBILITY_PREHAB: StrengthTriadWorkoutItem = {
  name: "Tríada S&C 5: Movilidad Articular 3D, Descompresión Torácica & Core Restaurativo (25m)",
  focus: "Movilidad Articular + Descompresión Escapular + Activación Refleja",
  durationMin: 25,
  tss: 16,
  justification: "Sesión restaurativa de descarga para semanas de asimilación o tapering. Elimina tensiones miofasciales sin generar fatiga residual.",
  workoutDoc: `Descompresión & Flujo Articular (5m)
- Cat-Cow dinámico, respiración diafragmática y rotaciones torácicas

Bloque 1: Tren Inferior & Cadera 3D (2 Rondas)
- 10x Círculos articulares de cadera en cuadrupedia
- 12x Deslizamientos de tobillo en pared
- 10x Puentes de glúteo suaves con respiración sincrónica

Bloque 2: Tren Superior & Cuello/Torso (2 Rondas)
- 10x Aperturas escapulares en libro abierto de lado
- 12x Deslizamientos de serrato suaves en pared
- 30s Descompresión colgado de barra relajando hombros

Bloque 3: Core Reflejo & Respiratorio (2 Rondas)
- 10x Bird-dog sin carga con control respiratorio
- 25s Plancha prona ligera con apoyo en antebrazos
- 10x Deadbug suave

Cierre (5m)
- Respiración diafragmática 4-7-8 y relajación postural`,
};

export const ALL_STRENGTH_TRIAD_WORKOUTS = [
  STRENGTH_TRIAD_1_SOLEUS_SCAPULA_ROTATION,
  STRENGTH_TRIAD_2_POSTERIOR_DORSAL_EXTENSION,
  STRENGTH_TRIAD_3_BULGARIAN_SERRATUS_PELVIS,
  STRENGTH_TRIAD_4_ECCENTRIC_TRAP_TRENDELENBURG,
  STRENGTH_TRIAD_5_REGENERATIVE_MOBILITY_PREHAB,
];
