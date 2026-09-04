"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "¿Cómo adapta la IA mi entrenamiento cada mañana?",
    a: "PULSE AI analiza tu HRV matutino y descanso nocturno. Si detecta fatiga aguda, recalibra los vatios y duración de la sesión antes de que salgas a entrenar.",
  },
  {
    q: "¿Se descarga directamente en mi reloj Garmin o Coros?",
    a: "Sí. Las series estructuradas viajan automáticamente a tu dispositivo mediante la API de Intervals.icu, sin necesidad de programar nada manualmente.",
  },
  {
    q: "¿Es compatible con ciclismo y triatlón?",
    a: "Totalmente. El sistema cuenta con motores específicos de potencia por vatios (% FTP) en rodillo o ruta, y gestión concurrente para triatlón (70.3 y 140.6).",
  },
  {
    q: "¿Qué sensores necesito para empezar?",
    a: "Solo tu reloj deportivo habitual. Para máxima precisión por vatios, recomendamos potenciómetro Stryd en carrera o medidor de potencia en ciclismo.",
  },
];

export const LandingFaq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Preguntas Frecuentes
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
          Respuestas Claras en Breve
        </h2>
      </div>

      {/* Grid Ultra-Compacto: 2 Columnas en Desktop, 1 en Móvil */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {FAQS.map((item, idx) => (
          <div
            key={idx}
            className="border-b border-slate-200/80 pb-3 transition-colors cursor-pointer select-none"
            onClick={() => toggle(idx)}
          >
            <div className="flex items-center justify-between gap-3 py-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  openIdx === idx ? "rotate-180 text-cyan-600" : ""
                }`}
              />
            </div>
            {openIdx === idx && (
              <p className="text-xs text-slate-600 leading-relaxed pt-1 pb-2 font-normal animate-in fade-in duration-150">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
