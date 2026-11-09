"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";

// Kurven der Motion-Sprache (siehe globals.css): --ease-out und --ease-in-out
export const EASE = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * Bildmaske: Ein Bild wird beim ersten Erscheinen über eine Clip-Maske aufgedeckt (Rezept „Scroll reveal“).
 * Nur für große Bilder auf Marketingflächen, einmalig. Reduzierte Bewegung: sofort sichtbar.
 */
export function MaskReveal({
  children,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left";
}) {
  const reduce = useReduceMotion();
  const from = direction === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";
  return (
    <motion.div
      data-reveal
      className={`relative overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: from }}
      {...(reduce ? { animate: { clipPath: "inset(0% 0% 0% 0%)" } } : { whileInView: { clipPath: "inset(0% 0% 0% 0%)" } })}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_IN_OUT }}
    >
      {children}
    </motion.div>
  );
}
