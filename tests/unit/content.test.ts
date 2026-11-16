// Inhaltsregeln der Marke: gestrichener Slogan, nur drei Gewerke, Platzhalter erkennbar.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css|html|md)$/.test(f) ? [p] : [];
  });
}
const sources = [...files(join(root, "src")), ...files(join(root, "public")).filter((f) => f.endsWith(".html"))];

test("Der frühere Slogan kommt nirgends mehr vor", () => {
  const hits = sources.filter((f) => readFileSync(f, "utf8").includes("Ingenieursblick"));
  assert.deepEqual(hits, []);
});

test("Leistungen enthalten keine Lüftung", () => {
  const services = readFileSync(join(root, "src/content/services.ts"), "utf8");
  assert.equal(/Lüftungs?anlage|Wohnraumlüftung|Lüftungstechnik/.test(services), false);
});

test("Platzhalter in den Firmendaten bleiben gekennzeichnet", () => {
  const site = readFileSync(join(root, "src/lib/site.ts"), "utf8");
  for (const value of ["Musterstraße", "123456", "DE123456789"]) {
    const line = site.split("\n").find((l) => l.includes(value));
    if (line) assert.match(line, /PLATZHALTER/, value);
  }
});

test("Externe Links öffnen mit noopener", () => {
  for (const f of sources.filter((x) => x.endsWith(".tsx"))) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/target="_blank"[^>]*/g)) assert.match(m[0], /rel="noopener noreferrer"/, f);
  }
});
