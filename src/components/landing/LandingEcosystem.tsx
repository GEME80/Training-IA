"use client";

import React from "react";

export const LandingEcosystem: React.FC = () => {
  return (
    <section id="ecosistema" className="relative py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="space-y-12">
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <div className="text-cyan-700 font-bold tracking-widest text-xs uppercase font-mono">
            INTEGRACIÓN DE HARDWARE & APIS
          </div>
          <h3 className="text-slate-950 font-black text-3xl sm:text-4xl tracking-tight">
            Sincronización Total con tus Dispositivos
          </h3>
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
            Envía tus series estructuradas directo a Garmin y Coros mediante la telemetría en tiempo real de Intervals.icu y Stryd. Cero programación manual en el reloj.
          </p>
        </div>

        {/* Grid de 5 Tarjetas en Light Glassmorphism con Imágenes Reales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* 1. Garmin Connect */}
          <div className="bg-white/90 border border-slate-200/80 hover:border-cyan-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img
                src="/brands/garmin.png"
                alt="Garmin Connect"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-cyan-700 transition">
              Garmin Connect
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Forerunner & Edge</div>
          </div>

          {/* 2. Coros Training Hub */}
          <div className="bg-white/90 border border-slate-200/80 hover:border-amber-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img
                src="/brands/coros.png"
                alt="Coros Training Hub"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-amber-700 transition">
              Coros Training Hub
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Apex & Pace Series</div>
          </div>

          {/* 3. Intervals.icu */}
          <div className="bg-white/90 border border-slate-200/80 hover:border-rose-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img
                src="/brands/intervals.png"
                alt="Intervals.icu"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-rose-700 transition">
              Intervals.icu
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">REST Telemetry API</div>
          </div>

          {/* 4. Stryd Running Power */}
          <div className="bg-white/90 border border-slate-200/80 hover:border-amber-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img
                src="/brands/stryd.png"
                alt="Stryd Running Power"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-amber-700 transition">
              Stryd Running Power
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Footpod % CP</div>
          </div>

          {/* 5. Google Gemini */}
          <div className="bg-white/90 border border-slate-200/80 hover:border-indigo-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md shadow-slate-200/30 hover:shadow-lg transition-all duration-200 group cursor-pointer sm:col-span-2 lg:col-span-1">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center p-3 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 48 48" className="h-8 w-8">
                <defs>
                  <linearGradient id="gemini-official-grad-landing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="35%" stopColor="#7B61FF" />
                    <stop offset="70%" stopColor="#D96570" />
                    <stop offset="100%" stopColor="#00C9FF" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#gemini-official-grad-landing)"
                  d="M 24,2 C 24,14.15 14.15,24 2,24 C 14.15,24 24,33.85 24,46 C 24,33.85 33.85,24 46,24 C 33.85,24 24,14.15 24,2 Z"
                />
              </svg>
            </div>
            <div className="text-slate-900 font-bold text-sm mt-3.5 group-hover:text-indigo-700 transition">
              Google Gemini
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5 font-mono">Inferencia Fisiológica</div>
          </div>
        </div>
      </div>
    </section>
  );
};
