"use client";

import React, { useState, useMemo } from "react";
import { Zap, HelpCircle } from "lucide-react";
import { PowerCurveDataSet, PowerCurvePoint } from "@/lib/intervals/curvesTypes";

interface PowerDurationChartProps {
  recent42d?: PowerCurveDataSet;
  season?: PowerCurveDataSet;
  thresholdFtp?: number;
  weightKg?: number;
  sportTitle?: string;
}

const X_TICKS = [
  { sec: 1, label: "1s" },
  { sec: 5, label: "5s" },
  { sec: 15, label: "15s" },
  { sec: 60, label: "60s" },
  { sec: 120, label: "2m" },
  { sec: 300, label: "5m" },
  { sec: 600, label: "10m" },
  { sec: 1200, label: "20m" },
  { sec: 1800, label: "30m" },
  { sec: 3600, label: "1h" },
  { sec: 7200, label: "2h" },
  { sec: 14400, label: "4h" },
];

export const PowerDurationChart: React.FC<PowerDurationChartProps> = ({
  recent42d,
  season,
  thresholdFtp = 0,
  weightKg = 82,
  sportTitle = "Ciclismo",
}) => {
  const [unitMode, setUnitMode] = useState<"WATTS" | "WKG">("WATTS");
  const [hoveredSec, setHoveredSec] = useState<number | null>(null);

  const minSec = 1;
  const maxSec = 14400;
  const logMin = Math.log10(minSec);
  const logMax = Math.log10(maxSec);

  const W = 680;
  const H = 280;
  const padL = 45;
  const padR = 20;
  const padT = 20;
  const padB = 35;

  const { maxY, yTicks } = useMemo(() => {
    let highest = 0;
    [recent42d?.points || [], season?.points || []].forEach((pts) => {
      pts.forEach((p) => {
        const val = unitMode === "WKG" ? p.wattsPerKg : p.watts;
        if (val > highest) highest = val;
      });
    });

    if (unitMode === "WKG") {
      const top = Math.max(8, Math.ceil(highest + 1));
      return { maxY: top, yTicks: [0, 2, 4, 6, 8] };
    }
    const top = Math.max(650, Math.ceil((highest + 50) / 100) * 100);
    const step = 100;
    const ticks: number[] = [];
    for (let t = 0; t <= top; t += step) ticks.push(t);
    return { maxY: top, yTicks: ticks };
  }, [recent42d, season, unitMode]);

  const scaleX = (sec: number) => {
    const clamped = Math.max(minSec, Math.min(maxSec, sec));
    const ratio = (Math.log10(clamped) - logMin) / (logMax - logMin);
    return padL + ratio * (W - padL - padR);
  };

  const scaleY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxY, val));
    return H - padB - (clamped / maxY) * (H - padT - padB);
  };

  const buildPath = (points: PowerCurvePoint[]) => {
    if (!points || points.length === 0) return "";
    const sorted = [...points].sort((a, b) => a.sec - b.sec);
    return sorted
      .map((p, idx) => {
        const val = unitMode === "WKG" ? p.wattsPerKg : p.watts;
        const x = scaleX(p.sec);
        const y = scaleY(val);
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const path42d = useMemo(() => buildPath(recent42d?.points || []), [recent42d, unitMode, maxY]);
  const pathSeason = useMemo(() => buildPath(season?.points || []), [season, unitMode, maxY]);

  const hoveredData = useMemo(() => {
    if (!hoveredSec) return null;
    const p42 = recent42d?.points.find((p) => p.sec === hoveredSec);
    const pSea = season?.points.find((p) => p.sec === hoveredSec);
    return { sec: hoveredSec, p42, pSea };
  }, [hoveredSec, recent42d, season]);

  const thresholdVal = unitMode === "WKG" && weightKg > 0 ? thresholdFtp / weightKg : thresholdFtp;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono">
            Curva de Potencia ({sportTitle})
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setUnitMode("WATTS")}
              className={`px-2.5 py-1 rounded-md transition ${unitMode === "WATTS" ? "bg-amber-500 text-slate-950 font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              VATIOS
            </button>
            <button
              type="button"
              onClick={() => setUnitMode("WKG")}
              className={`px-2.5 py-1 rounded-md transition ${unitMode === "WKG" ? "bg-amber-500 text-slate-950 font-black shadow-2xs" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              VATIOS / KG
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-slate-400">
          {/* Guías horizontales Y */}
          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={tick}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeDasharray="3 3" opacity={0.15} />
                <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" className="font-mono fill-slate-400">
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Guías verticales X */}
          {X_TICKS.map((t) => {
            const x = scaleX(t.sec);
            return (
              <g key={t.sec}>
                <line x1={x} y1={padT} x2={x} y2={H - padB} stroke="currentColor" strokeDasharray="2 3" opacity={0.12} />
                <text x={x} y={H - padB + 14} textAnchor="middle" fontSize="9" className="font-mono fill-slate-400">
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Línea horizontal de Umbral FTP / CP */}
          {thresholdVal > 0 && thresholdVal <= maxY && (
            <g>
              <line
                x1={padL}
                y1={scaleY(thresholdVal)}
                x2={W - padR}
                y2={scaleY(thresholdVal)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.7}
              />
              <text x={W - padR - 4} y={scaleY(thresholdVal) - 4} textAnchor="end" fontSize="9" className="font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                Umbral {unitMode === "WKG" ? `${thresholdVal.toFixed(2)} W/kg` : `${Math.round(thresholdVal)} W`}
              </text>
            </g>
          )}

          {/* Curva 42 días (Azul/Índigo) */}
          {path42d && <path d={path42d} fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Curva Esta temporada (Rosa/Magenta) */}
          {pathSeason && <path d={pathSeason} fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Línea interactiva de hover */}
          {hoveredData && (
            <line
              x1={scaleX(hoveredData.sec)}
              y1={padT}
              x2={scaleX(hoveredData.sec)}
              y2={H - padB}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Zonas interactivas invisibles para hover */}
          {X_TICKS.map((t) => (
            <rect
              key={t.sec}
              x={scaleX(t.sec) - 15}
              y={padT}
              width={30}
              height={H - padT - padB}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredSec(t.sec)}
              onMouseLeave={() => setHoveredSec(null)}
            />
          ))}
        </svg>

        {/* Tooltip flotante en hover */}
        {hoveredData && (
          <div
            className="absolute top-2 pointer-events-none p-2 rounded-xl bg-slate-900/90 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-lg text-[10px] font-mono space-y-1 z-10"
            style={{ left: `${Math.min(W - 140, Math.max(50, scaleX(hoveredData.sec)))}px` }}
          >
            <div className="font-bold text-slate-300">Duración: {X_TICKS.find((x) => x.sec === hoveredData.sec)?.label || `${hoveredData.sec}s`}</div>
            {hoveredData.p42 && (
              <div className="flex items-center justify-between gap-3 text-indigo-400">
                <span>42 días:</span>
                <span className="font-black font-mono">
                  {unitMode === "WKG" ? `${hoveredData.p42.wattsPerKg} W/kg` : `${hoveredData.p42.watts} W`}
                </span>
              </div>
            )}
            {hoveredData.pSea && (
              <div className="flex items-center justify-between gap-3 text-pink-400">
                <span>Temporada:</span>
                <span className="font-black font-mono">
                  {unitMode === "WKG" ? `${hoveredData.pSea.wattsPerKg} W/kg` : `${hoveredData.pSea.watts} W`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie con Leyenda y Resumen eFTP */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            42 días {recent42d?.eftp ? `(eFTP ${recent42d.eftp}W${recent42d.wPrime ? ` • W' ${Math.round(recent42d.wPrime / 1000)}kJ` : ""})` : ""}
          </span>
          <span className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            Esta temporada {season?.eftp ? `(eFTP ${season.eftp}W${season.wPrime ? ` • W' ${Math.round(season.wPrime / 1000)}kJ` : ""})` : ""}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Modelo Potencia Crítica (Morton 3P)</span>
        </div>
      </div>
    </div>
  );
};
