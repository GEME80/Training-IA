/**
 * ⚡ AGENTES DE ENRIQUECIMIENTO EN TIEMPO DE EJECUCIÓN:
 * - Agente 07: PULSE Intra-Workout Fueling & Hydration Strategist (Carbohidratos, Sodio, Hidratación)
 * - Agente 08: PULSE Dynamic Mobility & Neuromuscular Warmup Engine (Activación neuromuscular en reloj)
 */

export interface FuelingStrategy {
  targetChoPerHour: string;
  sodiumMgPerHour: string;
  fluidMlPerHour: string;
  protocolNote: string;
}

export function getFuelingStrategy(durationMinutes: number, sport: string): FuelingStrategy | null {
  if (durationMinutes < 75) return null;

  if (sport === "Ride" || sport === "Ciclismo") {
    const cho = durationMinutes >= 150 ? "80-90g CHO/h" : "60-75g CHO/h";
    return {
      targetChoPerHour: cho,
      sodiumMgPerHour: "500-700mg Na+/h",
      fluidMlPerHour: "600-800ml/h",
      protocolNote: `Ingerir ${cho} (isotónico + geles/barritas) y 500-700mg sodio/h cada 20-30 min.`,
    };
  }

  // Carrera / Trail
  const cho = durationMinutes >= 120 ? "60-80g CHO/h" : "45-60g CHO/h";
  return {
    targetChoPerHour: cho,
    sodiumMgPerHour: "400-600mg Na+/h",
    fluidMlPerHour: "450-650ml/h",
    protocolNote: `Consumo regular de ${cho} con agua y sales minerales cada 30-40 min.`,
  };
}

export function getMobilityWarmup(sport: string, isQualityOrLong: boolean): string | null {
  if (!isQualityOrLong) return null;
  if (sport === "Run" || sport === "Carrera") {
    return "3m Movilidad dinámica de tobillo contra pared & 90/90 de cadera • 2x15s Pogo hops elásticos reactivos • 2x10x Sóleo excéntrico en escalón.";
  }
  if (sport === "Ride" || sport === "Ciclismo") {
    return "3m Movilidad torácica & cadera (cat-cow dinámico) • 2x20s Activación neuromuscular de glúteo medio con minibanda.";
  }
  return null;
}

export function resolveWorkoutAddons(params: {
  durationMinutes: number;
  sport: string;
  isQualityOrLong: boolean;
}): { mobilityWarmup?: string; fuelingStrategy?: string } {
  const { durationMinutes, sport, isQualityOrLong } = params;
  const fueling = getFuelingStrategy(durationMinutes, sport);
  const mobility = getMobilityWarmup(sport, isQualityOrLong);

  return {
    mobilityWarmup: mobility || undefined,
    fuelingStrategy: fueling?.protocolNote || undefined,
  };
}

export function cleanWorkoutDocOfAddons(doc?: string): string {
  if (!doc) return "";
  return doc
    .replace(/^Activación Neuromuscular Previa[\s\S]*?(?=Warmup|Main|Calentamiento|Circuito|$)/im, "")
    .replace(/Estrategia Nutricional & Hidratación[\s\S]*$/im, "")
    .trim();
}

/**
 * Mantenido por retrocompatibilidad, pero ya NO muta el workoutDoc
 * para evitar mezclar datos informativos con la prescripción estructurada del entrenamiento.
 */
export function enhanceWorkoutDocWithFuelingAndWarmup(params: {
  workoutDoc: string;
  durationMinutes: number;
  sport: string;
  isQualityOrLong: boolean;
}): string {
  return cleanWorkoutDocOfAddons(params.workoutDoc);
}
