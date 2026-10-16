"use client";

import React from "react";

interface AthleteBiometricsBarProps {
  athleteName: string;
  calculatedAge?: number;
  gender?: "M" | "F" | "OTHER";
  weightKg?: number;
  heightCm?: number;
}

export const AthleteBiometricsBar: React.FC<AthleteBiometricsBarProps> = ({
  athleteName,
  calculatedAge,
  gender,
  weightKg,
  heightCm,
}) => {
  const genderLabel = gender === "F" ? "Mujer" : gender === "M" ? "Hombre" : "Atleta";
  const initials = (athleteName || "AT")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "GM";

  const bmi =
    weightKg && weightKg > 0 && heightCm && heightCm > 0
      ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
      : null;

  return (
    <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 select-none">
      {/* Avatar GM con estilo corporativo Pulse AI */}
      <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0 tracking-wider">
        {initials}
      </div>

      {/* Nombre y Biometría limpia */}
      <div className="min-w-0">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
          {athleteName || "Atleta"}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
          <span>{calculatedAge && calculatedAge > 0 ? `${calculatedAge}a ` : ""}({genderLabel})</span>
          {weightKg && weightKg > 0 && (
            <>
              <span>•</span>
              <span>{weightKg}kg</span>
            </>
          )}
          {heightCm && heightCm > 0 && (
            <>
              <span>•</span>
              <span>{heightCm}cm</span>
            </>
          )}
          {bmi && (
            <>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-500">IMC {bmi}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
