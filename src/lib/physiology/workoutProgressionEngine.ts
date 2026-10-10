/**
 * workoutProgressionEngine.ts
 * Motor Paramétrico de Progresión y Memoria Anti-Repetición.
 * 
 * Funcionalidades:
 * 1. Progresión paramétrica de series y volumen según la posición del mesociclo
 *    (Semana 1: Adaptación -> Semana 2: Consolidación -> Semana 3: Sobrecarga cumbre -> Descarga: Deload).
 * 2. Buffer de memoria de exclusión de 5 semanas para garantizar que ninguna sesión
 *    se repita antes de tiempo (Zero-Monotony Policy).
 */

export interface ParametricProgressionParams {
  weekNumber: number;
  phase?: string;
  isRecovery?: boolean;
  totalWeeks?: number;
}

export interface ProgressionTargetWorkout {
  name: string;
  powerTarget: string;
  justification: string;
  workoutDoc: string;
  durationMin?: number;
  tss?: number;
}

/**
 * Normaliza un nombre de entrenamiento eliminando sufijos de progresión o repeticiones
 * para indexar en el buffer de memoria.
 */
export function normalizeWorkoutKey(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "") // quita paréntesis ej: (5x 1000m) o (Descarga)
    .replace(/bloque\s+[ivx\d]+/gi, "")
    .replace(/progresi[oó]n/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Buffer de Memoria Anti-Monotonía con ventana deslizante de 5 semanas.
 */
export class AntiMonotonyMemoryBuffer {
  private history: string[] = [];
  private readonly maxWeeks: number;

  constructor(maxWeeks: number = 5) {
    this.maxWeeks = maxWeeks;
  }

  public record(workoutName: string): void {
    if (!workoutName) return;
    const key = normalizeWorkoutKey(workoutName);
    this.history.push(key);
    if (this.history.length > this.maxWeeks * 7) {
      this.history.shift();
    }
  }

  public isRecentlyUsed(workoutName: string, windowWeeks: number = 5): boolean {
    const key = normalizeWorkoutKey(workoutName);
    const recent = this.history.slice(-windowWeeks * 4);
    return recent.includes(key);
  }

  /**
   * Selecciona el candidato más diverso evitando aquellos usados en las últimas N semanas.
   * Si todos fueron usados recientemente (piscina reducida), aplica Least Recently Used (LRU).
   */
  public selectDiverseCandidate<T extends { name: string }>(
    candidates: T[],
    preferredIndex: number = 0,
    windowWeeks: number = 5
  ): T {
    if (!candidates || candidates.length === 0) return candidates[0];
    if (candidates.length === 1) return candidates[0];

    const recent = this.history.slice(-windowWeeks * 4);

    // 1. Buscar candidato a partir del preferredIndex que NO esté en la ventana reciente
    for (let i = 0; i < candidates.length; i++) {
      const idx = (preferredIndex + i) % candidates.length;
      const cand = candidates[idx];
      const key = normalizeWorkoutKey(cand.name);
      if (!recent.includes(key)) {
        return cand;
      }
    }

    // 2. Si todos fueron usados en la ventana (LRU fallback)
    let oldestIndex = preferredIndex % candidates.length;
    let oldestPos = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const idx = (preferredIndex + i) % candidates.length;
      const cand = candidates[idx];
      const key = normalizeWorkoutKey(cand.name);
      const pos = recent.lastIndexOf(key);
      if (pos < oldestPos) {
        oldestPos = pos;
        oldestIndex = idx;
      }
    }

    return candidates[oldestIndex];
  }
}

/**
 * Calcula la repetición dinámica ajustada según la posición en el mesociclo.
 */
export function calculateProgressiveReps(baseReps: number, step: number, isRecovery: boolean): number {
  if (baseReps <= 1) return baseReps;

  if (isRecovery) {
    // Deload biológico: reducir un 35-45% el volumen de repeticiones manteniendo intensidad
    return Math.max(2, Math.round(baseReps * 0.60));
  }

  // Mesociclo de 3 pasos (Paso 1: adaptación, Paso 2: consolidación, Paso 3: sobrecarga)
  if (baseReps <= 4) {
    // Para repeticiones largas (ej. 3x 15m, 4x 8m):
    // Paso 1: base - 1 | Paso 2: base | Paso 3: base + 1
    if (step === 1) return Math.max(2, baseReps - 1);
    if (step === 3) return baseReps + 1;
    return baseReps;
  }

  if (baseReps <= 8) {
    // Para repeticiones medias (ej. 5x 1000m, 6x 800m):
    // Paso 1: base - 1 | Paso 2: base | Paso 3: base + 1
    if (step === 1) return Math.max(3, baseReps - 1);
    if (step === 3) return baseReps + 1;
    return baseReps;
  }

  // Para micro-intervalos altos (ej. 10x 30s, 12x 200m):
  // Paso 1: base - 2 | Paso 2: base | Paso 3: base + 2
  if (step === 1) return Math.max(6, baseReps - 2);
  if (step === 3) return baseReps + 2;
  return baseReps;
}

/**
 * Aplica sobrecarga progresiva paramétrica sobre el texto de un workout (doc y título).
 */
export function applyParametricProgression(
  workout: ProgressionTargetWorkout,
  params: ParametricProgressionParams
): ProgressionTargetWorkout {
  const { weekNumber, phase = "BASE", isRecovery = false } = params;

  // En tapering o semanas de carrera, mantener los afinamientos puros sin alterar repeticiones
  if (phase === "TAPER" || phase === "RACE_WEEK") {
    return workout;
  }

  // Detectar bloque de repeticiones en el workoutDoc: "4x\n" o "Main Set 5x\n"
  const docRepMatch = workout.workoutDoc.match(/^(?:Main Set\s+)?(\d+)x\s*$/im);
  // Detectar repeticiones en el nombre: "(5x 1000m)" o "(4x 8m)" o "(3x 15m)"
  const titleRepMatch = workout.name.match(/\((\d+)x\s*([^)]+)\)/i);

  if (!docRepMatch && !titleRepMatch) {
    return workout;
  }

  const baseReps = docRepMatch ? parseInt(docRepMatch[1], 10) : parseInt(titleRepMatch![1], 10);
  if (Number.isNaN(baseReps) || baseReps <= 1) {
    return workout;
  }

  // Determinar paso dentro del bloque de 3 semanas de carga (1, 2, 3)
  const mesocycleStep = ((weekNumber - 1) % 4) + 1; // 1, 2, 3 o 4 (recup)
  const effectiveStep = Math.min(3, Math.max(1, mesocycleStep));
  const newReps = calculateProgressiveReps(baseReps, effectiveStep, isRecovery);

  if (newReps === baseReps && !isRecovery) {
    return workout;
  }

  let updatedDoc = workout.workoutDoc;
  if (docRepMatch) {
    updatedDoc = updatedDoc.replace(/^(?:Main Set\s+)?\d+x\s*$/im, (match) =>
      match.toLowerCase().includes("main set") ? `Main Set ${newReps}x` : `${newReps}x`
    );
  }

  let updatedName = workout.name;
  if (titleRepMatch) {
    const unitPart = titleRepMatch[2];
    updatedName = updatedName.replace(/\((\d+)x\s*([^)]+)\)/i, `(${newReps}x ${unitPart})`);
  } else if (docRepMatch) {
    updatedName = `${updatedName} (${newReps} series)`;
  }

  // Si es semana de descarga, agregar nota de asimilación
  let updatedJust = workout.justification;
  if (isRecovery) {
    updatedName = updatedName.replace(/\)$/, " - Asimilación)");
    updatedJust = `${workout.justification} Volumen de series reducido a ${newReps} repeticiones para asimilación biológica activa.`;
  } else if (newReps > baseReps) {
    updatedJust = `${workout.justification} Sobrecarga progresiva: incrementado a ${newReps} repeticiones (Paso ${effectiveStep} del mesociclo).`;
  }

  // Ajustar duración y TSS proporcionalmente a la diferencia de series
  const repDiffRatio = newReps / baseReps;
  const baseDur = workout.durationMin || 50;
  // El calentamiento y enfriamiento (~20m) no cambian, solo cambia la parte principal
  const mainDur = Math.max(10, baseDur - 20);
  const adjustedDur = Math.round(20 + mainDur * repDiffRatio);
  const baseTss = workout.tss || Math.round(baseDur * 0.9);
  const adjustedTss = Math.round(baseTss * (0.3 + 0.7 * repDiffRatio));

  return {
    ...workout,
    name: updatedName,
    workoutDoc: updatedDoc,
    justification: updatedJust,
    durationMin: adjustedDur,
    tss: adjustedTss,
  };
}
