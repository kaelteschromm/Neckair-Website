import { expect, test } from "@playwright/test";

const ROUTES = [
  "/", "/heizung/", "/sanitaer/", "/klima/", "/referenzen/", "/referenzen/einfamilienhaus-waermepumpe/",
  "/unternehmen/", "/kontakt/", "/impressum/", "/datenschutz/", "/agb/", "/nutzungsbedingungen/",
];

for (const route of ROUTES) {
  test(`Seite ${route}: lädt fehlerfrei, eine h1, kein Überlauf, Alt-Texte`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "horizontaler Überlauf in px").toBeLessThanOrEqual(1);

    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);
    expect(await page.title()).toMatch(/NECKAIR/);
    expect(errors).toEqual([]);
  });
}

test("Unbekannte Adresse zeigt die 404-Seite", async ({ page }) => {
  const res = await page.goto("/gibt-es-nicht/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
});

test("Alte Adressen leiten weiter", async ({ page }) => {
  await page.goto("/waermepumpen.html");
  await page.waitForURL(/\/heizung\/$/);
});

test("Keine Fremd-Verbindungen beim Seitenaufruf", async ({ page }) => {
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) foreign.push(r.url());
  });
  for (const route of ["/", "/kontakt/", "/heizung/"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
  }
  expect(foreign).toEqual([]);
});

test("Keine Cookies und kein Web Storage", async ({ page, context }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.goto("/kontakt/", { waitUntil: "networkidle" });
  expect(await context.cookies()).toEqual([]);
  const storage = await page.evaluate(() => localStorage.length + sessionStorage.length);
  expect(storage).toBe(0);
});
