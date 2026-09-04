"use client";

import React from "react";

interface BrandItem {
  name: string;
  sub: string;
  logoSrc?: string;
  isGemini?: boolean;
}

const BRANDS: BrandItem[] = [
  { name: "Garmin Connect", sub: "Forerunner & Edge", logoSrc: "/brands/garmin.png" },
  { name: "Coros Training Hub", sub: "Apex & Pace Series", logoSrc: "/brands/coros.png" },
  { name: "Intervals.icu", sub: "API Telemetría", logoSrc: "/brands/intervals.png" },
  { name: "Stryd Running Power", sub: "Potencia Crítica CP", logoSrc: "/brands/stryd.png" },
  { name: "Google Gemini", sub: "Inferencia Fisiológica", isGemini: true },
];

export const LandingLogoCarousel: React.FC = () => {
  // Duplicamos la lista para crear el efecto de scroll infinito sin saltos
  const extendedBrands = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <section id="ecosistema" className="py-8 w-full overflow-hidden border-y border-slate-200/60 bg-white/50 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 text-center mb-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
          Sincronización Automática con tu Ecosistema Deportivo
        </span>
      </div>

      {/* Marquee Track Continuo */}
      <div className="relative w-full overflow-hidden mask-linear-fade">
        <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap will-change-transform py-2">
          {extendedBrands.map((brand, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all shrink-0 group cursor-default"
            >
              <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
                {brand.isGemini ? (
                  <svg viewBox="0 0 48 48" className="h-5 w-5">
                    <defs>
                      <linearGradient id={`gemini-logo-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="35%" stopColor="#7B61FF" />
                        <stop offset="70%" stopColor="#D96570" />
                        <stop offset="100%" stopColor="#00C9FF" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#gemini-logo-${idx})`}
                      d="M 24,2 C 24,14.15 14.15,24 2,24 C 14.15,24 24,33.85 24,46 C 24,33.85 33.85,24 46,24 C 33.85,24 24,14.15 24,2 Z"
                    />
                  </svg>
                ) : (
                  <img
                    src={brand.logoSrc}
                    alt={brand.name}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-800 transition-colors">
                  {brand.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono leading-none">
                  {brand.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
