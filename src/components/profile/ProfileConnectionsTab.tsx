"use client";

import React, { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Bot,
  ExternalLink,
} from "lucide-react";
import { GeminiModelDto } from "@/app/api/gemini/models/route";

interface ProfileConnectionsTabProps {
  athleteId: string;
  setAthleteId: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  coachProfile: string;
  setCoachProfile: (v: string) => void;
  testingConnection: boolean;
  onTestConnection: () => void;
  availableModels: GeminiModelDto[];
  loadingModels: boolean;
  onRefreshModels: () => void;
}

export const ProfileConnectionsTab: React.FC<ProfileConnectionsTabProps> = ({
  athleteId,
  setAthleteId,
  apiKey,
  setApiKey,
  geminiApiKey,
  setGeminiApiKey,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  coachProfile,
  setCoachProfile,
  testingConnection,
  onTestConnection,
  availableModels,
  loadingModels,
  onRefreshModels,
}) => {
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Bloque Intervals.icu */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              Intervals.icu
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              apiKey
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{apiKey ? "● Conectado" : "● No Vinculado"}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Athlete ID (ej. i123456)
            </label>
            <input
              type="text"
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              placeholder="Ej. i123456"
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              API Key Privada
            </label>
            <div className="relative mt-1">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Tu API Key de Intervals.icu..."
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 pr-9 text-xs font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Obtener credenciales en Intervals.icu</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={onTestConnection}
            disabled={testingConnection || !athleteId || !apiKey}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${testingConnection ? "animate-spin" : ""}`} />
            <span>{testingConnection ? "Verificando..." : "Probar Conexión"}</span>
          </button>
        </div>
      </div>

      {/* Bloque Google Gemini AI */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
              Google Gemini AI (Head Coach & Inferencia)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
            {geminiApiKey ? "● Clave Personalizada" : "● Clave Global de Servidor"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              API Key Personal de Gemini (Opcional)
            </label>
            <div className="relative mt-1">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Dejar en blanco para usar la del servidor)"
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 pr-9 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showGeminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Modelo de IA
              </label>
              <button
                type="button"
                onClick={onRefreshModels}
                disabled={loadingModels}
                className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${loadingModels ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </button>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {availableModels.length > 0 ? (
                availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    🟢 {m.id} {m.isRecommended ? "★ (Recomendado)" : ""} — [{m.category}]
                  </option>
                ))
              ) : (
                <>
                  <option value="gemini-2.5-flash">🟢 gemini-2.5-flash (Recomendado)</option>
                  <option value="gemini-2.0-flash">🟢 gemini-2.0-flash</option>
                  <option value="gemini-1.5-pro">🟢 gemini-1.5-pro</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Estilo del Entrenador
            </label>
            <select
              value={coachProfile}
              onChange={(e) => setCoachProfile(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="olympic">🏆 Fisiólogo Olímpico (Riguroso, Zonas Precisas y Stryd)</option>
              <option value="conservative">🛡️ Conservador (Prioriza Prevención de Lesiones)</option>
              <option value="aggressive">⚡ Rendimiento Agresivo (Alta Densidad y Carga)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Temperatura: <span className="font-mono text-cyan-600 font-bold">{temperature.toFixed(1)}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {temperature === 0 ? "Determinista" : temperature <= 0.3 ? "Estructurado" : "Creativo"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none mt-2.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
