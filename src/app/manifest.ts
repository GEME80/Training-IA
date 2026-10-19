import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PULSE ENDURANCE — Smart Performance Coach",
    short_name: "PULSE ENDURANCE",
    description: "Periodización y entrenamiento adaptativo de resistencia para Carrera, Ciclismo y Triatlón.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#10b981",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/pulse-icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/pulse-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
