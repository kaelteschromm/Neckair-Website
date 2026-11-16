"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { COMPONENTS, SYSTEMS, SYSTEM_ORDER, type HouseComponent, type SystemKey } from "./model";
import type { FloorView, SceneApi, SceneState } from "./HouseScene";
import { useReduceMotion } from "@/lib/useReduceMotion";

// three.js/R3F liegen in einem eigenen Chunk und werden erst geladen, wenn das Haus gestartet wird.
const HouseScene = dynamic(() => import("./HouseScene"), { ssr: false });

const INITIAL: SceneState = { mode: "arch", system: "all", roof: true, ghostWalls: false, floor: "all", selected: null };
const SWATCH: Record<SystemKey, string> = { heat: "bg-heat", water: "bg-water", cold: "bg-cold" };
const INK: Record<SystemKey, string> = { heat: "text-heat-ink", water: "text-water-ink", cold: "text-cold-ink" };

/** Geräteeigenschaften einmalig im Browser ermitteln (auf dem Server: null) */
let envCache: { gl: boolean; fine: boolean } | null = null;
const noSubscribe = () => () => {};
function getEnv() {
  envCache ??= {
    gl: hasWebGL(),
    fine: window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth >= 1024,
  };
  return envCache;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Kleine Schaltfläche der Bedienleiste */
function Tool({ pressed, onClick, children, label, className = "" }: { pressed?: boolean; onClick: () => void; children: ReactNode; label?: string; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`press min-h-10 min-w-10 border px-3 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 ${
        pressed ? "border-navy bg-navy text-white" : "border-navy/15 bg-white/90 text-navy hover:border-navy/50"
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

export function HouseExperience() {
  const reduce = useReduceMotion();
  const env = useSyncExternalStore(noSubscribe, getEnv, () => null);
  const webgl = env ? env.gl : null;
  const lowPower = env ? !env.fine : false;
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [inView, setInView] = useState(false);
  const [state, setState] = useState<SceneState>(INITIAL);
  const api = useRef<SceneApi | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // WebGL prüfen; auf Desktop mit Maus startet das Haus automatisch, sobald es in Sichtweite kommt.
  useEffect(() => {
    const el = stage.current;
    if (!el || !env) return;
    const { gl, fine } = env;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && gl && fine) setStarted(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [env]);

  // Auf Touch-Geräten wird das Modell beim Schließen entladen – danach muss es neu „bereit“ melden
  const closeFull = useCallback(() => {
    setFullscreen(false);
    if (envCache && !envCache.fine) setReady(false);
  }, []);

  // Vollbild: Seite sperren, Esc schließt, Fokus zurück zum Auslöser
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

  const select = useCallback((id: string) => {
    const c = COMPONENTS.find((x) => x.id === id);
    if (!c) return;
    setState((s) => {
      const inside = c.placement === "eg" || c.placement === "og";
      if (!inside) return { ...s, selected: id };
      return {
        ...s,
        selected: id,
        mode: "tech",
        system: c.system,
        roof: false,
        ghostWalls: true,
        floor: c.placement === "eg" ? "eg" : "all",
      };
    });
  }, []);

  const start = (full: boolean, trigger?: HTMLElement | null) => {
    opener.current = trigger ?? null;
    setStarted(true);
    if (full) setFullscreen(true);
  };

  const setMode = (mode: SceneState["mode"]) =>
    setState((s) =>
      mode === "arch"
        ? { ...INITIAL, selected: null }
        : { ...s, mode: "tech", roof: false, ghostWalls: true, selected: s.selected },
    );
  const setSystem = (system: SceneState["system"]) => setState((s) => ({ ...s, mode: "tech", roof: false, ghostWalls: true, system, selected: null }));
  const setFloor = (floor: FloorView) => setState((s) => ({ ...s, floor }));

  const selected = state.selected ? COMPONENTS.find((c) => c.id === state.selected) ?? null : null;
  // Auf Touch-Geräten läuft das Modell nur im Vollbild, damit Wischen die Seite nicht blockiert.
  const live = !!webgl && started && (!lowPower || fullscreen);

  const fromList = (id: string, el: HTMLElement) => {
    select(id);
    if (live && !fullscreen) stage.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    else if (webgl && lowPower) start(true, el);
  };

  return (
    <section id="erkunden" aria-labelledby="haus-titel" className="scroll-mt-16 bg-kalk py-20 lg:py-28">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="haus-titel" className="text-[clamp(2rem,4.2vw,3.6rem)] text-navy lg:col-span-6">
            Das Haus von innen verstehen.
          </h2>
          <p className="measure text-lg leading-relaxed text-muted lg:col-span-6">
            Drehen Sie das Haus, nehmen Sie das Dach ab und schalten Sie in die Technikansicht. Ein Klick auf ein Bauteil zeigt, was es tut –
            und welches Gewerk dahintersteht.
          </p>
        </div>

        <div
          ref={stage}
          role={fullscreen ? "dialog" : undefined}
          aria-modal={fullscreen || undefined}
          aria-label={fullscreen ? "3D-Haus im Vollbild" : undefined}
          className={
            fullscreen
              ? "fixed inset-0 z-[90] bg-[#e4e6e4]"
              : "plan-frame relative mt-10 aspect-[4/5] overflow-hidden bg-[#e4e6e4] text-navy/40 sm:aspect-[16/11] lg:aspect-[16/9]"
          }
        >
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
                onReady={() => setReady(true)}
              />
            </div>
          ) : null}

          {/* Platzhalter, solange das Modell nicht läuft */}
          {!live || !ready ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
              <HouseGlyph />
              {webgl === false ? (
                <p className="max-w-sm text-sm text-muted">
                  Ihr Browser kann das 3D-Modell nicht anzeigen. Alle Bauteile finden Sie unten als Liste.
                </p>
              ) : started && live ? (
                <p className="text-sm font-medium text-muted" role="status">3D-Modell wird geladen …</p>
              ) : (
                <button type="button" className="btn btn-primary" onClick={(e) => start(lowPower, e.currentTarget)}>
                  3D-Haus starten
                </button>
              )}
            </div>
          ) : null}

          {live && ready ? (
            <>
              {/* Bedienleiste oben */}
              <div className="absolute inset-x-3 top-3 sm:inset-x-4 sm:top-4">
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
                  onClick={(e) => {
                    if (fullscreen) closeFull();
                    else start(true, e.currentTarget);
                  }}
                  className="press absolute right-0 top-0 min-h-10 border border-navy/15 bg-white/90 px-3 text-sm font-semibold text-navy hover:border-navy/50"
                >
                  {fullscreen ? "Schließen" : "Vollbild"}
                </button>
              </div>

              {/* Bedienleiste unten */}
              <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
                <div className="flex flex-wrap gap-2">
                  <Tool pressed={state.roof} onClick={() => setState((s) => ({ ...s, roof: !s.roof }))}>Dach</Tool>
                  <Tool pressed={state.ghostWalls} onClick={() => setState((s) => ({ ...s, ghostWalls: !s.ghostWalls }))}>Wände transparent</Tool>
                  <div role="group" aria-label="Etage" className="flex">
                    {(["all", "og", "eg"] as FloorView[]).map((f, i) => (
                      <Tool key={f} pressed={state.floor === f} onClick={() => setFloor(f)} className={i ? "-ml-px" : ""}>
                        {f === "all" ? "Ganzes Haus" : f === "og" ? "OG" : "EG"}
                      </Tool>
                    ))}
                  </div>
                </div>
                <div role="group" aria-label="Kamera" className="flex">
                  <Tool label="Nach links drehen" onClick={() => api.current?.rotate(-Math.PI / 8)}>↺</Tool>
                  <Tool label="Nach rechts drehen" onClick={() => api.current?.rotate(Math.PI / 8)} className="-ml-px">↻</Tool>
                  <Tool label="Heranzoomen" onClick={() => api.current?.zoom(2.5)} className="-ml-px">+</Tool>
                  <Tool label="Herauszoomen" onClick={() => api.current?.zoom(-2.5)} className="-ml-px">−</Tool>
                  <Tool label="Ansicht zurücksetzen" onClick={() => api.current?.reset()} className="-ml-px">⌂</Tool>
                </div>
              </div>

              {selected ? (
                <InfoCard
                  comp={selected}
                  onClose={() => setState((s) => ({ ...s, selected: null }))}
                  className="absolute inset-x-3 bottom-[10.5rem] sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-auto sm:w-80"
                />
              ) : null}
            </>
          ) : null}
        </div>

        <p className="sr-only" aria-live="polite">
          {selected ? `${selected.title} ausgewählt. ${selected.text}` : ""}
        </p>

        {/* Zugängliche Alternative: alle Bauteile als Liste */}
        <div className="mt-12">
          <h3 className="text-xl text-navy">Alle Bauteile im Überblick</h3>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
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
                        onClick={(e) => fromList(c.id, e.currentTarget)}
                        className={`flex w-full items-center justify-between gap-3 py-3 text-left text-[0.95rem] transition-colors duration-200 ${
                          state.selected === c.id ? "font-semibold text-navy" : "text-muted hover:text-navy"
                        }`}
                      >
                        {c.title}
                        <span aria-hidden className="text-navy/40">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {selected && !live ? <InfoCard comp={selected} onClose={() => setState((s) => ({ ...s, selected: null }))} className="mt-8 max-w-xl" /> : null}
        </div>
      </div>
    </section>
  );
}

/** Schlichte Linienzeichnung des Hauses als Platzhalter (kein Bild-Download nötig) */
function HouseGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 220 140" className="w-56 max-w-[60%] text-navy/35" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M20 120h180M34 120V70h132v50M34 70V28h104v42M138 70h28" />
      <path d="M46 120V88h52v32M112 84h40v22h-40zM48 36h34v24H48zM96 36h30v24H96z" />
      <path d="M30 28h112" strokeWidth="2" />
      <path d="M166 62h28v58" strokeDasharray="3 3" />
    </svg>
  );
}
