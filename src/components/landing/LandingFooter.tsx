import React from "react";
import Link from "next/link";
import { PulseLogo } from "../PulseLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <PulseLogo size="sm" showSubtext={false} />
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-[11px] text-slate-600 font-medium">
              Una plataforma de <strong className="text-slate-900">German Morales Consulting</strong> • Bogotá D.C., Colombia
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-semibold">
            <Link href="/terms" className="hover:text-emerald-700 text-slate-600 transition underline underline-offset-2">
              Términos, Retracto y Reversión
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-emerald-700 text-slate-600 transition underline underline-offset-2">
              Política de Privacidad (Habeas Data)
            </Link>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
          <span>© 2026 PULSE ENDURANCE™ — Operado por German Morales Consulting. Todos los derechos reservados.</span>
          <span>Pagos procesados de forma segura por Openpay Colombia S.A.S. (BBVA) • Cumplimiento PCI-DSS Nivel 1 (SAQ-A).</span>
        </div>
      </div>
    </footer>
  );
};
