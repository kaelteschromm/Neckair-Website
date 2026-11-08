// Erzeugt aus assets-src/photos responsive AVIF- und WebP-Varianten in public/img
// sowie src/lib/images.generated.ts (Maße + winziger Unschärfe-Platzhalter).
// Läuft automatisch vor `dev` und `build`.
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "assets-src", "photos");
const outDir = path.join(root, "public", "img");
const genFile = path.join(root, "src", "lib", "images.generated.ts");
const WIDTHS = [480, 800, 1200, 1600, 2200];

await mkdir(outDir, { recursive: true });
const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const entries = [];

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, "");
  const input = path.join(srcDir, file);
  const meta = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, 2200));
  const unique = [...new Set(widths)].sort((a, b) => a - b);
  const srcMtime = (await stat(input)).mtimeMs;

  for (const w of unique) {
    for (const fmt of ["avif", "webp"]) {
      const out = path.join(outDir, `${name}-${w}.${fmt}`);
      if (existsSync(out) && (await stat(out)).mtimeMs > srcMtime) continue;
      const img = sharp(input).resize({ width: w, withoutEnlargement: true });
      await (fmt === "avif" ? img.avif({ quality: 52, effort: 4 }) : img.webp({ quality: 74 })).toFile(out);
    }
  }
  const blur = await sharp(input).resize(24).webp({ quality: 40 }).toBuffer();
  entries.push({
    name,
    width: meta.width,
    height: meta.height,
    widths: unique,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  });
  console.log(`✓ ${name} (${unique.join(", ")})`);
}

const body = `// Automatisch erzeugt von scripts/optimize-images.mjs – nicht von Hand bearbeiten.
export type ImageName = ${entries.map((e) => JSON.stringify(e.name)).join(" | ")};
export interface ImageMeta { width: number; height: number; widths: number[]; blur: string }
export const images: Record<ImageName, ImageMeta> = ${JSON.stringify(
  Object.fromEntries(entries.map(({ name, ...rest }) => [name, rest])),
  null,
  2,
)};
`;
await writeFile(genFile, body);
console.log(`→ ${entries.length} Bilder, ${path.relative(root, genFile)}`);
