"use client";

import React, { useState, useMemo } from "react";
import { UserPlus, Search, Users, CheckCircle2, Clock, Mail, RefreshCw, X, Zap, Activity, Sparkles, Trash2 } from "lucide-react";
import { AdminUserListItem, UserStatus } from "@/lib/db/types";
import { useAuth } from "@/context/AuthContext";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminUserInviteModal } from "./AdminUserInviteModal";
import { AdminUserEditModal } from "./AdminUserEditModal";
import { AdminUserDeleteModal } from "./AdminUserDeleteModal";

interface AdminUsersTabProps {
  users: AdminUserListItem[];
  onRefresh: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
  onInspectAthlete?: (user: AdminUserListItem) => void;
}

type QuickTabFilter = "ALL" | "ACTIVE" | "PENDING" | "INVITED";

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onRefresh,
  showMessage,
  onInspectAthlete,
}) => {
  const { user, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<QuickTabFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [connectionFilter, setConnectionFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSeedingDemos, setIsSeedingDemos] = useState<boolean>(false);

  // Modales
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);

  const hasDemos = useMemo(() => users.some((u) => u.uid?.startsWith("demo_") || u.email?.includes("pulse-demo.com")), [users]);

  // Conteo para métricas y segmentos
  const counts = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const invited = users.filter((u) => Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"))).length;
    const connected = users.filter((u) => Boolean(u.intervalsAthleteId)).length;
    return { total, active, pending, invited, connected };
  }, [users]);

  // Filtrado reactivo de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));
      const matchesSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.intervalsAthleteId && u.intervalsAthleteId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesQuick = quickFilter === "ALL" ? true : quickFilter === "ACTIVE" ? u.status === "active" : quickFilter === "PENDING" ? u.status === "pending" : isPreAuth;
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesConnection = connectionFilter === "ALL" || (connectionFilter === "CONNECTED" && Boolean(u.intervalsAthleteId)) || (connectionFilter === "UNLINKED" && !u.intervalsAthleteId);

      return matchesSearch && matchesQuick && matchesRole && matchesConnection;
    });
  }, [users, searchTerm, quickFilter, roleFilter, connectionFilter]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSeedDemos = async () => {
    setIsSeedingDemos(true);
    try {
      const res = await fetch("/api/admin/demo-athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed", requesterUid: user?.uid || userProfile?.uid, requesterEmail: user?.email || userProfile?.email }),
      });
      const data = await res.json();
      if (data.success) { showMessage("7 Atletas Demo sembrados para pruebas.", "success"); onRefresh(); }
      else showMessage(data.error || "Error al sembrar demos.", "error");
    } catch { showMessage("Error al sembrar demos.", "error"); } finally { setIsSeedingDemos(false); }
  };

  const handleCleanDemos = async () => {
    setIsSeedingDemos(true);
    try {
      const res = await fetch("/api/admin/demo-athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clean", requesterUid: user?.uid || userProfile?.uid, requesterEmail: user?.email || userProfile?.email }),
      });
      const data = await res.json();
      if (data.success) { showMessage("Atletas demo eliminados correctamente.", "success"); onRefresh(); }
      else showMessage(data.error || "Error al eliminar demos.", "error");
    } catch { showMessage("Error al eliminar demos.", "error"); } finally { setIsSeedingDemos(false); }
  };

  const handleStatusChange = async (targetUid: string, targetEmail: string, newStatus: UserStatus) => {
    try {
      const requesterUid = user?.uid || userProfile?.uid || "superadmin-root";
      const requesterEmail = user?.email || userProfile?.email || process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || "";

      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid, targetEmail, newStatus, status: newStatus, requesterUid, requesterEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
      showMessage(`Estado de ${targetEmail} actualizado a: ${newStatus}`, "success");
      onRefresh();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al cambiar estado", "error");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn">
      {/* 1. Titular Principal & Acciones Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Gestión de Atletas & Usuarios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {counts.total} Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa perfiles, estado de acceso, credenciales de telemetría y umbrales fisiológicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasDemos ? (
            <button
              type="button"
              onClick={handleCleanDemos}
              disabled={isSeedingDemos}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              title="Borrar los atletas demo de prueba"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span className="hidden sm:inline">Borrar Demos</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSeedDemos}
              disabled={isSeedingDemos}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              title="Sembrar los 7 atletas demo para pruebas"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="hidden sm:inline">+ 7 Demos</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refrescar listado de usuarios"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-cyan-600" : ""}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Invitar Atleta</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Resumen Rápido (Nuevo en v4.00) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Atletas</span>
            <Users className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{counts.total}</div>
          <div className="text-[11px] text-slate-400">Usuarios en la plataforma</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">Activos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">{counts.active}</div>
          <div className="text-[11px] text-slate-400">{Math.round((counts.active / (counts.total || 1)) * 100)}% con acceso habilitado</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs space-y-1 ${counts.pending > 0 ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200/90"}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${counts.pending > 0 ? "text-amber-800" : ""}`}>Pendientes</span>
            <Clock className={`h-4 w-4 ${counts.pending > 0 ? "text-amber-600 animate-pulse" : "text-slate-400"}`} />
          </div>
          <div className={`text-2xl font-bold ${counts.pending > 0 ? "text-amber-900" : "text-slate-900"}`}>{counts.pending}</div>
          <div className="text-[11px] text-slate-400">{counts.pending > 0 ? "Requieren aprobación" : "Sin solicitudes en cola"}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-700">Intervals.icu</span>
            <Zap className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{counts.connected} <span className="text-xs text-slate-400 font-normal">/ {counts.total}</span></div>
          <div className="text-[11px] text-slate-400">Atletas con telemetría vinculada</div>
        </div>
      </div>

      {/* 3. Segmentos Rápidos de Navegación (Tabs por Estado) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-bounce border-b border-slate-200/80 pb-2.5">
        <button type="button" onClick={() => setQuickFilter("ALL")} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${quickFilter === "ALL" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          <Users className="h-3.5 w-3.5" />
          <span>Todos ({counts.total})</span>
        </button>

        <button type="button" onClick={() => setQuickFilter("ACTIVE")} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${quickFilter === "ACTIVE" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Activos ({counts.active})</span>
        </button>

        <button type="button" onClick={() => setQuickFilter("PENDING")} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${quickFilter === "PENDING" ? "bg-amber-500 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          <Clock className="h-3.5 w-3.5" />
          <span>Solicitudes Pendientes ({counts.pending})</span>
          {counts.pending > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
        </button>

        <button type="button" onClick={() => setQuickFilter("INVITED")} className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${quickFilter === "INVITED" ? "bg-sky-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          <Mail className="h-3.5 w-3.5" />
          <span>Invitados ({counts.invited})</span>
        </button>
      </div>

      {/* 4. Barra de Filtros y Búsqueda Espaciosa */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o Athlete ID (ej. i442091)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
        >
          <option value="ALL">Todos los Roles</option>
          <option value="admin">Administradores</option>
          <option value="athlete">Atletas</option>
        </select>

        <select
          value={connectionFilter}
          onChange={(e) => setConnectionFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
        >
          <option value="ALL">Todas las Conexiones</option>
          <option value="CONNECTED">Conectados a Intervals</option>
          <option value="UNLINKED">Sin vincular</option>
        </select>
      </div>

      {/* 5. Tabla de Usuarios Espaciosa */}
      <AdminUsersTable
        users={filteredUsers}
        onEdit={(u) => setEditingUser(u)}
        onDelete={(u) => setUserToDelete(u)}
        onStatusChange={handleStatusChange}
        onInspectAthlete={onInspectAthlete}
      />

      {/* Modal 1: Invitar / Pre-registrar */}
      <AdminUserInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={onRefresh}
        showMessage={showMessage}
      />

      {/* Modal 2: Editar Usuario */}
      <AdminUserEditModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSuccess={onRefresh}
        showMessage={showMessage}
      />

      {/* Modal 3: Confirmar Eliminación */}
      <AdminUserDeleteModal
        user={userToDelete}
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onSuccess={onRefresh}
        showMessage={showMessage}
        requesterUid={user?.uid || userProfile?.uid || "superadmin-root"}
        requesterEmail={user?.email || userProfile?.email || process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || ""}
      />
    </div>
  );
};
