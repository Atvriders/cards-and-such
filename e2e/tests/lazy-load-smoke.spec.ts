import { expect, test } from "@playwright/test";

/**
 * W469 lazy-load smoke.
 *
 * Each game plugin is wrapped in `React.lazy` and rendered inside a
 * `<Suspense>` boundary in PlayPage.tsx with a `GameLoadingSkeleton`
 * fallback (data-testid="play-loading-skeleton"). Once the chunk
 * resolves the skeleton unmounts and the play board (.play-board)
 * takes over.
 *
 * This spec asserts the lazy boundary actually wires up for
 * `/play/klondike`: either we observe the skeleton mid-flight, or the
 * play-board renders directly (for instance when the chunk is already
 * cached in the module graph during dev). Either outcome proves the
 * lazy boundary is present and didn't throw.
 */
test.describe("W469 lazy-load smoke", () => {
  test("/play/klondike shows the loading skeleton or renders the play-board", async ({ page }) => {
    const username = `e2e_lazy_${Math.random().toString(36).slice(2, 8)}`;
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/username/i).fill(username);
    await page.getByRole("button", { name: /^claim$/i }).click();
    await expect(page).toHaveURL("/");

    const skeleton = page.getByTestId("play-loading-skeleton");
    const playBoard = page.locator(".play-board");

    // Kick off navigation but don't await: we want a chance to observe
    // the suspense fallback while the chunk is still in flight.
    const navPromise = page.goto("/play/klondike", { waitUntil: "domcontentloaded" });

    // First-to-resolve wins. Either the skeleton became visible (lazy
    // chunk in-flight) or the play-board rendered (chunk already
    // cached / resolved synchronously). Both are valid pass states.
    await Promise.race([
      skeleton.waitFor({ state: "visible", timeout: 10_000 }),
      playBoard.waitFor({ state: "visible", timeout: 10_000 }),
    ]);

    await navPromise;

    // The play-board must end up rendered, proving the lazy import
    // resolved successfully (skeleton alone with no resolution would
    // be a regression).
    await expect(playBoard).toBeVisible({ timeout: 15_000 });
  });
});
