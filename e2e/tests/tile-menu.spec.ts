import { expect, test, type Page } from "../fixtures";

/**
 * E2E coverage for the lobby tile context menu (W248 / W250 / W255).
 *
 * The menu is rendered by web/src/pages/LobbyTileMenu.tsx and opens via
 * a native `contextmenu` (right-click) on any lobby tile. It exposes the
 * following testids:
 *   - `tile-menu`         (root, role=menu)
 *   - `tile-menu-play`    (item 0, also activated by Enter on open)
 *   - `tile-menu-copy`    (item 1)
 *   - `tile-menu-fav`     (item 2 — toggles favorite)
 *   - `tile-menu-friend`  (item 3)
 *
 * We use the `2048` tile because it is a *standalone* game (not absorbed
 * into a family) and therefore renders as a regular GameCard `<Link>`
 * with the `onTileContextMenu` handler attached. Klondike is now a
 * featured family tile and right-click on family tiles is a no-op (no
 * onContextMenu wired up — see LobbyPage.tsx FeaturedTile/FamilyCard).
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("lobby tile context menu", () => {
  // `2048` is a standalone game (not absorbed into a family); the regular
  // GameCard wires up `onContextMenu={onTileContextMenu}` so right-click
  // opens the LobbyTileMenu portal.
  const TILE_ID = "2048";

  test("right-click on 2048 tile opens tile-menu", async ({ page }) => {
    await loginAs(page, "tilemenu_open");
    const tile = page.getByTestId(`tile-${TILE_ID}`);
    await expect(tile).toBeVisible();
    // Native contextmenu — same code path the production right-click hits.
    await tile.click({ button: "right" });
    await expect(page.getByTestId("tile-menu")).toBeVisible();
    // All four documented items should render.
    await expect(page.getByTestId("tile-menu-play")).toBeVisible();
    await expect(page.getByTestId("tile-menu-copy")).toBeVisible();
    await expect(page.getByTestId("tile-menu-fav")).toBeVisible();
    await expect(page.getByTestId("tile-menu-friend")).toBeVisible();
  });

  test("clicking tile-menu-fav bumps the favorites chip count", async ({ page }) => {
    await loginAs(page, "tilemenu_fav");
    // Fresh user: chip-favorites should report 0. The Chip component
    // renders the count concatenated with the label (e.g. "♥Favorites0")
    // — match the trailing "0" without a word-boundary requirement.
    const favChip = page.getByTestId("chip-favorites");
    await expect(favChip).toContainText(/0$/);

    const tile = page.getByTestId(`tile-${TILE_ID}`);
    await tile.click({ button: "right" });
    await expect(page.getByTestId("tile-menu")).toBeVisible();

    // The tile-menu is portal-free (`position: fixed` inside the tile
    // wrapper) so adjacent tiles in the grid can overlap the menu's
    // hit region. Activate via keyboard — that's the same code path the
    // ArrowDown+Enter test exercises, and bypasses pointer-event
    // interception from neighbouring tiles.
    await page.getByTestId("tile-menu-play").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("tile-menu-fav")).toBeFocused();
    await page.keyboard.press("Enter");
    // The menu closes itself on activation per LobbyTileMenu.run().
    await expect(page.getByTestId("tile-menu")).toHaveCount(0);

    // Heart on the tile flips to pressed.
    await expect(page.getByTestId(`tile-fav-toggle-${TILE_ID}`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // And the chip count bumps to 1.
    await expect(favChip).toContainText(/1$/);

    // Cleanup so re-runs start from a clean slate.
    await page.getByTestId(`tile-fav-toggle-${TILE_ID}`).click();
    await expect(favChip).toContainText(/0$/);
  });

  test("ArrowDown then Enter activates the second item (Copy link)", async ({ page }) => {
    await loginAs(page, "tilemenu_kbd");
    const tile = page.getByTestId(`tile-${TILE_ID}`);
    await tile.click({ button: "right" });

    const menu = page.getByTestId("tile-menu");
    await expect(menu).toBeVisible();
    // First item is auto-focused on open.
    await expect(page.getByTestId("tile-menu-play")).toBeFocused();

    // Grant clipboard permissions so the Copy-link path doesn't reject.
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("tile-menu-copy")).toBeFocused();
    await page.keyboard.press("Enter");

    // Activating any item closes the menu (LobbyTileMenu.run -> onClose).
    await expect(menu).toHaveCount(0);
    // We stay on the lobby (Copy link doesn't navigate).
    await expect(page).toHaveURL("/");
    // And we should still be on the lobby grid (tile still mounted).
    await expect(page.getByTestId(`tile-${TILE_ID}`)).toBeVisible();
  });

  test("Escape closes the menu without selecting", async ({ page }) => {
    await loginAs(page, "tilemenu_esc");
    const tile = page.getByTestId(`tile-${TILE_ID}`);
    await tile.click({ button: "right" });

    const menu = page.getByTestId("tile-menu");
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    // No navigation should have occurred.
    await expect(page).toHaveURL("/");
    // Heart shouldn't have flipped — Escape is non-destructive.
    await expect(page.getByTestId(`tile-fav-toggle-${TILE_ID}`)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
