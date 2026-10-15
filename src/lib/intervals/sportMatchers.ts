/**
 * Utilidades para detección multilingüe (Español / Inglés) de tipos de deporte en Intervals.icu.
 */

export interface SportSettingLike {
  id?: string | number;
  types?: string[];
  [key: string]: unknown;
}

export function isRunSport(s: SportSettingLike): boolean {
  if (!s) return false;
  const idStr = String(s.id || "");
  const hasTypeMatch = Array.isArray(s.types) && s.types.some((t: string) =>
    /run|running|virtualrun|trailrun|treadmill|correr|carrera|cinta/i.test(t)
  );
  return Boolean(hasTypeMatch || /run|correr|carrera/i.test(idStr));
}

export function isRideSport(s: SportSettingLike): boolean {
  if (!s) return false;
  const idStr = String(s.id || "");
  const hasTypeMatch = Array.isArray(s.types) && s.types.some((t: string) =>
    /ride|cycling|bike|virtualride|ebikeride|gravel|ciclismo|bici/i.test(t)
  );
  return Boolean(hasTypeMatch || /ride|cycling|bike|ciclismo|bici/i.test(idStr));
}

export function isSwimSport(s: SportSettingLike): boolean {
  if (!s) return false;
  const idStr = String(s.id || "");
  const hasTypeMatch = Array.isArray(s.types) && s.types.some((t: string) =>
    /swim|swimming|openwater|nataci[oó]n|aguas\s*abiertas/i.test(t)
  );
  return Boolean(hasTypeMatch || /swim|nataci[oó]n/i.test(idStr));
}
