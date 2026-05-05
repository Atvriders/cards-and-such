import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2367 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry a
 * `title` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
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
 *
 * What none of those cover is the ABSENCE of a `title` attribute on the
 * tile-foot wrapper itself. The tile's tooltip/hover surface is owned by
 * the surrounding `<Link>`/`<button>` (which exposes the game title via
 * `aria-label` and `title` where appropriate); the inner footer has no
 * additional information to surface on hover. A naive future refactor
 * that added e.g. `title={`${players} players`}` to the JSX would
 * silently:
 *   1. Inject a native browser tooltip on every tile footer that
 *      duplicates the visible `.tile-players` text already in the DOM.
 *   2. Create an inconsistent UX where some footer regions surface
 *      tooltips and others (e.g. recommended tiles) do not.
 *   3. Couple sibling tooling (e.g. tooltip libraries that detect the
 *      `title` attribute and replace it with a custom popover) to a
 *      surface this codebase has deliberately not advertised.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry a `title` attribute. If a future change deliberately needs
 * one, it should add the new `title` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTileFootNoId / LobbyTileFootNoRole pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no title attribute (W2367)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry a title attribute", () => {
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

    // The actual contract: no `title` attribute on the tile-foot wrapper.
    // Use `hasAttribute` rather than checking for an empty string —
    // a `title=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(foot!.hasAttribute("title")).toBe(false);
  });
});
