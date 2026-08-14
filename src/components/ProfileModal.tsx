"use client";

import React, { useState } from "react";
import { X, Key, Shield, Zap, Check, AlertCircle, RefreshCw } from "lucide-react";

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
  }) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  athleteId: initialAthleteId,
  runFtp: initialRunFtp,
  bikeFtp: initialBikeFtp,
  onSave,
}) => {
  const [athleteId, setAthleteId] = useState(initialAthleteId || "i442091");
  const [apiKey, setApiKey] = useState("");
  const [runFtp, setRunFtp] = useState(initialRunFtp || 280);
  const [bikeFtp, setBikeFtp] = useState(initialBikeFtp || 250);
  const [focus, setFocus] = useState("BUILD");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!athleteId || !apiKey) {
      setTestResult({
        success: false,
        message: "Por favor ingresa tanto el Athlete ID como la API Key para probar la conexión.",
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
          message: `¡Conexión exitosa! Atleta detectado: ${data.athleteName}`,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        athleteId,
        apiKey: apiKey.trim() || undefined,
        runFtp: Number(runFtp),
        bikeFtp: Number(bikeFtp),
        focus,
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
      <div className="card-gradient relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
          <Shield className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Configuración del Atleta</h3>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
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
              Disponible en la URL de tu perfil de Intervals.icu (ej. intervals.icu/athlete/i442091).
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
                placeholder="Pegar nueva API Key..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center space-x-1.5 whitespace-nowrap rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500/20 disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Key className="h-3.5 w-3.5" />
                )}
                <span>Probar</span>
              </button>
            </div>
            {testResult && (
              <div
                className={`mt-2 flex items-center space-x-2 rounded-lg p-2.5 text-xs font-medium ${
                  testResult.success
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-300 border border-red-500/30"
                }`}
              >
                {testResult.success ? (
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Thresholds: Stryd CP and Bike FTP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Stryd CP (Run FTP)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  value={runFtp}
                  onChange={(e) => setRunFtp(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">W</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Bike FTP
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  value={bikeFtp}
                  onChange={(e) => setBikeFtp(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">W</span>
              </div>
            </div>
          </div>

          {/* Training Focus */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Enfoque de Periodización
            </label>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="BUILD">Fase de Construcción (Sobrecarga progresiva Stryd)</option>
              <option value="MAINTENANCE">Mantenimiento y Longevidad</option>
              <option value="MARATHON">Específico de Maratón (Economía de carrera)</option>
              <option value="TRIATHLON">Periodización Concurrente Triatlón</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 text-black" />
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
