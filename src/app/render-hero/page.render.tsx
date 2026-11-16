"use client";

// Lokale Render-Seite für das Hero-Bild. Existiert nur, wenn der Dev-Server mit RENDER_HERO=1 läuft
// (siehe next.config.ts → pageExtensions). Wird nie gebaut oder veröffentlicht.
// Aufruf: /render-hero/?o=landscape&w=2400&h=1350&s=600

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const HeroRender = dynamic(() => import("@/components/house/HeroRender"), { ssr: false });
const noSub = () => () => {};

export default function RenderHeroPage() {
  const query = useSyncExternalStore(noSub, () => window.location.search, () => null);
  if (query === null) return null;
  const q = new URLSearchParams(query);
  const orientation = q.get("o") === "portrait" ? "portrait" : "landscape";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
      <HeroRender orientation={orientation} width={Number(q.get("w") || 2400)} height={Number(q.get("h") || 1350)} samples={Number(q.get("s") || 600)} denoise={Number(q.get("d") || 0)} />
    </div>
  );
}
