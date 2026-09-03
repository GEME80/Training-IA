"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = "login" }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, loginAsMasterAdminDemo, error: authError, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(initialTab);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null); const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLocalError(null);
      setResetSuccessMessage(null);
      setRequestSubmitted(false);
      clearError();
    }
  }, [isOpen, initialTab, clearError]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Error al conectar con Google. Por favor ingresa con correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSuccessMessage(null);

    if (!email || !email.includes("@")) {
      setLocalError("Ingresa un correo electrónico válido.");
      return;
    }

    if (activeTab === "forgot") {
      setIsSubmitting(true);
      try {
        await sendPasswordReset(email);
        setResetSuccessMessage("Enlace enviado. Revisa tu bandeja de entrada.");
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : "Error al enviar enlace");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (activeTab === "register") {
      if (!displayName.trim()) {
        setLocalError("Ingresa tu nombre y apellido para el entrenador.");
        return;
      }

      setIsSubmitting(true);
      try {
        await signUpWithEmail(email, password, displayName);
        setRequestSubmitted(true);
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : "Error al registrar solicitud");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        await signInWithEmail(email, password);
        onClose();
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : "Error al iniciar sesión");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl relative space-y-4 text-slate-900 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Pantalla de Confirmación de Solicitud de Registro */}
        {requestSubmitted ? (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Clock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">¡Solicitud Enviada con Éxito!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                Hola <strong>{displayName}</strong>, tu solicitud de registro para PULSE AI ha sido recibida y notificada a <strong>Germán Morales</strong>.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs text-left space-y-1">
              <div className="font-bold">🟡 Estado: En espera de aprobación</div>
              <p className="text-[11px] text-amber-800 leading-snug">
                El entrenador validará tu cuenta y activará tus planes. Una vez aprobada, podrás ingresar con tu correo <strong>{email}</strong> y tu contraseña.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <Sparkles className="h-3 w-3" />
                <span>PULSE AI • Smart Coach</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {activeTab === "login" && "Bienvenido a tu Plataforma"}
                {activeTab === "register" && "Solicitud de Ingreso para Atletas"}
                {activeTab === "forgot" && "Recuperar Contraseña"}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === "login" && "Ingresa para acceder a tus entrenamientos y analítica."}
                {activeTab === "register" && "Ingresa tus datos para solicitar acceso a tus planes guiados por IA."}
                {activeTab === "forgot" && "Te enviaremos un enlace seguro para restablecerla."}
              </p>
            </div>

            {/* Pestañas de Navegación */}
            {activeTab !== "forgot" && (
              <div className="flex rounded-2xl bg-slate-100/80 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setLocalError(null); clearError(); }}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${activeTab === "login" ? "bg-white text-slate-950 shadow-xs font-black" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("register"); setLocalError(null); clearError(); }}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${activeTab === "register" ? "bg-white text-emerald-700 shadow-xs font-black" : "text-slate-500 hover:text-slate-800"}`}
                >
                  ⚡ Registrarme como Atleta
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-snug">{resetSuccessMessage}</span>
              </div>
            )}

            {/* Google Auth: Disponible tanto para Iniciar Sesión como para Registro Rápido */}
            {activeTab !== "forgot" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{activeTab === "login" ? "Continuar con Google" : "Registrarme con Google"}</span>
                </button>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{activeTab === "login" ? "o con tu correo" : "o con formulario"}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {activeTab === "register" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre y Apellidos</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pedro Gómez"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="atleta@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-medium"
                  />
                </div>
              </div>

              {activeTab !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Contraseña</label>
                    {activeTab === "login" && (
                      <button
                        type="button"
                        onClick={() => { setActiveTab("forgot"); setLocalError(null); clearError(); }}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "register" && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  💡 <strong>Nota:</strong> Tu solicitud será enviada al entrenador Germán Morales para su aprobación antes de poder acceder a los planes.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Procesando...</span>
                ) : activeTab === "login" ? (
                  <>
                    <span>Entrar a mi Cuenta</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : activeTab === "register" ? (
                  <>
                    <span>🚀 Enviar Solicitud de Acceso</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <span>Enviar Enlace de Recuperación</span>
                )}
              </button>

              {/* Acceso Rápido Administrador (SOLO en pestaña Iniciar Sesión) */}
              {activeTab === "login" && (
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => { loginAsMasterAdminDemo(); onClose(); }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer py-1"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    <span>Acceso Rápido SuperAdmin (Germán Morales)</span>
                  </button>
                </div>
              )}

              {activeTab === "forgot" && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setActiveTab("login"); setLocalError(null); clearError(); }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >← Volver a Iniciar Sesión</button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
