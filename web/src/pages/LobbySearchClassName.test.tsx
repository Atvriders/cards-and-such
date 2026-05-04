import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1248 — the lobby search input renders the literal className
 * `lobby-search-input` (and its containing wrapper carries the
 * `lobby-search` class).
 *
 * Why this needs its own pin:
 *  - The `lobby-search-input` className is the sole hook our stylesheet
 *    uses to apply the search field's padding-left (to clear the magnifier
 *    icon), border treatment, focus ring, and right-padding reservation
 *    for the W608 clear-x button. A refactor that renames this class
 *    (e.g. to `search-input` or a CSS-modules hash) would silently strip
 *    those styles while every existing search test continued to pass —
 *    they all locate the input via `data-testid="lobby-search"`, never
 *    its className.
 *  - Existing sibling pins cover orthogonal contracts:
 *      W901 → placeholder copy
 *      W912 → type="search" / role="searchbox"
 *      W1143 → aria-label="Search games"
 *      W608  → lobby-search-clear button (clear-x)
 *    None of those inspect the input's own className, so a regression
 *    that drops or renames `lobby-search-input` slips through CI.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W901/W912/W1143/W608 sibling pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — search input className (W1248)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby search input with className=\"lobby-search-input\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id rather than the className itself
    // so the lookup is independent of the attribute under test.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // Pin the literal className value. `getAttribute("class")` reads the
    // raw rendered DOM attribute, bypassing any property-bridge
    // normalisation, so a regression that emits an empty class or a
    // different token list fails this assertion.
    expect(search.getAttribute("class")).toBe("lobby-search-input");
  });
});
