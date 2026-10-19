export type CoachId = 'canova' | 'seiler' | 'coggan' | 'daniels';

export interface CoachMethodology {
  id: CoachId;
  name: string;
  roleTitle: string;
  tabSubtitle: string;
  avatarUrl: string;
  quote: string;
  badgeLabel: string;
  headline: string;
  description: string;
  bullets: string[];
  modalBio: {
    credentials: string;
    scientificBasis: string;
    pulseAiImplementation: string;
  };
}

export const COACHES_SCIENCE_DATA: CoachMethodology[] = [
  {
    id: 'canova',
    name: 'Renato Canova',
    roleTitle: 'Entrenador Olímpico de Fondo y Maratón',
    tabSubtitle: 'Tope Seguro de 3 Horas',
    avatarUrl: '/images/coaches/renato-canova.jpg',
    quote: 'El maratón no es sumar kilómetros vacíos; es desarrollar la resistencia a la velocidad específica de competición sin agotamiento glucogénico.',
    badgeLabel: 'PRINCIPIO BIOMECÁNICO ACTIVO',
    headline: 'Periodización Específica y Tope Biomecánico de 3 Horas',
    description: 'Aplica el principio de especificidad de Canova: las tiradas largas dominicales se corren a ritmo objetivo de carrera, blindando la integridad articular con un límite temporal estricto.',
    bullets: [
      'Cap Inviolable de 3 Horas: Bloqueo algorítmico en fondos para evitar la degradación neuromuscular irreversible en sóleos, rodillas y tendón de Aquiles.',
      'Bloques a Ritmo Maratón: Estímulos progresivos al 95%-102% del ritmo objetivo para acostumbrar al cuerpo al consumo eficiente de grasas a ritmo de carrera.',
      'Periodización 3:1: Bloques de 3 semanas de estímulo seguidas de 1 semana de descarga biológica para asimilar la carga de entrenamiento.'
    ],
    modalBio: {
      credentials: 'Ha dirigido las carreras de más de 40 campeones mundiales y plusmarquistas de maratón y fondo (Kenenisa Bekele, Wilson Kipsang, Florence Kiplagat).',
      scientificBasis: 'Rechaza el volumen basura. Su modelo demuestra que superar las 3 horas de carrera continua genera daño ultraestructural en el tejido muscular que requiere semanas de regeneración, arruinando el pico de forma.',
      pulseAiImplementation: 'PULSE ENDURANCE impone un límite matemático absoluto de 3 horas en todas las tiradas dominicales de maratón y programa los bloques a velocidad de carrera con progresión de vatios específica.'
    }
  },
  {
    id: 'seiler',
    name: 'Dr. Stephen Seiler',
    roleTitle: 'Investigador Científico de Deportes de Resistencia',
    tabSubtitle: 'Entrenamiento Polarizado (80/20)',
    avatarUrl: '/images/coaches/stephen-seiler.jpg',
    quote: 'El 80% del volumen debe ser verdaderamente fácil para que el 20% restante pueda ser ejecutado con máxima calidad e intensidad biológica.',
    badgeLabel: 'DISTRIBUCIÓN FISIOLÓGICA ACTIVA',
    headline: 'Entrenamiento Polarizado 80/20: Calidad sobre Agotamiento',
    description: 'Demostró empíricamente que los atletas olímpicos de resistencia evitan las zonas medias de fatiga vacía: el 80% de su tiempo construyen base mitocondrial y el 20% atacan la alta intensidad.',
    bullets: [
      'Rodajes Conversacionales Reales: El 80% de tus kilómetros se programan en Zona 1 y 2 pura para maximizar la capilarización y la densidad mitocondrial.',
      'Cero Fatiga Residual: Elimina los rodajes en la "zona gris" que cansan sin aportar adaptaciones clave, protegiendo tus piernas del sobreentrenamiento.',
      'Máxima Potencia en Días Clave: Al llegar con frescura a los días de series, puedes ejecutar el 20% de alta intensidad en los ritmos y vatios exactos exigidos.'
    ],
    modalBio: {
      credentials: 'Catedrático de ciencias del deporte en la Universidad de Agder (Noruega). Es el referente académico mundial en distribución de la intensidad de entrenamiento.',
      scientificBasis: 'Su investigación demostró que los entrenamientos continuos en intensidad moderada generan alta fatiga autonómica simpática sin beneficios mitocondriales adicionales frente al trote regenerativo en Z1/Z2.',
      pulseAiImplementation: 'PULSE ENDURANCE audita el balance semanal para garantizar que el 80% del volumen se mantenga estrictamente por debajo de tu primer umbral ventilatorio (VT1), protegiendo tu sistema nervioso central.'
    }
  },
  {
    id: 'coggan',
    name: 'Dr. Andrew Coggan',
    roleTitle: 'Fisiólogo del Ejercicio y Creador del FTP & TSS',
    tabSubtitle: 'Entrenamiento por Vatios (FTP & Stryd CP)',
    avatarUrl: '/images/coaches/andrew-coggan.jpg',
    quote: 'La potencia en vatios es la única métrica honesta e inmune al calor, fatiga acumulada o factores externos.',
    badgeLabel: 'INSTRUMENTACIÓN DE PRECISIÓN',
    headline: 'Potencia Muscular (FTP / Stryd CP) y Medición del Esfuerzo Real',
    description: 'Las pulsaciones cardíacas sufren desfase por calor, estrés o cafeína. Entrenar por potencia mide el trabajo muscular exacto tanto en ciclismo como en carrera a pie.',
    bullets: [
      'Prescripción en Vatios Exactos: Integración nativa con STRYD Running Power (Critical Power) y potenciómetros de ciclismo (FTP).',
      'Cálculo Matemático de Carga (TSS): Cada entrenamiento cuantifica el estrés metabólico real para alimentar tu curva de forma y fatiga.',
      'Esfuerzo Constante en Pendiente: Mantén la potencia calculada en subidas o con viento en contra, protegiendo tu corazón de sobreesfuerzos innecesarios.'
    ],
    modalBio: {
      credentials: 'Coautor de "Training and Racing with a Power Meter". Es el creador de las métricas que rigen el ciclismo profesional moderno (FTP, NP, TSS e IF).',
      scientificBasis: 'Reemplazó la frecuencia cardíaca como métrica primaria por el trabajo mecánico en vatios, resolviendo el problema de la deriva cardíaca térmica y el retardo en series cortas.',
      pulseAiImplementation: 'PULSE ENDURANCE calcula tus zonas de potencia funcional y traduce cada serie en vatios objetivos que viajan directamente a tu reloj Garmin, Coros o ciclocomputador Wahoo.'
    }
  },
  {
    id: 'daniels',
    name: 'Dr. Jack Daniels',
    roleTitle: 'Fisiólogo Olímpico y Autor de Daniels\' Running Formula',
    tabSubtitle: 'Ritmos de Carrera (Fórmula VDOT)',
    avatarUrl: '/images/coaches/jack-daniels.jpg',
    quote: 'Entrena al menor costo fisiológico posible para lograr la máxima adaptación biológica requerida.',
    badgeLabel: 'PRINCIPIO DE ENTRENAMIENTO ACTIVO',
    headline: 'Fórmula VDOT: Ritmos Exactos por Segundo para tu Nivel',
    description: 'El Dr. Jack Daniels creó la fórmula VDOT (Índice de Capacidad de Oxígeno y Rendimiento), que calcula los ritmos precisos para cada tipo de entrenamiento según tu marca real en competencia.',
    bullets: [
      'Ritmos Personalizados para Cada Sesión: Prescripción exacta para suave (recuperación), maratón (fondo), umbral (resistencia) e intervalos (velocidad).',
      'Entrenamiento Eficiente del Umbral: Mejora la capacidad del cuerpo para tolerar ritmos rápidos por más tiempo sin acumular fatiga excesiva.',
      'Mayor Velocidad con Menos Cansancio: Series fraccionadas diseñadas para mejorar la economía de carrera consumiendo menos energía.'
    ],
    modalBio: {
      credentials: 'Dos veces medallista olímpico y doctor en fisiología. Calificado por Runner\'s World como "el mejor entrenador de carrera del mundo".',
      scientificBasis: 'Demostró la correlación exacta entre el consumo de oxígeno (VO2máx) y la economía de carrera (costo de O2 por metro recorrido) para determinar ritmos metabólicos óptimos.',
      pulseAiImplementation: 'PULSE ENDURANCE recalcula tu tabla VDOT tras cada test de campo (3K/5K/10K) y programa tus series fraccionadas con ritmos por kilómetro exactos al segundo.'
    }
  }
];
