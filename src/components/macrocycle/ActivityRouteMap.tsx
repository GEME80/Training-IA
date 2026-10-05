"use client";

import React, { useMemo } from "react";
import { MapPin, Navigation, Mountain, Footprints } from "lucide-react";

interface ActivityRouteMapProps {
  latlng?: [number, number][];
  distanceKm?: number;
  movingTimeMin?: number;
  elevationGainM?: number;
}

export const ActivityRouteMap: React.FC<ActivityRouteMapProps> = ({
  latlng,
  distanceKm,
  movingTimeMin,
  elevationGainM,
}) => {
  const projectedData = useMemo(() => {
    if (!latlng || !Array.isArray(latlng) || latlng.length < 10) return null;

    const validPts = latlng.filter(
      (p) => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== 0 && p[1] !== 0
    );
    if (validPts.length < 10) return null;

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const [lat, lng] of validPts) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    const dLat = maxLat - minLat;
    const dLng = maxLng - minLng;
    if (dLat < 0.0001 && dLng < 0.0001) return null;

    const svgW = 600;
    const svgH = 260;
    const pad = 35;
    const plotW = svgW - pad * 2;
    const plotH = svgH - pad * 2;

    const midLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
    const cosLat = Math.cos(midLatRad) || 1;
    const geoW = (dLng * cosLat) || 0.0001;
    const geoH = dLat || 0.0001;

    const scale = Math.min(plotW / geoW, plotH / geoH);
    const scaledW = geoW * scale;
    const scaledH = geoH * scale;
    const offsetX = pad + (plotW - scaledW) / 2;
    const offsetY = pad + (plotH - scaledH) / 2;

    // Downsample para rendimiento óptimo en renderizado SVG
    const step = Math.max(1, Math.floor(validPts.length / 400));
    const sampledPts: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < validPts.length; i += step) {
      const [lat, lng] = validPts[i];
      const x = offsetX + (lng - minLng) * cosLat * scale;
      const y = offsetY + (maxLat - lat) * scale;
      sampledPts.push({ x, y });
    }

    // Asegurar punto final
    const lastPt = validPts[validPts.length - 1];
    sampledPts.push({
      x: offsetX + (lastPt[1] - minLng) * cosLat * scale,
      y: offsetY + (maxLat - lastPt[0]) * scale,
    });

    const pathData = sampledPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const startPoint = sampledPts[0];
    const endPoint = sampledPts[sampledPts.length - 1];

    return { pathData, startPoint, endPoint, svgW, svgH };
  }, [latlng]);

  if (!projectedData) return null;

  const { pathData, startPoint, endPoint, svgW, svgH } = projectedData;

  return (
    <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-white space-y-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-cyan-400 rotate-45" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Mapa de Ruta GPS
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-300">
          {typeof distanceKm === "number" && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
              <Footprints className="h-3 w-3 text-cyan-400" />
              {distanceKm.toFixed(1)} km
            </span>
          )}
          {typeof movingTimeMin === "number" && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
              ⏱️ {movingTimeMin} min
            </span>
          )}
          {typeof elevationGainM === "number" && elevationGainM > 0 && (
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
              <Mountain className="h-3 w-3 text-emerald-400" />
              +{elevationGainM}m
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto select-none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Cuadrícula sutil de fondo tipo GPS */}
          {[0.25, 0.5, 0.75].map((pct, i) => (
            <line key={`grid-h-${i}`} x1="0" y1={pct * svgH} x2={svgW} y2={pct * svgH} stroke="#1e293b" strokeDasharray="4,4" strokeWidth="0.8" />
          ))}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => (
            <line key={`grid-v-${i}`} x1={pct * svgW} y1="0" x2={pct * svgW} y2={svgH} stroke="#1e293b" strokeDasharray="4,4" strokeWidth="0.8" />
          ))}

          {/* Resplandor y Trazo de la Ruta */}
          <path d={pathData} fill="none" stroke="#06b6d4" strokeWidth="5" strokeOpacity="0.3" filter="url(#glow)" />
          <path d={pathData} fill="none" stroke="url(#routeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Pin de Inicio (Verde) */}
          <circle cx={startPoint.x} cy={startPoint.y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx={startPoint.x} cy={startPoint.y} r="10" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.6" />

          {/* Pin de Llegada (Rojo/Llegada) */}
          <circle cx={endPoint.x} cy={endPoint.y} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
          <circle cx={endPoint.x} cy={endPoint.y} r="10" fill="none" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.6" />
        </svg>

        {/* Leyenda de Inicio / Fin */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Inicio
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <MapPin className="h-3 w-3" /> Meta
          </span>
        </div>
      </div>
    </div>
  );
};
