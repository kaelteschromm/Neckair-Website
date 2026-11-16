// Prozedurale Texturen (im Browser erzeugt) – keine externen Bilddateien, keine Lizenzfragen.
import * as THREE from "three";

type Painter = (ctx: CanvasRenderingContext2D, size: number, rnd: () => number) => void;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, size: number, paint: Painter, srgb = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  paint(ctx, size, seeded(key.length * 7919 + size));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

function noise(ctx: CanvasRenderingContext2D, size: number, rnd: () => number, base: [number, number, number], amp: number, count: number, r = 1.4) {
  ctx.fillStyle = `rgb(${base.join(",")})`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < count; i++) {
    const d = (rnd() - 0.5) * amp;
    ctx.fillStyle = `rgba(${base.map((v) => Math.max(0, Math.min(255, v + d))).join(",")},0.55)`;
    ctx.fillRect(rnd() * size, rnd() * size, r * (0.5 + rnd()), r * (0.5 + rnd()));
  }
}

/** Feiner Putz */
export const plasterTex = (tone: "white" | "grey") =>
  make(`plaster-${tone}`, 256, (ctx, s, rnd) => noise(ctx, s, rnd, tone === "white" ? [240, 238, 233] : [214, 213, 208], 14, 9000, 1.2));

/** Längs gemasertes Lärchenholz für Lamellen */
export const woodTex = () =>
  make("wood", 256, (ctx, s, rnd) => {
    ctx.fillStyle = "#a57a52";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 140; i++) {
      const x = rnd() * s, w = 0.6 + rnd() * 2.2;
      const l = Math.round(rnd() * 40 - 20);
      ctx.fillStyle = `rgba(${120 + l},${84 + l},${52 + l},0.35)`;
      ctx.fillRect(x, 0, w, s);
    }
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "rgba(90,60,35,0.25)";
      ctx.beginPath();
      ctx.ellipse(rnd() * s, rnd() * s, 2 + rnd() * 3, 6 + rnd() * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Naturstein im Läuferverband (Bruchsteinoptik, hell-beige bis grau) */
export const stoneTex = () =>
  make("stone", 512, (ctx, s, rnd) => {
    ctx.fillStyle = "#8f8a80";
    ctx.fillRect(0, 0, s, s);
    let y = 0;
    while (y < s) {
      const h = 22 + rnd() * 26;
      let x = -rnd() * 40;
      while (x < s) {
        const w = 40 + rnd() * 90;
        const t = 138 + rnd() * 58;
        const warm = 8 + rnd() * 22;
        ctx.fillStyle = `rgb(${t + warm},${t + warm * 0.55},${t - 10})`;
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        for (let k = 0; k < 40; k++) {
          ctx.fillStyle = `rgba(${rnd() > 0.5 ? "255,255,255" : "60,55,50"},0.08)`;
          ctx.fillRect(x + 2 + rnd() * (w - 6), y + 2 + rnd() * (h - 6), 3, 2);
        }
        x += w;
      }
      y += h;
    }
  });

/** Großformatige Terrassenplatten 80 × 80 cm (eine Kachel = eine Platte) */
export const paverTex = () =>
  make("paver", 256, (ctx, s, rnd) => {
    noise(ctx, s, rnd, [186, 182, 174], 16, 6000, 1.4);
    ctx.strokeStyle = "rgba(90,86,80,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, s - 3, s - 3);
  });

/** Rasen */
export const lawnTex = () =>
  make("lawn", 256, (ctx, s, rnd) => {
    noise(ctx, s, rnd, [112, 132, 82], 34, 22000, 1.1);
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = `rgba(${150 + rnd() * 40},${165 + rnd() * 30},${90 + rnd() * 30},0.25)`;
      ctx.fillRect(rnd() * s, rnd() * s, 1, 2 + rnd() * 2);
    }
  });

/** Blattwerk: helle und dunkle Sprenkel, wird mit der Laubfarbe multipliziert */
export const leafTex = () =>
  make("leaf", 256, (ctx, s, rnd) => {
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 5200; i++) {
      const l = rnd();
      ctx.fillStyle = l > 0.55 ? `rgba(255,255,240,${0.35 + rnd() * 0.3})` : `rgba(40,48,30,${0.25 + rnd() * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * s, rnd() * s, 1.5 + rnd() * 2.5, 1 + rnd() * 1.5, rnd() * 3.14, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Kies */
export const gravelTex = () => make("gravel", 128, (ctx, s, rnd) => noise(ctx, s, rnd, [168, 164, 156], 70, 5000, 2));

/** Textur mit eigener Wiederholung (teilt das Bild mit dem Original) */
export function repeat(tex: THREE.Texture, rx: number, ry: number) {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}
