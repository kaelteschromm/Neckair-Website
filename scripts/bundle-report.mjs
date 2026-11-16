// Misst das initial geladene JavaScript einer Seite (gzip) und die größten nachgeladenen Chunks.
// Aufruf nach `npm run build`: node scripts/bundle-report.mjs [seite, z. B. index.html]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const out = join(process.cwd(), "out");
const page = process.argv[2] || "index.html";
const html = readFileSync(join(out, page), "utf8");
const gz = (file) => gzipSync(readFileSync(file)).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const initial = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]))];
let total = 0;
for (const src of initial) total += gz(join(out, src.replace(/^\//, "")));
console.log(`Initiales JS (${page}): ${initial.length} Dateien, ${kb(total)} gzip`);

const dir = join(out, "_next", "static", "chunks");
const all = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".js")) all.push(p);
  }
};
walk(dir);
const three = all.filter((p) => readFileSync(p, "utf8").includes("WebGLRenderer"));
const inInitial = three.some((p) => initial.some((s) => p.replaceAll("\\", "/").endsWith(s.replace(/^\//, "").replace("_next/", "_next/"))));
console.log(`three.js-Chunk(s): ${three.map((p) => kb(gz(p))).join(", ") || "keiner"} – im Initial-Bundle: ${inInitial ? "JA (Fehler)" : "nein"}`);
const biggest = all.map((p) => ({ p, s: gz(p) })).sort((a, b) => b.s - a.s).slice(0, 6);
console.log("Größte Chunks (gzip):");
for (const b of biggest) console.log(`  ${kb(b.s).padStart(9)}  ${b.p.slice(out.length + 1)}`);
const budget = 260 * 1024;
if (total > budget) {
  console.error(`Budget überschritten: ${kb(total)} > ${kb(budget)}`);
  process.exitCode = 1;
}
