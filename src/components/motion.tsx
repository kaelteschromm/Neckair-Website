"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { useRef, type ReactNode, type ElementType } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Sanftes Einblenden beim Scrollen. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "p" | "span";
}) {
  const reduce = useReduceMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      data-reveal
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      {...(reduce ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 } })}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Überschrift, deren Zeilen/Wörter aus einer Maske nach oben gleiten. */
export function SplitHeading({
  lines,
  as: Tag = "h2",
  className,
  italicLast = false,
  delay = 0,
  immediate = false,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  italicLast?: boolean;
  delay?: number;
  immediate?: boolean;
}) {
  const reduce = useReduceMotion();
  let i = 0;
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((word, wi) => {
            const d = delay + i++ * 0.06;
            const italic = italicLast && li === lines.length - 1;
            return (
              <span key={wi} className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
                <motion.span
                  data-reveal
                  className={`inline-block ${italic ? "display italic" : ""}`}
                  initial={reduce ? false : { y: "110%" }}
                  {...(immediate || reduce ? { animate: { y: "0%" } } : { whileInView: { y: "0%" } })}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={reduce ? { duration: 0 } : { duration: 1.2, ease: EASE, delay: d }}
                >
                  {word}
                  {wi < line.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/** Bild wird beim Eintritt über eine Clip-Maske aufgedeckt und zoomt leicht zurück. */
export function MaskReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}) {
  const reduce = useReduceMotion();
  const from = {
    up: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[direction];
  return (
    <motion.div
      data-reveal
      className={`relative overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: from }}
      {...(reduce ? { animate: { clipPath: "inset(0% 0% 0% 0%)" } } : { whileInView: { clipPath: "inset(0% 0% 0% 0%)" } })}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 1.4, ease: [0.77, 0, 0.18, 1], delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { scale: 1.18 }}
        {...(reduce ? { animate: { scale: 1 } } : { whileInView: { scale: 1 } })}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={reduce ? { duration: 0 } : { duration: 1.8, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Leichter Parallax-Effekt für Bilder innerhalb eines Rahmens. */
export function Parallax({
  children,
  className = "",
  amount = 10,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-x-0"
        style={{ y: reduce ? 0 : y, top: `-${amount}%`, bottom: `-${amount}%` }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

/** Großer Statement-Text, der sich Wort für Wort beim Scrollen „füllt“. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

/** Linie, die sich beim Scrollen zeichnet. */
export function DrawLine({ className = "" }: { className?: string }) {
  const reduce = useReduceMotion();
  return (
    <motion.div
      aria-hidden
      className={`origin-left ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      {...(reduce ? { animate: { scaleX: 1 } } : { whileInView: { scaleX: 1 } })}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 1.6, ease: EASE }}
    />
  );
}
