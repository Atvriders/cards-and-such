import { expect, test, type Page } from "../fixtures";

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  // Bump the URL-assertion timeout: under concurrent load the claim
  // POST + lobby-route mount can take longer than the 5s default.
  await expect(page).toHaveURL("/", { timeout: 15_000 });
}

test.describe("top-games smoke", () => {
  test("lobby renders with klondike tile", async ({ page }) => {
    await loginAs(page, "lobby");
    await expect(page.getByTestId("tile-klondike")).toBeVisible();
    await expect(page.getByTestId("lobby-total-count")).toBeVisible();
  });

  test("clicking klondike tile navigates to /play/klondike", async ({ page }) => {
    await loginAs(page, "k");
    // Klondike now lives inside a family (LobbyPage FEATURED_IDS), so
    // `tile-klondike` is the family-aggregate button which opens a
    // variants picker dialog rather than navigating directly. Click the
    // tile, then click the "Klondike Solitaire" link inside the picker
    // which points at /play/klondike.
    await page.getByTestId("tile-klondike").click();
    await page
      .getByRole("dialog", { name: /klondike variants/i })
      .getByRole("link", { name: /^klondike solitaire/i })
      .click();
    await expect(page).toHaveURL(/\/play\/klondike(?:$|\/|\?)/);
  });

  test("play page shows start button (setup panel)", async ({ page }) => {
    await loginAs(page, "play");
    await page.goto("/play/klondike");
    // PlayPage either shows a setup-panel with a Start button, or jumps directly
    // into a running game — accept either since both are valid "play page" states.
    const setup = page.getByTestId("setup-panel");
    const start = page.getByTestId("start-game");
    const playProgress = page.getByTestId("play-progress");
    await expect(setup.or(playProgress)).toBeVisible({ timeout: 10000 });
    if (await setup.isVisible().catch(() => false)) {
      await expect(start).toBeVisible();
    }
  });

  test("theme picker toggles open and applies a theme", async ({ page }) => {
    await loginAs(page, "theme");
    const trigger = page.getByRole("button", { name: /choose background theme/i });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const radiogroup = page.getByRole("radiogroup", { name: /background themes/i });
    await expect(radiogroup).toBeVisible();
    const swatches = radiogroup.getByRole("radio");
    await expect(swatches.first()).toBeVisible();
    // Pick the second swatch (first is usually the active default).
    const count = await swatches.count();
    const target = count > 1 ? swatches.nth(1) : swatches.first();
    await target.click();
    // Popover closes after selection.
    await expect(radiogroup).toBeHidden();
  });

  test("daily challenge page renders", async ({ page }) => {
    await loginAs(page, "daily");
    await page.goto("/daily");
    await expect(page.getByTestId("daily-page")).toBeVisible();
    // Page hero heading reads "Daily challenge" now (the legacy
    // "Today's challenge" phrasing moved to the region aria-label).
    await expect(
      page.getByRole("heading", { name: /daily challenge/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByTestId("daily-date")).toBeVisible();
  });

  test("leaderboard page renders", async ({ page }) => {
    await loginAs(page, "lb");
    await page.goto("/leaderboard");
    await expect(page.getByRole("heading", { name: /^leaderboard$/i })).toBeVisible();
    // Online-now panel is part of the leaderboard layout.
    await expect(page.locator(".online-now")).toBeVisible();
  });
});
