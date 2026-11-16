import { expect, test } from "@playwright/test";

// Der Formular-Endpunkt wird abgefangen – es wird nie wirklich etwas gesendet.
test("Anfrage-Assistent: Validierung je Schritt und erfolgreiches Absenden", async ({ page }) => {
  let payload: Record<string, unknown> | null = null;
  await page.route("https://formspree.io/**", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto("/kontakt/");
  const weiter = page.getByRole("button", { name: "Weiter" });

  await weiter.click();
  await expect(page.getByText("Bitte wählen Sie mindestens einen Bereich.")).toBeVisible();
  await page.getByRole("checkbox", { name: "Heizung" }).click();
  await weiter.click();

  await weiter.click();
  await expect(page.getByText("Bitte wählen Sie die Art des Objekts.")).toBeVisible();
  await page.getByRole("radio", { name: "Einfamilienhaus" }).click();
  await page.getByRole("radio", { name: "Modernisierung / Sanierung" }).click();
  await weiter.click();

  const message = page.getByLabel("Ihr Anliegen *");
  await expect(message).toHaveAttribute("maxlength", "4000");
  await message.fill("Wir möchten unsere alte Gasheizung durch eine Wärmepumpe ersetzen.");
  await weiter.click();

  await page.getByRole("button", { name: "Anfrage senden" }).click();
  await expect(page.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(page.getByLabel("Name *")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Name *").fill("Erika Muster");
  await page.getByLabel("E-Mail *").fill("erika@example.org");
  const consent = page.getByRole("checkbox", { name: /Ich bin einverstanden/ });
  await expect(consent).not.toBeChecked();
  await consent.check();
  await page.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.getByRole("heading", { name: "Anfrage gesendet." })).toBeVisible();
  expect(payload).not.toBeNull();
  expect(JSON.stringify(payload)).toContain("erika@example.org");
});
