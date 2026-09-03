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
    const userMap = new Map<string, AdminUserListItem>();
    const duplicateDocIdsToDelete: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as UserProfileData;
      const emailKey = (data.email || "").trim().toLowerCase();
      if (!emailKey) return;

      const isSuper = isMasterAdminEmail(emailKey);
      const item: AdminUserListItem = {
        uid: data.uid || doc.id,
        email: emailKey,
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
      };

      if (!userMap.has(emailKey)) {
        userMap.set(emailKey, item);
      } else {
        const existing = userMap.get(emailKey)!;
        // Priorizar el registro que contiene los datos reales de potencia y credenciales
        const itemScore = (item.runFtp || 0) + (item.bikeFtp || 0) + (item.hasIntervalsKey ? 100 : 0);
        const existingScore = (existing.runFtp || 0) + (existing.bikeFtp || 0) + (existing.hasIntervalsKey ? 100 : 0);

        if (itemScore > existingScore) {
          duplicateDocIdsToDelete.push(existing.uid);
          userMap.set(emailKey, item);
        } else {
          duplicateDocIdsToDelete.push(item.uid);
        }
      }
    });

    // Limpieza en Firestore de documentos duplicados o vacíos
    if (duplicateDocIdsToDelete.length > 0 && adminDb) {
      const db = adminDb;
      Promise.all(
        duplicateDocIdsToDelete.map((id) =>
          db.collection("users").doc(id).delete().catch(() => {})
        )
      ).catch(() => {});
    }

    const users = Array.from(userMap.values());
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

/**
 * Elimina un usuario de Firestore de forma permanente utilizando privilegios de Firebase Admin.
 * Protege al superadministrador raíz contra eliminación accidental.
 */
export async function deleteUserFromAdmin(
  targetUid: string
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: true, message: "Usuario simulado eliminado en entorno local." };
  }

  const userRef = adminDb.collection("users").doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    // Si no existe directamente, intentar con prefijo preauth
    const preauthDoc = await adminDb.collection("users").doc(`preauth_${targetUid}`).get();
    if (preauthDoc.exists) {
      await adminDb.collection("users").doc(`preauth_${targetUid}`).delete();
      return { success: true, message: "Invitación preautorizada eliminada con éxito." };
    }
    throw new Error("Usuario no encontrado en la base de datos.");
  }

  const userData = doc.data() as UserProfileData;

  // Protección anti-eliminación para el Superadministrador Raíz
  if (isMasterAdminEmail(userData.email)) {
    throw new Error("Acción denegada: El Superadministrador Raíz no puede ser eliminado del sistema.");
  }

  // Eliminar el documento del usuario en Firestore
  await userRef.delete();

  return {
    success: true,
    message: `Usuario ${userData.displayName || userData.email} eliminado con éxito.`,
  };
}

export interface PreauthorizeUserParams {
  email: string;
  displayName?: string;
  role?: UserRole;
  status?: UserStatus;
  intervalsAthleteId?: string;
  runFtp?: number;
  bikeFtp?: number;
}

/**
 * Pre-autoriza a un atleta antes de su primer login.
 * Permite que cuando inicie sesión (con Google o correo), su acceso esté activo de inmediato.
 */
export async function preauthorizeUser(
  params: PreauthorizeUserParams
): Promise<{ success: boolean; message: string; docId: string }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const sanitizedDocId = `preauth_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const now = new Date().toISOString();

  if (!adminDb) {
    return { success: true, message: `Invitación simulada para ${cleanEmail}.`, docId: sanitizedDocId };
  }

  const preauthRef = adminDb.collection("users").doc(sanitizedDocId);
  const data: Record<string, any> = {
    uid: sanitizedDocId,
    email: cleanEmail,
    displayName: params.displayName?.trim() || "Atleta Invitado",
    role: params.role || "athlete",
    status: params.status || "active",
    intervalsAthleteId: params.intervalsAthleteId?.trim() || undefined,
    runFtp: params.runFtp ? Number(params.runFtp) : undefined,
    bikeFtp: params.bikeFtp ? Number(params.bikeFtp) : undefined,
    isPreAuthorized: true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  // Limpiar campos undefined
  const cleanData: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) cleanData[k] = v;
  }

  await preauthRef.set(cleanData, { merge: true });

  return {
    success: true,
    message: `Atleta ${params.displayName || cleanEmail} pre-autorizado con éxito.`,
    docId: sanitizedDocId,
  };
}

/**
 * Actualiza los campos principales de un usuario desde el panel de administración.
 */
export async function updateUserDetails(
  targetUid: string,
  updates: {
    displayName?: string;
    role?: UserRole;
    status?: UserStatus;
    intervalsAthleteId?: string;
    runFtp?: number;
    bikeFtp?: number;
  }
): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: true, message: "Usuario actualizado en entorno local." };
  }

  const userRef = adminDb.collection("users").doc(targetUid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("Usuario no encontrado.");
  }

  const cleanUpdates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.displayName !== undefined) cleanUpdates.displayName = updates.displayName.trim();
  if (updates.role !== undefined) cleanUpdates.role = updates.role;
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  if (updates.intervalsAthleteId !== undefined) cleanUpdates.intervalsAthleteId = updates.intervalsAthleteId.trim();
  if (updates.runFtp !== undefined) cleanUpdates.runFtp = Number(updates.runFtp);
  if (updates.bikeFtp !== undefined) cleanUpdates.bikeFtp = Number(updates.bikeFtp);

  await userRef.update(cleanUpdates);

  return {
    success: true,
    message: "Datos del atleta actualizados con éxito.",
  };
}

