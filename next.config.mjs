import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@grpc/grpc-js",
    "protobufjs",
    "google-gax",
  ],
  transpilePackages: [
    "firebase",
    "@firebase/app",
    "@firebase/auth",
    "@firebase/firestore",
    "@firebase/util",
    "@firebase/component",
  ],
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/",
      },
      {
        source: "/__/auth/:path*",
        destination: "https://training-ia-8f67f.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|favicon.ico|__/auth).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
