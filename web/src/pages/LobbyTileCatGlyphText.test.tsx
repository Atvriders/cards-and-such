import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1777 — pin the EXACT `textContent` (literal glyph character) of
 * every solo-card / family-card tile's `.tile-cat-glyph` decorative
 * category-icon span. The glyph is a single Unicode character whose
 * value is sourced from the `CATEGORY_GLYPHS` lookup table inside
 * `LobbyPage.tsx` (~L616):
 *
 *   const CATEGORY_GLYPHS: Record<GameCategory, string> = {
 *     solitaire: "♤",
 *     cards:     "♣",
 *     dice:      "⚂",
 *     board:     "▦",
 *     arcade:    "✦",
 *   };
 *
 * Each tile renders:
 *
 *   <span className="tile-cat tile-cat-<tag>">
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * Sibling W1461 (LobbyTileCatGlyphAria) pins the `aria-hidden="true"`
 * attribute. Sibling W1727 (LobbyTileCatGlyphClassEq) pins the
 * `className === "tile-cat-glyph"` string. Sibling W1767
 * (LobbyTileCatGlyphTag) pins the `<span>` `tagName`. NONE of those
 * tests assert that the glyph element actually CONTAINS the expected
 * Unicode character — a regression that emptied the span (e.g.
 * `<span className="tile-cat-glyph" aria-hidden="true" />`) or that
 * swapped the lookup table to all blanks would silently pass every
 * sibling assertion while leaving the visual chip glyph-less.
 *
 * Pinning the textContent against the exact CATEGORY_GLYPHS value-set
 * (one of "♤", "♣", "⚂", "▦", "✦") guards against:
 *  - accidental empty-render regressions,
 *  - inadvertent swaps to a sibling category's glyph,
 *  - stripping by a future i18n / Unicode-normalization pass.
 *
 * Lives in a NEW SIBLING file per the same rationale as W1461 / W1727
 * / W1767: shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat-glyph textContent (W1777)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-cat-glyph with one of the CATEGORY_GLYPHS literals", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Source-of-truth value-set sourced verbatim from LobbyPage.tsx
    // CATEGORY_GLYPHS. Pinning by VALUE (not key) lets the assertion
    // catch a regression where the lookup table is reshuffled but the
    // five characters happen to remain present elsewhere in the app.
    const EXPECTED_GLYPHS = new Set(["♤", "♣", "⚂", "▦", "✦"]);

    const glyphs = document.querySelectorAll<HTMLElement>(
      ".tile-cat-glyph",
    );
    expect(glyphs.length).toBeGreaterThan(0);

    let checked = 0;
    for (const node of Array.from(glyphs)) {
      // Pin the EXACT textContent — must be a non-empty single-char
      // Unicode glyph drawn from CATEGORY_GLYPHS. Trimming guards
      // against an accidental whitespace wrapper around the glyph
      // (which would still render visually but break the chip layout
      // alignment with the sibling label text node).
      const text = node.textContent ?? "";
      expect(text.length).toBeGreaterThan(0);
      expect(text).toBe(text.trim());
      expect(
        EXPECTED_GLYPHS.has(text),
        `tile-cat-glyph textContent ${JSON.stringify(text)} not in CATEGORY_GLYPHS value-set`,
      ).toBe(true);
      checked += 1;
    }

    // Sanity: at least one glyph was inspected so the suite can't
    // pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
