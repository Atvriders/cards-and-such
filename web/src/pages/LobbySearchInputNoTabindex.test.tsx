import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2314 — the lobby search `<input>` element (the one rendered with
 * `className="lobby-search-input"` and resolved via the stable
 * `data-testid="lobby-search"`) MUST NOT carry a `tabindex` attribute.
 *
 * Why this needs its own pin:
 *  - The lobby search field is the page's primary text input. Form
 *    controls (`<input type="search">`) are natively focusable and
 *    naturally part of the document tab order without any explicit
 *    tabindex. Adding `tabindex="0"` would be redundant; adding
 *    `tabindex="-1"` would silently REMOVE the input from sequential
 *    keyboard navigation, leaving keyboard-only users unable to reach
 *    the search field via Tab. Either change would alter the page's
 *    tab-order surface in a way no existing test detects.
 *  - Existing sibling pins on the SAME input cover orthogonal
 *    contracts but none touch tab-order:
 *      W901  / LobbySearchPlaceholder    → placeholder copy
 *      W912  / LobbySearchType           → type="search"
 *      W1143 / LobbySearchAttr           → aria-label="Search games"
 *      W1248 / LobbySearchClassName      → className="lobby-search-input"
 *    A regression that introduces a stray `tabindex` attribute on the
 *    input slips past every one of those.
 *
 * One focused assertion: the search input's `tabindex` attribute MUST
 * NOT be present at all. Use `hasAttribute` rather than checking for a
 * specific value — both `tabindex="0"` (redundant) and `tabindex="-1"`
 * (removes the input from tab order) are unwanted.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1248 / W901 / W912 / W1143 sibling pattern so the test
 * shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("LobbyPage — search input has no tabindex attribute (W2314)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-search input does NOT carry a tabindex attribute", () => {
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

    // The actual contract: no `tabindex` attribute on the search input.
    // `hasAttribute` reads the raw rendered DOM attribute, so this
    // catches both `tabindex="0"` and `tabindex="-1"` regressions.
    expect(input.hasAttribute("tabindex")).toBe(false);
  });
});
