"use client";

import React from "react";
import { PulseLogo } from "./PulseLogo";
import { ShieldAlert, Clock, LogOut, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RestrictedAccessViewProps {
  status: "pending" | "disabled";
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({ status }) => {
  const { user, userProfile, signOutUser } = useAuth();

  const isPending = status === "pending";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
      <header className="w-full border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <PulseLogo size="md" showSubtext={true} />
          <button
            type="button"
            onClick={signOutUser}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
          <div
            className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
              isPending
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}
          >
            {isPending ? <Clock className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">
              {isPending ? "Cuenta en Espera de Aprobación" : "Acceso a la Plataforma Deshabilitado"}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isPending
                ? "Tu cuenta de Google ha sido registrada exitosamente. Para mantener la integridad y privacidad del sistema, el Administrador debe validar y habilitar tu ingreso."
                : "Tu ingreso a la plataforma se encuentra temporalmente deshabilitado por el Administrador. Si consideras que se trata de un error, por favor ponte en contacto con soporte."}
            </p>
          </div>

          {/* Información del Usuario */}
          <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 text-left space-y-1 text-xs">
            <div className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              Identidad de Acceso
            </div>
            <div className="font-bold text-slate-800">{user?.displayName || userProfile?.displayName || "Atleta"}</div>
            <div className="text-slate-500 text-[11px] font-mono">{user?.email || userProfile?.email}</div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="mailto:germanmorales@gmail.com?subject=Solicitud%20de%20Acceso%20PULSE%20AI"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow transition cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>Contactar al Administrador</span>
            </a>

            <button
              type="button"
              onClick={signOutUser}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir / Usar otra cuenta</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        <p>PULSE AI PRO © 2026 • Acceso Protegido por Aislamiento Multi-Tenant</p>
      </footer>
    </div>
  );
};
