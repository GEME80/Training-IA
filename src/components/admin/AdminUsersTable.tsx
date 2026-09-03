"use client";

import React from "react";
import {
  Edit,
  UserCheck,
  UserX,
  Trash2,
  Clock,
  CheckCircle,
  UserPlus,
  Zap,
} from "lucide-react";
import { AdminUserListItem, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail } from "@/lib/env";
import { AdminUserCardMobile } from "./AdminUserCardMobile";

interface AdminUsersTableProps {
  users: AdminUserListItem[];
  onEdit: (user: AdminUserListItem) => void;
  onDelete: (user: AdminUserListItem) => void;
  onStatusChange: (targetUid: string, targetEmail: string, newStatus: UserStatus) => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (users.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Clock className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No se encontraron atletas coincidentes</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Prueba cambiando el término de búsqueda o seleccionando otro filtro de estado o rol.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 1. Vista Móvil de Tarjetas Táctiles (< md) */}
      <div className="block md:hidden space-y-3">
        {users.map((u) => (
          <AdminUserCardMobile
            key={u.uid}
            user={u}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* 2. Vista de Tabla Panorámica de Escritorio (md+) */}
      <div className="hidden md:block rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-5">Usuario / Atleta</th>
              <th className="py-3.5 px-5">Estado de Acceso</th>
              <th className="py-3.5 px-5">Rol</th>
              <th className="py-3.5 px-5">Potencia Referencia (CP / FTP)</th>
              <th className="py-3.5 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isRootAdmin = isMasterAdminEmail(u.email);
              const isPending = u.status === "pending";
              const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));

              return (
                <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                  {/* Columna 1: Usuario */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 shadow-2xs">
                        {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 truncate">
                            {u.displayName || "Sin nombre registrado"}
                          </span>
                          {isRootAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Superadmin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Intervals: <span className="text-slate-600 font-semibold">{u.intervalsAthleteId || "No vinculado"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Columna 2: Estado de Acceso */}
                  <td className="py-3.5 px-5">
                    {isPreAuth ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                        <span>Invitado (Espera 1er login)</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Solicitud Pendiente</span>
                      </span>
                    ) : u.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>Deshabilitado</span>
                      </span>
                    )}
                  </td>

                  {/* Columna 3: Rol */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-900 border-purple-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {u.role === "admin" ? "👑 Administrador" : "🏃 Atleta"}
                    </span>
                  </td>

                  {/* Columna 4: Potencia (Stryd / FTP) */}
                  <td className="py-3.5 px-5">
                    <div className="space-y-0.5 text-[11px] font-mono">
                      <div className="text-amber-800 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-600" />
                        <span>Stryd CP:</span>
                        <strong className="font-bold ml-1">{u.runFtp || 0} W</strong>
                      </div>
                      <div className="text-cyan-800 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-cyan-600" />
                        <span>Bike FTP:</span>
                        <strong className="font-bold ml-1">{u.bikeFtp || 0} W</strong>
                      </div>
                    </div>
                  </td>

                  {/* Columna 5: Acciones */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Botón Rápido de Aprobación para Pendientes */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(u.uid, u.email, "active")}
                          title="Aprobar acceso inmediatamente"
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => onEdit(u)}
                        title="Editar parámetros del usuario"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      {/* Alternar Estado: Activo / Deshabilitado */}
                      {u.status === "active" && !isRootAdmin && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(u.uid, u.email, "disabled")}
                          title="Deshabilitar acceso temporalmente"
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {u.status === "disabled" && !isRootAdmin && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(u.uid, u.email, "active")}
                          title="Reactivar acceso"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Eliminar */}
                      {!isRootAdmin && (
                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          title="Eliminar usuario definitivamente"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
