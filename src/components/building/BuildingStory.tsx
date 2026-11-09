"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { BuildingCanvas } from "./BuildingCanvas";
import type { SystemId } from "./geometry";
import { Arrow } from "../Arrow";
import { EASE } from "../motion";
import { useReduceMotion } from "@/lib/useReduceMotion";

const STEPS: { id: SystemId; title: string; kicker: string; text: string; metric: string; accent: string }[] = [
  {
    id: "heizung",
    title: "Heizung",
    kicker: "Wärme",
    text: "Die Wärmepumpe holt Energie aus der Außenluft. Über den Verteiler fließt sie in die Flächenheizung – gleichmäßig, leise, bei niedriger Vorlauftemperatur.",
    metric: "Wärmepumpe · Verteiler · Flächenheizung",
    accent: "text-ember-soft",
  },
  {
    id: "wasser",
    title: "Sanitär",
    kicker: "Wasser",
    text: "Vom Hausanschluss bis zur Armatur: hygienisch geführte Leitungen, die Trinkwasser frisch halten und Bad und Küche zuverlässig versorgen.",
    metric: "Hausanschluss · Steigleitung · Bad & Küche",
    accent: "text-sky",
  },
  {
    id: "klima",
    title: "Klima",
    kicker: "Kühle",
    text: "Das Außengerät auf dem Dach versorgt die Innengeräte. Kühle Luft verteilt sich sanft im Raum – im Winter heizen dieselben Geräte effizient mit.",
    metric: "Außengerät · Kältekreis · Innengeräte",
    accent: "text-ice",
  },
  {
    id: "lueftung",
    title: "Lüftung",
    kicker: "Luft",
    text: "Frische Außenluft wird gefiltert in die Räume geführt, verbrauchte Luft abgesaugt. Die Wärme der Abluft bleibt dabei im Haus.",
    metric: "Zuluft · Abluft · Wärmerückgewinnung",
    accent: "text-teal",
  },
];

/**
 * Scrolltelling-Kern der Startseite: Der Abschnitt ist angeheftet, beim Scrollen umkreist
 * die Kamera das Haus und die vier Systeme leuchten nacheinander auf.
 * Kamerawinkel = direkt an den Scroll gekoppelt (kein Timing, daher nie träge).
 * Textwechsel = Zustandswechsel, 300 ms Überblendung mit --ease-out.
 */
export function BuildingStory() {
  const ref = useRef<HTMLElement>(null);
  const yaw = useRef(-0.75);
  const [step, setStep] = useState(0);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length)));
    yaw.current = reduce ? -0.75 + s * 0.35 : -0.75 + p * 1.4;
    setStep((prev) => (prev === s ? prev : s));
  });

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * ((i + 0.5) / STEPS.length), behavior: reduce ? "auto" : "smooth" });
  };

  const s = STEPS[step];
  return (
    <section ref={ref} aria-labelledby="gebaeude-titel" className="relative h-[420svh] bg-navy-950 text-paper">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_55%,rgba(30,136,229,0.16),transparent_60%)]" />
        <div className="absolute inset-0">
          <BuildingCanvas active={s.id} yawRef={yaw} className="lg:hidden" zoom={1.3} offsetY={-0.16} />
          <BuildingCanvas active={s.id} yawRef={yaw} offsetX={0.14} className="hidden lg:block" />
        </div>

        <div className="container-x relative flex h-full flex-col justify-between pb-8 pt-28 lg:justify-center lg:pb-0 lg:pt-0">
          <div className="max-w-md">
            <p className="hud text-paper/50">Das intelligente Gebäude</p>
            <h2 id="gebaeude-titel" className="mt-4 text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.02] tracking-tight">
              Vier Systeme. <span className="display italic">Ein Haus.</span>
            </h2>
          </div>

          <div className="glass mt-auto max-w-md rounded-2xl p-6 lg:mt-12 lg:p-8">
            <div className="flex items-center justify-between">
              <span className={`hud ${s.accent}`}>
                {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} · {s.kicker}
              </span>
              <div className="flex gap-1.5" role="tablist" aria-label="Systeme">
                {STEPS.map((x, i) => (
                  <button
                    key={x.id}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    aria-label={x.title}
                    onClick={() => goTo(i)}
                    className="press group flex h-8 w-8 items-center justify-center"
                  >
                    <span
                      className={`block h-1.5 w-5 rounded-full transition-[transform,background-color] duration-300 ease-[var(--ease-out)] ${
                        i === step ? "scale-x-100 bg-paper" : "scale-x-[0.3] bg-paper/30 group-hover:bg-paper/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div aria-live="polite" className="relative mt-5 min-h-[11.5rem] sm:min-h-[10rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={s.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, y: -8, transition: { duration: 0.15, ease: EASE } }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <h3 className="text-3xl font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-paper/70">{s.text}</p>
                  <p className="hud mt-4 text-paper/40">{s.metric}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <Link
              href={`/${s.id === "wasser" ? "sanitaer" : s.id}/`}
              className="link-underline mt-5 inline-flex items-center gap-2 text-sm font-semibold"
            >
              Mehr zu {s.title} <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
