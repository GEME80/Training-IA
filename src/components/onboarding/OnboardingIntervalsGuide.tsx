"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Watch,
  Key,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Shield,
  Smartphone,
} from "lucide-react";

interface OnboardingIntervalsGuideProps {
  onCompleteGuide: () => void;
  onBackToSelector?: () => void;
}

export const OnboardingIntervalsGuide: React.FC<OnboardingIntervalsGuideProps> = ({
  onCompleteGuide,
  onBackToSelector,
}) => {
  const [guideStep, setGuideStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Encabezado del Asistente */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          {onBackToSelector && (
            <button
              type="button"
              onClick={onBackToSelector}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1 cursor-pointer"
              title="Volver"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            Guía Paso a Paso
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 font-medium">Paso {guideStep} de 3</span>
        </div>

        {/* Pestañas de Navegación Rápida */}
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setGuideStep(step as 1 | 2 | 3)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                guideStep === step
                  ? "w-6 bg-cyan-600 dark:bg-cyan-400"
                  : guideStep > step
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CONTENIDO DEL PASO 1: Registro Gratuito */}
      {guideStep === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Paso 1: Crea tu cuenta gratuita en Intervals.icu
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Intervals.icu es una de las plataformas de ciencia del deporte más avanzadas del mundo. Es 100% gratuita para atletas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cómo registrarte en 30 segundos:
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Abre <strong>intervals.icu</strong> en tu navegador web.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Haz clic en <strong>Sign Up (Registrarse)</strong> y selecciona <strong>Continuar con Google</strong> o <strong>Strava</strong> (1 solo clic).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Acepta los términos básicos de uso. No te solicitarán tarjeta de crédito ni cobros.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="https://intervals.icu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Abrir Intervals.icu en una nueva pestaña</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL PASO 2: Vincular Reloj / Dispositivo */}
      {guideStep === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Watch className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Paso 2: Conecta tu reloj o aplicación deportiva
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Esto permite que tus entrenamientos se sincronicen solos y que tu plan de la IA se envíe a tu reloj.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              En tu cuenta de Intervals.icu:
            </div>
            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside">
              <li>
                Ve al menú <strong>Ajustes (Settings)</strong> en la barra lateral izquierda.
              </li>
              <li>
                Desliza la página hacia abajo hasta la sección <strong>Conexiones (Connections)</strong>.
              </li>
              <li>
                Haz clic en <strong>Connect</strong> en tu marca de reloj favorita:
              </li>
            </ol>

            {/* Grid de Dispositivos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-white block">Garmin Connect</span>
                <span className="text-[10px] text-slate-400">Sincronización total</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-white block">Coros</span>
                <span className="text-[10px] text-slate-400">Planes y actividades</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-white block">Polar / Suunto / Wahoo</span>
                <span className="text-[10px] text-slate-400">Conexión directa</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-white block">Strava</span>
                <span className="text-[10px] text-slate-400">Importar historial</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 col-span-2 sm:col-span-2">
                <span className="font-bold text-slate-800 dark:text-white block">Apple Watch</span>
                <span className="text-[10px] text-slate-400">Vía la app HealthFit o Strava</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL PASO 3: Athlete ID y Clave API */}
      {guideStep === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Paso 3: Obtener tu Athlete ID y Clave API
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Estos son los identificadores seguros con los que PULSE AI PRO se comunica con tu perfil.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  1. Tu Athlete ID
                </span>
                <span>
                  En <strong>Ajustes (Settings)</strong>, baja hasta la <strong>parte inferior derecha</strong>.
                  Verás tu ID (por ejemplo: <code className="font-mono font-bold text-cyan-600 dark:text-cyan-400">i123456</code>).
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  2. Tu Clave API
                </span>
                <span>
                  Justo debajo de tu Athlete ID, haz clic en el botón <strong>"New API Key"</strong>. Se generará un código alfanumérico. Cópialo de inmediato.
                </span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="https://intervals.icu/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <span>Ir directamente a Ajustes de Intervals.icu</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botones de Navegación del Asistente */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        {guideStep > 1 ? (
          <button
            type="button"
            onClick={() => setGuideStep((guideStep - 1) as 1 | 2 | 3)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Paso anterior</span>
          </button>
        ) : (
          <div />
        )}

        {guideStep < 3 ? (
          <button
            type="button"
            onClick={() => setGuideStep((guideStep + 1) as 1 | 2 | 3)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm cursor-pointer ml-auto"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCompleteGuide}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer ml-auto"
          >
            <span>¡Listo! Ingresar mis datos</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
