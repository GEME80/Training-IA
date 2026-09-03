/**
 * Módulo de Almacenamiento Aislado por Usuario (Multi-Tenant LocalStorage)
 * Garantiza que NINGÚN dato de un atleta se filtre a otro en el mismo navegador.
 */

export const LEGACY_GLOBAL_KEYS = [
  "sgea_active_blueprint",
  "sgea_season_plans_chain",
  "sgea_intervals_api_key",
  "sgea_athlete_id",
  "sgea_run_ftp",
  "sgea_bike_ftp",
  "sgea_target_races",
  "sgea_weight_kg",
  "sgea_height_cm",
  "sgea_gender",
  "sgea_birth_date",
  "sgea_weekly_availability",
  "sgea_visible_metrics",
  "sgea_custom_gemini_key",
  "sgea_mock_user",
  "sgea_display_name",
  "sgea_current_uid",
];

/**
 * Elimina de raíz cualquier clave global legacy no aislada por UID.
 */
export function purgeLegacyGlobalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    LEGACY_GLOBAL_KEYS.forEach((k) => localStorage.removeItem(k));
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sgea_") || (key.startsWith("sgea:") && !key.startsWith("sgea:user:"))) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn("Aviso al purgar almacenamiento legacy:", e);
  }
}

/**
 * Interfaz de almacenamiento estrictamente aislada por UID de usuario.
 */
export interface UserScopedStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  getJSON<T>(key: string): T | null;
  setJSON<T>(key: string, value: T): void;
  clear(): void;
}

export function getUserStorage(uid?: string | null): UserScopedStorage {
  const safeUid = (uid || "").trim();

  return {
    getItem(key: string): string | null {
      if (typeof window === "undefined" || !safeUid) return null;
      try {
        return localStorage.getItem(`sgea:user:${safeUid}:${key}`);
      } catch {
        return null;
      }
    },

    setItem(key: string, value: string): void {
      if (typeof window === "undefined" || !safeUid) return;
      try {
        localStorage.setItem(`sgea:user:${safeUid}:${key}`, value);
      } catch (e) {
        console.warn("Aviso al escribir en userStorage:", e);
      }
    },

    removeItem(key: string): void {
      if (typeof window === "undefined" || !safeUid) return;
      try {
        localStorage.removeItem(`sgea:user:${safeUid}:${key}`);
      } catch {}
    },

    getJSON<T>(key: string): T | null {
      const raw = this.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    setJSON<T>(key: string, value: T): void {
      try {
        this.setItem(key, JSON.stringify(value));
      } catch {}
    },

    clear(): void {
      if (typeof window === "undefined" || !safeUid) return;
      try {
        const prefix = `sgea:user:${safeUid}:`;
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith(prefix)) {
            localStorage.removeItem(k);
          }
        });
      } catch {}
    },
  };
}

/**
 * Purgado completo al cerrar sesión
 */
export function purgeAllSessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sgea")) {
        localStorage.removeItem(key);
      }
    });
  } catch {}
}
