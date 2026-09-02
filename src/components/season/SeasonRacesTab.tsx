"use client";

import React, { useState } from "react";
import { Flag, Trophy, Plus, Trash2, Calendar, ChevronDown, ChevronUp, Sparkles, Clock, Target } from "lucide-react";
import { TargetRace } from "@/lib/physiology/macrocycle";
import { SeasonPrimaryRaceCard } from "./SeasonPrimaryRaceCard";

interface SeasonRacesTabProps {
  targetRaces: TargetRace[];
  newRaceName: string;
  setNewRaceName: (v: string) => void;
  newRaceDate: string;
  setNewRaceDate: (v: string) => void;
  newRaceDistance: TargetRace["distance"];
  setNewRaceDistance: (v: TargetRace["distance"]) => void;
  newRacePriority: "A" | "B" | "C";
  setNewRacePriority: (v: "A" | "B" | "C") => void;
  newRaceGoal: string;
  setNewRaceGoal: (v: string) => void;
  onAddRace: (e: React.FormEvent) => void;
  onDeleteRace: (id: string) => void;
}

export const SeasonRacesTab: React.FC<SeasonRacesTabProps> = ({
  targetRaces,
  newRaceName,
  setNewRaceName,
  newRaceDate,
  setNewRaceDate,
  newRaceDistance,
  setNewRaceDistance,
  newRacePriority,
  setNewRacePriority,
  newRaceGoal,
  setNewRaceGoal,
  onAddRace,
  onDeleteRace,
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(targetRaces.length === 0);
  const [isCustomDistance, setIsCustomDistance] = useState<boolean>(false);
  const [customDistanceText, setCustomDistanceText] = useState<string>("");

  const distancePills: { label: string; value: TargetRace["distance"] }[] = [
    { label: "42K", value: "42k" },
    { label: "21K", value: "21k" },
    { label: "10K", value: "10k" },
    { label: "5K", value: "5k" },
    { label: "Gran Fondo", value: "cycling_fondo" as any },
    { label: "Sprint / Olímpico", value: "triathlon_short" as any },
    { label: "70.3 Triatlón", value: "triathlon_703" },
    { label: "Full 140.6", value: "triathlon_1406" as any },
    { label: "Ultra Trail", value: "ultra" as any },
    { label: "Mantenimiento", value: "maintenance" },
  ];

  const priorityPills: { label: string; value: "A" | "B" | "C" }[] = [
    { label: "🥇 Tipo A (Principal)", value: "A" },
    { label: "🥈 Tipo B (Test)", value: "B" },
    { label: "🥉 Tipo C (Entrenamiento)", value: "C" },
  ];

  const getWeeksLeft = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const raceDate = new Date(dateStr + "T00:00:00");
    const diff = raceDate.getTime() - new Date().getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  };

  const primaryRace = targetRaces.find((r) => r.priority === "A") || (targetRaces.length > 0 ? targetRaces[0] : null);
  const secondaryRaces = targetRaces.filter((r) => r.id !== primaryRace?.id);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomDistance && customDistanceText.trim()) {
      setNewRaceDistance(customDistanceText.trim().toLowerCase() as any);
    }
    onAddRace(e);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. CABECERA & BOTÓN DESPLEGABLE DE AÑADIR CARRERA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Mis Competiciones & Objetivos ({targetRaces.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400 dark:text-cyan-600" />
            <span>{isFormOpen ? "Cerrar" : "Añadir Carrera"}</span>
            {isFormOpen ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
          </button>
        </div>

        {/* 2. FORMULARIO COMPACTO (COLAPSABLE) */}
        {isFormOpen && (
          <form
            onSubmit={handleFormSubmit}
            className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn"
          >
            {/* Nombre y Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
                  Nombre de la Prueba
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Maratón de Tokio, 15K Allianz..."
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  required
                  value={newRaceDate}
                  onChange={(e) => setNewRaceDate(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Selector de Distancia en Pills con Verde Esmeralda */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase pb-1.5">
                Distancia / Disciplina
              </label>
              <div className="flex flex-wrap gap-1.5">
                {distancePills.map((dp) => {
                  const isSelected = !isCustomDistance && newRaceDistance === dp.value;
                  return (
                    <button
                      key={dp.value}
                      type="button"
                      onClick={() => {
                        setIsCustomDistance(false);
                        setNewRaceDistance(dp.value);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {dp.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomDistance(true)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                    isCustomDistance
                      ? "bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ✏️ Personalizado
                </button>
              </div>

              {isCustomDistance && (
                <div className="mt-2 animate-fadeIn">
                  <input
                    type="text"
                    required
                    placeholder="Escribe la distancia (ej. 15K, 12 Millas, 100K Ultra, Gran Fondo 140K)..."
                    value={customDistanceText}
                    onChange={(e) => {
                      setCustomDistanceText(e.target.value);
                      setNewRaceDistance(e.target.value.toLowerCase() as any);
                    }}
                    className="w-full rounded-xl border border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Selector de Prioridad en Pills Temáticos */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase pb-1.5">
                Prioridad Atlética
              </label>
              <div className="flex flex-wrap gap-1.5">
                {priorityPills.map((pp) => {
                  const isSelected = newRacePriority === pp.value;
                  return (
                    <button
                      key={pp.value}
                      type="button"
                      onClick={() => setNewRacePriority(pp.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        isSelected
                          ? pp.value === "A"
                            ? "bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-500/30"
                            : pp.value === "B"
                            ? "bg-sky-600 text-white font-black shadow-xs ring-2 ring-sky-500/30"
                            : "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 font-black shadow-xs ring-2 ring-slate-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pp.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meta y Botón de Enviar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Meta de Rendimiento (ej. Sub-3h00 / 275W / Disfrutar)"
                value={newRaceGoal}
                onChange={(e) => setNewRaceGoal(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Guardar</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. HERO OBJETIVO PRINCIPAL (TIPO A) */}
      {primaryRace && (
        <SeasonPrimaryRaceCard
          primaryRace={primaryRace}
          weeksLeft={getWeeksLeft(primaryRace.date)}
          onDeleteRace={onDeleteRace}
        />
      )}

      {/* 4. COMPETICIONES SECUNDARIAS (TIPO B & C) */}
      {secondaryRaces.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1 block">
            Competiciones Secundarias & Test ({secondaryRaces.length})
          </span>

          <div className="space-y-2">
            {secondaryRaces.map((race) => {
              const weeksLeft = getWeeksLeft(race.date);
              return (
                <div
                  key={race.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black font-mono ${
                        race.priority === "B"
                          ? "bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30"
                          : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                      }`}>
                        Tipo {race.priority}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {race.name}
                      </h5>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-sky-500" />
                        {race.date}
                      </span>
                      <span>• {race.distance?.toUpperCase()}</span>
                      {weeksLeft !== null && (
                        <span className="text-sky-600 dark:text-sky-400 font-bold">
                          ⏳ {weeksLeft > 0 ? `-${weeksLeft}w` : "¡Hoy!"}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteRace(race.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Eliminar carrera"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {targetRaces.length === 0 && (
        <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-2">
          <Flag className="h-6 w-6 text-slate-400 mx-auto" />
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
            No tienes carreras registradas en tu calendario
          </div>
          <p className="text-[11px] text-slate-400">
            Añade tu prueba objetivo principal (Tipo A) o tests preparatorios (Tipo B/C) para sincronizar tu periodización.
          </p>
        </div>
      )}
    </div>
  );
};
