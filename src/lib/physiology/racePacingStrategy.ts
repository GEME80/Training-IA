/**
 * racePacingStrategy.ts
 *
 * Generador universal de Pacing Plan y prescripción de competición oficial.
 * Principios Fisiológicos y de Cronometraje en Competición:
 * 1. Cero pasos de Warmup/Cooldown dentro del cronómetro del reloj:
 *    - El pistoletazo de salida debe coincidir con el Km 0.0 del entrenamiento.
 *    - Cruzar la meta detiene el cronómetro oficial para preservar el tiempo neto y récord.
 *    - Activación y descompresión se estructuran como Protocolos Tácticos (fuera de cronómetro).
 * 2. Pacing Plan por fases a potencia Stryd (CP) o ritmo:
 *    - 42.2K (Maratón): 87% CP (Km 0-5) -> 89% CP (Km 5-32) -> 91% CP (Km 32-42.2).
 *    - 21.1K (Media Maratón): 90% CP (Km 0-3) -> 92% CP (Km 3-17) -> 94% CP (Km 17-21.1).
 *    - 10K: 96% CP (Km 0-2) -> 98% CP (Km 2-8) -> 101% CP (Km 8-10).
 *    - 5K: 100% CP (Km 0-1) -> 103% CP (Km 1-4) -> 106% CP (Km 4-5).
 */

export interface RacePacingPlan {
  powerTarget: string;
  workoutDoc: string;
  pacingSummary: string;
  estimatedMinutes: number;
}

export interface BuildRacePacingParams {
  discipline?: string;
  distanceKm: number;
  sportCategory?: string;
  runFtp?: number;
  bikeFtp?: number;
  goalTarget?: string | null;
  parsedGoalMinutes?: number | null;
}

export function buildRacePacingPlan(params: BuildRacePacingParams): RacePacingPlan {
  const {
    discipline = "Carrera",
    distanceKm,
    sportCategory = "Running",
    runFtp = 0,
    bikeFtp = 0,
    goalTarget,
    parsedGoalMinutes,
  } = params;

  const isCycling = discipline === "Ciclismo" || sportCategory === "Cycling";
  const isSwim = discipline === "Natacion";
  const hasPower = runFtp > 0;

  // 1. Caso Ciclismo (Gran Fondo / Prueba cicloturista)
  if (isCycling) {
    const dist = distanceKm > 0 ? distanceKm : 120;
    const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : Math.round(dist * 2.2);
    const bikePower = bikeFtp > 0
      ? `${Math.round(bikeFtp * 0.72)}-${Math.round(bikeFtp * 0.80)}W (72-80% FTP • Ritmo Objetivo)`
      : "72-80% FTP (Ritmo Crucero Fondo)";

    const midDist = Math.max(20, Math.round(dist - 30));
    const doc = [
      "Protocolo Pre-Carrera (Fuera de Cronómetro)",
      "• 45m antes: Verificación de presiones, transmisión y avituallamiento",
      "• 20m antes: Calentamiento en rodillo o rodaje suave 10-15m Z1",
      "",
      `Pacing Plan (Competición Oficial ${dist}K)`,
      "- 15km 68% FTP (Salida y Colocación en Pelotón)",
      `- ${midDist}km 76% FTP (Ritmo Crucero y Puertos Controlados)`,
      "- 15km 80% FTP (Tramo Final y Cierre)",
      "- Estrategia Nutricional: 60-90g CHO/h con bidón de sales cada 50-60 min",
      "",
      "Protocolo Post-Meta (Fuera de Cronómetro)",
      "• Detener cronómetro inmediatamente al cruzar el arco de meta",
      "• Hidratación inmediata con sales y batido de recuperación proteico-glucídico",
    ].join("\n");

    return {
      powerTarget: bikePower,
      workoutDoc: doc,
      pacingSummary: `Competición de Ciclismo (${dist} km). Gestión de vatios en puertos y nutrición continua.`,
      estimatedMinutes: estMins,
    };
  }

  // 2. Caso Natación
  if (isSwim) {
    const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : Math.round(distanceKm * 20);
    const doc = [
      "Protocolo Pre-Prueba (Fuera de Cronómetro)",
      "• 30m antes: Movilidad dinámica de hombros y activación con gomas elásticas",
      "• 15m antes: Contacto con el agua y 4-6 aceleraciones suaves",
      "",
      `Pacing Plan (Competición Oficial ${distanceKm} km)`,
      `- ${distanceKm * 1000}mtr 100% CSS (Ritmo Umbral Sostenido de Nado)`,
      "- Orientación visual cada 6-8 brazadas y nado a pies en salida",
      "",
      "Protocolo Post-Meta (Fuera de Cronómetro)",
      "• Detener cronómetro al tocar pared o cruzar arco de meta",
      "• Hidratación suave y descompresión muscular",
    ].join("\n");

    return {
      powerTarget: "Ritmo CSS Sostenido",
      workoutDoc: doc,
      pacingSummary: `Competición de Natación (${distanceKm} km). Ritmo CSS parejo y orientación técnica.`,
      estimatedMinutes: estMins,
    };
  }

  // 3. Carrera a Pie (Running) según distancia:
  // A) Maratón (>= 38 km)
  if (distanceKm >= 38) {
    const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : 195;
    const powerTarget = hasPower
      ? `${Math.round(runFtp * 0.88)}-${Math.round(runFtp * 0.91)}W (88-91% CP) • Ritmo Objetivo`
      : "88-91% CP (Ritmo Objetivo Maratón)";

    const doc = [
      "Protocolo Pre-Carrera (Fuera de Cronómetro)",
      "• 35m antes: Movilidad articular dinámica y activación ligera en seco (sin correr para ahorrar glucógeno)",
      "• 20m antes: 2-3 rectas cortas de soltura (30-40m) sin entrar en deuda de oxígeno",
      "• Entrada al cajón: Calma mental, respiración diafragmática y conservar temperatura",
      "",
      "Pacing Plan (Competición Oficial 42.2K)",
      "- 5km 87% CP (Salida Controlada y Contención de Euforia)",
      "- 27km 89% CP (Ritmo Crucero Aeróbico Estable)",
      "- 10.2km 91% CP (Bloque Decisivo y Cierre en Meta)",
      "- Estrategia Nutricional: 60-80g CHO/h con tomas regulares de agua cada 5km",
      "",
      "Protocolo Post-Meta (Fuera de Cronómetro)",
      "• Detener cronómetro inmediatamente al cruzar el arco de meta",
      "• Abrigo térmico inmediato, reposición hidroelectrolítica y caminata libre",
    ].join("\n");

    return {
      powerTarget,
      workoutDoc: doc,
      pacingSummary: `Competición 42.2K Maratón. Pacing escalonado para preservar glucógeno y rematar en los 10km finales.`,
      estimatedMinutes: estMins,
    };
  }

  // B) Media Maratón (18 a 30 km)
  if (distanceKm >= 18 && distanceKm < 38) {
    const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : 95;
    const powerTarget = hasPower
      ? `${Math.round(runFtp * 0.91)}-${Math.round(runFtp * 0.94)}W (91-94% CP) • Ritmo Objetivo`
      : "91-94% CP (Ritmo Objetivo 21K)";

    const doc = [
      "Protocolo Pre-Carrera (Fuera de Cronómetro)",
      "• 30m antes: 10m de trote muy suave + movilidad dinámica articular",
      "• 15m antes: 3 rectas progresivas de 50m a ritmo de competición",
      "• Entrada al cajón: Hidratación con sorbo de agua y concentración en el primer parcial",
      "",
      "Pacing Plan (Competición Oficial 21.1K)",
      "- 3km 90% CP (Salida Controlada y Entrada en Ritmo)",
      "- 14km 92% CP (Ritmo Crucero Umbral-Tempo)",
      "- 4.1km 94% CP (Cierre Progresivo a Meta)",
      "- Estrategia Nutricional: 30-50g CHO/h con geles en km 8 y 15",
      "",
      "Protocolo Post-Meta (Fuera de Cronómetro)",
      "• Detener cronómetro inmediatamente al cruzar la meta",
      "• Hidratación con electrolitos y caminata suave de 10 min",
    ].join("\n");

    return {
      powerTarget,
      workoutDoc: doc,
      pacingSummary: `Competición 21.1K Media Maratón. Gestión en Z3-Z4 alta y aceleración en el último tercio.`,
      estimatedMinutes: estMins,
    };
  }

  // C) 10K (7 a 15 km)
  if (distanceKm >= 7 && distanceKm < 18) {
    const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : 45;
    const powerTarget = hasPower
      ? `${Math.round(runFtp * 0.96)}-${Math.round(runFtp * 1.00)}W (96-100% CP) • Ritmo Umbral`
      : "96-100% CP (Ritmo Umbral 10K)";

    const doc = [
      "Protocolo Pre-Carrera (Fuera de Cronómetro)",
      "• 35m antes: 12-15m trote suave progresivo Z1-Z2",
      "• 15m antes: Movilidad dinámica + 4 progresiones de 60m a ritmo de 10K",
      "• Entrada al cajón activo con pulsaciones preparadas para esfuerzo de umbral",
      "",
      "Pacing Plan (Competición Oficial 10K)",
      "- 2km 96% CP (Entrada Progresiva en Ritmo Umbral)",
      "- 6km 98% CP (Ritmo Umbral Estable y Concentración)",
      "- 2km 101% CP (Aceleración Final y Vaciado en Meta)",
      "- Hidratación: Enjuague bucal o pequeños sorbos según temperatura",
      "",
      "Protocolo Post-Meta (Fuera de Cronómetro)",
      "• Detener cronómetro al cruzar la meta",
      "• 10m caminata suave para aclaramiento de lactato",
    ].join("\n");

    return {
      powerTarget,
      workoutDoc: doc,
      pacingSummary: `Competición 10K. Umbral anaeróbico puro (96-100% CP) y remate en los 2km finales.`,
      estimatedMinutes: estMins,
    };
  }

  // D) 5K (< 7 km)
  const estMins = parsedGoalMinutes && parsedGoalMinutes > 0 ? parsedGoalMinutes : 22;
  const powerTarget = hasPower
    ? `${Math.round(runFtp * 1.00)}-${Math.round(runFtp * 1.05)}W (100-105% CP) • Ritmo VO2max`
    : "100-105% CP (Ritmo Supra-Umbral 5K)";

  const doc = [
    "Protocolo Pre-Carrera (Fuera de Cronómetro)",
    "• 40m antes: 15m trote suave progresivo + movilidad articular amplia",
    "• 15m antes: 4 rectas de 60-80m a ritmo 5K (100% CP) para activación neuromuscular",
    "• Entrada al cajón listo para salida rápida inmediata",
    "",
    "Pacing Plan (Competición Oficial 5K)",
    "- 1km 100% CP (Salida Rápida pero Controlada)",
    "- 3km 103% CP (Crucero Supra-Umbral VO2max)",
    "- 1km 106% CP (Sprint Final Agónico a Meta)",
    "",
    "Protocolo Post-Meta (Fuera de Cronómetro)",
    "• Detener cronómetro al cruzar la meta",
    "• Caminata suave de descompresión cardiorrespiratoria",
  ].join("\n");

  return {
    powerTarget,
    workoutDoc: doc,
    pacingSummary: `Competición 5K. Máximo consumo de oxígeno (VO2max) sostenido de inicio a fin.`,
    estimatedMinutes: estMins,
  };
}
