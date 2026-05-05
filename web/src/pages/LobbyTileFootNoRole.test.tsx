import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2216 — the per-tile footer wrapper (`.tile-foot`) MUST NOT carry an
 * explicit `role` attribute. The footer is the `<div className="tile-foot">`
 * rendered inside each lobby tile (see LobbyPage.tsx around line 2067)
 * holding the player-count text and the "Play" CTA span:
 *
 *     <div className="tile-foot">
 *       <span className="tile-players">…</span>
 *       <span className="tile-cta" aria-hidden="true">Play</span>
 *     </div>
 *
 * Sibling pins already cover other facets of this wrapper:
 *   - LobbyTileFootClass.test.tsx        — className presence
 *   - LobbyTileFootClassEq.test.tsx      — exact className equality
 *   - LobbyTileFootNoId.test.tsx         — absence of `id`
 *   - LobbyTileFootNoStyle.test.tsx      — absence of inline `style`
 *   - LobbyTileFootAriaHidden.test.tsx   — aria-hidden semantics on child
 *
 * What none of those cover is the ABSENCE of a `role` attribute on the
 * tile-foot wrapper itself. A `<div>` is correctly treated by AT as
 * generic/presentational; adding e.g. `role="contentinfo"`,
 * `role="group"`, or `role="region"` would:
 *   1. Inject N tile-footer landmarks into the lobby's accessibility
 *      tree — screen-reader users would hear a "contentinfo" or "group"
 *      announcement on every single tile, drowning out the actual
 *      tile title and CTA.
 *   2. Lock in an ARIA contract that downstream tests, screen-readers,
 *      and possibly automated audits would come to depend on, making
 *      the attribute an undeclared part of the lobby's a11y surface.
 *   3. Silently override the implicit role of the `<div>` element,
 *      decoupling structural HTML semantics from rendered semantics.
 *
 * One focused assertion: the first rendered `.tile-foot` wrapper MUST
 * NOT carry a `role` attribute. If a future change deliberately needs
 * one, it should add the new `role` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2071 / LobbyTileFootNoId pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-foot wrapper has no role attribute (W2216)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("a .tile-foot wrapper does NOT carry a role attribute", () => {
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

    // The actual contract: no `role` attribute on the tile-foot wrapper.
    // Use `hasAttribute` rather than checking for an empty string —
    // a `role=""` would still be a (broken) public a11y surface that
    // future code could come to depend on.
    expect(foot!.hasAttribute("role")).toBe(false);
  });
});
