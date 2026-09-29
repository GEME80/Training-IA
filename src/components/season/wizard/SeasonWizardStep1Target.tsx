"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Flag, Plus, Check, ArrowRight, Zap, Sprout, X } from "lucide-react";
import { TargetRace } from "@/lib/physiology/macrocycle";

interface SeasonWizardStep1TargetProps {
  primaryRace: TargetRace | null;
  targetRaces?: TargetRace[];
  onSelectPrimaryRace?: (race: TargetRace | null) => void;
  onAddNewRace?: (race: TargetRace) => void;
  targetDistance: string;
  onChangeDistance: (d: string) => void;
  customDistanceText: string;
  onChangeCustomDistanceText: (t: string) => void;
  isCustomDistance: boolean;
  onToggleCustomDistance: (v: boolean) => void;
  weeksCount: number;
  onChangeWeeksCount: (w: number) => void;
  planTitle: string;
  onChangePlanTitle: (t: string) => void;
  startDateMode: "CURRENT_WEEK" | "NEXT_WEEK" | "CUSTOM";
  onChangeStartDateMode: (m: "CURRENT_WEEK" | "NEXT_WEEK" | "CUSTOM") => void;
  customStartDate: string;
  onChangeCustomStartDate: (d: string) => void;
}

const DISTANCE_OPTIONS = [
  { value: "5k", label: "5K", emoji: "🏃", color: "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300" },
  { value: "10k", label: "10K", emoji: "🏃", color: "border-lime-400 bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300" },
  { value: "21k", label: "21K Media", emoji: "🏅", color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" },
  { value: "42k", label: "42K Maratón", emoji: "🏆", color: "border-orange-400 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300" },
  { value: "triathlon_703", label: "70.3 Triatlón", emoji: "🏊", color: "border-sky-400 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300" },
  { value: "triathlon_1406", label: "140.6 IRONMAN", emoji: "⚡", color: "border-purple-400 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300" },
  { value: "cycling_fondo", label: "Gran Fondo", emoji: "🚴", color: "border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" },
  { value: "trail", label: "Trail/Ultra", emoji: "⛰️", color: "border-stone-400 bg-stone-50 dark:bg-stone-950/30 text-stone-700 dark:text-stone-300" },
];

export const SeasonWizardStep1Target: React.FC<SeasonWizardStep1TargetProps> = ({
  primaryRace, targetRaces = [], onSelectPrimaryRace, onAddNewRace,
  targetDistance, onChangeDistance,
  weeksCount, onChangeWeeksCount,
  planTitle, onChangePlanTitle,
  startDateMode, onChangeStartDateMode,
  customStartDate, onChangeCustomStartDate,
  customDistanceText, onChangeCustomDistanceText, isCustomDistance, onToggleCustomDistance,
}) => {
  // "race" | "norace" | null (not chosen yet)
  const [pathChoice, setPathChoice] = useState<"race" | "norace" | null>(() => {
    if (primaryRace) return "race";
    return null;
  });
  const [isCreatingRace, setIsCreatingRace] = useState(false);
  const [inlineName, setInlineName] = useState("");
  const [inlineDate, setInlineDate] = useState("");
  const [inlineDistance, setInlineDistance] = useState<TargetRace["distance"]>("42k");
  const [inlineGoal, setInlineGoal] = useState("");

  const weeksUntilRace = useMemo(() => {
    if (!primaryRace?.date) return null;
    const raceDate = new Date(primaryRace.date + "T00:00:00");
    const diff = raceDate.getTime() - new Date().getTime();
    return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }, [primaryRace]);

  const handleSaveInlineRace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim() || !inlineDate) return;
    const newRace: TargetRace = {
      id: "race_" + Date.now(), name: inlineName.trim(), date: inlineDate,
      distance: inlineDistance, priority: "A", goalTarget: inlineGoal.trim() || "Pico de forma óptimo",
    };
    if (onAddNewRace) onAddNewRace(newRace);
    if (onSelectPrimaryRace) onSelectPrimaryRace(newRace);
    const diffWeeks = Math.max(4, Math.ceil((new Date(inlineDate + "T00:00:00").getTime() - Date.now()) / (7 * 86400000)));
    onChangeWeeksCount(Math.min(36, diffWeeks));
    onChangePlanTitle(`Macrociclo para ${newRace.name}`);
    onChangeDistance(newRace.distance || "42k");
    setIsCreatingRace(false); setInlineName(""); setInlineDate(""); setInlineGoal("");
  };

  const handleChooseNoRace = (preset: "base" | "threshold") => {
    if (onSelectPrimaryRace) onSelectPrimaryRace(null);
    if (preset === "base") {
      onChangePlanTitle("Construcción de Base Aeróbica"); onChangeDistance("42k"); onChangeWeeksCount(12);
    } else {
      onChangePlanTitle("Bloque de Umbral & Potencia"); onChangeDistance("21k"); onChangeWeeksCount(8);
    }
    setPathChoice("norace");
  };

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* ── PREGUNTA INICIAL: ¿CON O SIN CARRERA? ── */}
      {pathChoice === null && (
        <div className="space-y-3">
          <div className="text-center space-y-1 pb-2">
            <p className="text-xs font-mono font-bold text-slate-500 uppercase">¿Cuál es tu objetivo principal?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PATH A: TENGO CARRERA */}
            <button
              type="button"
              onClick={() => setPathChoice("race")}
              className="group p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 text-left hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Tengo una carrera objetivo</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Maratón, triatlón, 10K, trail… El plan se estructura hasta el día del evento.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                Seleccionar <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            {/* PATH B: SIN CARRERA */}
            <button
              type="button"
              onClick={() => setPathChoice("norace")}
              className="group p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 text-left hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">🌱</div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Entrenamiento base / Mantenimiento</h4>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Sin carrera próxima. Mejora tu condición, potencia o mantén la forma.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Seleccionar <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── PATH A: CON CARRERA ── */}
      {pathChoice === "race" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> Carrera Objetivo
            </h4>
            <button type="button" onClick={() => { setPathChoice(null); if (onSelectPrimaryRace) onSelectPrimaryRace(null); }}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
              <X className="h-3 w-3" /> Cambiar
            </button>
          </div>

          {/* Carrera ya vinculada */}
          {primaryRace && !isCreatingRace ? (
            <div className="rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black font-mono">
                  <Trophy className="h-2.5 w-2.5" /> OBJETIVO VINCULADO
                </span>
                {weeksUntilRace !== null && (
                  <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
                    ⏳ {weeksUntilRace} semanas
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize">{primaryRace.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">{primaryRace.date} · {primaryRace.distance?.toUpperCase()}</p>
              <div className="flex items-center gap-2 pt-1">
                {targetRaces.length > 1 && onSelectPrimaryRace && (
                  <select value={primaryRace.id}
                    onChange={(e) => {
                      const f = targetRaces.find(r => r.id === e.target.value);
                      if (f) { onSelectPrimaryRace(f); onChangeDistance(f.distance || "42k"); onChangePlanTitle(`Macrociclo para ${f.name}`); }
                    }}
                    className="flex-1 px-2 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {targetRaces.map(r => <option key={r.id} value={r.id}>{r.name} ({r.distance})</option>)}
                  </select>
                )}
                <button type="button" onClick={() => setIsCreatingRace(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer">
                  + Otra carrera
                </button>
              </div>
            </div>
          ) : !isCreatingRace ? (
            /* Selección de carrera guardada o nueva */
            <div className="space-y-3">
              {targetRaces.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tus carreras guardadas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {targetRaces.map(r => (
                      <button key={r.id} type="button"
                        onClick={() => { if (onSelectPrimaryRace) onSelectPrimaryRace(r); onChangeDistance(r.distance || "42k"); onChangePlanTitle(`Macrociclo para ${r.name}`); const d = Math.max(4, Math.ceil((new Date(r.date + "T00:00:00").getTime() - Date.now()) / (7 * 86400000))); onChangeWeeksCount(Math.min(36, d)); }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-amber-400 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <strong className="text-xs text-slate-900 dark:text-white block capitalize">{r.name}</strong>
                          <span className="text-[10px] font-mono text-slate-500">{r.date} · {r.distance?.toUpperCase()}</span>
                        </div>
                        <Trophy className="h-3.5 w-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" onClick={() => setIsCreatingRace(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:border-emerald-500 transition cursor-pointer">
                <Plus className="h-4 w-4" /> Registrar nueva carrera objetivo
              </button>
            </div>
          ) : (
            /* Formulario inline nuevo */
            <form onSubmit={handleSaveInlineRace} className="rounded-2xl border border-emerald-400/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" /> Nueva Carrera
                </h4>
                <button type="button" onClick={() => setIsCreatingRace(false)} className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer">Cancelar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Nombre del Evento</label>
                  <input type="text" required value={inlineName} onChange={e => setInlineName(e.target.value)} placeholder="Ej: Maratón de Valencia" className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Fecha</label>
                  <input type="date" required value={inlineDate} onChange={e => setInlineDate(e.target.value)} className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Objetivo / Marca</label>
                  <input type="text" value={inlineGoal} onChange={e => setInlineGoal(e.target.value)} placeholder="Ej: Sub 3h30" className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Distancia / Modalidad</label>
                <div className="flex flex-wrap gap-1.5">
                  {DISTANCE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setInlineDistance(opt.value as any)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold font-mono transition cursor-pointer ${inlineDistance === opt.value ? opt.color + " border-2" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500"}`}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Guardar y Vincular al Macrociclo
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── PATH B: SIN CARRERA ── */}
      {pathChoice === "norace" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-500" /> Tipo de Entrenamiento
            </h4>
            <button type="button" onClick={() => setPathChoice(null)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
              <X className="h-3 w-3" /> Cambiar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button type="button"
              onClick={() => handleChooseNoRace("base")}
              className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition ${planTitle.includes("Base") ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400"}`}>
              <Sprout className="h-5 w-5 text-emerald-500 mb-1.5" />
              <strong className="text-xs text-slate-900 dark:text-white block">Base Aeróbica</strong>
              <span className="text-[10px] text-slate-400 font-mono">12 semanas · Zona 2 & volumen</span>
            </button>
            <button type="button"
              onClick={() => handleChooseNoRace("threshold")}
              className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition ${planTitle.includes("Umbral") ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400"}`}>
              <Zap className="h-5 w-5 text-cyan-500 mb-1.5" />
              <strong className="text-xs text-slate-900 dark:text-white block">Umbral & Potencia</strong>
              <span className="text-[10px] text-slate-400 font-mono">8 semanas · FTP & VO2max</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIGURACIÓN DE INICIO (siempre visible cuando hay un path elegido) ── */}
      {pathChoice !== null && (
        <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Inicio del plan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">¿Cuándo empezamos?</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {[["CURRENT_WEEK", "⚡ Esta Semana"], ["NEXT_WEEK", "📅 Próxima"], ["CUSTOM", "🗓️ Fecha"]] .map(([mode, label]) => (
                <button key={mode} type="button"
                  onClick={() => onChangeStartDateMode(mode as any)}
                  className={`py-2 px-1 rounded-xl font-bold transition cursor-pointer text-center ${startDateMode === mode ? "bg-emerald-500 text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                  {label}
                </button>
              ))}
            </div>
            {startDateMode === "CUSTOM" && (
              <input type="date" value={customStartDate} onChange={e => onChangeCustomStartDate(e.target.value)}
                className="w-full mt-1 rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white" />
            )}
          </div>

          {/* Duración (solo si no hay carrera vinculada) */}
          {!primaryRace && (
            <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-700 dark:text-slate-300">Duración:</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white font-black">{weeksCount} semanas</span>
              </div>
              <input type="range" min={4} max={36} step={1} value={weeksCount} onChange={e => onChangeWeeksCount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer" />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>4 sem</span><span>36 sem</span>
              </div>
            </div>
          )}
          {primaryRace?.date && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-bold">
                🎯 Duración calculada: {weeksCount} semanas hasta {primaryRace.name}
              </p>
            </div>
          )}

          {/* Nombre del macrociclo */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Nombre del Plan <span className="text-slate-300">(opcional)</span></label>
            <input type="text" value={planTitle} onChange={e => onChangePlanTitle(e.target.value)}
              placeholder="Ej: Temporada 2026 — Maratón Valencia"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
          </div>
        </div>
      )}
    </div>
  );
};
