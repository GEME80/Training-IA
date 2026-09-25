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
      <div className="hidden md:block rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-3.5 px-5">Usuario / Atleta</th>
              <th className="py-3.5 px-5">Estado de Acceso</th>
              <th className="py-3.5 px-5">Rol</th>
              <th className="py-3.5 px-5">Intervals.icu</th>
              <th className="py-3.5 px-5">Potencia Referencia (CP / FTP)</th>
              <th className="py-3.5 px-5 text-right">Acciones</th>
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
                      </div>
                    </div>
                  </td>

                  {/* Columna 2: Estado de Acceso */}
                  <td className="py-3.5 px-5">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                        <span>Solicitud Pendiente</span>
                        {isPreAuth && (
                          <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-950 font-mono">
                            Invitado
                          </span>
                        )}
                      </span>
                    ) : u.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Activo</span>
                        {isPreAuth && (
                          <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono">
                            Preautorizado
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <UserX className="h-3 w-3 text-rose-600" />
                        <span>Deshabilitado</span>
                      </span>
                    )}
                  </td>

                  {/* Columna 3: Rol */}
                  <td className="py-3.5 px-5">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-200">
                        <Shield className="h-3 w-3 text-purple-600" />
                        <span>Administrador</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>Atleta</span>
                      </span>
                    )}
                  </td>

                  {/* Columna 4: Conexión Intervals.icu */}
                  <td className="py-3.5 px-5">
                    {isIntervalsOk ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono">{u.intervalsAthleteId}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-emerald-200/80 text-emerald-900 font-bold uppercase">OK</span>
                      </div>
                    ) : u.intervalsAthleteId ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="font-mono">{u.intervalsAthleteId}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-amber-200/80 text-amber-900 font-bold">Falta API Key</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        <Unlink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>No vinculado</span>
                      </div>
                    )}
                  </td>

                  {/* Columna 5: Potencia (Stryd / FTP) */}
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

                  {/* Columna 6: Acciones */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Botón Rápido de Aprobación para Pendientes */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(u.uid, u.email, "active")}
                          title={isIntervalsOk ? "Aprobar y activar acceso" : "Aprobar acceso (Intervals pendiente de verificar)"}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}

                      {/* Editar y Soporte de Perfil */}
                      <button
                        type="button"
                        onClick={() => onEdit(u)}
                        title="Configurar perfil, umbrales y soporte de Intervals"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200 text-slate-700 transition cursor-pointer text-xs font-bold"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Configurar</span>
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
