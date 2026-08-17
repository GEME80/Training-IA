"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Trophy,
  HeartPulse,
  Calendar,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  MACROCYCLE_LIBRARY,
  MacrocycleDefinition,
  MacrocycleCategory,
  MacrocycleDistanceType,
} from "@/lib/physiology/macrocycleLibrary";
import {
  generateCustomMacrocycleBlueprint,
  formatDate,
  getMonday,
} from "@/lib/physiology/macrocycleGenerator";
import { MacrocycleBlueprint, TargetRace } from "@/lib/physiology/macrocycle";
import { MacrocyclePreviewTimeline } from "./MacrocyclePreviewTimeline";
import { WeeklyAvailabilityMap, DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/gemini/engine";

interface MacrocycleLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  runFtp: number;
  bikeFtp: number;
  weeklyAvailability?: WeeklyAvailabilityMap;
  onApplyMacrocycle: (blueprint: MacrocycleBlueprint, targetRace?: TargetRace) => void;
}

export const MacrocycleLibraryModal: React.FC<MacrocycleLibraryModalProps> = ({
  isOpen,
  onClose,
  runFtp,
  bikeFtp,
  weeklyAvailability = DEFAULT_WEEKLY_AVAILABILITY,
  onApplyMacrocycle,
}) => {
  const [activeCategory, setActiveCategory] = useState<MacrocycleCategory>("RACE_TARGET");
  const [selectedMacrocycleId, setSelectedMacrocycleId] = useState<string>("marathon-specific");

  // Parámetros de configuración de fecha
  const initialStartDate = useMemo(() => {
    const today = new Date();
    const mon = getMonday(today);
    return formatDate(mon);
  }, []);

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [weeksCount, setWeeksCount] = useState<number>(16);
  const [customGoalName, setCustomGoalName] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const selectedDef: MacrocycleDefinition = useMemo(() => {
    return (
      MACROCYCLE_LIBRARY.find((m) => m.id === selectedMacrocycleId) ||
      MACROCYCLE_LIBRARY[0]
    );
  }, [selectedMacrocycleId]);

  // Al cambiar de macrociclo seleccionado, actualizar semanas por defecto
  const handleSelectMacrocycle = (def: MacrocycleDefinition) => {
    setSelectedMacrocycleId(def.id);
    setWeeksCount(def.defaultWeeks);
    setCustomGoalName(def.title);

    // Calcular fecha fin estimada
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(startObj);
    endObj.setDate(startObj.getDate() + def.defaultWeeks * 7 - 1);
    setEndDate(formatDate(endObj));
  };

  // Manejar cambio en fecha fin
  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    if (!newEndDate || !startDate) return;
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(newEndDate + "T00:00:00");
    const diffMs = endObj.getTime() - startObj.getTime();
    const w = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 7)));
    if (w >= 2 && w <= 30) {
      setWeeksCount(w);
    }
  };

  // Manejar cambio en semanas
  const handleWeeksChange = (newWeeks: number) => {
    setWeeksCount(newWeeks);
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(startObj);
    endObj.setDate(startObj.getDate() + newWeeks * 7 - 1);
    setEndDate(formatDate(endObj));
  };

  // Generar el Blueprint en tiempo real para previsualización
  const previewBlueprint: MacrocycleBlueprint = useMemo(() => {
    const primaryRace: TargetRace | null =
      selectedDef.category === "RACE_TARGET"
        ? {
            id: `race-${Date.now()}`,
            name: customGoalName || selectedDef.title,
            date: endDate || formatDate(new Date()),
            distance: selectedDef.distanceType as any,
            priority: "A",
            goalTarget: "Pico de Forma Objetivo",
          }
        : null;

    return generateCustomMacrocycleBlueprint({
      definitionId: selectedDef.id,
      distanceType: selectedDef.distanceType,
      startDate,
      endDate: endDate || undefined,
      weeksCount,
      primaryRace,
      customGoal: customGoalName || selectedDef.title,
    });
  }, [selectedDef, startDate, endDate, weeksCount, customGoalName]);

  const handleSaveAndApply = () => {
    onApplyMacrocycle(previewBlueprint, previewBlueprint.primaryRace || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="card-gradient relative w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-950 p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-amber-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                Biblioteca de Macrociclos & Configurador de Temporada
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona tu objetivo, ajusta tus fechas y previsualiza la periodización completa antes de guardar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveCategory("RACE_TARGET")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
              activeCategory === "RACE_TARGET"
                ? "bg-amber-500 text-black shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>1. Carreras Objetivo (42K, 21K, 10K, 5K, Ciclismo, Triatlón)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("ATHLETE_MOMENT")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
              activeCategory === "ATHLETE_MOMENT"
                ? "bg-blue-500 text-white shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            <span>2. Momentos del Atleta (Mantenimiento, Base GPP, Recuperación, Retorno)</span>
          </button>
        </div>

        {/* Macrocycles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MACROCYCLE_LIBRARY.filter((m) => m.category === activeCategory).map((def) => {
            const isSelected = def.id === selectedMacrocycleId;

            return (
              <button
                key={def.id}
                type="button"
                onClick={() => handleSelectMacrocycle(def)}
                className={`text-left rounded-xl p-4 border transition-all relative flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-slate-900 border-amber-500/80 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{def.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${def.badgeColor}`}>
                      {def.minWeeks} a {def.maxWeeks} Semanas
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                    {def.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{def.subtitle}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {def.description}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-amber-400 pt-1">
                    <span>Periodización 3:1 Incluida</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Bar with Dates & Weeks */}
        <div className="rounded-xl bg-slate-900/90 p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Configuración del Calendario: {selectedDef.title}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Duración recomendada: <strong>{selectedDef.defaultWeeks} semanas</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nombre del Objetivo */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nombre de la Carrera / Meta
              </label>
              <input
                type="text"
                value={customGoalName}
                onChange={(e) => setCustomGoalName(e.target.value)}
                placeholder={selectedDef.title}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-teal-400" />
                Fecha de Inicio (Lunes)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleWeeksChange(weeksCount);
                }}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Fecha Fin / Competición */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                Fecha Fin / Día de Carrera
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Slider de Semanas */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
              Número de Semanas ({weeksCount} sem):
            </span>
            <input
              type="range"
              min={selectedDef.minWeeks}
              max={selectedDef.maxWeeks}
              value={weeksCount}
              onChange={(e) => handleWeeksChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              {weeksCount} Semanas
            </span>
          </div>
        </div>

        {/* Previsualizador Interactivo Fase por Fase (Preview Before Commit) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Previsualización del Plan de Entrenamiento (Antes de Guardar)
            </h3>
          </div>

          <MacrocyclePreviewTimeline
            blueprint={previewBlueprint}
            runFtp={runFtp}
            bikeFtp={bikeFtp}
            weeklyAvailability={weeklyAvailability}
            distanceType={selectedDef.distanceType}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            ℹ️ Al guardar, este macrociclo se establecerá como el <strong>Plan Rector Activo</strong> de tu temporada.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Guardar & Activar Macrociclo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
