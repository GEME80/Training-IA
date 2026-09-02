/**
 * Utilidades de fecha local para el Sistema SGEA / PULSE AI PRO.
 * Previene el desfase de zona horaria UTC que ocurre con `toISOString().split("T")[0]`.
 */

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD según la zona horaria LOCAL del navegador/servidor.
 */
export function getLocalTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un objeto Date en cadena YYYY-MM-DD en su huso horario local.
 */
export function formatLocalDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Verifica si una fecha YYYY-MM-DD corresponde al día de hoy en hora local.
 */
export function isTodayDate(dateYMD: string): boolean {
  return dateYMD === getLocalTodayStr();
}

/**
 * Verifica si una fecha YYYY-MM-DD ya expiró en el pasado (antes de hoy en hora local).
 */
export function isPastDateLocal(dateYMD: string): boolean {
  return dateYMD < getLocalTodayStr();
}

/**
 * Retorna el Lunes de la semana en curso para una fecha dada en hora local.
 */
export function getMondayOfWeekLocal(refDate: Date = new Date()): Date {
  const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

/**
 * Retorna la fecha del Lunes de la semana en curso en formato YYYY-MM-DD.
 */
export function getMondayOfWeekStr(refDate: Date = new Date()): string {
  return formatLocalDateToYMD(getMondayOfWeekLocal(refDate));
}
