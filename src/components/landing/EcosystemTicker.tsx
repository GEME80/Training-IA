"use client";

import React from "react";

interface BrandItem {
  name: string;
  sub: string;
  logoSrc?: string;
  isGemini?: boolean;
  isStrava?: boolean;
}

const BRANDS: BrandItem[] = [
  { name: "Garmin Connect", sub: "Forerunner & Edge", logoSrc: "/brands/garmin.png" },
  { name: "Coros Training Hub", sub: "Apex & Pace Series", logoSrc: "/brands/coros.png" },
  { name: "Stryd Running Power", sub: "Potencia Crítica CP", logoSrc: "/brands/stryd.png" },
  { name: "Intervals.icu", sub: "API Telemetría", logoSrc: "/brands/intervals.png" },
  { name: "Strava", sub: "Comunidad & Segmentos", isStrava: true },
  { name: "Google Gemini", sub: "Inferencia Fisiológica", isGemini: true },
];

export const EcosystemTicker: React.FC = () => {
  const extendedBrands = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <section id="ecosistema" className="py-7 w-full overflow-hidden border-y border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center mb-3">
        <span className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
          Ecosistema Compatible • Sincronización Automática en Segundo Plano
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="flex items-center gap-6 sm:gap-10 animate-marquee whitespace-nowrap will-change-transform py-1.5">
          {extendedBrands.map((brand, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs shrink-0 select-none"
            >
              <div className="h-8 w-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                {brand.isGemini ? (
                  <svg viewBox="0 0 48 48" className="h-5 w-5">
                    <defs>
                      <linearGradient id={`gemini-ticker-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="35%" stopColor="#7B61FF" />
                        <stop offset="70%" stopColor="#D96570" />
                        <stop offset="100%" stopColor="#00C9FF" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#gemini-ticker-${idx})`}
                      d="M 24,2 C 24,14.15 14.15,24 2,24 C 14.15,24 24,33.85 24,46 C 24,33.85 33.85,24 46,24 C 33.85,24 24,14.15 24,2 Z"
                    />
                  </svg>
                ) : brand.isStrava ? (
                  <svg viewBox="0 0 24 24" fill="#FC4C02" className="h-5 w-5">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.172" />
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
                <div className="text-xs font-bold text-slate-800">
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
