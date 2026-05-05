import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1767 — pin the `tagName === "SPAN"` of every solo-card / family-card
 * tile's `.tile-cat-glyph` decorative category-icon element (the INNER
 * span inside the `.tile-meta > .tile-cat` chip that wraps the
 * decorative emoji/icon).
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2061 / ~L3002 /
 * ~L3242 / ~L3390 / ~L3449) renders the category chip as:
 *
 *   <div className="tile-meta">
 *     <span className="tile-cat tile-cat-<tag>">
 *       <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *       {CATEGORY_LABELS[g.category]}
 *     </span>
 *     ...
 *   </div>
 *
 * The glyph's INLINE-flow `<span>` tag matters because it sits as a
 * mid-text inline child of the surrounding `.tile-cat` span, directly
 * adjacent to the visible CATEGORY_LABELS[...] text node. Promoting it
 * to a block element (`<div>`, `<p>`, `<section>`) would force a line
 * break between the glyph and its sibling label on every tile and
 * silently regress the chip layout — even though sibling
 * className/aria assertions would still pass.
 *
 * Sibling W1461 (LobbyTileCatGlyphAria) pins the glyph's
 * `aria-hidden="true"` attribute and W1727 (LobbyTileCatGlyphClassEq)
 * pins its EXACT `className === "tile-cat-glyph"` string — but
 * NEITHER asserts the glyph's `tagName`. A regression that swapped
 * the glyph to `<div className="tile-cat-glyph" aria-hidden="true">…`
 * would pass both sibling tests (className still matches, aria still
 * resolves) but break the inline flow of the chip.
 *
 * Sibling W1757 (LobbyTileCatTag) pins the OUTER `.tile-cat` parent
 * span's tagName — not this inner glyph child. Grepping
 * `Lobby*.test.tsx` for `tile-cat-glyph` `tagName` / `nodeName` returns
 * zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1757 / W1727 / W1461: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-cat-glyph span tagName (W1767)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat-glyph element as a <span>", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every glyph via attribute-substring selector so a
    // regression that injects extra class tokens (e.g.
    // "tile-cat-glyph lobby-anim") is still caught by the tagName
    // check below, rather than silently filtered out.
    const candidates = document.querySelectorAll<HTMLElement>(
      '[class*="tile-cat-glyph"]',
    );
    expect(candidates.length).toBeGreaterThan(0);

    let checked = 0;
    for (const node of Array.from(candidates)) {
      const cls = node.className;
      // Only inspect the actual glyph element — guard against any
      // future siblings that might share the `tile-cat-glyph`
      // substring (e.g. `tile-cat-glyph-glow`).
      if (!/(^|\s)tile-cat-glyph(\s|$)/.test(cls)) continue;

      // Pin the EXACT tagName — `<span>` keeps the glyph in inline
      // flow next to the sibling category-label text node. Any
      // block-level promotion (DIV, P, SECTION, ARTICLE) would force
      // a line break inside the chip while leaving sibling className /
      // aria assertions intact.
      expect(node.tagName).toBe("SPAN");
      checked += 1;
    }

    // Sanity: at least one real glyph was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
