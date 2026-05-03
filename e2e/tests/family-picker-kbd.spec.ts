import { expect, test, type Page } from "@playwright/test";

/**
 * E2E coverage for the lobby family-picker keyboard nav (W362).
 *
 * Scenario: a power user right-clicks a known family tile (klondike),
 * cycles through the variants list with the arrow keys, and presses
 * Enter to select the focused variant. The selection must navigate to
 * `/play/<variantId>`.
 *
 * The `klondike` family is used because its membership is large and
 * stable (see web/src/games/families.ts) and it's the same fixture
 * exercised by tile-menu.spec.ts and lobby-flows.spec.ts. Variant
 * testids follow the `pick-<gameId>` pattern emitted by FamilyPicker.
 */

async function loginAs(page: Page, prefix: string): Promise<void> {
  const username = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();
  await expect(page).toHaveURL("/");
}

test.describe("lobby family-picker keyboard nav (W362)", () => {
  test("right-click klondike family tile, arrow keys cycle variants, Enter selects", async ({
    page,
  }) => {
    await loginAs(page, "fampicker_kbd");

    // Right-click the klondike family tile to open the picker. The
    // klondike id is a family (FAMILIES[0] in web/src/games/families.ts)
    // and the family tile reuses its slug, so `tile-klondike` is the
    // stable selector.
    const tile = page.getByTestId("tile-klondike");
    await expect(tile).toBeVisible();
    await tile.click({ button: "right" });

    // The FamilyPicker mounts as a dialog with a `fam-picker-<id>`
    // testid (see LobbyPage.tsx:3586).
    const picker = page.getByTestId("fam-picker-klondike");
    await expect(picker).toBeVisible();

    // The picker auto-focuses the first variant on open. Variant rows
    // render with `data-testid="pick-<gameId>"`; `klondike` itself is
    // the canonical first member.
    const firstVariant = page.getByTestId("pick-klondike");
    await expect(firstVariant).toBeFocused();

    // ArrowDown cycles to the next variant. The default sort is
    // alphabetical, so `klondike-by-threes` follows `klondike` per the
    // memberIds order in families.ts.
    await page.keyboard.press("ArrowDown");
    const secondVariant = page.getByTestId("pick-klondike-by-threes");
    await expect(secondVariant).toBeFocused();

    // ArrowDown a second time advances another step — confirms cycling
    // is not a one-shot.
    await page.keyboard.press("ArrowDown");
    const thirdVariant = page.getByTestId("pick-klondike-deal-one");
    await expect(thirdVariant).toBeFocused();

    // ArrowUp walks back to the previous variant (cycle is bidirectional).
    await page.keyboard.press("ArrowUp");
    await expect(secondVariant).toBeFocused();

    // Enter activates the focused variant — should navigate to its
    // /play/<id> route and dismiss the picker.
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/play\/klondike-by-threes(?:[/?#].*)?$/);
    await expect(page.getByTestId("fam-picker-klondike")).toHaveCount(0);
  });
});
