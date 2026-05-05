import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2285 — pin the ABSENCE of a `tabindex` attribute on every
 * LobbyPage `.tile-cat-glyph` span (the decorative emoji/icon inside
 * each tile's `.tile-meta > .tile-cat` category chip).
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2061 / ~L3002 /
 * ~L3242 / ~L3390 / ~L3449) renders the glyph as:
 *
 *   <span className="tile-cat-glyph" aria-hidden="true">
 *     {CATEGORY_GLYPHS[g.category]}
 *   </span>
 *
 * The glyph is purely decorative — it carries `aria-hidden="true"`
 * and is wrapped inside the textual `.tile-cat` chip whose absence of
 * `tabindex` is itself pinned by W2263 (LobbyTileCatNoTabindex). What
 * NO sibling test currently pins is the `tabindex` absence on the
 * INNER `.tile-cat-glyph` span itself. A future refactor that added
 * e.g. `tabIndex={0}` to the glyph would silently:
 *   1. Inject N extra tab stops into the lobby keyboard order — one
 *      per visible glyph in the grid — multiplying tab-traversal cost
 *      and burying actual interactive tile anchors deeper.
 *   2. Promote a deliberately `aria-hidden="true"` decorative span
 *      into the focus surface, producing the contradictory pairing of
 *      "hidden from AT" + "reachable by Tab" that axe flags as a
 *      keyboard-focusable hidden element.
 *   3. Allow `tabIndex={-1}` to be programmatically focused via
 *      `.focus()` from sibling code, coupling unrelated components to
 *      a focus surface this codebase has not advertised.
 *
 * Sibling pins on this same `.tile-cat-glyph` span:
 *   - W1727 / LobbyTileCatGlyphClassEq.test.tsx pins the EXACT className.
 *   - LobbyTileCatGlyphTag.test.tsx pins `tagName === "SPAN"`.
 *   - LobbyTileCatGlyphAria.test.tsx pins `aria-hidden="true"`.
 *   - LobbyTileCatGlyphText.test.tsx pins glyph text content.
 *   - LobbyTileCatGlyphFirst.test.tsx pins "first child" position.
 *   - W2148 / LobbyTileCatGlyphNoStyle.test.tsx pins absence of inline
 *     `style`.
 *
 * Note: the parent `.tile-cat` chip's `tabindex` absence is pinned by
 * W2263 (LobbyTileCatNoTabindex.test.tsx). This test pins the INNER
 * `.tile-cat-glyph` span instead — a strictly distinct DOM node.
 *
 * Co-located in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * established W1741 / W1727 / W2148 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat-glyph has no tabindex attribute (W2285)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .tile-cat-glyph span does NOT carry a tabindex attribute", async () => {
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

    // The actual contract: no `tabindex` attribute on the glyph span.
    // Use `hasAttribute` rather than checking the resolved tabIndex
    // property — a missing attribute is the only way to keep the
    // span out of the keyboard tab order and out of programmatic
    // `.focus()` reach in a contract-stable way.
    expect(glyph!.hasAttribute("tabindex")).toBe(false);
  });
});
