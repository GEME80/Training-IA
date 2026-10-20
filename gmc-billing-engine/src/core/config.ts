/**
 * GMC FINSEC BILLING ENGINE - CONFIGURATION & ZOD VALIDATOR
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Regla de Oro: Cero secretos hardcodeados. Todas las credenciales se leen exclusivamente
 * desde variables de entorno de servidor validadas estrictamente con Zod.
 */

import { z } from 'zod';

const openpayEnvSchema = z.object({
  OPENPAY_MERCHANT_ID: z.string().min(5, 'OPENPAY_MERCHANT_ID es requerido'),
  OPENPAY_PRIVATE_KEY: z.string().min(10, 'OPENPAY_PRIVATE_KEY es requerida'),
  OPENPAY_PUBLIC_KEY: z.string().min(5, 'OPENPAY_PUBLIC_KEY es requerida'),
  OPENPAY_SANDBOX_MODE: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
    return Boolean(val);
  }, z.boolean().default(true)),
  OPENPAY_WEBHOOK_USER: z.string().min(3, 'OPENPAY_WEBHOOK_USER es requerido'),
  OPENPAY_WEBHOOK_PASSWORD: z.string().min(6, 'OPENPAY_WEBHOOK_PASSWORD es requerido'),
});

export type OpenpayServerConfig = z.infer<typeof openpayEnvSchema> & {
  apiBaseUrl: string;
};

let cachedConfig: OpenpayServerConfig | null = null;

export function getOpenpayConfig(): OpenpayServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const rawEnv = {
    OPENPAY_MERCHANT_ID: process.env.OPENPAY_MERCHANT_ID || process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID,
    OPENPAY_PRIVATE_KEY: process.env.OPENPAY_PRIVATE_KEY,
    OPENPAY_PUBLIC_KEY: process.env.OPENPAY_PUBLIC_KEY || process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY,
    OPENPAY_SANDBOX_MODE: process.env.OPENPAY_SANDBOX_MODE || process.env.NEXT_PUBLIC_OPENPAY_SANDBOX_MODE || 'true',
    OPENPAY_WEBHOOK_USER: process.env.OPENPAY_WEBHOOK_USER,
    OPENPAY_WEBHOOK_PASSWORD: process.env.OPENPAY_WEBHOOK_PASSWORD,
  };

  const parsed = openpayEnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`[GMC_FINSEC_CONFIG_ERROR] Variables de entorno de Openpay inválidas: ${errorDetails}`);
  }

  const isSandbox = parsed.data.OPENPAY_SANDBOX_MODE;
  const apiBaseUrl = isSandbox
    ? 'https://sandbox-api.openpay.co/v1'
    : 'https://api.openpay.co/v1';

  cachedConfig = {
    ...parsed.data,
    apiBaseUrl,
  };

  return cachedConfig;
}

/**
 * Retorna las variables públicas seguras para el navegador (Openpay.js)
 */
export function getOpenpayPublicConfig() {
  return {
    merchantId: process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID || process.env.OPENPAY_MERCHANT_ID || '',
    publicKey: process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY || process.env.OPENPAY_PUBLIC_KEY || '',
    sandboxMode: (process.env.NEXT_PUBLIC_OPENPAY_SANDBOX_MODE || 'true').toLowerCase() === 'true',
  };
}
