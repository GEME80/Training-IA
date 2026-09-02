"use client";

import React, { useState, useMemo } from "react";
import { UserPlus, Search, Users, CheckCircle2, Clock, Mail } from "lucide-react";
import { AdminUserListItem, UserStatus } from "@/lib/db/types";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminUserInviteModal } from "./AdminUserInviteModal";
import { AdminUserEditModal } from "./AdminUserEditModal";
import { AdminUserDeleteModal } from "./AdminUserDeleteModal";

interface AdminUsersTabProps {
  users: AdminUserListItem[];
  onRefresh: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
}

type QuickTabFilter = "ALL" | "ACTIVE" | "PENDING" | "INVITED";

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onRefresh,
  showMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<QuickTabFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modales
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);

  // Conteo para los segmentos
  const counts = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active" && !u.isPreAuthorized && !u.uid.startsWith("preauth_")).length;
    const pending = users.filter((u) => u.status === "pending").length;
    const invited = users.filter((u) => Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"))).length;
    return { total, active, pending, invited };
  }, [users]);

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isPreAuth = Boolean(u.isPreAuthorized || u.uid.startsWith("preauth_"));
      const matchesSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.intervalsAthleteId && u.intervalsAthleteId.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesQuick = true;
      if (quickFilter === "ACTIVE") {
        matchesQuick = u.status === "active" && !isPreAuth;
      } else if (quickFilter === "PENDING") {
        matchesQuick = u.status === "pending";
      } else if (quickFilter === "INVITED") {
        matchesQuick = isPreAuth;
      }

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesQuick && matchesRole;
    });
  }, [users, searchTerm, quickFilter, roleFilter]);

  const handleStatusChange = async (targetUid: string, targetEmail: string, newStatus: UserStatus) => {
    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid, targetEmail, status: newStatus }),
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
    <div className="space-y-6 animate-fadeIn">
      {/* Titular Principal y Botón de Invitación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-950 tracking-tight">
            Gestión de Atletas & Usuarios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de cuentas, autorizaciones de acceso y vinculación de telemetría deportiva.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Invitar / Registrar Atleta</span>
        </button>
      </div>

      {/* Segmentos Rápidos de Navegación (Tabs por Estado) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setQuickFilter("ALL")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            quickFilter === "ALL"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Todos ({counts.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("ACTIVE")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            quickFilter === "ACTIVE"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Activos ({counts.active})</span>
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("PENDING")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            quickFilter === "PENDING"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Solicitudes Pendientes ({counts.pending})</span>
          {counts.pending > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setQuickFilter("INVITED")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            quickFilter === "INVITED"
              ? "bg-sky-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Invitados ({counts.invited})</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o Athlete ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition shadow-2xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-2xs"
        >
          <option value="ALL">Todos los Roles</option>
          <option value="admin">👑 Administradores</option>
          <option value="athlete">🏃 Atletas</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <AdminUsersTable
        users={filteredUsers}
        onEdit={(u) => setEditingUser(u)}
        onDelete={(u) => setUserToDelete(u)}
        onStatusChange={handleStatusChange}
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
      />
    </div>
  );
};
