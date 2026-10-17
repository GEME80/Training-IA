"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, Activity, CheckCircle2, Waves, Flame } from "lucide-react";

/**
 * HeroAthleteTelemetryCard
 * 
 * Tarjeta cinemática de telemetría deportiva con video cristalino de alta definición
 * y motor multideporte sincronizado en tiempo real con la disciplina en pantalla.
 */
const VIDEO_SRC = "/videos/hero-athlete.mp4";

interface SportTelemetry {
  id: string;
  sportLabel: string;
  badgeLabel: string;
  badgeIcon: React.ElementType;
  primaryValue: string;
  primaryUnit: string;
  primaryLabel: string;
  secondaryValue: string;
  secondaryUnit: string;
  secondaryLabel: string;
  tertiaryValue: string;
  tertiaryLabel: string;
  sessionGoal: string;
  sessionRule: string;
}

const SPORTS_TELEMETRY: SportTelemetry[] = [
  {
    id: "swim",
    sportLabel: "Triatlón & Natación",
    badgeLabel: "TRIATLÓN · RITMO CSS & AGUAS ABIERTAS",
    badgeIcon: Waves,
    primaryValue: "1:22",
    primaryUnit: "/100m",
    primaryLabel: "Ritmo Umbral (CSS)",
    secondaryValue: "32",
    secondaryUnit: "br/min",
    secondaryLabel: "SWOLF (Eficiencia de Brazada)",
    tertiaryValue: "+12 TSB",
    tertiaryLabel: "Frescura Modelada",
    sessionGoal: "Meta: Triatlón Sprint, 70.3 e Ironman",
    sessionRule: "3.200m Fraccionados a Ritmo Objetivo",
  },
  {
    id: "bike",
    sportLabel: "Ciclismo",
    badgeLabel: "CICLISMO · POTENCIA FTP (Umbral en Vatios)",
    badgeIcon: Zap,
    primaryValue: "285",
    primaryUnit: "W NP",
    primaryLabel: "Potencia Normalizada (NP)",
    secondaryValue: "92",
    secondaryUnit: "rpm",
    secondaryLabel: "Cadencia (Pedaleo Óptimo)",
    tertiaryValue: "+12 TSB",
    tertiaryLabel: "Frescura Modelada",
    sessionGoal: "Meta: Gran Fondo 160K",
    sessionRule: "2h 30m Ritmo Controlado (Zona 4)",
  },
  {
    id: "run",
    sportLabel: "Carrera",
    badgeLabel: "CARRERA · RITMOS VDOT & POTENCIA",
    badgeIcon: Flame,
    primaryValue: "336",
    primaryUnit: "W",
    primaryLabel: "Potencia de Carrera (Vatios)",
    secondaryValue: "3:45",
    secondaryUnit: "/km",
    secondaryLabel: "Ritmo Objetivo (Fórmula VDOT)",
    tertiaryValue: "+12 TSB",
    tertiaryLabel: "Frescura Modelada",
    sessionGoal: "Meta: Maratón Tokio 2027",
    sessionRule: "1h 45m Bloques a Ritmo de Carrera",
  },
];

export interface HeroAthleteTelemetryCardProps {
  activeSportIdx?: number;
  onSportChange?: (idx: number) => void;
  seekRequest?: { idx: number; timestamp: number } | null;
}

export const HeroAthleteTelemetryCard: React.FC<HeroAthleteTelemetryCardProps> = ({
  activeSportIdx: controlledSportIdx,
  onSportChange,
  seekRequest,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [internalSportIdx, setInternalSportIdx] = useState<number>(0);

  const activeSportIdx = controlledSportIdx !== undefined ? controlledSportIdx : internalSportIdx;

  // Reaccionar a solicitudes de salto manual enviadas desde HeroSection
  useEffect(() => {
    if (!seekRequest) return;
    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      const segment = video.duration / 3;
      video.currentTime = seekRequest.idx * segment + 0.05;
    }
    setInternalSportIdx(seekRequest.idx);
  }, [seekRequest]);

  // Sincronización en tiempo real con el segundo exacto del video (Triatlón 10s: Natación -> Ciclismo -> Carrera)
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    const t = video.currentTime;
    const dur = video.duration;
    const segment = dur / 3;

    let targetIdx = 0;
    if (t < segment) {
      targetIdx = 0; // Triatlón / Natación (0.0s - 3.33s)
    } else if (t < segment * 2) {
      targetIdx = 1; // Ciclismo (3.33s - 6.66s)
    } else {
      targetIdx = 2; // Carrera (6.66s - 10.0s)
    }

    if (targetIdx !== activeSportIdx) {
      setInternalSportIdx(targetIdx);
      onSportChange?.(targetIdx);
    }
  };

  // Salto manual inmediato en el video al pulsar un chip de disciplina dentro del HUD
  const handleSelectSport = (idx: number) => {
    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      const segment = video.duration / 3;
      video.currentTime = idx * segment + 0.05;
    }
    setInternalSportIdx(idx);
    onSportChange?.(idx);
  };

  // Inicialización de video nativo con autoplay silenciado
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
        .catch(() => setIsVideoPlaying(false));
    }
  }, []);

  // Fallback de rotación automática únicamente si el video no pudiese reproducirse
  useEffect(() => {
    if (isVideoPlaying) return;
    const timer = setInterval(() => {
      setInternalSportIdx((prev) => {
        const next = (prev + 1) % SPORTS_TELEMETRY.length;
        onSportChange?.(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isVideoPlaying, onSportChange]);

  const currentSport = SPORTS_TELEMETRY[activeSportIdx];
  const BadgeIcon = currentSport.badgeIcon;

  return (
    <div className="relative w-full max-w-md lg:max-w-none mx-auto select-none">
      {/* Resplandor ambiental exterior en verde esmeralda */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-[32px] blur-xl opacity-75 pointer-events-none" />

      {/* Contenedor principal con marco cinemático 4/5 */}
      <div
        style={{ backgroundColor: "#020617" }}
        className="telemetry-card-bg rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 aspect-[4/5] relative group"
      >
        {/* Video Cinemático NÍTIDO sin filtro velado ni imágenes estáticas intermedias */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlaying={() => setIsVideoPlaying(true)}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 select-none opacity-100"
        />

        {/* Capa 3A: Gradiente sutil SUPERIOR para contraste de píldoras (centro 100% limpio) */}
        <div
          style={{
            background:
              "linear-gradient(to bottom, rgba(2,6,23,0.65) 0%, rgba(2,6,23,0.2) 15%, transparent 28%)",
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Capa 3B: Gradiente sutil INFERIOR para contraste de la tarjeta HUD (centro 100% limpio) */}
        <div
          style={{
            background:
              "linear-gradient(to top, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.4) 25%, transparent 45%)",
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

        {/* Tarjeta HUD Flotante Multideporte (Glassmorphism de Alto Contraste) */}
        <div
          style={{ backgroundColor: "rgba(2, 6, 23, 0.92)", borderColor: "rgba(51, 65, 85, 0.85)" }}
          className="telemetry-hud-box absolute bottom-4 inset-x-4 p-4 sm:p-5 border rounded-2xl space-y-3 shadow-2xl z-20 backdrop-blur-md"
        >
          {/* Fila 1: Selector / Título Multideporte y Meta */}
          <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold transition-all">
              <BadgeIcon className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" strokeWidth={1.75} />
              <span className="tracking-tight">{currentSport.badgeLabel}</span>
            </div>

            {/* Chips de Selección Rápida de Deporte */}
            <div className="flex items-center gap-1">
              {SPORTS_TELEMETRY.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSport(idx)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    activeSportIdx === idx
                      ? "bg-emerald-500 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={`Ver telemetría y video de ${s.sportLabel}`}
                >
                  {s.sportLabel.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Métricas Dinámicas del Deporte Activo con Etiquetas Claras */}
          <div key={currentSport.id} className="grid grid-cols-3 gap-2 items-baseline text-left animate-fadeIn">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                {currentSport.primaryLabel}
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                {currentSport.primaryValue}{" "}
                <span className="text-xs font-normal text-slate-300">
                  {currentSport.primaryUnit}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                {currentSport.secondaryLabel}
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-white">
                {currentSport.secondaryValue}{" "}
                <span className="text-[10px] font-normal text-slate-400">
                  {currentSport.secondaryUnit}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                {currentSport.tertiaryLabel}
              </div>
              <div className="text-xs sm:text-sm font-bold font-mono text-cyan-400 flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyan-400" strokeWidth={1.75} />
                <span>{currentSport.tertiaryValue}</span>
              </div>
            </div>
          </div>

          {/* Fila 3: Sincronización Universal y Prescripción de Sesión */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
              <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span>Compatible con Cualquier Reloj o Sensor</span>
            </span>
            <span className="text-slate-300 font-medium truncate ml-2">
              {currentSport.sessionRule}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
