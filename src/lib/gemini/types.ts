export type DisciplineType = "Descanso" | "Carrera" | "Ciclismo" | "Fuerza" | "Natacion";
export type WeeklyAvailabilityMap = Record<string, DisciplineType[] | DisciplineType>;

export function normalizeDisciplines(val?: DisciplineType[] | DisciplineType): DisciplineType[] {
  if (!val) return ["Descanso"];
  if (Array.isArray(val)) return val.length > 0 ? val : ["Descanso"];
  return [val];
}

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityMap = {
  Lunes: ["Descanso"],
  Martes: ["Carrera"],
  Miércoles: ["Ciclismo"],
  Jueves: ["Fuerza"],
  Viernes: ["Carrera"],
  Sábado: ["Ciclismo"],
  Domingo: ["Carrera"],
};

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
