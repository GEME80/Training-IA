"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Footprints, Bike, HeartPulse, Moon, Activity, Check, Info, Radio, Key, HelpCircle } from "lucide-react";

interface AthleteEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    displayName?: string;
    email?: string;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    weightKg?: number;
    heightCm?: number;
    runFtp?: number;
    bikeFtp?: number;
    lthr?: number;
    restingHR?: number;
    maxHR?: number;
    intervalsAthleteId?: string;
    apiKey?: string;
  };
  onSave: (data: {
    displayName?: string;
    birthDate?: string;
    gender?: "M" | "F" | "OTHER";
    weightKg?: number;
    heightCm?: number;
    runFtp?: number;
    bikeFtp?: number;
    lthr?: number;
    restingHR?: number;
    maxHR?: number;
    intervalsAthleteId?: string;
    apiKey?: string;
  }) => Promise<void>;
}

export const AthleteEditProfileModal: React.FC<AthleteEditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState(initialData.displayName || "German Morales");
  const [email] = useState(initialData.email || "german.morales@pulseai.pro");
  const [birthDate, setBirthDate] = useState(initialData.birthDate || "");
  const [gender, setGender] = useState<"M" | "F" | "OTHER">(initialData.gender || "M");
  const [weightKg, setWeightKg] = useState<number>(initialData.weightKg || 84);
  const [heightCm, setHeightCm] = useState<number>(initialData.heightCm || 178);
  const [runFtp, setRunFtp] = useState<number>(initialData.runFtp || 327);
  const [bikeFtp, setBikeFtp] = useState<number>(initialData.bikeFtp || 240);
  const [lthr, setLthr] = useState<number>(initialData.lthr || 168);
  const [restingHR, setRestingHR] = useState<number>(initialData.restingHR || 45);
  const [maxHR, setMaxHR] = useState<number>(initialData.maxHR || 185);
  const [intervalsAthleteId, setIntervalsAthleteId] = useState<string>(initialData.intervalsAthleteId || "i442091");
  const [apiKey, setApiKey] = useState<string>(initialData.apiKey || "");
  const [showInfoLegend, setShowInfoLegend] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sincronizar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.displayName || "German Morales");
      setBirthDate(initialData.birthDate || "");
      setGender(initialData.gender || "M");
      setWeightKg(initialData.weightKg || 84);
      setHeightCm(initialData.heightCm || 178);
      setRunFtp(initialData.runFtp || 327);
      setBikeFtp(initialData.bikeFtp || 240);
      setLthr(initialData.lthr || 168);
      setRestingHR(initialData.restingHR || 45);
      setMaxHR(initialData.maxHR || 185);
      setIntervalsAthleteId(initialData.intervalsAthleteId || "i442091");
      setApiKey(initialData.apiKey || "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        displayName,
        birthDate,
        gender,
        weightKg,
        heightCm,
        runFtp,
        bikeFtp,
        lthr,
        restingHR,
        maxHR,
        intervalsAthleteId,
        apiKey,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fadeIn">
      {/* Click fuera para cerrar */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Editar Perfil Antropométrico & Umbrales
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Bloque 1: Datos Antropométricos */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              1. Identidad & Antropometría
            </span>

            {/* Nombre y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Correo Electrónico (Asociado)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Fecha Nacimiento y Género */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Género
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[
                    { id: "M", label: "Hombre" },
                    { id: "F", label: "Mujer" },
                    { id: "OTHER", label: "Otro" },
                  ].map((g) => {
                    const isSelected = gender === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id as "M" | "F" | "OTHER")}
                        className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/30"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Peso y Altura */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg || ""}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={heightCm || ""}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Umbrales de Potencia & Frecuencia Cardíaca */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                2. Umbrales Fisiológicos & Rendimiento
              </span>
              <button
                type="button"
                onClick={() => setShowInfoLegend(!showInfoLegend)}
                className="text-[10px] font-mono text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <HelpCircle className="h-3 w-3" />
                <span>{showInfoLegend ? "Ocultar Guía" : "¿Cómo obtener estos datos?"}</span>
              </button>
            </div>

            {/* Leyenda Informativa Colapsable */}
            {showInfoLegend && (
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300 animate-fadeIn">
                <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Guía para obtener tus umbrales exactos:</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc text-[10px] font-mono leading-relaxed text-slate-600 dark:text-slate-400">
                  <li><strong>Stryd CP (Carrera):</strong> Auto-calculada en la app de Stryd o tras un test de 3/9 min o 5K a tope.</li>
                  <li><strong>Ciclismo FTP:</strong> 95% de la potencia media en un test de 20 min o prueba de rampa en Zwift.</li>
                  <li><strong>FC Umbral (LTHR):</strong> FC media de los últimos 20 min de un test de 30 min en carrera/bici.</li>
                  <li><strong>FC Reposo & Máx:</strong> FC Reposo al despertar. FC Máx calculada por Tanaka: <code>208 - (0.7 × edad)</code>.</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Footprints className="h-3 w-3 text-amber-500" />
                  Stryd Critical Power (CP / Run)
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={runFtp || ""}
                    onChange={(e) => setRunFtp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Bike className="h-3 w-3 text-sky-500" />
                  Ciclismo FTP
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={bikeFtp || ""}
                    onChange={(e) => setBikeFtp(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">W</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <HeartPulse className="h-3 w-3 text-rose-500" />
                  FC Umbral (LTHR)
                </label>
                <input
                  type="number"
                  value={lthr || ""}
                  onChange={(e) => setLthr(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Moon className="h-3 w-3 text-indigo-500" />
                  FC Reposo
                </label>
                <input
                  type="number"
                  value={restingHR || ""}
                  onChange={(e) => setRestingHR(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  FC Máxima
                </label>
                <input
                  type="number"
                  value={maxHR || ""}
                  onChange={(e) => setMaxHR(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Credenciales Intervals.icu */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              3. Sincronización Intervals.icu
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Radio className="h-3 w-3 text-sky-500" />
                  Intervals Athlete ID
                </label>
                <input
                  type="text"
                  placeholder="Ej. i442091"
                  value={intervalsAthleteId}
                  onChange={(e) => setIntervalsAthleteId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Key className="h-3 w-3 text-amber-500" />
                  API Key Intervals.icu
                </label>
                <input
                  type="password"
                  placeholder="Pegar API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-sky-400" />
                  <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
