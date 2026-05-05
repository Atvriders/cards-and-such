import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1741 — pin the EXACT `className` string ("tile-cat tile-cat-<tag>")
 * on every solo-card / family-card tile's category chip span (the
 * PARENT of the decorative `.tile-cat-glyph` icon span pinned by
 * sibling W1727).
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
 * Where `<tag>` is one of the single-letter CATEGORY_TAG values
 * (s/c/d/b/a). The CSS in LobbyPage.css keys both the base chip
 * (background, border, padding, radius) and the per-category accent
 * color off this exact two-token pair — any extra className tokens,
 * a renamed base class, or a missing variant suffix would silently
 * break the cascade for downstream specificity overrides and
 * collapse the visual category chip on every tile in the grid.
 *
 * Sibling W1727 (LobbyTileCatGlyphClassEq) pins the INNER glyph
 * span's `className === "tile-cat-glyph"`, but locates the glyph
 * directly via `[class*="tile-cat-glyph"]` — so a regression that
 * adds a stray utility class to the PARENT chip span (e.g.
 * `"tile-cat tile-cat-s lobby-anim"`) or trims the variant tag
 * (e.g. `"tile-cat"`) would NOT be caught: the inner glyph check
 * still passes regardless of the parent's className drift.
 *
 * Sibling tests pin tile-sheen className equality (W1717), tile-stripe
 * className equality (W1705), tile-chips className equality (W1692),
 * tile-foot className equality (W1681), tile-meta tag+className
 * (W1670), tile-cat-glyph className eq (W1727). The PARENT chip
 * span's exact `className` string had no dedicated assertion —
 * grepping `Lobby*.test.tsx` for `tile-cat tile-cat-` /
 * `className.*toBe.*tile-cat[^-]` returns zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1727 / W1717 / W1705 / W1692: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat parent span className equality (W1741)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat parent span with className === \"tile-cat tile-cat-<tag>\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate every tile-cat parent span via the inner glyph child so
    // we walk UP from the W1727-pinned glyph, guaranteeing we only
    // inspect actual category-chip spans (not unrelated future
    // siblings that happen to share the `tile-cat` substring).
    const glyphs = document.querySelectorAll<HTMLElement>(
      ".tile-cat-glyph",
    );
    expect(glyphs.length).toBeGreaterThan(0);

    // Single-letter tag suffixes from CATEGORY_TAG (LobbyPage.tsx
    // ~L627): solitaire=s, cards=c, dice=d, board=b, arcade=a.
    const tagPattern = /^tile-cat tile-cat-[scdba]$/;

    let checked = 0;
    for (const glyph of Array.from(glyphs)) {
      const parent = glyph.parentElement;
      expect(parent, "tile-cat-glyph must have a parent element").not.toBeNull();
      if (!parent) continue;

      const cls = parent.className;

      // Pin the EXACT className string — no extra tokens, no rename,
      // no whitespace drift, exactly two space-separated tokens
      // matching `tile-cat tile-cat-<tag>`.
      expect(cls).toMatch(tagPattern);
      checked += 1;
    }

    // Sanity: at least one real chip span was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
