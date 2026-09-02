import crypto from "crypto";
import type { EncryptedPayload } from "./db/types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

export type { EncryptedPayload };

/**
 * Obtiene la clave maestra simétrica de 32 bytes desde las variables de entorno.
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_MASTER_KEY;
  if (!secret) {
    throw new Error(
      "CRITICAL: ENCRYPTION_MASTER_KEY no está configurada en las variables de entorno."
    );
  }

  // Soporta clave en formato Hex (64 caracteres) o texto plano
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  // Hash SHA-256 como fallback determinístico si se usa una cadena de texto
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Cifra una cadena sensible (ej. API Key de Intervals.icu) usando AES-256-GCM.
 */
export function encryptSensitiveData(plainText: string): EncryptedPayload {
  if (!plainText) {
    throw new Error("El texto a cifrar no puede estar vacío.");
  }

  const key = getMasterKey();
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
 */
export function decryptSensitiveData(payload: EncryptedPayload): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error("Carga cifrada inválida o incompleta.");
  }

  const key = getMasterKey();
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
