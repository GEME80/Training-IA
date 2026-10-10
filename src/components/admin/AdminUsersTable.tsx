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
  Eye,
} from "lucide-react";
import { AdminUserListItem, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail } from "@/lib/env";
import { AdminUserCardMobile } from "./AdminUserCardMobile";

interface AdminUsersTableProps {
  users: AdminUserListItem[];
  onEdit: (user: AdminUserListItem) => void;
  onDelete: (user: AdminUserListItem) => void;
  onStatusChange: (targetUid: string, targetEmail: string, newStatus: UserStatus) => void;
  onInspectAthlete?: (user: AdminUserListItem) => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onInspectAthlete,
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
            onInspectAthlete={onInspectAthlete}
          />
        ))}
      </div>

      {/* 2. Vista de Tabla Panorámica de Escritorio (md+) */}
      <div className="hidden md:block rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-4 px-5 sm:px-6">Usuario / Atleta</th>
                <th className="py-4 px-5 sm:px-6">Estado de Acceso</th>
                <th className="py-4 px-5 sm:px-6">Intervals.icu</th>
                <th className="py-4 px-5 sm:px-6">Umbrales Fisiológicos</th>
                <th className="py-4 px-5 sm:px-6 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isRootAdmin = isMasterAdminEmail(u.email);
                const isPending = u.status === "pending";
                const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));
                const isIntervalsOk = Boolean(u.intervalsAthleteId && (u.hasIntervalsKey || isRootAdmin));
                const isPaceMode = u.runningTrainingMode === "PACE" || !u.hasRunningPowerMeter;

                return (
                  <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                    {/* Columna 1: Usuario & Rol */}
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 shadow-2xs">
                          {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {u.displayName || "Sin nombre registrado"}
                            </span>
                            {isRootAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                                <Shield className="h-2.5 w-2.5" />
                                Superadmin
                              </span>
                            ) : u.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                                <Shield className="h-2.5 w-2.5" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                                <User className="h-2.5 w-2.5" />
                                Atleta
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Columna 2: Estado de Acceso & Suscripción */}
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap shadow-2xs">
                            <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                            <span>Solicitud Pendiente</span>
                            {isPreAuth && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950 font-mono">
                                Invitado
                              </span>
                            )}
                          </span>
                        ) : u.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Activo</span>
                            {isPreAuth && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                                Preautorizado
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap shadow-2xs">
                            <UserX className="h-3.5 w-3.5 text-rose-600" />
                            <span>Deshabilitado</span>
                          </span>
                        )}

                        <div className="text-[10px] font-mono">
                          {u.billingStatus === "PAID" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold">
                              <span>${u.planPrice || 80} USD</span>
                              <span className="text-emerald-600 font-bold">✓ Pagado</span>
                            </span>
                          ) : u.billingStatus === "PENDING_VERIFICATION" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              <span>Por verificar</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Pendiente (${u.planPrice || 80})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Columna 3: Conexión Intervals.icu */}
                    <td className="py-4 px-5 sm:px-6">
                      {isIntervalsOk ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shadow-2xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-mono">{u.intervalsAthleteId}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold uppercase">Conectado</span>
                        </div>
                      ) : u.intervalsAthleteId ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shadow-2xs">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="font-mono">{u.intervalsAthleteId}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">Falta API Key</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                          <Unlink className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>No vinculado</span>
                        </div>
                      )}
                    </td>

                    {/* Columna 4: Umbrales Fisiológicos */}
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex flex-col gap-1.5 text-xs font-mono whitespace-nowrap">
                        <div className="text-[10px] font-sans font-semibold">
                          {u.swimCssStr && u.bikeFtp && (u.runFtp || u.runThresholdPaceStr) ? (
                            <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">🏊🚴🏃 Triatlón</span>
                          ) : u.bikeFtp && (!u.runFtp && !u.runThresholdPaceStr) ? (
                            <span className="text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">🚴 Ciclismo Puro</span>
                          ) : u.runThresholdPaceStr && (!u.runFtp || u.runningTrainingMode === "PACE") ? (
                            <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">⏱️ Running (Ritmo)</span>
                          ) : u.runFtp ? (
                            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">🏃 Running (Potencia Stryd)</span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Boolean(u.runFtp && u.runFtp > 0) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 text-[11px] font-semibold">
                              <Zap className="h-3 w-3 text-amber-600 shrink-0" />
                              <span className="text-slate-500 font-sans">Run CP:</span>
                              <strong className="font-bold">{u.runFtp}W</strong>
                            </span>
                          ) : u.runThresholdPaceStr ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold">
                              <Clock className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="text-slate-500 font-sans">Ritmo:</span>
                              <strong className="font-bold">{u.runThresholdPaceStr}/km</strong>
                            </span>
                          ) : null}

                          {Boolean(u.bikeFtp && u.bikeFtp > 0) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200/70 text-[11px] font-semibold">
                              <Zap className="h-3 w-3 text-cyan-600 shrink-0" />
                              <span className="text-slate-500 font-sans">Bike FTP:</span>
                              <strong className="font-bold">{u.bikeFtp}W</strong>
                            </span>
                          )}

                          {u.swimCssStr && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/70 text-[11px] font-semibold">
                              <span className="text-slate-500 font-sans">🏊 CSS:</span>
                              <strong className="font-bold">{u.swimCssStr}/100m</strong>
                            </span>
                          )}
                        </div>

                        {(u.weightKg || u.lthr) && (
                          <div className="text-[10px] text-slate-400 font-sans flex items-center gap-2">
                            {u.weightKg && <span>⚖️ {u.weightKg} kg</span>}
                            {u.lthr && <span>❤️ LTHR: {u.lthr} bpm</span>}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Columna 5: Acciones de Gestión */}
                    <td className="py-4 px-5 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {/* Botón Rápido de Aprobación para Pendientes */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(u.uid, u.email, "active")}
                            title={isIntervalsOk ? "Aprobar y activar acceso" : "Aprobar acceso (Intervals pendiente de verificar)"}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Aprobar</span>
                          </button>
                        )}

                        {/* Botón Inspeccionar / Ver como atleta (Solo Lectura) */}
                        {onInspectAthlete && (
                          <button
                            type="button"
                            onClick={() => onInspectAthlete(u)}
                            title={`Inspeccionar Home de ${u.displayName || u.email} en modo solo lectura`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-900 border border-purple-200 transition cursor-pointer text-xs font-bold shrink-0 shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5 text-purple-600" />
                            <span>Ver como atleta</span>
                          </button>
                        )}

                        {/* Configuración y Soporte de Perfil */}
                        <button
                          type="button"
                          onClick={() => onEdit(u)}
                          title="Configurar perfil, umbrales y soporte de Intervals"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-slate-200 text-slate-700 transition cursor-pointer text-xs font-bold shrink-0 shadow-2xs"
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
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer shrink-0"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {u.status === "disabled" && !isRootAdmin && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(u.uid, u.email, "active")}
                            title="Reactivar acceso"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer shrink-0"
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
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 transition cursor-pointer shrink-0"
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
