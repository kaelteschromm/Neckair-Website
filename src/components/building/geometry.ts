// Geometrie für „Das intelligente Gebäude“ (Einheiten ≈ Meter/2, y = oben, z = vorne).

export type SystemId = "heizung" | "wasser" | "klima" | "lueftung";
export type VentMode = "zuluft" | "abluft" | "wrg";
type V = [number, number, number];

export const SYSTEM_COLORS = {
  heat: "243,154,74",
  water: "92,182,242",
  cold: "205,234,246",
  air: "76,195,200",
  exhaust: "226,206,184",
} as const;

export interface Path { pts: V[]; cum: number[]; length: number }
export interface SceneSystem {
  level: SystemId | "exhaust";
  color: keyof typeof SYSTEM_COLORS;
  speed: number;
  paths: Path[];
  equipment: V[][];
}

const toPath = (pts: V[]): Path => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  return { pts, cum, length: cum[cum.length - 1] };
};

export function pointAt(p: Path, s: number): V {
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < s) i++;
  const a = p.pts[i - 1], b = p.pts[i];
  const seg = p.cum[i] - p.cum[i - 1] || 1;
  const k = Math.min(1, Math.max(0, (s - p.cum[i - 1]) / seg));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): V[][] => {
  const c: V[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => [c[a], c[b]]);
};

const rectZ = (x0: number, y0: number, x1: number, y1: number, z: number): V[][] => [
  [[x0, y0, z], [x1, y0, z]], [[x1, y0, z], [x1, y1, z]], [[x1, y1, z], [x0, y1, z]], [[x0, y1, z], [x0, y0, z]],
];

/** Mäander einer Flächenheizung: Bahnen entlang x, Abstand in z. */
const serpentine = (y: number, xa: number, xb: number, z0: number, z1: number, step: number): V[] => {
  const pts: V[] = [];
  let dir = 0;
  for (let z = z0; z <= z1 + 1e-6; z += step) {
    if (dir === 0) pts.push([xa, y, z], [xb, y, z]);
    else pts.push([xb, y, z], [xa, y, z]);
    dir ^= 1;
  }
  return pts;
};

/** Quadratische Bézierkurve als Polylinie (Luftströme aus Klimageräten). */
const bezier = (a: V, c: V, b: V, n = 14): V[] => {
  const out: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
      u * u * a[2] + 2 * u * t * c[2] + t * t * b[2],
    ]);
  }
  return out;
};

export function buildScene() {
  // Baukörper: Erdgeschoss + auskragendes Obergeschoss
  const structure: V[][] = [
    ...box(-3, 0, -2, 3, 1.4, 2),
    ...box(-2, 1.4, -1.6, 3.6, 2.8, 2),
    // Innenwände
    [[0.6, 0, -2], [0.6, 1.4, -2]], [[0.6, 1.4, -2], [0.6, 1.4, 2]], [[0.6, 0, 2], [0.6, 1.4, 2]],
    [[0.8, 1.4, -1.6], [0.8, 2.8, -1.6]], [[0.8, 2.8, -1.6], [0.8, 2.8, 2]],
    // Fensterbänder vorne
    ...rectZ(-2.6, 0.15, 0.2, 1.25, 2),
    ...rectZ(1.2, 1.6, 3.3, 2.6, 2),
    ...rectZ(-1.7, 1.6, 0.4, 2.6, 2),
  ];
  const glass: V[][] = [
    [[-2.6, 0.15, 2], [0.2, 0.15, 2], [0.2, 1.25, 2], [-2.6, 1.25, 2]],
    [[1.2, 1.6, 2], [3.3, 1.6, 2], [3.3, 2.6, 2], [1.2, 2.6, 2]],
    [[-1.7, 1.6, 2], [0.4, 1.6, 2], [0.4, 2.6, 2], [-1.7, 2.6, 2]],
  ];
  // Gelände-Raster
  const ground: V[][] = [];
  for (let x = -6; x <= 7; x += 1) ground.push([[x, 0, -4], [x, 0, 4]]);
  for (let z = -4; z <= 4; z += 1) ground.push([[-6, 0, z], [7, 0, z]]);

  const heizung: SceneSystem = {
    level: "heizung",
    color: "heat",
    speed: 0.55,
    equipment: [...box(3.7, 0, -0.1, 4.4, 0.7, 0.5), ...box(2.25, 0.05, 0.15, 2.6, 0.35, 0.45)],
    paths: [
      toPath([[3.7, 0.25, 0.2], [2.6, 0.25, 0.3]]),
      toPath([[2.3, 0.07, 0.3], ...serpentine(0.07, 2.2, -2.7, -1.7, 1.7, 0.45)]),
      toPath([[2.45, 0.35, 0.3], [2.45, 1.47, 0.3], ...serpentine(1.47, 3.3, -1.7, -1.3, 1.7, 0.45)]),
    ],
  };

  const wasser: SceneSystem = {
    level: "wasser",
    color: "water",
    speed: 0.6,
    equipment: [...box(-1.9, 1.4, -1.5, -1.0, 1.62, -0.85), ...box(-2.25, 0.8, -1.95, -1.6, 0.92, -1.65)],
    paths: [
      toPath([[-4.6, 0.02, -1.4], [-3, 0.05, -1.4], [-2.5, 0.05, -1.4], [-2.5, 1.55, -1.4], [-1.9, 1.55, -1.2]]),
      toPath([[-2.5, 0.86, -1.4], [-2.2, 0.86, -1.8]]),
      // Verteilung im Obergeschoss: Waschtisch und WC
      toPath([[-2.5, 1.55, -1.4], [-2.5, 1.55, 0.2], [-1.2, 1.55, 0.2]]),
      // Erdgeschoss: Gäste-WC
      toPath([[-2.5, 0.3, -1.4], [-2.5, 0.3, 0.6], [-1.9, 0.3, 0.6]]),
    ],
  };

  const unitA: V = [2.45, 2.35, -1.45];
  const unitB: V = [-1.15, 2.35, -1.45];
  const airArcs = (u: V) =>
    [-0.5, 0, 0.5].map((dx) => toPath(bezier(u, [u[0] + dx * 0.6, u[1] + 0.05, u[2] + 1.4], [u[0] + dx * 1.4, 1.75, 1.3])));
  const klima: SceneSystem = {
    level: "klima",
    color: "cold",
    speed: 0.45,
    equipment: [
      ...box(2.4, 2.8, -1.4, 3.2, 3.3, -0.9),
      ...box(2.0, 2.35, -1.6, 2.9, 2.55, -1.5),
      ...box(-1.6, 2.35, -1.6, -0.7, 2.55, -1.5),
    ],
    paths: [
      toPath([[3.0, 2.8, -1.15], [3.6, 2.8, -1.15], [3.6, 2.45, -1.15], [3.6, 2.45, -1.55], [2.9, 2.45, -1.55]]),
      toPath([[2.0, 2.5, -1.58], [-0.7, 2.5, -1.58]]),
      ...airArcs(unitA),
      ...airArcs(unitB),
    ],
  };

  const lueftung: SceneSystem = {
    level: "lueftung",
    color: "air",
    speed: 0.5,
    equipment: [...box(1.9, 0.2, -1.95, 2.6, 1.0, -1.5), ...box(2.15, 2.8, -1.95, 2.55, 3.25, -1.65)],
    paths: [
      // Zuluft: vom Gerät in die Decken und von dort in die Räume
      toPath([[2.25, 1.0, -1.7], [2.25, 2.7, -1.7], [-1.6, 2.7, -1.7], [-1.6, 2.7, 0.9]]),
      toPath([[1.8, 2.7, -1.7], [1.8, 2.7, 1.2]]),
      toPath([[1.9, 1.3, -1.7], [-2.5, 1.3, -1.7], [-2.5, 1.3, 1.0]]),
      toPath([[-0.6, 1.3, -1.7], [-0.6, 1.3, 1.2]]),
      // Außenluft herein
      toPath([[2.35, 3.25, -1.8], [2.35, 1.0, -1.8]]),
    ],
  };
  const abluft: SceneSystem = {
    level: "exhaust",
    color: "exhaust",
    speed: 0.5,
    equipment: [],
    paths: [
      // Abluft aus Bad und Küche zurück zum Gerät, Fortluft übers Dach
      toPath([[-1.5, 2.6, -1.25], [2.1, 2.6, -1.25], [2.1, 1.0, -1.5]]),
      toPath([[-2.0, 1.2, -1.5], [1.95, 1.2, -1.5]]),
      toPath([[2.45, 1.0, -1.85], [2.45, 3.25, -1.85]]),
    ],
  };

  return { structure, glass, ground, systems: [heizung, wasser, klima, lueftung, abluft] };
}
