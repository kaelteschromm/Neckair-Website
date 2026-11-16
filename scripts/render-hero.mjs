// Rendert das Hero-Bild (Quer- und Hochformat) per Pathtracing aus derselben 3D-Szene wie die Website.
// Voraussetzung: lokaler Dev-Server mit Render-Seite:  RENDER_HERO=1 npx next dev -p 3005
// Aufruf:  node scripts/render-hero.mjs [samples] [nur: landscape|portrait]
// Ergebnis: assets-src/photos/haus-hero.jpg und haus-hero-hoch.jpg (danach `npm run images`).
import { chromium } from "playwright";
import sharp from "sharp";
import { join } from "node:path";

const samples = Number(process.argv[2] || 600);
const only = process.argv[3];
const denoise = Number(process.env.DENOISE ?? 4);
const out = join(process.cwd(), "assets-src", "photos");
const jobs = [
  { o: "landscape", w: 2400, h: 1350, file: "haus-hero.jpg" },
  { o: "portrait", w: 1200, h: 2133, file: "haus-hero-hoch.jpg" },
].filter((j) => !only || j.o === only);

// Echte Grafikkarte nutzen (kein SwiftShader) – Pathtracing ist rechenintensiv
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist"] });
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  page.on("pageerror", (e) => console.error("Seitenfehler:", e.message));
  await page.goto(`http://localhost:3005/render-hero/?o=${j.o}&w=${j.w}&h=${j.h}&s=${samples}&d=${denoise}`);
  await page.waitForFunction(() => window.__heroReady === true, null, { timeout: 180_000 });
  const t0 = Date.now();
  let last = -1;
  for (;;) {
    const n = await page.evaluate(() => window.__heroSamples ?? 0);
    if (n !== last && n % 50 === 0) console.log(`${j.o}: ${n}/${samples} Samples`);
    last = n;
    if (n >= samples) break;
    await page.waitForTimeout(1000);
  }
  const png = await page.locator("canvas").screenshot({ type: "png" });
  // Medianfilter entfernt vereinzelte helle Pixel (Glas, Innenlicht), Kanten bleiben erhalten
  await sharp(png).median(3).jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(join(out, j.file));
  console.log(`✓ ${j.file} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  await page.close();
}
await browser.close();
