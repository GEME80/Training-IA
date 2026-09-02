"use client";

import React, { useState } from "react";
import { PulseLogo } from "./PulseLogo";
import { SportCanvasBackground } from "./SportCanvasBackground";
import {
  Sparkles,
  Zap,
  Activity,
  TrendingUp,
  Award,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Calendar,
  Layers,
  HeartPulse,
  Flame,
  Globe,
  Radio,
  BarChart3,
  Bot,
  ExternalLink,
  X,
  Gauge,
  CheckCircle,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LandingHomeProps {
  onLoginWithGoogle: () => void;
  onGoToDashboard?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
  onLoginWithGoogle,
  onGoToDashboard,
  isAuthenticated = false,
  userEmail,
  userName,
}) => {
  const { error, clearError, user, loginAsMasterAdminDemo } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const isConfigError = error === "FIREBASE_AUTH_NOT_CONFIGURED";
  const isUserAuthenticated = isAuthenticated || !!user;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* 1. Fondo Canvas Interactivo Luminoso (fixed en z-0) */}
      <SportCanvasBackground />

      {/* Contenido en capa z-10 */}
      <div className="relative z-10 flex flex-col min-h-screen">

      {/* Modal Informativo si Firebase Auth requiere activación en consola */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full rounded-2xl bg-white border border-cyan-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left relative">
            <button
              type="button"
              onClick={clearError}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isConfigError ? "Activar Google Sign-In en Firebase Console" : "Aviso de Autenticación"}
                </h3>
                <span className="text-[11px] font-mono text-cyan-600">Proyecto: training-ia-8f67f</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-y border-slate-100 py-4">
              {isConfigError ? (
                <>
                  <p>
                    Google Sign-In debe habilitarse en la consola de Firebase del proyecto:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700">
                    <li>
                      Ingresa en <strong>Authentication &gt; Sign-in method</strong>.
                    </li>
                    <li>
                      Haz clic en <strong>Google</strong>, activa el interruptor de <strong>Habilitar</strong> y guarda.
                    </li>
                  </ol>
                </>
              ) : (
                <p>{error}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  loginAsMasterAdminDemo();
                  clearError();
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md cursor-pointer hover:brightness-105"
              >
                <span>🚀 Entrar como Germán Morales</span>
              </button>
              <a
                href="https://console.firebase.google.com/project/training-ia-8f67f/authentication/providers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition cursor-pointer"
              >
                <span>Abrir Firebase Console</span>
                <ExternalLink className="h-3.5 w-3.5 text-cyan-600" />
              </a>
              <button
                type="button"
                onClick={clearError}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION OPTIMIZADO CON ESPACIO DE RESPIRACIÓN */}
      <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Ticker de Telemetría Dinámica Superior */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-cyan-200 text-xs font-mono text-cyan-900 shadow-sm mb-8 animate-pulse backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>⚡ 332W Stryd CP</span>
          <span>•</span>
          <span>📈 84 CTL Fitness</span>
          <span>•</span>
          <span>🔋 +12 TSB Forma</span>
          <span>•</span>
          <span>📐 +4.5 Ramp Rate</span>
        </div>

        {/* Titular Principal de Alto Impacto */}
        <h1 className="text-slate-950 font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-5xl mx-auto leading-[1.12]">
          El Primer <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Head Coach Fisiológico Autónomo</span> para Atletas de Resistencia
        </h1>

        {/* Subtítulo Neutral Elegante */}
        <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Entrena con precisión científica. Un ecosistema inteligente que calcula tu fatiga en tiempo real, prescribe potencia exacta y reajusta cada sesión automáticamente con <strong className="text-slate-900 font-semibold">Google Gemini AI</strong>.
        </p>

        {/* CTA Principal Estandarizado */}
        <div className="mt-10 flex items-center justify-center">
          {isUserAuthenticated ? (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 text-white" />
              <span>📊 Ir a mi Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoginWithGoogle}
              className="flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>✨ Iniciar con Google</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Insignias de Confianza Deportiva */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>⚡ Potencia Stryd & FTP</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>📈 Modelo Banister PMC</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-xl">
            <RefreshCw className="h-3.5 w-3.5 text-cyan-600" />
            <span>🔄 Sincronización Automática</span>
          </div>
        </div>
      </section>

      {/* 3. SIMULADOR DEL MASTER CONTROL HUB */}
      <section id="pmc" className="px-4 sm:px-6 max-w-6xl mx-auto -mt-4 mb-24 w-full">
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/40 space-y-6 backdrop-blur-xl">
          {/* Cabecera del Hub */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-700 ml-2 font-bold">PULSE AI Master Control Hub</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              ● Telemetría en Vivo Sincronizada
            </span>
          </div>

          {/* Grid de 6 Tarjetas Fisiológicas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-center">
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">📈 Fitness CTL</div>
              <div className="text-xl font-black text-emerald-600 mt-1">84.2</div>
              <div className="text-[10px] text-slate-400 font-sans">Base Crónica</div>
            </div>
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">⚡ Fatigue ATL</div>
              <div className="text-xl font-black text-amber-600 mt-1">72.0</div>
              <div className="text-[10px] text-slate-400 font-sans">Carga 7 Días</div>
            </div>
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">🔋 Form TSB</div>
              <div className="text-xl font-black text-cyan-600 mt-1">+12.2</div>
              <div className="text-[10px] text-emerald-600 font-sans font-bold">🟢 Óptimo</div>
            </div>
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">📐 Ramp Rate</div>
              <div className="text-xl font-black text-teal-600 mt-1">+4.8</div>
              <div className="text-[10px] text-slate-400 font-sans">pts / sem</div>
            </div>
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">👟 Stryd CP</div>
              <div className="text-xl font-black text-amber-600 mt-1">332 W</div>
              <div className="text-[10px] text-slate-400 font-sans">3.95 W/kg</div>
            </div>
            <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">🚴 Bike FTP</div>
              <div className="text-xl font-black text-cyan-600 mt-1">260 W</div>
              <div className="text-[10px] text-slate-400 font-sans">Rodillo / Pot.</div>
            </div>
          </div>

          {/* Banner de Dictamen del Head Coach */}
          <div className="rounded-xl p-4 bg-gradient-to-r from-cyan-50/80 via-white to-emerald-50/80 border border-cyan-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 text-lg border border-cyan-200">
                🤖
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Head Coach AI Dictamen</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono font-bold">Gemini 2.5 Flash</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 font-normal">
                  "TSB en +12 con HRV balanceado. Asimilación biológica óptima para ejecutar la tirada con bloques de ritmo maratón a 80-84% CP."
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-cyan-200 text-xs font-mono font-bold text-cyan-800 shrink-0 shadow-xs">
              Semana 11 • Pico Maratón
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOS 3 PILARES COMERCIALES CON DISEÑO MINIMALISTA Y ESCANEABLE */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-600">
            Propuesta de Valor
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Ingeniería Fisiológica de Alta Conversión
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Tres pilares fundamentales diseñados para eliminar la incertidumbre y maximizar tu rendimiento el día de la carrera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Motor Fisiológico Banister & Periodización Inteligente */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between backdrop-blur-xl hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                📈
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-700 uppercase tracking-wider">
                Pilar 01 • Periodización Inteligente
              </span>
              <h3 className="text-lg font-bold text-slate-950 leading-snug">
                Tu Fisiología manda, tu entrenamiento se adapta solo.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Cálculo automático de fatiga y frescura (CTL/ATL/TSB) y macrociclos progresivos que ajustan los microciclos día a día según tu respuesta biológica real para llegar a tu carrera en el pico exacto de forma.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 border-t border-slate-100 pt-4">
              <CheckCircle className="h-4 w-4 text-cyan-600 shrink-0" />
              <span>Modelo Matemático Banister PMC</span>
            </div>
          </div>

          {/* Pilar 2: Prescripción de Potencia Precisa (% CP & FTP) */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between backdrop-blur-xl hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider">
                Pilar 02 • Prescripción por Vatios
              </span>
              <h3 className="text-lg font-bold text-slate-950 leading-snug">
                Entrena por Vatios, no por suposiciones.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Entrenamientos estructurados por potencia crítica y porcentaje de umbral, diseñados para ejecutarse directo en tu reloj con zonas milimétricas de ritmo y potencia.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 border-t border-slate-100 pt-4">
              <CheckCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Compatibilidad Stryd & FTP Ciclismo</span>
            </div>
          </div>

          {/* Pilar 3: Head Coach de IA Activo 24/7 */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between backdrop-blur-xl hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🤖
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                Pilar 03 • Head Coach IA 24/7
              </span>
              <h3 className="text-lg font-bold text-slate-950 leading-snug">
                Un entrenador de élite que ajusta tu plan cada mañana.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                La IA analiza tu recuperación, HRV y sensaciones al despertar, recalculando la carga de tu sesión diaria y sincronizando el cambio en 1 clic con tu reloj.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 border-t border-slate-100 pt-4">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Inferencia Google Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ECOSISTEMA DE DISPOSITIVOS CON IMÁGENES REALES */}
      <section id="ecosystem" className="relative py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-12">
          <div className="text-center space-y-2.5">
            <div className="text-cyan-700 font-bold tracking-widest text-xs uppercase font-mono">
              INTEGRACIÓN DE HARDWARE & APIS
            </div>
            <h3 className="text-slate-950 font-bold text-3xl sm:text-4xl tracking-tight">
              Sincronización Total con tus Dispositivos
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
              Envía tus sesiones estructuradas directo a Garmin y Coros mediante la telemetría en tiempo real de Intervals.icu y Stryd.
            </p>
          </div>

          {/* Grid de 5 Tarjetas en Light Glassmorphism con Imágenes Reales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* 1. Garmin Connect */}
            <div className="bg-white/90 border border-slate-200/80 hover:border-cyan-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <img
                  src="/brands/garmin.png"
                  alt="Garmin Connect"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-cyan-700 transition">Garmin Connect</div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Forerunner & Edge</div>
            </div>

            {/* 2. Coros Training Hub */}
            <div className="bg-white/90 border border-slate-200/80 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <img
                  src="/brands/coros.png"
                  alt="Coros Training Hub"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-amber-700 transition">Coros Training Hub</div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Apex & Pace Series</div>
            </div>

            {/* 3. Intervals.icu */}
            <div className="bg-white/90 border border-slate-200/80 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <img
                  src="/brands/intervals.png"
                  alt="Intervals.icu"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-rose-700 transition">Intervals.icu</div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">REST Telemetry API</div>
            </div>

            {/* 4. Stryd Running Power */}
            <div className="bg-white/90 border border-slate-200/80 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                <img
                  src="/brands/stryd.png"
                  alt="Stryd Running Power"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-amber-700 transition">Stryd Running Power</div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Footpod % CP</div>
            </div>

            {/* 5. Google Gemini */}
            <div className="bg-white/90 border border-slate-200/80 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer sm:col-span-2 lg:col-span-1">
              <div className="h-16 w-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center p-3 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 48 48" className="h-8 w-8">
                  <defs>
                    <linearGradient id="gemini-official-grad-minimal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4285F4" />
                      <stop offset="35%" stopColor="#7B61FF" />
                      <stop offset="70%" stopColor="#D96570" />
                      <stop offset="100%" stopColor="#00C9FF" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#gemini-official-grad-minimal)"
                    d="M 24,2 C 24,14.15 14.15,24 2,24 C 14.15,24 24,33.85 24,46 C 24,33.85 33.85,24 46,24 C 33.85,24 24,14.15 24,2 Z"
                  />
                </svg>
              </div>
              <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-indigo-700 transition">Google Gemini</div>
              <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Adaptive Reasoning</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ INTERACTIVO */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-950">Preguntas Frecuentes</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">Todo lo que necesitas saber sobre el entrenamiento adaptativo con PULSE AI PRO.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "¿Cómo adapta la IA mi sesión diaria de entrenamiento?",
              a: "Cada mañana, PULSE AI analiza tu HRV, calidad de sueño, fatiga acumulada (ATL) y nivel de forma (TSB). Si detecta acumulación excesiva de fatiga o descanso óptimo, recalibra los vatios y duración de la sesión del día antes de que salgas a entrenar.",
            },
            {
              q: "¿Se sincroniza directamente con mi reloj Garmin o Coros?",
              a: "Sí. Mediante la conexión nativa con Intervals.icu, todas las series y bloques estructurados por potencia crítica (% CP) o vatios FTP se descargan automáticamente en tu dispositivo para guiarte en cada intervalo.",
            },
            {
              q: "¿Qué diferencia a PULSE AI de un plan estático de PDF o app tradicional?",
              a: "Los planes estáticos no saben si dormiste mal, si tuviste un día estresante o si tu rendimiento mejoró antes de tiempo. PULSE AI utiliza modelos biológicos dinámicos (Banister PMC) que recalculan tu pico de forma de manera continua.",
            },
            {
              q: "¿Es apto tanto para corredores como para ciclistas y triatletas?",
              a: "Totalmente. Permite configurar zonas y potencias independientes para carrera a pie (Stryd CP en W y ritmo por km) y ciclismo (FTP en W), gestionando la carga combinada de forma armónica.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleFaq(idx)}
              className="rounded-2xl p-5 bg-white/90 border border-slate-200/80 hover:border-slate-300 shadow-xs cursor-pointer transition backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{item.q}</span>
                <ChevronRight
                  className={`h-4 w-4 text-cyan-600 transition-transform duration-200 ${
                    activeFaq === idx ? "rotate-90" : ""
                  }`}
                />
              </div>
              {activeFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-normal">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA FINAL LUMINOSO DE ALTA CONVERSIÓN */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-cyan-50/90 via-white to-emerald-50/90 border border-cyan-200/90 shadow-xl shadow-cyan-500/5 space-y-6 backdrop-blur-xl">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Eleva tu Rendimiento con Inteligencia Fisiológica
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Únete a la plataforma de entrenamiento adaptativo que combina el rigor del modelo Banister con la potencia de los LLMs de Google DeepMind.
          </p>
          <div className="pt-3 flex items-center justify-center">
            {isUserAuthenticated ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="inline-flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>📊 Ir a mi Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onLoginWithGoogle}
                className="inline-flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>✨ Iniciar con Google</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER LUMINOSO */}
      <footer className="border-t border-slate-200/80 bg-white/95 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <PulseLogo size="sm" showSubtext={false} />
          <p>PULSE AI PRO © 2026 • Smart Endurance & Performance Coach • Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4 text-slate-500 font-semibold">
            <a href="#features" className="hover:text-slate-900 transition">Funcionalidades</a>
            <span>•</span>
            <a href="#pmc" className="hover:text-slate-900 transition">Modelo PMC</a>
            <span>•</span>
            <a href="#ecosystem" className="hover:text-slate-900 transition">Ecosistema</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};
