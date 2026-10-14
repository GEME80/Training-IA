import React from "react";
import { Shield, Activity, Zap, Timer } from "lucide-react";
import { CoachData } from "./CoachBioModal";

export interface PhysioPillar {
  id: string;
  tabTitle: string;
  coachName: string;
  coachRole: string;
  tabIcon: React.ElementType;
  ruleTitle: string;
  ruleDescription: string;
  bullets: string[];
  coach: CoachData;
}

export const PHYSIO_PILLARS: PhysioPillar[] = [
  {
    id: "canova",
    tabTitle: "Tope Seguro de 3 Horas",
    coachName: "Renato Canova",
    coachRole: "Maratón Olímpico",
    tabIcon: Shield,
    ruleTitle: "Límite Seguro de 3 Horas y Asimilación 3:1",
    ruleDescription:
      "La ciencia demostró que correr más de 3 horas continuas en tus fondos dominicales aumenta drásticamente el riesgo de lesiones y desgaste articular, sin aportar beneficios adicionales de resistencia.",
    bullets: [
      "Límite automático de 3 horas en tiradas largas para proteger tendones, sóleos y rodillas del sobreentrenamiento.",
      "Fondos divididos en bloques fraccionados a tu ritmo objetivo de maratón, enseñándole a tu cuerpo a sostener la velocidad de carrera.",
      "Ciclos 3:1: tres semanas de aumento progresivo de entrenamiento seguidas por una semana de asimilación (descanso activo) para absorber la carga.",
    ],
    coach: {
      id: "canova",
      name: "Renato Canova",
      initials: "RC",
      imageUrl: "/coaches/renato-canova.png",
      title: "Entrenador Olímpico de Maratón (Kenia e Italia)",
      discipline: "Maratón de Élite",
      focus: "Resistencia Específica al Ritmo de Carrera y Límite Seguro de 3 Horas",
      quote:
        "La especificidad a ritmo de carrera supera al volumen vacío. El cuerpo debe aprender a reclutar fibras musculares eficientes cuando ya hay cansancio acumulado.",
      biomechanicalImpact:
        "Eliminó el kilometraje excesivo e innecesario en maratón mundial. Demostró que entrenamientos superiores a 3 horas generan microlesiones irreversibles, priorizando bloques fraccionados a tu ritmo real de competencia.",
      pulseApplication:
        "Límite automático de 3 horas en tus fondos dominicales y cálculo de series fraccionadas a tu ritmo objetivo de maratón según tu potencia y nivel actual.",
    },
  },
  {
    id: "banister",
    tabTitle: "Recuperación Diaria (HRV)",
    coachName: "Dr. Stephen Seiler",
    coachRole: "Modelo Polarizado & Recuperación",
    tabIcon: Activity,
    ruleTitle: "Variabilidad Cardíaca (HRV) y Equilibrio 80/20",
    ruleDescription:
      "Tu cuerpo avisa antes que la mente. Al medir tu HRV (Variabilidad de la Frecuencia Cardíaca) al despertar, PULSE AI detecta si estás recuperado o fatigado y ajusta la sesión del día.",
    bullets: [
      "Lectura matutina de HRV (Variabilidad Cardíaca) que mide tu nivel real de descanso biológico antes de que salgas a entrenar.",
      "Ajuste automático inteligente: si tu nivel de fatiga acumulada es alto, la sesión intensa se modula a un trote suave regenerativo.",
      "Regla 80/20 comprobada: el 80% de tus entrenamientos se hace a ritmo suave y conversacional (Zona 2) y solo el 20% a alta intensidad, evitando el agotamiento crónico.",
    ],
    coach: {
      id: "seiler",
      name: "Dr. Stephen Seiler",
      initials: "SS",
      imageUrl: "/coaches/stephen-seiler.jpg",
      title: "Investigador Científico de Deportes de Resistencia",
      discipline: "Modelo Polarizado 80/20",
      focus: "Entrenamiento Polarizado 80/20 y Preservación de la Salud Muscular",
      quote:
        "El 80% del volumen debe ser verdaderamente fácil para que el 20% restante pueda ser ejecutado con máxima calidad.",
      biomechanicalImpact:
        "Descubrió que los mejores atletas del mundo entrenan el 80% del tiempo a intensidades suaves y cómodas (Zona 2), evitando la fatiga crónica y reservando toda la energía para cuando realmente toca ir rápido (el 20% restante).",
      pulseApplication:
        "Control del equilibrio 80/20 semanal y cálculo diario de tu nivel de Forma (TSB), Fatiga acumulada y Condición física real a partir de tu Variabilidad Cardíaca (HRV).",
    },
  },
  {
    id: "coggan",
    tabTitle: "Entrenamiento por Vatios (FTP)",
    coachName: "Dr. Andrew Coggan",
    coachRole: "Pionero del Entrenamiento por Potencia",
    tabIcon: Zap,
    ruleTitle: "Potencia (FTP) y Medición del Esfuerzo Real",
    ruleDescription:
      "Las pulsaciones cardíacas varían por calor, estrés o cafeína. Medir tu esfuerzo en vatios te da el dato exacto de tu trabajo muscular, sin importar si hay viento o subidas.",
    bullets: [
      "Prescripción en vatios exactos para carrera o ciclismo, compatibles con cualquier potenciómetro o sensor deportivo.",
      "Cálculo automático de la carga real: medimos el estrés exacto de cada sesión (TSS / Training Stress Score) para que progreses sin sobreentrenar.",
      "Esfuerzo constante: mantén el ritmo justo en subidas o con viento en contra, protegiendo tu corazón de sobreesfuerzos innecesarios.",
    ],
    coach: {
      id: "coggan",
      name: "Dr. Andrew Coggan",
      initials: "AC",
      imageUrl: "/coaches/andrew-coggan.jpg",
      title: "Fisiólogo del Ejercicio & Creador del FTP y TSS",
      discipline: "Potencia en Ciclismo y Carrera",
      focus: "Entrenamiento por Vatios (FTP) y Medición del Esfuerzo Real (TSS)",
      quote:
        "La potencia en vatios es la única métrica honesta e inmune al calor, fatiga acumulada o factores externos.",
      biomechanicalImpact:
        "Creador de los estándares mundiales de FTP (Potencia Umbral Funcional) y TSS (Puntaje de Carga y Estrés). Permitió cuantificar con rigor matemático la energía real que exige cada entrenamiento.",
      pulseApplication:
        "Cálculo en tiempo real de tu carga de entrenamiento (TSS), control del esfuerzo exacto en vatios tanto en ruta como en rodillo y distribución inteligente de tus series.",
    },
  },
  {
    id: "daniels",
    tabTitle: "Ritmos de Carrera (VDOT)",
    coachName: "Dr. Jack Daniels",
    coachRole: "Fisiólogo Olímpico de Atletismo",
    tabIcon: Timer,
    ruleTitle: "Fórmula VDOT: Ritmos Exactos para tu Nivel",
    ruleDescription:
      "El Dr. Jack Daniels creó la fórmula VDOT (Índice de Capacidad de Oxígeno y Rendimiento), que calcula los ritmos precisos para cada tipo de entrenamiento según tu marca real.",
    bullets: [
      "Ritmos personalizados para cada sesión: suave (recuperación), maratón (fondo), umbral (resistencia) e intervalos (velocidad).",
      "Entrenamiento eficiente del umbral: mejora la capacidad de tu cuerpo para tolerar ritmos rápidos por más tiempo sin acumular fatiga excesiva.",
      "Mayor velocidad con menos cansancio: series fraccionadas que enseñan a tus músculos a ser más eficientes consumiendo menos energía.",
    ],
    coach: {
      id: "daniels",
      name: "Dr. Jack Daniels",
      initials: "JD",
      imageUrl: "/coaches/jack-daniels.jpg",
      title: "Fisiólogo Olímpico y Creador del Sistema VDOT",
      discipline: "Atletismo & Ritmos de Precisión",
      focus: "Fórmula VDOT (Ritmos Personalizados de Carrera) y Economía de Esfuerzo",
      quote:
        "Entrena al menor costo fisiológico posible para lograr la máxima adaptación biológica requerida.",
      biomechanicalImpact:
        "Creador de las tablas universales VDOT (Índice de Rendimiento y Ritmos). Estableció los ritmos exactos para cada tipo de sesión (recuperación, fondo, umbral y series), asegurando que entrenes al paso justo sin sobrecargarte.",
      pulseApplication:
        "Cálculo milimétrico de tus ritmos de carrera para cada distancia. El sistema calibra tus series de umbral y velocidad para que mejores tu resistencia con el menor cansancio posible.",
    },
  },
];
