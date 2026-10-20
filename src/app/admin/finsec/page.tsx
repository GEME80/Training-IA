"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { GmcHoldingFinanceConsole } from "@/components/admin/GmcHoldingFinanceConsole";
import { RestrictedAccessView } from "@/components/RestrictedAccessView";

export default function FinSecHeadquartersPage() {
  const { user, userProfile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-emerald-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-xs font-mono font-bold">GMC FinSec Headquarters • Cargando...</span>
      </div>
    );
  }

  // Protección de seguridad estricta: Solo el Administrador / German Morales puede acceder a FinSec HQ
  if (!user || !isAdmin) {
    return <RestrictedAccessView status="disabled" />;
  }

  return <GmcHoldingFinanceConsole />;
}
