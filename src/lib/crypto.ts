import crypto from "crypto";
import type { EncryptedPayload } from "./db/types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

export type { EncryptedPayload };

/**
 * Obtiene las posibles claves maestras candidatas para descifrado resiliente
 * (soporta formato Hex, hash SHA-256 directo y hash con newline de Secret Manager).
 */
function getCandidateMasterKeys(): Buffer[] {
  const secret = process.env.ENCRYPTION_MASTER_KEY;
  if (!secret) {
    throw new Error(
      "CRITICAL: ENCRYPTION_MASTER_KEY no está configurada en las variables de entorno."
    );
  }

  const cleanSecret = secret.trim();
  const keys: Buffer[] = [];

  // 1. Clave canónica de GCP Secret Manager / AppHosting (SHA-256 del secret con trailing newline)
  keys.push(crypto.createHash("sha256").update(cleanSecret + "\n").digest());

  // 2. Hash SHA-256 del secret sin newline
  keys.push(crypto.createHash("sha256").update(cleanSecret).digest());

  // 3. Clave en formato Hex crudo de 32 bytes (64 caracteres)
  if (/^[0-9a-fA-F]{64}$/.test(cleanSecret)) {
    keys.push(Buffer.from(cleanSecret, "hex"));
  }

  return keys;
}

/**
 * Cifra una cadena sensible (ej. API Key de Intervals.icu) usando AES-256-GCM.
 */
export function encryptSensitiveData(plainText: string): EncryptedPayload {
  if (!plainText) {
    throw new Error("El texto a cifrar no puede estar vacío.");
  }

  // Para cifrado nuevo usamos la clave canónica consistente con los datos existentes
  const key = getCandidateMasterKeys()[0];
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag,
  };
}

/**
 * Descifra una carga cifrada con AES-256-GCM solo en memoria efímera de ejecución.
 * Prueba determinísticamente las claves candidatas para garantizar compatibilidad con Firestore y Secret Manager.
 */
export function decryptSensitiveData(payload: EncryptedPayload): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error("Carga cifrada inválida o incompleta.");
  }

  const candidateKeys = getCandidateMasterKeys();
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");

  let lastError: unknown = null;

  for (const key of candidateKeys) {
    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (err) {
      lastError = err;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error("Fallo en la autenticación criptográfica."));
}
