import { DailyExecutedActivity } from "@/lib/intervals/types";

export interface TelemetryMetricItem {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  athleteExplanation: string;
  colorClass: string;
  badgeType: "pace" | "power" | "hr" | "ef" | "cadence" | "elevation" | "duration" | "rpe";
}

/**
 * Transforma y formatea los datos de telemetría de una actividad ejecutada en Intervals.icu
 * adaptando unidades a la disciplina (km/h vs min/km, rpm vs spm), redondeando decimales
 * y asociando una explicación pedagógica clara para el atleta.
 */
export function buildTelemetryMetricItems(
  act: DailyExecutedActivity,
  discipline?: string
): TelemetryMetricItem[] {
  const isRide =
    discipline === "Ciclismo" ||
    /ride|cycling|bike|virtualride|indoor/i.test(act.type || "");

  // 1. Ritmo o Velocidad
  let paceValue = "—";
  let paceSub: string | undefined = undefined;
  if (isRide) {
    if (act.paceStr && act.paceStr.includes("km/h")) {
      paceValue = act.paceStr;
    } else if (act.distanceKm && act.movingTimeMin && act.movingTimeMin > 0) {
      paceValue = `${((act.distanceKm / (act.movingTimeMin / 60))).toFixed(1)} km/h`;
    }
    paceSub = "Promedio en movimiento";
  } else {
    if (act.paceStr) {
      paceValue = act.paceStr.endsWith("/km") ? act.paceStr : `${act.paceStr}/km`;
    } else if (act.distanceKm && act.movingTimeMin && act.movingTimeMin > 0) {
      const totalSec = (act.movingTimeMin * 60) / act.distanceKm;
      paceValue = `${Math.floor(totalSec / 60)}:${String(Math.round(totalSec % 60)).padStart(2, "0")}/km`;
    }
    if (act.gapPaceStr) {
      const cleanGap = act.gapPaceStr.endsWith("/km") ? act.gapPaceStr : `${act.gapPaceStr}/km`;
      paceSub = `GAP ${cleanGap}`;
    }
  }

  // 2. Eficiencia y Desacople redondeados
  const efFormatted =
    typeof act.efficiencyFactor === "number" && !isNaN(act.efficiencyFactor)
      ? `EF ${act.efficiencyFactor.toFixed(2)}`
      : undefined;
  const decFormatted =
    typeof act.cardiacDecoupling === "number" && !isNaN(act.cardiacDecoupling)
      ? `D ${act.cardiacDecoupling.toFixed(1)}%`
      : undefined;

  // 3. Cadencia
  const cadUnit = isRide ? "rpm" : "spm";
  const cadValue = act.cadence ? `${act.cadence} ${cadUnit}` : "—";
  const cadSub = !isRide && act.strideLengthM ? `Zancada ${act.strideLengthM.toFixed(2)}m` : undefined;

  // 4. Desnivel
  const elevValue =
    act.elevationGainM !== undefined && act.elevationGainM > 0
      ? `+${act.elevationGainM}m`
      : isRide
      ? "0m (Indoor)"
      : "—";

  return [
    {
      id: "pace",
      label: isRide ? "VELOCIDAD" : "RITMO / GAP",
      value: paceValue,
      subtext: paceSub,
      colorClass: "text-slate-800 dark:text-slate-200",
      badgeType: "pace",
      athleteExplanation: isRide
        ? "Velocidad media de avance (km/h) registrada por tu GPS o ciclo-computador."
        : "Ritmo medio por km. El GAP (Ritmo Ajustado a Pendiente) simula tu ritmo equivalente en plano restando o sumando las cuestas.",
    },
    {
      id: "power",
      label: "POTENCIA (W)",
      value: act.watts ? `${act.watts}W` : "—",
      subtext: act.weightedWatts ? `NP ${act.weightedWatts}W` : undefined,
      colorClass: "text-amber-600 dark:text-amber-400",
      badgeType: "power",
      athleteExplanation:
        "Fuerza en vatios transmitida en cada pedalazo o zancada. NP (Potencia Normalizada) pondera los picos de fatiga para medir el desgaste metabólico real.",
    },
    {
      id: "hr",
      label: "CARDIO (FC)",
      value: act.heartrate ? `${act.heartrate} bpm` : "—",
      subtext: act.maxHeartrate ? `Máx ${act.maxHeartrate} bpm` : undefined,
      colorClass: "text-rose-600 dark:text-rose-400",
      badgeType: "hr",
      athleteExplanation:
        "Pulsaciones por minuto de tu corazón. Permite comprobar si tu esfuerzo cardiovascular se mantuvo en la zona aeróbica prescrita.",
    },
    {
      id: "ef",
      label: "EFICIENCIA / D%",
      value: efFormatted || (act.movingTimeMin ? `${act.movingTimeMin}m` : "—"),
      subtext: decFormatted,
      colorClass: "text-cyan-600 dark:text-cyan-400",
      badgeType: "ef",
      athleteExplanation:
        "EF = Vatios producidos por cada latido (a mayor número, mayor economía aeróbica). D% (Desacople Cardíaco) mide la fatiga o deriva de pulso en la segunda mitad (ideal < 5%).",
    },
    {
      id: "cadence",
      label: isRide ? "CADENCIA (RPM)" : "CADENCIA / PASO",
      value: cadValue,
      subtext: cadSub,
      colorClass: "text-indigo-600 dark:text-indigo-400",
      badgeType: "cadence",
      athleteExplanation: isRide
        ? "Revoluciones de pedal por minuto (rpm). Rodar a 90-100 rpm ahorra glucógeno muscular."
        : "Pasos por minuto (spm) y longitud de zancada. Una cadencia fluida (160-180 ppm) previene lesiones articulares y optimiza el rebote elástico.",
    },
    {
      id: "elevation",
      label: "DESNIVEL / CALORÍAS",
      value: elevValue,
      subtext: act.calories ? `${act.calories} kcal` : undefined,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      badgeType: "elevation",
      athleteExplanation:
        "Metros positivos de subida ascendidos durante la ruta y energía calórica total consumida por tu cuerpo.",
    },
    {
      id: "duration",
      label: "DURACIÓN REAL",
      value: `${act.movingTimeMin} min (${act.distanceKm || 0} km)`,
      subtext: act.intensityPercent ? `Intensidad ${act.intensityPercent}%` : undefined,
      colorClass: "text-slate-800 dark:text-slate-200",
      badgeType: "duration",
      athleteExplanation:
        "Tiempo neto pedaleando o corriendo y porcentaje de exigencia respecto a tu umbral funcional (FTP o ritmo umbral).",
    },
    {
      id: "rpe",
      label: "SENSACIÓN / RPE",
      value: act.rpe ? `RPE ${act.rpe}/10` : "RPE 4/10",
      subtext: act.feel ? `Sensación: ${act.feel}` : "Sensación: Óptima",
      colorClass: "text-amber-600 dark:text-amber-400",
      badgeType: "rpe",
      athleteExplanation:
        "RPE (Esfuerzo Percibido del 1 al 10) y sensación subjetiva reportada por el atleta al terminar.",
    },
  ];
}
