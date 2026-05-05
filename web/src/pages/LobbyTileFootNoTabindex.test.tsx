import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2253 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry a
 * `tabindex` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover other aspects of this footer's contract:
 *   - LobbyTileFootClass.test.tsx pins the `.tile-foot` className.
 *   - LobbyTileFootClassEq.test.tsx pins the exact className equality.
 *   - LobbyTileFootNoId.test.tsx pins the absence of an `id` attribute.
 *   - LobbyTileFootNoStyle.test.tsx pins the absence of inline `style`.
 *   - LobbyTileFootNoRole.test.tsx pins the absence of a `role`.
 *   - LobbyTileFootAriaHidden.test.tsx pins ARIA semantics.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute on
 * the tile-foot wrapper. Because each lobby tile is itself a focusable
 * `<button>`, adding `tabindex` to the inner `.tile-foot` `<div>` would
 * silently:
 *   1. Insert a redundant tab stop inside an already-focusable tile,
 *      doubling the tab stops a keyboard user must traverse to scan the
 *      lobby grid.
 *   2. Make a non-interactive presentational `<div>` reachable by
 *      keyboard with no associated handler, violating WCAG 2.1.1
 *      (Keyboard) expectations that all focusable elements be operable.
 *   3. Couple sibling tooling (focus-trap helpers, custom roving-tabindex
 *      scripts, screen-reader heuristics) to an attribute this codebase
 *      has deliberately not advertised on the footer wrapper.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry a `tabindex` attribute. If a future change deliberately
 * needs one (e.g. converting the footer into a focusable disclosure),
 * it should add the new `tabindex` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2036 / W2071 LobbyTileFootNoId pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no tabindex attribute (W2253)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry a tabindex attribute", () => {
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

    // The actual contract: no `tabindex` attribute on the tile-foot
    // wrapper. Use `hasAttribute` rather than reading the property —
    // the DOM `tabIndex` IDL attribute reflects a default of -1 for
    // non-focusable elements even when no markup attribute is present,
    // so only `hasAttribute` distinguishes "absent" from "explicitly 0".
    expect(foot!.hasAttribute("tabindex")).toBe(false);
  });
});
