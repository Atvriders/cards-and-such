import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2423 — the per-tile footer wrapper (`.tile-foot`) MUST render its
 * `.tile-players` text span FIRST (i.e. as `firstElementChild`). The
 * footer is the `<div className="tile-foot">` rendered inside each
 * lobby tile (see LobbyPage.tsx around line 2067 / 3039 / 3413 / 3475)
 * with the player-count text on the LEFT and the decorative "Play"
 * CTA glyph on the RIGHT:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>   ← MUST be first
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover other facets of this wrapper's contract:
 *   - LobbyTileFootClass.test.tsx        — className presence (W1473)
 *   - LobbyTileFootClassEq.test.tsx      — exact className equality (W1681)
 *   - LobbyTileFootNoId.test.tsx         — absence of `id` (W2071)
 *   - LobbyTileFootNoStyle.test.tsx      — absence of inline `style` (W2101)
 *   - LobbyTileFootNoRole.test.tsx       — absence of `role` (W2216)
 *   - LobbyTileFootAriaHidden.test.tsx   — absence of `aria-hidden` (W2208)
 *   - LobbyTileFootNoTabindex.test.tsx   — absence of `tabindex` (W2253)
 *   - LobbyTileFootNoTitle.test.tsx      — absence of `title` (W2367)
 *
 * What none of those cover is the FIRST-CHILD CONTRACT — the visual
 * (and reading) order in which the footer's children appear. The CSS
 * grid that styles `.tile-foot` (a flex row with `space-between`)
 * relies on the players span occupying the *start* edge while the CTA
 * glyph anchors the *end* edge. A naive future refactor that swapped
 * these JSX nodes (e.g. moving `.tile-cta` to render before
 * `.tile-players`) would silently:
 *   1. Reverse the visual order — "Play" would appear left-aligned
 *      where the player count belongs, and the player count would be
 *      pushed to the right edge under the CTA region.
 *   2. Reverse the DOM/reading order for assistive tech that walks
 *      child order before applying CSS, so users would hear the
 *      decorative glyph text ("Play") before the meaningful players
 *      count.
 *   3. Decouple the rendered DOM from the documented order pinned in
 *      sibling tests' JSDoc snippets, weakening the contract that
 *      describes `.tile-foot` as "players on the left, CTA on the
 *      right".
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper's
 * `firstElementChild` MUST be a `<span>` carrying the `tile-players`
 * className. If a future change deliberately needs to reorder the
 * footer, it should reorder the JSX AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTileFootNoId / LobbyTileFootNoTitle pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot first child is .tile-players (W2423)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper's firstElementChild is the .tile-players span", () => {
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

    // The actual contract: the first element child is the players span.
    const first = foot!.firstElementChild as HTMLElement | null;
    expect(first).not.toBeNull();
    expect(first!.tagName).toBe("SPAN");
    expect(first!.classList.contains("tile-players")).toBe(true);
  });
});
