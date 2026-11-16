import { defineConfig } from "@playwright/test";

// Läuft gegen den statischen Export (out/) mit dem installierten Microsoft Edge – kein Browser-Download nötig.
// WebGL im Headless-Modus über SwiftShader.
const edge = {
  channel: "msedge",
  launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
};

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 3,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:4322", trace: "off" },
  webServer: { command: "node scripts/serve-out.mjs 4322", url: "http://127.0.0.1:4322", reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...edge, viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...edge, viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true } },
    { name: "mobile", use: { ...edge, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
