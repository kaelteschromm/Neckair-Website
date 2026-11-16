// Datenmodell des NECKAIR-3D-Hauses. Reine Daten und Geometrie-Hilfen – ohne React und ohne three.js,
// damit es testbar bleibt und die Szene (HouseScene.tsx) nur noch darstellt.
// Einheiten: Meter. x = Osten, y = oben, z = Süden (Gartenseite, zum Betrachter).

export type Vec3 = [number, number, number];
export type SystemKey = "heat" | "water" | "cold";
export type Level = "eg" | "og";

export const SYSTEMS: Record<SystemKey, { label: string; service: string; href: string; color: string }> = {
  heat: { label: "Wärme", service: "Heizung", href: "/heizung/", color: "#f07e26" },
  water: { label: "Wasser", service: "Sanitär & Trinkwasser", href: "/sanitaer/", color: "#1e88e5" },
  cold: { label: "Kälte", service: "Klima & Kälte", href: "/klima/", color: "#3fa9c9" },
};
export const SYSTEM_ORDER: SystemKey[] = ["heat", "water", "cold"];

/** Höhen */
export const H = {
  egFloor: 0,
  egTop: 2.85,
  ogFloor: 3.15,
  ogTop: 5.95,
  roofTop: 6.2,
} as const;

/* ------------------------------------------------------------------ Wände */

export interface Opening { from: number; to: number; bottom: number; top: number; door?: boolean }
export interface WallDef {
  /** "x": Wand verläuft entlang x bei z = at · "z": entlang z bei x = at */
  axis: "x" | "z";
  at: number;
  from: number;
  to: number;
  bottom: number;
  top: number;
  thick: number;
  level: Level;
  exterior: boolean;
  openings?: Opening[];
}
export interface Box { pos: Vec3; size: Vec3 }

const EXT = 0.3;
const INT = 0.12;

export const WALLS: WallDef[] = [
  // Erdgeschoss, außen (heller Putz)
  { axis: "x", at: 4.35, from: -6, to: 6, bottom: H.egFloor, top: H.egTop, thick: EXT, level: "eg", exterior: true,
    openings: [{ from: -5.4, to: -0.6, bottom: 0, top: 2.55, door: true }, { from: 0.4, to: 2.6, bottom: 0.9, top: 2.4 }, { from: 3.6, to: 5.4, bottom: 0.9, top: 2.4 }] },
  { axis: "x", at: -4.35, from: -6, to: 6, bottom: H.egFloor, top: H.egTop, thick: EXT, level: "eg", exterior: true,
    openings: [{ from: -4.2, to: -1.4, bottom: 1.05, top: 2.2 }, { from: 4.7, to: 5.5, bottom: 1.7, top: 2.3 }] },
  { axis: "z", at: 5.85, from: -4.2, to: 4.2, bottom: H.egFloor, top: H.egTop, thick: EXT, level: "eg", exterior: true,
    openings: [{ from: -0.6, to: 1.6, bottom: 0.9, top: 2.4 }, { from: 2.4, to: 3.6, bottom: 0, top: 2.3, door: true }] },
  { axis: "z", at: -5.85, from: -4.2, to: 4.2, bottom: H.egFloor, top: H.egTop, thick: EXT, level: "eg", exterior: true,
    openings: [{ from: -1.6, to: 2.6, bottom: 0, top: 2.55, door: true }] },
  // Erdgeschoss, innen: Technikraum
  { axis: "z", at: 3.0, from: -4.2, to: -1.5, bottom: H.egFloor, top: H.egTop, thick: INT, level: "eg", exterior: false },
  { axis: "x", at: -1.5, from: 3.06, to: 5.7, bottom: H.egFloor, top: H.egTop, thick: INT, level: "eg", exterior: false,
    openings: [{ from: 4.8, to: 5.6, bottom: 0, top: 2.1, door: true }] },

  // Obergeschoss, außen (dunkle Holzfassade)
  { axis: "x", at: 4.35, from: -6, to: 4.5, bottom: H.ogFloor, top: H.ogTop, thick: EXT, level: "og", exterior: true,
    openings: [{ from: -5.4, to: -2.4, bottom: 3.15, top: 5.7 }, { from: -1.4, to: 2.0, bottom: 3.15, top: 5.7 }, { from: 2.9, to: 4.1, bottom: 3.9, top: 5.7 }] },
  { axis: "x", at: -4.35, from: -6, to: 4.5, bottom: H.ogFloor, top: H.ogTop, thick: EXT, level: "og", exterior: true,
    openings: [{ from: -5.0, to: -3.6, bottom: 4.75, top: 5.55 }, { from: -1.2, to: 1.0, bottom: 4.2, top: 5.5 }, { from: 2.6, to: 3.9, bottom: 4.2, top: 5.5 }] },
  { axis: "z", at: 4.35, from: -4.2, to: 4.2, bottom: H.ogFloor, top: H.ogTop, thick: EXT, level: "og", exterior: true,
    openings: [{ from: -1.0, to: 2.6, bottom: 4.0, top: 5.5 }] },
  { axis: "z", at: -5.85, from: -4.2, to: 4.2, bottom: H.ogFloor, top: H.ogTop, thick: EXT, level: "og", exterior: true,
    openings: [{ from: 0.6, to: 3.2, bottom: 4.0, top: 5.5 }] },
  // Obergeschoss, innen: Bad, Flur, Schlafzimmer, Kinderzimmer
  { axis: "z", at: -2.5, from: -4.2, to: -1.06, bottom: H.ogFloor, top: H.ogTop, thick: INT, level: "og", exterior: false,
    openings: [{ from: -3.1, to: -2.2, bottom: H.ogFloor, top: 5.25, door: true }] },
  { axis: "x", at: -1.0, from: -5.7, to: 3.1, bottom: H.ogFloor, top: H.ogTop, thick: INT, level: "og", exterior: false,
    openings: [{ from: -2.0, to: -1.1, bottom: H.ogFloor, top: 5.25, door: true }, { from: 1.9, to: 2.8, bottom: H.ogFloor, top: 5.25, door: true }] },
  { axis: "z", at: -0.8, from: -0.94, to: 4.2, bottom: H.ogFloor, top: H.ogTop, thick: INT, level: "og", exterior: false },
];

/** Zerlegt eine Wand mit Öffnungen in massive Quader (Pfeiler, Brüstungen, Stürze). */
export function wallBoxes(w: WallDef): Box[] {
  const out: Box[] = [];
  const ops = [...(w.openings ?? [])].sort((a, b) => a.from - b.from);
  const push = (a: number, b: number, y0: number, y1: number) => {
    if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
    const mid = (a + b) / 2, len = b - a, cy = (y0 + y1) / 2, h = y1 - y0;
    out.push(
      w.axis === "x"
        ? { pos: [mid, cy, w.at], size: [len, h, w.thick] }
        : { pos: [w.at, cy, mid], size: [w.thick, h, len] },
    );
  };
  let cursor = w.from;
  for (const o of ops) {
    push(cursor, o.from, w.bottom, w.top);
    push(o.from, o.to, w.bottom, o.bottom);
    push(o.from, o.to, o.top, w.top);
    cursor = o.to;
  }
  push(cursor, w.to, w.bottom, w.top);
  return out;
}

/** Glasflächen und Rahmen der Fenster (Türen in Innenwänden bleiben offen). */
export function windowParts(w: WallDef): { glass: Box[]; frames: Box[] } {
  const glass: Box[] = [], frames: Box[] = [];
  if (!w.exterior) return { glass, frames };
  const f = 0.06, d = 0.08;
  for (const o of w.openings ?? []) {
    const mid = (o.from + o.to) / 2, len = o.to - o.from, cy = (o.bottom + o.top) / 2, h = o.top - o.bottom;
    const put = (along: number, y: number, l: number, hh: number, depth: number, target: Box[]) =>
      target.push(w.axis === "x" ? { pos: [along, y, w.at], size: [l, hh, depth] } : { pos: [w.at, y, along], size: [depth, hh, l] });
    put(mid, cy, len - f, h - f, 0.03, glass);
    put(mid, o.top - f / 2, len, f, d, frames);
    put(mid, o.bottom + f / 2, len, f, d, frames);
    put(o.from + f / 2, cy, f, h, d, frames);
    put(o.to - f / 2, cy, f, h, d, frames);
    // Pfosten bei breiten Elementen (Schiebetüren, Panoramafenster)
    const parts = Math.floor(len / 1.6);
    for (let i = 1; i <= parts; i++) put(o.from + (len * i) / (parts + 1), cy, f, h, d, frames);
  }
  return { glass, frames };
}

/** Geschossdecken, Bodenbeläge und Dach als Quader */
export const SLABS = {
  egBase: { pos: [0, -0.15, 0], size: [12, 0.3, 9] } as Box,
  // OG-Decke mit Treppenauge (x 3.1–4.5, z −0.9–3.4)
  og: [
    { pos: [-1.45, 3.0, 0], size: [9.1, 0.3, 9] },
    { pos: [3.8, 3.0, -2.7], size: [1.4, 0.3, 3.6] },
    { pos: [3.8, 3.0, 3.95], size: [1.4, 0.3, 1.1] },
  ] as Box[],
  greenRoof: { pos: [5.25, 3.0, 0], size: [1.5, 0.3, 9] } as Box,
  roof: { pos: [-0.75, 6.075, 0], size: [10.8, 0.25, 9.3] } as Box,
};

export const FLOORS: { level: Level; kind: "oak" | "tile" | "stone"; pos: Vec3; size: Vec3 }[] = [
  { level: "eg", kind: "oak", pos: [-1.38, 0.01, 0], size: [8.64, 0.02, 8.4] },
  { level: "eg", kind: "tile", pos: [4.38, 0.01, -2.85], size: [2.64, 0.02, 2.7] },
  { level: "eg", kind: "stone", pos: [4.38, 0.01, 1.32], size: [2.64, 0.02, 5.64] },
  { level: "og", kind: "oak", pos: [-0.75, 3.16, 1.6], size: [9.9, 0.02, 5.2] },
  { level: "og", kind: "oak", pos: [0.8, 3.16, -2.63], size: [6.6, 0.02, 3.14] },
  { level: "og", kind: "tile", pos: [-4.1, 3.16, -2.63], size: [3.2, 0.02, 3.14] },
];

/** Treppe EG → OG: 14 Stufen, Lauf von Süden (unten) nach Norden (oben) */
export const STAIR_STEPS: Box[] = Array.from({ length: 14 }, (_, i) => {
  const rise = H.ogFloor / 14, run = 0.27;
  const z = 3.2 - i * run;
  return { pos: [3.68, rise * (i + 0.5), z], size: [0.95, rise, run] };
});

/* ------------------------------------------------------------------ Leitungen */

export interface PipePath {
  system: SystemKey;
  /** Farbe des Mediums (z. B. Kalt-/Warmwasser) */
  color: string;
  /** "pipe": sichtbares Rohr · "air": nur Luftströmung (Partikel) */
  kind: "pipe" | "air";
  radius: number;
  pts: Vec3[];
}

const COLD_WATER = "#1e88e5";
const HOT_WATER = "#e0533f";
const CIRC = "#ef8e7e";
const HEAT_FLOW = "#f07e26";
const AIR = "#7cc8e0";

export function serpentine(y: number, xa: number, xb: number, z0: number, z1: number, step: number): Vec3[] {
  const pts: Vec3[] = [];
  let flip = false;
  for (let z = z0; z <= z1 + 1e-6; z += step) {
    const zz = Math.round(z * 1000) / 1000;
    if (flip) pts.push([xb, y, zz], [xa, y, zz]);
    else pts.push([xa, y, zz], [xb, y, zz]);
    flip = !flip;
  }
  return pts;
}

function arc(a: Vec3, c: Vec3, b: Vec3, n = 12): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
      u * u * a[2] + 2 * u * t * c[2] + t * t * b[2],
    ]);
  }
  return out;
}

const heat = (pts: Vec3[], radius = 0.045): PipePath => ({ system: "heat", color: HEAT_FLOW, kind: "pipe", radius, pts });
const water = (color: string, pts: Vec3[], radius = 0.035): PipePath => ({ system: "water", color, kind: "pipe", radius, pts });
const refrigerant = (pts: Vec3[]): PipePath => ({ system: "cold", color: "#3fa9c9", kind: "pipe", radius: 0.03, pts });
const air = (pts: Vec3[]): PipePath => ({ system: "cold", color: AIR, kind: "air", radius: 0, pts });

export const PIPES: PipePath[] = [
  // Wärme: Wärmepumpe → Inneneinheit → Pufferspeicher → Verteiler → Fußbodenheizung
  heat([[6.62, 0.45, -2.5], [5.52, 0.45, -2.5], [5.52, 1.12, -2.5]], 0.055),
  heat([[5.52, 1.98, -2.5], [5.52, 2.5, -2.5], [5.52, 2.5, -2.15], [3.5, 2.5, -2.15], [3.5, 1.45, -2.15]]),
  heat([[3.2, 0.6, -2.15], [3.2, 0.6, -2.9], [2.96, 0.6, -2.9]]),
  heat([[2.85, 0.38, -2.9], [2.85, 0.04, -2.9], [2.6, 0.04, -2.9], [2.6, 0.04, -0.9], ...serpentine(0.04, 2.6, -5.4, -0.9, 3.9, 0.48)], 0.022),
  heat([[3.2, 1.1, -2.15], [3.2, 1.1, -3.3], [3.2, 3.45, -3.3], [3.2, 3.45, -4.0], [3.2, 3.55, -4.0]]),
  heat([[2.95, 3.52, -4.04], [2.95, 3.19, -4.04], [2.95, 3.19, -0.75], ...serpentine(3.19, 2.75, -5.4, -0.75, 3.9, 0.48)], 0.022),
  heat([[-2.62, 3.19, -1.5], [-5.4, 3.19, -1.5], [-5.62, 3.7, -1.5]], 0.026),

  // Wasser: Hausanschluss → Zähler → Speicher → Bad und Küche, mit Zirkulation
  water(COLD_WATER, [[5.3, 0.06, -8.5], [5.3, 0.06, -4.05], [5.3, 0.75, -4.05]], 0.05),
  water(COLD_WATER, [[5.3, 1.15, -4.05], [5.3, 1.3, -4.05], [5.0, 1.3, -4.05], [5.0, 0.3, -4.05], [5.0, 0.3, -3.7], [4.64, 0.3, -3.7]]),
  water(COLD_WATER, [[5.0, 0.3, -4.05], [5.0, 0.12, -4.05], [-2.05, 0.12, -4.05], [-2.05, 0.12, -1.75], [-2.05, 0.9, -1.75]], 0.025),
  water(COLD_WATER, [[5.3, 1.3, -4.05], [5.3, 2.6, -4.05], [3.2, 2.6, -4.05], [3.2, 3.25, -4.05], [-3.55, 3.25, -4.05], [-3.55, 3.85, -4.05]]),
  water(COLD_WATER, [[-3.55, 3.25, -4.05], [-5.15, 3.25, -4.05], [-5.15, 4.35, -4.05]], 0.025),
  water(COLD_WATER, [[-2.7, 3.25, -4.05], [-2.7, 3.25, -1.7], [-2.7, 3.6, -1.7]], 0.025),
  water(HOT_WATER, [[4.3, 1.76, -3.7], [4.3, 2.5, -3.7], [3.35, 2.5, -3.7], [3.35, 3.32, -3.7], [3.35, 3.32, -3.92], [-3.4, 3.32, -3.92], [-3.4, 3.85, -3.92]]),
  water(HOT_WATER, [[-3.4, 3.32, -3.92], [-5.0, 3.32, -3.92], [-5.0, 4.35, -3.92]], 0.025),
  water(HOT_WATER, [[3.96, 0.5, -3.7], [3.75, 0.2, -3.85], [-1.9, 0.2, -3.85], [-1.9, 0.2, -1.75], [-1.9, 0.9, -1.75]], 0.025),
  water(CIRC, [[-3.3, 3.42, -3.8], [3.45, 3.42, -3.8], [3.45, 1.1, -3.8], [3.96, 1.1, -3.7]], 0.02),

  // Kälte: Außengerät auf dem Dach → Innengeräte (Multisplit), dazu die Luftströmung in den Räumen
  refrigerant([[1.4, 6.22, -3.75], [1.4, 5.8, -3.75], [1.4, 5.8, -1.1], [1.0, 5.8, -1.1], [1.0, 5.62, -0.88]]),
  refrigerant([[1.4, 5.8, -1.1], [-3.6, 5.8, -1.1], [-3.6, 5.62, -0.88]]),
  refrigerant([[1.4, 5.8, -3.75], [1.4, 5.8, -4.05], [1.4, 2.7, -4.05], [-5.55, 2.7, -4.05], [-5.55, 2.7, 3.45], [-5.55, 2.56, 3.45]]),
  ...[-0.35, 0, 0.35].flatMap((d): PipePath[] => [
    air(arc([-3.6 + d, 5.32, -0.7], [-3.6 + d * 1.6, 5.25, 1.2], [-3.6 + d * 3, 3.7, 2.8])),
    air(arc([1.0 + d, 5.32, -0.7], [1.0 + d * 1.6, 5.25, 1.2], [1.0 + d * 3, 3.7, 2.8])),
    air(arc([-5.42, 2.28, 3.45 + d], [-3.8, 2.22, 3.45 + d * 1.6], [-2.2, 0.8, 3.45 + d * 3])),
  ]),
];

/** Zu welchem anklickbaren Bauteil eine Leitung gehört */
export function pipeComponent(p: PipePath): string | undefined {
  if (p.kind === "air") return undefined;
  if (p.system === "water") return "trinkwasserleitungen";
  if (p.system === "cold") return "kaeltemittelleitung";
  if (p.system === "heat" && p.radius < 0.024) return "fussbodenheizung";
  return undefined;
}

/** Länge und kumulierte Längen einer Polylinie */
export function measure(pts: Vec3[]): { cum: number[]; length: number } {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  return { cum, length: cum[cum.length - 1] };
}

/** Punkt bei Bogenlänge s (schreibt in out, um Allokationen in der Renderschleife zu vermeiden) */
export function pointAt(pts: Vec3[], cum: number[], s: number, out: Vec3): Vec3 {
  let i = 1;
  while (i < cum.length - 1 && cum[i] < s) i++;
  const a = pts[i - 1], b = pts[i];
  const seg = cum[i] - cum[i - 1] || 1;
  const k = Math.min(1, Math.max(0, (s - cum[i - 1]) / seg));
  out[0] = a[0] + (b[0] - a[0]) * k;
  out[1] = a[1] + (b[1] - a[1]) * k;
  out[2] = a[2] + (b[2] - a[2]) * k;
  return out;
}

/** Ob eine Leitung (teilweise) im Erdgeschoss bzw. Obergeschoss liegt */
export function pathLevels(pts: Vec3[]): Set<Level> {
  const s = new Set<Level>();
  for (const p of pts) s.add(p[1] >= H.ogFloor - 0.05 ? "og" : "eg");
  return s;
}

/* ------------------------------------------------------------------ Bauteile */

export type Placement = "aussen" | "dach" | "eg" | "og";

export interface HouseComponent {
  id: string;
  system: SystemKey;
  title: string;
  text: string;
  placement: Placement;
  /** Kameraziel */
  focus: Vec3;
  /** Kameraposition relativ zum Ziel */
  view: Vec3;
}

export const COMPONENTS: HouseComponent[] = [
  // Wärme
  { id: "waermepumpe", system: "heat", title: "Wärmepumpe", placement: "aussen", focus: [6.85, 0.55, -2.5], view: [4.6, 2.4, 3.6],
    text: "Das Außengerät entzieht der Umgebungsluft Wärme – auch an kalten Tagen. Wir planen den Aufstellort mit Blick auf Schall, Abstände und Wartungszugang." },
  { id: "inneneinheit", system: "heat", title: "Inneneinheit und Regelung", placement: "eg", focus: [5.5, 1.5, -2.5], view: [3.4, 6.4, 5.8],
    text: "Wärmetauscher, Pumpe und Regelung: Hier wird entschieden, wie viel Wärme wohin fließt. Die Einstellung bestimmt, wie effizient die Anlage arbeitet." },
  { id: "puffer", system: "heat", title: "Pufferspeicher", placement: "eg", focus: [3.5, 0.8, -2.15], view: [3.4, 6.4, 5.8],
    text: "Speichert Heizwasser und sorgt für ruhige, lange Laufzeiten der Wärmepumpe. Ob ein Puffer nötig ist, ergibt sich aus der Planung." },
  { id: "verteiler", system: "heat", title: "Heizkreisverteiler", placement: "eg", focus: [2.88, 0.65, -2.9], view: [3.4, 6.4, 5.8],
    text: "Verteilt das Heizwasser auf die einzelnen Räume. Hier wird der hydraulische Abgleich eingestellt, damit jeder Raum genau die Wärme bekommt, die er braucht." },
  { id: "fussbodenheizung", system: "heat", title: "Fußbodenheizung", placement: "eg", focus: [-1.4, 0.05, 1.5], view: [5, 9.5, 9],
    text: "Gibt Wärme großflächig und bei niedriger Vorlauftemperatur ab. Das passt ideal zur Wärmepumpe und fühlt sich gleichmäßig behaglich an." },
  { id: "badheizkoerper", system: "heat", title: "Badheizkörper", placement: "og", focus: [-5.62, 4.3, -1.6], view: [4.2, 5.6, 5.4],
    text: "Zusätzliche Wärme im Bad und trockene Handtücher – kombinierbar mit der Fußbodenheizung." },
  // Wasser
  { id: "hausanschluss", system: "water", title: "Hausanschluss und Wasserzähler", placement: "eg", focus: [5.3, 0.95, -4.05], view: [3.4, 6.4, 5.8],
    text: "Hier kommt das Trinkwasser ins Haus. Filter und Druckminderer schützen die Installation vor Partikeln und zu hohem Druck." },
  { id: "warmwasserspeicher", system: "water", title: "Warmwasserspeicher", placement: "eg", focus: [4.3, 0.9, -3.7], view: [3.4, 6.4, 5.8],
    text: "Hält warmes Trinkwasser bereit. Temperatur und Zirkulation sind so eingestellt, dass das Wasser hygienisch einwandfrei bleibt." },
  { id: "trinkwasserleitungen", system: "water", title: "Trinkwasserleitungen", placement: "og", focus: [0, 3.3, -3.95], view: [4.5, 8.5, 9],
    text: "Kalt- und Warmwasser in passend dimensionierten Leitungen, dazu eine Zirkulation: So ist warmes Wasser schnell an der Zapfstelle und nichts steht zu lange in der Leitung." },
  { id: "dusche", system: "water", title: "Bodengleiche Dusche", placement: "og", focus: [-5.2, 4.2, -3.8], view: [4.2, 5.6, 5.4],
    text: "Ebenerdig, großzügig und leicht zu reinigen. Gefälle, Abdichtung und Ablauf planen wir so, dass die Dusche dauerhaft dicht bleibt." },
  { id: "waschtisch", system: "water", title: "Waschtisch und Armatur", placement: "og", focus: [-3.5, 4.0, -4.1], view: [3.6, 5.6, 5.6],
    text: "Armaturen und Waschtisch wählen wir mit Ihnen gemeinsam aus – nach Gestaltung, Bedienung und Wassersparsamkeit." },
  { id: "wc", system: "water", title: "WC mit Vorwandinstallation", placement: "og", focus: [-2.85, 3.6, -1.7], view: [3.6, 5.6, 5.6],
    text: "Die Technik verschwindet hinter der Vorwand. Das sieht ruhig aus, ist leicht zu reinigen und bleibt für Wartung zugänglich." },
  { id: "kuechenspuele", system: "water", title: "Küchenspüle", placement: "eg", focus: [-2.0, 0.95, -1.75], view: [3.4, 6.4, 5.8],
    text: "Kalt- und Warmwasser für die Küche, auf Wunsch mit Filter für Trinkwasser direkt aus der Armatur." },
  // Kälte
  { id: "klima-aussen", system: "cold", title: "Klima-Außengerät", placement: "dach", focus: [1.4, 6.65, -3.6], view: [4.2, 3.2, 6.2],
    text: "Ein Außengerät versorgt mehrere Innengeräte (Multisplit). Auf dem Flachdach ist es unauffällig und gut für die Wartung erreichbar." },
  { id: "kaeltemittelleitung", system: "cold", title: "Kältemittelleitungen", placement: "og", focus: [-1.2, 5.8, -1.1], view: [4, 6, 8],
    text: "Isolierte Kupferleitungen verbinden Außen- und Innengeräte. Arbeiten am Kältekreis dürfen nur entsprechend qualifizierte Fachkräfte ausführen." },
  { id: "klima-schlafen", system: "cold", title: "Innengerät Schlafzimmer", placement: "og", focus: [-3.6, 5.3, -0.6], view: [2.6, 2.6, 7.2],
    text: "Kühlt im Sommer gleichmäßig und zugfrei. Moderne Innengeräte arbeiten sehr leise und können in der Übergangszeit auch heizen." },
  { id: "klima-kind", system: "cold", title: "Innengerät Kinderzimmer", placement: "og", focus: [1.0, 5.3, -0.6], view: [2.6, 2.6, 7.2],
    text: "Jeder Raum lässt sich einzeln regeln – über die Fernbedienung oder per App." },
  { id: "klima-wohnen", system: "cold", title: "Innengerät Wohnbereich", placement: "eg", focus: [-5.55, 2.2, 3.45], view: [6.2, 5.4, 2.6],
    text: "Angenehme Temperaturen im Wohnbereich, auch an heißen Tagen. Position und Luftführung planen wir so, dass niemand im Luftzug sitzt." },
];

export const OVERVIEW = { pos: [15.5, 10.5, 17.5] as Vec3, target: [-0.3, 2.4, 0.2] as Vec3 };
