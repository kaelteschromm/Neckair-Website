"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { defaultControl, type SceneControl } from "./BuildingCanvas";
import type { SystemId } from "./geometry";
import { LightField } from "../LightField";
import { Picture } from "../Picture";
import { EASE } from "../motion";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { serviceList } from "@/content/services";

// Canvas erst im Browser laden – er wird für das erste HTML nicht gebraucht (bundle-dynamic-imports)
const BuildingCanvas = dynamic(() => import("./BuildingCanvas").then((m) => m.BuildingCanvas), { ssr: false });

type Chapter = { key: string; title: string; text: string; href?: string; linkLabel?: string; color?: string };
const CHAPTERS: Chapter[] = [
  { key: "open", title: "Die Hülle öffnet sich.", text: "Hinter Fassade und Decken liegt das, was ein Gebäude erst bewohnbar macht: Leitungen, Geräte, Kreisläufe – sorgfältig geplant, sauber verlegt." },
  { key: "heizung", title: "Wärme", text: "Die Wärmepumpe holt Energie aus der Außenluft. Über den Verteiler fließt sie in die Flächenheizung – gleichmäßig, leise, bei niedriger Vorlauftemperatur.", href: "/heizung/", linkLabel: "Mehr zur Heizung", color: "text-heat" },
  { key: "wasser", title: "Wasser", text: "Vom Hausanschluss bis zur Armatur: hygienisch geführte Leitungen und eine Zirkulation, die warmes Wasser in Bewegung hält.", href: "/sanitaer/", linkLabel: "Mehr zu Sanitär & Trinkwasser", color: "text-water" },
  { key: "klima", title: "Kälte", text: "Das Außengerät auf dem Dach versorgt die Innengeräte. Kühle Luft verteilt sich sanft im Raum – im Winter heizen dieselben Geräte mit.", href: "/klima/", linkLabel: "Mehr zu Klima & Kälte", color: "text-cold" },
  { key: "all", title: "Alles greift ineinander.", text: "Wärme, Wasser und Kälte werden zusammen geplant. So stehen sich Technik und Architektur nicht im Weg – und Sie haben einen Ansprechpartner für alles." },
];
const IDS: SystemId[] = ["heizung", "wasser", "klima"];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Startseite: Hero und Scrolltelling als eine durchgehende Szene.
 * 0.00–0.14 Hero (Intro: Kamera fährt heran, Systeme zeichnen sich nacheinander)
 * 0.14–0.28 Hülle öffnet sich (Explosionsansicht)
 * 0.28–0.76 Wärme, Wasser, Kälte nacheinander im Fokus
 * 0.76–0.88 alle Systeme verbunden, Haus schließt sich
 * 0.88–1.00 aus der Zeichnung wird ein fertiger Wohnraum
 * Direkt an den Scroll gekoppelt – kein Scroll-Jacking, kein Einrasten.
 */
export function BuildingStory() {
  const ref = useRef<HTMLElement>(null);
  const control = useRef<SceneControl>({ ...defaultControl(), draw: { heizung: 0, wasser: 0, klima: 0 }, dolly: 1.35, yaw: -0.85 });
  const [chapter, setChapter] = useState(-1);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const intro = useRef(0);
  const progress = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

  // Überblendungen direkt setzen (nicht über die native ScrollTimeline, die hier die ganze Seite misst)
  const paintOverlays = (p: number) => {
    const hero = heroRef.current;
    const room = roomRef.current;
    const h = 1 - seg(p, 0.06, 0.13);
    if (hero) {
      hero.style.opacity = String(h);
      hero.style.transform = reduce ? "" : `translate3d(0, ${(-6 * (1 - h)).toFixed(2)}%, 0)`;
      hero.style.visibility = h < 0.01 ? "hidden" : "visible";
    }
    if (room) {
      const r = seg(p, 0.88, 0.97);
      if (reduce) {
        const o = seg(p, 0.88, 0.94);
        room.style.clipPath = "none";
        room.style.opacity = String(o);
        room.style.visibility = o < 0.001 ? "hidden" : "visible";
      } else {
        room.style.clipPath = `inset(${(100 * (1 - r)).toFixed(2)}% 0% 0% 0%)`;
        room.style.visibility = r < 0.001 ? "hidden" : "visible";
      }
    }
  };

  const apply = (instant: boolean) => {
    const p = progress.current;
    const it = instant ? 1 : intro.current;
    const c = control.current;
    const stagger = (i: number) => easeOut(clamp((it * 6 - 1.2 - i * 1.0) / 1.6));
    const after = p > 0.14 ? 1 : 0;
    c.draw = { heizung: Math.max(stagger(0), after), wasser: Math.max(stagger(1), after), klima: Math.max(stagger(2), after) };
    const open = easeOut(seg(p, 0.14, 0.28));
    const close = easeOut(seg(p, 0.76, 0.88));
    c.explode = open * (1 - close);
    c.shell = 1 - 0.75 * c.explode;
    const approach = easeOut(clamp(it * 1.4));
    c.dolly = 1.35 - 0.35 * approach - 0.12 * seg(p, 0.28, 0.76) + 0.12 * close;
    c.yaw = instant ? -0.75 + Math.floor(p * 6) * 0.2 : -0.85 + p * 1.25;
    const focus = p < 0.28 ? -1 : p < 0.44 ? 0 : p < 0.6 ? 1 : p < 0.76 ? 2 : -1;
    c.active = focus >= 0 ? IDS[focus] : "all";
  };

  // Intro (~6 s): Kamera fährt heran, Systeme erscheinen nacheinander. Reduzierte Bewegung: sofort fertig.
  useEffect(() => {
    if (reduce) {
      apply(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      intro.current = clamp((now - start) / 6000);
      apply(false);
      if (intro.current < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // apply liest nur Refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    progress.current = p;
    apply(reduce);
    paintOverlays(p);
    const ch = p < 0.14 ? -1 : p < 0.28 ? 0 : p < 0.44 ? 1 : p < 0.6 ? 2 : p < 0.76 ? 3 : p < 0.88 ? 4 : 5;
    setChapter((prev) => (prev === ch ? prev : ch));
  });


  const ch = chapter >= 0 && chapter < CHAPTERS.length ? CHAPTERS[chapter] : null;

  return (
    <section ref={ref} aria-label="Das NECKAIR-Gebäude" className="relative h-[620svh] bg-graphite text-on-dark">
      <div className="sticky top-0 h-svh overflow-hidden">
        <LightField mode="home" intensity={0.75} />
        <div className="absolute inset-0">
          <BuildingCanvas control={control} className="lg:hidden" zoom={1.15} offsetY={-0.23} />
          <BuildingCanvas control={control} className="hidden lg:block" offsetX={0.16} />
        </div>

        {/* Hero */}
        <div
          ref={heroRef}
          className="container-x relative flex h-full flex-col justify-end pb-10 pt-28 lg:justify-center lg:pb-0"
        >
          <div className="max-w-3xl">
            <p className="hero-fade text-sm font-medium text-on-dark-muted" style={{ animationDelay: "0.2s" }}>
              NECKAIR – Handwerk mit Ingenieursblick
            </p>
            <h1 className="mt-5 text-[clamp(1.95rem,8.4vw,4.9rem)] lg:text-[clamp(2.3rem,5.4vw,4.9rem)]">
              <span className="hero-line"><span style={{ animationDelay: "0.35s" }}>Gebäudetechnik,</span></span>
              <span className="hero-line"><span style={{ animationDelay: "0.45s" }}>die man spürt.</span></span>
            </h1>
            <p className="hero-fade mt-6 max-w-lg text-lg leading-relaxed text-on-dark-muted" style={{ animationDelay: "0.75s" }}>
              Wir schaffen Lebensräume, in denen Technik und Komfort perfekt zusammenspielen.
            </p>
            <div className="hero-fade mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.9s" }}>
              <Link href="/kontakt/" className="btn btn-light">Projekt anfragen</Link>
              <a href="#erkunden" className="btn btn-outline-light">Gebäude erkunden</a>
            </div>
            <ul className="hero-fade mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm [@media(max-height:780px)_and_(max-width:1023px)]:hidden" style={{ animationDelay: "1.05s" }} aria-label="Leistungen">
              {serviceList.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}/`} className="link inline-flex items-center gap-2 text-on-dark">
                    <span aria-hidden className={`h-2 w-2 ${s.medium === "heat" ? "bg-heat" : s.medium === "water" ? "bg-water" : "bg-cold"}`} />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Schriftfeld wie auf einem Bauplan */}
          <dl className="hero-fade annot absolute bottom-10 right-[clamp(1.25rem,4vw,3.5rem)] hidden w-72 border border-on-dark/25 text-on-dark-muted xl:block" style={{ animationDelay: "1.3s" }}>
            <div className="flex border-b border-on-dark/25"><dt className="w-24 border-r border-on-dark/25 px-3 py-2">Projekt</dt><dd className="px-3 py-2 text-on-dark">Ihr Gebäude</dd></div>
            <div className="flex border-b border-on-dark/25"><dt className="w-24 border-r border-on-dark/25 px-3 py-2">Gewerke</dt><dd className="px-3 py-2 text-on-dark">Wärme / Wasser / Kälte</dd></div>
            <div className="flex"><dt className="w-24 border-r border-on-dark/25 px-3 py-2">Planung</dt><dd className="px-3 py-2 text-on-dark">NECKAIR</dd></div>
          </dl>
        </div>

        {/* Kapitel */}
        <div className="pointer-events-none absolute inset-0">
          <div className="container-x flex h-full items-end pb-8 lg:items-center lg:pb-0">
            <div aria-live="polite" className="w-full max-w-md">
              <AnimatePresence mode="wait" initial={false}>
                {ch ? (
                  <motion.div
                    key={ch.key}
                    className="pointer-events-auto border-l-2 border-on-dark/30 bg-graphite/75 py-5 pl-6 pr-5 lg:bg-transparent"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <h2 className={`text-[clamp(1.75rem,3.4vw,2.9rem)] ${ch.color ?? ""}`}>{ch.title}</h2>
                    <p className="mt-4 leading-relaxed text-on-dark-muted">{ch.text}</p>
                    {ch.href ? (
                      <Link href={ch.href} className="link mt-5 inline-block text-sm font-semibold text-on-dark">
                        {ch.linkLabel}
                      </Link>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Aus der Zeichnung wird ein Wohnraum */}
        <div ref={roomRef} style={{ clipPath: "inset(100% 0% 0% 0%)", visibility: "hidden" }} className="absolute inset-0">
          <Picture name="wohnraum-hell" alt="Heller, ruhiger Wohnraum mit großen Fenstern" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite/85 via-graphite/20 to-transparent" />
          <div className="container-x absolute inset-x-0 bottom-0 pb-14">
            <p className="font-display max-w-xl text-[clamp(1.75rem,3.6vw,3.2rem)] font-semibold leading-[1.3] [font-stretch:115%] text-white">
              Am Ende zählt, wie sich ein Raum anfühlt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
