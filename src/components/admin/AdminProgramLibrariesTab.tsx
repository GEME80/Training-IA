"use client";

import React, { useState } from "react";
import { BookOpen, Search, RefreshCw } from "lucide-react";
import { MacrocycleDefinition, IntensityMetric, SportType } from "@/lib/physiology/macrocycleLibrary";
import { AdminProgramCard } from "./AdminProgramCard";
import { AdminProgramDetailModal } from "./AdminProgramDetailModal";
import { AdminProgramAiModal } from "./AdminProgramAiModal";
import { AdminProgramHeader } from "./AdminProgramHeader";
import { AdminProgramMetricsHud } from "./AdminProgramMetricsHud";

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

  // Modal de Detalle / Edición
  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);
  const [inspectingProgram, setInspectingProgram] = useState<MacrocycleDefinition | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isSavingProgram, setIsSavingProgram] = useState<boolean>(false);

  // Modal de Asistente IA
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

  const handleInspectProgram = (prog: MacrocycleDefinition) => {
    setInspectingProgram(prog);
    setModalMode("view");
    setIsProgramModalOpen(true);
  };

  const handleEditProgram = (prog: MacrocycleDefinition) => {
    setInspectingProgram(prog);
    setModalMode("edit");
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (updatedProgram: MacrocycleDefinition) => {
    setIsSavingProgram(true);
    try {
      const authParams = getAuthParams();
      const res = await fetch("/api/admin/programs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-requester-email": authParams.requesterEmail,
          "x-requester-uid": authParams.requesterUid,
        },
        body: JSON.stringify({
          ...authParams,
          program: updatedProgram,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(data.message || `Metodología de "${updatedProgram.title}" guardada con éxito.`, "success");
        setIsProgramModalOpen(false);
        setInspectingProgram(null);
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
        headers: {
          "x-requester-email": authParams.requesterEmail,
          "x-requester-uid": authParams.requesterUid,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-requester-email": authParams.requesterEmail,
          "x-requester-uid": authParams.requesterUid,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-requester-email": authParams.requesterEmail,
          "x-requester-uid": authParams.requesterUid,
        },
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
        setInspectingProgram(data.generatedProgram);
        setIsAiProgramModalOpen(false);
        setModalMode("edit");
        setIsProgramModalOpen(true);
        showMessage("¡Programa generado con éxito por la IA! Puedes revisarlo y guardarlo.", "success");
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
      {/* 1. Cabecera & Acciones Rápidas */}
      <AdminProgramHeader
        onOpenAiModal={() => setIsAiProgramModalOpen(true)}
        onNewProgram={() => {
          setInspectingProgram({
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
          setModalMode("edit");
          setIsProgramModalOpen(true);
        }}
        onResetPrograms={handleResetPrograms}
      />

      {/* 2. Modalidades de Intensidad & Métricas HUD */}
      <AdminProgramMetricsHud />

      {/* 3. Barra de Búsqueda y Filtros */}
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
            <option value="ALL">Todos los Deportes</option>
            <option value="running">Carrera en Ruta</option>
            <option value="trail_running">Trail Running</option>
            <option value="cycling">Ciclismo / Fondo</option>
            <option value="triathlon">Triatlón</option>
            <option value="maintenance">Salud / Mantenimiento</option>
          </select>

          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">Todas las Métricas</option>
            <option value="POWER">Potencia</option>
            <option value="HEART_RATE">Frecuencia Cardíaca</option>
            <option value="PACE">Ritmo</option>
            <option value="RPE">Sensaciones (RPE)</option>
          </select>
        </div>
      </div>

      {/* 4. Grid de Tarjetas de Programas */}
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
            <AdminProgramCard
              key={prog.id}
              prog={prog}
              onInspect={handleInspectProgram}
              onEdit={handleEditProgram}
              onDuplicate={(p) => {
                setInspectingProgram({
                  ...p,
                  id: `${p.id}-copy-${Date.now().toString().slice(-4)}`,
                  title: `${p.title} (Copia)`,
                  isCustom: true,
                });
                setModalMode("edit");
                setIsProgramModalOpen(true);
              }}
              onDelete={handleDeleteProgram}
            />
          ))}
        </div>
      )}

      {/* Modal 1: Inspeccionar / Editar Metodología Completa */}
      <AdminProgramDetailModal
        program={inspectingProgram}
        isOpen={isProgramModalOpen}
        initialMode={modalMode}
        onClose={() => {
          setIsProgramModalOpen(false);
          setInspectingProgram(null);
        }}
        onSave={handleSaveProgram}
        isSaving={isSavingProgram}
      />

      {/* Modal 2: Crear con Asistente IA */}
      <AdminProgramAiModal
        isOpen={isAiProgramModalOpen}
        onClose={() => setIsAiProgramModalOpen(false)}
        onGenerate={handleGenerateAiProgram}
        aiPromptInput={aiPromptInput}
        setAiPromptInput={setAiPromptInput}
        aiSportInput={aiSportInput}
        setAiSportInput={setAiSportInput}
        aiDistanceInput={aiDistanceInput}
        setAiDistanceInput={setAiDistanceInput}
        aiMetricInput={aiMetricInput}
        setAiMetricInput={setAiMetricInput}
        isGenerating={isGeneratingAiProgram}
      />
    </div>
  );
};
