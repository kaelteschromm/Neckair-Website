import { expect, test, type Page } from "@playwright/test";

async function openHouse(page: Page, touch: boolean) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#erkunden").scrollIntoViewIfNeeded();
  if (touch) await page.getByRole("button", { name: "3D-Haus starten" }).click();
  await expect(page.locator("#erkunden canvas")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Architektur" })).toBeVisible({ timeout: 45_000 });
}

test("3D-Haus: lädt nicht vorab, startet und reagiert auf Modi und Bauteile", async ({ page }, info) => {
  const touch = info.project.name !== "desktop";
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  // Vor dem Scrollen zum Haus existiert noch kein 3D-Canvas
  await expect(page.locator("#erkunden canvas")).toHaveCount(0);

  await openHouse(page, touch);
  if (touch) await expect(page.getByRole("dialog", { name: "3D-Haus im Vollbild" })).toBeVisible();

  await page.getByRole("button", { name: "Technik" }).click();
  await expect(page.getByRole("button", { name: "Technik" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Dach", exact: true })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "Wasser", exact: true }).click();
  await page.getByRole("button", { name: "EG", exact: true }).click();
  await expect(page.getByRole("button", { name: "EG", exact: true })).toHaveAttribute("aria-pressed", "true");

  if (touch) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }

  // Auswahl über die zugängliche Bauteil-Liste
  await page.getByRole("button", { name: "Warmwasserspeicher" }).click();
  await expect(page.getByRole("heading", { name: "Warmwasserspeicher", level: 3 })).toBeVisible();
  await expect(page.locator("#erkunden").getByRole("link", { name: "Mehr zu Sanitär & Trinkwasser" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("3D-Haus: Kamera-Bedienung per Tastatur erreichbar", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Tastatur auf Desktop");
  await openHouse(page, false);
  for (const name of ["Nach links drehen", "Nach rechts drehen", "Heranzoomen", "Herauszoomen", "Ansicht zurücksetzen"]) {
    const b = page.getByRole("button", { name });
    await b.focus();
    await expect(b).toBeFocused();
    await page.keyboard.press("Enter");
  }
});

test("3D-Haus: Ersatzdarstellung ohne WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error – Test: WebGL abschalten
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return orig.call(this, type, ...rest);
    };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#erkunden").scrollIntoViewIfNeeded();
  await expect(page.getByText("Ihr Browser kann das 3D-Modell nicht anzeigen.")).toBeVisible();
  await page.getByRole("button", { name: "Fußbodenheizung" }).click();
  await expect(page.getByRole("heading", { name: "Fußbodenheizung", level: 3 })).toBeVisible();
});
