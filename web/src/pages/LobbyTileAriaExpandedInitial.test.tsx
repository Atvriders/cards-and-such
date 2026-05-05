import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2328 — pin that LobbyPage standalone tile anchors render with
 * `aria-expanded="false"` on initial mount. The tile `<Link>` is the
 * trigger for the per-tile context menu (it carries `aria-haspopup="menu"`
 * — see LobbyPage.tsx ~L2974) and its `aria-expanded` is bound to
 * `menuPos !== null` (LobbyPage.tsx ~L2975). On a fresh mount the per-tile
 * `menuPos` state is `null`, so React must serialize `aria-expanded` to
 * the literal string `"false"` in the DOM.
 *
 * The string value matters: JSX boolean → attribute serialization differs
 * for `aria-*` versus regular HTML boolean attributes. For an `aria-*`
 * prop, `aria-expanded={false}` is emitted as the string `"false"` (not
 * removed from the DOM, the way `disabled={false}` is). A regression that
 * accidentally swapped the binding to `aria-expanded={menuPos !== null ?
 * true : undefined}` (or any path that omits the attribute when closed)
 * would break the AT contract: screen readers announce a collapsed-menu
 * trigger as "collapsed" only when `aria-expanded="false"` is explicitly
 * present. An absent attribute is treated as "this trigger does not
 * advertise expand/collapse state at all" and the user loses the cue
 * that right-clicking will open something.
 *
 * Existing-coverage audit (web/src/pages/Lobby*.test.tsx):
 *   - LobbyTileMenu.test.tsx ~L332 ("tile aria-expanded toggles as the
 *     menu opens and closes") DOES assert `aria-expanded="false"` then
 *     `"true"` then `"false"` — but it renders a fixture component
 *     (`<TileWithMenu />` defined inline at ~L248) wired to a local
 *     `useState`, NOT the real LobbyPage. That fixture pins the menu
 *     state-machine contract; it does not pin that the actual LobbyPage
 *     tile `<Link>` mounts with `aria-expanded="false"` rendered into
 *     the DOM. A regression in LobbyPage's binding would not flip that
 *     fixture-driven test.
 *   - LobbyTileMenuTriggerLabel.test.tsx references the W874/W1267
 *     contract for `aria-haspopup`/`aria-expanded` toggling but again
 *     does not pin the LobbyPage initial-render value.
 *   - LobbyPage.test.tsx asserts `aria-expanded` on the drawer toggle
 *     (~L460–L473) and on the chip-strip overflow button (~L571, L583),
 *     never on a `tile-${gameId}` anchor.
 *   - The other Lobby*.test.tsx files (LobbyDrawerToggleLabel, Lobby-
 *     DrawerOuterClass, LobbyDrawerToggleNoTabindex, LobbyDrawerToggle-
 *     Class, LobbyTileFeaturedClass) reference `aria-expanded` only in
 *     prose comments or for non-tile elements.
 *
 * No existing test asserts the LobbyPage tile anchor's initial
 * `aria-expanded` value via a real LobbyPage render — pinning it here.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the rest of the `Lobby*.test.tsx` corpus: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — tile anchor initial aria-expanded value (W2328)", () => {
  it("renders standalone tile Links with aria-expanded=\"false\" on initial mount", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby chrome to mount before querying tiles. The
    // search input is part of the persistent header and resolves
    // synchronously with the first render pass.
    await screen.findByPlaceholderText(/search/i);

    // Standalone game-tile anchors only — `[data-testid^="tile-"]`
    // intentionally captures the standalone grid surface. The same
    // testid prefix is shared by family-aggregate tiles (rendered as
    // `<button>` per LobbyPage.tsx ~L3370) and a few sub-elements
    // (`tile-rating-*`, `tile-fav-marker-*`, `tile-drag-handle-*`,
    // `tile-tooltip-*`); the loop below filters to just the anchor
    // renderings — `Link` becomes an `<a>` in the DOM, and the standalone
    // tile `<Link>` (LobbyPage.tsx ~L2970) is the only `<a>` with a
    // `tile-${gameId}` testid.
    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );

    let anchorChecked = 0;
    for (const node of Array.from(nodes)) {
      if (node.tagName !== "A") continue;
      // Primary contract: the attribute must be present and serialized
      // to the literal string "false" (NOT absent, NOT empty, NOT
      // "true"). `getAttribute` returns `null` if the attribute is
      // missing entirely, so a strict `=== "false"` check catches both
      // the regression where the binding is dropped and the regression
      // where it's flipped.
      expect(node.getAttribute("aria-expanded")).toBe("false");
      anchorChecked += 1;
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above. The standalone grid is always
    // populated under default lobby state, so this floor is robust.
    expect(anchorChecked).toBeGreaterThan(0);
  });
});
