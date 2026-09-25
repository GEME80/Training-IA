/**
 * Generador de workouts de Tirada Larga Periodizada (Canova, Pfitzinger & Daniels)
 * Varía los estímulos dominicales evitando la monotonía de solo volumen Z2.
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
}): LongRunStructureResult {
  const { baseKm, baseMins, phase, weekNumber, countdown, isPeak, runFtp } = params;

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
      return `${pctA}-${pctB}% CP${note ? ` (${note})` : ""}`;
    }
    return `${pctA}% CP${note ? ` (${note})` : ""}`;
  };

  if (isPeak) {
    if (countdown <= 3 && countdown > 1) {
      return {
        workoutName: `📉 DESCENSO PICO — Transición a Tapering (${baseKm} km / ${baseMins}m @ Ritmo Carrera)`,
        powerTarget: fmtPwr(88, 92, "Ritmo de Carrera"),
        workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Ritmo Específico)\n- 25m 90% FTP\n- ${Math.max(10, baseMins - 50)}m 81% FTP\n\nCooldown\n- 10m 65% FTP`,
      };
    }
    return {
      workoutName: `🔥 FONDO CUMBRE ESPECÍFICO CANOVA (${baseKm} km / ${baseMins}m con Bloques de Ritmo Carrera)`,
      powerTarget: fmtPwr(90, 94, "Ritmo de Carrera"),
      workoutDoc: `Warmup\n- 20m 75% FTP\n\n2x (Bloques Específicos Canova)\n- 25m 92% FTP\n- 5m 75% FTP\n\nMain (Z2)\n- ${Math.max(10, baseMins - 85)}m 82% FTP\n\nCooldown\n- 10m 65% FTP`,
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
        workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Base Aeróbica)\n- ${Math.max(10, easyMins)}m 81% FTP\n\nFast-Finish (Ritmo Específico)\n- ${fastMins}m 90% FTP\n\nCooldown\n- 10m 65% FTP`,
      };
    }
    if (styleIdx === 1) {
      // Bloques de Ritmo Maratón / Medio Maratón Intercalados
      const blockMins = Math.min(20, Math.max(12, Math.round(baseMins * 0.16)));
      const baseSub = baseMins - (blockMins * 2 + 5) - 25;
      return {
        workoutName: `Tirada Larga con Bloques de Ritmo Específico (${baseKm} km con 2x${blockMins}m @ 90% CP)`,
        powerTarget: fmtPwr(90, undefined, "Bloques de Ritmo"),
        workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Z2)\n- ${Math.max(10, Math.round(baseSub / 2))}m 81% FTP\n\n2x\n- ${blockMins}m 90% FTP\n- 5m 74% FTP\n\nMain (Z2)\n- ${Math.max(10, Math.round(baseSub / 2))}m 81% FTP\n\nCooldown\n- 10m 65% FTP`,
      };
    }
    // Fartlek Aeróbico de Fondo
    return {
      workoutName: `Tirada Larga Ondulada con Cambios de Ritmo Aeróbico (${baseKm} km / ${baseMins}m)`,
      powerTarget: fmtPwr(80, 88, "Ondulaciones"),
      workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Z2)\n- ${Math.max(15, baseMins - 55)}m 81% FTP\n\n3x (Flotaciones Dinámicas)\n- 5m 88% FTP\n- 3m 75% FTP\n\nCooldown\n- 10m 65% FTP`,
    };
  }

  // BASE: Alternancia de Construcción Aeróbica Pura y Progresión Suave
  if (weekNumber % 2 === 0) {
    const finalProgMins = Math.min(15, Math.max(10, Math.round(baseMins * 0.15)));
    return {
      workoutName: `Tirada Larga Aeróbica con Progresión Final (${baseKm} km / ${baseMins}m Z2)`,
      powerTarget: fmtPwr(80, 85, "Z2 -> Progresión Final"),
      workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Z2 Cómoda)\n- ${Math.max(15, baseMins - finalProgMins - 25)}m 81% FTP\n\nFinal Ágil\n- ${finalProgMins}m 85% FTP\n\nCooldown\n- 10m 65% FTP`,
    };
  }

  return {
    workoutName: `Tirada Larga de Construcción Aeróbica Z2 (${baseKm} km / ${baseMins}m)`,
    powerTarget: fmtPwr(80, 83, "Z2 Base"),
    workoutDoc: `Warmup\n- 15m 74% FTP\n\nMain (Z2 Cómoda)\n- ${Math.max(10, baseMins - 25)}m 82% FTP\n\nCooldown\n- 10m 65% FTP`,
  };
}
