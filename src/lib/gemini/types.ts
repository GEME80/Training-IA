export type DisciplineType = "Descanso" | "Carrera" | "Ciclismo" | "Fuerza" | "Natacion";
export type WeeklyAvailabilityMap = Record<string, DisciplineType[] | DisciplineType>;

export const CANONICAL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export function normalizeDisciplines(val?: DisciplineType[] | DisciplineType): DisciplineType[] {
  if (!val) return ["Descanso"];
  if (Array.isArray(val)) return val.length > 0 ? val : ["Descanso"];
  return [val];
}

export function getDayDisciplines(avail?: WeeklyAvailabilityMap, dayName?: string): DisciplineType[] {
  if (!avail || !dayName) return ["Descanso"];
  if (avail[dayName]) return normalizeDisciplines(avail[dayName]);

  // Soporte de alias con y sin tildes (Miércoles/Miercoles, Sábado/Sabado)
  const normKey = dayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, v] of Object.entries(avail)) {
    const kNorm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (kNorm === normKey) {
      return normalizeDisciplines(v);
    }
  }
  return ["Descanso"];
}

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMap = {
  Lunes: ["Descanso"],
  Martes: ["Carrera"],
  Miércoles: ["Ciclismo"],
  Jueves: ["Fuerza"],
  Viernes: ["Carrera", "Fuerza"],
  Sábado: ["Ciclismo"],
  Domingo: ["Carrera"],
};

export function isLegacyAvailability(avail?: WeeklyAvailabilityMap): boolean {
  if (!avail || typeof avail !== "object") return true;
  const keys = Object.keys(avail);
  if (keys.length === 0) return true;
  // Solo se considera legacy si está vacío o no contiene ningún día válido
  const hasAnyDay = CANONICAL_DAYS.some((d) => getDayDisciplines(avail, d)[0] !== "Descanso" || avail[d] !== undefined);
  return !hasAnyDay && keys.length < 3;
}

export function resolveEffectiveAvailability(avail?: WeeklyAvailabilityMap): WeeklyAvailabilityMap {
  if (!avail || isLegacyAvailability(avail)) {
    return DEFAULT_WEEKLY_AVAILABILITY;
  }
  // Normalizar hacia los 7 días canónicos preservando la matriz del atleta
  const resolved: WeeklyAvailabilityMap = {};
  for (const day of CANONICAL_DAYS) {
    resolved[day] = getDayDisciplines(avail, day);
  }

  // Prevención de colisión de ciclismo consecutivo entre semana (ej. Martes + Miércoles o Miércoles + Jueves)
  const tueList = normalizeDisciplines(resolved["Martes"]);
  const wedList = normalizeDisciplines(resolved["Miércoles"]);
  const thuList = normalizeDisciplines(resolved["Jueves"]);

  const tueHasBike = tueList.includes("Ciclismo");
  const wedHasBike = wedList.includes("Ciclismo");
  const thuHasBike = thuList.includes("Ciclismo");

  if (tueHasBike && wedHasBike) {
    let nextTue = tueList.map((d: DisciplineType) => (d === "Ciclismo" ? "Carrera" : d));
    if (!nextTue.includes("Carrera")) nextTue.push("Carrera");
    resolved["Martes"] = nextTue;
  }
  if (wedHasBike && thuHasBike) {
    let nextThu = thuList.filter((d: DisciplineType) => d !== "Ciclismo");
    if (nextThu.length === 0) nextThu = ["Fuerza"];
    resolved["Jueves"] = nextThu;
  }

  return resolved;
}

export interface PlanItem {
  id?: string;
  day: string;
  date: string;
  formattedDate: string;
  discipline: DisciplineType;
  workoutName: string;
  action: "MANTENER" | "MODIFICAR" | "REDUCIR_INTENSIDAD" | "DESCANSO_ACTIVO";
  powerTarget?: string;
  tss?: number;
  durationMinutes?: number;
  activityType?: string;
  dayOfWeek?: string;
  title?: string;
  focus?: string;
  justification: string;
  workoutDoc?: string;
  workoutStructure?: string;
  isRestDay?: boolean;
  isCustomized?: boolean;
}

export interface AgentDecisionOutput {
  status: "OPTIMAL" | "CAUTION" | "OVERTRAINING_RISK" | "RECOVERY_NEEDED";
  summaryHeadline: string;
  reasoningTree: string[];
  suggestedPlan: PlanItem[];
  modelUsed?: string;
  macrocyclePhase?: string;
}

export function getWeekDates(
  weekOffset: number = 0,
  baseDate?: Date
): Array<{ day: string; date: string; formattedDate: string }> {
  const now = baseDate ? new Date(baseDate) : new Date();
  const dayOfWeek = now.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday + weekOffset * 7);

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return days.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const formatted = `${d.getDate()} ${months[d.getMonth()]}`;
    return { day, date: dateStr, formattedDate: formatted };
  });
}
