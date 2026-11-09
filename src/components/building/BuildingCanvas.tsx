"use client";

import { useEffect, useRef } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { buildScene, SYSTEM_COLORS, type SystemId, type VentMode, pointAt } from "./geometry";

/**
 * „Das intelligente Gebäude“ – echte 3D-Projektion (Kamera, Perspektive, Tiefenstaffelung)
 * auf einem 2D-Canvas, ohne 3D-Bibliothek. Ein Haus als feines Linienmodell, darin vier
 * technische Systeme als Leitungen, durch die Partikel fließen.
 *
 * Zweck (Emil Kowalski): Erklärung – zeigt, wo Heizung, Wasser, Klima und Lüftung im Gebäude
 * arbeiten. Gesehen wird es selten (Marketing), daher darf die Bewegung ruhig und länger sein.
 *
 * - `active`: hervorgehobenes System; die übrigen treten zurück (weicher Übergang per Dämpfung,
 *   also jederzeit unterbrechbar, kein Neustart).
 * - `yawRef`: Kamerawinkel von außen (z. B. an den Scroll gekoppelt).
 * - Pausiert außerhalb des Sichtbereichs; reduzierte Bewegung: Partikel stehen still.
 */
export function BuildingCanvas({
  active,
  yawRef,
  autoOrbit = false,
  ventMode = "wrg",
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
  className = "",
}: {
  active: SystemId | "all";
  yawRef?: React.RefObject<number>;
  autoOrbit?: boolean;
  ventMode?: VentMode;
  offsetX?: number;
  /** vertikale Verschiebung (Anteil der Höhe, negativ = nach oben) */
  offsetY?: number;
  zoom?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReduceMotion();
  const activeRef = useRef(active);
  const ventRef = useRef(ventMode);
  const offsetRef = useRef(offsetX);
  activeRef.current = active;
  ventRef.current = ventMode;
  offsetRef.current = offsetX;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scene = buildScene();
    let raf = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    // Größenänderung leert den Canvas – im Pausenzustand sofort ein Bild nachzeichnen
    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) frame(performance.now());
    });
    ro.observe(canvas);

    // Sichtbarkeit je System, gedämpft zum Ziel (interruptible, kein Keyframe)
    const level: Record<SystemId | "exhaust", number> = { heizung: 0, wasser: 0, klima: 0, lueftung: 0, exhaust: 0 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    let yawSmooth = yawRef?.current ?? -0.55;
    let visible = true;
    const t0 = performance.now();

    const frame = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      const a = activeRef.current;
      const vent = ventRef.current;
      const k = reduce ? 1 : 0.07; // Dämpfung pro Frame
      for (const id of ["heizung", "wasser", "klima", "lueftung"] as SystemId[]) {
        const target = a === "all" ? 0.75 : a === id ? 1 : 0.07;
        const ventOff = id === "lueftung" && a === "lueftung" && vent === "abluft" ? 0.15 : target;
        level[id] += (ventOff - level[id]) * k;
      }
      const exTarget = a === "lueftung" && vent !== "zuluft" ? 1 : a === "all" ? 0.5 : 0.05;
      level.exhaust += (exTarget - level.exhaust) * k;

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      let yaw = yawRef?.current ?? -0.55;
      if (autoOrbit && !reduce) yaw += Math.sin(t * 0.12) * 0.22;
      yawSmooth += (yaw - yawSmooth) * (reduce ? 1 : 0.08);
      const finalYaw = yawSmooth + pointer.x * 0.12;
      const pitch = 0.42 + pointer.y * 0.05;

      const cy = Math.cos(finalYaw), sy = Math.sin(finalYaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const dist = 14 / zoom;
      const f = Math.min(W * 1.05, H * 1.35);
      const cx = W * (0.5 + offsetRef.current);
      const cyScr = H * (0.52 + offsetY);

      // Weltpunkt → Bildschirm (Mittelpunkt des Hauses ≈ (0.3, 1.5, 0))
      const proj = (x: number, y: number, z: number): [number, number, number] => {
        x -= 0.3; y -= 1.5;
        // Drehung um die Hochachse; zr > 0 = zur Kamera hin
        const x1 = x * cy + z * sy;
        const zr = -x * sy + z * cy;
        // Kamera erhöht, blickt schräg nach unten: nahe Punkte liegen tiefer im Bild
        const y2 = y * cp - zr * sp;
        const d = dist - (zr * cp + y * sp);
        return [cx + (x1 / d) * f, cyScr - (y2 / d) * f, d];
      };
      const depthAlpha = (z: number) => Math.max(0.3, Math.min(1, 1.15 - (z - dist + 3) / 9));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Glasflächen (sehr zart gefüllt)
      ctx.globalCompositeOperation = "source-over";
      for (const quad of scene.glass) {
        ctx.beginPath();
        quad.forEach((v, i) => {
          const [px, py] = proj(v[0], v[1], v[2]);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(169,216,248,0.05)";
        ctx.fill();
      }

      // Gelände-Raster und Baukörper
      const strokeSegs = (segs: number[][][], rgb: string, alpha: number, width: number) => {
        ctx.lineWidth = width;
        for (const [p, q] of segs) {
          const A = proj(p[0], p[1], p[2]);
          const B = proj(q[0], q[1], q[2]);
          ctx.strokeStyle = `rgba(${rgb},${(alpha * depthAlpha((A[2] + B[2]) / 2)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(B[0], B[1]);
          ctx.stroke();
        }
      };
      strokeSegs(scene.ground, "205,234,246", 0.07, 1);
      strokeSegs(scene.structure, "205,234,246", 0.32, 1);

      // Systeme: Leitungen, Geräte, fließende Partikel (additiv = Leuchten)
      ctx.globalCompositeOperation = "lighter";
      for (const sys of scene.systems) {
        const lv = level[sys.level];
        if (lv < 0.02) continue;
        const rgb = SYSTEM_COLORS[sys.color];
        strokeSegs(sys.equipment, rgb, 0.25 + 0.6 * lv, 1.2);
        for (const path of sys.paths) {
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = `rgba(${rgb},${(0.12 + 0.6 * lv).toFixed(3)})`;
          ctx.beginPath();
          path.pts.forEach((v, i) => {
            const [px, py] = proj(v[0], v[1], v[2]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          if (lv < 0.15) continue;
          const spacing = 0.32;
          const n = Math.max(2, Math.floor(path.length / spacing));
          const offset = (t * sys.speed) % spacing;
          for (let i = 0; i < n; i++) {
            const s = i * spacing + offset;
            if (s > path.length) break;
            const v = pointAt(path, s);
            const [px, py, pz] = proj(v[0], v[1], v[2]);
            const da = depthAlpha(pz) * lv;
            ctx.fillStyle = `rgba(${rgb},${(0.14 * da).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${rgb},${(0.95 * da).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      frame(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce, autoOrbit, yawRef, zoom, offsetY]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
