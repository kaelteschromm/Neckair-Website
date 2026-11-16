"use client";
/* eslint-disable react-hooks/immutability -- Kamera, Szene und Pathtracer werden bewusst imperativ konfiguriert (nur lokales Render-Werkzeug) */

// Hero-Rendering per Pathtracing (three-gpu-pathtracer). Nur für die lokale Render-Seite /render-hero/,
// die ausschließlich mit RENDER_HERO=1 existiert – wird nicht veröffentlicht.
// Gleiche Szene (World) und gleiche Kamera-Mathematik wie die Echtzeitansicht.

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DenoiseMaterial, ProceduralEquirectTexture, WebGLPathTracer } from "three-gpu-pathtracer";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { World, type SceneState } from "./scene-core";
import { HERO_POSES } from "./model";
import { applyLens } from "./camera";

const STATE: SceneState = { mode: "arch", system: "all", roof: true, ghostWalls: false, floor: "all", selected: null };
const noop = () => {};

declare global {
  interface Window {
    __heroSamples?: number;
    __heroReady?: boolean;
  }
}

/** Himmel am späten Nachmittag: warmer Horizont, klares Blau im Zenit */
function skyTexture() {
  const tex = new ProceduralEquirectTexture(1024, 512);
  const zenith = new THREE.Color("#5b86b4"), mid = new THREE.Color("#a8c0d4"), horizon = new THREE.Color("#f2d3ad"), ground = new THREE.Color("#8d8676");
  const dir = new THREE.Vector3();
  tex.generationCallback = (polar: THREE.Spherical, _uv: THREE.Vector2, _coord: THREE.Vector2, color: THREE.Color) => {
    dir.setFromSpherical(polar);
    const h = dir.y;
    if (h < 0) {
      color.copy(ground);
      return;
    }
    // Wärmerer Horizont in Richtung Sonne (Westen)
    const towardSun = Math.max(0, -dir.x * 0.8 + dir.z * 0.4);
    const warm = horizon.clone().lerp(new THREE.Color("#ffc890"), towardSun * 0.6);
    color.copy(warm).lerp(mid, Math.min(1, h / 0.2));
    if (h > 0.2) color.lerp(zenith, Math.min(1, (h - 0.2) / 0.6));
  };
  tex.update();
  return tex;
}

function Tracer({ orientation, target, denoise }: { orientation: "landscape" | "portrait"; target: number; denoise: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const tracer = useRef<WebGLPathTracer | null>(null);

  useEffect(() => {
    const pose = HERO_POSES[orientation];
    camera.position.set(...pose.pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(...pose.target);
    camera.near = 0.1;
    camera.far = 1200;
    applyLens(camera, pose.fov, pose.shift);
    const sky = skyTexture();
    scene.background = sky;
    scene.environment = sky;
    scene.environmentIntensity = 0.9;
    let cancelled = false;
    // Einen Moment warten, bis alle Meshes und Texturen bereitstehen
    const id = setTimeout(() => {
      if (cancelled) return;
      const pt = new WebGLPathTracer(gl);
      pt.tiles.set(3, 3);
      pt.bounces = 4;
      pt.transmissiveBounces = 4;
      pt.filterGlossyFactor = 0.4;
      pt.minSamples = 0;
      pt.renderDelay = 0;
      pt.fadeDuration = 0;
      pt.setScene(scene, camera);
      // Kantenerhaltendes Entrauschen (glslSmartDeNoise) beim Ausgeben auf den Canvas
      if (denoise > 0) {
        const dn = new DenoiseMaterial({ sigma: denoise, kSigma: 1.0, threshold: 0.1 });
        const quad = new FullScreenQuad(dn);
        pt.renderToCanvasCallback = (rt: THREE.WebGLRenderTarget, renderer: THREE.WebGLRenderer) => {
          dn.uniforms.map.value = rt.texture;
          const ac = renderer.autoClear;
          renderer.autoClear = false;
          quad.render(renderer);
          renderer.autoClear = ac;
        };
      }
      // setScene setzt die Projektion zurück – Shift erneut anwenden
      applyLens(camera, pose.fov, pose.shift);
      pt.updateCamera();
      tracer.current = pt;
      window.__heroReady = true;
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [gl, scene, camera, orientation, denoise]);

  useFrame(() => {
    const pt = tracer.current;
    if (!pt) return;
    if (pt.samples < target) pt.renderSample();
    window.__heroSamples = pt.samples;
  }, 1);
  return null;
}

export default function HeroRender({ orientation, width, height, samples, denoise = 0 }: { orientation: "landscape" | "portrait"; width: number; height: number; samples: number; denoise?: number }) {
  return (
    <div style={{ width, height }}>
      <Canvas
        dpr={1}
        gl={{ preserveDrawingBuffer: true, antialias: false }}
        camera={{ fov: HERO_POSES[orientation].fov }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.AgXToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        shadows
      >
        <World state={STATE} onSelect={noop} reduceMotion lowPower={false} variant="render" />
        <Tracer orientation={orientation} target={samples} denoise={denoise} />
      </Canvas>
    </div>
  );
}
