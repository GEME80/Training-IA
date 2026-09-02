"use client";

import React, { useState } from "react";
import { X, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { OnboardingStepAthleteId } from "./onboarding/OnboardingStepAthleteId";
import { OnboardingStepApiKey } from "./onboarding/OnboardingStepApiKey";
import { OnboardingStepVerify, OnboardingTestResult } from "./onboarding/OnboardingStepVerify";

interface IntervalsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAthleteId?: string;
  onSuccess: (data: {
    athleteId: string;
    apiKey: string;
    athleteName?: string;
    runFtp?: number;
    bikeFtp?: number;
  }) => void;
}

export const IntervalsOnboardingModal: React.FC<IntervalsOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialAthleteId = "",
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [athleteId, setAthleteId] = useState<string>(initialAthleteId);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<OnboardingTestResult | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!athleteId.trim() || !apiKey.trim()) {
      setTestResult({
        success: false,
        message: "Por favor completa el Athlete ID y la Clave API antes de verificar.",
      });
      return;
    }

    setIsValidating(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: athleteId.trim(),
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const detectedName = data.athleteName || data.athlete?.name || "Atleta";
        const detectedRunFtp = data.runFtp || data.athlete?.icu_running_ftp || data.athlete?.run_ftp;
        const detectedBikeFtp = data.bikeFtp || data.athlete?.icu_ftp || data.athlete?.bike_ftp;

        setTestResult({
          success: true,
          message: `¡Conexión exitosa! Hola, ${detectedName}. Tu telemetría biológica ha sido sincronizada.`,
          athleteName: detectedName,
          athleteId: data.athleteId || athleteId.trim(),
          city: data.city || data.athlete?.city,
          runFtp: detectedRunFtp,
          bikeFtp: detectedBikeFtp,
          restingHR: data.restingHR || data.athlete?.icu_resting_hr,
          weight: data.weight || data.athlete?.weight || data.athlete?.icu_weight,
        });

        onSuccess({
          athleteId: athleteId.trim(),
          apiKey: apiKey.trim(),
          athleteName: detectedName,
          runFtp: detectedRunFtp,
          bikeFtp: detectedBikeFtp,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || `Error al conectar con Intervals.icu (Código ${res.status}).`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de red";
      setTestResult({
        success: false,
        message: `No se pudo contactar con el servidor: ${msg}`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header con Indicador de Progreso */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Bienvenido a PULSE AI PRO
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Configura tu conexión con Intervals.icu en 3 simples pasos
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stepper Visual */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div
              onClick={() => setCurrentStep(1)}
              className={`cursor-pointer pb-2 border-b-2 transition flex items-center gap-2 ${
                currentStep === 1
                  ? "border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300 font-bold"
                  : athleteId.trim()
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 1 ? "bg-cyan-600 dark:bg-cyan-500 text-white" : athleteId.trim() ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                1
              </span>
              <span className="text-xs hidden sm:inline">Athlete ID</span>
            </div>

            <div
              onClick={() => athleteId.trim() && setCurrentStep(2)}
              className={`cursor-pointer pb-2 border-b-2 transition flex items-center gap-2 ${
                currentStep === 2
                  ? "border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300 font-bold"
                  : apiKey.trim()
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 2 ? "bg-cyan-600 dark:bg-cyan-500 text-white" : apiKey.trim() ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                2
              </span>
              <span className="text-xs hidden sm:inline">Clave API</span>
            </div>

            <div
              onClick={() => athleteId.trim() && apiKey.trim() && setCurrentStep(3)}
              className={`cursor-pointer pb-2 border-b-2 transition flex items-center gap-2 ${
                currentStep === 3
                  ? "border-cyan-600 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300 font-bold"
                  : testResult?.success
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "border-slate-200 dark:border-slate-800 text-slate-400"
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 3 ? "bg-cyan-600 dark:bg-cyan-500 text-white" : testResult?.success ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                3
              </span>
              <span className="text-xs hidden sm:inline">Verificar</span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Paso */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {currentStep === 1 && (
            <OnboardingStepAthleteId athleteId={athleteId} setAthleteId={setAthleteId} />
          )}

          {currentStep === 2 && (
            <OnboardingStepApiKey
              apiKey={apiKey}
              setApiKey={setApiKey}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
            />
          )}

          {currentStep === 3 && (
            <OnboardingStepVerify
              athleteId={athleteId}
              apiKey={apiKey}
              isValidating={isValidating}
              testResult={testResult}
              onVerify={handleTestConnection}
            />
          )}
        </div>

        {/* Footer de Navegación */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Configurar más tarde
              </button>
            )}
          </div>

          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && athleteId.trim()) setCurrentStep(2);
                  if (currentStep === 2 && apiKey.trim()) setCurrentStep(3);
                }}
                disabled={currentStep === 1 ? !athleteId.trim() : !apiKey.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>Siguiente</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={!testResult?.success}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold transition shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <span>Comenzar a Entrenar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
