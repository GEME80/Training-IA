"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Openpay?: any;
  }
}

interface GmcCardCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberId: string;
  athleteName: string;
  athleteEmail: string;
  planName?: string;
  planAmountCop?: number;
  trialDays?: number;
  onSuccess?: (details: any) => void;
}

export const GmcCardCheckoutModal: React.FC<GmcCardCheckoutModalProps> = ({
  isOpen,
  onClose,
  subscriberId,
  athleteName,
  athleteEmail,
  planName = "Plan Atleta Pro",
  planAmountCop = 99000,
  trialDays = 7,
  onSuccess,
}) => {
  const [holderName, setHolderName] = useState(athleteName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [deviceSessionId, setDeviceSessionId] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const merchantId = process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY || "";
  const isSandbox = (process.env.NEXT_PUBLIC_OPENPAY_SANDBOX_MODE || "true").toLowerCase() === "true";

  // Calcular la fecha exacta del primer cobro tras los días gratis
  const firstChargeDate = new Date();
  firstChargeDate.setDate(firstChargeDate.getDate() + trialDays);
  const formattedChargeDate = firstChargeDate.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Carga dinámica y asíncrona de las librerías oficiales de Openpay BBVA
  useEffect(() => {
    if (!isOpen) return;

    const loadScripts = async () => {
      try {
        if (!window.Openpay) {
          const script1 = document.createElement("script");
          script1.src = "https://js.openpay.co/openpay.v1.min.js";
          script1.async = true;
          document.body.appendChild(script1);

          await new Promise((res) => {
            script1.onload = res;
          });

          const script2 = document.createElement("script");
          script2.src = "https://js.openpay.co/openpay-data.v1.min.js";
          script2.async = true;
          document.body.appendChild(script2);

          await new Promise((res) => {
            script2.onload = res;
          });
        }

        if (window.Openpay && merchantId && publicKey) {
          window.Openpay.setId(merchantId);
          window.Openpay.setApiKey(publicKey);
          window.Openpay.setSandboxMode(isSandbox);

          const devId = window.Openpay.deviceData?.setup("gmc-card-form", "deviceIdHidden");
          setDeviceSessionId(devId || `dev_${Date.now()}`);
          setSdkLoaded(true);
        } else {
          // Fallback en modo desarrollo si las llaves no están configuradas
          setDeviceSessionId(`dev_mock_${Date.now()}`);
          setSdkLoaded(true);
        }
      } catch (err) {
        console.warn("[GMC_OPENPAY_LOAD_WARN] Error cargando scripts de Openpay:", err);
        setDeviceSessionId(`dev_fallback_${Date.now()}`);
        setSdkLoaded(true);
      }
    };

    loadScripts();
  }, [isOpen, merchantId, publicKey, isSandbox]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Validación básica local
      const cleanNumber = cardNumber.replace(/\s+/g, "");
      if (cleanNumber.length < 15 || cleanNumber.length > 16) {
        throw new Error("Por favor ingresa un número de tarjeta válido (15 o 16 dígitos).");
      }
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        throw new Error("Ingresa la fecha de expiración en formato MM y AA.");
      }
      if (!cvv || cvv.length < 3 || cvv.length > 4) {
        throw new Error("Ingresa el código de seguridad CVV (3 o 4 dígitos).");
      }

      // 1. Tokenización segura con Openpay.js en el navegador (Zero Server PAN)
      if (window.Openpay && window.Openpay.token) {
        window.Openpay.token.create(
          {
            card_number: cleanNumber,
            holder_name: holderName,
            expiration_year: expYear,
            expiration_month: expMonth,
            cvv2: cvv,
          },
          async (response: any) => {
            const tokenId = response.data.id;
            await sendSubscriptionRequest(tokenId);
          },
          (error: any) => {
            setLoading(false);
            const desc = error?.data?.description || error?.message || "La tarjeta fue rechazada por el banco emisor.";
            setErrorMessage(desc);
          }
        );
      } else {
        // Modo Mock/Sandbox para pruebas sin SDK externo cargado
        const mockToken = `tok_test_${Date.now()}`;
        await sendSubscriptionRequest(mockToken);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Error procesando el registro de la tarjeta.");
    }
  };

  const sendSubscriptionRequest = async (tokenId: string) => {
    try {
      const res = await fetch("/api/billing/openpay/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId,
          name: holderName,
          email: athleteEmail,
          planCode: "PULSE_PRO_MONTHLY",
          tokenId,
          deviceSessionId: deviceSessionId || `dev_${Date.now()}`,
          trialDays,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo completar el registro de suscripción.");
      }

      setSuccessMessage(data.message);
      setLoading(false);

      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Error comunicando con el servidor de pagos.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-900 space-y-5">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{trialDays > 0 ? `${trialDays} Días de Prueba Gratis` : "Activar Suscripción"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                  Openpay BBVA
                </span>
              </h3>
              <p className="text-xs text-slate-500">Módulo de pagos seguros de German Morales Consulting</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notificación de Éxito */}
        {successMessage ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">¡Tarjeta Registrada con Éxito!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">{successMessage}</p>
          </div>
        ) : (
          <form id="gmc-card-form" onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" id="deviceIdHidden" name="deviceIdHidden" />

            {/* Banner Informativo Transparente (Estilo Netflix) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{planName}</span>
                <span className="font-mono text-emerald-700">${planAmountCop.toLocaleString("es-CO")} COP / mes</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {trialDays > 0 ? (
                  <>
                    💳 <strong>Cobro de hoy: $0 COP.</strong> Tu tarjeta será validada pero no debitada. Tu primer cobro automático se realizará el <strong>{formattedChargeDate}</strong> a menos que canceles antes desde tu perfil con 1 solo clic.
                  </>
                ) : (
                  <>
                    💳 <strong>Cobro de hoy: ${planAmountCop.toLocaleString("es-CO")} COP.</strong> Tu suscripción se activará de inmediato con cobro mensual recurrente. Cancela cuando quieras desde tu perfil.
                  </>
                )}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Campos del Formulario (SAQ-A: SIN atributo name para blindaje PCI) */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre en la Tarjeta
                </label>
                <input
                  type="text"
                  required
                  placeholder="GERMAN MORALES"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Número de Tarjeta (Débito o Crédito)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                      setCardNumber(val);
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <Lock className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mes (MM)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="12"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Año (AA)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="28"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Insignia de Seguridad PCI-DSS */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium py-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Conexión cifrada de 256 bits directa con BBVA Openpay</span>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando con el Banco...</span>
                </>
              ) : (
                <span>
                  {trialDays > 0
                    ? `Comenzar mis ${trialDays} Días de Prueba Gratis ($0 COP)`
                    : `Pagar y Activar Suscripción ($${planAmountCop.toLocaleString("es-CO")} COP)`}
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
