"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { AdminUserListItem } from "@/lib/db/types";

interface AdminUserDeleteModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showMessage: (text: string, type: "success" | "error") => void;
  requesterUid?: string;
  requesterEmail?: string;
}

export const AdminUserDeleteModal: React.FC<AdminUserDeleteModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  showMessage,
  requesterUid,
  requesterEmail,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUid: user.uid,
          targetEmail: user.email,
          requesterUid,
          requesterEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

      showMessage(`Usuario ${user.email} eliminado del sistema`, "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      showMessage(err instanceof Error ? err.message : "Error al eliminar", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-rose-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-rose-600">
            <div className="p-2.5 rounded-2xl bg-rose-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">¿Eliminar Atleta?</h3>
              <p className="text-[11px] text-slate-500">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          Estás a punto de eliminar a <strong>{user.displayName || user.email}</strong>. Su registro, credenciales y macrociclos serán desvinculados de Firestore.
        </p>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? "Eliminando..." : "Eliminar Usuario"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
