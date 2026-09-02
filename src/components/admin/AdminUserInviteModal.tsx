"use client";

import React, { useState } from "react";
import { UserPlus, Copy, Check, Info, Sparkles, X } from "lucide-react";
import { UserRole, UserStatus } from "@/lib/db/types";

interface AdminUserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
}

export const AdminUserInviteModal: React.FC<AdminUserInviteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  showMessage,
}) => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [status, setStatus] = useState<UserStatus>("active");
  const [intervalsId, setIntervalsId] = useState<string>("");
  const [runFtp, setRunFtp] = useState<number>(300);
  const [bikeFtp, setBikeFtp] = useState<number>(250);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users/preauthorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          displayName: name.trim(),
          role,
          status,
          intervalsAthleteId: intervalsId.trim(),
          runFtp: Number(runFtp) || 300,
          bikeFtp: Number(bikeFtp) || 250,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar la invitación");

      showMessage(`Invitación registrada para ${email}. Acceso habilitado.`, "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al registrar atleta", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyWelcomeMessage = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const athleteName = name.trim() || "Atleta";
    const text = `¡Hola ${athleteName}! Tu cuenta en PULSE AI ya ha sido habilitada por tu entrenador. Puedes ingresar directamente con tu cuenta de Google aquí: ${origin}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/80 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">Invitar / Registrar Atleta</h3>
              <p className="text-xs text-slate-500">Habilitación de acceso directo sin cola de espera</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Explicación de Valor UX */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/70 flex items-start space-x-3 text-xs text-cyan-950 leading-relaxed">
          <Info className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">¿Cómo funciona?</span> Al registrar el correo de Google de tu atleta, este queda pre-aprobado. Cuando haga clic en <em>&quot;Iniciar Sesión con Google&quot;</em> entrará de inmediato con sus métricas precargadas.
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico de Google <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atleta@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo (Opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sofía Gómez"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol de Usuario</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
              >
                <option value="athlete">🏃 Atleta</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Acceso</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
              >
                <option value="active">🟢 Activo Inmediato</option>
                <option value="pending">🟡 Pendiente de Aprobación</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span>Parámetros Fisiológicos Iniciales (Opcional)</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Intervals.icu Athlete ID</label>
              <input
                type="text"
                value={intervalsId}
                onChange={(e) => setIntervalsId(e.target.value)}
                placeholder="i123456"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">⚡ Stryd CP (W)</label>
                <input
                  type="number"
                  value={runFtp}
                  onChange={(e) => setRunFtp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-800 mb-1">🚴 Bike FTP (W)</label>
                <input
                  type="number"
                  value={bikeFtp}
                  onChange={(e) => setBikeFtp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Botón de Copiar Enlace y Acciones */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopyWelcomeMessage}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">¡Mensaje Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copiar Mensaje de Acceso</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Guardar e Invitar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
