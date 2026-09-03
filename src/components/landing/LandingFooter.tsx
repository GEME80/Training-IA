"use client";

import React from "react";
import { PulseLogo } from "../PulseLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/95 py-8 text-center text-xs text-slate-500 w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <PulseLogo size="sm" showSubtext={false} />
        <p className="text-slate-600">
          PULSE AI PRO © 2026 • Smart Endurance & Performance Coach • Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-semibold">
          <a href="#modelos" className="hover:text-cyan-700 transition">
            Modelos
          </a>
          <span>•</span>
          <a href="#ciclos" className="hover:text-cyan-700 transition">
            Ciclos & Gráficas
          </a>
          <span>•</span>
          <a href="#headcoaches" className="hover:text-cyan-700 transition">
            Head Coaches
          </a>
          <span>•</span>
          <a href="#ecosistema" className="hover:text-cyan-700 transition">
            Ecosistema
          </a>
          <span>•</span>
          <a href="#faq" className="hover:text-cyan-700 transition">
            Preguntas
          </a>
        </div>
      </div>
    </footer>
  );
};
