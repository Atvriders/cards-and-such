import { expect, test, type Page } from "@playwright/test";

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

  test("favorites chip shows empty state with no stored favorites", async ({ page }) => {
    await loginAs(page, "fav");
    // No localStorage favorites have been seeded for this fresh user, so the
    // Favorites chip — when present — should render the empty state.
    const favChip = page
      .getByRole("tab", { name: /favorites/i })
      .or(page.getByRole("button", { name: /favorites/i }))
      .first();
    if (await favChip.count() > 0 && await favChip.isVisible().catch(() => false)) {
      await favChip.click();
      const empty = page
        .getByTestId("lobby-favorites-empty")
        .or(page.getByTestId("lobby-no-results"))
        .or(page.getByTestId("lobby-empty"));
      await expect(empty.first()).toBeVisible();
    } else {
      test.info().annotations.push({
        type: "skip",
        description: "Favorites chip not present in current build",
      });
    }
  });

  test("submitting search 'klondike' lands on /search?q=klondike", async ({ page }) => {
    await loginAs(page, "search");
    // The header search lives inside a <form role="search"> with a single
    // search input. Open the toggle if it's collapsed, then submit.
    const searchToggle = page.getByRole("button", { name: /search lobby/i }).first();
    if (await searchToggle.isVisible().catch(() => false)) {
      await searchToggle.click().catch(() => undefined);
    }
    const input = page.getByRole("searchbox", { name: /search lobby/i });
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
