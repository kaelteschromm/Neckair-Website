"use client";

// Startseiten-Erlebnis: Hero-Motiv (gerendert aus derselben 3D-Szene) → beim Scrollen wird das Bild unscharf
// und gibt das 3D-Haus aus exakt demselben Blickwinkel frei → das Haus öffnet sich und zeigt Wärme, Wasser, Kälte
// → danach erkundet der Besucher selbst. Ohne WebGL oder bei reduzierter Bewegung: ruhige Variante ohne Scrollgeschichte.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { COMPONENTS, SYSTEMS, SYSTEM_ORDER, type HouseComponent, type SystemKey } from "./model";
import type { FloorView, SceneApi, SceneState, StoryLink } from "./HouseScene";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { images } from "@/lib/images.generated";
import { asset, site } from "@/lib/site";
import { Logo } from "../Logo";

// three.js/R3F liegen in einem eigenen Chunk und werden erst bei Bedarf geladen.
const HouseScene = dynamic(() => import("./HouseScene"), { ssr: false });

const INITIAL: SceneState = { mode: "arch", system: "all", roof: true, ghostWalls: false, floor: "all", selected: null };
const SWATCH: Record<SystemKey, string> = { heat: "bg-heat", water: "bg-water", cold: "bg-cold" };
const INK: Record<SystemKey, string> = { heat: "text-heat-ink", water: "text-water-ink", cold: "text-cold-ink" };
const STAGE_BG = "#ead8c3";

/** Kapitel der Scrollgeschichte: Schwelle (Scrollanteil), Szenenzustand, Bildunterschrift */
const CHAPTERS: { at: number; state: Partial<SceneState>; kicker?: string; title?: string; text?: string; system?: SystemKey }[] = [
  { at: 0, state: { mode: "arch", roof: true, ghostWalls: false, system: "all" } },
  { at: 0.36, state: { mode: "arch", roof: true, ghostWalls: false, system: "all" }, kicker: "Das Haus", title: "So könnte Ihr Zuhause aussehen.", text: "Zwei Geschosse, Flachdach, viel Licht – ein Haus, wie es in Walldorf, Wiesloch oder Sandhausen stehen könnte." },
  { at: 0.5, state: { mode: "arch", roof: true, ghostWalls: false, system: "all" }, kicker: "Die Technik", title: "Was ein Haus lebenswert macht, sieht man nicht.", text: "Öffnen wir es." },
  { at: 0.62, state: { mode: "tech", roof: false, ghostWalls: true, system: "heat" }, system: "heat", title: "Wärme", text: "Die Wärmepumpe holt Energie aus der Außenluft. Speicher und Verteiler bringen sie in die Fußbodenheizung – leise und gleichmäßig." },
  { at: 0.71, state: { mode: "tech", roof: false, ghostWalls: true, system: "water" }, system: "water", title: "Wasser", text: "Vom Hausanschluss bis zur Armatur: Kalt- und Warmwasser mit Zirkulation, damit es hygienisch bleibt." },
  { at: 0.8, state: { mode: "tech", roof: false, ghostWalls: true, system: "cold" }, system: "cold", title: "Kälte", text: "Ein Außengerät auf dem Dach, leise Innengeräte in den Räumen – kühl im Sommer, angenehm in der Übergangszeit." },
  { at: 0.89, state: { mode: "tech", roof: false, ghostWalls: true, system: "all" }, kicker: "Jetzt Sie", title: "Erkunden Sie das Haus.", text: "Drehen, Etagen wählen, Bauteile anklicken." },
];
const INTERACTIVE_AT = 0.89;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ Geräteeigenschaften */

let envCache: { gl: boolean; fine: boolean } | null = null;
const noSubscribe = () => () => {};
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
function getEnv() {
  envCache ??= {
    gl: hasWebGL(),
    fine: window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth >= 1024,
  };
  return envCache;
}

/* ------------------------------------------------------------------ Bausteine */

/** Hero-Motiv: Querformat für breite, Hochformat für schmale Bildschirme */
function HeroPicture() {
  const set = (name: "haus-hero" | "haus-hero-hoch", fmt: string) =>
    images[name].widths.map((w) => `${asset(`/img/${name}-${w}.${fmt}`)} ${w}w`).join(", ");
  const land = images["haus-hero"];
  return (
    <picture className="block h-full w-full">
      <source media="(max-aspect-ratio: 1/1)" type="image/avif" srcSet={set("haus-hero-hoch", "avif")} sizes="100vw" />
      <source media="(max-aspect-ratio: 1/1)" type="image/webp" srcSet={set("haus-hero-hoch", "webp")} sizes="100vw" />
      <source type="image/avif" srcSet={set("haus-hero", "avif")} sizes="100vw" />
      <source type="image/webp" srcSet={set("haus-hero", "webp")} sizes="100vw" />
      <img
        src={asset(`/img/haus-hero-1600.webp`)}
        alt="Modernes zweigeschossiges Einfamilienhaus mit Flachdach, heller Putzfassade, anthrazitfarbenen Fenstern, Holzlamellen und Natursteinwand im warmen Licht des späten Nachmittags; davor Terrasse und Garten."
        width={land.width}
        height={land.height}
        fetchPriority="high"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ backgroundImage: `url(${land.blur})`, backgroundSize: "cover" }}
      />
    </picture>
  );
}

function Tool({ pressed, onClick, children, label, className = "" }: { pressed?: boolean; onClick: () => void; children: ReactNode; label?: string; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`press min-h-10 min-w-10 border px-3 text-sm font-semibold backdrop-blur transition-[background-color,border-color,color,transform] duration-200 ${
        pressed ? "border-navy bg-navy text-white" : "border-navy/15 bg-white/85 text-navy hover:border-navy/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function InfoCard({ comp, onClose, className = "" }: { comp: HouseComponent; onClose: () => void; className?: string }) {
  const sys = SYSTEMS[comp.system];
  return (
    <div className={`border border-navy/15 bg-white p-5 shadow-[0_18px_40px_-18px_rgba(11,34,57,0.35)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <p className={`annot flex items-center gap-2 ${INK[comp.system]}`}>
          <span aria-hidden className={`h-2 w-2 ${SWATCH[comp.system]}`} />
          {sys.label}
        </p>
        <button type="button" onClick={onClose} className="press -mr-2 -mt-2 min-h-10 min-w-10 text-navy" aria-label="Infokarte schließen">
          <svg aria-hidden viewBox="0 0 20 20" className="mx-auto h-4 w-4"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" /></svg>
        </button>
      </div>
      <h3 className="mt-2 text-xl text-navy">{comp.title}</h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{comp.text}</p>
      <Link href={sys.href} className="link mt-4 inline-block text-sm font-semibold text-navy">
        Mehr zu {sys.service}
      </Link>
    </div>
  );
}

function HeroText({ story, onDiscover }: { story: boolean; onDiscover: () => void }) {
  return (
    <div className="container-x relative flex h-full flex-col justify-end pb-16 pt-28 sm:pb-20 lg:justify-center lg:pb-0">
      <div className="max-w-xl">
        <p className="hero-fade" style={{ animationDelay: "0.15s" }}>
          <span className="sr-only">NECKAIR</span>
          <Logo tone="light" className="hidden h-6 w-auto opacity-90 sm:block" />
        </p>
        <h1 className="mt-6 text-[clamp(2.4rem,7.2vw,5.6rem)] leading-[0.98] text-white [text-shadow:0_2px_30px_rgb(20_24_29/0.35)]">
          <span className="hero-line"><span style={{ animationDelay: "0.3s" }}>Heizung. Sanitär.</span></span>
          <span className="hero-line"><span style={{ animationDelay: "0.42s" }}>Klima. Kälte.</span></span>
        </h1>
        <p className="hero-fade mt-6 max-w-md text-lg leading-relaxed text-white/90" style={{ animationDelay: "0.7s" }}>
          Gebäudetechnik aus einer Hand – für Ihr Zuhause und Ihr Unternehmen in {site.serviceArea.join(", ")} und Umgebung.
        </p>
        <div className="hero-fade mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.85s" }}>
          <Link href="/kontakt/" className="btn btn-light">Projekt anfragen</Link>
          <button type="button" onClick={onDiscover} className="btn btn-outline-light">
            {story ? "Haus von innen entdecken" : "Zum 3D-Haus"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Hauptkomponente */

export function HouseExperience() {
  const reduce = useReduceMotion();
  const env = useSyncExternalStore(noSubscribe, getEnv, () => null);
  const webgl = env ? env.gl : null;
  const lowPower = env ? !env.fine : false;
  // Server und erster Render: Scrollgeschichte (häufigster Fall); danach ggf. ruhige Variante
  const story = webgl !== false && !reduce;

  const [load3D, setLoad3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [inView, setInView] = useState(true);
  const [state, setState] = useState<SceneState>(INITIAL);
  const [chapter, setChapter] = useState(0);
  const [tookOver, setTookOver] = useState(false);

  const api = useRef<SceneApi | null>(null);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heroLayer = useRef<HTMLDivElement>(null);
  const heroImg = useRef<HTMLDivElement>(null);
  const heroText = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const readyRef = useRef(false);
  const tookOverRef = useRef(false);
  const camT = useRef(0);
  const driving = useRef(true);
  const lift = useRef(0);
  const link = useMemo<StoryLink>(() => ({ camT, driving, lift }), []);

  useEffect(() => {
    readyRef.current = ready;
    tookOverRef.current = tookOver;
  }, [ready, tookOver]);

  // 3D vorladen: Desktop im Leerlauf nach dem Laden, Touch-Geräte beim ersten Scrollen (siehe paint)
  useEffect(() => {
    if (!env?.gl || lowPower) return;
    const ric: (cb: () => void) => number = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel: (id: number) => void = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setLoad3D(true));
    return () => cancel(id);
  }, [env, lowPower]);

  // Sichtbarkeit (Rendern pausieren) – in der ruhigen Variante auch Ladeauslöser
  useEffect(() => {
    const el = section.current;
    if (!el || !env?.gl) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && !story && !lowPower) setLoad3D(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [env, story, lowPower]);

  // Scrollgeschichte: Fortschritt → Unschärfe/Ausblenden des Bildes, Kamera, Dach, Kapitel
  useEffect(() => {
    if (!story) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range));
      if (p > 0.004) setLoad3D(true);
      const live = readyRef.current;
      if (heroText.current) {
        const t = smooth(0.01, 0.13, p);
        heroText.current.style.opacity = String(1 - t);
        heroText.current.style.transform = `translateY(${-48 * t}px)`;
        heroText.current.style.visibility = t >= 1 ? "hidden" : "visible";
      }
      if (heroImg.current && heroLayer.current) {
        const b = smooth(0.08, 0.34, p);
        heroImg.current.style.filter = b > 0.001 ? `blur(${(live ? 18 : 6) * b}px)` : "";
        heroImg.current.style.transform = `scale(${1 + 0.04 * smooth(0, 0.34, p)})`;
        const fade = live ? smooth(0.22, 0.37, p) : 0;
        heroLayer.current.style.opacity = String(1 - fade);
        heroLayer.current.style.visibility = fade >= 1 ? "hidden" : "visible";
      }
      camT.current = smooth(0.38, 0.7, p);
      lift.current = 7 * smooth(0.5, 0.62, p);
      driving.current = !tookOverRef.current && p < INTERACTIVE_AT;
      let c = 0;
      for (let i = 0; i < CHAPTERS.length; i++) if (p >= CHAPTERS[i].at) c = i;
      setChapter(c);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [story, ready, tookOver]);

  // Szenenzustand folgt den Kapiteln, bis der Besucher selbst steuert
  const [lastChapter, setLastChapter] = useState(-1);
  if (story && !tookOver && chapter !== lastChapter) {
    setLastChapter(chapter);
    setState((s) => ({ ...s, ...CHAPTERS[chapter].state, floor: "all", selected: null }));
  }

  const takeOver = useCallback(() => {
    setTookOver(true);
    driving.current = false;
  }, []);

  // Vollbild: Seite sperren, Esc schließt, Fokus zurück
  const closeFull = useCallback(() => setFullscreen(false), []);
  useEffect(() => {
    if (!fullscreen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFull();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [fullscreen, closeFull]);

  /** Zum interaktiven Teil scrollen (Ende der Scrollgeschichte) */
  const toStage = useCallback(
    (at = INTERACTIVE_AT + 0.02) => {
      const el = section.current;
      if (!el) return;
      if (!story) {
        stage.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + range * at, behavior: reduce ? "auto" : "smooth" });
    },
    [story, reduce],
  );

  const select = useCallback(
    (id: string) => {
      const c = COMPONENTS.find((x) => x.id === id);
      if (!c) return;
      takeOver();
      setState((s) => {
        const inside = c.placement === "eg" || c.placement === "og";
        if (!inside) return { ...s, selected: id };
        return { ...s, selected: id, mode: "tech", system: c.system, roof: false, ghostWalls: true, floor: c.placement === "eg" ? "eg" : "all" };
      });
    },
    [takeOver],
  );

  const act = (fn: (s: SceneState) => SceneState) => {
    takeOver();
    setState(fn);
  };
  const setMode = (mode: SceneState["mode"]) => act((s) => (mode === "arch" ? { ...INITIAL } : { ...s, mode: "tech", roof: false, ghostWalls: true }));
  const setSystem = (system: SceneState["system"]) => act((s) => ({ ...s, mode: "tech", roof: false, ghostWalls: true, system, selected: null }));
  const setFloor = (floor: FloorView) => act((s) => ({ ...s, floor }));

  const selected = state.selected ? COMPONENTS.find((c) => c.id === state.selected) ?? null : null;
  const live = !!webgl && load3D;
  const interactive = live && ready && (!story || chapter >= CHAPTERS.length - 1 || tookOver || fullscreen);
  const cap = story && !tookOver ? CHAPTERS[chapter] : null;

  const fromList = (id: string) => {
    select(id);
    if (!webgl) return;
    setLoad3D(true);
    toStage();
  };

  const startFull = (el: HTMLElement) => {
    opener.current = el;
    takeOver();
    setLoad3D(true);
    setFullscreen(true);
  };

  /* ---------- Bühne (3D, Bedienung, Infokarte) ---------- */
  const stageInner = (
    <>
      {live ? (
        <div className="absolute inset-0" aria-hidden>
          <HouseScene
            state={state}
            onSelect={select}
            apiRef={api}
            reduceMotion={reduce}
            lowPower={lowPower}
            active={inView || fullscreen}
            wheelZoom={fullscreen}
            touchRotate={!lowPower || fullscreen}
            story={story ? link : undefined}
            onReady={() => setReady(true)}
          />
        </div>
      ) : null}

      {!story && (!live || !ready) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
          {webgl === false ? (
            <p className="max-w-sm text-sm text-muted">Ihr Browser kann das 3D-Modell nicht anzeigen. Alle Bauteile finden Sie unten als Liste.</p>
          ) : load3D ? (
            <p className="text-sm font-medium text-muted" role="status">3D-Modell wird geladen …</p>
          ) : (
            <button type="button" className="btn btn-primary" onClick={(e) => (lowPower ? startFull(e.currentTarget) : setLoad3D(true))}>
              3D-Haus starten
            </button>
          )}
        </div>
      ) : null}

      {interactive ? (
        <>
          <div className={`absolute inset-x-3 sm:inset-x-4 ${fullscreen || !story ? "top-3 sm:top-4" : "top-20 sm:top-24"}`}>
            <div className="flex flex-wrap gap-2 pr-24">
              <div role="group" aria-label="Ansicht" className="flex">
                <Tool pressed={state.mode === "arch"} onClick={() => setMode("arch")}>Architektur</Tool>
                <Tool pressed={state.mode === "tech"} onClick={() => setMode("tech")} className="-ml-px">Technik</Tool>
              </div>
              <div role="group" aria-label="Gewerk hervorheben" className="flex">
                <Tool pressed={state.mode === "tech" && state.system === "all"} onClick={() => setSystem("all")}>Alle</Tool>
                {SYSTEM_ORDER.map((k) => (
                  <Tool key={k} pressed={state.mode === "tech" && state.system === k} onClick={() => setSystem(k)} className="-ml-px">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className={`h-2 w-2 ${SWATCH[k]}`} />
                      {SYSTEMS[k].label}
                    </span>
                  </Tool>
                ))}
              </div>
            </div>
            <button
              ref={closeBtn}
              type="button"
              onClick={(e) => (fullscreen ? closeFull() : startFull(e.currentTarget))}
              className="press absolute right-0 top-0 min-h-10 border border-navy/15 bg-white/85 px-3 text-sm font-semibold text-navy backdrop-blur hover:border-navy/50"
            >
              {fullscreen ? "Schließen" : "Vollbild"}
            </button>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
            <div className="flex flex-wrap gap-2">
              <Tool pressed={state.roof} onClick={() => act((s) => ({ ...s, roof: !s.roof }))}>Dach</Tool>
              <Tool pressed={state.ghostWalls} onClick={() => act((s) => ({ ...s, ghostWalls: !s.ghostWalls }))}>Wände transparent</Tool>
              <div role="group" aria-label="Etage" className="flex">
                {(["all", "og", "eg"] as FloorView[]).map((f, i) => (
                  <Tool key={f} pressed={state.floor === f} onClick={() => setFloor(f)} className={i ? "-ml-px" : ""}>
                    {f === "all" ? "Ganzes Haus" : f === "og" ? "OG" : "EG"}
                  </Tool>
                ))}
              </div>
            </div>
            <div role="group" aria-label="Kamera" className="flex">
              <Tool label="Nach links drehen" onClick={() => { takeOver(); api.current?.rotate(-Math.PI / 8); }}>↺</Tool>
              <Tool label="Nach rechts drehen" onClick={() => { takeOver(); api.current?.rotate(Math.PI / 8); }} className="-ml-px">↻</Tool>
              <Tool label="Heranzoomen" onClick={() => { takeOver(); api.current?.zoom(2.5); }} className="-ml-px">+</Tool>
              <Tool label="Herauszoomen" onClick={() => { takeOver(); api.current?.zoom(-2.5); }} className="-ml-px">−</Tool>
              <Tool label="Ansicht zurücksetzen" onClick={() => { takeOver(); api.current?.reset(); }} className="-ml-px">⌂</Tool>
            </div>
          </div>

          {selected ? (
            <InfoCard
              comp={selected}
              onClose={() => setState((s) => ({ ...s, selected: null }))}
              className={`absolute inset-x-3 bottom-[10.5rem] sm:inset-x-auto sm:bottom-auto sm:right-4 sm:w-80 ${fullscreen || !story ? "sm:top-20" : "sm:top-40"}`}
            />
          ) : null}
        </>
      ) : null}
    </>
  );

  /* ---------- Bauteil-Liste (zugängliche Alternative) ---------- */
  const list = (
    <section id="erkunden" aria-labelledby="haus-titel" className="scroll-mt-20 bg-kalk py-20 lg:py-28">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="haus-titel" className="text-[clamp(2rem,4.2vw,3.6rem)] text-navy lg:col-span-6">
            Alle Bauteile im Überblick.
          </h2>
          <p className="measure text-lg leading-relaxed text-muted lg:col-span-6">
            Wählen Sie ein Bauteil – das 3D-Haus zeigt, wo es sitzt und was es tut. Jedes gehört zu einem unserer drei Gewerke.
          </p>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {SYSTEM_ORDER.map((k) => (
            <div key={k}>
              <p className={`annot flex items-center gap-2 ${INK[k]}`}>
                <span aria-hidden className={`h-2 w-2 ${SWATCH[k]}`} />
                {SYSTEMS[k].label} · {SYSTEMS[k].service}
              </p>
              <ul className="mt-3 border-t border-navy/15">
                {COMPONENTS.filter((c) => c.system === k).map((c) => (
                  <li key={c.id} className="border-b border-navy/15">
                    <button
                      type="button"
                      aria-pressed={state.selected === c.id}
                      onClick={() => fromList(c.id)}
                      className={`flex w-full items-center justify-between gap-3 py-3 text-left text-[0.95rem] transition-colors duration-200 ${
                        state.selected === c.id ? "font-semibold text-navy" : "text-muted hover:text-navy"
                      }`}
                    >
                      {c.title}
                      <span aria-hidden className="text-navy/40">↑</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {selected && !live ? <InfoCard comp={selected} onClose={() => setState((s) => ({ ...s, selected: null }))} className="mt-8 max-w-xl" /> : null}
      </div>
    </section>
  );

  const announce = (
    <p className="sr-only" aria-live="polite">
      {selected ? `${selected.title} ausgewählt. ${selected.text}` : ""}
    </p>
  );

  /* ---------- Ruhige Variante (reduzierte Bewegung / kein WebGL) ---------- */
  if (!story) {
    return (
      <>
        <section aria-label="NECKAIR – Heizung, Sanitär, Klima, Kälte" className="relative isolate h-svh min-h-[34rem] overflow-hidden bg-graphite text-on-dark">
          <div className="absolute inset-0 -z-10">
            <HeroPicture />
            <div className="absolute inset-0 bg-gradient-to-r from-graphite/75 via-graphite/25 to-transparent max-lg:bg-gradient-to-t max-lg:from-graphite/80" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-graphite/45 to-transparent" />
          </div>
          <HeroText story={false} onDiscover={() => toStage()} />
        </section>
        <section ref={section} aria-label="Das NECKAIR-Haus in 3D" className="bg-kalk pt-16 lg:pt-24">
          <div className="container-x">
            <div
              ref={stage}
              role={fullscreen ? "dialog" : undefined}
              aria-modal={fullscreen || undefined}
              aria-label={fullscreen ? "3D-Haus im Vollbild" : undefined}
              className={fullscreen ? "fixed inset-0 z-[90]" : "plan-frame relative aspect-[4/5] overflow-hidden text-navy/40 sm:aspect-[16/11] lg:aspect-[16/9]"}
              style={{ background: STAGE_BG }}
            >
              {stageInner}
            </div>
          </div>
        </section>
        {announce}
        {list}
      </>
    );
  }

  /* ---------- Scrollgeschichte ---------- */
  return (
    <>
      <section ref={section} aria-label="NECKAIR – Heizung, Sanitär, Klima, Kälte" className="story-section relative h-[460svh] bg-graphite">
        <div
          ref={stage}
          role={fullscreen ? "dialog" : undefined}
          aria-modal={fullscreen || undefined}
          aria-label={fullscreen ? "3D-Haus im Vollbild" : undefined}
          className={fullscreen ? "fixed inset-0 z-[90]" : "sticky top-0 h-svh overflow-hidden"}
          style={{ background: STAGE_BG }}
        >
          {stageInner}

          {/* Hero-Motiv über dem 3D-Haus – derselbe Blickwinkel */}
          {!fullscreen ? (
            <div ref={heroLayer} className="pointer-events-none absolute inset-0 overflow-hidden">
              <div ref={heroImg} className="absolute inset-0 will-change-[filter,transform]">
                <HeroPicture />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-graphite/70 via-graphite/20 to-transparent max-lg:bg-gradient-to-t max-lg:from-graphite/80 max-lg:via-graphite/20" />
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-graphite/45 to-transparent" />
            </div>
          ) : null}
          {!fullscreen ? (
            <div ref={heroText} className="pointer-events-none absolute inset-0 text-on-dark [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
              <HeroText story onDiscover={() => toStage(0.4)} />
              <div aria-hidden className="scroll-cue absolute bottom-6 left-1/2 hidden h-10 w-px -translate-x-1/2 bg-white/60 sm:block" />
            </div>
          ) : null}

          {/* Bildunterschriften der Kapitel */}
          {cap && cap.title && !fullscreen && !interactive ? (
            <div key={chapter} className="story-caption pointer-events-none absolute inset-x-3 bottom-4 sm:inset-x-auto sm:bottom-8 sm:left-[clamp(1.25rem,4vw,3.5rem)] sm:max-w-md">
              <div className="border border-navy/10 bg-white/85 p-5 backdrop-blur-md sm:p-6">
                <p className={`annot flex items-center gap-2 ${cap.system ? INK[cap.system] : "text-muted"}`}>
                  {cap.system ? <span aria-hidden className={`h-2 w-2 ${SWATCH[cap.system]}`} /> : null}
                  {cap.system ? SYSTEMS[cap.system].service : cap.kicker}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold leading-tight text-navy [font-stretch:108%] sm:text-3xl">{cap.title}</p>
                {cap.text ? <p className="mt-2 leading-relaxed text-muted">{cap.text}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      {announce}
      {list}
    </>
  );
}
