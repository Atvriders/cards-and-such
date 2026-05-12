import { expect, test, type Page } from "../fixtures";

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

const CATEGORIES = ["solitaire", "cards", "dice", "board", "arcade"] as const;

test.describe("per-category render smoke", () => {
  for (const cat of CATEGORIES) {
    test(`/category/${cat} renders without error and shows non-zero game tiles`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await loginAs(page, `cat_${cat}`);
      await page.goto(`/category/${cat}`);

      // Header for this category renders (proves route + page mounted).
      await expect(page.getByTestId(`category-page-${cat}`)).toBeVisible();
      await expect(page.getByTestId("cat-header")).toBeVisible();

      // Count badge shows a positive integer.
      const badge = page.getByTestId("cat-count-badge");
      await expect(badge).toBeVisible();
      const badgeText = (await badge.textContent()) ?? "";
      const match = badgeText.replace(/,/g, "").match(/(\d+)/);
      const count = match ? Number(match[1]) : 0;
      expect(count).toBeGreaterThan(0);

      // The all-games grid must render at least one tile.
      const grid = page.getByTestId("cat-grid");
      await expect(grid).toBeVisible();
      const tiles = grid.locator('[data-testid^="cat-game-"]');
      expect(await tiles.count()).toBeGreaterThan(0);
      await expect(tiles.first()).toBeVisible();

      expect(consoleErrors, `console errors on /category/${cat}: ${consoleErrors.join(" | ")}`).toEqual([]);
    });
  }
});
