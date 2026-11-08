"use client";

import { motion } from "motion/react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { useEffect } from "react";

// Beim allerersten Seitenaufruf keinen Übergang zeigen (schnelles Laden, kein Flackern).
let hasNavigated = false;

/** Seitenübergang bei Navigation: ein marineblauer Vorhang zieht nach oben weg, der Inhalt blendet weich ein. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReduceMotion();
  const animate = hasNavigated && !reduce;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <>
      {animate && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] bg-navy-950"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: [0.77, 0, 0.18, 1], delay: 0.05 }}
        />
      )}
      <motion.div
        initial={animate ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
