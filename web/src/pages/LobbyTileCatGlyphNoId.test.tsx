import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2439 — pin the ABSENCE of an `id` attribute on every LobbyPage
 * `.tile-cat-glyph` span (the decorative emoji/icon inside each
 * tile's `.tile-meta > .tile-cat` category chip).
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2061 / ~L3002 /
 * ~L3242 / ~L3390 / ~L3449) renders the glyph as:
 *
 *   <span className="tile-cat-glyph" aria-hidden="true">
 *     {CATEGORY_GLYPHS[g.category]}
 *   </span>
 *
 * The glyph is purely decorative: it is `aria-hidden` (W1461), has
 * no per-instance addressable identity, and is anchored externally
 * via its W1727 className. A future refactor that introduced e.g.
 * `id={\`tile-cat-glyph-${g.id}\`}` would silently:
 *   1. Create stable URL fragment targets (`/#tile-cat-glyph-foo`)
 *      that external links and bookmarks could come to depend on,
 *      making them an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on
 *      the page to point at decorative glyphs, defeating their
 *      `aria-hidden` semantics.
 *   3. Risk duplicate-id collisions across the grid — the same game
 *      can appear in multiple sections (recommended, all-games,
 *      family card spotlight) and jsdom plus browsers tolerate
 *      duplicate ids at render time, but `getElementById` and
 *      fragment scrolling break in unpredictable ways.
 *
 * Sibling pins on the glyph itself: className equality (W1727),
 * aria-hidden value (W1461 / LobbyTileCatGlyphAria), tag name
 * (LobbyTileCatGlyphTag), text content (LobbyTileCatGlyphText),
 * "first child" position (LobbyTileCatGlyphFirst), no inline style
 * (W2148 / LobbyTileCatGlyphNoStyle), no tabindex
 * (LobbyTileCatGlyphNoTabindex). NONE of them inspect the `id`
 * attribute — grepping `Lobby*.test.tsx` for tests that pin an
 * `id`-absence on the glyph specifically returns zero matches
 * (LobbyTileCatNoId pins it on the parent `.tile-cat` chip span).
 *
 * Co-located in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same rationale as W1727 / W2148 / W1705: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat-glyph has no id attribute (W2439)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-cat-glyph span without an id attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The search input is the canonical "lobby is ready" anchor used
    // by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    const glyph = document.querySelector<HTMLElement>(".tile-cat-glyph");
    expect(glyph).not.toBeNull();

    // Pin the ABSENCE of the `id` attribute. `hasAttribute("id")`
    // is the strictest check: it returns `true` even if an `id=""`
    // was emitted, so any id-introduction regression is caught.
    expect(glyph!.hasAttribute("id")).toBe(false);
  });
});
