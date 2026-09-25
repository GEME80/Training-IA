"use client";

import React from "react";
import {
  Edit3,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  Zap,
  Shield,
  User,
  Clock,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { AdminUserListItem, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail } from "@/lib/env";

interface AdminUserCardMobileProps {
  user: AdminUserListItem;
  onEdit: (user: AdminUserListItem) => void;
  onDelete: (user: AdminUserListItem) => void;
  onStatusChange: (targetUid: string, targetEmail: string, newStatus: UserStatus) => void;
}

export const AdminUserCardMobile: React.FC<AdminUserCardMobileProps> = ({
  user: u,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isRootAdmin = isMasterAdminEmail(u.email);
  const isPending = u.status === "pending";
  const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));
  const isIntervalsOk = Boolean(u.intervalsAthleteId && (u.hasIntervalsKey || isRootAdmin));

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
      {/* 1. Cabecera: Avatar, Nombre, Correo y Rol */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-black text-slate-700 text-sm shrink-0">
            {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs truncate">
                {u.displayName || "Sin nombre registrado"}
              </span>
              {isRootAdmin && (
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Superadmin
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
          </div>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
            u.role === "admin"
              ? "bg-purple-50 text-purple-900 border-purple-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {u.role === "admin" ? (
            <>
              <Shield className="h-3 w-3 text-purple-600" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <User className="h-3 w-3 text-slate-500" />
              <span>Atleta</span>
            </>
          )}
        </span>
      </div>

      {/* 2. Fila de Estado de Acceso */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        <div>
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
              <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
              <span>Solicitud Pendiente</span>
              {isPreAuth && (
                <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-200/70 text-amber-950 font-mono">
                  Invitado
                </span>
              )}
            </span>
          ) : u.status === "active" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Activo</span>
              {isPreAuth && (
                <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-sky-100 text-sky-800 font-mono">
                  Preautorizado
                </span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <UserX className="h-3 w-3 text-rose-600" />
              <span>Deshabilitado</span>
            </span>
          )}
        </div>

        {/* Intervals Status Badge */}
        <div>
          {isIntervalsOk ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{u.intervalsAthleteId}</span>
              <span className="text-[8px] bg-emerald-200/80 px-1 rounded uppercase">OK</span>
            </span>
          ) : u.intervalsAthleteId ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>{u.intervalsAthleteId}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
              <Unlink className="h-3 w-3 text-slate-400" />
              <span>No vinculado</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Fila de Potencias Fisiológicas */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono">
        <div className="flex items-center gap-1 text-amber-800">
          <Zap className="h-3 w-3 text-amber-600 shrink-0" />
          <span>Stryd CP:</span>
          <strong className="font-bold ml-auto">{u.runFtp || 0} W</strong>
        </div>
        <div className="flex items-center gap-1 text-cyan-800">
          <Zap className="h-3 w-3 text-cyan-600 shrink-0" />
          <span>Bike FTP:</span>
          <strong className="font-bold ml-auto">{u.bikeFtp || 0} W</strong>
        </div>
      </div>

      {/* 4. Botonera de Acciones Táctiles */}
      <div className="flex items-center justify-end gap-1.5 pt-1">
        {isPending && (
          <button
            type="button"
            onClick={() => onStatusChange(u.uid, u.email, "active")}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Aprobar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(u)}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Configurar</span>
        </button>

        {u.status === "active" && !isRootAdmin && (
          <button
            type="button"
            onClick={() => onStatusChange(u.uid, u.email, "disabled")}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
            title="Deshabilitar"
          >
            <UserX className="h-3.5 w-3.5" />
          </button>
        )}

        {u.status === "disabled" && !isRootAdmin && (
          <button
            type="button"
            onClick={() => onStatusChange(u.uid, u.email, "active")}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
            title="Reactivar"
          >
            <UserCheck className="h-3.5 w-3.5" />
          </button>
        )}

        {!isRootAdmin && (
          <button
            type="button"
            onClick={() => onDelete(u)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
