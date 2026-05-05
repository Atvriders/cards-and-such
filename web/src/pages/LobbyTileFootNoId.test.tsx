import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2071 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry an
 * `id` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover the SHAPE of this footer:
 *   - LobbyTileFootClass.test.tsx pins the `.tile-foot` className.
 *   - LobbyTileFootClassEq.test.tsx pins the exact className equality.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * tile-foot wrapper itself. Because the lobby renders many tiles, a
 * naive future refactor that added e.g. `id="tile-foot"` to the JSX
 * would silently:
 *   1. Mint duplicate ids across every tile in the grid — jsdom and
 *      browsers tolerate this at render time, but `getElementById`
 *      collapses to the first match and fragment-scroll targets break.
 *   2. Create a public URL-fragment surface (`/#tile-foot`) that
 *      external links could come to depend on, making the footer's
 *      identifier an undeclared part of the lobby contract.
 *   3. Enable `aria-controls` / `aria-labelledby` from elsewhere on the
 *      page to point at one specific tile's footer, coupling sibling
 *      components to an attribute this codebase has deliberately not
 *      advertised.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry an `id` attribute. If a future change deliberately needs
 * one, it should add the new `id` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2036 / LobbyChipStripNoId pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no id attribute (W2071)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry an id attribute", () => {
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

    // The actual contract: no `id` attribute on the tile-foot wrapper.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(foot!.hasAttribute("id")).toBe(false);
  });
});
