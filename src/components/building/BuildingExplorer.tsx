"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { defaultControl, type SceneControl } from "./BuildingCanvas";
import type { SystemId } from "./geometry";
import { EASE } from "../motion";
import { useReduceMotion } from "@/lib/useReduceMotion";

const BuildingCanvas = dynamic(() => import("./BuildingCanvas").then((m) => m.BuildingCanvas), { ssr: false });

const INFO: Record<SystemId, { title: string; service: string; href: string; tint: string; swatch: string; parts: string[]; text: string }> = {
  heizung: {
    title: "Wärme",
    service: "Heizung",
    href: "/heizung/",
    tint: "#ece4dc",
    swatch: "bg-heat",
    parts: ["Wärmepumpe außen", "Speicher und Heizkreisverteiler", "Flächenheizung in beiden Etagen"],
    text: "Energie aus der Außenluft, gleichmäßig über den Boden verteilt – leise und bei niedriger Vorlauftemperatur.",
  },
  wasser: {
    title: "Wasser",
    service: "Sanitär & Trinkwasser",
    href: "/sanitaer/",
    tint: "#dde6ee",
    swatch: "bg-water",
    parts: ["Hausanschluss und Steigleitung", "Bad im Obergeschoss, Küche und Gäste-WC unten", "Zirkulation für warmes Wasser"],
    text: "Kurze Wege und Wasser, das nicht steht – damit es bis zur Armatur hygienisch bleibt.",
  },
  klima: {
    title: "Kälte",
    service: "Klima & Kälte",
    href: "/klima/",
    tint: "#dce9ec",
    swatch: "bg-cold",
    parts: ["Außengerät auf dem Dach", "Kältemittelleitung", "Zwei Innengeräte mit sanfter Luftverteilung"],
    text: "Kühle, die man nicht hört – und die im Winter dieselben Geräte zum Heizen nutzen kann.",
  },
};
const IDS: SystemId[] = ["heizung", "wasser", "klima"];

/**
 * Das interaktive NECKAIR-Gebäude (Markenzeichen).
 * Auswahl per Schalter oder Klick auf eine Leitung: System wird hervorgehoben, die Lichtstimmung
 * der Fläche wechselt (300 ms, Zustandswechsel), Informationen und Link zur Leistung erscheinen.
 */
export function BuildingExplorer() {
  const [active, setActive] = useState<SystemId>("heizung");
  const reduce = useReduceMotion();
  const control = useRef<SceneControl>({ ...defaultControl(), active: "heizung", yaw: -0.55, explode: 0.55, shell: 0.55 });
  const select = (id: SystemId) => {
    control.current.active = id;
    setActive(id);
  };
  const info = INFO[active];

  return (
    <section
      id="erkunden"
      aria-labelledby="erkunden-titel"
      className="relative overflow-hidden py-24 transition-[background-color] duration-300 ease-[var(--ease-out)] lg:py-32"
      style={{ backgroundColor: info.tint }}
    >
      <div className="container-x grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="erkunden-titel" className="text-[clamp(2rem,4vw,3.4rem)] text-navy">
            Erkunden Sie das Gebäude.
          </h2>
          <p className="measure mt-5 text-lg leading-relaxed text-muted">
            Wählen Sie ein System – oder klicken Sie direkt auf eine Leitung im Modell.
          </p>

          <div role="radiogroup" aria-label="System auswählen" className="mt-8 grid grid-cols-3 gap-2">
            {IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active === id}
                onClick={() => select(id)}
                className={`press flex flex-col items-start gap-3 border px-3 py-3 text-left text-sm font-semibold transition-[background-color,border-color,color] duration-200 ${
                  active === id ? "border-navy bg-navy text-white" : "border-navy/25 text-navy hover:border-navy"
                }`}
              >
                <span aria-hidden className={`h-2 w-6 ${INFO[id].swatch}`} />
                {INFO[id].title}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="mt-8 min-h-[15rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <p className="text-sm font-semibold text-navy">{info.service}</p>
                <p className="mt-2 leading-relaxed text-muted">{info.text}</p>
                <ul className="mt-5 space-y-2 border-t border-navy/15 pt-5">
                  {info.parts.map((p) => (
                    <li key={p} className="flex items-baseline gap-3 text-navy">
                      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 translate-y-[-2px] ${info.swatch}`} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href={info.href} className="btn btn-primary mt-7">
                  Zur Leistung {info.service}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="plan-frame relative aspect-[4/3] text-navy/40 lg:col-span-8 lg:aspect-[16/11]">
          <BuildingCanvas control={control} theme="light" autoOrbit zoom={1.15} onPick={select} className="absolute inset-0" />
          <p className="annot absolute bottom-3 left-3 text-navy/80">Schematische Darstellung, nicht maßstäblich</p>
        </div>
      </div>
    </section>
  );
}
