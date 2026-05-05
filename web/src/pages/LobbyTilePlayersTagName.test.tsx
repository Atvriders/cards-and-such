import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2478 — the per-tile players-left text element (`.tile-players`)
 * MUST be rendered as a `<span>`. The element appears inside each
 * lobby tile's footer wrapper (see LobbyPage.tsx around line 2068 /
 * 3040 / 3281 / 3414 / 3476) carrying the player-count text:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>   ← MUST be SPAN
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pin LobbyTileFootFirstChildClass.test.tsx (W2423) already
 * established that `.tile-players` is the `firstElementChild` of the
 * `.tile-foot` wrapper, so locating it via the tile-foot first-child
 * is stable. This pin adds the next layer of the contract: the
 * element's *tag*. A naive future refactor that swapped the `<span>`
 * for, say, a `<div>` or `<p>` would silently:
 *   1. Break inline layout — `<span>` is `display: inline` by default
 *      while `<div>`/`<p>` are block, so the players-text would no
 *      longer share a flex row with the `.tile-cta` glyph and would
 *      either wrap or push the CTA to the next line on narrow tiles.
 *   2. Inject default block-level margins (e.g. `<p>`'s top/bottom
 *      margins) that would visually misalign the footer baseline
 *      across tiles.
 *   3. Decouple the rendered DOM from the documented snippet pinned
 *      in sibling tests' JSDoc (which all show `<span>` for the
 *      players-text), weakening the contract.
 *
 * One focused assertion: the first rendered `.tile-players` element
 * MUST be a `<span>`. If a future change deliberately needs a
 * different tag, it should change the JSX AND update this pin in the
 * same commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established LobbyTileFoot* / LobbyTileCta* pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-players element is a <span> (W2478)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the first rendered .tile-players element has tagName SPAN", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className. querySelector returns the first
    // match, which is sufficient for this single-attribute pin and
    // avoids coupling to the (separately-pinned) total tile count.
    const players = document.querySelector<HTMLElement>(".tile-players");
    expect(players).not.toBeNull();

    // The actual contract: the element is a <span>.
    expect(players!.tagName).toBe("SPAN");
  });
});
