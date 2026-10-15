import { adminDb } from "../firebase/admin";
import { UserStatus } from "./types";

export type SystemRegistrationMode = "OPEN" | "APPROVAL_REQUIRED";

export interface SystemAccessConfig {
  registrationMode: SystemRegistrationMode;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_CONFIG: SystemAccessConfig = {
  registrationMode: "APPROVAL_REQUIRED",
};

/**
 * Obtiene la configuración de admisión de nuevos atletas desde Firestore.
 */
export async function getSystemAccessConfig(): Promise<SystemAccessConfig> {
  if (!adminDb) return DEFAULT_CONFIG;
  try {
    const doc = await adminDb.collection("system_config").doc("access_settings").get();
    if (!doc.exists) return DEFAULT_CONFIG;
    const data = doc.data() as Partial<SystemAccessConfig>;
    return {
      registrationMode: data.registrationMode === "OPEN" ? "OPEN" : "APPROVAL_REQUIRED",
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
    };
  } catch (err) {
    console.warn("Aviso al consultar system_config/access_settings:", err);
    return DEFAULT_CONFIG;
  }
}

/**
 * Actualiza la configuración global de admisión de atletas.
 */
export async function setSystemAccessConfig(
  mode: SystemRegistrationMode,
  updatedBy: string
): Promise<SystemAccessConfig> {
  if (!adminDb) return { registrationMode: mode };
  const payload: SystemAccessConfig = {
    registrationMode: mode,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await adminDb.collection("system_config").doc("access_settings").set(payload, { merge: true });
  return payload;
}

/**
 * Determina el estado inicial de un atleta según el modo de admisión del sistema.
 */
export async function getDefaultUserStatus(isSuperadmin: boolean): Promise<UserStatus> {
  if (isSuperadmin) return "active";
  const config = await getSystemAccessConfig();
  return config.registrationMode === "OPEN" ? "active" : "pending";
}
