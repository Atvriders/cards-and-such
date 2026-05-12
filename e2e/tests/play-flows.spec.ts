import { expect, test, type Page } from "../fixtures";

/**
 * Smoke coverage for the in-game toolbar surfaces:
 *   - Hint pulse (klondike has a `plugin.hint` implementation)
 *   - Ctrl+Z undo keyboard shortcut
 *   - Fullscreen request (best-effort — we never await actual fullscreen,
 *     we just verify the click does not throw and the button stays mounted)
 *
 * Each scenario logs in with a fresh username so the welcome tutorial /
 * coachmark side-effects from sibling specs don't leak in.
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  // Bump the URL-assertion timeout: under concurrent load the claim
  // POST + lobby-route mount can take longer than the 5s default.
  await expect(page).toHaveURL("/", { timeout: 15_000 });
}

async function startKlondike(page: Page): Promise<void> {
  // Pre-mark klondike's per-game tutorial as seen so the tutorial overlay
  // (modal SVG backdrop) doesn't intercept pointer events on the play
  // toolbar. The shared `fixtures.ts` only pre-dismisses the welcome
  // carousel; per-game tutorials use the same SeenMap keyed by `plugin.id`.
  await page.addInitScript(() => {
    try {
      const raw = window.localStorage.getItem("cards-tutorial-seen");
      const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      map["klondike"] = true;
      window.localStorage.setItem("cards-tutorial-seen", JSON.stringify(map));
    } catch {
      /* ignore */
    }
  });
  await page.goto("/play/klondike", { waitUntil: "domcontentloaded" });
  // PlayPage may render the setup-panel or jump straight to play depending
  // on stored prefs. If setup is showing, click Start to enter "playing".
  const setup = page.getByTestId("setup-panel");
  if (await setup.isVisible().catch(() => false)) {
    await page.getByTestId("start-game").click();
  }
  // Wait for the klondike root to render — Klondike.tsx tags it with
  // data-testid="hint-target-klondike". This both confirms the tile is
  // mounted and gives the hint button a target to pulse.
  await expect(page.getByTestId("hint-target-klondike")).toBeVisible({ timeout: 10_000 });
}

test.describe("play flows smoke", () => {
  test("klondike hint button adds .hint-pulse to the table", async ({ page }) => {
    await loginAs(page, "hint");
    await startKlondike(page);

    const hintBtn = page.getByTestId("play-hint-btn");
    await expect(hintBtn).toBeVisible();
    await expect(hintBtn).toBeEnabled();
    await hintBtn.click();

    // The hint targets a selector inside the klondike root; whichever node
    // the plugin chose, *something* on the page should now carry the
    // `hint-pulse` class. Class is removed ~1.5s later, so poll quickly.
    await expect.poll(
      async () => page.locator(".hint-pulse").count(),
      { timeout: 2_000 },
    ).toBeGreaterThanOrEqual(1);
  });

  test("Ctrl+Z keyboard shortcut wires through to the undo handler", async ({ page }) => {
    await loginAs(page, "undo");
    await startKlondike(page);

    // The undo button starts disabled (empty undoStack). Pressing Ctrl+Z
    // when there's nothing to undo is a documented no-op — the button
    // should remain mounted and disabled, proving the shortcut handler is
    // bound and didn't blow up the page.
    const undoBtn = page.getByTestId("play-undo-btn");
    await expect(undoBtn).toBeVisible();
    await expect(undoBtn).toBeDisabled();

    await page.keyboard.press("Control+z");

    // Whether or not anything actually undid (nothing should, on a fresh
    // deal), the button must still be present and the play page must
    // still be alive — i.e. the handler didn't throw.
    await expect(undoBtn).toBeVisible();
    await expect(page.getByTestId("hint-target-klondike")).toBeVisible();
  });

  test("fullscreen button click does not throw", async ({ page }) => {
    await loginAs(page, "fs");
    await startKlondike(page);

    const fsBtn = page.getByTestId("play-fullscreen-btn");
    await expect(fsBtn).toBeVisible();
    // Clicking requests fullscreen; in headless Chromium the request may
    // be denied, but the click handler swallows errors. We only verify
    // the button stays mounted afterwards (no unhandled exception bubbled
    // up and tore down the page).
    await fsBtn.click();
    await expect(fsBtn).toBeVisible();
    await expect(page.getByTestId("hint-target-klondike")).toBeVisible();
  });
});
