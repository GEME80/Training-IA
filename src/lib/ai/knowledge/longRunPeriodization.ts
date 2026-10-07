/**
 * Generador de workouts de Tirada Larga Periodizada por Disciplina Deportiva.
 * - Maratón (42K): Métodos Canova, Pfitzinger Fast-Finish y Progresivos de 30-34 km.
 * - Triatlón Olímpico / Sprint: Capping estricto (50-65m), ritmo 10K y transiciones T2. Cero Canova.
 * - Triatlón 70.3: Capping (70-85m) y ritmo específico de media distancia.
 * - 5K / 10K Ruta: Capping (45-55m) y soltura neuromuscular con rectas.
 */

export interface LongRunStructureResult {
  workoutName: string;
  powerTarget: string;
  workoutDoc: string;
}

export function buildDynamicLongRunStructure(params: {
  baseKm: number;
  baseMins: number;
  phase: string;
  weekNumber: number;
  countdown: number;
  isPeak: boolean;
  runFtp?: number;
  modelId?: string;
  sportCategory?: string;
  targetDistanceKm?: number;
}): LongRunStructureResult {
  const {
    baseKm: rawKm,
    baseMins: rawMins,
    phase,
    weekNumber,
    countdown,
    isPeak,
    runFtp,
    modelId,
    sportCategory,
    targetDistanceKm,
  } = params;

  const fmtPwr = (pctA: number, pctB?: number, note?: string) => {
    if (runFtp && runFtp > 0) {
      if (pctB !== undefined && pctB !== pctA) {
        const wA = Math.round(runFtp * (pctA / 100));
        const wB = Math.round(runFtp * (pctB / 100));
        return `${wA}-${wB}W (${pctA}-${pctB}% CP${note ? ` • ${note}` : ""})`;
      }
      const w = Math.round(runFtp * (pctA / 100));
      return `${w}W (${pctA}% CP${note ? ` • ${note}` : ""})`;
    }
    if (pctB !== undefined && pctB !== pctA) {
      return `${pctA}-${pctB}% Pace${note ? ` (${note})` : ""}`;
    }
    return `${pctA}% Pace${note ? ` (${note})` : ""}`;
  };

  const isTriShort =
    modelId === "TRIATHLON_SHORT" ||
    (sportCategory === "Triathlon" && targetDistanceKm !== undefined && targetDistanceKm <= 60);

  const isTri703 =
    modelId === "TRIATHLON_70_3" ||
    (sportCategory === "Triathlon" && targetDistanceKm !== undefined && targetDistanceKm > 60 && targetDistanceKm <= 120);

  const isRoadSpeed =
    sportCategory === "Running" &&
    targetDistanceKm !== undefined &&
    targetDistanceKm <= 10;

  // ══════════════════════════════════════════════════════════════
  // 1. TRIATLÓN OLÍMPICO / SPRINT (Cero Maratón, Cero Canova)
  // ══════════════════════════════════════════════════════════════
  if (isTriShort) {
    const cappedMins = Math.min(65, Math.max(35, rawMins));
    const cappedKm = Math.min(13, Math.max(7, rawKm));

    if (isPeak) {
      return {
        workoutName: `Simulación de Carrera a Pie Triatlón Olímpico (${cappedKm} km / ${cappedMins}m @ Ritmo 10K)`,
        powerTarget: fmtPwr(90, 94, "Ritmo 10K Triatlón"),
        workoutDoc: `Warmup\n- 15m 75% CP Activación\n\nMain (Ritmo Específico 10K)\n2x\n- 12m 92% CP\n- 3m 74% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    if (phase === "BUILD") {
      return {
        workoutName: `Tirada Progresiva Triatlón con Zancada Viva (${cappedKm} km / ${cappedMins}m)`,
        powerTarget: fmtPwr(80, 88, "Progresión Z2->Z3"),
        workoutDoc: `Warmup\n- 12m 74% CP\n\nMain (Z2 Cómoda)\n- ${Math.max(10, cappedMins - 32)}m 80% CP\n\nFinal Vivo (Ritmo Carrera)\n- 10m 88% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    if (phase === "TAPER") {
      const taperM = Math.min(40, cappedMins);
      return {
        workoutName: `Rodaje Suave Pre-Triatlón con Strides (${Math.min(8, cappedKm)} km / ${taperM}m)`,
        powerTarget: fmtPwr(74, 105, "Z2 + Strides"),
        workoutDoc: `Warmup\n- 10m 74% CP\n\nMain\n- 15m 78% CP\n4x\n- 20s 105% CP\n- 40s 65% CP\n\nCooldown\n- 5m 72% CP`,
      };
    }
    // BASE
    return {
      workoutName: `Rodaje Aeróbico de Asimilación & Cadencia (${cappedKm} km / ${cappedMins}m Z2)`,
      powerTarget: fmtPwr(76, 81, "Z2 Base"),
      workoutDoc: `Warmup\n- 10m 74% CP\n\nMain (Z2 Cómoda)\n- ${Math.max(10, cappedMins - 20)}m 80% CP (180 spm)\n\nCooldown\n- 10m 72% CP`,
    };
  }

  // ══════════════════════════════════════════════════════════════
  // 2. TRIATLÓN 70.3 (MEDIA DISTANCIA - RITMO ESPECÍFICO Z3 TEMPO)
  // ══════════════════════════════════════════════════════════════
  if (isTri703) {
    const cappedMins = Math.min(85, Math.max(45, rawMins));
    const cappedKm = Math.min(18, Math.max(10, rawKm));

    if (isPeak) {
      return {
        workoutName: `Tirada Específica Ritmo 70.3 con Flotaciones (${cappedKm} km / ${cappedMins}m)`,
        powerTarget: fmtPwr(85, 88, "Ritmo 70.3"),
        workoutDoc: `Warmup\n- 15m 75% CP\n\nMain (Intervalos Ritmo 70.3)\n3x\n- 15m 87% CP\n- 3m 78% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    if (phase === "BUILD") {
      return {
        workoutName: `Tirada Específica 70.3 con Bloque de Ritmo Carrera (${cappedKm} km / ${cappedMins}m)`,
        powerTarget: fmtPwr(80, 88, "Z2 Base -> Ritmo 70.3"),
        workoutDoc: `Warmup\n- 15m 75% CP\n\nMain (Z2 Base)\n- ${Math.max(15, cappedMins - 45)}m 80% CP\n\nMain (Ritmo Específico 70.3)\n- 20m 87% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    return {
      workoutName: `Rodaje Aeróbico Continuo 70.3 (${cappedKm} km / ${cappedMins}m Z2)`,
      powerTarget: fmtPwr(76, 81, "Z2 Base Activa"),
      workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Z2 Cómoda)\n- ${Math.max(15, cappedMins - 25)}m 80% CP\n\nCooldown\n- 10m 72% CP`,
    };
  }

  // ══════════════════════════════════════════════════════════════
  // 3. 5K / 10K RUTA (Cero Canova 42K)
  // ══════════════════════════════════════════════════════════════
  if (isRoadSpeed) {
    const cappedMins = Math.min(55, Math.max(35, rawMins));
    const cappedKm = Math.min(11, Math.max(6, rawKm));
    return {
      workoutName: `Rodaje Aeróbico Z2 + Rectas de Frecuencia (${cappedKm} km / ${cappedMins}m)`,
      powerTarget: fmtPwr(76, 105, "Z2 + Rectas"),
      workoutDoc: `Warmup\n- 10m 74% CP\n\nMain (Z2)\n- ${Math.max(15, cappedMins - 25)}m 80% CP\n\nRectas Finales\n5x\n- 20s 105% CP\n- 40s 65% CP\n\nCooldown\n- 5m 72% CP`,
    };
  }

  // ══════════════════════════════════════════════════════════════
  // 4. MARATÓN 42.195 KM (100% INTACTO E INALTERADO)
  // ══════════════════════════════════════════════════════════════
  const baseKm = rawKm;
  const baseMins = rawMins;

  if (isPeak) {
    if (countdown <= 3 && countdown > 1) {
      return {
        workoutName: `📉 DESCENSO PICO — Transición a Tapering (${baseKm} km / ${baseMins}m @ Ritmo Carrera)`,
        powerTarget: fmtPwr(88, 92, "Ritmo de Carrera"),
        workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Ritmo Específico)\n- 25m 90% FTP\n- ${Math.max(10, baseMins - 50)}m 81% FTP\n\nCooldown\n- 10m 72% FTP`,
      };
    }
    return {
      workoutName: `🔥 FONDO CUMBRE ESPECÍFICO CANOVA (${baseKm} km / ${baseMins}m con Bloques de Ritmo Carrera)`,
      powerTarget: fmtPwr(90, 94, "Ritmo de Carrera"),
      workoutDoc: `Warmup\n- 20m 75% CP\n\nMain (Bloques Canova)\n2x\n- 25m 92% CP\n- 5m 75% CP\n\nMain (Z2)\n- ${Math.max(10, baseMins - 85)}m 82% CP\n\nCooldown\n- 10m 72% CP`,
    };
  }

  if (phase === "BUILD") {
    // Alternancia 3:1 de estímulos en BUILD: Fast-Finish vs Bloques Ritmo vs Progresivo
    const styleIdx = (weekNumber - 1) % 3;
    if (styleIdx === 0) {
      // Fast-Finish Pfitzinger
      const fastMins = Math.min(25, Math.max(15, Math.round(baseMins * 0.22)));
      const easyMins = baseMins - fastMins - 25;
      const targetStr = runFtp && runFtp > 0
        ? `${Math.round(runFtp * 0.81)}W Z2 -> ${Math.round(runFtp * 0.90)}W Final (81%->90% CP)`
        : "81% CP Z2 -> Aceleración final 90% CP";
      return {
        workoutName: `Tirada Larga Progresiva "Fast-Finish" Pfitzinger (${baseKm} km / ${baseMins}m)`,
        powerTarget: targetStr,
        workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Base Aeróbica)\n- ${Math.max(10, easyMins)}m 81% CP\n\nFast-Finish (Ritmo Específico)\n- ${fastMins}m 90% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    if (styleIdx === 1) {
      // Bloques de Ritmo Maratón Intercalados
      const blockMins = Math.min(20, Math.max(12, Math.round(baseMins * 0.16)));
      const baseSub = baseMins - (blockMins * 2 + 5) - 25;
      return {
        workoutName: `Tirada Larga con Bloques de Ritmo Específico (${baseKm} km con 2x${blockMins}m @ 90% CP)`,
        powerTarget: fmtPwr(90, undefined, "Bloques de Ritmo"),
        workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Z2)\n- ${Math.max(10, Math.round(baseSub / 2))}m 81% CP\n\n2x\n- ${blockMins}m 90% CP\n- 5m 74% CP\n\nMain (Z2)\n- ${Math.max(10, Math.round(baseSub / 2))}m 81% CP\n\nCooldown\n- 10m 72% CP`,
      };
    }
    // Fartlek Aeróbico de Fondo
    return {
      workoutName: `Tirada Larga Ondulada con Cambios de Ritmo Aeróbico (${baseKm} km / ${baseMins}m)`,
      powerTarget: fmtPwr(80, 88, "Ondulaciones"),
      workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Z2)\n- ${Math.max(15, baseMins - 55)}m 81% CP\n\nMain (Flotaciones Dinámicas)\n3x\n- 5m 88% CP\n- 3m 75% CP\n\nCooldown\n- 10m 72% CP`,
    };
  }

  // BASE: Alternancia de Construcción Aeróbica Pura y Progresión Suave
  if (weekNumber % 2 === 0) {
    const finalProgMins = Math.min(15, Math.max(10, Math.round(baseMins * 0.15)));
    return {
      workoutName: `Tirada Larga Aeróbica con Progresión Final (${baseKm} km / ${baseMins}m Z2)`,
      powerTarget: fmtPwr(80, 85, "Z2 -> Progresión Final"),
      workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Z2 Cómoda)\n- ${Math.max(15, baseMins - finalProgMins - 25)}m 81% CP\n\nFinal Ágil\n- ${finalProgMins}m 85% CP\n\nCooldown\n- 10m 72% CP`,
    };
  }

  return {
    workoutName: `Tirada Larga de Construcción Aeróbica Z2 (${baseKm} km / ${baseMins}m)`,
    powerTarget: fmtPwr(80, 83, "Z2 Base"),
    workoutDoc: `Warmup\n- 15m 74% CP\n\nMain (Z2 Cómoda)\n- ${Math.max(10, baseMins - 25)}m 82% CP\n\nCooldown\n- 10m 72% CP`,
  };
}
