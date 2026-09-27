import { getMondayOfWeekStr } from "@/lib/dateUtils";

export const dayShortNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
export const dayFullNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const monthsShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const monthsFull = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/** Devuelve los 7 strings YYYY-MM-DD para lunes a domingo a partir del lunes de referencia */
export function getWeekDates(startMondayYMD?: string): string[] {
  const base = startMondayYMD || getMondayOfWeekStr();
  const dates: string[] = [];
  const parts = base.split("-").map(Number);
  if (parts.length !== 3) return dates;
  const [y, m, d] = parts;
  for (let i = 0; i < 7; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}

/** Devuelve solo el número de día (ej. "27") */
export function formatDayNumber(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts[2] ? `${parseInt(parts[2], 10)}` : "";
}

/** Devuelve formato corto de día y mes (ej. "27 Sep") */
export function formatDayMonthShort(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const m = parseInt(parts[1], 10) - 1;
    return `${day} ${monthsShort[m] || ""}`;
  }
  return dateStr;
}

/** Devuelve encabezado completo formal (ej. "Domingo, 27 de Septiembre") */
export function formatFullDateHeader(dateStr?: string, dayName?: string): string {
  const prefix = dayName || "Día";
  if (!dateStr) return prefix;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const m = parseInt(parts[1], 10) - 1;
    return `${prefix}, ${day} de ${monthsFull[m] || ""}`;
  }
  return prefix;
}
