"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Activity, CheckCircle2 } from "lucide-react";

/**
 * HeroAthleteTelemetryCard
 * 
 * Tarjeta cinemática de telemetría deportiva con video en alta definición (H.264)
 * y fotografía de respaldo poster instantánea para garantizar máxima fluidez.
 */
const VIDEO_SRC = "/videos/hero-athlete.mp4";
const POSTER_IMAGE = "/images/hero-athlete.jpg";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";

export const HeroAthleteTelemetryCard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(POSTER_IMAGE);

  // Inicialización de reproducción nativa silenciada (política estricta de navegadores)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Asignación explícita de propiedades DOM requeridas por Safari y Chrome
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsVideoPlaying(true))
        .catch(() => {
          // Autoplay silenciado diferido hasta que haya buffer listo
          setIsVideoPlaying(false);
        });
    }
  }, []);

  return (
    <div className="relative w-full max-w-md lg:max-w-none mx-auto select-none">
      {/* Resplandor ambiental exterior en verde esmeralda */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-[32px] blur-xl opacity-75 pointer-events-none" />

      {/* Contenedor principal con marco cinemático 4/5 blindado */}
      <div
        style={{ backgroundColor: "#020617" }}
        className="telemetry-card-bg rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 aspect-[4/5] relative group"
      >
        {/* Capa 1: Fotografía Poster Base de Alta Resolución (visible siempre como fondo) */}
        <img
          src={imgSrc}
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) {
              setImgSrc(FALLBACK_IMAGE);
            }
          }}
          alt="Atleta de resistencia ejecutando serie con telemetría en tiempo real"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Capa 2: Video Cinemático en Bucle Autoplay (se superpone al reproducirse) */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={() => setIsVideoPlaying(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 select-none ${
            isVideoPlaying ? "opacity-100" : "opacity-90"
          }`}
        />

        {/* Capa 3: Gradiente cinemático de protección de contraste para HUD */}
        <div
          style={{
            background:
              "linear-gradient(to top, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.4) 45%, rgba(2,6,23,0.2) 100%)",
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Barra Superior Flotante: Estado En Vivo + Branding PULSE AI */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
          {/* Badge En Vivo */}
          <div
            style={{ backgroundColor: "rgba(2, 6, 23, 0.88)" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/80 text-[11px] font-mono font-bold text-white shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide text-white">EN VIVO: SESIÓN EN RUTA</span>
          </div>

          {/* Insignia de Marca PULSE AI */}
          <div
            style={{ backgroundColor: "rgba(6, 78, 59, 0.9)" }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/50 text-[10px] font-mono font-black text-emerald-300 shadow-md"
          >
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-emerald-400/50">
              <img src="/pulse-icon.jpg" alt="PULSE" className="w-full h-full object-cover" />
            </div>
            <span className="text-emerald-300">PULSE AI™</span>
          </div>
        </div>

        {/* Tarjeta HUD Flotante (Glassmorphism de Alto Contraste en la Base) */}
        <div
          style={{ backgroundColor: "rgba(2, 6, 23, 0.94)", borderColor: "rgba(51, 65, 85, 0.85)" }}
          className="telemetry-hud-box absolute bottom-4 inset-x-4 p-4 sm:p-5 border rounded-2xl space-y-3 shadow-2xl z-20"
        >
          {/* Fila 1: Potenciómetro Stryd & Meta de Temporada */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" strokeWidth={1.75} />
              <span className="text-emerald-400">STRYD RUN POWER</span>
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
