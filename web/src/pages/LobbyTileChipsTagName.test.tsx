import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2399 — pin the underlying DOM tagName ("DIV") on the lobby
 * tile's `tile-chips` wrapper.
 *
 * `TileMetaChips` (LobbyPage.tsx ~L2728) emits the eta + difficulty
 * pill pair inside a `<div className="tile-chips">`. Sibling tests
 * already pin the wrapper's `aria-hidden="false"` (W1397), exact
 * `className === "tile-chips"` (W1692), child count (chips), and
 * the absence of id / role / style / tabindex. None of them assert
 * the actual tagName — a refactor to a `<span class="tile-chips">`
 * (e.g. to inline the chips inside a flex parent) or to a `<section>`
 * would still satisfy the existing `div.tile-chips` selectors used
 * by the aria / class / no-id / no-role / no-style / no-tabindex
 * tests when the selector matches BY CLASS but the underlying
 * element is no longer a div: those tests query `div.tile-chips`
 * which would silently return zero matches, and most of them only
 * iterate over found nodes (`for (const wrapper of Array.from(...))`)
 * meaning a tag swap would silently pass them as vacuous.
 *
 * This test pins the tagName explicitly so that any future refactor
 * that changes the wrapper element type (div -> span / section /
 * article / aside) is caught with a concrete failure rather than a
 * silently-empty NodeList.
 *
 * Lives in a NEW SIBLING file per the same rationale as the other
 * `LobbyTileChips*` tests (Aria / ChildCount / ClassEq / NoId /
 * NoRole / NoStyle / NoTabindex): shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * the mega-file.
 */
describe("LobbyPage — tile-chips wrapper tagName (W2399)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-chips wrapper as a DIV element", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tile-chips tests.
    await screen.findByPlaceholderText(/search/i);

    // Match by className substring (NOT `div.tile-chips`) so that a
    // tag swap can't silently produce an empty NodeList — we want
    // the assertion to fire on the wrapper regardless of its tag.
    const wrappers = document.querySelectorAll<HTMLElement>(
      '[class*="tile-chips"]',
    );

    // Filter to wrappers whose className TOKEN list literally
    // contains "tile-chips" (avoids matching unrelated decorators
    // like "tile-chips-row" elsewhere in the lobby — see L3271).
    const exact: HTMLElement[] = [];
    for (const w of Array.from(wrappers)) {
      const cls = w.getAttribute("class") ?? "";
      if (!/(^|\s)tile-chips(\s|$)/.test(cls)) continue;
      exact.push(w);
    }

    expect(exact.length).toBeGreaterThan(0);

    for (const wrapper of exact) {
      // The wrapper MUST be a `<div>` — pinning the tagName guards
      // against silent refactors to span / section / article / aside
      // which would defeat sibling `div.tile-chips` selectors.
      expect(wrapper.tagName).toBe("DIV");
    }
  });
});
