import { expect, test, type Page } from "@playwright/test";

/** Scrollt in der Scrollgeschichte an eine relative Position (0 = Hero, 1 = Ende) */
async function scrollStory(page: Page, p: number) {
  await page.evaluate((frac) => {
    const sec = document.querySelector<HTMLElement>("main section");
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (sec.offsetHeight - window.innerHeight) * frac, behavior: "instant" });
  }, p);
}

test("Hero: Motiv mit Alternativtext und Botschaft", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("Heizung. Sanitär.");
  await expect(page.locator("h1")).toContainText("Klima. Kälte.");
  const hero = page.locator("main img").first();
  await expect(hero).toHaveAttribute("alt", /Einfamilienhaus/);
  await expect(page.getByRole("link", { name: "Projekt anfragen" }).first()).toBeVisible();
});

test("Scrollgeschichte: Bild weicht dem 3D-Haus, Kapitel erscheinen, danach interaktiv", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/", { waitUntil: "networkidle" });

  await scrollStory(page, 0.05);
  await expect(page.locator("main canvas")).toHaveCount(1, { timeout: 45_000 });

  await scrollStory(page, 0.42);
  await expect(page.getByText("So könnte Ihr Zuhause aussehen.")).toBeVisible({ timeout: 30_000 });

  await scrollStory(page, 0.65);
  await expect(page.getByText("Die Wärmepumpe holt Energie aus der Außenluft.", { exact: false })).toBeVisible();

  await scrollStory(page, 0.95);
  await expect(page.getByRole("button", { name: "Technik" })).toHaveAttribute("aria-pressed", "true", { timeout: 15_000 });

  await page.getByRole("button", { name: "Wasser", exact: true }).click();
  await expect(page.getByRole("button", { name: "Wasser", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "EG", exact: true }).click();
  await expect(page.getByRole("button", { name: "EG", exact: true })).toHaveAttribute("aria-pressed", "true");

  // Auswahl über die zugängliche Bauteil-Liste
  await page.getByRole("button", { name: "Warmwasserspeicher" }).click();
  await expect(page.getByRole("heading", { name: "Warmwasserspeicher", level: 3 })).toBeVisible();
  await expect(page.locator("main section").first().getByRole("link", { name: "Mehr zu Sanitär & Trinkwasser" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("3D-Haus: Vollbild öffnet als Dialog und schließt mit Escape", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollStory(page, 0.95);
  await page.getByRole("button", { name: "Vollbild" }).click({ timeout: 45_000 });
  await expect(page.getByRole("dialog", { name: "3D-Haus im Vollbild" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("3D-Haus: Kamera-Bedienung per Tastatur erreichbar", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Tastatur auf Desktop");
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollStory(page, 0.95);
  await page.getByRole("button", { name: "Ansicht zurücksetzen" }).waitFor({ timeout: 45_000 });
  for (const name of ["Nach links drehen", "Nach rechts drehen", "Heranzoomen", "Herauszoomen", "Ansicht zurücksetzen"]) {
    const b = page.getByRole("button", { name });
    await b.focus();
    await expect(b).toBeFocused();
    await page.keyboard.press("Enter");
  }
});

test("Ohne WebGL: ruhige Variante mit Hero und Bauteil-Liste", async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error – Test: WebGL abschalten
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return orig.call(this, type, ...rest);
    };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("Klima. Kälte.");
  await expect(page.getByText("Ihr Browser kann das 3D-Modell nicht anzeigen.")).toBeVisible();
  await page.getByRole("button", { name: "Fußbodenheizung" }).click();
  await expect(page.getByRole("heading", { name: "Fußbodenheizung", level: 3 })).toBeVisible();
});

test("Reduzierte Bewegung: keine Scrollgeschichte, Hero sofort lesbar", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:4322/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toBeVisible();
  // Nach der Hydration schaltet die Seite auf die ruhige Variante (Hero = eine Bildschirmhöhe)
  await expect
    .poll(() => page.evaluate(() => document.querySelector<HTMLElement>("main section")!.offsetHeight), { timeout: 10_000 })
    .toBeLessThanOrEqual(820);
  await ctx.close();
});
