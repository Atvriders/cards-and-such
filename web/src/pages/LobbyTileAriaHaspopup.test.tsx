import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2327 — pin that LobbyPage standalone tile anchors expose
 * `aria-haspopup="menu"` (exact value, lower-case) when rendered through
 * the real LobbyPage + react-router stack.
 *
 * The standalone tile is a router `<Link>` rendered at LobbyPage.tsx
 * ~L2970 with `aria-haspopup="menu"` (LobbyPage.tsx ~L2974). This
 * advertises to assistive tech that activating the tile (right-click,
 * long-press, or the keyboard equivalent) materializes a popover menu
 * — the W248 / W874 right-click context menu (`<LobbyTileMenu>` with
 * `role="menu"`).
 *
 * Why pin the EXACT string "menu" via `getAttribute`?
 *   - ARIA defines `aria-haspopup` as an enumerated token — valid values
 *     are "false", "true", "menu", "listbox", "tree", "grid", "dialog".
 *     "menu" is NOT a synonym for "true": "true" is treated as "menu" by
 *     most ATs but the spec discourages relying on that aliasing, and
 *     some screen readers announce the role differently. Pinning the
 *     literal "menu" prevents a regression that softens the value to
 *     "true" (which would still pass a presence-only check).
 *   - Case sensitivity: ARIA tokens are lower-case. JSX would happily
 *     emit `aria-haspopup="Menu"` if a refactor uppercased the constant;
 *     `getAttribute === "menu"` catches that.
 *   - The sibling family-card and overflow buttons advertise different
 *     popup roles (`"dialog"` at LobbyPage.tsx ~L3220/~L3375, `"true"`
 *     on the overflow at ~L2235). A regression that copy-pastes those
 *     onto the standalone tile would silently flip the AT contract.
 *
 * Existing-coverage audit (web/src/pages/Lobby*.test.tsx):
 *   - LobbyTileMenu.test.tsx ~L283 (W874) DOES assert
 *     `aria-haspopup="menu"` on a tile, BUT it does so on a hand-rolled
 *     `<a data-testid="tile-klondike" aria-haspopup="menu" ...>` fixture
 *     defined inline in that file (`TileWithMenu`, ~L248–L281). It does
 *     not exercise the real LobbyPage tree, so a regression in
 *     LobbyPage.tsx's tile JSX (e.g. removing the prop, retyping it as
 *     `aria-haspopup="true"`, or gating it behind a conditional that
 *     lazily attaches it on hover) would not be caught by W874 — the
 *     fixture would still pass on its own hard-coded markup.
 *   - LobbyFamilyHasPopup.test.tsx (W1275) pins `aria-haspopup="dialog"`
 *     on the FAMILY-card tile, not the standalone tile. Different
 *     surface, different value.
 *   - LobbyPage.test.tsx ~L570 pins `aria-haspopup="true"` on the
 *     `lobby-overflow` toolbar button — different element entirely.
 *   - LobbyTileMenuTriggerLabel and other Lobby* tests reference the
 *     "menu" string only in comments / cross-references, never asserting
 *     it on a real LobbyPage tile anchor.
 *
 * No existing test pins the production LobbyPage tile's
 * `aria-haspopup` to the exact value "menu", so this fills the gap.
 *
 * Lives in a NEW SIBLING file (matching the LobbyTileAnchorNoRole /
 * LobbyTileCtaAriaHiddenExact / etc. corpus convention) so it shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the LobbyPage.test.tsx mega-file.
 */
describe("LobbyPage — standalone tile anchor `aria-haspopup` exact value (W2327)", () => {
  it("renders standalone tile Links with aria-haspopup=\"menu\" (exact)", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for LobbyPage to mount — the search input is part of the
    // persistent header and resolves before any grid hydration, so by
    // the time this finds it the standalone tile anchors are populated.
    await screen.findByPlaceholderText(/search/i);

    // Standalone game-tile anchors only — `[data-testid^="tile-"]`
    // intentionally captures the standalone grid surface. Recommended
    // (`rec-tile-`) and featured (`feat-tile-`) flavors live in their
    // own surfaces and are out of scope for this pin.
    const nodes = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );

    let anchorsChecked = 0;
    for (const node of Array.from(nodes)) {
      // Only audit anchor renderings — `Link` becomes `<a>` in the DOM.
      // Skip non-anchor children sharing a `tile-*` testid prefix (e.g.
      // `tile-drag-handle-*`, `tile-tooltip-*`, `tile-rating-*`,
      // family-aggregate buttons, etc).
      if (node.tagName !== "A") continue;

      // Primary contract: exact lower-case "menu". Using direct
      // `getAttribute` (rather than `toHaveAttribute`) per the W2327
      // brief — the equality check is the load-bearing assertion and
      // makes the contract obvious in the source.
      expect(node.getAttribute("aria-haspopup")).toBe("menu");
      anchorsChecked += 1;
    }

    // Sanity: ensure the suite actually inspected at least one anchor —
    // guards against a regression that renames the testid prefix and
    // silently zeroes the loop above. The standalone grid is always
    // populated with the full registry under default lobby state.
    expect(anchorsChecked).toBeGreaterThan(0);
  });
});
