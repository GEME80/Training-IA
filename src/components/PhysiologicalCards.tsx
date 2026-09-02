"use client";

import React from "react";
import { AlertTriangle, SlidersHorizontal, Check, X } from "lucide-react";
import { PhysiologicalStatus } from "@/lib/physiology/engine";
import { DEFAULT_VISIBLE_METRICS, AVAILABLE_METRIC_INDICATORS } from "@/lib/intervals/types";

interface PhysiologicalCardsProps {
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
  visibleMetrics?: string[];
  onToggleMetric?: (id: string) => void;
}

export const PhysiologicalCards: React.FC<PhysiologicalCardsProps> = ({
  status,
  runFtp,
  bikeFtp,
  weightKg,
  age,
  restingHR,
  hrv,
  sleepQuality,
  sleepSecs,
  efficiencyFactor,
  visibleMetrics = DEFAULT_VISIBLE_METRICS,
  onToggleMetric,
}) => {
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const activeMetrics = visibleMetrics && visibleMetrics.length > 0 ? visibleMetrics : DEFAULT_VISIBLE_METRICS;

  if (!status) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {activeMetrics.map((id) => (
          <div
            key={id}
            className="h-16 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const getTsbColor = (tsb: number) => {
    if (tsb > 5) return "text-emerald-600";
    if (tsb >= -15) return "text-teal-600";
    if (tsb >= -25) return "text-amber-600";
    return "text-rose-600";
  };

  const getTsbContextLabel = (tsb: number) => {
    if (tsb > 5) return "frescura";
    if (tsb >= -15) return "óptimo";
    if (tsb >= -25) return "sobrecarga";
    return "fatiga";
  };

  const formattedRampRate = Number(status.rampRate || 0).toFixed(1);
  const rampDisplay = Number(formattedRampRate) > 0 ? `+${formattedRampRate}` : formattedRampRate;

  // Calculos derivados
  const wKgRun = runFtp && weightKg ? (runFtp / weightKg).toFixed(2) : null;
  const wKgBike = bikeFtp && weightKg ? (bikeFtp / weightKg).toFixed(2) : null;
  const tanakaMaxHR = age ? Math.round(208 - 0.7 * age) : null;
  const currentHrv = hrv || status.currentHrv;
  const currentRhr = restingHR || status.restingHR;
  const sleepHours = sleepSecs ? (sleepSecs / 3600).toFixed(1) : null;

  return (
    <div className="space-y-2.5 animate-fadeIn">
      {/* Alerta de Fatiga / Sobrecarga Crítica (Solo si existe riesgo real) */}
      {status.status === "OVERTRAINING_RISK" && (
        <div className="flex items-center space-x-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-800 shadow-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <div>
            <strong className="text-red-700">Riesgo de Fatiga Alta: </strong>
            TSB crítico ({Number(status.tsb).toFixed(1)}). Se sugiere rodaje Z1 o descanso.
          </div>
        </div>
      )}

      {/* Barra de Título & Personalización de Métricas (In-Place) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          Métricas Fisiológicas en Vivo
        </span>

        {onToggleMetric && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold transition shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3 text-sky-500" />
              <span>Personalizar ({activeMetrics.length})</span>
            </button>

            {/* Popover flotante con checkboxes */}
            {isConfigOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsConfigOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50 animate-fadeIn space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Métricas Visibles
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {AVAILABLE_METRIC_INDICATORS.map((metric) => {
                      const isChecked = activeMetrics.includes(metric.id);
                      return (
                        <div
                          key={metric.id}
                          onClick={() => onToggleMetric(metric.id)}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition ${
                            isChecked
                              ? "bg-sky-50 dark:bg-sky-950/50 text-sky-950 dark:text-sky-200 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>{metric.icon}</span>
                            <span>{metric.name}</span>
                          </div>
                          <div
                            className={`h-4 w-4 rounded-md flex items-center justify-center border ${
                              isChecked
                                ? "bg-sky-600 border-sky-600 text-white"
                                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Grid Modular Dinámico Adaptado a los Indicadores Seleccionados */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
        {/* 1. FITNESS / CTL */}
        {activeMetrics.includes("ctl") && (
          <div
            title="Base aeróbica acumulada de las últimas 6 semanas (Fitness / CTL)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">📈</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Fitness
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 font-mono">
                CTL
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-slate-900">
                {Number(status.ctl).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">crónico</span>
            </div>
          </div>
        )}

        {/* 2. FATIGUE / ATL */}
        {activeMetrics.includes("atl") && (
          <div
            title="Cansancio acumulado en los últimos 7 días (Fatigue / ATL)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm text-amber-500">⚡</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Fatigue
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 font-mono">
                ATL
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-amber-600">
                {Number(status.atl).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">agudo</span>
            </div>
          </div>
        )}

        {/* 3. FORM / TSB */}
        {activeMetrics.includes("tsb") && (
          <div
            title="Balance de recuperación y disponibilidad para calidad (Form / TSB)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-emerald-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🔋</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Form
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">
                TSB
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-lg font-black font-mono ${getTsbColor(status.tsb)}`}>
                {status.tsb > 0 ? `+${Math.round(status.tsb)}` : Math.round(status.tsb)}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">{getTsbContextLabel(status.tsb)}</span>
            </div>
          </div>
        )}

        {/* 4. RAMP RATE */}
        {activeMetrics.includes("rampRate") && (
          <div
            title="Tasa semanal de progresión de carga o descarga (Ramp Rate)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-teal-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">📐</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Ramp Rate
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-600 font-mono">
                /sem
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-slate-800">
                {rampDisplay}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">tasa</span>
            </div>
          </div>
        )}

        {/* 5. STRYD CP */}
        {activeMetrics.includes("strydCp") && (
          <div
            title="Potencia crítica umbral sostenible en carrera (Stryd CP)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">👟</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Stryd CP
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 font-mono">
                Watts
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-amber-600">
                {runFtp ? `${runFtp} W` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">potencia</span>
            </div>
          </div>
        )}

        {/* 6. RIDE FTP */}
        {activeMetrics.includes("bikeFtp") && (
          <div
            title="Umbral funcional de potencia en bicicleta (Ride FTP)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-cyan-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🚴</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Ride FTP
                </span>
              </div>
              <span className="text-[10px] font-bold text-cyan-600 font-mono">
                Watts
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-cyan-600">
                {bikeFtp ? `${bikeFtp} W` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">potencia</span>
            </div>
          </div>
        )}

        {/* 7. HRV */}
        {activeMetrics.includes("hrv") && (
          <div
            title="Variabilidad de la frecuencia cardíaca (rMSSD / Z-Score)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-rose-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">💓</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  HRV
                </span>
              </div>
              <span className="text-[10px] font-bold text-rose-600 font-mono">
                rMSSD
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-rose-600">
                {currentHrv ? `${currentHrv} ms` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                {status.hrvZScore != null ? `Z ${status.hrvZScore > 0 ? `+${status.hrvZScore}` : status.hrvZScore}` : "vagal"}
              </span>
            </div>
          </div>
        )}

        {/* 8. FC REPOSO */}
        {activeMetrics.includes("restingHr") && (
          <div
            title="Frecuencia cardíaca en reposo matutina (RHR)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-purple-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🫀</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  FC Reposo
                </span>
              </div>
              <span className="text-[10px] font-bold text-purple-600 font-mono">
                RHR
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-purple-700">
                {currentRhr ? `${currentRhr} bpm` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">basal</span>
            </div>
          </div>
        )}

        {/* 9. SUEÑO */}
        {activeMetrics.includes("sleep") && (
          <div
            title="Calidad y horas de sueño sincronizado"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-indigo-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">😴</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Sueño
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 font-mono">
                Sleep
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-indigo-700">
                {sleepHours ? `${sleepHours}h` : sleepQuality ? `${sleepQuality}%` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">recuperación</span>
            </div>
          </div>
        )}

        {/* 10. RELACIÓN W/KG */}
        {activeMetrics.includes("wKg") && (
          <div
            title="Potencia relativa por kilo de peso corporal (Stryd / Bike)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-emerald-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">⚖️</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  W/kg
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">
                {weightKg ? `${weightKg}kg` : "Relativo"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-black font-mono text-slate-900">
                {wKgRun ? `🏃 ${wKgRun}` : ""}{wKgBike ? ` • 🚴 ${wKgBike}` : !wKgRun ? "—" : ""}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">W/kg</span>
            </div>
          </div>
        )}

        {/* 11. EDAD & TANAKA */}
        {activeMetrics.includes("ageBiometrics") && (
          <div
            title="Edad cronológica y FC Máxima estimada según fórmula Tanaka (208 - 0.7*Edad)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-pink-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🎂</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Edad
                </span>
              </div>
              <span className="text-[10px] font-bold text-pink-600 font-mono">
                {tanakaMaxHR ? `${tanakaMaxHR} max` : "Tanaka"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-pink-700">
                {age ? `${age} años` : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">biometría</span>
            </div>
          </div>
        )}

        {/* 12. FACTOR DE EFICIENCIA AERÓBICA */}
        {activeMetrics.includes("efficiencyFactor") && (
          <div
            title="Factor de Eficiencia Aeróbica (EF = Potencia Normalizada / FC Media)"
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs hover:border-teal-400 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-black tracking-tight text-slate-800">
                  Eficiencia
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-600 font-mono">
                EF
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-black font-mono text-teal-700">
                {efficiencyFactor ? efficiencyFactor.toFixed(2) : "—"}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">W/bpm</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
