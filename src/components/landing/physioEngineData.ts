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
    tabTitle: "Cap Biomecánico 3h",
    coachName: "Renato Canova",
    coachRole: "Maratón Olímpico",
    tabIcon: Shield,
    ruleTitle: "Tope Biomecánico de 3 Horas y Asimilación 3:1",
    ruleDescription:
      "La ciencia moderna demostró que superar las 3 horas de carrera continua en fondos dominicales destruye tejido conectivo sin generar adaptaciones mitocondriales adicionales.",
    bullets: [
      "Bloqueo estricto a 3 horas de tirada larga para blindar tendones, sóleos y rodillas contra sobreentrenamiento.",
      "Fraccionamiento de fondos con bloques específicos al 98-102% del ritmo maratón según tu potencia crítica.",
      "Periodización con ciclos 3:1: tres microciclos de carga progresiva seguidos por una semana de asimilación obligatoria.",
    ],
    coach: {
      id: "canova",
      name: "Renato Canova",
      initials: "RC",
      imageUrl: "/coaches/renato-canova.png",
      title: "Entrenador Olímpico de Maratón (Kenia e Italia)",
      discipline: "Maratón de Élite",
      focus: "Resistencia Específica al Ritmo Maratón y Cap Biomecánico de 3h",
      quote:
        "La especificidad biomecánica a ritmo de carrera supera al volumen vacío. El cuerpo debe aprender a reclutar fibras rápidas en estado de glucógeno depletado.",
      biomechanicalImpact:
        "Eliminó el kilometraje basura en maratón mundial. Demostró que fondos superiores a 3 horas generan microlesiones fibrilares irreversibles, priorizando bloques fraccionados a ritmo competitivo.",
      pulseApplication:
        "Algoritmo de Cap Biomecánico de 3h en tiradas dominicales y cálculo automático de bloques fraccionados a Ritmo Específico de Maratón según tu Stryd Critical Power.",
    },
  },
  {
    id: "banister",
    tabTitle: "Adaptación Diaria HRV",
    coachName: "Dr. Stephen Seiler",
    coachRole: "Modelo Polarizado & Banister",
    tabIcon: Activity,
    ruleTitle: "Modelo Impulso-Respuesta y Variabilidad Cardíaca",
    ruleDescription:
      "Tu sistema nervioso autónomo nunca miente. El algoritmo de Eric Banister y Stephen Seiler cruza tu HRV matutino con la carga acumulada para recalibrar la sesión del día.",
    bullets: [
      "Lectura matutina de variabilidad cardíaca (HRV rMSSD) que detecta fatiga del sistema parasimpático antes de salir a entrenar.",
      "Sustitución automática instantánea: si tu TSB cae bajo -10, la sesión de umbral se modula a rodaje Z1 regenerativo.",
      "Ratio polarizado 80/20 estricto: el 80% del volumen semanal se ejecuta en Zona 1/2 real para multiplicar capilares sin estrés crónico.",
    ],
    coach: {
      id: "seiler",
      name: "Dr. Stephen Seiler",
      initials: "SS",
      imageUrl: "/coaches/stephen-seiler.jpg",
      title: "Investigador Científico de Deportes de Resistencia",
      discipline: "Modelo Polarizado & Banister",
      focus: "Entrenamiento Polarizado 80/20 y Preservación del Umbral Z1/Z2",
      quote:
        "El 80% del volumen debe ser verdaderamente fácil para que el 20% restante pueda ser ejecutado con máxima calidad.",
      biomechanicalImpact:
        "Descubrió que los atletas de élite realizan el 80% de su volumen por debajo del umbral ventilatorio VT1, evitando la fatiga crónica del sistema nervioso autónomo generada en la zona gris.",
      pulseApplication:
        "Monitoreo del ratio de polarización semanal y modelo impulso-respuesta de Banister para calcular tu Fitness (CTL), Fatiga (ATL) y Forma (TSB) al segundo.",
    },
  },
  {
    id: "coggan",
    tabTitle: "Potencia Stryd & FTP",
    coachName: "Dr. Andrew Coggan",
    coachRole: "Fisiólogo & Métricas de Vatios",
    tabIcon: Zap,
    ruleTitle: "Cuantificación por Potencia Normalizada (NP) y TSS",
    ruleDescription:
      "El pulso cardíaco sufre de deriva por calor, estrés y cafeína. Los vatios de potencia son la métrica honesta que calcula el coste fisiológico real e inmune al viento.",
    bullets: [
      "Prescripción en vatios exactos con Stryd Running Power y medidores de potencia ciclistas en rodillo o ruta.",
      "Cálculo del Training Stress Score (TSS) y Factor de Intensidad (IF) para cada serie y microciclo.",
      "Eliminación de la deriva cardíaca: mantén el mismo esfuerzo celular en subidas pronunciadas o viento en contra sin sobrecargar el miocardio.",
    ],
    coach: {
      id: "coggan",
      name: "Dr. Andrew Coggan",
      initials: "AC",
      imageUrl: "/coaches/andrew-coggan.jpg",
      title: "Fisiólogo del Ejercicio & Pionero de Métricas de Potencia",
      discipline: "Ciclismo & Potencia Stryd",
      focus: "Potencia Ciclista (FTP), Normalización (NP) y Carga TSS",
      quote:
        "La potencia en vatios es la única métrica honesta e inmune al calor, fatiga acumulada o estrés externo.",
      biomechanicalImpact:
        "Creador de los estándares mundiales de Functional Threshold Power (FTP), Potencia Normalizada (NP) y TSS. Permitió cuantificar con rigor matemático la carga metabólica real del ejercicio.",
      pulseApplication:
        "Cálculo en tiempo real de TSS, Fitness (CTL), Fatiga (ATL) y Forma (TSB). Distribución de series por % FTP en rodillo o vatios Stryd con control del factor de variabilidad.",
    },
  },
  {
    id: "daniels",
    tabTitle: "Ritmos VDOT de Precisión",
    coachName: "Dr. Jack Daniels",
    coachRole: "Fisiólogo Olímpico",
    tabIcon: Timer,
    ruleTitle: "Fórmula VDOT y Zonas Fisiológicas Específicas",
    ruleDescription:
      "El Dr. Jack Daniels vinculó el consumo máximo de oxígeno (VO2max) con la economía de carrera para diseñar las zonas metabólicas más respetadas del atletismo olímpico.",
    bullets: [
      "Calibración de ritmos de entrenamiento (Easy, Marathon, Threshold, Interval, Repetition) según tu marca más reciente.",
      "Estímulo óptimo del aclaramiento de lactato en series de umbral (T) al 88-92% de tu frecuencia cardíaca máxima.",
      "Economía de carrera optimizada: series rápidas fraccionadas que mejoran la eficiencia neuromuscular con el mínimo costo biológico.",
    ],
    coach: {
      id: "daniels",
      name: "Dr. Jack Daniels",
      initials: "JD",
      imageUrl: "/coaches/jack-daniels.jpg",
      title: "Fisiólogo Olímpico y Creador del Sistema VDOT",
      discipline: "Running & Fisiología",
      focus: "Fórmula VDOT, Zonas Fisiológicas y Economía de Carrera",
      quote:
        "Entrena al menor costo fisiológico posible para lograr la máxima adaptación biológica requerida.",
      biomechanicalImpact:
        "Concibió la tabla universal VDOT correlacionando el VO2max con la economía de carrera. Estableció los ritmos exactos para cada zona demostrando su impacto específico en la capilarización celular.",
      pulseApplication:
        "Prescripción de zonas fisiológicas al milímetro. El motor clasifica automáticamente tus series de umbral (T) e intervalos (I) garantizando el estímulo metabólico óptimo sin sobrecarga neuromuscular.",
    },
  },
];
