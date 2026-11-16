"use client";

// Gemeinsamer Szenen-Kern des NECKAIR-Hauses: Gebäude, Gelände, Technik, Licht.
// Wird von der interaktiven Ansicht (HouseScene) und vom Hero-Rendering (HeroRender, Pathtracing) genutzt –
// beide zeigen dadurch exakt dasselbe Gebäude.

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CLADDING, COMPONENTS, FLOORS, H, PIPES, PV_MODULES, SITE, SLABS, STAIR_STEPS, SUN, SYSTEMS, WALLS,
  blindsFor, measure, pathLevels, pipeComponent, pointAt, sillsFor, wallBoxes, windowParts,
  type Box, type Level, type PipePath, type SystemKey, type Vec3,
} from "./model";
import { gravelTex, lawnTex, leafTex, paverTex, plasterTex, repeat, stoneTex, woodTex } from "./textures";

export type FloorView = "all" | "eg" | "og";
export interface SceneState {
  mode: "arch" | "tech";
  system: "all" | SystemKey;
  roof: boolean;
  ghostWalls: boolean;
  floor: FloorView;
  selected: string | null;
}
export interface WorldProps {
  state: SceneState;
  onSelect: (id: string) => void;
  reduceMotion: boolean;
  lowPower: boolean;
  /** "live": Echtzeit im Browser · "render": Hero-Rendering mit Pathtracer */
  variant: "live" | "render";
  /** Dach-Abhebung in Metern (Scrollgeschichte) */
  liftRef?: MutableRefObject<number>;
}

export const HORIZON = "#ead8c3";
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 32);
const SPHERE = new THREE.SphereGeometry(1, 12, 10);

/** Unregelmäßig verformte Laubvolumen (mehrere Varianten), damit Bäume und Hecken nicht wie Kugeln wirken */
const LEAF: THREE.BufferGeometry[] = [11, 23, 37, 51].map((seed) => {
  // Ecken zusammenführen, damit die Normalen weich werden (keine Facetten)
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 4).deleteAttribute("uv").deleteAttribute("normal"));
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 4.1 + seed) * Math.cos(v.y * 3.7 - seed * 0.5) * 0.11 +
      Math.sin(v.z * 7.3 + v.x * 5.1 + seed * 1.7) * 0.06 +
      Math.sin(v.y * 11.0 + v.z * 9.0 + seed) * 0.035;
    v.multiplyScalar(1 + n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  // Kugel-Projektion als Texturkoordinaten (für die Blatt-Textur)
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    uv[i * 2] = Math.atan2(v.z, v.x) / (2 * Math.PI) + 0.5;
    uv[i * 2 + 1] = v.y * 0.5 + 0.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
});

/* ------------------------------------------------------------------ Materialien */

type MatState = "n" | "g" | SystemKey;

const BASES = {
  plaster: { color: "#ffffff", roughness: 0.93 },
  plasterGrey: { color: "#ffffff", roughness: 0.93 },
  inner: { color: "#f3f1ed", roughness: 0.95 },
  slab: { color: "#e2e0db", roughness: 0.9 },
  roof: { color: "#cfccc4", roughness: 0.9 },
  gravel: { color: "#ffffff", roughness: 1 },
  sedum: { color: "#7d8c55", roughness: 1 },
  frame: { color: "#2e3135", roughness: 0.45, metalness: 0.35 },
  blinds: { color: "#3b3e42", roughness: 0.5, metalness: 0.3 },
  wood: { color: "#e6dccf", roughness: 0.75 },
  stoneClad: { color: "#ffffff", roughness: 0.9 },
  oak: { color: "#b9956b", roughness: 0.7 },
  tile: { color: "#d7d6d2", roughness: 0.4 },
  stone: { color: "#c8c3b9", roughness: 0.8 },
  lawn: { color: "#ffffff", roughness: 1 },
  paver: { color: "#ffffff", roughness: 0.85 },
  concrete: { color: "#bdb9b1", roughness: 0.95 },
  hedge: { color: "#4b5d35", roughness: 1 },
  hedge2: { color: "#55683b", roughness: 1 },
  foliage: { color: "#5a6f3a", roughness: 0.95 },
  foliage2: { color: "#6c8243", roughness: 0.95 },
  foliage3: { color: "#7c904b", roughness: 0.95 },
  foliageFar: { color: "#7b8a5c", roughness: 1 },
  trunk: { color: "#5d4b3c", roughness: 1 },
  white: { color: "#f6f5f2", roughness: 0.35 },
  device: { color: "#e2e2de", roughness: 0.45, metalness: 0.1 },
  dark: { color: "#2b2e31", roughness: 0.55, metalness: 0.2 },
  chrome: { color: "#d9dde0", roughness: 0.15, metalness: 0.95 },
  steel: { color: "#aeb3b7", roughness: 0.3, metalness: 0.85 },
  fabric: { color: "#9c968e", roughness: 1 },
  linen: { color: "#e9e5dd", roughness: 1 },
  copper: { color: "#b87333", roughness: 0.35, metalness: 0.8 },
  mirror: { color: "#dfe6ea", roughness: 0.12, metalness: 0.25 },
  pv: { color: "#1b2533", roughness: 0.18, metalness: 0.5 },
  lamp: { color: "#fff6e8", roughness: 1, emissive: "#ffd6a0", emissiveIntensity: 2.4 },
} satisfies Record<string, THREE.MeshStandardMaterialParameters>;
type MatName = keyof typeof BASES;

const MAPS: Partial<Record<MatName, () => THREE.Texture>> = {
  plaster: () => repeat(plasterTex("white"), 4, 4),
  plasterGrey: () => repeat(plasterTex("grey"), 4, 4),
  wood: () => woodTex(),
  gravel: () => repeat(gravelTex(), 6, 1),
  foliage: () => repeat(leafTex(), 3, 3),
  foliage2: () => repeat(leafTex(), 3, 3),
  foliage3: () => repeat(leafTex(), 3, 3),
  hedge: () => repeat(leafTex(), 2, 2),
  hedge2: () => repeat(leafTex(), 2, 2),
};

class MatCache {
  private map = new Map<string, THREE.Material>();
  constructor(private variant: "live" | "render") {}
  get(name: MatName | `pipe:${string}`, state: MatState = "n"): THREE.Material {
    const key = `${name}|${state}`;
    let m = this.map.get(key);
    if (m) return m;
    const base: THREE.MeshStandardMaterialParameters = name.startsWith("pipe:")
      ? { color: name.slice(5), roughness: 0.4, metalness: 0.15 }
      : { ...BASES[name as MatName] };
    const mapFn = MAPS[name as MatName];
    if (mapFn) base.map = mapFn();
    const mat = new THREE.MeshStandardMaterial(base);
    if (state === "g") {
      mat.transparent = true;
      mat.opacity = 0.1;
      mat.depthWrite = false;
    } else if (state !== "n") {
      mat.emissive = new THREE.Color(SYSTEMS[state].color);
      mat.emissiveIntensity = 0.65;
    }
    m = mat;
    this.map.set(key, m);
    return m;
  }
  /** Textur mit Wiederholung passend zur Fläche (z. B. Naturstein, Terrassenplatten, Rasen) */
  tiled(kind: "stone" | "paver" | "lawn", rx: number, ry: number, ghost = false) {
    const key = `${kind}|${rx.toFixed(2)}|${ry.toFixed(2)}|${ghost}`;
    let m = this.map.get(key);
    if (!m) {
      const tex = kind === "stone" ? stoneTex() : kind === "paver" ? paverTex() : lawnTex();
      const mat = new THREE.MeshStandardMaterial({ map: repeat(tex, rx, ry), roughness: kind === "paver" ? 0.8 : 0.95 });
      if (ghost) {
        mat.transparent = true;
        mat.opacity = 0.1;
        mat.depthWrite = false;
      }
      m = mat;
      this.map.set(key, m);
    }
    return m;
  }
  glass(ghost: boolean) {
    const key = `glass|${ghost}`;
    let m = this.map.get(key);
    if (!m) {
      m =
        this.variant === "render" && !ghost
          ? new THREE.MeshPhysicalMaterial({ color: "#d8e4ea", roughness: 0.02, metalness: 0, transmission: 0.92, ior: 1.5, thickness: 0.02 })
          : new THREE.MeshStandardMaterial({
              color: "#9fb7c4", roughness: 0.04, metalness: 0.35, transparent: true, opacity: ghost ? 0.06 : 0.34, depthWrite: false, envMapIntensity: 2,
            });
      this.map.set(key, m);
    }
    return m;
  }
  translucent(color: string, opacity: number) {
    const key = `tr|${color}|${opacity}`;
    let m = this.map.get(key);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      this.map.set(key, m);
    }
    return m;
  }
  dispose() {
    this.map.forEach((m) => {
      (m as THREE.MeshStandardMaterial).map?.dispose();
      m.dispose();
    });
    this.map.clear();
  }
}

/* ------------------------------------------------------------------ Kontext */

interface Ctx {
  mats: MatCache;
  state: SceneState;
  onSelect: (id: string) => void;
  reduceMotion: boolean;
  lowPower: boolean;
  variant: "live" | "render";
  liftRef?: MutableRefObject<number>;
}
const SceneCtx = createContext<Ctx | null>(null);
const useScene = () => useContext(SceneCtx)!;

/** Darstellungszustand eines Bauteils/Systems: normal, gedimmt oder hervorgehoben */
interface CompLook { state: MatState }
const CompCtx = createContext<CompLook>({ state: "n" });
/** Material für ein Teil eines Bauteils (folgt Hervorhebung bzw. Dimmung) */
function useM() {
  const { mats } = useScene();
  const { state } = useContext(CompCtx);
  return (name: MatName) => mats.get(name, state);
}

/* ------------------------------------------------------------------ Grundbausteine */

function Boxes({ boxes, mat, shadow = true }: { boxes: Box[]; mat: THREE.Material; shadow?: boolean }) {
  return (
    <>
      {boxes.map((b, i) => (
        <mesh key={i} geometry={BOX} material={mat} position={b.pos} scale={b.size} castShadow={shadow} receiveShadow={shadow} />
      ))}
    </>
  );
}
function B({ p, s, m, shadow = true, r }: { p: Vec3; s: Vec3; m: THREE.Material; shadow?: boolean; r?: Vec3 }) {
  return <mesh geometry={BOX} material={m} position={p} scale={s} rotation={r} castShadow={shadow} receiveShadow={shadow} />;
}
/** Zylinder; axis gibt die Längsachse an */
function C({ p, r, h, m, axis = "y" }: { p: Vec3; r: number; h: number; m: THREE.Material; axis?: "x" | "y" | "z" }) {
  const rot: Vec3 = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  return <mesh geometry={CYL} material={m} position={p} rotation={rot} scale={[r, h, r]} castShadow receiveShadow />;
}

/* ------------------------------------------------------------------ Gebäude */

function useLevelLook(level: Level) {
  const { state } = useScene();
  const hidden = level === "og" && state.floor === "eg";
  const levelGhost = level === "eg" && state.floor === "og";
  return { hidden, levelGhost, wallGhost: levelGhost || state.ghostWalls };
}

function LevelShell({ level }: { level: Level }) {
  const { mats } = useScene();
  const { hidden, levelGhost, wallGhost } = useLevelLook(level);
  const parts = useMemo(() => {
    const ext: Box[] = [], int: Box[] = [], glass: Box[] = [], frames: Box[] = [], blinds: Box[] = [], slats: Box[] = [], sills: Box[] = [];
    for (const w of WALLS.filter((x) => x.level === level)) {
      (w.exterior ? ext : int).push(...wallBoxes(w));
      const wp = windowParts(w);
      glass.push(...wp.glass);
      frames.push(...wp.frames);
      for (const b of blindsFor(w)) {
        blinds.push(b.box);
        slats.push(...b.slats);
      }
      sills.push(...sillsFor(w));
    }
    return { ext, int, glass, frames, blinds, slats, sills };
  }, [level]);
  if (hidden) return null;
  const g = wallGhost ? "g" : "n";
  const extMat = mats.get(level === "eg" ? "plaster" : "plasterGrey", g);
  return (
    <group>
      <Boxes boxes={parts.ext} mat={extMat} shadow={!wallGhost} />
      <Boxes boxes={parts.int} mat={mats.get("inner", g)} shadow={!wallGhost} />
      <Boxes boxes={parts.glass} mat={mats.glass(wallGhost)} shadow={false} />
      <Boxes boxes={parts.frames} mat={mats.get("frame", g)} shadow={!wallGhost} />
      <Boxes boxes={parts.blinds} mat={mats.get("blinds", g)} shadow={!wallGhost} />
      <Boxes boxes={parts.slats} mat={mats.get("blinds", g)} shadow={!wallGhost} />
      <Boxes boxes={parts.sills} mat={mats.get("frame", g)} shadow={!wallGhost} />
      <Cladding level={level} ghost={wallGhost} />
      {FLOORS.filter((f) => f.level === level).map((f, i) => (
        <B key={i} p={f.pos} s={f.size} m={mats.get(f.kind, levelGhost ? "g" : "n")} />
      ))}
      {level === "eg" ? <EgInterior ghost={levelGhost} /> : <OgInterior />}
      <Lamps level={level} />
    </group>
  );
}

/** Holzlamellen und Natursteinflächen vor der Fassade */
function Cladding({ level, ghost }: { level: Level; ghost: boolean }) {
  const { mats } = useScene();
  const items = useMemo(() => CLADDING.filter((c) => (level === "eg" ? c.bottom < H.egTop : c.bottom >= H.ogFloor - 0.01)), [level]);
  return (
    <>
      {items.map((c, i) => {
        const len = c.to - c.from, h = c.top - c.bottom, mid = (c.from + c.to) / 2, cy = (c.bottom + c.top) / 2;
        if (c.kind === "stone") {
          const d = 0.06, off = c.face + (c.dir * d) / 2;
          const mat = mats.tiled("stone", len / 1.6, h / 1.6, ghost);
          return <B key={i} p={c.axis === "x" ? [mid, cy, off] : [off, cy, mid]} s={c.axis === "x" ? [len, h, d] : [d, h, len]} m={mat} shadow={!ghost} />;
        }
        // Lamellen: 45 mm breit, 25 mm Fuge, auf dunkler Unterkonstruktion
        const n = Math.max(1, Math.floor(len / 0.07));
        const step = len / n;
        const back = c.face + c.dir * 0.01;
        return (
          <group key={i}>
            <B p={c.axis === "x" ? [mid, cy, back] : [back, cy, mid]} s={c.axis === "x" ? [len, h, 0.02] : [0.02, h, len]} m={mats.get("frame", ghost ? "g" : "n")} shadow={false} />
            {Array.from({ length: n }, (_, k) => {
              const a = c.from + step * (k + 0.5), off = c.face + c.dir * 0.045;
              return <B key={k} p={c.axis === "x" ? [a, cy, off] : [off, cy, a]} s={c.axis === "x" ? [0.045, h, 0.05] : [0.05, h, 0.045]} m={mats.get("wood", ghost ? "g" : "n")} shadow={!ghost} />;
            })}
          </group>
        );
      })}
    </>
  );
}

/** Warme Innenbeleuchtung: Deckenleuchten (leuchtende Flächen) */
function Lamps({ level }: { level: Level }) {
  const { mats, state } = useScene();
  if (state.mode === "tech") return null;
  const y = level === "eg" ? H.egTop - 0.03 : H.ogTop - 0.03;
  const spots: Vec3[] = level === "eg" ? [[-3.2, y, 1.6], [-2.1, y, -1.75], [1.2, y, -2.0]] : [[-3.6, y, 2.2], [1.2, y, 2.4]];
  return (
    <>
      {spots.map((p, i) => (
        <B key={i} p={p} s={[0.9, 0.03, 0.9]} m={mats.get("lamp")} shadow={false} />
      ))}
    </>
  );
}

function EgInterior({ ghost }: { ghost: boolean }) {
  const { mats } = useScene();
  const g = ghost ? "g" : "n";
  const w = mats.get("white", g), oak = mats.get("oak", g), fab = mats.get("fabric", g), dark = mats.get("dark", g), stone = mats.get("stone", g);
  return (
    <group>
      {/* Küche: Zeile an der Nordwand und Insel */}
      <B p={[-2.4, 0.45, -3.9]} s={[4.0, 0.9, 0.6]} m={w} />
      <B p={[-2.4, 0.92, -3.9]} s={[4.04, 0.04, 0.64]} m={stone} />
      <B p={[-2.1, 0.45, -1.75]} s={[2.4, 0.9, 0.9]} m={w} />
      <B p={[-2.1, 0.92, -1.75]} s={[2.5, 0.04, 1.0]} m={stone} />
      {/* Essplatz */}
      <B p={[1.2, 0.74, -2.0]} s={[2.0, 0.05, 0.95]} m={oak} />
      {[[0.35, -2.35], [2.05, -2.35], [0.35, -1.65], [2.05, -1.65]].map(([x, z], i) => (
        <B key={i} p={[x, 0.36, z]} s={[0.06, 0.72, 0.06]} m={dark} />
      ))}
      <B p={[1.2, 0.23, -2.85]} s={[1.8, 0.06, 0.38]} m={oak} />
      <B p={[1.2, 0.23, -1.15]} s={[1.8, 0.06, 0.38]} m={oak} />
      {/* Wohnen: Sofa, Teppich, Couchtisch, Regal */}
      <B p={[-3.4, 0.22, 1.05]} s={[2.8, 0.44, 0.95]} m={fab} />
      <B p={[-3.4, 0.55, 0.68]} s={[2.8, 0.42, 0.22]} m={fab} />
      <B p={[-4.68, 0.22, 1.9]} s={[0.95, 0.44, 0.9]} m={fab} />
      <B p={[-3.2, 0.012, 2.4]} s={[3.2, 0.012, 2.0]} m={mats.get("linen", g)} shadow={false} />
      <B p={[-3.2, 0.2, 2.45]} s={[1.2, 0.06, 0.7]} m={oak} />
      <B p={[0.6, 0.9, -0.2]} s={[0.4, 1.8, 1.6]} m={oak} />
    </group>
  );
}

function OgInterior() {
  const { mats } = useScene();
  const w = mats.get("white"), oak = mats.get("oak"), linen = mats.get("linen"), fab = mats.get("fabric");
  const y = H.ogFloor;
  return (
    <group>
      {/* Schlafzimmer */}
      <B p={[-3.6, y + 0.22, 2.4]} s={[1.9, 0.44, 2.1]} m={oak} />
      <B p={[-3.6, y + 0.5, 2.5]} s={[1.8, 0.14, 1.9]} m={linen} />
      <B p={[-3.6, y + 0.6, 1.38]} s={[1.9, 0.75, 0.08]} m={fab} />
      <B p={[-5.4, y + 1.1, -0.0]} s={[0.55, 2.2, 1.6]} m={w} />
      {/* Kinderzimmer */}
      <B p={[2.4, y + 0.2, 2.9]} s={[0.95, 0.4, 2.0]} m={oak} />
      <B p={[2.4, y + 0.44, 2.95]} s={[0.9, 0.12, 1.85]} m={linen} />
      <B p={[0.2, y + 0.74, 3.9]} s={[1.4, 0.04, 0.6]} m={oak} />
      <B p={[0.2, y + 0.36, 3.9]} s={[0.05, 0.72, 0.5]} m={w} />
      {/* Galerie-Geländer aus Glas am Treppenauge */}
      <B p={[3.1, y + 0.5, 1.25]} s={[0.03, 1.0, 4.3]} m={mats.glass(false)} shadow={false} />
    </group>
  );
}

const attic = (b: Box, h = 0.22, t = 0.18): Box[] => {
  const [x, y, z] = b.pos, [sx, sy, sz] = b.size, top = y + sy / 2 + h / 2;
  return [
    { pos: [x, top, z - sz / 2 + t / 2], size: [sx, h, t] },
    { pos: [x, top, z + sz / 2 - t / 2], size: [sx, h, t] },
    { pos: [x - sx / 2 + t / 2, top, z], size: [t, h, sz] },
    { pos: [x + sx / 2 - t / 2, top, z], size: [t, h, sz] },
  ];
};

function Slabs() {
  const { mats, state, liftRef } = useScene();
  const roofGroup = useRef<THREE.Group>(null);
  const ogVisible = state.floor !== "eg";
  const roofVisible = state.roof && state.floor === "all";
  // Scrollgeschichte: Das Dach hebt sich ab, bevor die Technik sichtbar wird
  useFrame(() => {
    if (roofGroup.current && liftRef) roofGroup.current.position.y = liftRef.current;
  });
  return (
    <group>
      <B p={SLABS.egBase.pos} s={SLABS.egBase.size} m={mats.get("slab")} />
      {ogVisible ? <Boxes boxes={SLABS.og} mat={mats.get("slab")} /> : null}
      {/* Gründach über dem eingeschossigen Teil gehört zum EG */}
      {roofVisible ? (
        <group>
          <B p={SLABS.greenRoof.pos} s={SLABS.greenRoof.size} m={mats.get("roof")} />
          <B p={[SLABS.greenRoof.pos[0], 3.16, 0]} s={[1.3, 0.04, 8.8]} m={mats.get("sedum")} shadow={false} />
          <Boxes boxes={attic(SLABS.greenRoof, 0.18, 0.12)} mat={mats.get("frame")} />
        </group>
      ) : null}
      {roofVisible ? (
        <group ref={roofGroup}>
          <B p={SLABS.roof.pos} s={SLABS.roof.size} m={mats.get("roof")} />
          <B p={[SLABS.roof.pos[0], H.roofTop + 0.01, 0]} s={[10.4, 0.02, 8.9]} m={mats.get("gravel")} shadow={false} />
          <Boxes boxes={attic(SLABS.roof)} mat={mats.get("frame")} />
          {PV_MODULES.map((m, i) => (
            <group key={i} position={m.pos} rotation={[0, 0, m.tilt]}>
              <B p={[0, 0, 0]} s={[1.0, 0.035, 1.12]} m={mats.get("pv")} />
              <B p={[0, -0.12, 0]} s={[0.05, 0.2, 1.0]} m={mats.get("steel")} shadow={false} />
            </group>
          ))}
        </group>
      ) : null}
    </group>
  );
}

function Stairs() {
  const { mats, state } = useScene();
  const g = state.floor === "og" ? "g" : "n";
  return <Boxes boxes={STAIR_STEPS} mat={mats.get("oak", g)} />;
}

/* ------------------------------------------------------------------ Gelände */

/** Laubbaum: Stamm, zwei Äste und eine lockere Krone aus verformten Volumen */
const CROWN: [number, number, number, number][] = [
  [0, 4.6, 0, 1.55], [1.1, 4.1, 0.5, 1.15], [-1.0, 4.2, -0.4, 1.2], [0.4, 5.6, -0.3, 1.1], [-0.5, 5.3, 0.7, 1.0],
  [0.9, 5.0, -0.9, 0.95], [-1.3, 4.9, 0.6, 0.85], [0.1, 3.6, 1.0, 0.9],
];
function Tree({ x, z, s, far = false }: { x: number; z: number; s: number; far?: boolean }) {
  const { mats } = useScene();
  const blobs = far ? CROWN.slice(0, 4) : CROWN;
  const rot = (x * 13 + z * 7) % 6.28;
  return (
    <group position={[x, 0, z]} scale={s} rotation={[0, rot, 0]}>
      <mesh geometry={CYL} material={mats.get("trunk")} position={[0, 1.8, 0]} scale={[0.13, 3.6, 0.13]} castShadow />
      <mesh geometry={CYL} material={mats.get("trunk")} position={[0.45, 3.3, 0.2]} rotation={[0.3, 0, -0.55]} scale={[0.06, 1.4, 0.06]} castShadow />
      <mesh geometry={CYL} material={mats.get("trunk")} position={[-0.4, 3.4, -0.1]} rotation={[-0.2, 0, 0.5]} scale={[0.06, 1.3, 0.06]} castShadow />
      {blobs.map(([bx, by, bz, r], i) => (
        <mesh key={i} geometry={LEAF[i % LEAF.length]} material={mats.get(far ? "foliageFar" : (["foliage", "foliage2", "foliage3"] as const)[i % 3])} position={[bx, by, bz]} scale={[r, r * 0.85, r]} castShadow={!far} receiveShadow />
      ))}
    </group>
  );
}

/** Geschnittene Hecke aus aneinandergereihten, leicht unregelmäßigen Volumen */
function Hedge({ from, to, h = 1.6, d = 0.8 }: { from: [number, number]; to: [number, number]; h?: number; d?: number }) {
  const { mats } = useScene();
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const n = Math.max(1, Math.round(len / 0.9));
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        return (
          <mesh
            key={i}
            geometry={LEAF[i % LEAF.length]}
            material={mats.get(i % 2 ? "hedge" : "hedge2")}
            position={[from[0] + (to[0] - from[0]) * t, h / 2, from[1] + (to[1] - from[1]) * t]}
            rotation={[0, -ang, 0]}
            scale={[(len / n) * 0.8, h / 2, d / 2]}
            castShadow
            receiveShadow
          />
        );
      })}
    </>
  );
}

// Bäume auf dem Grundstück (hinter dem Haus) und eine Baumkulisse am Horizont
const TREES: [number, number, number][] = [[-10.5, -7, 1.05], [-12.5, -3.5, 0.85], [9.5, -8.5, 1.15], [-3.5, -12.5, 0.95], [13, -4, 0.8], [3.5, -13, 0.75]];
const FAR_TREES: [number, number, number][] = Array.from({ length: 34 }, (_, i) => {
  const a = -0.4 + (i / 34) * Math.PI * 1.4;
  const r = 52 + ((i * 37) % 17);
  return [Math.cos(a + Math.PI) * r, Math.sin(a + Math.PI) * r * 0.9 - 6, 1.2 + ((i * 13) % 7) / 10];
});

function Site() {
  const { mats, lowPower, variant } = useScene();
  const p = SITE.plot;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow material={mats.tiled("lawn", 90, 90)}>
        <circleGeometry args={[variant === "render" ? 400 : 200, 64]} />
      </mesh>
      {/* Terrasse aus großformatigen Natursteinplatten, Kiesstreifen, Wege */}
      <B p={SITE.terrace.pos} s={SITE.terrace.size} m={mats.tiled("paver", SITE.terrace.size[0] / 0.8, SITE.terrace.size[2] / 0.8)} />
      <Boxes boxes={SITE.gravel} mat={mats.get("gravel")} shadow={false} />
      {SITE.path.map((b, i) => (
        <B key={i} p={b.pos} s={b.size} m={mats.tiled("paver", b.size[0] / 0.8, b.size[2] / 0.8)} />
      ))}
      {/* Hainbuchenhecke an der Grundstücksgrenze (nach Süden offen zum Garten) */}
      <Hedge from={[p.minX, p.minZ]} to={[p.maxX, p.minZ]} />
      <Hedge from={[p.minX, p.minZ]} to={[p.minX, 3]} />
      <Hedge from={[p.maxX, p.minZ]} to={[p.maxX, 3]} />
      {/* Beet mit Gräsern vor der Terrasse */}
      {[-5.6, -4.7, 1.6, 2.5].map((x, i) => (
        <mesh key={i} geometry={LEAF[i % LEAF.length]} material={mats.get("foliage2")} position={[x, 0.3, 8.1]} scale={[0.5, 0.38, 0.42]} castShadow receiveShadow />
      ))}
      {(lowPower ? TREES.slice(0, 3) : TREES).map(([x, z, s], i) => (
        <Tree key={i} x={x} z={z} s={s} />
      ))}
      {(lowPower ? FAR_TREES.filter((_, i) => i % 3 === 0) : FAR_TREES).map(([x, z, s], i) => (
        <Tree key={`f${i}`} x={x} z={z} s={s} far />
      ))}
      {/* Gartenmöbel auf der Terrasse */}
      <B p={[-3.6, 0.78, 6.3]} s={[1.8, 0.05, 0.9]} m={mats.get("oak")} />
      <B p={[-3.6, 0.44, 6.3]} s={[0.1, 0.7, 0.6]} m={mats.get("dark")} />
      <B p={[-3.6, 0.5, 5.55]} s={[1.6, 0.05, 0.4]} m={mats.get("oak")} />
      <B p={[-3.6, 0.5, 7.05]} s={[1.6, 0.05, 0.4]} m={mats.get("oak")} />
      <B p={[0.6, 0.25, 6.6]} s={[0.8, 0.42, 1.8]} m={mats.get("fabric")} />
    </group>
  );
}

/** Himmel als Verlauf (Spätnachmittag) – nur in der Echtzeitansicht; das Rendering nutzt eine Umgebungstextur */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: new THREE.Color("#86a5c2") }, mid: { value: new THREE.Color("#c9d3d8") }, horizon: { value: new THREE.Color(HORIZON) } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP; void main(){ float h = max(vP.y, 0.0); vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h)); gl_FragColor = vec4(c, 1.0); }",
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} scale={300} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/** Licht: tiefe Nachmittagssonne aus Westsüdwest, Himmelslicht, warme Innenbeleuchtung */
export function Lights({ lowPower, variant }: { lowPower: boolean; variant: "live" | "render" }) {
  const shadow = lowPower ? 1024 : 4096;
  const d = 40;
  return (
    <>
      {variant === "live" ? <hemisphereLight args={["#cfdbe6", "#9c8f78", 0.85]} /> : null}
      <directionalLight
        position={[SUN.dir[0] * d, SUN.dir[1] * d, SUN.dir[2] * d]}
        color={SUN.color}
        intensity={variant === "live" ? 3.2 : 3.6}
        castShadow
        shadow-mapSize={[shadow, shadow]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      {variant === "live" && !lowPower ? (
        <>
          <pointLight position={[-3, 2.4, 1.5]} color="#ffc98c" intensity={5} distance={7} decay={2} />
          <pointLight position={[-3.5, 5.5, 2]} color="#ffc98c" intensity={4} distance={6} decay={2} />
        </>
      ) : null}
    </>
  );
}
/* ------------------------------------------------------------------ Bauteile */

const COMP_BY_ID = new Map(COMPONENTS.map((c) => [c.id, c]));

function componentVisible(id: string, state: SceneState) {
  const c = COMP_BY_ID.get(id);
  if (!c) return true;
  if (c.placement === "og" && state.floor === "eg") return false;
  if (c.placement === "dach" && state.floor === "eg") return false;
  return true;
}
function lookFor(system: SystemKey, id: string | undefined, state: SceneState): MatState {
  if (id && state.selected === id) return system;
  if (state.mode === "tech" && state.system !== "all" && state.system !== system) return "g";
  return "n";
}

function Comp({ id, children }: { id: string; children: ReactNode }) {
  const { state, onSelect } = useScene();
  const c = COMP_BY_ID.get(id)!;
  const look = useMemo(() => ({ state: lookFor(c.system, id, state) }), [c.system, id, state]);
  if (!componentVisible(id, state)) return null;
  return (
    <group
      name={id}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 6) return;
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <CompCtx.Provider value={look}>{children}</CompCtx.Provider>
    </group>
  );
}

function Fan({ p, r, axis, speed }: { p: Vec3; r: number; axis: "x" | "z"; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  const { reduceMotion } = useScene();
  const m = useM();
  useFrame((_, dt) => {
    if (!ref.current || reduceMotion) return;
    if (axis === "x") ref.current.rotation.x += dt * speed;
    else ref.current.rotation.z += dt * speed;
  });
  const blade = axis === "x" ? ([0.02, r * 1.8, 0.09] as Vec3) : ([0.09, r * 1.8, 0.02] as Vec3);
  return (
    <group ref={ref} position={p}>
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a, i) => (
        <mesh key={i} geometry={BOX} material={m("dark")} rotation={axis === "x" ? [a, 0, 0] : [0, 0, a]} scale={blade} />
      ))}
    </group>
  );
}

function HeatDevices() {
  return (
    <>
      <Comp id="waermepumpe">
        <Inner>
          {(mm) => (
            <>
              <B p={[6.85, 0.04, -2.5]} s={[0.8, 0.08, 1.45]} m={mm("concrete")} />
              <B p={[6.85, 0.62, -2.5]} s={[0.5, 1.0, 1.25]} m={mm("device")} />
              <B p={[6.85, 1.13, -2.5]} s={[0.54, 0.04, 1.29]} m={mm("dark")} />
              <C p={[7.105, 0.62, -2.5]} r={0.38} h={0.02} m={mm("dark")} axis="x" />
              <Fan p={[7.125, 0.62, -2.5]} r={0.33} axis="x" speed={6} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="inneneinheit">
        <Inner>
          {(mm) => (
            <>
              <B p={[5.52, 1.55, -2.5]} s={[0.34, 0.86, 0.6]} m={mm("white")} />
              <B p={[5.345, 1.78, -2.5]} s={[0.01, 0.12, 0.22]} m={mm("dark")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="puffer">
        <Inner>
          {(mm) => (
            <>
              <C p={[3.5, 0.75, -2.15]} r={0.3} h={1.45} m={mm("white")} />
              <C p={[3.5, 1.48, -2.15]} r={0.31} h={0.03} m={mm("steel")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="verteiler">
        <Inner>
          {(mm) => (
            <>
              <B p={[2.89, 0.65, -2.9]} s={[0.1, 0.55, 0.75]} m={mm("steel")} />
              <B p={[3.2, 3.8, -4.12]} s={[0.75, 0.5, 0.1]} m={mm("steel")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="badheizkoerper">
        <Inner>
          {(mm) => (
            <group>
              <C p={[-5.64, 4.3, -1.85]} r={0.018} h={1.2} m={mm("white")} />
              <C p={[-5.64, 4.3, -1.35]} r={0.018} h={1.2} m={mm("white")} />
              {Array.from({ length: 9 }, (_, i) => (
                <C key={i} p={[-5.64, 3.78 + i * 0.13, -1.6]} r={0.014} h={0.5} m={mm("white")} axis="z" />
              ))}
            </group>
          )}
        </Inner>
      </Comp>
      {/* Fußbodenheizung: die Rohre selbst sind das Bauteil (siehe Pipes) */}
    </>
  );
}

/** Hilfskomponente: liefert die Material-Funktion im Kontext des umgebenden Bauteils */
function Inner({ children }: { children: (m: (n: MatName) => THREE.Material) => ReactNode }) {
  const m = useM();
  return <>{children(m)}</>;
}

function WaterDevices() {
  const { mats } = useScene();
  const y = H.ogFloor;
  return (
    <>
      <Comp id="hausanschluss">
        <Inner>
          {(m) => (
            <>
              <C p={[5.3, 0.88, -4.05]} r={0.075} h={0.26} m={m("chrome")} />
              <B p={[5.3, 1.08, -4.05]} s={[0.18, 0.14, 0.18]} m={m("dark")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="warmwasserspeicher">
        <Inner>
          {(m) => (
            <>
              <C p={[4.3, 0.88, -3.7]} r={0.34} h={1.75} m={m("white")} />
              <C p={[4.3, 1.76, -3.7]} r={0.35} h={0.03} m={m("steel")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="dusche">
        <Inner>
          {(m) => (
            <>
              <B p={[-5.15, y + 0.02, -3.65]} s={[1.05, 0.04, 1.05]} m={m("stone")} />
              <B p={[-4.62, y + 1.05, -3.55]} s={[0.02, 2.0, 1.1]} m={mats.glass(false)} shadow={false} />
              <C p={[-5.15, y + 2.1, -3.85]} r={0.14} h={0.02} m={m("chrome")} />
              <C p={[-5.15, y + 2.13, -4.0]} r={0.012} h={0.3} m={m("chrome")} axis="z" />
              <B p={[-5.08, y + 1.2, -4.15]} s={[0.2, 0.08, 0.06]} m={m("chrome")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="waschtisch">
        <Inner>
          {(m) => (
            <>
              <B p={[-3.5, y + 0.8, -3.95]} s={[1.3, 0.08, 0.5]} m={m("oak")} />
              <B p={[-3.5, y + 0.89, -3.95]} s={[0.55, 0.1, 0.38]} m={m("white")} />
              <C p={[-3.5, y + 1.0, -4.12]} r={0.02} h={0.22} m={m("chrome")} />
              <B p={[-3.5, y + 1.1, -4.05]} s={[0.03, 0.025, 0.16]} m={m("chrome")} />
              <B p={[-3.5, y + 1.7, -4.18]} s={[1.1, 0.8, 0.02]} m={m("mirror")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="wc">
        <Inner>
          {(m) => (
            <>
              <B p={[-2.62, y + 0.6, -1.7]} s={[0.1, 1.2, 0.7]} m={m("white")} />
              <B p={[-2.88, y + 0.42, -1.7]} s={[0.55, 0.36, 0.38]} m={m("white")} />
              <B p={[-2.56, y + 1.0, -1.7]} s={[0.02, 0.16, 0.26]} m={m("chrome")} />
            </>
          )}
        </Inner>
      </Comp>
      <Comp id="kuechenspuele">
        <Inner>
          {(m) => (
            <>
              <B p={[-2.0, 0.935, -1.75]} s={[0.62, 0.02, 0.44]} m={m("steel")} />
              <C p={[-2.0, 1.08, -2.02]} r={0.02} h={0.3} m={m("chrome")} />
              <B p={[-2.0, 1.22, -1.92]} s={[0.03, 0.025, 0.22]} m={m("chrome")} />
            </>
          )}
        </Inner>
      </Comp>
    </>
  );
}

function ColdDevices() {
  const { state, mats } = useScene();
  const showRooms = state.mode === "tech" && state.system === "cold";
  return (
    <>
      <Comp id="klima-aussen">
        <Inner>
          {(m) => (
            <>
              <B p={[1.4, 6.26, -3.6]} s={[1.15, 0.06, 0.5]} m={m("dark")} />
              <B p={[1.4, 6.69, -3.6]} s={[1.0, 0.8, 0.4]} m={m("device")} />
              <C p={[1.25, 6.69, -3.39]} r={0.29} h={0.02} m={m("dark")} axis="z" />
              <Fan p={[1.25, 6.69, -3.375]} r={0.25} axis="z" speed={7} />
            </>
          )}
        </Inner>
      </Comp>
      {([
        ["klima-schlafen", [-3.6, 5.45, -0.83], [0.95, 0.3, 0.22]],
        ["klima-kind", [1.0, 5.45, -0.83], [0.95, 0.3, 0.22]],
        ["klima-wohnen", [-5.59, 2.4, 3.45], [0.22, 0.3, 0.95]],
      ] as [string, Vec3, Vec3][]).map(([id, p, s]) => (
        <Comp key={id} id={id}>
          <Inner>
            {(m) => (
              <>
                <B p={p} s={s} m={m("white")} />
                <B p={[p[0] + (s[0] < 0.5 ? 0.1 : 0), p[1] - 0.13, p[2] + (s[0] < 0.5 ? 0 : 0.1)]} s={[s[0] < 0.5 ? 0.02 : s[0] * 0.85, 0.03, s[0] < 0.5 ? s[2] * 0.85 : 0.02]} m={m("dark")} />
              </>
            )}
          </Inner>
        </Comp>
      ))}
      {showRooms ? (
        <group>
          {/* klimatisierte Räume */}
          {state.floor !== "eg" ? <B p={[-3.28, 4.55, 1.63]} s={[4.84, 2.78, 5.13]} m={mats.translucent(SYSTEMS.cold.color, 0.07)} shadow={false} /> : null}
          {state.floor !== "eg" ? <B p={[1.16, 4.55, 1.63]} s={[3.8, 2.78, 5.13]} m={mats.translucent(SYSTEMS.cold.color, 0.07)} shadow={false} /> : null}
          {state.floor !== "og" ? <B p={[-1.38, 1.42, 1.85]} s={[8.6, 2.83, 4.7]} m={mats.translucent(SYSTEMS.cold.color, 0.05)} shadow={false} /> : null}
        </group>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ Leitungen und Fluss */

interface BuiltPipe { path: PipePath; geom: THREE.BufferGeometry | null; cum: number[]; length: number; levels: Set<Level>; comp?: string }

function buildPipeGeometry(p: PipePath): THREE.BufferGeometry | null {
  if (p.kind !== "pipe") return null;
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 1; i < p.pts.length; i++) {
    const a = new THREE.Vector3(...p.pts[i - 1]), b = new THREE.Vector3(...p.pts[i]);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < 1e-4) continue;
    const g = new THREE.CylinderGeometry(p.radius, p.radius, len, 10, 1, true);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    parts.push(g);
  }
  for (let i = 0; i < p.pts.length; i++) {
    const s = new THREE.SphereGeometry(p.radius * 1.05, 10, 8);
    s.translate(...p.pts[i]);
    parts.push(s);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return merged;
}

function usePipes(): BuiltPipe[] {
  const built = useMemo(
    () =>
      PIPES.map((path) => {
        const { cum, length } = measure(path.pts);
        return { path, geom: buildPipeGeometry(path), cum, length, levels: pathLevels(path.pts), comp: pipeComponent(path) };
      }),
    [],
  );
  useEffect(() => () => built.forEach((b) => b.geom?.dispose()), [built]);
  return built;
}

function pipeVisible(b: BuiltPipe, state: SceneState) {
  if (state.mode !== "tech") return false;
  if (state.floor === "eg" && !b.levels.has("eg")) return false;
  return true;
}

function Pipes({ pipes }: { pipes: BuiltPipe[] }) {
  const { state, mats, onSelect } = useScene();
  return (
    <group>
      {pipes.map((b, i) => {
        if (!b.geom || !pipeVisible(b, state)) return null;
        const look = lookFor(b.path.system, b.comp, state);
        const base = b.path.system === "cold" ? mats.get("copper", look) : mats.get(`pipe:${b.path.color}`, look);
        return (
          <mesh
            key={i}
            geometry={b.geom}
            material={base}
            castShadow={false}
            onClick={(e) => {
              if (!b.comp || e.delta > 6) return;
              e.stopPropagation();
              onSelect(b.comp);
            }}
            onPointerOver={(e) => {
              if (!b.comp) return;
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => (document.body.style.cursor = "")}
          />
        );
      })}
    </group>
  );
}

/** Wärme-, Wasser- und Luftfluss als wandernde Punkte – eine InstancedMesh je Farbe */
function Flow({ pipes }: { pipes: BuiltPipe[] }) {
  const { state, reduceMotion, lowPower } = useScene();
  const groups = useMemo(() => {
    const map = new Map<string, { color: string; air: boolean; items: BuiltPipe[] }>();
    for (const b of pipes) {
      if (!pipeVisible(b, state)) continue;
      if (state.system !== "all" && state.system !== b.path.system) continue;
      if (b.path.kind === "air" && state.system !== "cold" && state.selected === null) continue;
      const key = b.path.color;
      if (!map.has(key)) map.set(key, { color: key, air: b.path.kind === "air", items: [] });
      map.get(key)!.items.push(b);
    }
    return [...map.values()];
  }, [pipes, state]);
  return (
    <>
      {groups.map((g) => (
        <FlowGroup key={g.color} color={g.color} air={g.air} items={g.items} animate={!reduceMotion} spacing={lowPower ? 0.75 : 0.5} />
      ))}
    </>
  );
}

function FlowGroup({ color, air, items, animate, spacing }: { color: string; air: boolean; items: BuiltPipe[]; animate: boolean; spacing: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const counts = useMemo(() => items.map((b) => Math.max(1, Math.floor(b.length / spacing))), [items, spacing]);
  const total = counts.reduce((a, b) => a + b, 0);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: air, opacity: air ? 0.55 : 1, toneMapped: false }),
    [color, air],
  );
  useEffect(() => () => material.dispose(), [material]);
  const tmp = useMemo(() => ({ v: [0, 0, 0] as Vec3, m: new THREE.Matrix4(), s: new THREE.Vector3() }), []);

  const place = (t: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    let n = 0;
    const r = air ? 0.035 : 0.042;
    tmp.s.set(r, r, r);
    items.forEach((b, i) => {
      const step = b.length / counts[i];
      const off = ((t * (air ? 0.7 : 0.55)) % step + step) % step;
      for (let k = 0; k < counts[i]; k++) {
        pointAt(b.path.pts, b.cum, k * step + off, tmp.v);
        tmp.m.makeScale(r, r, r).setPosition(tmp.v[0], tmp.v[1], tmp.v[2]);
        mesh.setMatrixAt(n++, tmp.m);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => place(0));
  useFrame(({ clock }) => {
    if (animate) place(clock.elapsedTime);
  });
  return <instancedMesh ref={ref} args={[SPHERE, material, total]} frustumCulled={false} />;
}


/* ------------------------------------------------------------------ Szene */

/** Gebäude, Gelände, Technik und Licht – ohne Kamera. Für Echtzeit und Rendering gleichermaßen. */
export function World(props: WorldProps) {
  const mats = useMemo(() => new MatCache(props.variant), [props.variant]);
  useEffect(() => () => mats.dispose(), [mats]);
  const pipes = usePipes();
  const ctx = useMemo<Ctx>(
    () => ({
      mats, state: props.state, onSelect: props.onSelect, reduceMotion: props.reduceMotion, lowPower: props.lowPower, variant: props.variant, liftRef: props.liftRef,
    }),
    [mats, props.state, props.onSelect, props.reduceMotion, props.lowPower, props.variant, props.liftRef],
  );
  return (
    <SceneCtx.Provider value={ctx}>
      {props.variant === "live" ? <Sky /> : null}
      <Lights lowPower={props.lowPower} variant={props.variant} />
      <Site />
      <Slabs />
      <LevelShell level="eg" />
      <LevelShell level="og" />
      <Stairs />
      <HeatDevices />
      <WaterDevices />
      <ColdDevices />
      <Pipes pipes={pipes} />
      {props.variant === "live" ? <Flow pipes={pipes} /> : null}
    </SceneCtx.Provider>
  );
}
