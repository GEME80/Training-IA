"use client";

import React, { useState, useEffect } from "react";
import { Edit3, X, Sparkles } from "lucide-react";
import { AdminUserListItem, UserRole, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail } from "@/lib/env";

interface AdminUserEditModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
}

export const AdminUserEditModal: React.FC<AdminUserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  showMessage,
}) => {
  const [name, setName] = useState<string>("");
  const [intervalsId, setIntervalsId] = useState<string>("");
  const [runFtp, setRunFtp] = useState<number>(0);
  const [bikeFtp, setBikeFtp] = useState<number>(0);
  const [role, setRole] = useState<UserRole>("athlete");
  const [status, setStatus] = useState<UserStatus>("active");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setIntervalsId(user.intervalsAthleteId || "");
      setRunFtp(user.runFtp || 0);
      setBikeFtp(user.bikeFtp || 0);
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isRootAdmin = isMasterAdminEmail(user.email);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUid: user.uid,
          targetEmail: user.email,
          displayName: name.trim(),
          intervalsAthleteId: intervalsId.trim(),
          runFtp,
          bikeFtp,
          role,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");

      showMessage(`Atleta ${user.email} actualizado correctamente`, "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/80 flex items-center justify-center">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">Editar Perfil del Atleta</h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-[280px]">{user.email}</p>
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

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intervals.icu Athlete ID</label>
            <input
              type="text"
              value={intervalsId}
              onChange={(e) => setIntervalsId(e.target.value)}
              placeholder="i442091"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span>Umbrales Fisiológicos de Potencia</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">⚡ Stryd Critical Power (W)</label>
                <input
                  type="number"
                  value={runFtp}
                  onChange={(e) => setRunFtp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-800 mb-1">🚴 Ciclismo FTP (W)</label>
                <input
                  type="number"
                  value={bikeFtp}
                  onChange={(e) => setBikeFtp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol</label>
              <select
                value={role}
                disabled={isRootAdmin}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
              >
                <option value="athlete">🏃 Atleta</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Acceso</label>
              <select
                value={status}
                disabled={isRootAdmin}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
              >
                <option value="active">🟢 Activo</option>
                <option value="pending">🟡 Pendiente</option>
                <option value="disabled">🔴 Deshabilitado</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
