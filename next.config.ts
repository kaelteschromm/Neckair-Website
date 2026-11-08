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
  reactStrictMode: true,
};

export default nextConfig;
