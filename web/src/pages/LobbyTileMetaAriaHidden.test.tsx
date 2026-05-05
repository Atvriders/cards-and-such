import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2209 — pin the ABSENCE of an `aria-hidden` attribute on the solo-card
 * `.tile-meta` wrapper.
 *
 * The lobby's per-tile `<div className="tile-meta">` row (LobbyPage.tsx
 * ~L2059, ~L3000, ~L3093, ~L3240, ~L3388, ~L3447) is a presentational
 * flex container holding the category chip + optional multiplayer badge.
 * Although the chip's INNER glyph (`<span class="tile-cat-glyph">`) is
 * intentionally `aria-hidden="true"` (pinned by W1461 /
 * LobbyTileCatGlyphAria.test.tsx), the outer `.tile-meta` wrapper itself
 * MUST NOT carry `aria-hidden` — doing so would prune the visible
 * "Cards"/"Dice"/etc. category label from the accessibility tree, since
 * `aria-hidden` on a parent removes the entire subtree.
 *
 * Existing sibling tests cover:
 *   - W1670 (LobbyTileMetaTag): tagName "DIV" + exact className "tile-meta"
 *   - W2073 (LobbyTileMetaNoId): no `id` attribute
 *   - W2160 (LobbyTileMetaNoStyle): no inline `style` attribute
 *   - W2201 (LobbyTileCatAriaHidden): no `aria-hidden` on the INNER
 *     `.tile-cat` chip span
 *
 * What none of those cover is the ABSENCE of `aria-hidden` on the
 * `.tile-meta` wrapper DIV itself. Greppimg `web/src/pages/Lobby*.test.tsx`
 * for `tile-meta` + `aria-hidden` co-occurrences confirms only the
 * inner-element pins exist.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W1461 /
 * W1389 / W1373 / W1670 / W2073 / W2160 / W2201 splits: shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-meta wrapper has no aria-hidden attribute (W2209)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile's `.tile-meta` wrapper without an `aria-hidden` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — search input is the canonical
    // "lobby is ready" anchor shared by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate one real solo-card tile root (matches `tile-<digits>`,
    // skipping nested chrome like `tile-rating-*` / `tile-eta-*`).
    const tiles = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-"]',
    );
    let target: HTMLElement | null = null;
    for (const tile of Array.from(tiles)) {
      const testid = tile.getAttribute("data-testid") ?? "";
      if (/^tile-\d+$/.test(testid)) {
        target = tile;
        break;
      }
    }
    expect(target, "no real solo-card tile rendered").not.toBeNull();

    const meta = target!.querySelector<HTMLElement>(":scope > .tile-meta");
    expect(meta, "tile missing direct .tile-meta child").not.toBeNull();

    // Core assertion: the wrapper carries no `aria-hidden` attribute.
    // Using `hasAttribute` (rather than checking the boolean property)
    // catches both the missing-attr and explicit-empty-string /
    // `aria-hidden="false"` cases while still failing if any value is
    // added. Any regression that surfaces `aria-hidden` here would prune
    // the visible category label from the a11y tree.
    expect(meta!.hasAttribute("aria-hidden")).toBe(false);
  });
});
