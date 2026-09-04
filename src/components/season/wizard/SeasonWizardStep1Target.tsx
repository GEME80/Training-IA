"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Calendar, Target, Clock, Sparkles, Plus, Compass, Check, ArrowRight } from "lucide-react";
import { TargetRace } from "@/lib/physiology/macrocycle";
import { SeasonWizardTargetDistanceSelector } from "./SeasonWizardTargetDistanceSelector";

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

export const SeasonWizardStep1Target: React.FC<SeasonWizardStep1TargetProps> = ({
  primaryRace,
  targetRaces = [],
  onSelectPrimaryRace,
  onAddNewRace,
  targetDistance,
  onChangeDistance,
  customDistanceText,
  onChangeCustomDistanceText,
  isCustomDistance,
  onToggleCustomDistance,
  weeksCount,
  onChangeWeeksCount,
  planTitle,
  onChangePlanTitle,
  startDateMode,
  onChangeStartDateMode,
  customStartDate,
  onChangeCustomStartDate,
}) => {
  const [isCreatingInline, setIsCreatingInline] = useState(false);
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
      id: "race_" + Date.now(),
      name: inlineName.trim(),
      date: inlineDate,
      distance: inlineDistance,
      priority: "A",
      goalTarget: inlineGoal.trim() || "Pico de forma óptimo",
    };

    if (onAddNewRace) onAddNewRace(newRace);
    if (onSelectPrimaryRace) onSelectPrimaryRace(newRace);

    const raceDate = new Date(inlineDate + "T00:00:00");
    const diffWeeks = Math.max(4, Math.ceil((raceDate.getTime() - Date.now()) / (7 * 86400000)));
    onChangeWeeksCount(Math.min(36, diffWeeks));
    onChangePlanTitle(`Macrociclo para ${newRace.name} (${newRace.distance?.toUpperCase()})`);
    onChangeDistance(newRace.distance || "42k");

    setIsCreatingInline(false);
    setInlineName("");
    setInlineDate("");
    setInlineGoal("");
  };

  const maxSliderWeeks = Math.max(36, (weeksUntilRace || 0) + 4);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. SECCIÓN DE CARRERA OBJETIVO */}
      {primaryRace ? (
        <div className="rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] font-mono">
              <Trophy className="h-3 w-3" /> CARRERA OBJETIVO VINCULADA
            </span>
            {weeksUntilRace !== null && (
              <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300">
                ⏳ Faltan {weeksUntilRace} semanas ({primaryRace.date})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize">
                {primaryRace.name} ({primaryRace.distance?.toUpperCase()})
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Meta: {primaryRace.goalTarget || "Pico de forma"} • Distancia heredada: <strong className="text-amber-700 dark:text-amber-300">{primaryRace.distance?.toUpperCase()}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {targetRaces.length > 1 && onSelectPrimaryRace && (
                <select
                  value={primaryRace.id}
                  onChange={(e) => {
                    const found = targetRaces.find((r) => r.id === e.target.value);
                    if (found) {
                      onSelectPrimaryRace(found);
                      onChangeDistance(found.distance || "42k");
                      onChangePlanTitle(`Macrociclo para ${found.name} (${found.distance?.toUpperCase()})`);
                    }
                  }}
                  aria-label="Cambiar carrera vinculada"
                  className="px-2 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-white"
                >
                  {targetRaces.map((r) => (
                    <option key={r.id} value={r.id}>Cambiar: {r.name} ({r.distance})</option>
                  ))}
                </select>
              )}
              {onSelectPrimaryRace && (
                <button type="button" onClick={() => onSelectPrimaryRace(null)} className="text-[10px] font-mono text-slate-400 hover:text-rose-500 underline cursor-pointer">
                  Desvincular
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isCreatingInline ? (
        <form onSubmit={handleSaveInlineRace} className="rounded-2xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-emerald-500" /> Registrar Nueva Carrera Objetivo
            </h4>
            <button type="button" onClick={() => setIsCreatingInline(false)} className="text-[11px] font-mono text-slate-400 hover:text-slate-600 cursor-pointer">
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Nombre de la Carrera</label>
              <input type="text" required value={inlineName} onChange={(e) => setInlineName(e.target.value)} placeholder="Ej: Maratón de Valencia" className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Fecha del Evento</label>
              <input type="date" required value={inlineDate} onChange={(e) => setInlineDate(e.target.value)} className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Distancia</label>
              <select value={inlineDistance} onChange={(e) => setInlineDistance(e.target.value as any)} className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <option value="42k">Maratón (42K)</option>
                <option value="21k">Medio Maratón (21K)</option>
                <option value="10k">10K</option>
                <option value="5k">5K</option>
                <option value="triathlon_703">Triatlón 70.3</option>
                <option value="triathlon_1406">Triatlón 140.6</option>
                <option value="trail">Trail Running</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase">Objetivo / Marca</label>
              <input type="text" value={inlineGoal} onChange={(e) => setInlineGoal(e.target.value)} placeholder="Ej: Sub 3h30" className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white" />
            </div>
          </div>

          <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> <span>Guardar y Vincular al Macrociclo</span>
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Objetivo del Macrociclo</h4>
            </div>
            <button type="button" onClick={() => setIsCreatingInline(true)} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Plus className="h-3.5 w-3.5" /> <span>Añadir Carrera Objetivo</span>
            </button>
          </div>

          {targetRaces.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 block font-bold">O selecciona una de tus carreras guardadas:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {targetRaces.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (onSelectPrimaryRace) onSelectPrimaryRace(r);
                      onChangeDistance(r.distance || "42k");
                      onChangePlanTitle(`Macrociclo para ${r.name} (${r.distance?.toUpperCase()})`);
                      const rDate = new Date(r.date + "T00:00:00");
                      const diff = Math.max(4, Math.ceil((rDate.getTime() - Date.now()) / (7 * 86400000)));
                      onChangeWeeksCount(Math.min(36, diff));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block capitalize">{r.name}</strong>
                      <span className="text-[10px] font-mono text-slate-500">{r.date} • {r.distance?.toUpperCase()}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button type="button" onClick={() => { onChangePlanTitle("Construcción de Base Aeróbica (GPP)"); onChangeDistance("42k"); onChangeWeeksCount(12); }} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-emerald-500 transition cursor-pointer">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">Fase 1</span>
                <strong className="text-xs text-slate-900 dark:text-white block">Base Aeróbica</strong>
                <span className="text-[10px] text-slate-400">12 semanas</span>
              </button>
              <button type="button" onClick={() => { onChangePlanTitle("Aumento de Umbral & Potencia"); onChangeDistance("21k"); onChangeWeeksCount(8); }} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-emerald-500 transition cursor-pointer">
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold block">Fase 2</span>
                <strong className="text-xs text-slate-900 dark:text-white block">Umbral & Vatios</strong>
                <span className="text-[10px] text-slate-400">8 semanas</span>
              </button>
              <button type="button" onClick={() => { onChangePlanTitle("Mantenimiento Físico"); onChangeDistance("maintenance"); onChangeWeeksCount(6); }} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-emerald-500 transition cursor-pointer">
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold block">Fase 3</span>
                <strong className="text-xs text-slate-900 dark:text-white block">Mantenimiento</strong>
                <span className="text-[10px] text-slate-400">6 semanas</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. TÍTULO DEL MACROCICLO */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">Nombre del Macrociclo</label>
        <input type="text" value={planTitle} onChange={(e) => onChangePlanTitle(e.target.value)} placeholder="Ej: Macrociclo Maratón de Valencia 2026..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
      </div>

      {/* 3. SELECTOR DE INICIO DEL PLAN */}
      <div className="space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">¿Cuándo deseas iniciar este plan?</label>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => onChangeStartDateMode("CURRENT_WEEK")} className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer text-center ${startDateMode === "CURRENT_WEEK" ? "bg-emerald-500 text-white shadow-xs" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"}`}>
            ⚡ Esta Semana
          </button>
          <button type="button" onClick={() => onChangeStartDateMode("NEXT_WEEK")} className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer text-center ${startDateMode === "NEXT_WEEK" ? "bg-emerald-500 text-white shadow-xs" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"}`}>
            📅 Próxima Semana
          </button>
          <button type="button" onClick={() => onChangeStartDateMode("CUSTOM")} className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer text-center ${startDateMode === "CUSTOM" ? "bg-emerald-500 text-white shadow-xs" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"}`}>
            🗓️ Fecha Específica
          </button>
        </div>
        {startDateMode === "CUSTOM" && (
          <input type="date" value={customStartDate} onChange={(e) => onChangeCustomStartDate(e.target.value)} className="w-full mt-2 rounded-xl border border-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono" />
        )}
      </div>

      {/* 4. SELECTOR DE DISTANCIA (SOLO SI NO HAY CARRERA VINCULADA PARA ELIMINAR REDUNDANCIA) */}
      {!primaryRace && (
        <SeasonWizardTargetDistanceSelector
          targetDistance={targetDistance}
          onChangeDistance={onChangeDistance}
          customDistanceText={customDistanceText}
          onChangeCustomDistanceText={onChangeCustomDistanceText}
          isCustomDistance={isCustomDistance}
          onToggleCustomDistance={onToggleCustomDistance}
        />
      )}

      {/* 5. DURACIÓN EN SEMANAS */}
      <div className="space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700 dark:text-slate-300">Duración del Macrociclo:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-black">{weeksCount} Semanas</span>
        </div>
        {primaryRace?.date ? (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            🎯 Calculado automáticamente hasta la semana de la carrera ({primaryRace.name}).
          </p>
        ) : (
          <>
            <input type="range" min={4} max={maxSliderWeeks} step={1} value={weeksCount} onChange={(e) => onChangeWeeksCount(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer pt-1" />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>4 sem (Mínimo)</span>
              <span>{maxSliderWeeks === 16 ? "16 sem (Estándar)" : maxSliderWeeks === 20 ? "20 sem (Maratón)" : "36 sem (Máx)"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
