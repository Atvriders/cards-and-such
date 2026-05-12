import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";

/**
 * Smoke-render coverage for the new lobby surfaces:
 *   - Search results page
 *   - Category page
 *   - Leaderboard (My Ladder tab)
 *   - Daily challenge
 *   - 404 fallback
 *
 * Each test only verifies the route renders the page-level testid. Deeper
 * interactions live in the per-page specs.
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("lobby flows smoke", () => {
  test("lobby renders at least 100 game tiles", async ({ page }) => {
    await loginAs(page, "tiles");
    // The lobby tiles use data-testid="tile-<gameId>". Family tiles share the
    // same prefix, so this counts every renderable tile.
    const tiles = page.locator('[data-testid^="tile-"]:not([data-testid*="-fav-toggle"]):not([data-testid*="-rating"]):not([data-testid*="-tooltip"]):not([data-testid*="-badge"]):not([data-testid*="-skeleton"])');
    await expect.poll(async () => tiles.count(), { timeout: 10_000 }).toBeGreaterThanOrEqual(100);
  });

  test("favorites chip: empty state, then 2048 heart round-trip", async ({ page }) => {
    await loginAs(page, "fav");
    // W169 (c13fdfde) added the Favorites chip + per-tile heart toggle.
    // Fresh user has no stored favorites, so the chip should land on the
    // dedicated empty-state testid.
    const favChip = page.getByTestId("chip-favorites");
    await favChip.click();
    await expect(page.getByTestId("lobby-favorites-empty")).toBeVisible();

    // Bounce back to "All" so the target tile (and its heart toggle) is
    // mounted and clickable. We use `2048` instead of klondike because
    // klondike is now a featured *family* tile, and family-featured tiles
    // hard-code `isFavorite={false}` (see LobbyPage.tsx FeaturedTile),
    // which means a click never flips aria-pressed to "true". `2048` is
    // a standalone game and behaves like a normal lobby tile.
    await page.getByTestId("chip-all").click();
    const tileHeart = page.getByTestId("tile-fav-toggle-2048");
    await expect(tileHeart).toBeVisible();
    await tileHeart.click();
    await expect(tileHeart).toHaveAttribute("aria-pressed", "true");

    // Re-enter the Favorites chip; 2048 should now be the only tile.
    await favChip.click();
    await expect(page.getByTestId("tile-2048")).toBeVisible();
    await expect(page.getByTestId("lobby-favorites-empty")).toHaveCount(0);

    // Cleanup: unfavorite so the next test run starts from a clean slate.
    // The heart on the Favorites view still carries the same testid.
    await page.getByTestId("tile-fav-toggle-2048").click();
    await expect(page.getByTestId("lobby-favorites-empty")).toBeVisible();
  });

  test("welcome tutorial appears on a fresh device and Skip dismisses it", async ({ page }) => {
    // The welcome carousel only mounts inside AppShell, which is gated by
    // RequireAuth. Claim a username first to enter the shell, then
    // programmatically re-open the carousel via the documented event
    // bridge — the shared `addInitScript` fixture pre-marks the welcome
    // tutorial as seen, so a reload alone won't re-arm it.
    await loginAs(page, "welcome");
    // Wait for the AppShell to finish hydrating so its
    // `cards:open-welcome-tutorial` listener is actually attached.
    // Without this the dispatch can land before the useEffect runs and
    // the carousel never opens.
    await expect(page.getByTestId("tile-klondike")).toBeVisible();
    // Use `expect.poll` to retry the dispatch + visibility check — if the
    // listener still isn't bound, dispatch again next tick.
    const firstStep = page.getByTestId("tut-step-1");
    await expect
      .poll(
        async () => {
          await page.evaluate(() =>
            window.dispatchEvent(new Event("cards:open-welcome-tutorial")),
          );
          return await firstStep.count();
        },
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);
    await expect(firstStep).toBeVisible();

    await page.getByTestId("tut-skip").click();
    await expect(firstStep).toHaveCount(0);
  });

  test("footer shortcuts button opens kbd modal and Esc closes it", async ({ page }) => {
    await loginAs(page, "kbd");
    // Footer is below the fold on most viewports — wait for it to mount
    // (the AppShell renders it lazily), then click. Using `.click()` with
    // an internal scroll is more resilient than scrollIntoViewIfNeeded
    // when the footer subtree re-renders during initial lobby hydration.
    const trigger = page.getByTestId("footer-shortcuts-btn");
    await expect(trigger).toBeAttached();
    await trigger.click();

    const modal = page.getByTestId("kbd-modal");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });

  test("submitting search 'klondike' lands on /search?q=klondike", async ({ page }) => {
    await loginAs(page, "search");
    // The header search lives inside a <form role="search">. Once expanded
    // it renders as a combobox (suggest menu) rather than a plain
    // searchbox — match either role for resilience.
    const searchToggle = page.getByRole("button", { name: /search lobby/i }).first();
    if (await searchToggle.isVisible().catch(() => false)) {
      await searchToggle.click().catch(() => undefined);
    }
    const input = page.getByRole("combobox", { name: /search lobby/i });
    await input.fill("klondike");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=klondike/);
    await expect(page.getByTestId("search-top-match")).toBeVisible();
  });

  test("/category/cards renders header and count badge", async ({ page }) => {
    await loginAs(page, "cat");
    await page.goto("/category/cards", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("cat-header")).toBeVisible();
    await expect(page.getByTestId("cat-count-badge")).toBeVisible();
  });

  test("/leaderboard renders without crash and exposes My Ladder tab", async ({ page }) => {
    await loginAs(page, "lb");
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /^leaderboard$/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /my ladder/i })).toBeVisible();
  });

  test("/daily renders pick and streak testids", async ({ page }) => {
    await loginAs(page, "daily");
    await page.goto("/daily", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("daily-pick")).toBeVisible();
    await expect(page.getByTestId("daily-streak")).toBeVisible();
  });

  test("unknown route shows the 404 hero", async ({ page }) => {
    await loginAs(page, "nf");
    await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("nf-hero")).toBeVisible();
  });
});
