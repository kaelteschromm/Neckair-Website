"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { useState, type ReactNode } from "react";
import { Arrow } from "./Arrow";

export interface ExplorerItem {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  teaser: string;
  tone: "warm" | "cool";
  media: ReactNode;
}

/** Interaktive Leistungsübersicht: Hover/Fokus wechselt das große Bild rechts mit Maskenübergang. */
export function ServiceExplorer({ items }: { items: ExplorerItem[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReduceMotion();
  const current = items[active];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <ul className="lg:col-span-6">
        {items.map((item, i) => {
          const on = i === active;
          return (
            <li key={item.slug} className="border-t border-navy-900/12 last:border-b">
              <Link
                href={`/${item.slug}/`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-7 lg:items-center sm:py-9 lg:grid-cols-[4rem_1fr_auto]"
              >
                <span className={`pt-3 text-xs font-semibold tracking-[0.2em] transition-colors duration-500 lg:pt-0 ${on ? (item.tone === "warm" ? "text-ember-strong" : "text-azure-strong") : "text-muted"}`}>
                  {item.index}
                </span>
                <span>
                  <span className="flex items-baseline gap-4">
                    <span
                      className={`text-[2.2rem] font-medium leading-none tracking-tight transition-all duration-700 ease-[var(--ease-out-expo)] sm:text-5xl lg:text-6xl ${
                        on ? "translate-x-0 text-navy-900" : "text-navy-900 lg:text-navy-900/40 lg:group-hover:translate-x-2"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="display hidden text-xl italic text-muted sm:inline">{item.kicker}</span>
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)] ${
                      on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block max-w-md pt-4 text-[0.98rem] leading-relaxed text-muted">{item.teaser}</span>
                    </span>
                  </span>
                </span>
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
                    on ? "border-navy-900 bg-navy-900 text-paper" : "border-navy-900/15 text-navy-900"
                  }`}
                >
                  <Arrow />
                </span>
              </Link>
              {/* Mobil: Bild immer direkt unter dem Eintrag */}
              <Link href={`/${item.slug}/`} tabIndex={-1} aria-hidden className="relative mb-8 block aspect-[16/10] overflow-hidden rounded-sm lg:hidden">
                {item.media}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative hidden lg:col-span-6 lg:block">
        <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-sm bg-navy-900">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={current.slug}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0.4 }}
              transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
            >
              {current.media}
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent p-8 pt-24 text-paper">
            <p className="eyebrow text-paper/70">{current.kicker}</p>
            <p className="mt-3 text-2xl font-medium">{current.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
