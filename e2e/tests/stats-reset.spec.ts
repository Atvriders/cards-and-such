import { expect, test, type Page } from "../fixtures";

/**
 * Stats reset → confirm → clear flow
 *
 * Verifies the StatsPage "Reset stats" footer button drives the shared
 * ConfirmDialog (`data-testid="confirm-yes"`) and that confirming the
 * dialog actually wipes the stats blob from `localStorage`. The current
 * stats reset confirm does not use `requireText`, but we type "DELETE"
 * defensively if the input shows up so the spec is resilient to a future
 * tightening of the confirmation contract.
 */

const STATS_STORAGE_KEY = "cards-and-such:stats:v1";

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `e2e_${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test("stats reset → confirm clears localStorage stats blob", async ({ page }) => {
  await loginAs(page, "strst");

  // Seed a stats blob so we can prove the reset path actually clears it
  // rather than passively asserting on an empty store.
  await page.addInitScript((key: string) => {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ games: { klondike: { plays: 3, wins: 1 } } }),
      );
    } catch {
      /* ignore — addInitScript runs before app code */
    }
  }, STATS_STORAGE_KEY);

  await page.goto("/stats", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("stats-page")).toBeVisible();

  // Sanity-check the seeded value made it into localStorage.
  const seeded = await page.evaluate(
    (key: string) => window.localStorage.getItem(key),
    STATS_STORAGE_KEY,
  );
  expect(seeded).not.toBeNull();

  // Open the confirm dialog from the stats footer.
  await page.getByTestId("stats-reset").click();
  await expect(page.getByTestId("confirm-dialog")).toBeVisible();

  // If a future iteration of the reset flow gates confirmation behind
  // typing "DELETE", honour it; otherwise this branch is a cheap no-op.
  const requireInput = page.getByTestId("confirm-input");
  if (await requireInput.count()) {
    await requireInput.fill("DELETE");
  }

  await page.getByTestId("confirm-yes").click();

  // Dialog dismisses on confirm.
  await expect(page.getByTestId("confirm-dialog")).toHaveCount(0);

  // The stats blob (and its sibling derived counters) should be gone.
  const cleared = await page.evaluate((key: string) => {
    return {
      stats: window.localStorage.getItem(key),
      hints: window.localStorage.getItem("cards-hints-used"),
      undos: window.localStorage.getItem("cards-undos-used"),
    };
  }, STATS_STORAGE_KEY);
  expect(cleared.stats).toBeNull();
  expect(cleared.hints).toBeNull();
  expect(cleared.undos).toBeNull();
});
