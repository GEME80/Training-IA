"use client";

import React, { useState } from "react";
import { Zap, Activity, CheckCircle2 } from "lucide-react";

/**
 * HeroAthleteTelemetryCard
 * 
 * Tarjeta cinemática de telemetría deportiva con soporte para VIDEO o FOTOGRAFÍA en alta definición.
 * 
 * 🎬 CÓMO CARGAR TU VIDEO:
 * 1. Guarda tu video en formato .mp4 (preferiblemente optimizado en H.264 o WebM) en:
 *    public/videos/hero-athlete.mp4
 * 2. O cambia la constante VIDEO_SRC por una URL de tu CDN o almacenamiento externo.
 * 
 * Si no hay video o tarda en cargar, el sistema muestra automáticamente la fotografía
 * poster (/images/hero-athlete.jpg) garantizando cero cuadros vacíos.
 */
const VIDEO_SRC = "/videos/hero-athlete.mp4";
const POSTER_IMAGE = "/images/hero-athlete.jpg";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";

export const HeroAthleteTelemetryCard: React.FC = () => {
  const [useVideo, setUseVideo] = useState<boolean>(true);
  const [imgSrc, setImgSrc] = useState<string>(POSTER_IMAGE);

  return (
    <div className="relative w-full max-w-md lg:max-w-none mx-auto select-none">
      {/* Resplandor ambiental exterior en verde esmeralda */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-[32px] blur-xl opacity-75 pointer-events-none" />

      {/* Contenedor principal con marco cinemático 4/5 */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 aspect-[4/5] bg-slate-950 relative group">
        {/* Reproductor de Video Cinemático en Bucle Autoplay Muted */}
        {useVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={POSTER_IMAGE}
            onError={() => setUseVideo(false)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
            <source src="/videos/hero-athlete.webm" type="video/webm" />
          </video>
        ) : (
          /* Fotografía de Alta Resolución (Fallback si el video no existe o da error) */
          <img
            src={imgSrc}
            onError={() => {
              if (imgSrc !== FALLBACK_IMAGE) {
                setImgSrc(FALLBACK_IMAGE);
              }
            }}
            alt="Atleta de resistencia ejecutando serie con telemetría en tiempo real"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none"
          />
        )}

        {/* Gradiente cinematográfico de protección de contraste para HUD */}
        <div className="bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 absolute inset-0 pointer-events-none" />

        {/* Barra Superior Flotante: Estado En Vivo + Branding PULSE AI */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
          {/* Badge En Vivo */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/70 text-[11px] font-mono font-bold text-white shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">EN VIVO: SESIÓN EN RUTA</span>
          </div>

          {/* Insignia de Marca PULSE AI */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono font-black text-emerald-300 shadow-md">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-emerald-400/50">
              <img src="/pulse-icon.jpg" alt="PULSE" className="w-full h-full object-cover" />
            </div>
            <span>PULSE AI™</span>
          </div>
        </div>

        {/* Tarjeta HUD Flotante (Glassmorphism de Alto Contraste en la Base) */}
        <div className="absolute bottom-4 inset-x-4 p-4 sm:p-5 bg-slate-950/92 backdrop-blur-md border border-slate-700/80 rounded-2xl text-white space-y-3 shadow-2xl z-20">
          {/* Fila 1: Potenciómetro Stryd & Meta de Temporada */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" strokeWidth={1.75} />
              <span>STRYD RUN POWER</span>
            </div>
            <span className="text-slate-300">Meta: Maratón Tokio 2027</span>
          </div>

          {/* Fila 2: Métricas en Tiempo Real (Potencia, Ritmo y HRV) */}
          <div className="grid grid-cols-3 gap-2 items-baseline text-left">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Potencia</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                336 <span className="text-xs font-normal text-slate-300">W</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Ritmo Stryd</div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                3:45 <span className="text-[10px] font-normal text-slate-400">/km</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estado HRV</div>
              <div className="text-xs sm:text-sm font-bold font-mono text-cyan-400 flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400" strokeWidth={1.75} />
                <span>+12 TSB</span>
              </div>
            </div>
          </div>

          {/* Fila 3: Sincronización de Dispositivo y Bloque de Canova */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
              <span>Sincronizado con Garmin</span>
            </span>
            <span className="text-slate-300 font-medium">1h 45m Canova Z4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
