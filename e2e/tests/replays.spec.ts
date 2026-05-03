import { expect, test, type Page } from "@playwright/test";

/**
 * /replays smoke spec.
 *
 * Covers three flows:
 *   1. Empty state — fresh login + nav to /replays shows the empty copy.
 *   2. Footer link — from the lobby, the footer "Replays" link routes to
 *      /replays and renders the page shell.
 *   3. Seeded list — write a `cards-replays` entry via page.evaluate, reload,
 *      verify a row renders and its Play link points at /play/<gameId>?seed=…
 */

const REPLAYS_KEY = "cards-replays";

interface SeededReplay {
  id: string;
  gameId: string;
  seed: number;
  actions: unknown[];
  savedAt: number;
}

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("/replays smoke", () => {
  test("shows the empty state when no replays are saved", async ({ page }) => {
    await loginAs(page, "rep_empty");

    // Make sure no stale entry leaks in from a sibling spec sharing storage.
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, REPLAYS_KEY);

    await page.goto("/replays", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("replays-page")).toBeVisible();
    await expect(page.getByTestId("replays-empty")).toBeVisible();
    await expect(page.getByTestId("replay-row-0")).toHaveCount(0);
  });

  test("footer Replays link navigates to /replays", async ({ page }) => {
    await loginAs(page, "rep_footer");

    const link = page.getByTestId("footer-replays-link");
    await link.scrollIntoViewIfNeeded();
    await link.click();

    await expect(page).toHaveURL(/\/replays$/);
    await expect(page.getByTestId("replays-page")).toBeVisible();
  });

  test("renders rows from seeded cards-replays and Play link targets /play/<gameId>?seed=…", async ({
    page,
  }) => {
    await loginAs(page, "rep_seed");

    // Land on /replays first so localStorage is bound to the app origin,
    // then seed and reload to pick the new state up via loadReplays().
    await page.goto("/replays", { waitUntil: "domcontentloaded" });

    const seeded: SeededReplay[] = [
      {
        id: "rep-seed-1",
        gameId: "klondike",
        seed: 12345,
        actions: [],
        savedAt: Date.UTC(2024, 0, 1, 12, 0),
      },
    ];

    await page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      { key: REPLAYS_KEY, value: seeded },
    );

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("replays-page")).toBeVisible();
    await expect(page.getByTestId("replays-empty")).toHaveCount(0);

    const row = page.getByTestId("replay-row-0");
    await expect(row).toBeVisible();

    const playLink = page.getByTestId("replay-play-btn-0");
    await expect(playLink).toBeVisible();
    await expect(playLink).toHaveAttribute(
      "href",
      "/play/klondike?seed=12345",
    );

    await playLink.click();
    await expect(page).toHaveURL(/\/play\/klondike\?seed=12345$/);
  });
});
