import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2148 — pin the ABSENCE of an inline `style` attribute on every
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
 * The glyph's font-size, inline-block layout, and decorative margin
 * are driven ENTIRELY by the `.tile-cat-glyph` CSS rule in
 * LobbyPage.css. An inline `style="..."` attribute injected at the
 * JSX layer would (a) defeat downstream CSS overrides in themed /
 * compact lobby variants by raising specificity to inline-style
 * level, and (b) re-introduce the per-tile inlined sizing that the
 * className-only pattern was designed to eliminate.
 *
 * Sibling tests pin: glyph className equality (W1727), glyph
 * aria-hidden (W1461), glyph tag (LobbyTileCatGlyphTag),
 * glyph text content (LobbyTileCatGlyphText), glyph "first child"
 * position (LobbyTileCatGlyphFirst). NONE of them inspect the
 * `style` attribute — grepping `Lobby*.test.tsx` for files that
 * contain BOTH `tile-cat-glyph` and `style` returns zero matches.
 *
 * Co-located in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * same rationale as W1727 / W1717 / W1705: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat-glyph has no inline style attribute (W2148)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the first tile-cat-glyph span without a style attribute", async () => {
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

    // Pin the ABSENCE of the `style` attribute. `hasAttribute("style")`
    // is the strictest check: it returns `true` even if a `style=""`
    // was emitted, so any inline-styling regression is caught.
    expect(glyph!.hasAttribute("style")).toBe(false);
  });
});
