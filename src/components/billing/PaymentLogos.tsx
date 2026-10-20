"use client";

import React from "react";

/**
 * Logotipos vectoriales oficiales (SVG) de alta definición:
 * 1. Openpay by BBVA
 * 2. PCI-DSS Certified Level 1
 * 3. Franquicias: Visa, Mastercard, American Express, PSE
 */

export const OpenpayByBbvaLogo: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
  <div className={`inline-flex items-center gap-2 select-none ${className}`}>
    {/* Ícono Oficial Openpay */}
    <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#00355E" />
      <circle cx="20" cy="20" r="14" fill="#00A9E0" />
      <path
        d="M15 16C15 13.7909 16.7909 12 19 12H22C24.7614 12 27 14.2386 27 17C27 19.7614 24.7614 22 22 22H17V28H15V16Z"
        fill="white"
      />
      <circle cx="21" cy="17" r="2.5" fill="#00355E" />
    </svg>

    {/* Tipografía Oficial Openpay by BBVA */}
    <div className="flex flex-col text-left leading-none">
      <div className="flex items-center gap-1">
        <span className="font-extrabold text-[#00355E] text-base tracking-tight font-sans">
          openpay
        </span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[10px] text-slate-500 font-medium">by</span>
        <span className="text-[11px] font-black text-[#004481] tracking-wider font-sans">
          BBVA
        </span>
      </div>
    </div>
  </div>
);

export const PciDssCertifiedBadge: React.FC<{ className?: string }> = ({ className = "h-9" }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-sm ${className}`}>
    {/* Escudo Oficial PCI */}
    <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3L5 7V15C5 21.6 9.7 27.7 16 29C22.3 27.7 27 21.6 27 15V7L16 3Z"
        fill="#0A2540"
        stroke="#00D4B2"
        strokeWidth="1.5"
      />
      <path
        d="M16 9C13.8 9 12 10.8 12 13V15H11V21H21V15H20V13C20 10.8 18.2 9 16 9ZM14 13C14 11.9 14.9 11 16 11C17.1 11 18 11.9 18 13V15H14V13Z"
        fill="#00D4B2"
      />
    </svg>
    <div className="flex flex-col text-left leading-tight">
      <span className="text-[10px] font-black tracking-widest text-[#00D4B2] uppercase font-mono">
        PCI-DSS
      </span>
      <span className="text-[9px] font-bold text-slate-200 uppercase tracking-tight">
        Certified Level 1
      </span>
    </div>
  </div>
);

export const VisaLogo: React.FC<{ className?: string }> = ({ className = "h-4" }) => (
  <svg viewBox="0 0 48 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.5 1.5L14.7 14.5H11.5L8.4 4.5C8.2 3.7 8 3.4 7.3 3C6.2 2.4 4.3 1.8 2.7 1.5L2.8 1.1H10.1C11.1 1.1 12 1.8 12.2 3L13.8 11.8L18.4 1.5H19.5ZM35.3 10.2C35.3 6.5 30.2 6.3 30.3 4.6C30.3 4.1 30.8 3.5 31.9 3.4C32.4 3.3 34 3.3 35.5 4L36.1 1.5C35.3 1.2 34.2 1 32.8 1C28.7 1 25.9 3.2 25.8 6.3C25.7 8.6 27.8 9.9 29.3 10.7C30.9 11.5 31.4 12 31.4 12.7C31.4 13.8 30.1 14.3 28.9 14.3C26.9 14.3 25.7 14 24.3 13.4L23.7 16C24.9 16.5 27 17 29.1 17C33.5 16.9 36.3 14.7 35.3 10.2ZM45.7 14.5H48.5L46 1.5H43.6C42.9 1.5 42.4 1.9 42.1 2.5L36 14.5H39.4L40.1 12.5H44.3L45.7 14.5ZM41 10.1L42.8 5.2L43.9 10.1H41ZM25.2 1.5L22.6 14.5H19.5L22.1 1.5H25.2Z"
      fill="#1434CB"
    />
  </svg>
);

export const MastercardLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 38 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="12" r="11" fill="#EB001B" />
    <circle cx="25" cy="12" r="11" fill="#F79E1B" fillOpacity="0.9" />
    <path
      d="M19 4.8C21.4 6.7 22.8 9.3 22.8 12C22.8 14.7 21.4 17.3 19 19.2C16.6 17.3 15.2 14.7 15.2 12C15.2 9.3 16.6 6.7 19 4.8Z"
      fill="#FF5F00"
    />
  </svg>
);

export const AmexLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`px-1.5 py-0.5 rounded bg-[#002663] text-white font-black text-[9px] font-sans tracking-tight inline-flex items-center justify-center ${className}`}>
    AMEX
  </div>
);

export const PseLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`px-2 py-0.5 rounded-full bg-[#004A87] text-white font-bold text-[9px] font-sans tracking-wider inline-flex items-center gap-1 ${className}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
    <span>PSE</span>
  </div>
);
