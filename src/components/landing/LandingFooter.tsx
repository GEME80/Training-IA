import React from "react";
import Link from "next/link";
import { PulseLogo } from "../PulseLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <PulseLogo size="sm" showSubtext={false} />
        <p className="text-slate-500 text-[11px]">
          PULSE ENDURANCE © 2026 • Desarrollado y operado por <strong>GMC (Germán Morales Consulting)</strong>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
          <a href="#metodologia" className="hover:text-emerald-700 transition">Metodología</a>
          <span>•</span>
          <a href="#faq" className="hover:text-emerald-700 transition">Preguntas</a>
          <span>•</span>
          <Link href="/terms" className="hover:text-emerald-700 text-slate-600 transition underline underline-offset-2">
            Términos y Condiciones
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-emerald-700 text-slate-600 transition underline underline-offset-2">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
};
