import { expect, test, type Page } from "../fixtures";

/**
 * Smoke coverage for the appearance / theme surfaces in /settings:
 *   - Selecting the Custom theme reveals the accent color input
 *   - Changing the accent updates the `--theme-accent` CSS variable on
 *     <html> (themes.ts writes via `root.style.setProperty`)
 *   - The "Reset theme" inline link clears the custom selection
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

async function readAccent(page: Page): Promise<string> {
  return page.evaluate(() =>
    (document.documentElement.style.getPropertyValue("--theme-accent") || "").trim(),
  );
}

test.describe("theme flows smoke", () => {
  test("custom theme writes a new --theme-accent CSS var", async ({ page }) => {
    await loginAs(page, "theme");
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("settings-page")).toBeVisible();

    // Pick the Custom swatch — the inline accent <input type="color">
    // appears underneath once selected.
    await page.getByTestId("theme-row-custom").click();
    const accentInput = page.getByTestId("theme-custom-accent");
    await expect(accentInput).toBeVisible();

    // Drive the color input via a programmatic 'input' event — native
    // <input type="color"> doesn't accept synthetic clicks well in
    // headless Chromium, but `input.value = ...; dispatch('input')` is
    // exactly what React listens for.
    const before = await readAccent(page);
    const targetColor = "#ff00aa";
    // React's controlled <input type="color"> ignores raw `el.value = ...`
    // because the SyntheticEvent change tracker still sees the old value.
    // Use the native HTMLInputElement value setter so React's onChange fires.
    await page.evaluate((next) => {
      const el = document.querySelector(
        '[data-testid="theme-custom-accent"]',
      ) as HTMLInputElement | null;
      if (!el) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(el, next);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, targetColor);

    await expect.poll(async () => readAccent(page), { timeout: 5_000 }).toBe(targetColor);
    expect(before).not.toBe(targetColor);
  });

  test("'Reset theme' link reverts to the default theme row", async ({ page }) => {
    await loginAs(page, "themereset");
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("settings-page")).toBeVisible();

    // Switch to Custom first so reset has something to undo.
    await page.getByTestId("theme-row-custom").click();
    await expect(page.getByTestId("theme-row-custom")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.getByTestId("theme-reset").click();

    // After reset, the Custom row should no longer be the active radio.
    // Whichever default the app ships with, it won't be `theme-row-custom`.
    await expect(page.getByTestId("theme-row-custom")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});
