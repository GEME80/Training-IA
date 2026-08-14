import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGEA - Head Coach Fisiológico Digital",
  description:
    "Plataforma inteligente y adaptativa de entrenamiento deportivo integrada con Intervals.icu, Stryd y Garmin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
