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
} from "lucide-react";
import { AvailableModel } from "@/app/api/models/route";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  runFtp: number;
  bikeFtp: number;
  onSave: (data: {
    athleteId: string;
    apiKey?: string;
    runFtp: number;
    bikeFtp: number;
    focus: string;
    geminiApiKey?: string;
    selectedModel?: string;
    customPrompt?: string;
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
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"intervals" | "ai">("intervals");

  // Credenciales & Perfil Intervals
  const [athleteId, setAthleteId] = useState(initialAthleteId || "i442091");
  const [apiKey, setApiKey] = useState("");
  const [runFtp, setRunFtp] = useState(initialRunFtp || 285);
  const [bikeFtp, setBikeFtp] = useState(initialBikeFtp || 260);
  const [focus, setFocus] = useState("BUILD");

  // Configuración de Inteligencia Artificial (Gemini)
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
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
      const savedKey = localStorage.getItem("sgea_api_key");
      const savedId = localStorage.getItem("sgea_athlete_id");
      const savedGeminiKey = localStorage.getItem("sgea_gemini_key");
      const savedModel = localStorage.getItem("sgea_gemini_model");
      const savedPrompt = localStorage.getItem("sgea_custom_prompt");

      if (savedKey) setApiKey(savedKey);
      if (savedId) setAthleteId(savedId);
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
      if (savedModel) setSelectedModel(savedModel);
      if (savedPrompt) setCustomPrompt(savedPrompt);

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

  if (!isOpen) return null;

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
      const keyToTest = geminiApiKey || "ENV_DEFAULT";
      const res = await fetch("/api/models?apiKey=" + encodeURIComponent(geminiApiKey));
      const data = await res.json();

      if (data.success) {
        setGeminiTestResult({
          success: true,
          message: `¡Google AI respondio correctamente! ${data.models?.length || 0} modelos detectados. Fuente: ${data.source}`,
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
      if (apiKey.trim()) localStorage.setItem("sgea_api_key", apiKey.trim());
      if (athleteId.trim()) localStorage.setItem("sgea_athlete_id", athleteId.trim());
      if (geminiApiKey.trim()) localStorage.setItem("sgea_gemini_key", geminiApiKey.trim());
      localStorage.setItem("sgea_gemini_model", selectedModel);
      localStorage.setItem("sgea_custom_prompt", customPrompt);

      await onSave({
        athleteId: athleteId.trim(),
        apiKey: apiKey.trim() || undefined,
        runFtp: Number(runFtp),
        bikeFtp: Number(bikeFtp),
        focus,
        geminiApiKey: geminiApiKey.trim() || undefined,
        selectedModel,
        customPrompt,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="card-gradient relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
          <h3 className="text-lg font-bold text-white">Panel de Configuración General</h3>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("intervals")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "intervals"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Perfil & Intervals.icu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "ai"
                ? "border-cyan-500 text-cyan-300"
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
              {/* Athlete ID */}
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
                <p className="mt-1 text-[11px] text-slate-400">
                  Disponible en tu perfil de Intervals.icu (ej. intervals.icu/athlete/i442091).
                </p>
              </div>

              {/* API Key */}
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

              {/* Potencias Stryd & FTP */}
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

          {/* TAB 2: AGENTE IA & GEMINI */}
          {activeTab === "ai" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Gemini API Key */}
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

              {/* Dynamic Model Selector */}
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
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash ★ (Recomendado - Bajo Costo & Rápido)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Razonamiento Profundo)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </>
                  )}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  El sistema consulta los modelos activos en vivo y usa una cascada de respaldo si hay límite de tasa.
                </p>
              </div>

              {/* Custom Prompt / Directrices del Head Coach */}
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
                  placeholder="Instrucciones específicas (ej: tengo sobrecarga en el gemelo, evitar pliometría; enfocar en maratón sub-3h...)"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Estas directrices se inyectan en el prompt para condicionar la periodización del agente de IA.
                </p>
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
