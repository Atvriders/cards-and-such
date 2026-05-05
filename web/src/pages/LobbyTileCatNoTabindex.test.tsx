import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2263 — the per-tile category chip span (`.tile-cat`) MUST NOT carry
 * a `tabindex` attribute. Each `GameCard` / `FamilyCard`
 * (LobbyPage.tsx ~L2060 / ~L3001 / ~L3241 / ~L3389 / ~L3448) renders
 * the chip as:
 *
 *   <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * The chip is a purely decorative + textual category marker — it is
 * neither a focus target nor an interactive element. Focus inside each
 * tile is owned by the tile's anchor / button, not this inline span.
 *
 * Sibling pins on this same `.tile-cat` parent span:
 *   - W1741 / LobbyTileCatClassEq.test.tsx pins the EXACT className.
 *   - LobbyTileCatTag.test.tsx pins `tagName === "SPAN"`.
 *   - LobbyTileCatNoId.test.tsx (W2072) pins absence of `id`.
 *   - LobbyTileCatNoRole.test.tsx pins absence of `role`.
 *   - LobbyTileCatNoStyle.test.tsx pins absence of inline `style`.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the `.tile-cat` chip itself. A future refactor that introduced e.g.
 * `tabIndex={0}` (or `tabIndex={-1}`) would silently:
 *   1. Insert N extra tab stops into the keyboard order — one per
 *      visible chip in the grid — multiplying lobby tab traversal cost
 *      and burying the actual interactive tile anchors several stops
 *      deeper.
 *   2. Promote a non-interactive presentational span into the
 *      accessibility tree as a "focusable element with no role and no
 *      accessible action," which axe and screen-reader heuristics flag
 *      as a low-quality focus target.
 *   3. Allow `tabIndex={-1}` to be programmatically focused via
 *      `.focus()` from sibling code, coupling unrelated components to
 *      a focus surface this codebase has not advertised.
 *
 * One focused assertion: every `.tile-cat` chip span MUST NOT carry a
 * `tabindex` attribute. If a future change deliberately needs one, it
 * should add the new `tabindex` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1727 / W2036 / W2072 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no tabindex attribute (W2263)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .tile-cat chip span does NOT carry a tabindex attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Walk UP from each pinned glyph to its parent chip span,
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

      // The actual contract: no `tabindex` attribute on the chip span.
      // Use `hasAttribute` rather than checking the resolved tabIndex
      // property — a missing attribute is the only way to keep the
      // span out of the keyboard tab order and out of programmatic
      // `.focus()` reach in a contract-stable way.
      expect(chip.hasAttribute("tabindex")).toBe(false);
      checked += 1;
    }

    // Sanity: at least one real chip span was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
