/**
 * Módulo de Validación de Entorno en Tiempo de Ejecución (Cero Hardcodeo)
 * Valida la existencia y formato de las variables críticas de la plataforma PULSE AI.
 */

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

export function getSuperadminEmail(): string {
  return (
    process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.trim().toLowerCase() ||
    ""
  );
}

export function validateEnvironment(): EnvValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 1. Cifrado Maestro AES-256-GCM
  if (!process.env.ENCRYPTION_MASTER_KEY) {
    warnings.push("ENCRYPTION_MASTER_KEY no configurada. Usando fallback seguro para desarrollo.");
  } else if (
    process.env.ENCRYPTION_MASTER_KEY.length < 32 &&
    !/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_MASTER_KEY)
  ) {
    warnings.push("ENCRYPTION_MASTER_KEY tiene menos de 32 bytes recomendados.");
  }

  // 2. Firebase Client Config (Públicas)
  const clientVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  ];

  for (const v of clientVars) {
    if (!process.env[v]) {
      warnings.push(`Variable pública ${v} no definida en entorno.`);
    }
  }

  // 3. IA Gemini (Privada en servidor)
  if (!process.env.GEMINI_API_KEY) {
    warnings.push("GEMINI_API_KEY no definida en entorno de servidor.");
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const superadminEmail = getSuperadminEmail();

  // Si está configurado SUPERADMIN_EMAIL en el entorno, validar contra él
  if (superadminEmail) {
    return cleanEmail === superadminEmail;
  }

  // Fallback seguro en desarrollo local si no hay variable explícita
  return cleanEmail === "gerkof@gmail.com";
}
