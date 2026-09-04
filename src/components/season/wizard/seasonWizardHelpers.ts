import { MacrocycleDistanceType } from "@/lib/physiology/macrocycleLibrary";

/**
 * Calcula la fecha lunes resuelta según el modo de inicio ("CURRENT_WEEK", "NEXT_WEEK", "CUSTOM").
 * Función pura e inmutable que no modifica objetos de fecha existentes.
 */
export function getResolvedStartDate(
  startDateMode: "CURRENT_WEEK" | "NEXT_WEEK" | "CUSTOM",
  customStartDate?: string,
  referenceDate: Date = new Date()
): string {
  if (startDateMode === "CUSTOM" && customStartDate) return customStartDate;
  
  const day = referenceDate.getDay();
  const currentMondayDiff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() + currentMondayDiff
  );
  monday.setHours(0, 0, 0, 0);

  if (startDateMode === "NEXT_WEEK") {
    monday.setDate(monday.getDate() + 7);
  }
  return monday.toISOString().split("T")[0];
}

/**
 * Calcula la duración matemática exacta en semanas desde la fecha de inicio hasta la carrera.
 * Garantiza que la semana de la carrera sea la última semana del macrociclo (cero semanas o días después).
 */
export function calculateWeeksToRace(raceDateStr: string, startStr: string): number {
  const raceRaw = new Date(raceDateStr + "T00:00:00");
  const raceDay = raceRaw.getDay();
  const raceMondayDiff = raceDay === 0 ? -6 : 1 - raceDay;
  const raceMonday = new Date(
    raceRaw.getFullYear(),
    raceRaw.getMonth(),
    raceRaw.getDate() + raceMondayDiff
  );
  raceMonday.setHours(0, 0, 0, 0);

  const startRaw = new Date(startStr + "T00:00:00");
  const startDay = startRaw.getDay();
  const startMondayDiff = startDay === 0 ? -6 : 1 - startDay;
  const startMonday = new Date(
    startRaw.getFullYear(),
    startRaw.getMonth(),
    startRaw.getDate() + startMondayDiff
  );
  startMonday.setHours(0, 0, 0, 0);

  const diffMs = raceMonday.getTime() - startMonday.getTime();
  if (diffMs <= 0) return 4;
  const weeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1;
  return Math.max(4, Math.min(weeks, 40));
}

/**
 * Normaliza la distancia seleccionada en el wizard hacia el tipo de distancia oficial del macrociclo.
 */
export function resolveDistTypeFromWizard(dist: string, approach?: string): MacrocycleDistanceType {
  const d = (dist || "").toLowerCase();
  const a = (approach || "").toLowerCase();
  if (d.includes("sprint") || d.includes("olimp") || d === "triathlon_short") return "triathlon_short";
  if (d.includes("140.6") || d.includes("1406") || d.includes("full") || d.includes("iron") || d === "triathlon_1406" || a.includes("iron")) return "triathlon_1406";
  if (d.includes("triat") || d === "triathlon_703" || d.includes("70.3") || d.includes("703") || a.includes("triat")) return "triathlon_703";
  if (d.includes("bici") || d.includes("cicli") || d.includes("fondo") || d === "cycling_fondo" || a.includes("cicli")) return "cycling_fondo";
  if (d.includes("trail") || d.includes("ultra") || d === "trail_50k" || a.includes("trail")) return "trail_50k";
  if (d.includes("21")) return "21k";
  if (d.includes("10")) return "10k";
  if (d.includes("5")) return "5k";
  if (d.includes("maint") || a.includes("mantenimiento")) return "maintenance";
  return "42k";
}
