import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W912 — the lobby search input is rendered as `type="search"`, not
 * the default `type="text"`.
 *
 * The distinction is user-visible, not stylistic:
 *  - On mobile keyboards, `type="search"` swaps the soft Enter key for
 *    a magnifying-glass "search" affordance, signalling the input's
 *    purpose before the user even taps it.
 *  - In every modern desktop browser, `type="search"` adds a native
 *    Esc-clears-the-input behavior that complements our React-side
 *    clear-x button (W608) without requiring an explicit keydown
 *    handler. A regression that flips this attribute back to "text"
 *    silently strips both affordances, and existing search tests all
 *    fire `change` events directly against the element so none of
 *    them would notice.
 *
 * Existing coverage in this directory:
 *   - W901 (LobbySearchPlaceholder.test.tsx) pins the placeholder copy.
 *   - W608 (LobbyPage.test.tsx) pins the clear-x button behaviour.
 *   - W686 pins the no-results state, W656 the clear-from-empty path,
 *     and W742 the single-character highlight suppression.
 * None of those assertions inspect the `type` attribute, so a refactor
 * that drops `type="search"` would slip through every existing test.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * matches the W901/W874/W766/W789/W803 sibling-file pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits.
 */
describe("LobbyPage — search input type attribute (W912)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby search input with type=\"search\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id; using an attribute-based query
    // (e.g. by role "searchbox") would be circular for this assertion
    // because role "searchbox" is itself derived from `type="search"`.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // The DOM-reflected `.type` property normalises the attribute, so
    // a regression that sets `type="text"` (or omits the attribute,
    // which falls back to "text") fails this assertion.
    expect(search.type).toBe("search");

    // Cross-check via the implicit ARIA role: an `<input type="search">`
    // is exposed to assistive tech as role="searchbox", whereas
    // `type="text"` is role="textbox". Asserting both pins the
    // user-visible (mobile keyboard / Esc-clear) and accessibility
    // contracts together rather than just the raw attribute.
    expect(screen.getByRole("searchbox", { name: /search games/i })).toBe(
      search,
    );
  });
});
