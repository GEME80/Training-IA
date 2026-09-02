import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ClientAutoRecovery } from "@/components/ClientAutoRecovery";

export const metadata: Metadata = {
  title: "PULSE AI — Smart Endurance & Performance Coach",
  description:
    "Plataforma inteligente y adaptativa de entrenamiento deportivo de resistencia impulsada por IA, integrada con Intervals.icu, Stryd y Garmin.",
  icons: {
    icon: "/icon.svg",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('error', function(e) {
                  var target = e.target;
                  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                    var src = target.src || target.href || '';
                    if (src.indexOf('/_next/') !== -1) {
                      var now = Date.now();
                      var last = Number(sessionStorage.getItem('pulse_404_reload') || 0);
                      if (now - last > 4000) {
                        sessionStorage.setItem('pulse_404_reload', String(now));
                        try {
                          if (document.cookie && document.cookie.length > 4096) {
                            var cookies = document.cookie.split(';');
                            for (var i = 0; i < cookies.length; i++) {
                              var eq = cookies[i].indexOf('=');
                              var name = eq > -1 ? cookies[i].substr(0, eq).trim() : cookies[i].trim();
                              document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                            }
                          }
                        } catch(err) {}
                        var targetUrl = new URL(window.location.href);
                        targetUrl.searchParams.set('_v', String(now));
                        window.location.replace(targetUrl.toString());
                      }
                    }
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-black"
      >
        <ClientAutoRecovery />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
