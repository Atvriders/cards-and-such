import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2124 — the main games-grid container (`.lobby-grid:not(.lobby-grid--featured)`,
 * LobbyPage.tsx ~L2331) MUST NOT carry an inline `style` attribute. The
 * element receives only stable className + `data-density` / `data-view`
 * data-attrs + a `ref`; all visual presentation (the `display: grid`
 * declaration, gap, breakpoints, list-vs-grid layout switch keyed off
 * `[data-view="list"]`, density-driven sizing keyed off `[data-density]`)
 * is owned entirely by the `.lobby-grid` CSS class.
 *
 * Sibling pins on this same `.lobby-grid` element:
 *   - W1362 / LobbyGridDiv.test.tsx pins `tagName === "DIV"`.
 *   - LobbyGridNoId.test.tsx pins absence of `id`.
 *   - LobbyPage.test.tsx (~L3122, ~L3253) pins the `data-density` /
 *     `data-view` mirroring.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the main grid. A future refactor that introduced e.g. a JS-driven
 * `style={{ gridTemplateColumns: ... }}` for column-count measurement,
 * or `style={{ "--cols": cols }}` for CSS-var injection, would silently:
 *   1. Bypass the established stylesheet contract for this element,
 *      defeating the breakpoint media-queries the `.lobby-grid` class
 *      relies on (column counts are derived per-viewport in CSS today,
 *      not per-render in JS).
 *   2. Couple the component's render output to layout-measurement logic
 *      — exactly the pattern the existing roving-tabindex code already
 *      avoids by using `getBoundingClientRect` only inside event
 *      handlers (`onGridKeyDown`), not during render.
 *   3. Defeat CSP `style-src` policies that disallow inline styles,
 *      which this app's deployment is free to adopt today precisely
 *      because the lobby grid carries no inline style.
 *
 * One focused assertion: the main `.lobby-grid` element MUST NOT carry
 * a `style` attribute. If a future change deliberately needs inline
 * style (e.g., a CSS-var for runtime column override), it should add
 * the new attribute AND update this pin in the same commit, making the
 * trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1362 / LobbyChipStripNoStyle pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — main games-grid has no inline style attribute (W2124)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the main `.lobby-grid` (not the featured variant) does NOT carry a style attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // The main grid is selected via `:not(.lobby-grid--featured)` so
    // the optional Featured / Recommended strips' grids don't leak in
    // — same selector strategy used elsewhere in LobbyPage.test.tsx
    // (~L645, ~L878, ~L921, ~L3145, ~L3276) and LobbyGridDiv.test.tsx.
    const grid = document.querySelector<HTMLElement>(
      ".lobby-grid:not(.lobby-grid--featured)",
    );
    expect(grid).not.toBeNull();

    // Sanity: confirm we pinned the main grid and not, say, the
    // skeleton placeholder grid (which carries `aria-busy="true"` and a
    // `data-testid="lobby-skeleton-grid"`). Without this guard a future
    // restructure that flipped which grid is mounted first could pass
    // this assertion vacuously against the wrong element.
    expect(grid!.tagName).toBe("DIV");
    expect(grid!.getAttribute("data-testid")).not.toBe("lobby-skeleton-grid");

    // The actual contract: no `style` attribute on the main grid. Use
    // `hasAttribute` rather than inspecting `.style.cssText` — an empty
    // `style=""` would still be a (broken) public surface that future
    // code or CSP-violation reporters could come to depend on, and DOM
    // `.style` reflection would silently mask its presence.
    expect(grid!.hasAttribute("style")).toBe(false);
  });
});
