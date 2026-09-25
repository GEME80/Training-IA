"use client";

import React from "react";
import {
  Edit3,
  UserCheck,
  UserX,
  Trash2,
  Clock,
  CheckCircle2,
  Zap,
  Shield,
  User,
  AlertCircle,
  Unlink,
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
      <div className="hidden md:block rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-3.5 sm:px-4">Usuario / Atleta</th>
                <th className="py-3 px-3.5 sm:px-4">Estado de Acceso</th>
                <th className="py-3 px-3.5 sm:px-4">Intervals.icu</th>
                <th className="py-3 px-3.5 sm:px-4">Potencia (CP / FTP)</th>
                <th className="py-3 px-3.5 sm:px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isRootAdmin = isMasterAdminEmail(u.email);
                const isPending = u.status === "pending";
                const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));
                const isIntervalsOk = Boolean(u.intervalsAthleteId && (u.hasIntervalsKey || isRootAdmin));

                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                    {/* Columna 1: Usuario & Rol */}
                    <td className="py-3 px-3.5 sm:px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                          {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                            <span className="font-bold text-slate-900 truncate">
                              {u.displayName || "Sin nombre registrado"}
                            </span>
                            {isRootAdmin ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                                <Shield className="h-2.5 w-2.5" />
                                Superadmin
                              </span>
                            ) : u.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                                <Shield className="h-2.5 w-2.5" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                                <User className="h-2.5 w-2.5" />
                                Atleta
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Columna 2: Estado de Acceso */}
                    <td className="py-3 px-3.5 sm:px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap">
                          <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                          <span>Solicitud Pendiente</span>
                          {isPreAuth && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-950 font-mono">
                              Invitado
                            </span>
                          )}
                        </span>
                      ) : u.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Activo</span>
                          {isPreAuth && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono">
                              Preautorizado
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap">
                          <UserX className="h-3 w-3 text-rose-600" />
                          <span>Deshabilitado</span>
                        </span>
                      )}
                    </td>

                    {/* Columna 3: Conexión Intervals.icu */}
                    <td className="py-3 px-3.5 sm:px-4">
                      {isIntervalsOk ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono">{u.intervalsAthleteId}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-emerald-200/80 text-emerald-900 font-bold uppercase">OK</span>
                        </div>
                      ) : u.intervalsAthleteId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span className="font-mono">{u.intervalsAthleteId}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-amber-200/80 text-amber-900 font-bold">Falta API Key</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                          <Unlink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>No vinculado</span>
                        </div>
                      )}
                    </td>

                    {/* Columna 4: Potencia (Stryd / FTP) */}
                    <td className="py-3 px-3.5 sm:px-4">
                      <div className="flex flex-col gap-0.5 text-[11px] font-mono whitespace-nowrap">
                        <div className="text-amber-800 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-600 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-sans">Run CP:</span>
                          <strong className="font-bold">{u.runFtp || 0}W</strong>
                        </div>
                        <div className="text-cyan-800 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-cyan-600 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-sans">Bike FTP:</span>
                          <strong className="font-bold">{u.bikeFtp || 0}W</strong>
                        </div>
                      </div>
                    </td>

                    {/* Columna 5: Acciones */}
                    <td className="py-3 px-3.5 sm:px-4 text-right">
                      <div className="inline-flex items-center justify-end space-x-1.5 whitespace-nowrap">
                        {/* Botón Rápido de Aprobación para Pendientes */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(u.uid, u.email, "active")}
                            title={isIntervalsOk ? "Aprobar y activar acceso" : "Aprobar acceso (Intervals pendiente de verificar)"}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </button>
                        )}

                        {/* Configuración y Soporte de Perfil */}
                        <button
                          type="button"
                          onClick={() => onEdit(u)}
                          title="Configurar perfil, umbrales y soporte de Intervals"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200 text-slate-700 transition cursor-pointer text-xs font-bold shrink-0"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Configurar</span>
                        </button>

                        {/* Alternar Estado: Activo / Deshabilitado */}
                        {u.status === "active" && !isRootAdmin && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(u.uid, u.email, "disabled")}
                            title="Deshabilitar acceso temporalmente"
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shrink-0"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {u.status === "disabled" && !isRootAdmin && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(u.uid, u.email, "active")}
                            title="Reactivar acceso"
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer shrink-0"
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
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition cursor-pointer shrink-0"
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
