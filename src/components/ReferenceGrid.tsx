"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { useState, type ReactNode } from "react";

export interface GridItem {
  slug: string;
  title: string;
  category: string;
  client: string;
  services: string[];
  text: string;
  example: boolean;
  media: ReactNode;
}

const FILTERS = ["Alle", "Heizung", "Sanitär", "Klima", "Lüftung"] as const;

export function ReferenceGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alle");
  const reduce = useReduceMotion();
  const shown = items.filter((r) => filter === "Alle" || r.category.includes(filter));

  return (
    <>
      <div role="group" aria-label="Referenzen filtern" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
              filter === f ? "text-paper" : "text-navy-900 hover:bg-navy-900/5"
            }`}
          >
            {filter === f && (
              <motion.span
                layoutId="ref-filter"
                className="absolute inset-0 -z-0 rounded-full bg-navy-900"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span className="relative">{f}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} Projekte angezeigt</p>

      <motion.ul layout={!reduce} className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((r, i) => (
            <motion.li
              key={r.slug}
              layout={!reduce}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: reduce ? 0 : (i % 2) * 0.04 }}
              className={`group ${i % 2 === 1 ? "md:mt-20" : ""}`}
            >
              <Link href={`/referenzen/${r.slug}/`} className="block focus-visible:outline-offset-8">
              <article>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-900">
                  <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                    {r.media}
                  </div>
                  {r.example && (
                    <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[0.7rem] font-medium text-navy-900 backdrop-blur">
                      Demo-Projekt · Symbolbild
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  <span>{r.category}</span>
                  <span aria-hidden className="h-px w-6 bg-current opacity-40" />
                  <span>{r.client}</span>
                </div>
                <h2 className="mt-3 text-2xl font-medium tracking-tight text-navy-900 lg:text-3xl">{r.title}</h2>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">{r.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {r.services.map((s) => (
                    <li key={s} className="rounded-full border border-navy-900/12 px-3 py-1 text-xs text-navy-900/80">{s}</li>
                  ))}
                </ul>
              </article>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
