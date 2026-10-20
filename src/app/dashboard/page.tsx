"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    router.replace(q ? `/?${q}` : "/");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      <span className="text-xs font-mono font-bold text-emerald-700">
        PULSE ENDURANCE • Redirigiendo a tu panel...
      </span>
    </div>
  );
}

export default function DashboardRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono font-bold text-emerald-700">
            PULSE ENDURANCE • Cargando...
          </span>
        </div>
      }
    >
      <DashboardRedirectContent />
    </Suspense>
  );
}
