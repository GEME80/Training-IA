import { adminDb } from "../firebase/admin";
import { isMasterAdminEmail, getSuperadminEmail } from "../env";
import {
  UserProfileData,
  AdminUserListItem,
  AdminStats,
  UserRole,
  UserStatus,
} from "./types";

/**
 * Retorna todos los usuarios registrados para el panel de administración.
 * Se apoya en getSuperadminEmail() y variables dinámicas.
 */
export async function getAllUsersForAdmin(): Promise<AdminUserListItem[]> {
  const superadminEmail = getSuperadminEmail();
  const defaultSuperadmin: AdminUserListItem = {
    uid: "superadmin-root",
    email: superadminEmail,
    displayName: "Germán Morales",
    role: "admin",
    status: "active",
    intervalsAthleteId: process.env.INTERVALS_ATHLETE_ID || "i442091",
    hasIntervalsKey: !!process.env.INTERVALS_API_KEY,
    createdAt: "2026-08-01T00:00:00.000Z",
    lastLoginAt: new Date().toISOString(),
  };

  if (!adminDb) {
    return [defaultSuperadmin];
  }

  try {
    const snapshot = await adminDb.collection("users").get();
    const users: AdminUserListItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as UserProfileData;
      const isSuper = isMasterAdminEmail(data.email);

      users.push({
        uid: data.uid || doc.id,
        email: data.email || "",
        displayName: data.displayName || (isSuper ? "Germán Morales" : "Atleta"),
        photoURL: data.photoURL,
        role: data.role || (isSuper ? "admin" : "athlete"),
        status: data.status || (isSuper ? "active" : "pending"),
        intervalsAthleteId: data.intervalsAthleteId || (isSuper ? (process.env.INTERVALS_ATHLETE_ID || "i442091") : undefined),
        hasIntervalsKey: Boolean(data.encryptedApiKey),
        isPreAuthorized: Boolean((data as unknown as { isPreAuthorized?: boolean }).isPreAuthorized || (data.uid || doc.id).startsWith("preauth_")),
        runFtp: data.runFtp,
        bikeFtp: data.bikeFtp,
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || new Date().toISOString(),
      });
    });

    const hasSuperadmin = users.some((u) => isMasterAdminEmail(u.email));
    if (!hasSuperadmin) {
      users.unshift(defaultSuperadmin);
    }

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return users;
  } catch (err) {
    console.warn("Aviso al consultar usuarios en Firestore adminDb, retornando superadmin por fallback:", err);
    return [defaultSuperadmin];
  }
}

/**
 * Obtiene métricas agregadas (KPIs) de administración en tiempo de ejecución.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const users = await getAllUsersForAdmin();

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const disabledUsers = users.filter((u) => u.status === "disabled").length;
  const connectedAthletes = users.filter((u) => !!u.intervalsAthleteId).length;

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    disabledUsers,
    connectedAthletes,
    lastCalculatedAt: new Date().toISOString(),
  };
}

/**
 * Actualiza el estado de acceso de un usuario (active / pending / disabled).
 * Incluye protección anti-bloqueo para que el superadministrador no pueda ser deshabilitado.
 */
export async function updateUserStatus(
  targetUid: string,
  newStatus: UserStatus,
  requesterEmail?: string
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: true, message: "Estado simulado en entorno local." };
  }

  const userRef = adminDb.collection("users").doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("Usuario no encontrado.");
  }

  const userData = doc.data() as UserProfileData;

  // Protección anti-bloqueo para la cuenta superadministradora
  if (isMasterAdminEmail(userData.email) && newStatus === "disabled") {
    throw new Error("Acción denegada: El Superadministrador Raíz no puede ser deshabilitado.");
  }

  await userRef.update({
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Estado de ${userData.displayName || userData.email} actualizado a ${newStatus}.`,
  };
}

/**
 * Actualiza el rol de un usuario (admin / athlete).
 */
export async function updateUserRole(
  targetUid: string,
  newRole: UserRole
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: true, message: "Rol simulado en entorno local." };
  }

  const userRef = adminDb.collection("users").doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("Usuario no encontrado.");
  }

  const userData = doc.data() as UserProfileData;

  await userRef.update({
    role: newRole,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Rol de ${userData.displayName || userData.email} actualizado a ${newRole}.`,
  };
}
