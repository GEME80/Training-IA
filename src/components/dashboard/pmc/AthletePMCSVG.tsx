"use client";

import React, { useRef } from "react";
import { PMCDataPoint } from "@/lib/physiology/pmcEngine";

interface AthletePMCSVGProps {
  points: PMCDataPoint[];
  activeIdx: number;
  onHoverIdx: (idx: number | null) => void;
  showProjection: boolean;
}

export const AthletePMCSVG: React.FC<AthletePMCSVGProps> = ({
  points,
  activeIdx,
  onHoverIdx,
  showProjection,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dimensiones idénticas a Intervals.icu
  const W = 1100;
  const H = 490;
  const padL = 75; // Espacio para texto vertical y ticks Y
  const padR = 110; // Espacio para valores y leyendas de zonas a la derecha
  
  // 3 Paneles
  const p1Top = 15;
  const p1Bottom = 220; // Panel 1: Carga (CTL/ATL) - 205px
  const p2Top = 232;
  const p2Bottom = 370; // Panel 2: Forma (TSB) - 138px
  const p3Top = 382;
  const p3Bottom = 455; // Panel 3: Rampa - 73px
  const axisBottom = 480;

  const todayIdx = points.findIndex((p) => p.label === "Hoy");
  const splitIdx = todayIdx !== -1 ? todayIdx : points.findIndex((p) => p.isProjected) - 1;
  const pastEnd = splitIdx >= 0 ? splitIdx : points.length - 1;
  const futureStart = splitIdx >= 0 ? splitIdx : 0;

  // Escala X
  const scaleX = (i: number) => {
    if (points.length <= 1) return padL;
    return padL + (i / (points.length - 1)) * (W - padL - padR);
  };

  // Panel 1: Escala Y (0 a 130+)
  const maxLoad = 130;
  const scaleP1 = (v: number) => p1Bottom - (Math.max(0, Math.min(maxLoad, v)) / maxLoad) * (p1Bottom - p1Top);
  const p1Ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

  // Panel 2: Escala Y (TSB -45 a +35)
  const minTsb = -45;
  const maxTsb = 35;
  const scaleP2 = (v: number) => {
    const norm = (Math.max(minTsb, Math.min(maxTsb, v)) - minTsb) / (maxTsb - minTsb);
    return p2Bottom - norm * (p2Bottom - p2Top);
  };

  // Panel 3: Escala Y (Rampa -10 a +10)
  const scaleP3 = (v: number) => {
    const norm = (Math.max(-10, Math.min(10, v)) - (-10)) / 20;
    return p3Bottom - norm * (p3Bottom - p3Top);
  };
  const p3Zero = scaleP3(0);

  // Helper para color de TSB por zonas Friel
  const getTsbColor = (tsb: number) => {
    if (tsb > 20) return "#d97706"; // Transición (ámbar)
    if (tsb > 5) return "#0284c7";  // Fresco (azul)
    if (tsb >= -10) return "#64748b"; // Zona gris (gris)
    if (tsb >= -30) return "#16a34a"; // Óptimo (verde)
    return "#dc2626"; // Alto Riesgo (rojo)
  };

  const getTsbZoneName = (tsb: number) => {
    if (tsb > 20) return "Transición";
    if (tsb > 5) return "Fresco";
    if (tsb >= -10) return "Zona gris";
    if (tsb >= -30) return "Óptimo";
    return "Alto Riesgo";
  };

  // Generadores de paths
  const makeLinePath = (fn: (p: PMCDataPoint) => number, start: number, end: number, scaleFn: (v: number) => number) => {
    if (points.length === 0 || start < 0 || end < start) return "";
    let d = "";
    for (let i = start; i <= end && i < points.length; i++) {
      const x = scaleX(i);
      const y = scaleFn(fn(points[i]));
      d += i === start ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };

  const makeAreaPath = (start: number, end: number) => {
    if (points.length === 0 || start < 0 || end < start) return "";
    let d = `M ${scaleX(start).toFixed(1)} ${p1Bottom}`;
    for (let i = start; i <= end && i < points.length; i++) {
      d += ` L ${scaleX(i).toFixed(1)} ${scaleP1(points[i].ctl).toFixed(1)}`;
    }
    d += ` L ${scaleX(end).toFixed(1)} ${p1Bottom} Z`;
    return d;
  };

  const activePoint = points[activeIdx] || null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = Math.max(0, Math.min(1, (clickX - padL) / (W - padL - padR)));
    const idx = Math.round(ratio * (points.length - 1));
    onHoverIdx(idx);
  };

  return (
    <div className="w-full overflow-x-auto select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[760px] h-[480px] cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHoverIdx(null)}
      >
        <defs>
          <linearGradient id="ctlAreaSoft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* PANEL 1: CARGA DE ENTRENAMIENTO (FITNESS / FATIGA)       */}
        {/* ======================================================== */}
        {/* Fondo y grilla */}
        <rect x={padL} y={p1Top} width={W - padL - padR} height={p1Bottom - p1Top} fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        {p1Ticks.map((tick) => (
          <g key={`p1-${tick}`}>
            <line x1={padL} y1={scaleP1(tick)} x2={W - padR} y2={scaleP1(tick)} stroke="#f1f5f9" strokeWidth="0.8" />
            <text x={padL - 6} y={scaleP1(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              {tick}
            </text>
          </g>
        ))}
        {/* Título de eje Y izquierdo (rotado) */}
        <text
          x={-(p1Top + (p1Bottom - p1Top) / 2)}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontWeight="bold"
        >
          Carga de entrenamiento por día
        </text>

        {/* Área suave CTL */}
        <path d={makeAreaPath(0, pastEnd)} fill="url(#ctlAreaSoft)" />

        {/* Curva Azul: Aptitud (CTL) */}
        <path d={makeLinePath((p) => p.ctl, 0, pastEnd, scaleP1)} fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
        {/* Curva Morada: Fatiga (ATL) */}
        <path d={makeLinePath((p) => p.atl, 0, pastEnd, scaleP1)} fill="none" stroke="#9333ea" strokeWidth="1.4" strokeLinecap="round" />

        {/* Proyección Futura Panel 1 */}
        {showProjection && splitIdx >= 0 && (
          <>
            <path d={makeLinePath((p) => p.ctl, futureStart, points.length - 1, scaleP1)} fill="none" stroke="#0284c7" strokeWidth="1.8" strokeDasharray="4 3" strokeOpacity="0.8" />
            <path d={makeLinePath((p) => p.atl, futureStart, points.length - 1, scaleP1)} fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="4 3" strokeOpacity="0.8" />
          </>
        )}

        {/* Valores derecha Panel 1 */}
        {activePoint && (
          <g>
            <text x={W - padR + 10} y={scaleP1(60) - 25} fill="#64748b" fontSize="10" fontWeight="bold">
              {activePoint.date.split("-").slice(1).join("/")}
            </text>
            <text x={W - padR + 10} y={scaleP1(60) - 10} fill="#94a3b8" fontSize="9">Aptitud</text>
            <text x={W - padR + 10} y={scaleP1(60) + 4} fill="#0284c7" fontSize="13" fontWeight="900">{activePoint.ctl}</text>
            <text x={W - padR + 10} y={scaleP1(60) + 20} fill="#94a3b8" fontSize="9">Fatiga</text>
            <text x={W - padR + 10} y={scaleP1(60) + 34} fill="#9333ea" fontSize="13" fontWeight="900">{activePoint.atl}</text>
          </g>
        )}

        {/* ======================================================== */}
        {/* PANEL 2: FORMA (TSB) CON BANDAS FRIEL OFICIALES          */}
        {/* ======================================================== */}
        {/* Bandas de color */}
        <rect x={padL} y={p2Top} width={W - padL - padR} height={scaleP2(20) - p2Top} fill="#fef3c7" fillOpacity="0.4" />
        <rect x={padL} y={scaleP2(20)} width={W - padL - padR} height={scaleP2(5) - scaleP2(20)} fill="#e0f2fe" fillOpacity="0.4" />
        <rect x={padL} y={scaleP2(5)} width={W - padL - padR} height={scaleP2(-10) - scaleP2(5)} fill="#ffffff" />
        <rect x={padL} y={scaleP2(-10)} width={W - padL - padR} height={scaleP2(-30) - scaleP2(-10)} fill="#dcfce7" fillOpacity="0.4" />
        <rect x={padL} y={scaleP2(-30)} width={W - padL - padR} height={p2Bottom - scaleP2(-30)} fill="#fee2e2" fillOpacity="0.4" />

        {/* Bordes y líneas de referencia Panel 2 */}
        <rect x={padL} y={p2Top} width={W - padL - padR} height={p2Bottom - p2Top} fill="none" stroke="#f1f5f9" strokeWidth="1" />
        <line x1={padL} y1={scaleP2(0)} x2={W - padR} y2={scaleP2(0)} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1" />

        {/* Ticks Y Panel 2 */}
        {[20, 5, -10, -30].map((tick) => (
          <g key={`p2-${tick}`}>
            <line x1={padL} y1={scaleP2(tick)} x2={W - padR} y2={scaleP2(tick)} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.6" />
            <text x={padL - 6} y={scaleP2(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              {tick}
            </text>
          </g>
        ))}

        {/* Título de eje Y izquierdo Panel 2 */}
        <text
          x={-(p2Top + (p2Bottom - p2Top) / 2)}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontWeight="bold"
        >
          Forma
        </text>

        {/* Curva multicolor segmentada de Forma (TSB) */}
        {points.map((p, idx) => {
          if (idx === 0) return null;
          const prev = points[idx - 1];
          const isFut = idx > pastEnd;
          if (isFut && !showProjection) return null;
          return (
            <line
              key={`tsb-seg-${idx}`}
              x1={scaleX(idx - 1)}
              y1={scaleP2(prev.tsb)}
              x2={scaleX(idx)}
              y2={scaleP2(p.tsb)}
              stroke={getTsbColor(p.tsb)}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray={isFut ? "3 3" : undefined}
            />
          );
        })}

        {/* Leyenda y valor derecha Panel 2 */}
        <g>
          <text x={W - padR + 10} y={scaleP2(25)} fill="#d97706" fontSize="9" fontWeight="bold">Transición</text>
          <text x={W - padR + 10} y={scaleP2(12)} fill="#0284c7" fontSize="9" fontWeight="bold">Fresco</text>
          <text x={W - padR + 10} y={scaleP2(-2)} fill="#64748b" fontSize="9" fontWeight="bold">Zona gris</text>
          <text x={W - padR + 10} y={scaleP2(-20)} fill="#16a34a" fontSize="9" fontWeight="bold">Óptimo</text>
          <text x={W - padR + 10} y={scaleP2(-37)} fill="#dc2626" fontSize="9" fontWeight="bold">Alto Riesgo</text>
        </g>

        {/* ======================================================== */}
        {/* PANEL 3: RAMPA SEMANAL (RAMP RATE BARS)                  */}
        {/* ======================================================== */}
        <rect x={padL} y={p3Top} width={W - padL - padR} height={p3Bottom - p3Top} fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        <line x1={padL} y1={p3Zero} x2={W - padR} y2={p3Zero} stroke="#94a3b8" strokeWidth="1" />
        <line x1={padL} y1={scaleP3(8)} x2={W - padR} y2={scaleP3(8)} stroke="#f1f5f9" strokeWidth="0.8" />
        <line x1={padL} y1={scaleP3(-8)} x2={W - padR} y2={scaleP3(-8)} stroke="#f1f5f9" strokeWidth="0.8" />
        <text x={padL - 6} y={scaleP3(8) + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">8.0</text>
        <text x={padL - 6} y={p3Zero + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">0</text>
        <text x={padL - 6} y={scaleP3(-8) + 3} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">-8</text>

        {/* Título de eje Y izquierdo Panel 3 */}
        <text
          x={-(p3Top + (p3Bottom - p3Top) / 2)}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
          fontWeight="bold"
        >
          Ramp
        </text>

        {/* Barras de Rampa: Verde arriba (>0), Celeste abajo (<0) */}
        {points.map((p, idx) => {
          const isFut = idx > pastEnd;
          if (isFut && !showProjection) return null;
          const x = scaleX(idx);
          const w = Math.max(1.8, (W - padL - padR) / points.length);
          const y = scaleP3(p.rampRate);
          const isPos = p.rampRate >= 0;
          const barH = Math.max(1, Math.abs(y - p3Zero));
          const barY = isPos ? y : p3Zero;

          return (
            <rect
              key={`ramp-bar-${idx}`}
              x={x - w / 2}
              y={barY}
              width={w}
              height={barH}
              fill={isPos ? "#bbf7d0" : "#bae6fd"}
              stroke={isPos ? "#22c55e" : "#06b6d4"}
              strokeWidth="0.8"
              fillOpacity={isFut ? 0.4 : 0.85}
            />
          );
        })}

        {/* Valor de rampa derecha Panel 3 */}
        {activePoint && (
          <g>
            <text x={W - padR + 10} y={p3Zero - 6} fill="#64748b" fontSize="9">Rampa</text>
            <text
              x={W - padR + 10}
              y={p3Zero + 10}
              fill={activePoint.rampRate >= 0 ? "#16a34a" : "#0284c7"}
              fontSize="12"
              fontWeight="900"
            >
              {activePoint.rampRate > 0 ? `+${activePoint.rampRate}` : activePoint.rampRate}
            </text>
          </g>
        )}

        {/* ======================================================== */}
        {/* EJE X: ETIQUETAS DE TIEMPO / MESES                       */}
        {/* ======================================================== */}
        {points.filter((_, i) => i % Math.ceil(points.length / 12) === 0).map((p, idx) => {
          const d = new Date(p.date + "T12:00:00");
          const mName = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
          return (
            <text key={`month-${idx}`} x={scaleX(points.indexOf(p))} y={axisBottom} textAnchor="middle" fill="#64748b" fontSize="10">
              {mName}
            </text>
          );
        })}

        {/* ======================================================== */}
        {/* LÍNEA 'HOY' (SEPARADOR HISTÓRICO / PROYECCIÓN)          */}
        {/* ======================================================== */}
        {splitIdx >= 0 && (
          <g>
            <line x1={scaleX(splitIdx)} y1={p1Top} x2={scaleX(splitIdx)} y2={p3Bottom} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x={scaleX(splitIdx) - 16} y={p1Top - 12} width="32" height="14" rx="3" fill="#0284c7" />
            <text x={scaleX(splitIdx)} y={p1Top - 2} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900">HOY</text>
          </g>
        )}

        {/* ======================================================== */}
        {/* MIRA INTERACTIVA / CURSOR GUÍA VERTICAL                   */}
        {/* ======================================================== */}
        {activePoint && (
          <g>
            <line x1={scaleX(activeIdx)} y1={p1Top} x2={scaleX(activeIdx)} y2={p3Bottom} stroke="#334155" strokeWidth="1" />
            <circle cx={scaleX(activeIdx)} cy={scaleP1(activePoint.ctl)} r="3.5" fill="#0284c7" stroke="#fff" strokeWidth="1" />
            <circle cx={scaleX(activeIdx)} cy={scaleP1(activePoint.atl)} r="3" fill="#9333ea" stroke="#fff" strokeWidth="1" />
            <circle cx={scaleX(activeIdx)} cy={scaleP2(activePoint.tsb)} r="3.5" fill={getTsbColor(activePoint.tsb)} stroke="#fff" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};
