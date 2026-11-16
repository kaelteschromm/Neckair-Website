"use client";

// Echtzeit-Ansicht des NECKAIR-Hauses (eigener, nachgeladener Chunk).
// Im Story-Modus steuert die Scrollposition die Kamera: vom Hero-Blickwinkel (identisch mit dem Hero-Bild)
// in die Übersicht. Danach übernimmt der Besucher.

import { useEffect, useLayoutEffect, useRef, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { COMPONENTS, HERO_POSES, OVERVIEW, type Vec3 } from "./model";
import { HORIZON, World, type SceneState } from "./scene-core";
import { applyLens, coverFrame } from "./camera";

const poseFor = (aspect: number) => (aspect < 1 ? HERO_POSES.portrait : HERO_POSES.landscape);

export type { FloorView, SceneState } from "./scene-core";
export interface SceneApi {
  zoom: (step: number) => void;
  rotate: (angle: number) => void;
  reset: () => void;
}
export interface StoryLink {
  /** 0 = Hero-Blickwinkel, 1 = Übersicht */
  camT: MutableRefObject<number>;
  /** true, solange die Scrollgeschichte die Kamera führt */
  driving: MutableRefObject<boolean>;
  lift: MutableRefObject<number>;
}
interface Props {
  state: SceneState;
  onSelect: (id: string) => void;
  apiRef: RefObject<SceneApi | null>;
  reduceMotion: boolean;
  lowPower: boolean;
  active: boolean;
  wheelZoom: boolean;
  touchRotate: boolean;
  story?: StoryLink;
  onReady?: () => void;
}

const COMP_BY_ID = new Map(COMPONENTS.map((c) => [c.id, c]));
const OVERVIEW_FOV = 32;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function Rig({ apiRef, selected, reduceMotion, wheelZoom, touchRotate, story, onReady }: Pick<Props, "apiRef" | "reduceMotion" | "wheelZoom" | "touchRotate" | "story" | "onReady"> & { selected: string | null }) {
  const ref = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const scale = aspect < 0.6 ? 2.35 : aspect < 0.8 ? 1.9 : aspect < 1.25 ? 1.35 : 1;
  const scaleRef = useRef(scale);
  const aspectRef = useRef(aspect);
  useLayoutEffect(() => {
    scaleRef.current = scale;
    aspectRef.current = aspect;
  }, [scale, aspect]);

  const overviewPose = (): { pos: Vec3; target: Vec3 } => {
    const [px, py, pz] = OVERVIEW.pos, [tx, ty, tz] = OVERVIEW.target, k = scaleRef.current;
    return { pos: [tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k], target: OVERVIEW.target };
  };
  const overview = (smooth: boolean) => {
    const o = overviewPose();
    applyLens(camera, OVERVIEW_FOV, 0);
    void ref.current?.setLookAt(...o.pos, ...o.target, smooth);
  };

  // Einstieg: im Story-Modus exakt der Hero-Blickwinkel, sonst die Übersicht
  useEffect(() => {
    if (!story) overview(false);
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scrollgeschichte: Kamera zwischen Hero-Blickwinkel und Übersicht, inklusive Bildwinkel und Shift
  const last = useRef(-1);
  useFrame(() => {
    const c = ref.current;
    if (!story || !c) return;
    c.enabled = !story.driving.current;
    if (!story.driving.current) {
      last.current = -1;
      return;
    }
    const t = story.camT.current;
    if (Math.abs(t - last.current) < 1e-4 && last.current >= 0) return;
    last.current = t;
    const pose = poseFor(aspectRef.current);
    const lens = coverFrame(pose, aspectRef.current);
    const e = t * t * (3 - 2 * t);
    const o = overviewPose();
    void c.setLookAt(...lerp3(pose.pos, o.pos, e), ...lerp3(pose.target, o.target, e), false);
    applyLens(camera, lerp(lens.fov, OVERVIEW_FOV, e), lerp(lens.shift, 0, e));
  });

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
    applyLens(camera, OVERVIEW_FOV, 0);
    const k = Math.min(scaleRef.current, 1.8);
    const [fx, fy, fz] = comp.focus, [vx, vy, vz] = comp.view;
    void c.setLookAt(fx + vx * k, fy + vy * k, fz + vz * k, fx, fy, fz, !reduceMotion);
  }, [selected, reduceMotion, camera]);

  const A = CameraControlsImpl.ACTION;
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={2.5}
      maxDistance={60}
      maxPolarAngle={Math.PI * 0.495}
      smoothTime={reduceMotion ? 0 : 0.45}
      mouseButtons={{ left: A.ROTATE, middle: A.DOLLY, right: A.TRUCK, wheel: wheelZoom ? A.DOLLY : A.NONE }}
      touches={{ one: touchRotate ? A.TOUCH_ROTATE : A.NONE, two: touchRotate ? A.TOUCH_DOLLY_TRUCK : A.NONE, three: A.NONE }}
    />
  );
}

export default function HouseScene(props: Props) {
  return (
    <Canvas
      shadows="percentage"
      dpr={props.lowPower ? [1, 1.5] : [1, 2]}
      frameloop={props.active ? "always" : "never"}
      camera={{ fov: OVERVIEW_FOV, near: 0.1, far: 900, position: OVERVIEW.pos }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: props.touchRotate ? "none" : "pan-y" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <fog attach="fog" args={[HORIZON, 60, 260]} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.4} color="#dfe8f0" position={[0, 14, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffd2a1" position={[-30, 8, 18]} rotation-y={Math.PI / 3} scale={[20, 8, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#c8d6e2" position={[20, 6, -12]} rotation-y={-Math.PI / 2} scale={[20, 8, 1]} />
      </Environment>
      <World
        state={props.state}
        onSelect={props.onSelect}
        reduceMotion={props.reduceMotion}
        lowPower={props.lowPower}
        variant="live"
        liftRef={props.story?.lift}
      />
      <Rig
        apiRef={props.apiRef}
        selected={props.state.selected}
        reduceMotion={props.reduceMotion}
        wheelZoom={props.wheelZoom}
        touchRotate={props.touchRotate}
        story={props.story}
        onReady={props.onReady}
      />
    </Canvas>
  );
}
