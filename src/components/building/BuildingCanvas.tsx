"use client";

import { useEffect, useRef } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { pointer, ensurePointerTracking } from "@/lib/pointer";
import { buildScene, pointAt, SYSTEM_RGB, UPPER_Y, type SystemId, type V } from "./geometry";

/**
 * Steuerwerte der Szene. Werden von außen (Scroll, Klick, Intro) in ein Ref geschrieben
 * und jedes Frame gelesen – kein React-Rerender pro Frame (react-best-practices:
 * rerender-use-ref-transient-values).
 */
export interface SceneControl {
  /** Kamerawinkel um die Hochachse (rad) */
  yaw: number;
  /** Kameraabstand als Faktor (1 = Standard, kleiner = näher) */
  dolly: number;
  /** Explosionsansicht 0…1: Obergeschoss hebt sich ab */
  explode: number;
  /** Deckkraft der Gebäudehülle 0…1 */
  shell: number;
  /** Gezeichneter Anteil je System 0…1 */
  draw: Record<SystemId, number>;
  /** Hervorgehobenes System, „all“ = alle gleichwertig, „none“ = nur Gebäude */
  active: SystemId | "all" | "none";
}

export const defaultControl = (): SceneControl => ({
  yaw: -0.7,
  dolly: 1,
  explode: 0,
  shell: 1,
  draw: { heizung: 1, wasser: 1, klima: 1 },
  active: "all",
});

const THEME = {
  dark: { line: "214,228,236", lineA: 0.42, faceRGB: "214,228,236", faceA: 0.075, glass: "rgba(143,211,232,0.06)", ground: 0.06, blend: "lighter" as GlobalCompositeOperation },
  light: { line: "11,34,57", lineA: 0.55, faceRGB: "11,34,57", faceA: 0.05, glass: "rgba(30,136,229,0.06)", ground: 0.08, blend: "source-over" as GlobalCompositeOperation },
};

const IDS: SystemId[] = ["heizung", "wasser", "klima"];

/**
 * NECKAIR-Gebäude: eigene 3D-Projektion auf einem 2D-Canvas (keine 3D-Bibliothek).
 * Schattierte Baukörper (Maler-Algorithmus), Glas, Leitungsführung der drei Systeme mit
 * fließenden Partikeln. Optional anklickbar: Klick nahe einer Leitung wählt das System.
 *
 * Performance: pausiert außerhalb des Sichtbereichs, DPR begrenzt, ein gemeinsamer Zeiger-Listener.
 * Reduzierte Bewegung: keine Partikelbewegung, kein Kamerapendel.
 */
export function BuildingCanvas({
  control,
  theme = "dark",
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
  autoOrbit = false,
  onPick,
  className = "",
}: {
  control: React.RefObject<SceneControl>;
  theme?: "dark" | "light";
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  autoOrbit?: boolean;
  onPick?: (id: SystemId) => void;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReduceMotion();
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const pickable = Boolean(onPick);

  useEffect(() => {
    ensurePointerTracking();
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const T = THEME[theme];
    const RGB = SYSTEM_RGB[theme];
    const scene = buildScene();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    let raf = 0;
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();

    const level: Record<SystemId, number> = { heizung: 0.8, wasser: 0.8, klima: 0.8 };
    let hover: SystemId | null = null;
    const smooth = { x: 0, y: 0 };
    const hits: Record<SystemId, [number, number][]> = { heizung: [], wasser: [], klima: [] };
    const t0 = performance.now();

    const frame = (now: number) => {
      const c = control.current;
      if (!c) return;
      const t = reduce ? 0 : (now - t0) / 1000;
      const k = reduce ? 1 : 0.08;
      for (const id of IDS) {
        const target = c.active === "all" ? 0.85 : c.active === "none" ? 0 : c.active === id ? 1 : 0.1;
        const h = hover === id && c.active !== id ? 0.25 : 0;
        level[id] += (Math.min(1, target + h) - level[id]) * k;
      }
      smooth.x += (pointer.x - smooth.x) * 0.05;
      smooth.y += (pointer.y - smooth.y) * 0.05;

      const yaw = c.yaw + (autoOrbit && !reduce ? Math.sin(t * 0.12) * 0.2 : 0) + smooth.x * 0.1;
      const pitch = 0.44 + smooth.y * 0.04;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const dist = (14 / zoom) * c.dolly;
      const f = Math.min(W * 1.05, H * 1.35);
      const cx = W * (0.5 + offsetX);
      const cyScr = H * (0.52 + offsetY);
      const lift = c.explode * 1.35;

      const proj = (v: V): [number, number, number] => {
        const x = v[0] - 0.3;
        const y = v[1] + (v[1] >= UPPER_Y - 1e-3 ? lift : 0) - 1.5 - lift * 0.4;
        const z = v[2];
        const x1 = x * cy + z * sy;
        const zr = -x * sy + z * cy;
        const y2 = y * cp - zr * sp;
        const d = dist - (zr * cp + y * sp);
        return [cx + (x1 / d) * f, cyScr - (y2 / d) * f, d];
      };
      const depthAlpha = (z: number) => Math.max(0.3, Math.min(1, 1.15 - (z - dist + 3) / 9));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";

      const seg = (p: V, q: V, rgb: string, a: number, w: number) => {
        const A = proj(p), B = proj(q);
        ctx.strokeStyle = `rgba(${rgb},${(a * depthAlpha((A[2] + B[2]) / 2)).toFixed(3)})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      };

      for (const [p, q] of scene.ground) seg(p, q, T.line, T.ground, 1);

      // Baukörper: Flächen von hinten nach vorne (Maler-Algorithmus)
      if (c.shell > 0.01) {
        const faces = scene.faces
          .map((fc) => {
            const P = fc.pts.map(proj);
            return { P, d: P.reduce((s, p) => s + p[2], 0) / P.length, shade: fc.shade };
          })
          .sort((a, b) => b.d - a.d);
        for (const fc of faces) {
          ctx.beginPath();
          fc.P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.closePath();
          ctx.fillStyle = `rgba(${T.faceRGB},${(T.faceA * fc.shade * c.shell).toFixed(3)})`;
          ctx.fill();
        }
        for (const quad of scene.glass) {
          ctx.beginPath();
          quad.forEach((v, i) => {
            const [px, py] = proj(v);
            if (i) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = T.glass;
          ctx.fill();
        }
      }
      for (const [p, q] of scene.structure) seg(p, q, T.line, T.lineA * (0.55 + 0.45 * c.shell), 1);

      ctx.globalCompositeOperation = T.blend;
      for (const sys of scene.systems) {
        const lv = level[sys.id];
        const drawn = Math.max(0, Math.min(1, c.draw[sys.id]));
        const rgb = RGB[sys.id];
        const pts: [number, number][] = [];
        if (lv > 0.02 && drawn > 0.001) {
          for (const [p, q] of sys.equipment) seg(p, q, rgb, (0.2 + 0.65 * lv) * Math.min(1, drawn * 3), 1.1);
        }
        for (const path of sys.paths) {
          const len = path.length * drawn;
          if (len <= 0.001) continue;
          ctx.lineWidth = theme === "light" ? 1.6 : 1.4;
          ctx.strokeStyle = `rgba(${rgb},${(0.14 + 0.62 * lv).toFixed(3)})`;
          ctx.beginPath();
          for (let i = 0; i < path.pts.length; i++) {
            if (path.cum[i] > len) {
              const [px, py] = proj(pointAt(path, len));
              ctx.lineTo(px, py);
              break;
            }
            const [px, py] = proj(path.pts[i]);
            pts.push([px, py]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Zeichenspitze, solange die Leitung entsteht
          if (drawn < 0.999) {
            const [hx, hy] = proj(pointAt(path, len));
            ctx.fillStyle = `rgba(${rgb},0.9)`;
            ctx.beginPath();
            ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
            ctx.fill();
          }

          if (lv < 0.15) continue;
          const spacing = 0.32;
          const offset = (t * sys.speed) % spacing;
          for (let s = offset; s < len; s += spacing) {
            const [px, py, pz] = proj(pointAt(path, s));
            pts.push([px, py]);
            const da = depthAlpha(pz) * lv;
            if (theme === "dark") {
              ctx.fillStyle = `rgba(${rgb},${(0.14 * da).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(px, py, 4.2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = `rgba(${rgb},${(0.95 * da).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, theme === "dark" ? 1.5 : 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        hits[sys.id] = pts;
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let visible = true;
    const loop = (now: number) => {
      frame(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) frame(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    // Klick-/Hover-Erkennung: nächstgelegene Leitung innerhalb von 28 px
    const nearest = (e: PointerEvent): SystemId | null => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      let best: SystemId | null = null;
      let bd = 28 * 28;
      for (const id of IDS) {
        for (const [px, py] of hits[id]) {
          const d = (px - x) ** 2 + (py - y) ** 2;
          if (d < bd) {
            bd = d;
            best = id;
          }
        }
      }
      return best;
    };
    const onMove = (e: PointerEvent) => {
      hover = nearest(e);
      canvas.style.cursor = hover ? "pointer" : "";
    };
    const onLeave = () => {
      hover = null;
    };
    const onDown = (e: PointerEvent) => {
      const id = nearest(e);
      if (id) pickRef.current?.(id);
    };
    if (pickable) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [reduce, theme, zoom, offsetX, offsetY, autoOrbit, control, pickable]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
