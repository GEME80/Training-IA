"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Shield,
  Zap,
  Check,
  AlertCircle,
  RefreshCw,
  Bot,
  Sliders,
  Sparkles,
  RotateCcw,
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Footprints,
  Bike,
  Dumbbell,
  Moon,
} from "lucide-react";
import { AvailableModel } from "@/app/api/models/route";
import { TargetRace } from "@/lib/physiology/macrocycle";
import {
  WeeklyAvailabilityMap,
  DisciplineType,
  DEFAULT_WEEKLY_AVAILABILITY,
} from "@/lib/gemini/engine";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  runFtp: number;
  bikeFtp: number;
  initialTab?: "intervals" | "availability" | "races" | "ai";
  onSave: (data: {
    athleteId: string;
    apiKey?: string;
    runFtp: number;
    bikeFtp: number;
    focus: string;
    geminiApiKey?: string;
    selectedModel?: string;
    customPrompt?: string;
    targetRaces?: TargetRace[];
    weeklyAvailability?: WeeklyAvailabilityMap;
  }) => Promise<void>;
}

const DEFAULT_PROMPT = `Actúa como un Head Coach Fisiológico Digital experto en entrenamiento de resistencia y potencia Stryd.
- Prioriza adaptaciones biológicas protegiendo la variabilidad cardíaca (HRV) y evitando sobreentrenamiento.
- Modula sesiones de calidad si detectas fatiga aguda (TSB < -20 o HRV Z-score negativo).
- Asegura progresión aeróbica y estímulos neuromusculares en sóleo y tendón de Aquiles.`;

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  athleteId: initialAthleteId,
  runFtp: initialRunFtp,
  bikeFtp: initialBikeFtp,
  initialTab = "intervals",
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"intervals" | "availability" | "races" | "ai">(initialTab);

  // Credenciales & Perfil Intervals
  const [athleteId, setAthleteId] = useState(initialAthleteId || "i442091");
  const [apiKey, setApiKey] = useState("");
  const [runFtp, setRunFtp] = useState(initialRunFtp || 285);
  const [bikeFtp, setBikeFtp] = useState(initialBikeFtp || 260);
  const [focus, setFocus] = useState("BUILD");

  // Matriz Semanal de Disponibilidad & Disciplinas
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityMap>(DEFAULT_WEEKLY_AVAILABILITY);

  // Carreras Objetivo & Macrociclos
  const [races, setRaces] = useState<TargetRace[]>([]);
  const [newRaceName, setNewRaceName] = useState("");
  const [newRaceDate, setNewRaceDate] = useState("");
  const [newRaceDistance, setNewRaceDistance] = useState<TargetRace["distance"]>("42k");
  const [newRacePriority, setNewRacePriority] = useState<TargetRace["priority"]>("A");
  const [newRaceGoal, setNewRaceGoal] = useState("");

  // Configuración de Inteligencia Artificial (Gemini)
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-flash-latest");
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Estados de prueba de conexión
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Carga inicial de preferencias desde localStorage
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const savedKey = localStorage.getItem("sgea_intervals_api_key") || localStorage.getItem("sgea_api_key") || "";
      const savedId = localStorage.getItem("sgea_athlete_id") || "i442091";
      const savedGeminiKey = localStorage.getItem("sgea_gemini_api_key") || localStorage.getItem("sgea_gemini_key") || "";
      const savedModel = localStorage.getItem("sgea_selected_model") || localStorage.getItem("sgea_gemini_model") || "gemini-flash-latest";
      const savedPrompt = localStorage.getItem("sgea_custom_prompt") || DEFAULT_PROMPT;
      const savedRaces = localStorage.getItem("sgea_target_races");
      const savedAvailability = localStorage.getItem("sgea_weekly_availability");

      if (savedKey) setApiKey(savedKey);
      if (savedId) setAthleteId(savedId);
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
      if (savedModel) setSelectedModel(savedModel);
      if (savedPrompt) setCustomPrompt(savedPrompt);

      if (savedRaces) {
        try {
          setRaces(JSON.parse(savedRaces));
        } catch {
          // Keep default
        }
      }

      if (savedAvailability) {
        try {
          setWeeklyAvailability(JSON.parse(savedAvailability));
        } catch {
          // Keep default
        }
      }

      setTestResult(null);
      setGeminiTestResult(null);
      fetchModels(savedGeminiKey || "");
    }
  }, [isOpen]);

  const fetchModels = async (keyToUse?: string) => {
    setIsLoadingModels(true);
    try {
      const url = keyToUse
        ? `/api/models?apiKey=${encodeURIComponent(keyToUse)}`
        : "/api/models";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.models) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.warn("Error al cargar modelos:", err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleDayDisciplineChange = (day: string, discipline: DisciplineType) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: discipline,
    }));
  };

  if (!isOpen) return null;

  const handleAddRace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaceName || !newRaceDate) return;

    const newRace: TargetRace = {
      id: "race_" + Date.now(),
      name: newRaceName.trim(),
      date: newRaceDate,
      distance: newRaceDistance,
      priority: newRacePriority,
      goalTarget: newRaceGoal.trim() || undefined,
    };

    const updated = [...races, newRace].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setRaces(updated);
    localStorage.setItem("sgea_target_races", JSON.stringify(updated));

    setNewRaceName("");
    setNewRaceDate("");
    setNewRaceGoal("");
  };

  const handleDeleteRace = (id: string) => {
    const updated = races.filter((r) => r.id !== id);
    setRaces(updated);
    localStorage.setItem("sgea_target_races", JSON.stringify(updated));
  };

  const handleTestConnection = async () => {
    if (!athleteId || !apiKey) {
      setTestResult({
        success: false,
        message: "Ingresa tanto el Athlete ID como la API Key de Intervals.",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, apiKey }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: `¡Conexión exitosa! Atleta: ${data.athleteName}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "No se pudo autenticar con Intervals.icu.",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Error de red al conectar con el servidor.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);

    try {
      const res = await fetch("/api/models?apiKey=" + encodeURIComponent(geminiApiKey));
      const data = await res.json();

      if (data.success) {
        setGeminiTestResult({
          success: true,
          message: `¡Google AI respondió correctamente! ${data.models?.length || 0} modelos detectados. Fuente: ${data.source}`,
        });
        if (data.models) setAvailableModels(data.models);
      } else {
        setGeminiTestResult({
          success: false,
          message: data.error || "No se pudo conectar con la API de Google Gemini.",
        });
      }
    } catch {
      setGeminiTestResult({
        success: false,
        message: "Error de red al conectar con Google AI.",
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (apiKey.trim()) {
        localStorage.setItem("sgea_intervals_api_key", apiKey.trim());
        localStorage.setItem("sgea_api_key", apiKey.trim());
      }
      if (athleteId.trim()) localStorage.setItem("sgea_athlete_id", athleteId.trim());
      if (geminiApiKey.trim()) {
        localStorage.setItem("sgea_gemini_api_key", geminiApiKey.trim());
        localStorage.setItem("sgea_gemini_key", geminiApiKey.trim());
      }
      localStorage.setItem("sgea_selected_model", selectedModel);
      localStorage.setItem("sgea_gemini_model", selectedModel);
      localStorage.setItem("sgea_custom_prompt", customPrompt);
      localStorage.setItem("sgea_target_races", JSON.stringify(races));
      localStorage.setItem("sgea_weekly_availability", JSON.stringify(weeklyAvailability));

      await onSave({
        athleteId: athleteId.trim(),
        apiKey: apiKey.trim() || undefined,
        runFtp: Number(runFtp),
        bikeFtp: Number(bikeFtp),
        focus,
        geminiApiKey: geminiApiKey.trim() || undefined,
        selectedModel,
        customPrompt,
        targetRaces: races,
        weeklyAvailability,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getDisciplineIcon = (disc: DisciplineType) => {
    switch (disc) {
      case "Carrera":
        return <Footprints className="h-4 w-4 text-emerald-400" />;
      case "Ciclismo":
        return <Bike className="h-4 w-4 text-cyan-400" />;
      case "Fuerza":
        return <Dumbbell className="h-4 w-4 text-purple-400" />;
      default:
        return <Moon className="h-4 w-4 text-slate-400" />;
    }
  };

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="card-gradient relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
          <Shield className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Panel de Configuración del Atleta</h3>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("intervals")}
            className={`flex items-center space-x-2 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === "intervals"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Perfil & Intervals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("availability")}
            className={`flex items-center space-x-2 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === "availability"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>📅 Matriz Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("races")}
            className={`flex items-center space-x-2 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === "races"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>🎯 Carreras ({races.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2 border-b-2 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === "ai"
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Agente IA & Gemini</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* TAB 1: PERFIL & INTERVALS */}
          {activeTab === "intervals" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Intervals Athlete ID
                </label>
                <input
                  type="text"
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  placeholder="i442091"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Intervals API Key (Cifrada con AES-256-GCM)
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Pegar API Key de Intervals..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex shrink-0 items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> : <Zap className="h-4 w-4 text-emerald-400" />}
                    <span>Probar</span>
                  </button>
                </div>
                {testResult && (
                  <div
                    className={`mt-2 flex items-center space-x-2 rounded-xl p-2.5 text-xs ${
                      testResult.success
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {testResult.success ? <Check className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Stryd Run FTP / CP (W)
                  </label>
                  <input
                    type="number"
                    value={runFtp}
                    onChange={(e) => setRunFtp(Number(e.target.value))}
                    min="100"
                    max="600"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Bike FTP (W)
                  </label>
                  <input
                    type="number"
                    value={bikeFtp}
                    onChange={(e) => setBikeFtp(Number(e.target.value))}
                    min="100"
                    max="600"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-mono text-cyan-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATRIZ SEMANAL DE DISPONIBILIDAD */}
          {activeTab === "availability" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Estructura Semanal de Disciplinas & Descanso
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Define qué disciplina deseas realizar cada día de la semana. El agente de IA tomará esta matriz como base obligatoria para generar y modular tus entrenamientos.
                </p>
              </div>

              <div className="space-y-2">
                {daysOfWeek.map((day) => {
                  const currentDisc = weeklyAvailability[day] || "Carrera";
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                          {getDisciplineIcon(currentDisc)}
                        </div>
                        <span className="text-xs font-bold text-white">{day}</span>
                      </div>

                      <select
                        value={currentDisc}
                        onChange={(e) => handleDayDisciplineChange(day, e.target.value as DisciplineType)}
                        className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Descanso">💤 Descanso Total</option>
                        <option value="Carrera">🏃 Carrera (Stryd Power)</option>
                        <option value="Ciclismo">🚴 Ciclismo (FTP)</option>
                        <option value="Fuerza">🏋️ Fuerza / Sóleo</option>
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setWeeklyAvailability(DEFAULT_WEEKLY_AVAILABILITY)}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restablecer Matriz por Defecto</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CARRERAS OBJETIVO & MACROCICLOS */}
          {activeTab === "races" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Nueva Carrera Objetivo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300">Nombre de la Carrera</label>
                    <input
                      type="text"
                      value={newRaceName}
                      onChange={(e) => setNewRaceName(e.target.value)}
                      placeholder="ej. Maratón de Valencia"
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300">Fecha del Evento</label>
                    <input
                      type="date"
                      value={newRaceDate}
                      onChange={(e) => setNewRaceDate(e.target.value)}
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300">Distancia / Disciplina</label>
                    <select
                      value={newRaceDistance}
                      onChange={(e) => setNewRaceDistance(e.target.value as any)}
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="42k">Maratón (42.195 km)</option>
                      <option value="21k">Media Maratón (21.097 km)</option>
                      <option value="10k">10K Ruta</option>
                      <option value="5k">5K Ruta / Pista</option>
                      <option value="cycling_fondo">Gran Fondo Ciclismo</option>
                      <option value="triathlon_703">Triatlón 70.3</option>
                      <option value="triathlon_1406">Triatlón 140.6</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300">Prioridad</label>
                    <select
                      value={newRacePriority}
                      onChange={(e) => setNewRacePriority(e.target.value as any)}
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="A">🥇 Prioridad A (Objetivo Principal - Rige Macrociclo)</option>
                      <option value="B">🥈 Prioridad B (Test de Puesta a Punto)</option>
                      <option value="C">🥉 Prioridad C (Entrenamiento con Dorsal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300">Meta / Tiempo Objetivo (Opcional)</label>
                  <input
                    type="text"
                    value={newRaceGoal}
                    onChange={(e) => setNewRaceGoal(e.target.value)}
                    placeholder="ej. Sub 3h00m @ 275W Stryd"
                    className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddRace}
                  disabled={!newRaceName || !newRaceDate}
                  className="w-full rounded-lg bg-amber-500/20 py-2 text-xs font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 transition"
                >
                  + Agregar Carrera al Calendario
                </button>
              </div>

              {/* List of Registered Races */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Carreras Programadas ({races.length})
                </label>
                {races.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tienes carreras registradas. Agrega una para calcular macrociclos.</p>
                ) : (
                  races.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              r.priority === "A"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : r.priority === "B"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            Prioridad {r.priority}
                          </span>
                          <strong className="text-white">{r.name}</strong>
                          <span className="text-slate-400">({r.distance.toUpperCase()})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          📅 {r.date} {r.goalTarget && `• Meta: ${r.goalTarget}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRace(r.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-950 hover:text-red-300 transition"
                        title="Eliminar carrera"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AGENTE IA & GEMINI */}
          {activeTab === "ai" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Google Gemini / Vertex API Key
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">projects/604253242289</span>
                </div>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AQ.Ab8RN... (o configurada en .env.local)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={testingGemini}
                    className="flex shrink-0 items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                  >
                    {testingGemini ? <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" /> : <Sparkles className="h-4 w-4 text-cyan-400" />}
                    <span>Test IA</span>
                  </button>
                </div>
                {geminiTestResult && (
                  <div
                    className={`mt-2 flex items-center space-x-2 rounded-xl p-2.5 text-xs ${
                      geminiTestResult.success
                        ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                        : "border border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {geminiTestResult.success ? <Check className="h-4 w-4 shrink-0 text-cyan-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
                    <span>{geminiTestResult.message}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Modelo de Inferencia (Descubrimiento Dinámico)
                  </label>
                  {isLoadingModels && <span className="text-[10px] text-slate-400">Consultando Google AI...</span>}
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} {m.isRecommended ? "★ (Recomendado - Bajo Costo)" : `[${m.tier.toUpperCase()}]`}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="gemini-flash-latest">Gemini Flash (Última Generación) ★ (Recomendado)</option>
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      <option value="gemini-flash-lite-latest">Gemini Flash Lite</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Directrices de Entrenamiento / Prompt Personalizado
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomPrompt(DEFAULT_PROMPT)}
                    className="flex items-center space-x-1 text-[10px] font-semibold text-amber-300 hover:text-amber-200"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restablecer</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Instrucciones específicas (ej: sobrecarga sóleo, evitar pliometría; enfocar en maratón sub-3h...)"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-50 transition"
            >
              {saving ? "Guardando..." : "Guardar & Aplicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
