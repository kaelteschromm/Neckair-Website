"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import type { ServiceSlug } from "@/content/services";

export interface GridItem {
  slug: string;
  title: string;
  type: string;
  trades: ServiceSlug[];
  summary: string;
  example: boolean;
  media: ReactNode;
}

const FILTERS: { id: "alle" | ServiceSlug; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "heizung", label: "Heizung" },
  { id: "sanitaer", label: "Sanitär & Trinkwasser" },
  { id: "klima", label: "Klima & Kälte" },
];

/** Projektgalerie mit Filter. Filterwechsel = Zustandswechsel: 250 ms, --ease-out, Layout gleitet nach. */
export function ReferenceGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("alle");
  const reduce = useReduceMotion();
  const shown = items.filter((r) => filter === "alle" || r.trades.includes(filter));

  return (
    <>
      <div role="group" aria-label="Projekte filtern" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`press border px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,color] duration-200 ${
              filter === f.id ? "border-navy bg-navy text-white" : "border-navy/25 text-navy hover:border-navy"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} Projekte angezeigt</p>

      <motion.ul layout={!reduce} className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((r, i) => (
            <motion.li
              key={r.slug}
              layout={!reduce}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className={i % 2 === 1 ? "md:mt-24" : ""}
            >
              <Link href={`/referenzen/${r.slug}/`} className="group block">
                <div className="plan-frame relative aspect-[4/3] overflow-hidden text-navy/40">
                  <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]">{r.media}</div>
                  {r.example ? <span className="absolute left-3 top-3 bg-white px-2 py-1 text-xs font-semibold text-navy">Demo-Projekt, Symbolbild</span> : null}
                </div>
                <p className="mt-6 text-sm text-muted">{r.type}</p>
                <h2 className="mt-1 text-2xl text-navy lg:text-3xl">{r.title}</h2>
                <p className="measure mt-3 leading-relaxed text-muted">{r.summary}</p>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
