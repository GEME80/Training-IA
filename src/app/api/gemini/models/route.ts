import { NextRequest, NextResponse } from "next/server";

export interface GeminiModelDto {
  id: string; // e.g. "gemini-2.5-flash"
  displayName: string;
  description: string;
  category: "Flash / Rápido" | "Pro / Analítico" | "Lite / Ultrarrápido" | "Preview / Experimental" | "Estándar";
  isRecommended: boolean;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

interface CacheEntry {
  timestamp: number;
  models: GeminiModelDto[];
}

// Caché en memoria con TTL de 6 horas (21,600,000 ms)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const memoryCache = new Map<string, CacheEntry>();

// Catálogo verificado de respaldo en caso de falta de conexión o API Key sin configurar
const VERIFIED_FALLBACK_MODELS: GeminiModelDto[] = [
  {
    id: "gemini-3.5-flash",
    displayName: "Gemini 3.5 Flash",
    description: "Modelo insignia balanceado: máxima velocidad, razonamiento fisiológico estructurado y coste eficiente.",
    category: "Flash / Rápido",
    isRecommended: true,
  },
  {
    id: "gemini-3.6-flash",
    displayName: "Gemini 3.6 Flash",
    description: "Última generación con razonamiento profundo y baja latencia.",
    category: "Flash / Rápido",
    isRecommended: true,
  },
  {
    id: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash Preview",
    description: "Generación avanzada de alta velocidad para inferencia conversacional.",
    category: "Flash / Rápido",
    isRecommended: false,
  },
  {
    id: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview",
    description: "Modelo de máxima capacidad analítica y periodización compleja de macrociclos.",
    category: "Pro / Analítico",
    isRecommended: false,
  },
  {
    id: "gemma-4-26b-a4b-it",
    displayName: "Gemma 4 26B IT",
    description: "Modelo abierto de alta eficiencia para tareas directas de auditoría.",
    category: "Lite / Ultrarrápido",
    isRecommended: false,
  },
];

function categorizeModel(id: string, displayName: string): {
  category: GeminiModelDto["category"];
  isRecommended: boolean;
} {
  const lower = (id + " " + displayName).toLowerCase();

  const isLite = lower.includes("lite");
  const isExp = lower.includes("exp") || lower.includes("preview") || lower.includes("thinking");
  const isPro = lower.includes("pro");
  const isFlash = lower.includes("flash") && !isLite;

  let category: GeminiModelDto["category"] = "Estándar";
  if (isLite) category = "Lite / Ultrarrápido";
  else if (isExp) category = "Preview / Experimental";
  else if (isPro) category = "Pro / Analítico";
  else if (isFlash) category = "Flash / Rápido";

  // Recomendado: 2.5 flash o el flash más reciente no experimental
  const isRecommended = (lower.includes("2.5-flash") || lower.includes("2.0-flash")) && !isExp;

  return { category, isRecommended };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customKey = url.searchParams.get("apiKey");
    const forceRefresh = url.searchParams.get("refresh") === "true";

    const rawApiKey = (customKey || process.env.GEMINI_API_KEY || "").toString();
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: "fallback_static",
        models: VERIFIED_FALLBACK_MODELS,
      });
    }

    const cacheKey = apiKey.substring(0, 12);
    const now = Date.now();

    // 1. Verificar si existe en caché en memoria y sigue vigente
    if (!forceRefresh && memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey)!;
      if (now - cached.timestamp < CACHE_TTL_MS && cached.models.length > 0) {
        return NextResponse.json({
          success: true,
          source: "memory_cache",
          cachedAt: new Date(cached.timestamp).toISOString(),
          models: cached.models,
        });
      }
    }

    // 2. Consultar la API oficial de Google Gemini
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          const filteredModels: GeminiModelDto[] = data.models
            .filter((m: any) => {
              const nameLower = (m.name || "").toLowerCase();
              const methods: string[] = m.supportedGenerationMethods || [];

              // Regla 1: Debe soportar generación de contenido
              const canGenerate = methods.includes("generateContent");

              // Regla 2: Descartar embeddings, modelos de visión pura o traducción especializada
              const isEmbedding = nameLower.includes("embedding") || nameLower.includes("text-embedding");
              const isAqa = nameLower.includes("aqa");

              return canGenerate && !isEmbedding && !isAqa;
            })
            .map((m: any) => {
              const cleanId = m.name.replace(/^models\//, "");
              const { category, isRecommended } = categorizeModel(cleanId, m.displayName || "");

              return {
                id: cleanId,
                displayName: m.displayName || cleanId,
                description: m.description || `Modelo ${cleanId} con soporte para generateContent.`,
                category,
                isRecommended,
                inputTokenLimit: m.inputTokenLimit,
                outputTokenLimit: m.outputTokenLimit,
              };
            });

          if (filteredModels.length > 0) {
            // Ordenar: Recomendados primero, luego Flash, luego Pro, luego otros
            filteredModels.sort((a, b) => {
              if (a.isRecommended && !b.isRecommended) return -1;
              if (!a.isRecommended && b.isRecommended) return 1;
              if (a.category === "Flash / Rápido" && b.category !== "Flash / Rápido") return -1;
              if (a.category !== "Flash / Rápido" && b.category === "Flash / Rápido") return 1;
              return a.displayName.localeCompare(b.displayName);
            });

            // Guardar en la caché en memoria
            memoryCache.set(cacheKey, {
              timestamp: now,
              models: filteredModels,
            });

            return NextResponse.json({
              success: true,
              source: "google_live_api",
              models: filteredModels,
            });
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`Aviso: Google AI API retornó status ${response.status} al listar modelos:`, errText);
      }
    } catch (fetchErr) {
      console.warn("No se pudo contactar a Google AI API directamente, usando catálogo verificado:", fetchErr);
    }

    // 3. Si la API falla pero había caché previa (aunque esté vencida), usarla
    if (memoryCache.has(cacheKey)) {
      const stale = memoryCache.get(cacheKey)!;
      return NextResponse.json({
        success: true,
        source: "stale_memory_cache",
        models: stale.models,
      });
    }

    // 4. Fallback seguro final
    return NextResponse.json({
      success: true,
      source: "fallback_verified",
      models: VERIFIED_FALLBACK_MODELS,
    });
  } catch (error: any) {
    console.warn("Aviso al listar modelos de Gemini, retornando catálogo verificado:", error);
    return NextResponse.json({
      success: true,
      source: "fallback_error",
      models: VERIFIED_FALLBACK_MODELS,
    });
  }
}
