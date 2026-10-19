"use client";

import React, { useEffect, useState } from "react";
import { X, Quote, Sparkles, Activity, ShieldCheck, Award } from "lucide-react";
import { CoachMethodology } from "./coachScienceData";

interface CoachBioModalProps {
  coach: CoachMethodology | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CoachBioModal: React.FC<CoachBioModalProps> = ({ coach, isOpen, onClose }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [coach]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !coach) return null;

  const initials = coach.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* 1. Cabecera: Foto Real del Entrenador, Nombre y Título */}
        <div className="flex items-start gap-4 pr-8">
          <div className="w-16 h-16 min-w-16 max-w-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md shrink-0 bg-slate-100">
            {coach.avatarUrl && !imageError ? (
              <img
                src={coach.avatarUrl}
                alt={coach.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top select-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-bold text-base shadow-md">
                {initials}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {coach.badgeLabel}
            </span>
            <h3 id="coach-modal-title" className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {coach.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {coach.roleTitle}
            </p>
          </div>
        </div>

        {/* 2. Cita Célebre */}
        <div className="relative pl-5 border-l-2 border-emerald-500/60 py-1">
          <Quote className="h-4 w-4 text-emerald-600/60 absolute -top-1 left-0 -translate-x-1/2 bg-white" strokeWidth={1.75} />
          <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed font-serif">
            &ldquo;{coach.quote}&rdquo;
          </p>
        </div>

        {/* 3. Trayectoria y Credenciales */}
        <div className="space-y-1.5 rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            <Award className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span>Trayectoria y Credenciales</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {coach.modalBio.credentials}
          </p>
        </div>

        {/* 4. Fundamento Científico y Biomecánico */}
        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            <Activity className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span>Base Científica & Biomecánica</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {coach.modalBio.scientificBasis}
          </p>
        </div>

        {/* 5. Cómo lo Aplica PULSE ENDURANCE en tu Plan */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/40 border border-emerald-300/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs tracking-wide uppercase">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span>Cómo lo Aplica PULSE ENDURANCE en tu Plan</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed font-medium">
            {coach.modalBio.pulseAiImplementation}
          </p>
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-700 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Algoritmo Fisiológico Activo en tu Periodización</span>
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Entendido, volver a entrenadores
          </button>
        </div>
      </div>
    </div>
  );
};
