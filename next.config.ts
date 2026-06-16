import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone server only for self-hosting (Docker/VPS). On Vercel the
  // platform provides its own output, so skip it there.
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Object storage for product originals (Selectel / MinIO).
      { protocol: "https", hostname: "**.selstorage.ru" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
      // Source images during migration.
      { protocol: "https", hostname: "santehgryp.ru" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
