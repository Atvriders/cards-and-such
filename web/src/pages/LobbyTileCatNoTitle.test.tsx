import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2375 — the per-tile category chip span (`.tile-cat`) MUST NOT carry
 * a `title` attribute. Each `GameCard` / `FamilyCard` (LobbyPage.tsx
 * ~L2060 / ~L3001 / ~L3241 / ~L3389 / ~L3448) renders the chip as:
 *
 *   <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * The chip's category is communicated entirely by its visible label
 * text node (CATEGORY_LABELS[...]) — no `title` tooltip is rendered.
 *
 * Sibling pins on this same `.tile-cat` parent span ALREADY cover:
 *   - W1741 / LobbyTileCatClassEq.test.tsx — exact className.
 *   - W1757 / LobbyTileCatTag.test.tsx — `tagName === "SPAN"`.
 *   - W2072 / LobbyTileCatNoId.test.tsx — `id` attribute absence.
 *   - LobbyTileCatNoRole.test.tsx — `role` attribute absence.
 *   - LobbyTileCatNoStyle.test.tsx — `style` attribute absence.
 *   - LobbyTileCatNoTabindex.test.tsx — `tabindex` attribute absence.
 *   - LobbyTileCatAriaHidden.test.tsx — `aria-hidden` absence.
 *   - LobbyTileCatLabelText / LobbyTileCatLabelNode — visible label.
 *   - LobbyTileCatGlyphFirst — glyph-first child order.
 *
 * What none of those cover is the ABSENCE of a `title` attribute on
 * the `.tile-cat` chip. A regression that introduced e.g.
 * `title={CATEGORY_LABELS[g.category]}` would silently:
 *   1. Render a native browser tooltip on hover that DUPLICATES the
 *      visible label text, creating audio-redundancy for screen
 *      readers that announce both the visible text and the title
 *      attribute (depending on AT/browser combo).
 *   2. Mask future visible-label regressions — if the visible text
 *      were accidentally swapped to a glyph-only render, the title
 *      would still surface the category name on hover, hiding the
 *      bug from manual QA while breaking touch / keyboard users.
 *   3. Couple the chip to per-platform tooltip styling that this
 *      codebase has deliberately not opted into (custom tooltips
 *      would belong on the parent `.tile` anchor's `aria-label`
 *      pathway, not on the inline category chip).
 *
 * One focused assertion: every `.tile-cat` chip span MUST NOT carry
 * a `title` attribute. If a future change deliberately needs a
 * tooltip, it should add the new `title` AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1757 / W2072 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no title attribute (W2375)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .tile-cat chip span does NOT carry a title attribute", async () => {
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

      // The actual contract: no `title` attribute on the chip span.
      // Use `hasAttribute` rather than checking for an empty string —
      // a `title=""` would still be a (broken) public surface that
      // future code could come to depend on.
      expect(chip.hasAttribute("title")).toBe(false);
      checked += 1;
    }

    // Sanity: at least one real chip span was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
