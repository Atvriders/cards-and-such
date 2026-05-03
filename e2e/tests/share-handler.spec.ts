import { expect, test, type Page } from "@playwright/test";

/**
 * Smoke coverage for the Web-Share-Target landing page mounted at
 * /share-handler (see web/src/pages/ShareHandlerPage.tsx).
 *
 *   - Valid friend code in `?text=` redirects to `/play/<id>?seed=<seed>&friend=1`
 *     and, after the user clicks "Start playing", the play-friend-banner is
 *     surfaced for multiplayer games.
 *   - Unrecognised text falls through to the fallback view, which mounts
 *     `share-handler-page` and echoes the shared text back to the user.
 *
 * The 6-character friend code format is documented in
 * web/src/platform/friendCode.ts. To keep this spec self-contained we
 * mirror the encoder here rather than importing from the web workspace
 * (Playwright resolves `.ts` directly, but cross-package `.js`-suffixed
 * ESM imports get hairy under the workspace setup).
 */

/** Crockford-ish base32 alphabet (matches friendCode.ts ALPHABET). */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 4-bit XOR-nibble checksum over the lower 24 bits of `payload`. */
function nibbleChecksum(payload: number): number {
  let c = 0;
  let p = payload >>> 0;
  for (let i = 0; i < 6; i++) {
    c ^= p & 0xf;
    p >>>= 4;
  }
  return c & 0xf;
}

/**
 * Encode a {gameDictionaryIndex, seed} pair into a 6-character friend
 * code. `idx` is the game's slot in `web/src/games/registry.ts`'s GAMES
 * array; if that ordering ever changes this spec must be updated to
 * keep landing on a multiplayer game (banner only renders when
 * `plugin.players.multiplayer === true`).
 */
function encodeChallenge(idx: number, seed: number): string {
  const payload = ((idx & 0xff) << 16) | (seed & 0xffff);
  const checksum = nibbleChecksum(payload);
  const packed = payload * 64 + (checksum << 2);
  let out = "";
  for (let shift = 25; shift >= 0; shift -= 5) {
    out += ALPHABET[(packed >>> shift) & 0x1f] as string;
  }
  return out;
}

/**
 * connect-4 sits at slot 61 in the GAMES registry and is one of the few
 * plugins flagged `players.multiplayer: true`, which is the gate the
 * play-friend-banner uses to render. Seed 12345 is arbitrary but stable.
 */
const CONNECT_4_INDEX = 61;
const FRIEND_SEED = 12345;
const VALID_FRIEND_CODE = encodeChallenge(CONNECT_4_INDEX, FRIEND_SEED);

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("share-handler smoke", () => {
  test("valid friend code in ?text= redirects to /play with friend banner", async ({ page }) => {
    await loginAs(page, "share_ok");

    await page.goto(
      `/share-handler?text=${encodeURIComponent(VALID_FRIEND_CODE)}`,
      { waitUntil: "domcontentloaded" },
    );

    // ShareHandlerPage useEffect calls navigate() with `replace: true`,
    // so the URL bar should swap to the play route on next paint.
    await expect(page).toHaveURL(
      new RegExp(`/play/connect-4\\?seed=${FRIEND_SEED}&friend=1$`),
      { timeout: 5_000 },
    );

    // PlayPage opens in setup phase by default; the banner is gated on
    // `phase === "playing"`, so click Start to advance the lifecycle.
    const setup = page.getByTestId("setup-panel");
    if (await setup.isVisible().catch(() => false)) {
      await page.getByTestId("start-game").click();
    }

    await expect(page.getByTestId("play-friend-banner")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("unrecognised text renders the fallback share view", async ({ page }) => {
    await loginAs(page, "share_bad");

    const note = "just some random note that is not a friend code";
    await page.goto(
      `/share-handler?text=${encodeURIComponent(note)}`,
      { waitUntil: "domcontentloaded" },
    );

    // No redirect — we should still be on /share-handler.
    await expect(page).toHaveURL(/\/share-handler(\?|$)/);
    await expect(page.getByTestId("share-handler-page")).toBeVisible();
    await expect(page.getByTestId("share-handler-text")).toHaveText(note);
  });
});
