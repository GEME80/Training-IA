"use client";

import React, { useEffect, useState } from "react";
import { X, Quote, Sparkles, Activity, ShieldCheck } from "lucide-react";

export interface CoachData {
  id: string;
  name: string;
  initials: string;
  imageUrl: string;
  title: string;
  discipline: string;
  focus: string;
  quote: string;
  biomechanicalImpact: string;
  pulseApplication: string;
}

interface CoachBioModalProps {
  coach: CoachData | null;
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative animate-in zoom-in-95 duration-200 overflow-hidden"
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
          <div className="w-14 h-14 min-w-14 max-w-14 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-md shrink-0 bg-slate-100">
            {coach.imageUrl && !imageError ? (
              <img
                src={coach.imageUrl}
                alt={coach.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top select-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-bold text-base shadow-md">
                {coach.initials}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {coach.discipline}
            </span>
            <h3 id="coach-modal-title" className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {coach.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {coach.title}
            </p>
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
          <span>{coach.focus}</span>
        </div>

        {/* 2. Filosofía Clave */}
        <div className="relative pl-5 border-l-2 border-emerald-500/60 py-1">
          <Quote className="h-4 w-4 text-emerald-600/60 absolute -top-1 left-0 -translate-x-1/2 bg-white" strokeWidth={1.75} />
          <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed font-serif">
            &ldquo;{coach.quote}&rdquo;
          </p>
        </div>

        {/* 3. Impacto Biomecánico */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Impacto Fisiológico & Biomecánico
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {coach.biomechanicalImpact}
          </p>
        </div>

        {/* 4. Cómo lo aplica PULSE AI */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/40 border border-emerald-300/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs tracking-wide uppercase">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <span>Cómo lo aplica PULSE AI</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed font-medium">
            {coach.pulseApplication}
          </p>
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-700 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>Metodología Científica Activa en tu Plan</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
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
