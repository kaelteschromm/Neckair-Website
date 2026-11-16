import { expect, test } from "@playwright/test";

test("Hauptnavigation (Desktop)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "nur Desktop-Navigation");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
  await nav.getByRole("link", { name: "Referenzen" }).click();
  await expect(page).toHaveURL(/\/referenzen\/$/);
  await nav.getByRole("link", { name: "Unternehmen" }).click();
  await expect(page).toHaveURL(/\/unternehmen\/$/);
  await expect(page.locator("h1")).toContainText("Gebäudetechnik aus einer Hand");
});

test("Mobilmenü öffnet, navigiert und schließt mit Escape", async ({ page }, info) => {
  test.skip(info.project.name === "desktop", "nur Touch-Layouts");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menü öffnen" });
  await toggle.click();
  const mobile = page.getByRole("navigation", { name: "Mobile Navigation" });
  await expect(mobile).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeVisible();
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await mobile.getByRole("link", { name: "Klima & Kälte" }).first().click();
  await expect(page).toHaveURL(/\/klima\/$/);
});

test("Tastatur: Skip-Link springt zum Inhalt", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Tastatur auf Desktop");
  await page.goto("/heizung/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Zum Inhalt springen" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#inhalt$/);
});

test("Reduzierte Bewegung: Inhalte sind sofort sichtbar", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto("/unternehmen/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 1600));
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).clipPath.includes("100%")).length,
  );
  expect(hidden).toBe(0);
  await ctx.close();
});
