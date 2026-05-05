import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2084 — the main games-grid container (`.lobby-grid`, the non-featured
 * variant rendered around LobbyPage.tsx ~L2331) MUST NOT carry an `id`
 * attribute. The grid is anchored externally via its stable
 * `className="lobby-grid"` (selected as
 * `.lobby-grid:not(.lobby-grid--featured)` throughout the lobby tests),
 * its `data-density` / `data-view` attributes for CSS-driven layout
 * switching, and its React `ref={gridRef}` for the roving-tabindex /
 * arrow-key navigation handler. None of those identifiers require —
 * or imply — a DOM `id`.
 *
 * Sibling pins on this same main grid wrapper:
 *   - W1362 / LobbyGridDiv.test.tsx pins `tagName === "DIV"`.
 *   - LobbyPage.test.tsx ~L3145 / ~L3168 / ~L3276 pin the
 *     `data-density` and `data-view` attributes.
 *   - LobbyAllGamesAria.test.tsx pins the surrounding section's
 *     `aria-label`.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * grid container itself. A future refactor that introduced e.g.
 * `id="lobby-grid"` would silently:
 *   1. Create a stable URL fragment target (`/#lobby-grid`) that
 *      external links / bookmarks / "skip to content" affordances could
 *      come to depend on, making it an undeclared part of the public
 *      contract.
 *   2. Enable `aria-controls` / `aria-labelledby` / `aria-describedby`
 *      from elsewhere on the page to point at the grid, coupling
 *      sibling components to an attribute this codebase has
 *      deliberately not advertised.
 *   3. Risk a collision with the sibling skeleton grid (which already
 *      carries `data-testid="lobby-skeleton-grid"` at ~L2295) or the
 *      Featured / Recommended grid wrappers — jsdom and browsers
 *      tolerate duplicate ids at render time but `getElementById`
 *      and fragment scrolling break in surprising ways.
 *
 * One focused assertion: the main `.lobby-grid` container MUST NOT carry
 * an `id` attribute. If a future change deliberately needs one, it
 * should add the new `id` AND update this pin in the same commit,
 * making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W2036 / W1362 / W1908 / W1150 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — main games-grid has no id attribute (W2084)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the main `.lobby-grid` container does NOT carry an id attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to finish mounting — the search input is the
    // canonical "lobby is ready" anchor used by sibling tests
    // (LobbyGridDiv.test.tsx ~L45 uses the same pattern).
    await screen.findByPlaceholderText(/search/i);

    // The main grid is selected via `:not(.lobby-grid--featured)` so
    // the optional Featured / Recommended strips' grids don't leak in
    // — same selector strategy used elsewhere in LobbyPage.test.tsx
    // (~L645, ~L878, ~L921, ~L3145, ~L3276) and LobbyGridDiv.test.tsx.
    const grid = document.querySelector<HTMLElement>(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    expect(grid).not.toBeNull();

    // Sanity: confirm we pinned the actual main grid container and not,
    // say, an inner tile or an unrelated `.lobby-grid` clone. Without
    // these guards a future restructure could pass this assertion
    // vacuously.
    expect(grid!.tagName).toBe("DIV");
    expect(grid!.classList.contains("lobby-grid")).toBe(true);
    expect(grid!.classList.contains("lobby-grid--featured")).toBe(false);

    // The actual contract: no `id` attribute on the main grid container.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(grid!.hasAttribute("id")).toBe(false);
  });
});
