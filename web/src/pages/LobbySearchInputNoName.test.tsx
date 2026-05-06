import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2653 — the lobby search `<input>` element (the one rendered with
 * `className="lobby-search-input"` and resolved via the stable
 * `data-testid="lobby-search"`) MUST NOT carry a `name` attribute.
 *
 * Why this needs its own pin:
 *  - The lobby search field is a client-side filter over an in-page
 *    list of game tiles. It is NOT part of any HTML form submission;
 *    its value is consumed by React state (`query` / `setQuery`) and
 *    never serialised to a query string or POST body. A `name`
 *    attribute would have two unwanted side effects:
 *      1. It would advertise the field to browser autofill heuristics
 *         (autofill engines key off `name` even when `autocomplete`
 *         is omitted — see W2361 for the autocomplete-absence pin),
 *         which can cause stored credit-card or address suggestions
 *         to overlay the chip strip / tile grid.
 *      2. If a parent ever wrapped this input in a `<form>` (even
 *         accidentally, e.g. for a future "press Enter to search"
 *         feature), the field would suddenly contribute a key/value
 *         to form submission, exposing the search query in URLs or
 *         server logs in a way the current architecture deliberately
 *         avoids.
 *  - Existing sibling pins on the SAME input cover orthogonal
 *    contracts but none touch the `name` surface:
 *      W901  / LobbySearchPlaceholder       → placeholder copy
 *      W912  / LobbySearchType              → type="search"
 *      W1143 / LobbySearchAttr              → aria-label="Search games"
 *      W1248 / LobbySearchClassName         → className="lobby-search-input"
 *      W2314 / LobbySearchInputNoTabindex   → absence of tabindex
 *      W2361 / LobbySearchInputNoAutocomplete → absence of autocomplete
 *    A regression that introduces a stray `name` attribute on the
 *    input — in any value — slips past every one of those.
 *
 * One focused assertion: the search input's `name` attribute MUST NOT
 * be present at all. Use `hasAttribute` rather than checking for a
 * specific value so any future addition (e.g. `name="q"`,
 * `name="search"`, `name=""`) is caught uniformly.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1248 / W901 / W912 / W1143 / W2314 / W2361 sibling
 * pattern so the test shares the `src/pages/Lobby` vitest path filter
 * without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — search input has no name attribute (W2653)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-search input does NOT carry a name attribute", () => {
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

    // The actual contract: no `name` attribute on the search input.
    // `hasAttribute` reads the raw rendered DOM attribute, so this
    // catches `name="q"`, `name="search"`, and `name=""` regressions
    // in a single check — orthogonal to the W2361 autocomplete pin.
    expect(input.hasAttribute("name")).toBe(false);
  });
});
