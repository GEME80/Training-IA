import React from "react";
import Link from "next/link";
import { PulseLogo } from "../PulseLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <PulseLogo size="sm" showSubtext={false} />
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold">
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
