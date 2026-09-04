"use client";

import React from "react";
import { PulseLogo } from "../PulseLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <PulseLogo size="sm" showSubtext={false} />
        <p className="text-slate-500 text-[11px]">
          PULSE AI PRO © 2026 • Smart Endurance & Performance Coach
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
          <a href="#modelos" className="hover:text-cyan-700 transition">Modelos</a>
          <span>•</span>
          <a href="#headcoaches" className="hover:text-cyan-700 transition">Head Coaches</a>
          <span>•</span>
          <a href="#faq" className="hover:text-cyan-700 transition">Preguntas</a>
        </div>
      </div>
    </footer>
  );
};
