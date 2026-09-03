import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PULSE AI — Smart Coach",
    short_name: "PULSE AI",
    description: "Entrenamiento adaptativo de resistencia impulsado por IA con telemetría en vivo.",
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
