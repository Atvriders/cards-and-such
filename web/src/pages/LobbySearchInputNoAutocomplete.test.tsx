import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2361 — the lobby search `<input>` element (the one rendered with
 * `className="lobby-search-input"` and resolved via the stable
 * `data-testid="lobby-search"`) MUST NOT carry an `autocomplete`
 * attribute.
 *
 * Why this needs its own pin:
 *  - The lobby search field filters an in-page list of game tiles; the
 *    user's prior queries are not a meaningful autofill source, and
 *    browser-driven autocomplete suggestions ("klondike", "freecell",
 *    …) overlapping the chip strip / tile grid would be a visual and
 *    interaction regression. Conversely, adding `autocomplete="off"`
 *    (the most common drive-by "fix" applied to search inputs) would
 *    also be a behavior change worth catching, since the JSX today
 *    omits the attribute entirely.
 *  - Existing sibling pins on the SAME input cover orthogonal
 *    contracts but none touch the autocomplete surface:
 *      W901  / LobbySearchPlaceholder    → placeholder copy
 *      W912  / LobbySearchType           → type="search"
 *      W1143 / LobbySearchAttr           → aria-label="Search games"
 *      W1248 / LobbySearchClassName      → className="lobby-search-input"
 *      W2314 / LobbySearchInputNoTabindex → absence of tabindex
 *    A regression that introduces a stray `autocomplete` attribute on
 *    the input — in either direction (`on` / `off` / a token list) —
 *    slips past every one of those.
 *
 * One focused assertion: the search input's `autocomplete` attribute
 * MUST NOT be present at all. Use `hasAttribute` rather than checking
 * for a specific value so any future addition is caught.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1248 / W901 / W912 / W1143 / W2314 sibling pattern so
 * the test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — search input has no autocomplete attribute (W2361)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-search input does NOT carry an autocomplete attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id rather than the className itself
    // so the lookup is independent of the attribute under test and of
    // the W1248 className pin.
    const input = screen.getByTestId("lobby-search") as HTMLInputElement;

    // Sanity: confirm we pinned the actual native search input and not,
    // say, the surrounding `.lobby-search` wrapper. Without this guard a
    // future restructure that moved the testid onto a wrapper element
    // could pass this assertion vacuously.
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("type")).toBe("search");

    // The actual contract: no `autocomplete` attribute on the search
    // input. `hasAttribute` reads the raw rendered DOM attribute, so
    // this catches both `autocomplete="off"` and `autocomplete="on"`
    // (and any token-list value) regressions in a single check.
    expect(input.hasAttribute("autocomplete")).toBe(false);
  });
});
