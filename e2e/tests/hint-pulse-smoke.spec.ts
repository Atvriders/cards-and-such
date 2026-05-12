import { expect, test, type Page } from "../fixtures";

/**
 * Hint-pulse smoke across 5 random games.
 *
 * For each gameId we:
 *   1. log in fresh (so the welcome tutorial / coachmark side-effects from
 *      sibling specs do not leak in),
 *   2. navigate to /play/<gameId>,
 *   3. dismiss the setup-panel if it is showing,
 *   4. click `play-hint-btn`,
 *   5. assert that *something* on the page picks up the `.hint-pulse` class
 *      within 1s.
 *
 * The hint button only renders when `phase === "playing"` AND the user has
 * hints enabled in Settings → Gameplay. Hints are on by default for fresh
 * accounts, but if for any reason the button is missing (settings off,
 * setup-panel still mounted, etc.) we log a skip-style message and continue
 * rather than failing the whole spec — per the task brief.
 */

const GAMES = ["klondike", "freecell", "texas-holdem", "yahtzee", "wordle-mini"] as const;

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  // The claim POST is async and the lobby route mount can lag under
  // load; bump the implicit 5s timeout to 15s so concurrent specs in
  // the same worker don't flake on a slow claim response.
  await expect(page).toHaveURL("/", { timeout: 15_000 });
}

async function enterPlay(page: Page, gameId: string): Promise<void> {
  // Pre-mark this game's per-game tutorial as seen so the tutorial overlay
  // (a modal SVG backdrop) doesn't intercept pointer events on the play
  // toolbar. The shared `fixtures.ts` only pre-dismisses the welcome
  // carousel; per-game tutorials use the same SeenMap keyed by `plugin.id`.
  await page.addInitScript((id: string) => {
    try {
      const raw = window.localStorage.getItem("cards-tutorial-seen");
      const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      map[id] = true;
      window.localStorage.setItem("cards-tutorial-seen", JSON.stringify(map));
    } catch {
      /* ignore */
    }
  }, gameId);
  await page.goto(`/play/${gameId}`, { waitUntil: "domcontentloaded" });
  // PlayPage may render the setup-panel or jump straight to play depending
  // on stored prefs. If setup is showing, click Start to enter "playing".
  const setup = page.getByTestId("setup-panel");
  if (await setup.isVisible().catch(() => false)) {
    await page.getByTestId("start-game").click();
  }
}

test.describe("hint pulse smoke across 5 games", () => {
  for (const gameId of GAMES) {
    test(`${gameId}: clicking play-hint-btn adds .hint-pulse within 1s`, async ({ page }) => {
      // Use a short prefix (game id's first 8 chars) — the full
      // `hp_<full-id>_<rand>` form overflows the 20-char username cap
      // for longer ids like `texas-holdem` (21 chars total).
      await loginAs(page, gameId.replace(/[^a-z0-9]+/g, "").slice(0, 8));
      await enterPlay(page, gameId);

      const hintBtn = page.getByTestId("play-hint-btn");

      // If the hint button never becomes visible (settings off, phase not
      // "playing", plugin missing, etc.) we log + skip rather than fail.
      const visible = await hintBtn
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true)
        .catch(() => false);

      if (!visible) {
        // eslint-disable-next-line no-console
        console.log(`[hint-pulse-smoke] ${gameId}: play-hint-btn not visible — skipping`);
        test.skip(true, `play-hint-btn not visible for ${gameId}`);
        return;
      }

      await expect(hintBtn).toBeEnabled();
      await hintBtn.click();

      // The hint plugin targets a selector inside the game root; whichever
      // node it picked, *something* on the page should now carry the
      // `hint-pulse` class. Class is removed ~1.5s later, so we poll on a
      // tight 1s budget per the task brief.
      await expect
        .poll(async () => page.locator(".hint-pulse").count(), { timeout: 1_000 })
        .toBeGreaterThanOrEqual(1);
    });
  }
});
