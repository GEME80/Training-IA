"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Plus,
  RotateCcw,
  Zap,
  Activity,
  Clock,
  Search,
  RefreshCw,
  Edit,
  Trash2,
} from "lucide-react";
import { MacrocycleDefinition, IntensityMetric, SportType } from "@/lib/physiology/macrocycleLibrary";

interface AdminProgramLibrariesTabProps {
  programs: MacrocycleDefinition[];
  isLoadingPrograms: boolean;
  onRefreshPrograms: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
  getAuthParams: () => { requesterUid: string; requesterEmail: string };
}

export const AdminProgramLibrariesTab: React.FC<AdminProgramLibrariesTabProps> = ({
  programs,
  isLoadingPrograms,
  onRefreshPrograms,
  showMessage,
  getAuthParams,
}) => {
  const [programSearch, setProgramSearch] = useState<string>("");
  const [sportFilter, setSportFilter] = useState<string>("ALL");
  const [metricFilter, setMetricFilter] = useState<string>("ALL");

  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<MacrocycleDefinition | null>(null);
  const [isSavingProgram, setIsSavingProgram] = useState<boolean>(false);

  const [isAiProgramModalOpen, setIsAiProgramModalOpen] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [aiSportInput, setAiSportInput] = useState<SportType>("running");
  const [aiDistanceInput, setAiDistanceInput] = useState<string>("42k");
  const [aiMetricInput, setAiMetricInput] = useState<IntensityMetric>("POWER");
  const [isGeneratingAiProgram, setIsGeneratingAiProgram] = useState<boolean>(false);

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(programSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(programSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(programSearch.toLowerCase());

    const matchesSport = sportFilter === "ALL" || p.sport === sportFilter;
    const matchesMetric = metricFilter === "ALL" || p.supportedMetrics?.includes(metricFilter as IntensityMetric);

    return matchesSearch && matchesSport && matchesMetric;
  });

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    setIsSavingProgram(true);
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...authParams,
          action: "CREATE",
          program: editingProgram,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(data.message || "Programa guardado con éxito.", "success");
        setIsProgramModalOpen(false);
        setEditingProgram(null);
        onRefreshPrograms();
      } else {
        showMessage(data.error || "Error al guardar el programa.", "error");
      }
    } catch {
      showMessage("Error de red al guardar el programa.", "error");
    } finally {
      setIsSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este programa de las librerías activas?")) return;
    try {
      const authParams = getAuthParams();
      const queryParams = new URLSearchParams();
      queryParams.set("id", id);
      queryParams.set("requesterUid", authParams.requesterUid);
      queryParams.set("requesterEmail", authParams.requesterEmail);

      const res = await fetch(`/api/admin/programs?${queryParams.toString()}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Programa eliminado de las librerías.", "success");
        onRefreshPrograms();
      } else {
        showMessage(data.error || "Error al eliminar.", "error");
      }
    } catch {
      showMessage("Error al eliminar el programa.", "error");
    }
  };

  const handleResetPrograms = async () => {
    if (!confirm("¿Deseas restablecer todas las librerías a los programas oficiales de fábrica?")) return;
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...authParams,
          action: "RESET",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Librerías restablecidas a los programas oficiales.", "success");
        onRefreshPrograms();
      } else {
        showMessage(data.error || "Error al restablecer.", "error");
      }
    } catch {
      showMessage("Error al restablecer librerías.", "error");
    }
  };

  const handleGenerateAiProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    setIsGeneratingAiProgram(true);
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...authParams,
          action: "GENERATE_AI",
          aiPrompt: aiPromptInput,
          sport: aiSportInput,
          distanceType: aiDistanceInput || "custom",
          defaultMetric: aiMetricInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.generatedProgram) {
        setEditingProgram(data.generatedProgram);
        setIsAiProgramModalOpen(false);
        setIsProgramModalOpen(true);
        showMessage("¡Programa generado con éxito por el Agente de IA! Puedes revisarlo y guardarlo.", "success");
      } else {
        showMessage(data.error || "No se pudo generar el programa.", "error");
      }
    } catch {
      showMessage("Error de red al generar con IA.", "error");
    } finally {
      setIsGeneratingAiProgram(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera & Acciones Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">Librerías & Programas Deportivos</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Catálogo maestro de planes de periodización. Configura disciplinas, modalidades de intensidad (Potencia, Frecuencia Cardíaca, Ritmo, RPE) y fondos clave (hasta 34 km en Maratón).
          </p>
        </div>

        {/* Botones de Acción de SuperAdmin */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAiProgramModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Crear con Asistente IA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingProgram({
                id: `custom-program-${Date.now()}`,
                title: "Nuevo Programa Personalizado",
                subtitle: "Definición deportiva personalizada",
                category: "RACE_TARGET",
                distanceType: "custom",
                sport: "running",
                supportedMetrics: ["POWER", "HEART_RATE", "PACE", "RPE"],
                defaultMetric: "POWER",
                icon: "🏃‍♂️",
                badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                accentColor: "from-blue-500 to-indigo-600",
                minWeeks: 8,
                maxWeeks: 20,
                defaultWeeks: 12,
                maxLongRunKm: 24,
                maxLongRunMinutes: 130,
                description: "Descripción metodológica del programa...",
                physiologicalFocus: ["Capacidad aeróbica", "Fuerza específica", "Umbral funcional", "Tapering"],
                keyWorkoutsSummary: ["Tirada progresiva", "Series de umbral", "Cuestas de potencia", "Recuperación activa"],
                recommendedFor: "Atletas de resistencia.",
                phaseRatios: { base: 0.30, build: 0.40, peak: 0.20, taper: 0.10 },
              });
              setIsProgramModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Programa</span>
          </button>

          <button
            type="button"
            onClick={handleResetPrograms}
            title="Restablecer catálogo oficial de fábrica"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modalidades de Intensidad & Métricas HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-amber-600">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold">⚡ Potencia</span>
          </div>
          <p className="text-[11px] text-slate-500">Stryd CP (% CP) & Bike FTP (% FTP en Vatios)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-rose-600">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold">💓 Frecuencia Cardíaca</span>
          </div>
          <p className="text-[11px] text-slate-500">% LTHR, % FC Máx & Zonas Cardíacas Z1-Z5</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-cyan-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold">⏱️ Ritmo / Velocidad</span>
          </div>
          <p className="text-[11px] text-slate-500">Ritmos objetivos min/km, min/mile y % VAM</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold">🧠 Sensaciones / RPE</span>
          </div>
          <p className="text-[11px] text-slate-500">Escala de Borg 1-10 & Esfuerzo Perceptual</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={programSearch}
            onChange={(e) => setProgramSearch(e.target.value)}
            placeholder="Buscar programa o palabra clave..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">🏃 Todos los Deportes</option>
            <option value="running">🏃 Carrera en Ruta</option>
            <option value="trail_running">⛰️ Trail Running</option>
            <option value="cycling">🚴 Ciclismo / Fondo</option>
            <option value="triathlon">🏊🚴🏃 Triatlón</option>
            <option value="maintenance">🛡️ Salud / Mantenimiento</option>
          </select>

          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">🎯 Todas las Métricas</option>
            <option value="POWER">⚡ Potencia</option>
            <option value="HEART_RATE">💓 Frecuencia Cardíaca</option>
            <option value="PACE">⏱️ Ritmo</option>
            <option value="RPE">🧠 Sensaciones (RPE)</option>
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas de Programas */}
      {isLoadingPrograms ? (
        <div className="flex items-center justify-center p-12 space-x-3 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Cargando catálogo deportivo...</span>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No se encontraron programas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-cyan-400/80"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{prog.icon || "🏃‍♂️"}</span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug">
                        {prog.subtitle}
                      </p>
                    </div>
                  </div>
                  {prog.isCustom && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      Personalizado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    {prog.category === "RACE_TARGET" ? "🏆 Carrera Objetivo" : "🌱 Momento del Atleta"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {prog.distanceType.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-white">
                    {prog.defaultWeeks} Semanas
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Métricas de Intensidad</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {prog.supportedMetrics?.map((m) => (
                      <span
                        key={m}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          m === "POWER"
                            ? "bg-amber-100 text-amber-800"
                            : m === "HEART_RATE"
                            ? "bg-rose-100 text-rose-800"
                            : m === "PACE"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {m === "POWER" ? "⚡ Potencia" : m === "HEART_RATE" ? "💓 FC" : m === "PACE" ? "⏱️ Ritmo" : "🧠 RPE"}
                        {m === prog.defaultMetric && " ★"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>🔥 Tirada Pico Máxima</span>
                    <span className="font-mono text-amber-700 font-black">
                      {prog.maxLongRunKm ? `${prog.maxLongRunKm} km` : `${prog.maxLongRunMinutes} min`}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium">
                    {prog.maxLongRunKm && prog.maxLongRunKm >= 30
                      ? `Incluye fondos rectores de 30 a 34 km para maratón.`
                      : `Duración máxima: ~${prog.maxLongRunMinutes} minutos.`}
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {prog.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProgram({ ...prog });
                    setIsProgramModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProgram({
                      ...prog,
                      id: `${prog.id}-copy-${Date.now().toString().slice(-4)}`,
                      title: `${prog.title} (Copia)`,
                      isCustom: true,
                    });
                    setIsProgramModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  title="Duplicar programa"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>

                {prog.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProgram(prog.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="Eliminar programa personalizado"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
