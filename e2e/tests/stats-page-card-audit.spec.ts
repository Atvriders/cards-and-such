import { expect, test, type Page } from "@playwright/test";

/**
 * W568 — Stats page card audit smoke.
 *
 * Visits `/stats` after a fresh login and asserts that every major card on
 * the page (charts + roll-ups) is mounted in the DOM via its stable
 * `data-testid`. This is a regression net for accidental removal /
 * conditional-rendering breakage of high-signal Stats cards — we don't
 * assert content, only presence.
 *
 * Cards covered:
 *   - stats-bar-chart           (plays per category)
 *   - stats-line-chart          (activity over time)
 *   - stats-pie-chart           (time per game, top 5)
 *   - stats-cat-heatmap         (category × dow, last 30d)
 *   - stats-this-week           (weekly roll-up card)
 *   - stats-personal-records    (PR card)
 *   - stats-most-hinted         (most-hinted leaderboard card)
 *
 * Some cards (line/pie) gate themselves behind "enough data" thresholds in
 * the source today, but in practice every testid above is rendered
 * unconditionally on a fresh visit. If that ever changes the failure here
 * is the desired signal — a missing major card is a regression worth
 * surfacing rather than papering over.
 */

const CARD_TESTIDS = [
  "stats-bar-chart",
  "stats-line-chart",
  "stats-pie-chart",
  "stats-cat-heatmap",
  "stats-this-week",
  "stats-personal-records",
  "stats-most-hinted",
] as const;

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `e2e_${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test("stats page renders all major card testids", async ({ page }) => {
  await loginAs(page, "stats_audit");

  await page.goto("/stats", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("stats-page")).toBeVisible();

  for (const id of CARD_TESTIDS) {
    await expect(page.getByTestId(id), `expected ${id} to be present`).toBeVisible();
  }
});
