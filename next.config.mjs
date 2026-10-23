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
    const immutableCacheHeader = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/_next/static/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/_next/image/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/videos/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/showcase/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/coaches/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/images/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/brands/:path*",
        headers: immutableCacheHeader,
      },
      {
        source: "/((?!_next/static|_next/image|videos|showcase|coaches|images|brands|favicon.ico|icon.svg|pulse-.*|__/auth).*)",
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
