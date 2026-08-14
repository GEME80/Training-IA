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
      guideline: "Sin carrera principal próxima. Prioriza desarrollo aeróbico base, equilibrio autonómico (HRV) y prevención neuromuscular.",
      suggestedFocus: "Mantenimiento de fitness (CTL estable) y consolidación técnica.",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  }

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
      guideline: `Semana crucial para ${primaryRace.name}. Máxima frescura neuromuscular, activación breve a ritmo de carrera y recarga de glucógeno.`,
      suggestedFocus: "Supercompensación, relajación y activación metabólica corta.",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
  }

  if (weeksRemaining <= 2) {
    return {
      phase: "TAPER",
      phaseLabel: "Tapering & Supercompensación",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Reducción progresiva del volumen (40-50%) manteniendo intervalos breves de intensidad específica para elevar el TSB.",
      suggestedFocus: "Recuperación biológica sin perder tono muscular ni sensibilidad neuromuscular.",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    };
  }

  if (weeksRemaining <= 5) {
    return {
      phase: "PEAK",
      phaseLabel: "Pico de Rendimiento & Sobrecarga",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Máxima especificidad de ritmo/potencia Stryd. Entrenamientos clave de ritmo objetivo y tiradas largas progresivas.",
      suggestedFocus: "Asimilación de ritmo específico de carrera y tolerancia a la fatiga.",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
  }

  if (weeksRemaining <= 12) {
    return {
      phase: "BUILD",
      phaseLabel: "Construcción Específica & Umbral",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Desarrollo del umbral funcional (FTP/CP), tolerancia al lactato y elevación progresiva del CTL con Ramp Rate controlado.",
      suggestedFocus: "Series a potencia de umbral (Stryd Z4) y consolidación de base aeróbica.",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
  }

  if (weeksRemaining <= 16) {
    return {
      phase: "BASE_2",
      phaseLabel: "Base Aeróbica II (Capilarización)",
      weeksRemaining,
      daysRemaining,
      primaryRace,
      guideline: "Aumento gradual del volumen en Z2, desarrollo mitocondrial y fuerza reactiva de sóleo.",
      suggestedFocus: "Volumen aeróbico y trabajo neuromuscular de prevención.",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    };
  }

  return {
    phase: "BASE_1",
    phaseLabel: "Base Aeróbica I (Fundación)",
    weeksRemaining,
    daysRemaining,
    primaryRace,
    guideline: "Etapa inicial de acondicionamiento general, resistencia de baja intensidad y preparación osteoarticular.",
    suggestedFocus: "Construcción de hábitos, consistencia y fuerza base.",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };
}
