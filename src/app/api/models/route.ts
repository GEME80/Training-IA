import { NextRequest, NextResponse } from "next/server";

export interface AvailableModel {
  id: string; // e.g. "gemini-2.5-flash"
  displayName: string;
  description: string;
  isRecommended: boolean;
  tier: "flash" | "pro" | "standard";
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const customKey = url.searchParams.get("apiKey");
    const apiKey = customKey || process.env.GEMINI_API_KEY || "";

    const fallbackModels: AvailableModel[] = [
      {
        id: "gemini-2.5-flash",
        displayName: "Gemini 2.5 Flash",
        description: "Última generación Google. Ultrarrápido, altamente eficiente y de costo mínimo.",
        isRecommended: true,
        tier: "flash",
      },
      {
        id: "gemini-2.0-flash",
        displayName: "Gemini 2.0 Flash",
        description: "Modelo multimodal Flash de alta velocidad y baja latencia.",
        isRecommended: false,
        tier: "flash",
      },
      {
        id: "gemini-2.5-pro",
        displayName: "Gemini 2.5 Pro",
        description: "Razonamiento fisiológico profundo para macrociclos y picos de forma.",
        isRecommended: false,
        tier: "pro",
      },
      {
        id: "gemini-1.5-flash",
        displayName: "Gemini 1.5 Flash (Legacy)",
        description: "Modelo estándar de generación anterior.",
        isRecommended: false,
        tier: "standard",
      },
    ];

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: "fallback",
        models: fallbackModels,
      });
    }

    // Consultar dinámicamente el catálogo de modelos disponibles en Google AI API
    try {
      const googleRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.models && Array.isArray(data.models)) {
          const fetchedModels: AvailableModel[] = data.models
            .filter((m: any) =>
              m.supportedGenerationMethods?.includes("generateContent") &&
              m.name?.toLowerCase().includes("gemini")
            )
            .map((m: any) => {
              const cleanId = m.name.replace(/^models\//, "");
              const isFlash = cleanId.includes("flash");
              const isPro = cleanId.includes("pro");
              const isLatest = cleanId.includes("2.5") || cleanId.includes("2.0");

              return {
                id: cleanId,
                displayName: m.displayName || cleanId,
                description: m.description || "",
                isRecommended: cleanId === "gemini-2.5-flash" || (isFlash && isLatest),
                tier: isFlash ? "flash" : isPro ? "pro" : "standard",
              };
            });

          if (fetchedModels.length > 0) {
            // Ordenar: recomendados primero, luego flash, luego pro
            fetchedModels.sort((a, b) => {
              if (a.isRecommended && !b.isRecommended) return -1;
              if (!a.isRecommended && b.isRecommended) return 1;
              if (a.tier === "flash" && b.tier !== "flash") return -1;
              return 0;
            });

            return NextResponse.json({
              success: true,
              source: "live_google_api",
              models: fetchedModels,
            });
          }
        }
      }
    } catch (apiErr) {
      console.warn("No se pudo consultar la API en vivo de Google, usando catálogo verificado:", apiErr);
    }

    return NextResponse.json({
      success: true,
      source: "fallback_verified",
      models: fallbackModels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener modelos" },
      { status: 500 }
    );
  }
}
