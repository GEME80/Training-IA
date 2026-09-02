"use client";

import React from "react";

interface PulseLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtext?: boolean;
}

export const PulseLogo: React.FC<PulseLogoProps> = ({
  size = "md",
  showSubtext = true,
}) => {
  const iconDimensions = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  }[size];

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className="flex items-center gap-3 cursor-pointer select-none group">
      {/* Isotipo 3D Oficial Limpio */}
      <div
        className={`relative flex items-center justify-center ${iconDimensions} rounded-2xl overflow-hidden border border-slate-200/90 dark:border-cyan-500/40 bg-white dark:bg-slate-950 shadow-sm shadow-slate-900/5 dark:shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-500/30 group-hover:border-cyan-400 transition-all duration-200 shrink-0 ring-1 ring-black/5 dark:ring-cyan-500/20`}
      >
        <img
          src="/pulse-icon.jpg"
          alt="PULSE AI Icon"
          className="w-full h-full object-cover object-center scale-110"
        />
      </div>

      {/* Tipografía de Marca Nítida */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${textSizes} text-slate-900 dark:text-white`}>
            PULSE
          </span>
          <span
            className={`font-black ${textSizes} bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent`}
          >
            AI
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            PRO
          </span>
        </div>
        {showSubtext && (
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
            Endurance Engine
          </span>
        )}
      </div>
    </div>
  );
};
