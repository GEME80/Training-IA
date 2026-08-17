export type MacrocycleCategory = "RACE_TARGET" | "ATHLETE_MOMENT";

export type MacrocycleDistanceType =
  | "42k"
  | "21k"
  | "10k"
  | "5k"
  | "cycling_fondo"
  | "triathlon_703"
  | "triathlon_1406"
  | "maintenance"
  | "base_building"
  | "post_race_recovery"
  | "injury_rehab"
  | "custom";

export interface MacrocycleDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: MacrocycleCategory;
  distanceType: MacrocycleDistanceType;
  icon: string; // Emoji o identificador de icono
  badgeColor: string;
  accentColor: string;
  minWeeks: number;
  maxWeeks: number;
  defaultWeeks: number;
  description: string;
  physiologicalFocus: string[];
  keyWorkoutsSummary: string[];
  recommendedFor: string;
  phaseRatios: {
    base: number; // Porcentaje relativo (ej. 0.30)
    build: number; // Porcentaje relativo (ej. 0.35)
    peak: number; // Porcentaje relativo (ej. 0.20)
    taper: number; // Porcentaje relativo (ej. 0.15)
  };
}

export const MACROCYCLE_LIBRARY: MacrocycleDefinition[] = [
  // ==========================================
  // A. MACROCICLOS POR CARRERA OBJETIVO
  // ==========================================
  {
    id: "marathon-specific",
    title: "Maratón (42.195 km)",
    subtitle: "Preparación Específica para Maratón de Asfalto",
    category: "RACE_TARGET",
    distanceType: "42k",
    icon: "🏃‍♂️",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    accentColor: "from-amber-500 to-yellow-600",
    minWeeks: 12,
    maxWeeks: 24,
    defaultWeeks: 16,
    description:
      "Periodización completa orientada a maximizar la economía de carrera (kJ/km), optimización metabólica de oxidación de grasas y durabilidad muscular para ritmos sostenidos al 88-92% Stryd CP.",
    physiologicalFocus: [
      "Economía de carrera y durabilidad miofibrilar",
      "Fondos progresivos de hasta 32-34 km con bloques a potencia objetivo",
      "Umbral anaeróbico funcional y tolerancia al lactato",
      "Tapering de 3 semanas para supercompensación de glucógeno y TSB positivo",
    ],
    keyWorkoutsSummary: [
      "Tiradas dominicales con bloques de 3x5km a 80-84% Stryd CP",
      "Series de umbral Z4 (4x2000m o 4x8m @ 98-102% CP)",
      "Cuestas de neurofuerza y reactividad tendinosa de sóleo",
      "Fondos de ciclismo Z2 sin impacto para volumen mitocondrial",
    ],
    recommendedFor: "Corredores que preparan maratón oficial con objetivo de marca o finalización sólida.",
    phaseRatios: {
      base: 0.25,
      build: 0.40,
      peak: 0.20,
      taper: 0.15,
    },
  },
  {
    id: "half-marathon-specific",
    title: "Media Maratón (21.097 km)",
    subtitle: "Velocidad Sostenida & Umbral de Lactato",
    category: "RACE_TARGET",
    distanceType: "21k",
    icon: "⚡",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accentColor: "from-emerald-500 to-teal-600",
    minWeeks: 10,
    maxWeeks: 18,
    defaultWeeks: 12,
    description:
      "Plan enfocado en elevar la velocidad de crucero en el umbral de lactato (Z4, 93-97% Stryd CP), combinando fondos de hasta 20-22 km y series de alta densidad.",
    physiologicalFocus: [
      "Potencia en umbral funcional de lactato (FTP/CP)",
      "Capacidad de sostener ritmos rápidos con fatiga acumulada",
      "Tiradas largas de hasta 22 km con ritmos progresivos",
      "Puesta a punto precisa de 2 semanas de descarga",
    ],
    keyWorkoutsSummary: [
      "Tempo en bloque continuo: 35m @ 92-95% Stryd CP",
      "Intervalos de umbral: 5x 1.500m @ 96-100% CP con 2m de recuperación",
      "Tiradas de 18-21 km con últimos 5 km a ritmo objetivo",
      "Trabajo de potencia reactiva y pliometría de gemelo/sóleo",
    ],
    recommendedFor: "Corredores que buscan romper su marca personal en 21K o construir velocidad pre-maratón.",
    phaseRatios: {
      base: 0.30,
      build: 0.45,
      peak: 0.15,
      taper: 0.10,
    },
  },
  {
    id: "10k-specific",
    title: "10K Ruta / Pista",
    subtitle: "Consumo Máximo de Oxígeno (VO2max) & Ritmo Umbral",
    category: "RACE_TARGET",
    distanceType: "10k",
    icon: "🔥",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    accentColor: "from-orange-500 to-red-600",
    minWeeks: 8,
    maxWeeks: 16,
    defaultWeeks: 10,
    description:
      "Entrenamiento de alta intensidad enfocado en la potencia aeróbica máxima (VO2max), zancada eficiente y tolerancia al lactato por encima del 100% Stryd CP.",
    physiologicalFocus: [
      "Potencia aeróbica máxima (VO2max Z5)",
      "Tolerancia al lactato e hiperacidez muscular",
      "Economía de zancada a ritmos submáximos",
      "Tapering corto de 10-14 días con alta especificidad",
    ],
    keyWorkoutsSummary: [
      "Intervalos VO2max: 6x 1000m @ 102-106% Stryd CP",
      "Series de umbral: 3x 3000m @ 97-100% Stryd CP",
      "Tiradas de 14-16 km con cambios de ritmo",
      "Entrenamientos cruzados en bicicleta con intervalos Sweetspot",
    ],
    recommendedFor: "Corredores que desean ganar punta de velocidad y potencia cardiovascular.",
    phaseRatios: {
      base: 0.30,
      build: 0.40,
      peak: 0.20,
      taper: 0.10,
    },
  },
  {
    id: "5k-specific",
    title: "5K Velocidad & Potencia Crítica",
    subtitle: "Capacidad Glucolítica & Zancada Neuromuscular",
    category: "RACE_TARGET",
    distanceType: "5k",
    icon: "🚀",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    accentColor: "from-red-500 to-rose-600",
    minWeeks: 6,
    maxWeeks: 12,
    defaultWeeks: 8,
    description:
      "Plan explosivo para correr al 105-110% de la Potencia Crítica Stryd. Énfasis en potencia neuromuscular, cuestas cortas y resistencia al ácido láctico.",
    physiologicalFocus: [
      "VAM (Velocidad Aeróbica Máxima) y potencia anaeróbica",
      "Reclutamiento rápido de fibras tipo IIa",
      "Cadencia alta y rigidez reactiva del tendón de Aquiles",
      "Tapering corto de 7-10 días",
    ],
    keyWorkoutsSummary: [
      "Cuestas cortas de aceleración: 8x 30s @ 115% Stryd CP",
      "Series cortas: 10x 400m @ 108-112% CP con 1m rec",
      "Tempo corto fraccionado: 2x 2km @ 102% CP",
      "Tiradas de 10-12 km con rectas en progresión",
    ],
    recommendedFor: "Corredores que buscan agilidad, velocidad pura y reactividad biomecánica.",
    phaseRatios: {
      base: 0.25,
      build: 0.45,
      peak: 0.20,
      taper: 0.10,
    },
  },
  {
    id: "cycling-gran-fondo",
    title: "Gran Fondo Ciclismo",
    subtitle: "Resistencia Aeróbica & Densidad de Potencia (Sweetspot)",
    category: "RACE_TARGET",
    distanceType: "cycling_fondo",
    icon: "🚴‍♂️",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    accentColor: "from-cyan-500 to-blue-600",
    minWeeks: 8,
    maxWeeks: 18,
    defaultWeeks: 12,
    description:
      "Periodización para marchas cicloturistas o pruebas de gran fondo (100-180 km). Enfoque en horas sobre la bicicleta, densidad en Sweetspot (85-92% FTP Bike) y eficiencia metabólica.",
    physiologicalFocus: [
      "Potencia en el umbral funcional ciclista (FTP en Vatios)",
      "Capacidad de resistencia muscular en puertos y desniveles",
      "Fondos de fin de semana de 3 a 5 horas",
      "Trabajo de cadencia eficiente y gestión de nutrición intra-sesión",
    ],
    keyWorkoutsSummary: [
      "Sweetspot en subida: 3x 15m @ 88-92% Bike FTP",
      "Fondo de resistencia: 3h30m - 4h30m Z2 (60-70% FTP)",
      "Series de fuerza submáxima en cadencia baja (55-60 rpm)",
      "Rodajes regenerativos de descarga muscular en Z1",
    ],
    recommendedFor: "Ciclistas que preparan retos de media y larga distancia en carretera o gravel.",
    phaseRatios: {
      base: 0.35,
      build: 0.40,
      peak: 0.15,
      taper: 0.10,
    },
  },
  {
    id: "triathlon-703-specific",
    title: "Triatlón Media Distancia (70.3)",
    subtitle: "Periodización Concurrente Multi-Deporte",
    category: "RACE_TARGET",
    distanceType: "triathlon_703",
    icon: "🏊🚴🏃",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    accentColor: "from-indigo-500 to-purple-600",
    minWeeks: 12,
    maxWeeks: 20,
    defaultWeeks: 16,
    description:
      "Distribución de carga multi-disciplina optimizada para evitar interferencia neuromuscular. Énfasis en ciclismo Sweetspot y carrera progresiva tras fatiga (transiciones Brick).",
    physiologicalFocus: [
      "Economía de carrera tras segmento ciclista exigente",
      "Umbrales aeróbicos estables en natación, ciclismo y carrera",
      "Transiciones Brick (Ciclismo + Carrera a ritmo 70.3)",
      "Periodización 3:1 estricta para gestión de fatiga sistémica",
    ],
    keyWorkoutsSummary: [
      "Brick: 2h30m Ciclismo Z2/Z3 + 30m Carrera @ 86% Stryd CP",
      "Series ciclistas Sweetspot: 4x 10m @ 88% Bike FTP",
      "Tiradas dominicales de 16-19 km controladas",
      "Sesiones de fuerza para prevención de sobrecargas lumbares y rotadores",
    ],
    recommendedFor: "Triatletas que buscan un rendimiento consistente y seguro en pruebas Ironman 70.3.",
    phaseRatios: {
      base: 0.30,
      build: 0.40,
      peak: 0.20,
      taper: 0.10,
    },
  },

  // ==========================================
  // B. MACROCICLOS POR MOMENTO DEL ATLETA
  // ==========================================
  {
    id: "adaptive-maintenance",
    title: "Mantenimiento Adaptativo & Salud Articular",
    subtitle: "Preservación de Fitness (CTL) & Cero Fatiga Crónica",
    category: "ATHLETE_MOMENT",
    distanceType: "maintenance",
    icon: "🧘‍♂️",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accentColor: "from-blue-500 to-indigo-600",
    minWeeks: 4,
    maxWeeks: 16,
    defaultWeeks: 8,
    description:
      "Diseñado para períodos entre temporadas o sin competición a la vista. Mantiene la densidad mitocondrial, el tono muscular y la salud de tendones (sóleo y Aquiles) con TSB neutro (-5 a +5).",
    physiologicalFocus: [
      "Mantenimiento de Fitness (CTL estable entre 60 y 75)",
      "Preservación de la potencia de carrera con 1 sesión de calidad corta/semana",
      "Volumen controlado sin generar fatiga residual ni sobrecarga articular",
      "Tiradas largas limitadas a 50-55 minutos",
    ],
    keyWorkoutsSummary: [
      "Rodajes aeróbicos suaves Z2 (45-50m) con 4-5 rectas reactivas",
      "Ciclismo indoor/outdoor Z2 para estímulo cardiovascular no impactante",
      "Fuerza de sóleo, cadena posterior y estabilidad de core",
      "Microciclos 3:1 con descargas cada cuarta semana",
    ],
    recommendedFor: "Atletas que no tienen carreras próximas y quieren mantenerse en forma óptima y sin lesiones.",
    phaseRatios: {
      base: 0.70,
      build: 0.30,
      peak: 0.0,
      taper: 0.0,
    },
  },
  {
    id: "base-building-gpp",
    title: "Construcción de Base Pura (GPP)",
    subtitle: "Capilarización, Volumen Aeróbico & Adaptación Estructural",
    category: "ATHLETE_MOMENT",
    distanceType: "base_building",
    icon: "🧱",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    accentColor: "from-teal-500 to-emerald-600",
    minWeeks: 6,
    maxWeeks: 14,
    defaultWeeks: 10,
    description:
      "Preparación General (GPP) enfocada en aumentar el volumen mitocondrial, la capilarización periférica y la fortaleza de tejidos conectivos antes de entrar en entrenamientos de alta intensidad.",
    physiologicalFocus: [
      "Aumento gradual del volumen total semanal (Ramp Rate de +3 a +5 CTL)",
      "Predominio de zonas de baja intensidad (Z1-Z2 polarizado)",
      "Fortalecimiento estructural de ligamentos, tendones y sóleo",
      "Cuestas cortas de neurofuerza para potenciar zancada",
    ],
    keyWorkoutsSummary: [
      "Rodajes en zona 2 pura con control de pulsaciones y potencia",
      "Fondos de fin de semana en progresión controlada (60m a 80m)",
      "Cuestas cortas (6x 45s @ 96% CP) con bajada caminando",
      "Fuerza funcional pesada con énfasis en cadena posterior",
    ],
    recommendedFor: "Atletas que inician pretemporada o vienen de un parón y quieren crear una base sólida.",
    phaseRatios: {
      base: 0.65,
      build: 0.35,
      peak: 0.0,
      taper: 0.0,
    },
  },
  {
    id: "post-race-recovery",
    title: "Recuperación Post-Competición (Deload)",
    subtitle: "Regeneración Miofibrilar & Balance Neurovegetativo",
    category: "ATHLETE_MOMENT",
    distanceType: "post_race_recovery",
    icon: "🌱",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    accentColor: "from-purple-500 to-pink-600",
    minWeeks: 2,
    maxWeeks: 6,
    defaultWeeks: 3,
    description:
      "Bloque de descarga y reparación tras un maratón o prueba exigente. Permite la recuperación del daño muscular microscópico, estabiliza el HRV y refresca el estado anímico y hormonal.",
    physiologicalFocus: [
      "Eliminación de la fatiga aguda residual (elevar TSB a zona positiva)",
      "Cero impacto osteoarticular durante los primeros 7-10 días",
      "Regeneración celular a través de ciclismo suave, movilidad y descanso",
      "Reintroducción progresiva del trote suave en la fase final",
    ],
    keyWorkoutsSummary: [
      "Descanso pasivo total y paseos activos",
      "Ciclismo regenerativo suave (30-40m @ 45-50% FTP)",
      "Sesiones de movilidad articular y liberación miofascial",
      "Trote suave de 25-35 minutos en Z1 al final del ciclo",
    ],
    recommendedFor: "Atletas que acaban de finalizar un maratón, medio maratón o gran fondo.",
    phaseRatios: {
      base: 1.0,
      build: 0.0,
      peak: 0.0,
      taper: 0.0,
    },
  },
  {
    id: "injury-rehab-return",
    title: "Retorno Progresivo / Reacondicionamiento",
    subtitle: "Carga Mecánica Controlada & Prevención de Recaídas",
    category: "ATHLETE_MOMENT",
    distanceType: "injury_rehab",
    icon: "🩹",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    accentColor: "from-rose-500 to-red-600",
    minWeeks: 4,
    maxWeeks: 12,
    defaultWeeks: 6,
    description:
      "Protocolo de regreso progresivo tras molestias musculares, tendinopatías de Aquiles o sobrecargas en sóleo. Utiliza intervalos de caminar-correr (Caco) y trabajo cruzado no impactante.",
    physiologicalFocus: [
      "Incremento de carga mecánica articular inferior al 10% semanal",
      "Uso de CaCo (Caminar-Correr) para reeducar la absorción de impactos",
      "Fuerza isométrica y excéntrica para tendones",
      "Ciclismo continuo para mantener el fitness aeróbico",
    ],
    keyWorkoutsSummary: [
      "CaCo: 5x (3m trote suave Z1 + 2m caminar)",
      "Ciclismo Z2 suave para sostener capacidad cardiovascular",
      "Trabajo excéntrico de gemelo y sóleo en escalón",
      "Test continuo de reactividad y ausencia de dolor post-impacto",
    ],
    recommendedFor: "Atletas que vuelven tras molestias, sobrecargas o períodos de inactividad médica.",
    phaseRatios: {
      base: 0.80,
      build: 0.20,
      peak: 0.0,
      taper: 0.0,
    },
  },
];

/**
 * Busca una plantilla de macrociclo por su ID.
 */
export function getMacrocycleDefinitionById(id: string): MacrocycleDefinition | undefined {
  return MACROCYCLE_LIBRARY.find((m) => m.id === id);
}

/**
 * Busca una plantilla de macrociclo sugerida por tipo de distancia.
 */
export function getMacrocycleDefinitionByDistance(distance: MacrocycleDistanceType): MacrocycleDefinition {
  const match = MACROCYCLE_LIBRARY.find((m) => m.distanceType === distance);
  return match || MACROCYCLE_LIBRARY[0];
}
