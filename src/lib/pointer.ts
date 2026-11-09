"use client";

/**
 * Ein gemeinsamer Zeiger-Listener für alle Szenen (react-best-practices: client-event-listeners).
 * Liefert die Position normiert auf den Viewport (−1 … 1). Auf Touch-Geräten bleibt er bei 0.
 */
export const pointer = { x: 0, y: 0 };
let installed = false;

export function ensurePointerTracking() {
  if (installed || typeof window === "undefined") return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  installed = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
}
