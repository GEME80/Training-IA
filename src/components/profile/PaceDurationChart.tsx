"use client";

import React, { useState, useMemo } from "react";
import { Timer, Award, HelpCircle } from "lucide-react";
import { PaceCurveDataSet, PaceRecordPoint } from "@/lib/intervals/curvesTypes";

interface PaceDurationChartProps {
  recent42d?: PaceCurveDataSet;
  season?: PaceCurveDataSet;
  thresholdPaceSec?: number;
  thresholdPaceStr?: string;
}

const DISTANCES = [
  { meters: 400, label: "400m" },
  { meters: 1000, label: "1 km" },
  { meters: 2000, label: "2 km" },
  { meters: 5000, label: "5 km" },
  { meters: 10000, label: "10 km" },
  { meters: 21097, label: "21.1 km", milestone: "Media" },
  { meters: 42195, label: "42.2 km", milestone: "Maratón" },
];

export const PaceDurationChart: React.FC<PaceDurationChartProps> = ({
  recent42d,
  season,
  thresholdPaceSec = 285,
  thresholdPaceStr = "4:45/km",
}) => {
  const [viewMode, setViewMode] = useState<"PACE" | "TIME">("PACE");

  const W = 680;
  const H = 280;
  const padL = 52;
  const padR = 24;
  const padT = 24;
  const padB = 44;

  const allPaces = useMemo(() => {
    const list: number[] = [thresholdPaceSec];
    recent42d?.records?.forEach((r) => { if (r.paceSecPerKm > 0) list.push(r.paceSecPerKm); });
    season?.records?.forEach((r) => { if (r.paceSecPerKm > 0) list.push(r.paceSecPerKm); });
    return list.filter((p) => p > 0 && isFinite(p));
  }, [thresholdPaceSec, recent42d, season]);

  const minPaceY = useMemo(() => {
    const minVal = allPaces.length > 0 ? Math.min(...allPaces) : 180;
    return Math.max(120, Math.floor((minVal - 15) / 30) * 30);
  }, [allPaces]);

  const maxPaceY = useMemo(() => {
    const maxVal = allPaces.length > 0 ? Math.max(...allPaces) : 360;
    return Math.max(minPaceY + 120, Math.ceil((maxVal + 20) / 30) * 30);
  }, [allPaces, minPaceY]);

  const scaleX = (idx: number) => {
    return padL + (idx / (DISTANCES.length - 1)) * (W - padL - padR);
  };

  const scaleYPace = (paceSec: number) => {
    const clamped = Math.max(minPaceY, Math.min(maxPaceY, paceSec));
    // Ritmo invertido: minPace (más veloz) va en padT, maxPace (más lento) va en H - padB
    return padT + ((clamped - minPaceY) / (maxPaceY - minPaceY)) * (H - padT - padB);
  };

  const yTicksPace = useMemo(() => {
    const ticks: { sec: number; label: string }[] = [];
    const step = (maxPaceY - minPaceY) > 240 ? 60 : 30;
    for (let s = minPaceY; s <= maxPaceY; s += step) {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      ticks.push({ sec: s, label: `${mins}:${String(secs).padStart(2, "0")}` });
    }
    return ticks;
  }, [minPaceY, maxPaceY]);

  const buildPacePath = (records: PaceRecordPoint[]) => {
    if (!records || records.length === 0) return "";
    const validPoints: { x: number; y: number }[] = [];

    DISTANCES.forEach((d, idx) => {
      const rec = records.find((r) => Math.abs(r.distanceMeters - d.meters) <= d.meters * 0.2);
      if (rec && rec.paceSecPerKm > 0) {
        validPoints.push({ x: scaleX(idx), y: scaleYPace(rec.paceSecPerKm) });
      }
    });

    if (validPoints.length === 0) return "";
    return validPoints.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ");
  };

  const path42d = buildPacePath(recent42d?.records || []);
  const pathSeason = buildPacePath(season?.records || []);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono">
            Curva de Ritmo de Carrera (Pace Duration)
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setViewMode("PACE")}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === "PACE" ? "bg-emerald-500 text-white font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              RITMO (/km)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TIME")}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === "TIME" ? "bg-emerald-500 text-white font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              TIEMPO RÉCORD
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px] sm:min-w-full h-auto text-slate-400">
          {/* Guías horizontales de Ritmo */}
          {yTicksPace.map((tick) => {
            const y = scaleYPace(tick.sec);
            return (
              <g key={tick.sec}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeDasharray="3 3" opacity={0.15} />
                <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" className="font-mono fill-slate-400">
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Guías verticales para distancias */}
          {DISTANCES.map((d, idx) => {
            const x = scaleX(idx);
            return (
              <g key={d.meters}>
                <line x1={x} y1={padT} x2={x} y2={H - padB} stroke="currentColor" strokeDasharray="2 3" opacity={0.12} />
                <text x={x} y={H - padB + 14} textAnchor="middle" fontSize="10" className="font-mono font-bold fill-slate-500">
                  {d.label}
                </text>
                {d.milestone && (
                  <text x={x} y={H - padB + 25} textAnchor="middle" fontSize="8" className="font-mono font-semibold fill-emerald-600 dark:fill-emerald-400">
                    {d.milestone}
                  </text>
                )}
              </g>
            );
          })}

          {/* Línea horizontal del Ritmo Umbral del atleta */}
          {thresholdPaceSec >= minPaceY && thresholdPaceSec <= maxPaceY && (
            <g>
              <line
                x1={padL}
                y1={scaleYPace(thresholdPaceSec)}
                x2={W - padR}
                y2={scaleYPace(thresholdPaceSec)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.8}
              />
              <text x={W - padR - 4} y={scaleYPace(thresholdPaceSec) - 4} textAnchor="end" fontSize="9" className="font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                Ritmo Umbral ({thresholdPaceStr.replace("/km", "")}/km)
              </text>
            </g>
          )}

          {/* Curva 42 días (Azul/Índigo) */}
          {path42d && <path d={path42d} fill="none" stroke="#6366f1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Curva Esta temporada (Rosa/Magenta) */}
          {pathSeason && <path d={pathSeason} fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Puntos de distancias para 42d */}
          {DISTANCES.map((d, idx) => {
            const rec = recent42d?.records.find((r) => Math.abs(r.distanceMeters - d.meters) <= d.meters * 0.2);
            if (!rec || rec.paceSecPerKm <= 0) return null;
            const cx = scaleX(idx);
            const cy = scaleYPace(rec.paceSecPerKm);
            return (
              <g key={`pt-42-${d.meters}`}>
                <circle cx={cx} cy={cy} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9" className="font-mono font-bold fill-indigo-600 dark:fill-indigo-300">
                  {viewMode === "PACE" ? rec.paceFormatted.replace("/km", "") : rec.timeFormatted}
                </text>
              </g>
            );
          })}

          {/* Puntos de distancias para Temporada */}
          {DISTANCES.map((d, idx) => {
            const rec = season?.records.find((r) => Math.abs(r.distanceMeters - d.meters) <= d.meters * 0.2);
            if (!rec || rec.paceSecPerKm <= 0) return null;
            const cx = scaleX(idx);
            const cy = scaleYPace(rec.paceSecPerKm);
            return (
              <g key={`pt-sea-${d.meters}`}>
                <circle cx={cx} cy={cy} r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" className="font-mono font-black fill-pink-600 dark:fill-pink-300">
                  {viewMode === "PACE" ? rec.paceFormatted.replace("/km", "") : rec.timeFormatted}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pie con Leyenda y Resumen */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            42 días
          </span>
          <span className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            Esta temporada
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Perfil de Ritmo Crítico e Inverso Fisiológico (1/v)</span>
        </div>
      </div>
    </div>
  );
};
