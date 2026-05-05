import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2166 — the per-tile category chip span (`.tile-cat`) MUST NOT carry
 * an inline `style` attribute. Each `GameCard` / `FamilyCard`
 * (LobbyPage.tsx ~L2060 / ~L3001 / ~L3241 / ~L3389 / ~L3448) renders
 * the chip as:
 *
 *   <span className={`tile-cat tile-cat-${CATEGORY_TAG[g.category]}`}>
 *     <span className="tile-cat-glyph" aria-hidden="true">{glyph}</span>
 *     {CATEGORY_LABELS[g.category]}
 *   </span>
 *
 * The chip's color theming, padding, border-radius, and inline-block
 * layout are driven ENTIRELY by the `.tile-cat` / `.tile-cat-<tag>`
 * CSS rules in LobbyPage.css. An inline `style="..."` attribute
 * injected at the JSX layer would (a) defeat downstream CSS overrides
 * in themed / compact / high-contrast lobby variants by raising
 * specificity to inline-style level, and (b) re-introduce the
 * per-chip inlined sizing/coloring that the className-only pattern
 * was designed to eliminate.
 *
 * Sibling pins on this same `.tile-cat` parent span:
 *   - W1741 / LobbyTileCatClassEq.test.tsx pins the EXACT className
 *     string "tile-cat tile-cat-<tag>".
 *   - W1757 / LobbyTileCatTag.test.tsx pins `tagName === "SPAN"`.
 *   - W2072 / LobbyTileCatNoId.test.tsx pins the absence of an `id`.
 *   - LobbyTileCatLabelText / LobbyTileCatLabelNode pin label text
 *     and trailing text-node placement.
 *   - LobbyTileCatGlyphFirst pins glyph-first child order.
 *
 * What none of those cover is the ABSENCE of an inline `style`
 * attribute on the `.tile-cat` chip itself. The closest cousin,
 * W2148 / LobbyTileCatGlyphNoStyle.test.tsx, pins the absence of
 * `style` on the INNER `.tile-cat-glyph` span, NOT the outer chip
 * — grepping `Lobby*.test.tsx` for files containing BOTH `tile-cat`
 * and `style` returns only that one inner-glyph file.
 *
 * One focused assertion: a `.tile-cat` chip span MUST NOT carry
 * an inline `style` attribute. If a future change deliberately
 * needs one (e.g. CSS-in-JS dynamic theming), it should add the
 * new `style` AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1741 / W1727 / W2072 / W2148 pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-cat chip span has no inline style attribute (W2166)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the first .tile-cat chip span does NOT carry a style attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The search input is the canonical "lobby is ready" anchor used
    // by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Walk UP from a W1727-pinned glyph to its parent chip span,
    // guaranteeing we inspect an actual category-chip span (not an
    // unrelated future sibling that happens to share the `tile-cat`
    // substring like `.tile-cat-glyph`).
    const glyph = document.querySelector<HTMLElement>(".tile-cat-glyph");
    expect(glyph).not.toBeNull();

    const chip = glyph!.parentElement;
    expect(chip, "tile-cat-glyph must have a parent element").not.toBeNull();

    // Sanity: confirm we walked up onto an actual `.tile-cat` chip
    // (defensive against a future restructure that nests the glyph
    // one level deeper inside the chip).
    expect(chip!.classList.contains("tile-cat")).toBe(true);

    // Pin the ABSENCE of the `style` attribute. `hasAttribute("style")`
    // is the strictest check: it returns `true` even if a `style=""`
    // was emitted, so any inline-styling regression is caught.
    expect(chip!.hasAttribute("style")).toBe(false);
  });
});
