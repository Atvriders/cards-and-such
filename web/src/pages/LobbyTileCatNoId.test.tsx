import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2072 — the per-tile category chip span (`.tile-cat`) MUST NOT carry
 * an `id` attribute. Each `GameCard` / `FamilyCard` (LobbyPage.tsx
 * ~L2060 / ~L3001 / ~L3241 / ~L3389 / ~L3448) renders the chip as:
 *
 *   <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * The chip is anchored externally via its stable two-token className
 * (W1741) and identified for assistive tech by its visible category
 * label text — there is no per-chip `id`, and there should not be one.
 *
 * Sibling pins on this same `.tile-cat` parent span:
 *   - W1741 / LobbyTileCatClassEq.test.tsx pins the EXACT className
 *     string "tile-cat tile-cat-<tag>".
 *   - LobbyTileCatTag.test.tsx pins `tagName === "SPAN"`.
 *   - LobbyTileCatLabelText.test.tsx / LobbyTileCatLabelNode.test.tsx
 *     pin the visible label text and trailing text-node placement.
 *   - LobbyTileCatGlyphFirst.test.tsx pins glyph-first child order.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * `.tile-cat` chip itself. A future refactor that introduced e.g.
 * `id={\`tile-cat-${g.id}\`}` would silently:
 *   1. Create stable URL fragment targets (`/#tile-cat-foo`) that
 *      external links and bookmarks could come to depend on, making
 *      them an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on
 *      the page to point at individual chips, coupling sibling
 *      components to an attribute this codebase has deliberately not
 *      advertised.
 *   3. Risk duplicate-id collisions across the grid — the same game
 *      can appear in multiple sections (recommended, all-games,
 *      family card spotlight) and jsdom plus browsers tolerate
 *      duplicate ids at render time, but `getElementById` and
 *      fragment scrolling break in unpredictable ways.
 *
 * One focused assertion: every `.tile-cat` chip span MUST NOT carry
 * an `id` attribute. If a future change deliberately needs one, it
 * should add the new `id` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1727 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no id attribute (W2072)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .tile-cat chip span does NOT carry an id attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Walk UP from each W1727-pinned glyph to its parent chip span,
    // guaranteeing we only inspect actual category-chip spans (not
    // unrelated future siblings that happen to share the `tile-cat`
    // substring like `.tile-cat-glyph`).
    const glyphs = document.querySelectorAll<HTMLElement>(".tile-cat-glyph");
    expect(glyphs.length).toBeGreaterThan(0);

    let checked = 0;
    for (const glyph of Array.from(glyphs)) {
      const chip = glyph.parentElement;
      expect(chip, "tile-cat-glyph must have a parent element").not.toBeNull();
      if (!chip) continue;

      // Sanity: confirm we walked up onto an actual `.tile-cat` chip
      // (defensive against a future restructure that nests the glyph
      // one level deeper inside the chip).
      expect(chip.classList.contains("tile-cat")).toBe(true);

      // The actual contract: no `id` attribute on the chip span.
      // Use `hasAttribute` rather than checking for an empty string —
      // an `id=""` would still be a (broken) public surface that
      // future code could come to depend on.
      expect(chip.hasAttribute("id")).toBe(false);
      checked += 1;
    }

    // Sanity: at least one real chip span was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
