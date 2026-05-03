import { expect, test, type Page } from "@playwright/test";

/**
 * Power-user keyboard shortcuts on the PlayPage (PlayPage.tsx ~line 1530).
 *
 *   N           — new game (calls confirmIfInProgress + reseeds)
 *   F           — toggle favorite (emits a "Added/Removed favorites" toast)
 *   Shift+F     — best-effort fullscreen request (no-op in headless Chrome)
 *   = or Shift+= (= "+") — open the seed picker
 *   I           — toggle the session-info popover
 *   T           — toggle the per-game settings modal
 *
 * On a freshly-dealt klondike game the in-progress confirm dialog should NOT
 * appear (elapsed <= 30s and actionCount <= 5), so N silently restarts the
 * deal. We verify the page survives instead of asserting on the confirm.
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

async function startKlondike(page: Page): Promise<void> {
  await page.goto("/play/klondike", { waitUntil: "domcontentloaded" });
  const setup = page.getByTestId("setup-panel");
  if (await setup.isVisible().catch(() => false)) {
    await page.getByTestId("start-game").click();
  }
  await expect(page.getByTestId("hint-target-klondike")).toBeVisible({ timeout: 10_000 });
}

test.describe("playpage keyboard shortcuts", () => {
  test("N reseeds the game and the page stays alive", async ({ page }) => {
    await loginAs(page, "shortn");
    await startKlondike(page);

    // Fresh deal — confirmIfInProgress() short-circuits to true, so no
    // confirm-dialog should appear. The handler reseeds via startWithSeed
    // and the klondike root must remount cleanly.
    await page.keyboard.press("n");
    await expect(page.getByTestId("confirm-dialog")).toHaveCount(0);
    await expect(page.getByTestId("hint-target-klondike")).toBeVisible();
  });

  test("F toggles favorite and surfaces a toast", async ({ page }) => {
    await loginAs(page, "shortf");
    await startKlondike(page);

    // First press favorites the game.
    await page.keyboard.press("f");
    const toasts = page.getByTestId("play-toasts");
    await expect(toasts).toContainText(/favorites/i);

    // Second press unfavorites — toast text flips. The queue may already
    // have the first toast in it, so just assert the latest message is
    // present somewhere in the stack.
    await page.keyboard.press("f");
    await expect(toasts).toContainText(/Removed from favorites/i);
  });

  test("Shift+F requests fullscreen without throwing", async ({ page }) => {
    await loginAs(page, "shortsf");
    await startKlondike(page);

    // Headless Chromium typically denies the fullscreen request, but
    // toggleFullscreen() swallows the rejection. We just confirm the
    // handler ran and the play page is still mounted afterwards.
    await page.keyboard.press("Shift+F");
    await expect(page.getByTestId("play-fullscreen-btn")).toBeVisible();
    await expect(page.getByTestId("hint-target-klondike")).toBeVisible();
  });

  test("= and Shift+= open the seed picker", async ({ page }) => {
    await loginAs(page, "shorteq");
    await startKlondike(page);

    const picker = page.getByTestId("play-seed-picker");
    await expect(picker).toHaveCount(0);

    // Plain "=" — the handler matches both "=" and "+".
    await page.keyboard.press("=");
    await expect(picker).toBeVisible();

    // Close (Escape is wired by the picker's own handler) and re-open via
    // Shift+= which produces "+" — still maps to the seed-picker open.
    await page.keyboard.press("Escape");
    await expect(picker).toHaveCount(0);
    await page.keyboard.press("Shift+=");
    await expect(picker).toBeVisible();
  });

  test("I toggles the session-info popover", async ({ page }) => {
    await loginAs(page, "shorti");
    await startKlondike(page);

    const info = page.getByTestId("play-info-popover");
    await expect(info).toHaveCount(0);

    await page.keyboard.press("i");
    await expect(info).toBeVisible();

    await page.keyboard.press("i");
    await expect(info).toHaveCount(0);
  });

  test("T toggles the per-game settings modal", async ({ page }) => {
    await loginAs(page, "shortt");
    await startKlondike(page);

    const modal = page.getByTestId("play-settings-modal");
    await expect(modal).toHaveCount(0);

    await page.keyboard.press("t");
    await expect(modal).toBeVisible();

    // Close via the X button (Escape is owned by the modal's own handler
    // and is exercised by other specs).
    await page.getByTestId("play-settings-close").click();
    await expect(modal).toHaveCount(0);
  });
});
