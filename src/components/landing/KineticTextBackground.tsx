"use client";

import React from "react";

const KINETIC_LINES = [
  "BANISTER 3:1 ASSIMILATION · STRYD CRITICAL POWER · CANOVA MARATHON MASTERY · 3H BIOMECHANICAL CAP",
  "HRV Z-SCORE ADAPTATION · JACK DANIELS VDOT · COGGAN FTP · POLARIZED 80/20 TRAINING",
  "NEUROMUSCULAR PROTECTION · TSB READINESS · LACTATE THRESHOLD DYNAMICS · VO2 MAX RECRUITMENT",
  "INTERVALS.ICU LIVE SYNC · MICROCYCLE CONTINUITY · BANISTER IMPULSE RESPONSE · 22-WEEK MACROCYCLE",
];

export const KineticTextBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      <div className="absolute -top-32 -left-32 -right-32 -bottom-32 flex flex-col justify-around rotate-[-14deg] opacity-[0.028]">
        {KINETIC_LINES.map((line, idx) => (
          <div
            key={idx}
            className="whitespace-nowrap text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-black tracking-widest uppercase text-slate-900 font-mono leading-none"
          >
            {line} · {line}
          </div>
        ))}
      </div>
    </div>
  );
};
