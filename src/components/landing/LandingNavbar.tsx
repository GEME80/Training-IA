"use client";

import React, { useState } from "react";
import { Menu, X, ArrowRight, LayoutDashboard, Shield, LogOut, Sparkles } from "lucide-react";
import { PulseLogo } from "@/components/PulseLogo";

interface LandingNavbarProps {
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  onGoToDashboard?: () => void;
  onGoToAdmin?: () => void;
  onSignOut?: () => void;
}

const NAV_LINKS = [
  { label: "Metodología & Coaches", href: "#metodologia" },
  { label: "La App en Vivo", href: "#showcase" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
];

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  isAuthenticated,
  userEmail,
  userName,
  photoURL,
  isAdmin = false,
  onOpenAuthModal,
  onGoToDashboard,
  onGoToAdmin,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const displayName = userName || "Atleta";

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-colors backdrop-blur-xl border-b border-slate-200/80 bg-white/90 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 sm:px-6">
        {/* 1. Izquierda: Logo */}
        <div className="flex items-center shrink-0">
          <a href="#" className="flex items-center gap-2 cursor-pointer focus:outline-hidden">
            <PulseLogo size="md" showSubtext={true} />
          </a>
        </div>

        {/* 2. Centro: Los 4 destinos clave (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="hover:text-emerald-700 transition cursor-pointer text-slate-600 font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* 3. Derecha: Autenticación & CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => onOpenAuthModal?.("login")}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-2 cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal?.("register")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <span>Probar Gratis (7 Días)</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              {onGoToDashboard && (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                  <span>Mi Dashboard</span>
                </button>
              )}

              {isAdmin && onGoToAdmin && (
                <button
                  type="button"
                  onClick={onGoToAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Shield className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                  <span>Admin</span>
                </button>
              )}

              {/* Avatar y menú desplegable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl transition cursor-pointer shadow-xs bg-white border border-slate-200 hover:bg-slate-50"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="h-6 w-6 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-[11px] flex items-center justify-center">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {displayName}
                  </span>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                      <div className="p-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">{displayName}</div>
                        {userEmail && (
                          <div className="text-[10px] text-slate-500 font-mono truncate">{userEmail}</div>
                        )}
                      </div>
                      <div className="py-1">
                        {onGoToDashboard && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onGoToDashboard();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                            <span>Dashboard Atleta</span>
                          </button>
                        )}
                        {isAdmin && onGoToAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onGoToAdmin();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-purple-700 hover:bg-purple-50 font-medium transition cursor-pointer"
                          >
                            <Shield className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                            <span>Consola Admin</span>
                          </button>
                        )}
                        {onSignOut && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onSignOut();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium transition cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                            <span>Cerrar Sesión</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Botón Móvil Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-800" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5 text-slate-800" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* 5. Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col space-y-2">
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.("login");
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.("register");
                  }}
                  className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Probar Gratis (7 Días)</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <div className="space-y-2">
                {onGoToDashboard && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGoToDashboard();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                    <span>Mi Dashboard</span>
                  </button>
                )}
                {isAdmin && onGoToAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGoToAdmin();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Shield className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                    <span>Panel Admin</span>
                  </button>
                )}
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
