"use client";

// Die R3F-Szene des NECKAIR-Hauses. Wird ausschließlich per next/dynamic nachgeladen (eigener Chunk).
// Alle Gebäudeteile und Systeme sind eigene Gruppen und werden über `state` einzeln gesteuert.

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  COMPONENTS, FLOORS, H, OVERVIEW, PIPES, SLABS, STAIR_STEPS, SYSTEMS, WALLS,
  measure, pathLevels, pipeComponent, pointAt, wallBoxes, windowParts,
  type Box, type Level, type PipePath, type SystemKey, type Vec3,
} from "./model";

export type FloorView = "all" | "eg" | "og";
export interface SceneState {
  mode: "arch" | "tech";
  system: "all" | SystemKey;
  roof: boolean;
  ghostWalls: boolean;
  floor: FloorView;
  selected: string | null;
}
export interface SceneApi {
  zoom: (step: number) => void;
  rotate: (angle: number) => void;
  reset: () => void;
}
interface Props {
  state: SceneState;
  onSelect: (id: string) => void;
  apiRef: RefObject<SceneApi | null>;
  reduceMotion: boolean;
  lowPower: boolean;
  active: boolean;
  wheelZoom: boolean;
  onReady?: () => void;
}

const BG = "#e4e6e4";
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 32);
const SPHERE = new THREE.SphereGeometry(1, 12, 10);
const ICO = new THREE.IcosahedronGeometry(1, 4);

/* ------------------------------------------------------------------ Materialien */

type MatState = "n" | "g" | SystemKey;

const BASES = {
  plaster: { color: "#ece9e3", roughness: 0.92 },
  timber: { color: "#3d3732", roughness: 0.78 },
  inner: { color: "#f3f1ed", roughness: 0.95 },
  slab: { color: "#d6d3cc", roughness: 0.9 },
  roof: { color: "#cfccc4", roughness: 0.9 },
  gravel: { color: "#a6a298", roughness: 1 },
  sedum: { color: "#7f8d59", roughness: 1 },
  frame: { color: "#2a2d30", roughness: 0.5, metalness: 0.4 },
  oak: { color: "#b9956b", roughness: 0.7 },
  tile: { color: "#d7d6d2", roughness: 0.4 },
  stone: { color: "#c8c3b9", roughness: 0.8 },
  lawn: { color: "#a2ad8c", roughness: 1 },
  deck: { color: "#8a7765", roughness: 0.85 },
  concrete: { color: "#bdb9b1", roughness: 0.95 },
  hedge: { color: "#6f7e58", roughness: 1 },
  foliage: { color: "#b4bca3", roughness: 0.95 },
  trunk: { color: "#6b5847", roughness: 1 },
  white: { color: "#f6f5f2", roughness: 0.35 },
  device: { color: "#e2e2de", roughness: 0.45, metalness: 0.1 },
  dark: { color: "#2b2e31", roughness: 0.55, metalness: 0.2 },
  chrome: { color: "#d9dde0", roughness: 0.15, metalness: 0.95 },
  steel: { color: "#aeb3b7", roughness: 0.3, metalness: 0.85 },
  fabric: { color: "#9c968e", roughness: 1 },
  linen: { color: "#e9e5dd", roughness: 1 },
  copper: { color: "#b87333", roughness: 0.35, metalness: 0.8 },
  mirror: { color: "#dfe6ea", roughness: 0.12, metalness: 0.25 },
} satisfies Record<string, THREE.MeshStandardMaterialParameters>;
type MatName = keyof typeof BASES;

class MatCache {
  private map = new Map<string, THREE.Material>();
  get(name: MatName | `pipe:${string}`, state: MatState = "n"): THREE.Material {
    const key = `${name}|${state}`;
    let m = this.map.get(key);
    if (m) return m;
    const base: THREE.MeshStandardMaterialParameters = name.startsWith("pipe:")
      ? { color: name.slice(5), roughness: 0.4, metalness: 0.15 }
      : BASES[name as MatName];
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
  glass(ghost: boolean) {
    const key = `glass|${ghost}`;
    let m = this.map.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: "#a9c0cb", roughness: 0.04, metalness: 0.3, transparent: true, opacity: ghost ? 0.06 : 0.32, depthWrite: false, envMapIntensity: 2,
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
    this.map.forEach((m) => m.dispose());
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
function B({ p, s, m, shadow = true }: { p: Vec3; s: Vec3; m: THREE.Material; shadow?: boolean }) {
  return <mesh geometry={BOX} material={m} position={p} scale={s} castShadow={shadow} receiveShadow={shadow} />;
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
    const ext: Box[] = [], int: Box[] = [], glass: Box[] = [], frames: Box[] = [];
    for (const w of WALLS.filter((x) => x.level === level)) {
      (w.exterior ? ext : int).push(...wallBoxes(w));
      const wp = windowParts(w);
      glass.push(...wp.glass);
      frames.push(...wp.frames);
    }
    return { ext, int, glass, frames };
  }, [level]);
  if (hidden) return null;
  const extMat = mats.get(level === "eg" ? "plaster" : "timber", wallGhost ? "g" : "n");
  return (
    <group>
      <Boxes boxes={parts.ext} mat={extMat} shadow={!wallGhost} />
      <Boxes boxes={parts.int} mat={mats.get("inner", wallGhost ? "g" : "n")} shadow={!wallGhost} />
      <Boxes boxes={parts.glass} mat={mats.glass(wallGhost)} shadow={false} />
      <Boxes boxes={parts.frames} mat={mats.get("frame", wallGhost ? "g" : "n")} shadow={!wallGhost} />
      {FLOORS.filter((f) => f.level === level).map((f, i) => (
        <B key={i} p={f.pos} s={f.size} m={mats.get(f.kind, levelGhost ? "g" : "n")} />
      ))}
      {level === "eg" ? <EgInterior ghost={levelGhost} /> : <OgInterior />}
    </group>
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
      {/* Wohnen: Sofa, Teppich, Couchtisch */}
      <B p={[-3.4, 0.22, 1.05]} s={[2.8, 0.44, 0.95]} m={fab} />
      <B p={[-3.4, 0.55, 0.68]} s={[2.8, 0.42, 0.22]} m={fab} />
      <B p={[-4.68, 0.22, 1.9]} s={[0.95, 0.44, 0.9]} m={fab} />
      <B p={[-3.2, 0.012, 2.4]} s={[3.2, 0.012, 2.0]} m={mats.get("linen", g)} shadow={false} />
      <B p={[-3.2, 0.2, 2.45]} s={[1.2, 0.06, 0.7]} m={oak} />
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

function Slabs() {
  const { mats, state } = useScene();
  const ogVisible = state.floor !== "eg";
  const roofVisible = state.roof && state.floor === "all";
  const attic = (b: Box, h = 0.22, t = 0.18): Box[] => {
    const [x, y, z] = b.pos, [sx, sy, sz] = b.size, top = y + sy / 2 + h / 2;
    return [
      { pos: [x, top, z - sz / 2 + t / 2], size: [sx, h, t] },
      { pos: [x, top, z + sz / 2 - t / 2], size: [sx, h, t] },
      { pos: [x - sx / 2 + t / 2, top, z], size: [t, h, sz] },
      { pos: [x + sx / 2 - t / 2, top, z], size: [t, h, sz] },
    ];
  };
  return (
    <group>
      <B p={SLABS.egBase.pos} s={SLABS.egBase.size} m={mats.get("slab")} />
      {ogVisible ? <Boxes boxes={SLABS.og} mat={mats.get("slab")} /> : null}
      {roofVisible ? (
        <group>
          <B p={SLABS.roof.pos} s={SLABS.roof.size} m={mats.get("roof")} />
          <B p={[SLABS.roof.pos[0], H.roofTop + 0.01, 0]} s={[10.4, 0.02, 8.9]} m={mats.get("gravel")} shadow={false} />
          <Boxes boxes={attic(SLABS.roof)} mat={mats.get("frame")} />
          <B p={SLABS.greenRoof.pos} s={SLABS.greenRoof.size} m={mats.get("roof")} />
          <B p={[SLABS.greenRoof.pos[0], 3.16, 0]} s={[1.3, 0.04, 8.8]} m={mats.get("sedum")} shadow={false} />
          <Boxes boxes={attic(SLABS.greenRoof, 0.18, 0.12)} mat={mats.get("frame")} />
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

// Bäume als ruhige Volumen wie im Architekturmodell – hinter dem Haus, damit sie die Sicht nicht verstellen
const TREES: [number, number, number][] = [[-11, -6.5, 1.0], [-13, 1.5, 0.85], [9.5, -8.5, 1.1], [-3.5, -13.5, 0.9], [14, -3, 0.8]];

function Site() {
  const { mats, lowPower } = useScene();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} receiveShadow material={mats.get("lawn")}>
        <circleGeometry args={[60, 48]} />
      </mesh>
      {/* Terrasse mit Stufe */}
      <B p={[-1.8, 0.06, 6.05]} s={[8.4, 0.12, 3.1]} m={mats.get("deck")} />
      <B p={[-1.8, 0.03, 7.8]} s={[8.4, 0.06, 0.4]} m={mats.get("deck")} />
      {/* Weg zum Eingang und Stellplatz */}
      <B p={[9.5, 0.01, 3.1]} s={[7, 0.02, 1.4]} m={mats.get("concrete")} />
      <B p={[10.2, 0.01, -1.2]} s={[4.4, 0.02, 5.6]} m={mats.get("concrete")} />
      {/* Hecke zur Grundstücksgrenze */}
      <B p={[0, 0.45, -11]} s={[26, 0.9, 0.7]} m={mats.get("hedge")} />
      {(lowPower ? TREES.slice(0, 3) : TREES).map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh geometry={CYL} material={mats.get("trunk")} position={[0, 1.4 * s, 0]} scale={[0.09 * s, 2.8 * s, 0.09 * s]} castShadow />
          <mesh geometry={ICO} material={mats.get("foliage")} position={[0, 4.1 * s, 0]} scale={[1.7 * s, 2.3 * s, 1.7 * s]} castShadow />
        </group>
      ))}
      {/* Gartenmöbel */}
      <B p={[-3.6, 0.5, 6.3]} s={[1.6, 0.05, 0.85]} m={mats.get("oak")} />
      <B p={[-3.6, 0.3, 6.3]} s={[0.08, 0.5, 0.6]} m={mats.get("dark")} />
    </group>
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

/* ------------------------------------------------------------------ Kamera */

function Rig({ apiRef, selected, reduceMotion, wheelZoom, onReady }: { apiRef: Props["apiRef"]; selected: string | null; reduceMotion: boolean; wheelZoom: boolean; onReady?: () => void }) {
  const ref = useRef<CameraControlsImpl>(null);
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const scale = aspect < 0.8 ? 1.75 : aspect < 1.25 ? 1.35 : 1;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const overview = (smooth: boolean) => {
    const c = ref.current;
    if (!c) return;
    const [px, py, pz] = OVERVIEW.pos, [tx, ty, tz] = OVERVIEW.target;
    const k = scaleRef.current;
    void c.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, smooth);
  };

  // Einstieg: kurze Kamerafahrt aufs Haus (ohne Fahrt bei reduzierter Bewegung)
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const [tx, ty, tz] = OVERVIEW.target;
    const k = scaleRef.current;
    if (!reduceMotion) void c.setLookAt(tx - 14 * k, ty + 16 * k, tz + 26 * k, tx, ty, tz, false);
    overview(!reduceMotion);
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current = {
      zoom: (step) => void ref.current?.dolly(step, !reduceMotion),
      rotate: (a) => void ref.current?.rotate(a, 0, !reduceMotion),
      reset: () => overview(!reduceMotion),
    };
    return () => {
      apiRef.current = null;
    };
  });

  useEffect(() => {
    const c = ref.current;
    const comp = selected ? COMP_BY_ID.get(selected) : null;
    if (!c || !comp) return;
    const k = Math.min(scaleRef.current, 1.4);
    const [fx, fy, fz] = comp.focus, [vx, vy, vz] = comp.view;
    void c.setLookAt(fx + vx * k, fy + vy * k, fz + vz * k, fx, fy, fz, !reduceMotion);
  }, [selected, reduceMotion]);

  const A = CameraControlsImpl.ACTION;
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={2.5}
      maxDistance={48}
      maxPolarAngle={Math.PI * 0.485}
      smoothTime={reduceMotion ? 0 : 0.45}
      mouseButtons={{ left: A.ROTATE, middle: A.DOLLY, right: A.TRUCK, wheel: wheelZoom ? A.DOLLY : A.NONE }}
      touches={{ one: A.TOUCH_ROTATE, two: A.TOUCH_DOLLY_TRUCK, three: A.TOUCH_TRUCK }}
    />
  );
}

/* ------------------------------------------------------------------ Szene */

function World(props: Props) {
  const mats = useMemo(() => new MatCache(), []);
  useEffect(() => () => mats.dispose(), [mats]);
  const pipes = usePipes();
  const ctx = useMemo<Ctx>(
    () => ({ mats, state: props.state, onSelect: props.onSelect, reduceMotion: props.reduceMotion, lowPower: props.lowPower }),
    [mats, props.state, props.onSelect, props.reduceMotion, props.lowPower],
  );
  return (
    <SceneCtx.Provider value={ctx}>
      <Site />
      <Slabs />
      <LevelShell level="eg" />
      <LevelShell level="og" />
      <Stairs />
      <HeatDevices />
      <WaterDevices />
      <ColdDevices />
      <Pipes pipes={pipes} />
      <Flow pipes={pipes} />
      <Rig apiRef={props.apiRef} selected={props.state.selected} reduceMotion={props.reduceMotion} wheelZoom={props.wheelZoom} onReady={props.onReady} />
    </SceneCtx.Provider>
  );
}

export default function HouseScene(props: Props) {
  const shadowSize = props.lowPower ? 1024 : 2048;
  return (
    <Canvas
      shadows="percentage"
      dpr={props.lowPower ? [1, 1.5] : [1, 2]}
      frameloop={props.active ? "always" : "never"}
      camera={{ fov: 32, near: 0.1, far: 220, position: OVERVIEW.pos }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 38, 90]} />
      <hemisphereLight args={["#ffffff", "#c9c2b4", 0.6]} />
      <directionalLight
        position={[11, 17, 9]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[18, 6, 10]} rotation-y={-Math.PI / 3} scale={[16, 8, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffe9cf" position={[-16, 5, -8]} rotation-y={Math.PI / 3} scale={[14, 8, 1]} />
      </Environment>
      <World {...props} />
    </Canvas>
  );
}
