import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2382 — the main games-grid container (`.lobby-grid:not(.lobby-grid--featured)`,
 * LobbyPage.tsx ~L2331) MUST NOT carry an explicit ARIA `role` attribute.
 * The element is rendered as a plain `<div className="lobby-grid"
 * data-density data-view ref={gridRef}>`; it intentionally relies on the
 * default generic block semantics so the per-tile `aria-label` strategy
 * announces each card individually rather than the grid being announced
 * as a `role="grid"` / `role="list"` / `role="region"` collection.
 *
 * Sibling pins on this same `.lobby-grid` element:
 *   - W1362 / LobbyGridDiv.test.tsx pins `tagName === "DIV"`.
 *   - W2084 / LobbyGridNoId.test.tsx pins absence of `id`.
 *   - W2124 / LobbyGridNoStyle.test.tsx pins absence of inline `style`.
 *   - W2319 / LobbyGridDataView.test.tsx pins the default `data-view="grid"`.
 *   - LobbyPage.test.tsx (~L3122, ~L3253) pins `data-density` /
 *     `data-view` mirroring.
 *
 * What none of those cover is the ABSENCE of an explicit `role` attribute
 * on the main grid. A future refactor that introduced e.g. `role="grid"`
 * (to coerce ARIA grid pattern semantics) or `role="list"` (mirroring the
 * `data-view="list"` visual mode) would silently:
 *   1. Force AT to announce the container as a structured collection,
 *      conflicting with the per-tile `aria-label` strategy used by
 *      `<a className="tile">` children — which already carry rich
 *      per-card labels, ratings, and badges. Under `role="grid"`, ATs
 *      expect `role="row"` / `role="gridcell"` descendants the codebase
 *      does NOT emit, producing broken ARIA structure.
 *   2. Hijack arrow-key handling at the AT layer, layering on top of
 *      the bespoke roving-tabindex / 2D arrow navigation implemented in
 *      `onGridKeyDown` (~L809, ~L1348). The ARIA grid pattern's keyboard
 *      contract differs from this app's and a duplicate handler would
 *      double-fire navigation in screen-reader browse modes.
 *   3. Inject an undeclared landmark (for `role="region"` / `role="main"`),
 *      coupling this presentation-only container to the page's landmark
 *      structure — which `<section aria-label>` wrappers already own.
 *
 * One focused assertion: the main `.lobby-grid` element MUST NOT carry a
 * `role` attribute. If a future change deliberately needs one, it should
 * add the new attribute AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1362 / W2084 / W2124 / W2319 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — main games-grid has no role attribute (W2382)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the main `.lobby-grid` (not the featured variant) does NOT carry a role attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // The main grid is selected via `:not(.lobby-grid--featured)` so the
    // optional Featured / Recommended strips' grids don't leak in — same
    // selector strategy used elsewhere in LobbyPage.test.tsx (~L645,
    // ~L878, ~L921, ~L3145, ~L3276) and the LobbyGrid* sibling tests.
    const grid = document.querySelector<HTMLElement>(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    expect(grid).not.toBeNull();

    // Sanity guards: confirm we pinned the actual main grid container and
    // not, say, the skeleton placeholder grid (which carries
    // `aria-busy="true"` and a `data-testid="lobby-skeleton-grid"`),
    // an inner tile, or an unrelated `.lobby-grid` clone. Without these
    // guards a future restructure could pass this assertion vacuously.
    expect(grid!.tagName).toBe("DIV");
    expect(grid!.classList.contains("lobby-grid")).toBe(true);
    expect(grid!.classList.contains("lobby-grid--featured")).toBe(false);
    expect(grid!.getAttribute("data-testid")).not.toBe("lobby-skeleton-grid");

    // The actual contract: no `role` attribute on the main grid. Use
    // `hasAttribute` rather than checking for an empty string — a
    // `role=""` would still be a (broken) public surface that future
    // ARIA-aware code or AT shims could come to depend on.
    expect(grid!.hasAttribute("role")).toBe(false);
  });
});
