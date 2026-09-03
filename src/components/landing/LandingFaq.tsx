"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "¿Cómo adapta la Inteligencia Artificial mi sesión diaria de entrenamiento?",
    a: "Cada mañana, PULSE AI analiza tu variabilidad de frecuencia cardíaca (HRV), sueño, fatiga muscular acumulada en los últimos 7 días y nivel de frescura biológica. Si detecta sobrecarga o asimilación incompleta, recalibra los vatios y la duración de la sesión del día antes de que salgas a entrenar.",
  },
  {
    q: "¿Se sincroniza directamente con mi reloj Garmin o Coros?",
    a: "Sí. Mediante la conexión nativa con Intervals.icu, todas las series y bloques estructurados por potencia crítica (% CP) o vatios FTP se descargan automáticamente en tu dispositivo para guiarte paso a paso en cada intervalo sin que tengas que programar nada manualmente.",
  },
  {
    q: "¿Qué diferencia a PULSE AI de un plan estático de PDF o una app tradicional?",
    a: "Los planes estáticos no saben si dormiste mal, si tuviste un día estresante o si asimilaste la carga antes de tiempo. PULSE AI utiliza modelos biológicos continuos y el razonamiento adaptativo de Google Gemini para recalcular tu pico de forma de manera personalizada y dinámica.",
  },
  {
    q: "¿Es apto tanto para corredores como para ciclistas y triatletas?",
    a: "Totalmente. El sistema cuenta con motores específicos para cada disciplina: potencia Stryd y ritmos VDOT para running, 7 zonas de vatios FTP para ciclismo (rodillo y exterior) y gestión concurrente sin fatiga cruzada para triatlón (70.3, IRONMAN y corto).",
  },
  {
    q: "¿Qué dispositivos y potenciómetros necesito?",
    a: "Solo necesitas un reloj deportivo (Garmin o Coros) y, si buscas la máxima precisión milimétrica, un potenciómetro Stryd para carrera a pie o potenciómetro/rodillo inteligente en ciclismo. También funciona perfectamente con pulsómetros ópticos o de banda pectoral.",
  },
];

export const LandingFaq: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
          Preguntas Frecuentes
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Todo lo que necesitas saber sobre el entrenamiento adaptativo con PULSE AI PRO.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => toggleFaq(idx)}
            className="rounded-2xl p-5 bg-white/90 border border-slate-200/80 hover:border-cyan-300 shadow-xs cursor-pointer transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {item.q}
              </span>
              <ChevronRight
                className={`h-4 w-4 text-cyan-600 transition-transform duration-200 shrink-0 ${
                  activeFaq === idx ? "rotate-90" : ""
                }`}
              />
            </div>
            {activeFaq === idx && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-normal animate-in fade-in duration-150">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
