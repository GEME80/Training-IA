import { DEFAULT_MACROCYCLE_LIBRARY } from "./defaultMacrocycles";

export type MacrocycleCategory = "RACE_TARGET" | "ATHLETE_MOMENT";

export type MacrocycleDistanceType =
  | "42k"
  | "21k"
  | "10k"
  | "5k"
  | "trail_50k"
  | "cycling_fondo"
  | "cycling_climbing"
  | "cycling_criterium"
  | "triathlon_short"
  | "triathlon_703"
  | "triathlon_1406"
  | "base_building"
  | "general_build"
  | "speed_block"
  | "post_race_recovery"
  | "injury_rehab"
  | "maintenance"
  | "custom";

export type IntensityMetric = "POWER" | "HEART_RATE" | "PACE" | "RPE";

export type SportType =
  | "running"
  | "cycling"
  | "triathlon"
  | "trail_running"
  | "swimming"
  | "maintenance";

export interface MacrocycleDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: MacrocycleCategory;
  distanceType: MacrocycleDistanceType;
  sport: SportType;
  supportedMetrics: IntensityMetric[];
  defaultMetric: IntensityMetric;
  icon: string;
  badgeColor: string;
  accentColor: string;
  minWeeks: number;
  maxWeeks: number;
  defaultWeeks: number;
  maxLongRunKm: number;
  maxLongRunMinutes: number;
  elevationGainMeters?: number;
  description: string;
  physiologicalFocus: string[];
  keyWorkoutsSummary: string[];
  recommendedFor: string;
  phaseRatios: {
    base: number;
    build: number;
    peak: number;
    taper: number;
  };
  isCustom?: boolean;
  isActive?: boolean;
  updatedAt?: string;
  createdBy?: string;
}

export { DEFAULT_MACROCYCLE_LIBRARY };

// Alias para compatibilidad hacia atrás
export const MACROCYCLE_LIBRARY = DEFAULT_MACROCYCLE_LIBRARY;

// Almacén en memoria para personalizaciones dinámicas en tiempo de ejecución
let dynamicCustomLibrary: MacrocycleDefinition[] = [];

/**
 * Obtiene todas las definiciones de macrociclos combinando las de fábrica con las personalizadas.
 */
export function getAllMacrocycleDefinitions(): MacrocycleDefinition[] {
  const mergedMap = new Map<string, MacrocycleDefinition>();
  DEFAULT_MACROCYCLE_LIBRARY.forEach((def) => mergedMap.set(def.id, def));
  dynamicCustomLibrary.forEach((def) => mergedMap.set(def.id, def));
  return Array.from(mergedMap.values()).filter((d) => d.isActive !== false);
}

/**
 * Guarda o actualiza una definición personalizada en la librería.
 */
export function saveCustomMacrocycleDefinition(def: MacrocycleDefinition): MacrocycleDefinition {
  const enriched: MacrocycleDefinition = {
    ...def,
    isCustom: true,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = dynamicCustomLibrary.findIndex((d) => d.id === def.id);
  if (existingIdx >= 0) {
    dynamicCustomLibrary[existingIdx] = enriched;
  } else {
    dynamicCustomLibrary.push(enriched);
  }
  return enriched;
}

/**
 * Elimina una definición personalizada de la librería.
 */
export function deleteCustomMacrocycleDefinition(id: string): boolean {
  const initialLen = dynamicCustomLibrary.length;
  dynamicCustomLibrary = dynamicCustomLibrary.filter((d) => d.id !== id);
  return dynamicCustomLibrary.length < initialLen;
}

/**
 * Restablece la librería a los valores de fábrica por defecto.
 */
export function resetMacrocycleLibraryToDefault(): void {
  dynamicCustomLibrary = [];
}

/**
 * Busca una plantilla de macrociclo por su ID (consultando catálogo completo).
 */
export function getMacrocycleDefinitionById(id: string): MacrocycleDefinition | undefined {
  const all = getAllMacrocycleDefinitions();
  return all.find((m) => m.id === id);
}

/**
 * Busca una plantilla de macrociclo sugerida por tipo de distancia.
 */
export function getMacrocycleDefinitionByDistance(distance: MacrocycleDistanceType): MacrocycleDefinition {
  const all = getAllMacrocycleDefinitions();
  const match = all.find((m) => m.distanceType === distance);
  return match || all[0] || DEFAULT_MACROCYCLE_LIBRARY[0];
}
