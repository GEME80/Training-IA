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
      protocolNote: `Estrategia Nutricional Ciclismo (${durationMinutes}m): Ingerir ${cho} (isotónico + geles/barritas) y 500-700mg sodio/h cada 20-30 min.`,
    };
  }

  // Carrera / Trail
  const cho = durationMinutes >= 120 ? "60-80g CHO/h" : "45-60g CHO/h";
  return {
    targetChoPerHour: cho,
    sodiumMgPerHour: "400-600mg Na+/h",
    fluidMlPerHour: "450-650ml/h",
    protocolNote: `Estrategia Nutricional Carrera (${durationMinutes}m): Consumo regular de ${cho} con agua y sales minerales cada 30-40 min.`,
  };
}

export function enhanceWorkoutDocWithFuelingAndWarmup(params: {
  workoutDoc: string;
  durationMinutes: number;
  sport: string;
  isQualityOrLong: boolean;
}): string {
  const { workoutDoc, durationMinutes, sport, isQualityOrLong } = params;
  let enhanced = workoutDoc;

  // Agente 07: Fueling & Hydration
  const fueling = getFuelingStrategy(durationMinutes, sport);
  if (fueling && !enhanced.includes("Estrategia Nutricional")) {
    enhanced = `${enhanced}\n\nEstrategia Nutricional & Hidratación (PULSE Fueling)\n- ${fueling.protocolNote}`;
  }

  // Agente 08: Dynamic Mobility & Neuromuscular Warmup
  if (isQualityOrLong && !enhanced.includes("Activación Neuromuscular")) {
    if (sport === "Run" || sport === "Carrera") {
      const warmupProtocol = "Activación Neuromuscular Previa (Reloj)\n- 3m Movilidad de tobillo contra pared & 90/90 cadera\n- 2x 15s Pogo hops elásticos reactivos\n- 2x 10x Sóleo excéntrico en escalón\n\n";
      enhanced = `${warmupProtocol}${enhanced}`;
    } else if (sport === "Ride" || sport === "Ciclismo") {
      const warmupProtocol = "Activación Neuromuscular Previa (Reloj)\n- 3m Movilidad torácica & cadera (cat-cow dinámico)\n- 2x 20s Activación de glúteo medio con minibanda\n\n";
      enhanced = `${warmupProtocol}${enhanced}`;
    }
  }

  return enhanced;
}
