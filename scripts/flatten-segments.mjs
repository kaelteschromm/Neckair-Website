// Next 16 legt Prefetch-Segmente im Export als Ordner ab (__next.heizung/__PAGE__.txt),
// der Client fragt aber die flache Variante an (__next.heizung.__PAGE__.txt).
// Statische Hosts wie GitHub Pages lösen das nicht auf – daher zusätzlich flache Kopien erzeugen.
import { readdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(import.meta.dirname, "..", "out");
let count = 0;

async function filesIn(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) result.push(...(await filesIn(p)));
    else result.push(p);
  }
  return result;
}

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) {
      for (const f of await filesIn(p)) {
        const rel = path.relative(p, f).split(path.sep).join(".");
        await copyFile(f, path.join(dir, `${e.name}.${rel}`));
        count++;
      }
    } else {
      await walk(p);
    }
  }
}

if ((await stat(out).catch(() => null))?.isDirectory()) {
  await walk(out);
  console.log(`✓ ${count} Prefetch-Segmente zusätzlich flach abgelegt`);
}
