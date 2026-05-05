import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1757 — pin the `tagName === "SPAN"` of every solo-card / family-card
 * tile's `.tile-cat` category-chip parent span (the OUTER span that
 * wraps the decorative `.tile-cat-glyph` icon and the visible
 * CATEGORY_LABELS[...] text).
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2060 / ~L3001 /
 * ~L3241 / ~L3389 / ~L3448) renders the category chip as:
 *
 *   <div className="tile-meta">
 *     <span className="tile-cat tile-cat-<tag>">
 *       <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *       {CATEGORY_LABELS[g.category]}
 *     </span>
 *     ...
 *   </div>
 *
 * The chip's INLINE-flow `<span>` tag matters because the surrounding
 * `.tile-meta` is a flex row of inline chips — promoting the parent to
 * a block element (`<div>`, `<p>`, `<section>`) would force a line
 * break before the chip on every tile, drop the chip out of the
 * inline flex baseline, and silently regress the row layout.
 *
 * Sibling W1741 (LobbyTileCatClassEq) pins the parent's exact
 * `className` string and W1727 (LobbyTileCatGlyphClassEq) pins the
 * INNER glyph child's className — both walk through the parent via
 * `glyph.parentElement` / `:scope > .tile-meta > .tile-cat` but
 * NEITHER asserts the parent's `tagName`. A regression that swapped
 * the chip to `<div className="tile-cat tile-cat-s">…</div>` would
 * pass both sibling tests (className still matches, inner glyph still
 * resolves) but break the inline flex layout of `.tile-meta`.
 *
 * Sibling tile-meta wrapper test (LobbyTileMetaTag) pins the OUTER
 * `.tile-meta` div's tag — not this inner chip span. Grepping
 * `Lobby*.test.tsx` for `tile-cat` `tagName` / `nodeName` returns
 * zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1741 / W1727 / W1461: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-cat parent span tagName (W1757)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat parent as a <span> element", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every tile-cat parent span via the inner glyph child so
    // we walk UP from a node already pinned by W1727, guaranteeing we
    // only inspect actual category-chip parents (not unrelated future
    // siblings that happen to share the `tile-cat` substring like
    // `tile-cat-glyph`).
    const glyphs = document.querySelectorAll<HTMLElement>(
      ".tile-cat-glyph",
    );
    expect(glyphs.length).toBeGreaterThan(0);

    let checked = 0;
    for (const glyph of Array.from(glyphs)) {
      const parent = glyph.parentElement;
      expect(parent, "tile-cat-glyph must have a parent element").not.toBeNull();
      if (!parent) continue;

      // Pin the EXACT tagName — `<span>` keeps the chip in the inline
      // flex flow of `.tile-meta`. Any block-level promotion (DIV, P,
      // SECTION, ARTICLE) would silently break the row layout while
      // leaving sibling className / aria assertions intact.
      expect(parent.tagName).toBe("SPAN");
      checked += 1;
    }

    // Sanity: at least one real chip parent was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
