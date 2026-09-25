"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  SlidersHorizontal,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { AdminUserListItem, UserRole, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail } from "@/lib/env";
import { useAuth } from "@/context/AuthContext";
import { AdminUserEditIntervalsSection } from "./AdminUserEditIntervalsSection";
import { AdminUserEditBiometricsSection } from "./AdminUserEditBiometricsSection";

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
  const { user: authUser, userProfile } = useAuth();
  const requesterUid = authUser?.uid || userProfile?.uid || "superadmin-root";
  const requesterEmail = authUser?.email || userProfile?.email || process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || "";

  const [name, setName] = useState<string>("");
  const [intervalsId, setIntervalsId] = useState<string>("");
  const [rawApiKey, setRawApiKey] = useState<string>("");
  const [runFtp, setRunFtp] = useState<number>(0);
  const [bikeFtp, setBikeFtp] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [lthr, setLthr] = useState<number | "">("");
  const [maxHR, setMaxHR] = useState<number | "">("");
  const [restingHR, setRestingHR] = useState<number | "">("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [status, setStatus] = useState<UserStatus>("pending");

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; athleteName?: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setIntervalsId(user.intervalsAthleteId || "");
      setRawApiKey("");
      setRunFtp(user.runFtp || 0);
      setBikeFtp(user.bikeFtp || 0);
      setWeightKg(user.weightKg ?? "");
      setLthr(user.lthr ?? "");
      setMaxHR(user.maxHR ?? "");
      setRestingHR(user.restingHR ?? "");
      setRole(user.role);
      setStatus(user.status);
      setTestResult(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isRootAdmin = isMasterAdminEmail(user.email);

  const handleTestConnection = async () => {
    if (!intervalsId.trim()) {
      setTestResult({
        success: false,
        message: "Ingresa el Athlete ID de Intervals.icu para poder verificar la conexión.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: intervalsId.trim(),
          apiKey: rawApiKey.trim() || undefined,
          uid: user.uid,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const detectedName = data.athleteName || data.athlete?.name || "Atleta";
        setTestResult({
          success: true,
          message: `Conexión verificada exitosamente con Intervals.icu para "${detectedName}".`,
          athleteName: detectedName,
        });

        if (data.runFtp && (!runFtp || runFtp === 300)) setRunFtp(Number(data.runFtp));
        if (data.bikeFtp && (!bikeFtp || bikeFtp === 250)) setBikeFtp(Number(data.bikeFtp));
        if (data.weight && !weightKg) setWeightKg(Number(data.weight));
        if (data.lthr && !lthr) setLthr(Number(data.lthr));
        if (data.maxHR && !maxHR) setMaxHR(Number(data.maxHR));
        if (data.restingHR && !restingHR) setRestingHR(Number(data.restingHR));
      } else {
        setTestResult({
          success: false,
          message: data.error || "No se pudo conectar con Intervals.icu. Verifica el ID o la Clave API.",
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Error de red al probar conexión.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e?: React.FormEvent, overrideStatus?: UserStatus) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const finalStatus = overrideStatus || status;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-requester-email": requesterEmail,
          "x-requester-uid": requesterUid,
        },
        body: JSON.stringify({
          targetUid: user.uid,
          targetEmail: user.email,
          displayName: name.trim(),
          intervalsAthleteId: intervalsId.trim(),
          rawApiKey: rawApiKey.trim() || undefined,
          runFtp: Number(runFtp) || 0,
          bikeFtp: Number(bikeFtp) || 0,
          weightKg: weightKg === "" ? undefined : Number(weightKg),
          lthr: lthr === "" ? undefined : Number(lthr),
          maxHR: maxHR === "" ? undefined : Number(maxHR),
          restingHR: restingHR === "" ? undefined : Number(restingHR),
          role,
          status: finalStatus,
          requesterEmail,
          requesterUid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");

      showMessage(`Perfil de ${user.email} guardado correctamente.`, "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAccessLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const athleteName = name.trim() || "Atleta";
    const text = `¡Hola ${athleteName}! Tu cuenta en PULSE AI está lista. Puedes iniciar sesión directamente con tu cuenta de Google aquí: ${origin}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200/80 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">
                Configuración & Soporte de Atleta
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-[280px] sm:max-w-md">{user.email}</p>
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

        <form onSubmit={(e) => handleSave(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
              placeholder="Ej. Sofía Gómez"
            />
          </div>

          {/* 1. Bloque: Soporte de Conexión Intervals.icu */}
          <AdminUserEditIntervalsSection
            intervalsId={intervalsId}
            setIntervalsId={setIntervalsId}
            rawApiKey={rawApiKey}
            setRawApiKey={setRawApiKey}
            hasIntervalsKey={user.hasIntervalsKey}
            isTesting={isTesting}
            testResult={testResult}
            onTestConnection={handleTestConnection}
          />

          {/* 2. Bloque: Calibración Fisiológica & Biometría */}
          <AdminUserEditBiometricsSection
            runFtp={runFtp}
            setRunFtp={setRunFtp}
            bikeFtp={bikeFtp}
            setBikeFtp={setBikeFtp}
            weightKg={weightKg}
            setWeightKg={setWeightKg}
            lthr={lthr}
            setLthr={setLthr}
            maxHR={maxHR}
            setMaxHR={setMaxHR}
            restingHR={restingHR}
            setRestingHR={setRestingHR}
          />

          {/* 3. Bloque: Rol & Estado de Acceso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol</label>
              <select
                value={role}
                disabled={isRootAdmin}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
              >
                <option value="athlete">Atleta</option>
                <option value="admin">Administrador</option>
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
                <option value="pending">Solicitud Pendiente</option>
                <option value="active">Activo</option>
                <option value="disabled">Deshabilitado</option>
              </select>
            </div>
          </div>

          {/* Botonera de Acciones y Guardado */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyAccessLink}
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
              {status === "pending" && !isRootAdmin && (
                <button
                  type="button"
                  onClick={() => handleSave(undefined, "active")}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Aprobar y Activar</span>
                </button>
              )}

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
          </div>
        </form>
      </div>
    </div>
  );
};
