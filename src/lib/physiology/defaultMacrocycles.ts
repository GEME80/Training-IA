import { MacrocycleDefinition } from "./macrocycleLibrary";
import { RACE_TARGET_MACROCYCLES } from "./raceTargetMacrocycles";
import { ATHLETE_MOMENT_MACROCYCLES } from "./athleteMomentMacrocycles";

/**
 * Catálogo Oficial Consolidado de Macrociclos de Fábrica (PULSE PRO SERIES)
 */
export const DEFAULT_MACROCYCLE_LIBRARY: MacrocycleDefinition[] = [
  ...RACE_TARGET_MACROCYCLES,
  ...ATHLETE_MOMENT_MACROCYCLES,
];
