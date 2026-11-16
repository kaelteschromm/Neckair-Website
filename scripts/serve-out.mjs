// Minimaler statischer Server für den Export in out/ (lokale Vorschau und Playwright-Tests).
// Aufruf: node scripts/serve-out.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.argv[2] || process.env.PORT || 4321);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".avif": "image/avif", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".json": "application/json",
};

createServer(async (req, res) => {
  let url;
  try {
    url = decodeURIComponent((req.url || "/").split("?")[0]);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (url.endsWith("/")) url += "index.html";
  const file = normalize(join(root, url));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    const body = await readFile(join(root, "404.html")).catch(() => "404");
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(body);
  }
}).listen(port, "127.0.0.1", () => console.log(`out/ auf http://localhost:${port}`));
