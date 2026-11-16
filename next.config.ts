import type { NextConfig } from "next";

// Für GitHub Pages (Vorschau unter /neckair-website) wird NEXT_PUBLIC_BASE_PATH gesetzt.
// Auf der eigenen Domain bleibt er leer.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  devIndicators: false,
  // Die lokale Render-Seite für das Hero-Bild (src/app/render-hero/page.render.tsx) existiert nur mit RENDER_HERO=1
  pageExtensions: process.env.RENDER_HERO ? ["render.tsx", "tsx", "ts"] : ["tsx", "ts"],
  reactStrictMode: true,
};

export default nextConfig;
