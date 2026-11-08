"use client";

import { MotionConfig } from "motion/react";

/** Respektiert „Bewegung reduzieren“ des Betriebssystems für alle Animationen. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
