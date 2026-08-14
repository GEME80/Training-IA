export interface TargetRace {
  id: string;
  name: string; // e.g. "Maratón de Valencia", "Media Maratón de Bogotá"
  date: string; // "YYYY-MM-DD"
  distance: "5k" | "10k" | "21k" | "42k" | "cycling_fondo" | "triathlon_703" | "triathlon_1406" | "custom";
  priority: "A" | "B" | "C"; // A: Principal (Rige Macrociclo), B: Test/Ajuste, C: Entrenamiento
  goalTarget?: string; // e.g. "Sub-3h00m", "275W Stryd", "Completar"
}

export type MacrocyclePhaseType =
  | "MAINTENANCE"
  | "BASE_1"
  | "BASE_2"
  | "BUILD"
  | "PEAK"
  | "TAPER"
  | "RACE_WEEK"
  | "RECOVERY";

export interface MacrocyclePhaseInfo {
  phase: MacrocyclePhaseType;
  phaseLabel: string;
  weeksRemaining: number | null;
  daysRemaining: number | null;
  primaryRace: TargetRace | null;
  guideline: string;
  suggestedFocus: string;
  badgeColor: string;
  maxLongRunMinutes: number;
  isSpecificMarathonPhase: boolean;
  weeklyTssTarget: string;
}

/**
 * Calcula la fase del macrociclo y la cuenta regresiva a partir de las carreras configuradas.
 */
export function calculateMacrocyclePhase(
  races: TargetRace[] = [],
  baseDate: Date = new Date()
): MacrocyclePhaseInfo {
  const now = new Date(baseDate);
  now.setHours(0, 0, 0, 0);

  // Filtrar carreras futuras y ordenar por fecha
  const futureRaces = races
    .filter((r) => {
      const raceDate = new Date(r.date);
      raceDate.setHours(0, 0, 0, 0);
      return raceDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Buscar la carrera de Prioridad A más próxima
  const primaryRace = futureRaces.find((r) => r.priority === "A") || futureRaces[0] || null;

  if (!primaryRace) {
    return {
      phase: "MAINTENANCE",
      phaseLabel: "Mantenimiento General Adaptativo",
      weeksRemaining: null,
      daysRemaining: null,
      primaryRace: null,
      guideline: "Sin carrera principal próxima. Prioriza desarrollo aeróbico base, salud articular de sóleo/Aquiles y asimilación sin sobrecargas.",
      suggestedFocus: "Mantenimiento de fitness (CTL estable). Tirada larga dominical de máximo 55-65 min.",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      maxLongRunMinutes: 60,
      isSpecificMarathonPhase: false,
      weeklyTssTarget: "280 - 360 TSS",
    };
  }

  const isMarathon = primaryRace.distance === "42k";
  const raceDate = new Date(primaryRace.date);
  raceDate.setHours(0, 0, 0, 0);
  const diffTime = raceDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(daysRemaining / 7);

  if (daysRemaining <= 7 && daysRemaining >= 0) {
    return {
      phase: "RACE_WEEK",
      phaseLabel: "Semana de Competición",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: `Semana crucial para ${primaryRace.name}. Máxima frescura neuromuscular, activación breve de 25m y recarga de glucógeno.`,
      suggestedFocus: "Supercompensación total y activación metabólica corta.",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      maxLongRunMinutes: 30,
      isSpecificMarathonPhase: isMarathon,
      weeklyTssTarget: "150 - 200 TSS (excluyendo carrera)",
    };
  }

  if (weeksRemaining <= 2) {
    return {
      phase: "TAPER",
      phaseLabel: "Tapering & Supercompensación",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Reducción progresiva del volumen (-40% a -50%) manteniendo intervalos breves de ritmo específico para elevar el TSB.",
      suggestedFocus: "Recuperación biológica sin perder tono muscular. Tirada larga reducida a 40-50 min suaves.",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      maxLongRunMinutes: 50,
      isSpecificMarathonPhase: isMarathon,
      weeklyTssTarget: "220 - 300 TSS",
    };
  }

  if (weeksRemaining <= 6) {
    return {
      phase: "PEAK",
      phaseLabel: "Pico de Rendimiento Específico",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: isMarathon
        ? "Fase específica de Maratón: Máxima especificidad de ritmo Stryd. Fondos largos clave (1h45m-2h00m) con bloques a potencia objetivo."
        : "Pico de forma: Entrenamientos clave de ritmo de competición y tirada larga controlada (75-85m).",
      suggestedFocus: isMarathon
        ? "Asimilación de ritmo maratón y fondos específicos de fin de semana."
        : "Ritmo específico de carrera y tolerancia al lactato.",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      maxLongRunMinutes: isMarathon ? 115 : 85,
      isSpecificMarathonPhase: isMarathon,
      weeklyTssTarget: isMarathon ? "480 - 580 TSS" : "420 - 500 TSS",
    };
  }

  if (weeksRemaining <= 12) {
    return {
      phase: "BUILD",
      phaseLabel: "Construcción Específica & Umbral",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: isMarathon
        ? "Inicio de preparación específica de Maratón: Desarrollo de umbral (Stryd CP) y progresión gradual de tirada larga (85-100 min)."
        : "Construcción de umbral funcional y resistencia a la potencia crítica (75-85 min tirada larga).",
      suggestedFocus: "Series a potencia de umbral (Stryd Z4) y extensión de volumen aeróbico.",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      maxLongRunMinutes: isMarathon ? 95 : 80,
      isSpecificMarathonPhase: isMarathon,
      weeklyTssTarget: "420 - 520 TSS",
    };
  }

  if (weeksRemaining <= 16) {
    return {
      phase: "BASE_2",
      phaseLabel: "Base Aeróbica II (Capilarización)",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Aumento gradual del volumen en Z2, densidad mitocondrial y fuerza reactiva de sóleo. Rodajes controlados sin fondos excesivos.",
      suggestedFocus: "Volumen aeróbico moderado (tirada dominical de 70-80 min) y prevención.",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      maxLongRunMinutes: 75,
      isSpecificMarathonPhase: false,
      weeklyTssTarget: "380 - 450 TSS",
    };
  }

  return {
    phase: "BASE_1",
    phaseLabel: "Base Aeróbica I (Fundación)",
    weeksRemaining,
    daysRemaining,
    primaryRace,
    guideline: "Etapa inicial de acondicionamiento general, resistencia de baja intensidad y preparación osteoarticular. Cero desgaste innecesario.",
    suggestedFocus: "Consistencia y fuerza base. Tirada dominical contenida (60-70 min).",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    maxLongRunMinutes: 65,
    isSpecificMarathonPhase: false,
    weeklyTssTarget: "320 - 400 TSS",
  };
}
