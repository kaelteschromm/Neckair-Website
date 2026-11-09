"use client";

import { useState } from "react";
import { BuildingCanvas } from "./BuildingCanvas";
import type { SystemId, VentMode } from "./geometry";

const VENT_MODES: { id: VentMode; label: string; text: string }[] = [
  { id: "zuluft", label: "Zuluft", text: "Gefilterte Außenluft strömt über die Deckenkanäle in Wohn- und Schlafräume." },
  { id: "abluft", label: "Abluft", text: "Verbrauchte, feuchte Luft wird in Bad und Küche abgesaugt und nach außen geführt." },
  { id: "wrg", label: "Wärmerückgewinnung", text: "Im Gerät gibt die warme Abluft ihre Wärme an die frische Zuluft ab – ohne dass sich beide mischen." },
];

const LEGEND: Record<SystemId, { color: string; items: string[] }> = {
  heizung: { color: "bg-ember-soft", items: ["Wärmepumpe außen", "Heizkreisverteiler", "Flächenheizung in beiden Etagen"] },
  wasser: { color: "bg-sky", items: ["Hausanschluss", "Steigleitung", "Bad im Obergeschoss, Küche im Erdgeschoss"] },
  klima: { color: "bg-ice", items: ["Außengerät auf dem Dach", "Kältemittelleitung", "Zwei Innengeräte mit Luftverteilung"] },
  lueftung: { color: "bg-teal", items: ["Lüftungsgerät im Technikraum", "Zu- und Abluftkanäle", "Außen- und Fortluft über Dach"] },
};

/** „So wirkt es im Haus“ – das Gebäudemodell mit Fokus auf ein System. Auf der Lüftungsseite interaktiv. */
export function ServiceScene({ system, interactive = false }: { system: SystemId; interactive?: boolean }) {
  const [mode, setMode] = useState<VentMode>("wrg");
  const legend = LEGEND[system];
  const current = VENT_MODES.find((m) => m.id === mode)!;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-950 text-paper">
      <div aria-hidden className="grid-lines absolute inset-0 opacity-50" />
      <div className="grid lg:grid-cols-12">
        <div className="relative aspect-[4/3] lg:col-span-8 lg:aspect-auto lg:min-h-[34rem]">
          <BuildingCanvas active={system} autoOrbit ventMode={mode} zoom={1.2} className="absolute inset-0" />
        </div>
        <div className="relative flex flex-col justify-center gap-8 border-t border-paper/10 p-6 sm:p-8 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-10">
          <div>
            <p className="hud text-paper/45">So wirkt es im Haus</p>
            <ul className="mt-5 space-y-3">
              {legend.items.map((it) => (
                <li key={it} className="flex items-center gap-3 text-paper/80">
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${legend.color}`} />
                  {it}
                </li>
              ))}
            </ul>
          </div>

          {interactive && (
            <div>
              <p className="hud text-paper/45">Luftführung ansehen</p>
              <div role="radiogroup" aria-label="Luftführung" className="mt-4 flex flex-wrap gap-2">
                {VENT_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={`press rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      mode === m.id ? "border-teal bg-teal text-navy-950" : "border-paper/20 text-paper hover:border-paper/50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="mt-4 min-h-[4.5rem] text-[0.95rem] leading-relaxed text-paper/70">
                {current.text}
              </p>
            </div>
          )}
          <p className="text-xs leading-relaxed text-paper/35">Schematische Darstellung, nicht maßstäblich.</p>
        </div>
      </div>
    </div>
  );
}
