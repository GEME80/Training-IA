import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { MetricCardConfig, METRIC_ICONS_MAP } from "./PhysiologicalMetricCard";

export interface MetricBuilderParams {
  status: PhysiologicalStatus | null;
  runFtp?: number | null;
  bikeFtp?: number | null;
  weightKg?: number | null;
  age?: number | null;
  restingHR?: number | null;
  hrv?: number | null;
  sleepQuality?: number | null;
  sleepSecs?: number | null;
  efficiencyFactor?: number | null;
  runThresholdPaceStr?: string | null;
  swimCssStr?: string | null;
}

export function getTsbColor(tsb: number): string {
  if (tsb > 5) return "text-emerald-600 dark:text-emerald-400";
  if (tsb >= -15) return "text-teal-600 dark:text-teal-400";
  if (tsb >= -25) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function getTsbContextLabel(tsb: number): string {
  if (tsb > 5) return "frescura";
  if (tsb >= -15) return "óptimo";
  if (tsb >= -25) return "sobrecarga";
  return "fatiga";
}

export function buildMetricConfigs(p: MetricBuilderParams): Record<string, MetricCardConfig> {
  const { status, runFtp, bikeFtp, weightKg, age, restingHR, hrv, sleepQuality, sleepSecs, efficiencyFactor, runThresholdPaceStr, swimCssStr } = p;
  if (!status) return {};

  const formattedRampRate = Number(status.rampRate || 0).toFixed(1);
  const rampDisplay = Number(formattedRampRate) > 0 ? `+${formattedRampRate}` : formattedRampRate;
  const wKgRun = runFtp && weightKg ? (runFtp / weightKg).toFixed(2) : null;
  const wKgBike = bikeFtp && weightKg ? (bikeFtp / weightKg).toFixed(2) : null;
  const tanakaMaxHR = age ? Math.round(208 - 0.7 * age) : null;
  const currentHrv = hrv || status.currentHrv;
  const currentRhr = restingHR || status.restingHR;
  const sleepHours = sleepSecs ? (sleepSecs / 3600).toFixed(1) : null;

  return {
    ctl: {
      id: "ctl",
      title: "Forma Física",
      badge: "CTL",
      badgeColor: "text-blue-600 dark:text-blue-400",
      value: Number(status.ctl || 0).toFixed(1),
      contextLabel: "nivel",
      tooltip: "Nivel de forma aeróbica acumulado en las últimas 6 semanas (CTL)",
      hoverBorder: "hover:border-blue-400 hover:ring-2 hover:ring-blue-400/20",
      icon: METRIC_ICONS_MAP.ctl.icon,
      iconColor: METRIC_ICONS_MAP.ctl.color,
      iconBgColor: METRIC_ICONS_MAP.ctl.bg,
    },
    atl: {
      id: "atl",
      title: "Fatiga",
      badge: "ATL",
      badgeColor: "text-amber-600 dark:text-amber-400",
      value: Number(status.atl || 0).toFixed(1),
      valueColor: "text-amber-600 dark:text-amber-400",
      contextLabel: "reciente",
      tooltip: "Cansancio muscular y cardiovascular acumulado en los últimos 7 días (ATL)",
      hoverBorder: "hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20",
      icon: METRIC_ICONS_MAP.atl.icon,
      iconColor: METRIC_ICONS_MAP.atl.color,
      iconBgColor: METRIC_ICONS_MAP.atl.bg,
    },
    tsb: {
      id: "tsb",
      title: "Frescura",
      badge: "TSB",
      badgeColor: "text-emerald-600 dark:text-emerald-400",
      value: status.tsb > 0 ? `+${Math.round(status.tsb)}` : `${Math.round(status.tsb)}`,
      valueColor: getTsbColor(status.tsb),
      contextLabel: getTsbContextLabel(status.tsb),
      tooltip: "Disponibilidad física y energía para rendir hoy (TSB)",
      hoverBorder: "hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20",
      icon: METRIC_ICONS_MAP.tsb.icon,
      iconColor: METRIC_ICONS_MAP.tsb.color,
      iconBgColor: METRIC_ICONS_MAP.tsb.bg,
    },
    rampRate: {
      id: "rampRate",
      title: "Progresión",
      badge: "/sem",
      badgeColor: "text-teal-600 dark:text-teal-400",
      value: rampDisplay,
      contextLabel: "ritmo",
      tooltip: "Incremento semanal de carga de forma segura y sin riesgo de lesión",
      hoverBorder: "hover:border-teal-400 hover:ring-2 hover:ring-teal-400/20",
      icon: METRIC_ICONS_MAP.rampRate.icon,
      iconColor: METRIC_ICONS_MAP.rampRate.color,
      iconBgColor: METRIC_ICONS_MAP.rampRate.bg,
    },
    strydCp: {
      id: "strydCp",
      title: "Potencia Run",
      badge: "Watts",
      badgeColor: "text-amber-600 dark:text-amber-400",
      value: runFtp && runFtp > 0 ? `${runFtp} W` : "—",
      valueColor: "text-amber-600 dark:text-amber-400",
      contextLabel: "umbral",
      tooltip: "Vatios umbral para correr a ritmo exigente y sostenible (Stryd CP)",
      hoverBorder: "hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20",
      icon: METRIC_ICONS_MAP.strydCp.icon,
      iconColor: METRIC_ICONS_MAP.strydCp.color,
      iconBgColor: METRIC_ICONS_MAP.strydCp.bg,
    },
    bikeFtp: {
      id: "bikeFtp",
      title: "Potencia Bici",
      badge: "Watts",
      badgeColor: "text-sky-600 dark:text-sky-400",
      value: bikeFtp && bikeFtp > 0 ? `${bikeFtp} W` : "—",
      valueColor: "text-sky-600 dark:text-sky-400",
      contextLabel: "FTP",
      tooltip: "Tus vatios umbral pedaleando durante 1 hora (FTP Ciclismo)",
      hoverBorder: "hover:border-sky-400 hover:ring-2 hover:ring-sky-400/20",
      icon: METRIC_ICONS_MAP.bikeFtp.icon,
      iconColor: METRIC_ICONS_MAP.bikeFtp.color,
      iconBgColor: METRIC_ICONS_MAP.bikeFtp.bg,
    },
    runPace: {
      id: "runPace",
      title: "Ritmo Carrera",
      badge: "min/km",
      badgeColor: "text-emerald-600 dark:text-emerald-400",
      value: runThresholdPaceStr || "4:45",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      contextLabel: "umbral",
      tooltip: "Ritmo umbral de carrera sostenible en series e intervalos",
      hoverBorder: "hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20",
      icon: METRIC_ICONS_MAP.runPace.icon,
      iconColor: METRIC_ICONS_MAP.runPace.color,
      iconBgColor: METRIC_ICONS_MAP.runPace.bg,
    },
    swimCss: {
      id: "swimCss",
      title: "Natación CSS",
      badge: "100m",
      badgeColor: "text-cyan-600 dark:text-cyan-400",
      value: swimCssStr || "1:45",
      valueColor: "text-cyan-600 dark:text-cyan-400",
      contextLabel: "umbral",
      tooltip: "Velocidad crítica de nado (CSS) sostenible por cada 100 metros",
      hoverBorder: "hover:border-cyan-400 hover:ring-2 hover:ring-cyan-400/20",
      icon: METRIC_ICONS_MAP.swimCss.icon,
      iconColor: METRIC_ICONS_MAP.swimCss.color,
      iconBgColor: METRIC_ICONS_MAP.swimCss.bg,
    },
    hrv: {
      id: "hrv",
      title: "Recuperación",
      badge: "HRV",
      badgeColor: "text-rose-600 dark:text-rose-400",
      value: currentHrv ? `${currentHrv} ms` : "—",
      valueColor: "text-rose-600 dark:text-rose-400",
      contextLabel: status.hrvZScore != null ? `Z ${status.hrvZScore > 0 ? `+${status.hrvZScore}` : status.hrvZScore}` : "vagal",
      tooltip: "Variabilidad cardíaca: qué tan recuperado está tu sistema nervioso (HRV)",
      hoverBorder: "hover:border-rose-400 hover:ring-2 hover:ring-rose-400/20",
      icon: METRIC_ICONS_MAP.hrv.icon,
      iconColor: METRIC_ICONS_MAP.hrv.color,
      iconBgColor: METRIC_ICONS_MAP.hrv.bg,
    },
    restingHr: {
      id: "restingHr",
      title: "FC Reposo",
      badge: "RHR",
      badgeColor: "text-purple-600 dark:text-purple-400",
      value: currentRhr ? `${currentRhr} bpm` : "—",
      valueColor: "text-purple-600 dark:text-purple-400",
      contextLabel: "basal",
      tooltip: "Frecuencia cardíaca en reposo matutina (RHR)",
      hoverBorder: "hover:border-purple-400 hover:ring-2 hover:ring-purple-400/20",
      icon: METRIC_ICONS_MAP.restingHr.icon,
      iconColor: METRIC_ICONS_MAP.restingHr.color,
      iconBgColor: METRIC_ICONS_MAP.restingHr.bg,
    },
    sleep: {
      id: "sleep",
      title: "Sueño",
      badge: "Sleep",
      badgeColor: "text-indigo-600 dark:text-indigo-400",
      value: sleepHours ? `${sleepHours}h` : sleepQuality ? `${sleepQuality}%` : "—",
      valueColor: "text-indigo-600 dark:text-indigo-400",
      contextLabel: "descanso",
      tooltip: "Calidad y horas de sueño sincronizado",
      hoverBorder: "hover:border-indigo-400 hover:ring-2 hover:ring-indigo-400/20",
      icon: METRIC_ICONS_MAP.sleep.icon,
      iconColor: METRIC_ICONS_MAP.sleep.color,
      iconBgColor: METRIC_ICONS_MAP.sleep.bg,
    },
    wKg: {
      id: "wKg",
      title: "W/kg",
      badge: weightKg ? `${weightKg}kg` : "Relativo",
      badgeColor: "text-emerald-600 dark:text-emerald-400",
      value: wKgRun ? `${wKgRun} R` : wKgBike ? `${wKgBike} B` : "—",
      contextLabel: "potencia/peso",
      tooltip: "Potencia relativa por kilo de peso corporal",
      hoverBorder: "hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/20",
      icon: METRIC_ICONS_MAP.wKg.icon,
      iconColor: METRIC_ICONS_MAP.wKg.color,
      iconBgColor: METRIC_ICONS_MAP.wKg.bg,
    },
    ageBiometrics: {
      id: "ageBiometrics",
      title: "Edad",
      badge: tanakaMaxHR ? `${tanakaMaxHR} max` : "Tanaka",
      badgeColor: "text-pink-600 dark:text-pink-400",
      value: age ? `${age} años` : "—",
      valueColor: "text-pink-600 dark:text-pink-400",
      contextLabel: "biometría",
      tooltip: "Edad cronológica y FC Máxima estimada",
      hoverBorder: "hover:border-pink-400 hover:ring-2 hover:ring-pink-400/20",
      icon: METRIC_ICONS_MAP.ageBiometrics.icon,
      iconColor: METRIC_ICONS_MAP.ageBiometrics.color,
      iconBgColor: METRIC_ICONS_MAP.ageBiometrics.bg,
    },
    efficiencyFactor: {
      id: "efficiencyFactor",
      title: "Eficiencia",
      badge: "EF",
      badgeColor: "text-teal-600 dark:text-teal-400",
      value: efficiencyFactor ? efficiencyFactor.toFixed(2) : "—",
      valueColor: "text-teal-600 dark:text-teal-400",
      contextLabel: "W/bpm",
      tooltip: "Factor de Eficiencia Aeróbica (EF = Potencia / FC Media)",
      hoverBorder: "hover:border-teal-400 hover:ring-2 hover:ring-teal-400/20",
      icon: METRIC_ICONS_MAP.efficiencyFactor.icon,
      iconColor: METRIC_ICONS_MAP.efficiencyFactor.color,
      iconBgColor: METRIC_ICONS_MAP.efficiencyFactor.bg,
    },
  };
}
