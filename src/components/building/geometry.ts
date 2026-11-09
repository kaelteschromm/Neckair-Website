// Geometrie für das NECKAIR-Gebäude (Einheiten ≈ Meter/2, y = oben, z = vorne).
// Drei Systeme: Heizung (Wärme), Sanitär & Trinkwasser (Wasser), Klima & Kälte (Kälte).

export type SystemId = "heizung" | "wasser" | "klima";
export type V = [number, number, number];

/** Farben je Thema: dunkle Bühne (leuchtend) und heller Plan (tintig) */
export const SYSTEM_RGB: Record<"dark" | "light", Record<SystemId, string>> = {
  dark: { heizung: "243,140,58", wasser: "64,160,240", klima: "160,222,240" },
  light: { heizung: "214,104,24", wasser: "18,89,168", klima: "31,107,128" },
};

export interface Path { pts: V[]; cum: number[]; length: number }
export interface SceneSystem { id: SystemId; speed: number; paths: Path[]; equipment: V[][] }
export interface Face { pts: V[]; shade: number }

/** Obergeschoss-Ebene: alles darüber hebt sich in der Explosionsansicht ab */
export const UPPER_Y = 1.4;

const toPath = (pts: V[]): Path => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
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

const corners = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): V[] => [
  [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
  [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
];
type B = [number, number, number, number, number, number];
const box = (...a: B): V[][] => {
  const c = corners(...a);
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([i, j]) => [c[i], c[j]]);
};
/** Außenflächen eines Baukörpers (für die schattierte Volumendarstellung) */
const boxFaces = (...a: B): Face[] => {
  const c = corners(...a);
  return [
    { pts: [c[4], c[5], c[6], c[7]], shade: 1 },
    { pts: [c[3], c[2], c[6], c[7]], shade: 0.62 },
    { pts: [c[1], c[2], c[6], c[5]], shade: 0.45 },
    { pts: [c[0], c[3], c[7], c[4]], shade: 0.5 },
    { pts: [c[0], c[1], c[5], c[4]], shade: 0.35 },
  ];
};
const rectZ = (x0: number, y0: number, x1: number, y1: number, z: number): V[][] => [
  [[x0, y0, z], [x1, y0, z]], [[x1, y0, z], [x1, y1, z]], [[x1, y1, z], [x0, y1, z]], [[x0, y1, z], [x0, y0, z]],
];
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
  const GROUND: B = [-3, 0, -2, 3, 1.4, 2];
  const UPPER: B = [-2, 1.4, -1.6, 3.6, 2.8, 2];

  const structure: V[][] = [
    ...box(...GROUND),
    ...box(...UPPER),
    [[0.6, 0, -2], [0.6, 1.4, -2]], [[0.6, 1.4, -2], [0.6, 1.4, 2]], [[0.6, 0, 2], [0.6, 1.4, 2]],
    [[0.8, 1.4, -1.6], [0.8, 2.8, -1.6]], [[0.8, 2.8, -1.6], [0.8, 2.8, 2]],
    ...rectZ(-2.6, 0.15, 0.2, 1.25, 2),
    ...rectZ(1.2, 1.6, 3.3, 2.6, 2),
    ...rectZ(-1.7, 1.6, 0.4, 2.6, 2),
  ];
  const faces: Face[] = [...boxFaces(...GROUND), ...boxFaces(...UPPER)];
  const glass: V[][] = [
    [[-2.6, 0.15, 2], [0.2, 0.15, 2], [0.2, 1.25, 2], [-2.6, 1.25, 2]],
    [[1.2, 1.6, 2], [3.3, 1.6, 2], [3.3, 2.6, 2], [1.2, 2.6, 2]],
    [[-1.7, 1.6, 2], [0.4, 1.6, 2], [0.4, 2.6, 2], [-1.7, 2.6, 2]],
  ];
  const ground: V[][] = [];
  for (let x = -6; x <= 7; x += 1) ground.push([[x, 0, -4], [x, 0, 4]]);
  for (let z = -4; z <= 4; z += 1) ground.push([[-6, 0, z], [7, 0, z]]);

  const heizung: SceneSystem = {
    id: "heizung",
    speed: 0.55,
    equipment: [...box(3.7, 0, -0.1, 4.4, 0.7, 0.5), ...box(2.25, 0.05, 0.15, 2.6, 0.35, 0.45), ...box(1.75, 0, -1.9, 2.15, 0.9, -1.5)],
    paths: [
      toPath([[3.7, 0.25, 0.2], [2.6, 0.25, 0.3]]),
      toPath([[2.3, 0.07, 0.3], ...serpentine(0.07, 2.2, -2.7, -1.7, 1.7, 0.45)]),
      toPath([[2.45, 0.35, 0.3], [2.45, 1.47, 0.3], ...serpentine(1.47, 3.3, -1.7, -1.3, 1.7, 0.45)]),
    ],
  };

  const wasser: SceneSystem = {
    id: "wasser",
    speed: 0.6,
    equipment: [...box(-1.9, 1.4, -1.5, -1.0, 1.62, -0.85), ...box(-2.25, 0.8, -1.95, -1.6, 0.92, -1.65)],
    paths: [
      toPath([[-4.6, 0.02, -1.4], [-3, 0.05, -1.4], [-2.5, 0.05, -1.4], [-2.5, 1.55, -1.4], [-1.9, 1.55, -1.2]]),
      toPath([[-2.5, 0.86, -1.4], [-2.2, 0.86, -1.8]]),
      toPath([[-2.5, 1.55, -1.4], [-2.5, 1.55, 0.2], [-1.2, 1.55, 0.2]]),
      toPath([[-2.5, 0.3, -1.4], [-2.5, 0.3, 0.6], [-1.9, 0.3, 0.6]]),
      // Zirkulation: hält warmes Wasser in Bewegung
      toPath([[-1.2, 1.5, 0.15], [-2.4, 1.5, 0.15], [-2.4, 0.12, -1.3], [-2.0, 0.12, -1.3]]),
    ],
  };

  const unitA: V = [2.45, 2.35, -1.45];
  const unitB: V = [-1.15, 2.35, -1.45];
  const airArcs = (u: V) =>
    [-0.5, 0, 0.5].map((dx) => toPath(bezier(u, [u[0] + dx * 0.6, u[1] + 0.05, u[2] + 1.4], [u[0] + dx * 1.4, 1.75, 1.3])));
  const klima: SceneSystem = {
    id: "klima",
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

  return { structure, faces, glass, ground, systems: [heizung, wasser, klima] };
}
