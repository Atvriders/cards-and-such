import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2213 — the per-tile category chip span (`.tile-cat`) MUST NOT carry
 * a `role` attribute. Each `GameCard` / `FamilyCard` (LobbyPage.tsx
 * ~L2060 / ~L3001 / ~L3241 / ~L3389 / ~L3448) renders the chip as:
 *
 *   <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * The chip is a presentational decoration around its visible label
 * text — it deliberately falls back to the implicit role of a `<span>`
 * (which exposes no role to assistive tech), so screen readers read
 * the surrounding tile content as a single coherent unit rather than
 * announcing each chip as a separately-roled landmark, status, or
 * generic widget.
 *
 * Sibling pins on this same `.tile-cat` parent span:
 *   - W1741 / LobbyTileCatClassEq.test.tsx pins the EXACT className
 *     string "tile-cat tile-cat-<tag>".
 *   - LobbyTileCatTag.test.tsx pins `tagName === "SPAN"`.
 *   - LobbyTileCatNoId.test.tsx (W2072) pins the absence of an `id`.
 *   - LobbyTileCatNoStyle.test.tsx pins the absence of inline styles.
 *   - LobbyTileCatLabelText.test.tsx / LobbyTileCatLabelNode.test.tsx
 *     pin the visible label text and trailing text-node placement.
 *   - LobbyTileCatGlyphFirst.test.tsx pins glyph-first child order.
 *
 * What none of those cover is the ABSENCE of a `role` attribute on
 * the `.tile-cat` chip itself. A future refactor that introduced e.g.
 * `role="status"`, `role="note"`, or `role="img"` would silently:
 *   1. Force assistive tech to announce every category chip as a
 *      separate landmark/region, fragmenting the per-tile reading
 *      flow that the tile structure (title, desc, foot) relies on.
 *   2. Make the chip a public a11y contract that downstream tests
 *      and tools (axe, automated audits) would lock onto, coupling
 *      sibling components to an attribute this codebase has
 *      deliberately not advertised.
 *   3. Risk overriding the implicit `<span>` semantics, which the
 *      surrounding tile composition assumes.
 *
 * One focused assertion: every `.tile-cat` chip span MUST NOT carry
 * a `role` attribute. If a future change deliberately needs one, it
 * should add the new `role` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1727 / W2036 / W2072 pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no role attribute (W2213)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .tile-cat chip span does NOT carry a role attribute", async () => {
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

      // The actual contract: no `role` attribute on the chip span.
      // Use `hasAttribute` rather than checking for an empty string —
      // a `role=""` would still be a (broken) public surface that
      // future code could come to depend on.
      expect(chip.hasAttribute("role")).toBe(false);
      checked += 1;
    }

    // Sanity: at least one real chip span was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
