"use client";

import React from "react";
import { Key, Eye, EyeOff, ShieldCheck, ExternalLink } from "lucide-react";

interface OnboardingStepApiKeyProps {
  apiKey: string;
  setApiKey: (val: string) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
}

export const OnboardingStepApiKey: React.FC<OnboardingStepApiKeyProps> = ({
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center space-x-2">
        <div className="h-7 w-7 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
          2
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          ¿Dónde generar tu Clave API (API Key)?
        </h3>
      </div>

      {/* Leyenda Explicativa Paso a Paso */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Genera tu clave en la sección de Desarrollador:</span>
          <a
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 inline-flex items-center gap-1 font-bold"
          >
            <span>Ir a Ajustes de Intervals</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <span>
              En la página de <strong>Ajustes (Settings)</strong> de Intervals.icu, deslízate hacia abajo hasta el apartado <strong>Developer Settings (Ajustes de Desarrollador)</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <span>
              En el campo <strong>API Key</strong>, haz clic en el botón <strong>Generate API Key</strong> (o copia la clave existente de letras y números).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="h-5 w-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <span>
              Pégala en el campo seguro inferior.
            </span>
          </li>
        </ul>

        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Seguridad Garantizada:</strong> Tu clave se almacena encriptada con AES-256-GCM en Firestore y se utiliza exclusivamente para sincronizar tu telemetría biológica.
          </span>
        </div>
      </div>

      {/* Input de API Key */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Tu Clave API de Intervals.icu <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Key className="h-4 w-4" />
          </div>
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value.trim())}
            placeholder="Ejemplo: a1b2c3d4e5f6g7h8..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:bg-white dark:focus:bg-slate-900 focus:border-cyan-500 focus:outline-none transition shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
