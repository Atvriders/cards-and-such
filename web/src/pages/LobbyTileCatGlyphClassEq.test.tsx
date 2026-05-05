import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1727 — pin the EXACT `className` string ("tile-cat-glyph") on every
 * solo-card / family-card tile's decorative category-glyph span (the
 * inner emoji/icon inside the `.tile-meta > .tile-cat` category chip).
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
 * The CSS in LobbyPage.css keys the glyph's font-size, inline spacing,
 * and decorative margin off `.tile-cat-glyph` ALONE — any extra
 * className tokens would silently break the cascade for downstream
 * specificity overrides, and a renamed class would collapse the
 * visual category icon on every tile in the grid.
 *
 * Sibling W1461 (LobbyTileCatGlyphAria) pins the glyph's
 * `aria-hidden="true"` attribute, but locates the glyph via the
 * `:scope > .tile-meta > .tile-cat > .tile-cat-glyph` querySelector —
 * so a regression that adds a stray utility class (e.g.
 * `"tile-cat-glyph lobby-anim"`) or trims to `"cat-glyph"` would NOT
 * be caught: the `.tile-cat-glyph` selector still matches the first
 * variant, and the aria check passes regardless.
 *
 * Sibling tests pin tile-sheen className equality (W1717), tile-stripe
 * className equality (W1705), tile-chips className equality (W1692),
 * tile-foot className equality (W1681), tile-meta tag+className
 * (W1670), tile-stripe aria (W1373), tile-sheen aria (W1389),
 * tile-cat-glyph aria (W1461). The GLYPH span's exact `className`
 * string had no dedicated assertion — grepping `Lobby*.test.tsx` for
 * `tile-cat-glyph.*toBe` / `className.*toBe.*tile-cat-glyph` returns
 * zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1717 / W1705 / W1692: shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("LobbyPage — tile-cat-glyph span className equality (W1727)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat-glyph span with className === \"tile-cat-glyph\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every glyph span via attribute-substring selector so a
    // regression that injects extra class tokens (e.g.
    // "tile-cat-glyph lobby-anim") is still caught by the equality
    // check below, rather than silently filtered out by
    // `.tile-cat-glyph`.
    const glyphs = document.querySelectorAll<HTMLElement>(
      '[class*="tile-cat-glyph"]',
    );
    expect(glyphs.length).toBeGreaterThan(0);

    let checked = 0;
    for (const glyph of Array.from(glyphs)) {
      const cls = glyph.className;
      // Only inspect the actual glyph span — guard against any
      // future siblings that might share the `tile-cat-glyph`
      // substring (e.g. `tile-cat-glyph-glow`).
      if (!/(^|\s)tile-cat-glyph(\s|$)/.test(cls)) continue;

      // Pin the EXACT className string — no extra tokens, no rename,
      // no whitespace drift.
      expect(cls).toBe("tile-cat-glyph");
      checked += 1;
    }

    // Sanity: at least one real glyph was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
