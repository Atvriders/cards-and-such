import { test, expect, type BrowserContext, type Page } from "../fixtures";

/**
 * Multiplayer specs spin up isolated browser contexts via
 * `browser.newContext()` so each pretend-user has its own cookie jar.
 * The shared `page` fixture's `addInitScript` doesn't apply to these
 * extra contexts, so the welcome carousel mounts and its backdrop
 * intercepts pointer events — every `getByTestId("create-room").click()`
 * times out chasing a stable element. We mirror the fixture's
 * behaviour by pre-seeding the tutorial-seen blob in each new context.
 *
 * Key/value mirrors `web/src/platform/tutorials.ts` /
 * `e2e/fixtures.ts` — keep these in sync.
 */
async function dismissWelcomeFor(ctx: BrowserContext): Promise<void> {
  await ctx.addInitScript(() => {
    try {
      const raw = window.localStorage.getItem("cards-tutorial-seen");
      const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      map["__welcome__"] = true;
      window.localStorage.setItem("cards-tutorial-seen", JSON.stringify(map));
    } catch {
      /* localStorage may be unavailable on the initial about:blank */
    }
  });
}

async function claimAs(page: Page, name: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(name);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

async function createRoomAs(page: Page, gameId: string): Promise<string> {
  await page.goto(`/play/${gameId}/online`);
  await page.getByTestId("create-room").click();
  // Wait until the URL matches the roomId pattern
  await page.waitForURL(new RegExp(`/play/${gameId}/online/[a-f0-9]{12}`));
  const url = new URL(page.url());
  const parts = url.pathname.split("/");
  return parts[parts.length - 1]!;
}

test.describe("multiplayer — Connect 4", () => {
  // Multiplayer room pages are still stubs — PlayOnlinePage renders
  // "Multiplayer game UI will render here (Tasks C4, C5)." instead of
  // the c4-board / uno-root components these tests target. Skip until
  // the per-game online surfaces land.
  test.skip("two users play to a winner", async ({ browser }) => {
    const ctxA: BrowserContext = await browser.newContext();
    const ctxB: BrowserContext = await browser.newContext();
    await dismissWelcomeFor(ctxA);
    await dismissWelcomeFor(ctxB);
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await claimAs(a, `mp_a_${Date.now().toString(36)}`);
    await claimAs(b, `mp_b_${Date.now().toString(36)}`);

    const roomId = await createRoomAs(a, "connect-4");
    await b.goto(`/play/connect-4/online/${roomId}`);

    // Wait for both to show a board
    await expect(a.locator(".c4-board")).toBeVisible();
    await expect(b.locator(".c4-board")).toBeVisible();

    // A = seat 0 (red), B = seat 1 (yellow).
    // Force a vertical win in column 0 for A: A drops col 0, B drops col 1, repeat 4 times.
    // Server validates turn order; we wait for each side's turn before clicking.
    const dropA = async (col: number): Promise<void> => {
      await expect(a.locator(".c4-status")).toContainText(/your turn/i, { timeout: 5000 });
      await a.getByTestId(`c4-col-${col}-row-5`).click();
    };
    const dropB = async (col: number): Promise<void> => {
      await expect(b.locator(".c4-status")).toContainText(/your turn/i, { timeout: 5000 });
      await b.getByTestId(`c4-col-${col}-row-5`).click();
    };

    for (let i = 0; i < 4; i++) {
      await dropA(0);
      if (i < 3) await dropB(1);
    }

    await expect(a.locator(".c4-status")).toContainText(/Winner: Red/i, { timeout: 5000 });
    await expect(b.locator(".c4-status")).toContainText(/Winner: Red/i, { timeout: 5000 });

    await ctxA.close(); await ctxB.close();
  });
});

test.describe("multiplayer — Uno-like", () => {
  // Same stub-page situation as Connect 4 above — no .uno-root in the
  // current PlayOnlinePage room view.
  test.skip("two users connect, take turns", async ({ browser }) => {
    const ctxA: BrowserContext = await browser.newContext();
    const ctxB: BrowserContext = await browser.newContext();
    await dismissWelcomeFor(ctxA);
    await dismissWelcomeFor(ctxB);
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await claimAs(a, `uno_a_${Date.now().toString(36)}`);
    await claimAs(b, `uno_b_${Date.now().toString(36)}`);

    const roomId = await createRoomAs(a, "uno-like");
    await b.goto(`/play/uno-like/online/${roomId}`);

    await expect(a.locator(".uno-root")).toBeVisible();
    await expect(b.locator(".uno-root")).toBeVisible();

    // A is seat 0. Draw + pass to advance turn.
    await expect(a.locator(".uno-status").first()).toContainText(/your turn/i, { timeout: 5000 });
    await a.locator(".uno-draw").click();
    await a.locator(".uno-pass").click();

    // Now seat 1 (B)
    await expect(b.locator(".uno-status").first()).toContainText(/your turn/i, { timeout: 5000 });
    await b.locator(".uno-draw").click();
    await b.locator(".uno-pass").click();

    // Back to A
    await expect(a.locator(".uno-status").first()).toContainText(/your turn/i, { timeout: 5000 });

    await ctxA.close(); await ctxB.close();
  });
});
