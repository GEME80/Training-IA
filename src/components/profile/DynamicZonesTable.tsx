"use client";

import React, { useMemo } from "react";
import { SportContextType } from "./SportContextSelector";
import { ZoneItem } from "./SportZoneCards";
import { SuggestedThresholdBanner, ThresholdSuggestionItem } from "./SuggestedThresholdBanner";
import { SwimPacingAccordion } from "./SwimPacingAccordion";
import { calculateSwimCssZones, calculatePaceZones } from "@/lib/physiology/runningWorkoutAdapter";

interface DynamicZonesTableProps {
  selectedSport: SportContextType;
  runTelemetryMode: "POWER" | "PACE";
  bikeTelemetryMode: "POWER" | "HR";
  runFtp: number;
  bikeFtp: number;
  livePaceSec: number;
  liveSwimCssSec: number;
  swimCssStr: string;
  lthr: number;
  maxHR: number;
  suggestedBikeFtp?: ThresholdSuggestionItem | null;
  suggestedRunPace?: ThresholdSuggestionItem | null;
  suggestedRunFtp?: ThresholdSuggestionItem | null;
  suggestedSwimCss?: ThresholdSuggestionItem | null;
  onApplySuggestion?: (sug: ThresholdSuggestionItem) => Promise<void>;
  onDismissSuggestion?: (sug: ThresholdSuggestionItem) => void;
}

export const DynamicZonesTable: React.FC<DynamicZonesTableProps> = ({
  selectedSport,
  runTelemetryMode,
  bikeTelemetryMode,
  runFtp,
  bikeFtp,
  livePaceSec,
  liveSwimCssSec,
  swimCssStr,
  lthr,
  maxHR,
  suggestedBikeFtp,
  suggestedRunPace,
  suggestedRunFtp,
  suggestedSwimCss,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  // Blindaje fisiológico continuo: LTHR nunca puede ser mayor a MaxHR
  const safeLthr = lthr > 0 && maxHR > 0 && lthr > maxHR ? maxHR : (lthr > 0 ? lthr : 178);

  // ── 1. ZONAS DE CICLISMO (Coggan 7 Zonas - Continuidad Estricta) ──
  const cyclingZones = useMemo(() => {
    const ftp = bikeFtp > 0 ? bikeFtp : 226;
    const z1Max = Math.round(ftp * 0.55);
    const z2Min = z1Max;
    const z2Max = Math.round(ftp * 0.75);
    const z3Min = z2Max + 1;
    const z3Max = Math.round(ftp * 0.90);
    const z4Min = z3Max + 1;
    const z4Max = Math.round(ftp * 1.05);
    const z5Min = z4Max + 1;
    const z5Max = Math.round(ftp * 1.20);
    const z6Min = z5Max + 1;
    const z6Max = Math.round(ftp * 1.50);
    const z7Min = z6Max + 1;

    return [
      { id: "Z1", name: "Recuperación Activa", nameColor: "text-slate-500 dark:text-slate-400", pct: "< 55% FTP", range: `< ${z2Min} W` },
      { id: "Z2", name: "Resistencia Base", nameColor: "text-sky-600 dark:text-sky-400", pct: "56% – 75% FTP", range: `${z2Min} – ${z2Max} W` },
      { id: "Z3", name: "Tempo", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "76% – 90% FTP", range: `${z3Min} – ${z3Max} W` },
      { id: "Z4", name: "Umbral FTP", nameColor: "text-amber-500 dark:text-amber-400", pct: "91% – 105% FTP", range: `${z4Min} – ${z4Max} W` },
      { id: "Z5", name: "VO2max", nameColor: "text-orange-500 dark:text-orange-400", pct: "106% – 120% FTP", range: `${z5Min} – ${z5Max} W` },
      { id: "Z6", name: "Capacidad Anaeróbica", nameColor: "text-rose-600 dark:text-rose-400", pct: "121% – 150% FTP", range: `${z6Min} – ${z6Max} W` },
      { id: "Z7", name: "Neuromuscular", nameColor: "text-rose-700 dark:text-rose-300", pct: "> 150% FTP", range: `> ${z6Max} W` },
    ];
  }, [bikeFtp]);

  // ── 2. ZONAS DE NATACIÓN (Jan Olbrecht / Continuous CSS Offsets) ──
  const swimZones = useMemo(() => calculateSwimCssZones(liveSwimCssSec), [liveSwimCssSec]);

  // ── 3. ZONAS DE CARRERA (Ritmo Daniels & Potencia Stryd) ──
  const paceZones = useMemo(() => calculatePaceZones(livePaceSec), [livePaceSec]);

  const strydZones = useMemo(() => {
    const cp = runFtp > 0 ? runFtp : 336;
    return [
      { id: "Z1", name: "Fácil / Recuperación", nameColor: "text-slate-500 dark:text-slate-400", pct: "65% – 80% CP", range: `${Math.round(cp * 0.65)} – ${Math.round(cp * 0.80)} W` },
      { id: "Z2", name: "Moderado / Fondo", nameColor: "text-sky-600 dark:text-sky-400", pct: "80% – 90% CP", range: `${Math.round(cp * 0.80) + 1} – ${Math.round(cp * 0.90)} W` },
      { id: "Z3", name: "Umbral Potencia", nameColor: "text-amber-500 dark:text-amber-400", pct: "90% – 100% CP", range: `${Math.round(cp * 0.90) + 1} – ${cp} W` },
      { id: "Z4", name: "Intervalo VO2", nameColor: "text-orange-500 dark:text-orange-400", pct: "100% – 115% CP", range: `${cp + 1} – ${Math.round(cp * 1.15)} W` },
      { id: "Z5", name: "Repetición Anaeróbica", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 115% CP", range: `> ${Math.round(cp * 1.15)} W` },
      { id: "SS", name: "Sweet Spot", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "84% – 97% CP", range: `${Math.round(cp * 0.84)} – ${Math.round(cp * 0.97)} W` },
    ];
  }, [runFtp]);

  // ── 4. ZONAS CARDÍACAS (LTHR) ──
  const hrZones = useMemo(() => {
    const hr = safeLthr;
    return [
      { id: "Z1", name: "Recuperación", nameColor: "text-slate-500 dark:text-slate-400", pct: "< 83% LTHR", range: `< ${Math.round(hr * 0.83)} bpm` },
      { id: "Z2", name: "Aeróbico Fondo", nameColor: "text-sky-600 dark:text-sky-400", pct: "83% – 88% LTHR", range: `${Math.round(hr * 0.83)} – ${Math.round(hr * 0.88)} bpm` },
      { id: "Z3", name: "Tempo Aeróbico", nameColor: "text-emerald-600 dark:text-emerald-400", pct: "89% – 93% LTHR", range: `${Math.round(hr * 0.88) + 1} – ${Math.round(hr * 0.93)} bpm` },
      { id: "Z4", name: "Sub-Umbral", nameColor: "text-amber-500 dark:text-amber-400", pct: "94% – 99% LTHR", range: `${Math.round(hr * 0.93) + 1} – ${hr} bpm` },
      { id: "Z5", name: "Super-Umbral / Máx", nameColor: "text-rose-600 dark:text-rose-400", pct: "> 100% LTHR", range: `> ${hr} bpm` },
    ];
  }, [safeLthr]);

  const renderZoneRows = (zones: ZoneItem[], valueHeader: string) => (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <div className="grid grid-cols-12 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
        <span className="col-span-2">Zona</span>
        <span className="col-span-5">Descripción Fisiológica</span>
        <span className="col-span-2 text-right hidden sm:block">% Rango</span>
        <span className="col-span-5 sm:col-span-3 text-right">{valueHeader}</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums text-xs sm:text-sm">
        {zones.map((z) => (
          <div key={z.id} className="grid grid-cols-12 items-center px-3.5 py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
            <span className="col-span-2 font-black text-slate-800 dark:text-slate-200 text-xs">{z.id}</span>
            <span className={`col-span-5 font-bold ${z.nameColor} truncate pr-2 text-xs sm:text-sm`}>{z.name}</span>
            <span className="col-span-2 text-right text-slate-400 text-xs hidden sm:block">{z.pct}</span>
            <span className="col-span-5 sm:col-span-3 text-right font-black text-slate-900 dark:text-white text-xs sm:text-sm">{z.range}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 select-none">
      {/* ── DISCIPLINA: CARRERA ── */}
      {selectedSport === "RUN" && (
        <div className="space-y-4 animate-fadeIn">
          {suggestedRunFtp && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedRunFtp} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}
          {suggestedRunPace && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedRunPace} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                  {runTelemetryMode === "POWER" ? "Zonas de Potencia Stryd (CP)" : "Zonas de Ritmo Daniels VDOT"}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {runTelemetryMode === "POWER" ? `${runFtp || 336}W CP` : "Ritmo Umbral"}
                </span>
              </div>
              {runTelemetryMode === "POWER" ? renderZoneRows(strydZones, "Vatios (W)") : renderZoneRows(paceZones, "Ritmo (/km)")}
            </div>

            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Zonas Cardíacas (FC Carrera)</span>
                <span className="text-[10px] font-mono text-rose-500 font-bold">{safeLthr} ppm LTHR</span>
              </div>
              {renderZoneRows(hrZones, "Pulsaciones")}
            </div>
          </div>
        </div>
      )}

      {/* ── DISCIPLINA: CICLISMO ── */}
      {selectedSport === "BIKE" && (
        <div className="space-y-4 animate-fadeIn">
          {suggestedBikeFtp && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedBikeFtp} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                  {bikeTelemetryMode === "POWER" ? "Modelo Coggan 7 Zonas (FTP Ciclismo)" : "Zonas Cardíacas (Ciclismo)"}
                </span>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                  {bikeTelemetryMode === "POWER" ? `${bikeFtp || 226}W FTP` : `${safeLthr} ppm`}
                </span>
              </div>
              {bikeTelemetryMode === "POWER" ? renderZoneRows(cyclingZones, "Vatios (W)") : renderZoneRows(hrZones, "Pulsaciones")}
            </div>

            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                  {bikeTelemetryMode === "POWER" ? "Zonas Cardíacas (Ciclismo LTHR)" : "Modelo Coggan Potencia"}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {bikeTelemetryMode === "POWER" ? `${safeLthr} ppm` : `${bikeFtp || 226}W`}
                </span>
              </div>
              {bikeTelemetryMode === "POWER" ? renderZoneRows(hrZones, "Pulsaciones") : renderZoneRows(cyclingZones, "Vatios (W)")}
            </div>
          </div>
        </div>
      )}

      {/* ── DISCIPLINA: NATACIÓN ── */}
      {selectedSport === "SWIM" && (
        <div className="space-y-4 animate-fadeIn">
          {suggestedSwimCss && onApplySuggestion && onDismissSuggestion && (
            <SuggestedThresholdBanner suggestion={suggestedSwimCss} onApply={onApplySuggestion} onDismiss={onDismissSuggestion} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Zonas Fisiológicas CSS (Velocidad Crítica)
                </span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  CSS {swimCssStr || "2:10"}/100m
                </span>
              </div>
              {renderZoneRows(swimZones, "Ritmo (/100m)")}
            </div>

            <div>
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">
                  Zonas Cardíacas / Esfuerzo (Natación)
                </span>
                <span className="text-[10px] font-mono text-rose-500 font-bold">{safeLthr} ppm</span>
              </div>
              {renderZoneRows(hrZones, "Pulsaciones")}
            </div>
          </div>

          {/* Acordeón de Tiempos de Paso por Distancia */}
          <SwimPacingAccordion swimCssSec={liveSwimCssSec} swimCssStr={swimCssStr} />
        </div>
      )}
    </div>
  );
};
