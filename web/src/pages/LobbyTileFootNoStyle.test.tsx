import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2101 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry an
 * inline `style` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover other aspects of this footer:
 *   - LobbyTileFootClass.test.tsx pins the `.tile-foot` className.
 *   - LobbyTileFootClassEq.test.tsx pins the exact className equality.
 *   - LobbyTileFootNoId.test.tsx pins the absence of an `id` attribute.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the tile-foot wrapper itself. The lobby tile footer's appearance
 * (flex layout, spacing, color, typography) is entirely owned by the
 * stylesheet via the `.tile-foot` class. A naive future refactor that
 * added e.g. `style={{ display: "flex" }}` or `style={{ marginTop: 8 }}`
 * to the JSX would silently:
 *   1. Bypass the stylesheet's cascade so theme overrides, media
 *      queries, and dark-mode tokens stop applying to that property.
 *   2. Bloat the rendered HTML across every tile in the grid (the
 *      footer is rendered once per game card), increasing payload and
 *      hindering CSS extraction tooling.
 *   3. Couple component code to specific visual values that belong in
 *      the design-token layer, making future restyles require a JSX
 *      edit rather than a stylesheet edit.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry a `style` attribute. If a future change deliberately needs
 * inline style (e.g. a CSS custom property bound from data), it should
 * add the new `style` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTileFootNoId pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no style attribute (W2101)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry an inline style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector returns the first
    // match, which is sufficient for this single-attribute pin and
    // avoids coupling to the (separately-pinned) total tile count.
    const foot = document.querySelector<HTMLElement>(".tile-foot");
    expect(foot).not.toBeNull();

    // Sanity: confirm we pinned the footer wrapper itself and not, say,
    // a child span. Without this guard a future restructure that moved
    // the className onto a different element could pass vacuously.
    expect(foot!.tagName).toBe("DIV");

    // The actual contract: no inline `style` attribute on the tile-foot
    // wrapper. Use `hasAttribute` rather than inspecting the `style`
    // IDL property — every HTMLElement exposes a non-null `style`
    // CSSStyleDeclaration regardless of whether the attribute is set,
    // so the attribute-presence check is the precise contract here.
    expect(foot!.hasAttribute("style")).toBe(false);
  });
});
