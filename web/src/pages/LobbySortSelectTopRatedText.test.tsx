import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1722 — the lobby sort dropdown's "top-rated" `<option>` exposes the
 * literal user-visible text `"Top rated"`. This pins the SORT_LABELS
 * map's projection for the top-rated mode into the DOM. Existing pins
 * cover the alphabetical option's textContent (W1686), the
 * most-played option's textContent (W1699), the newest option's
 * textContent (W1711), the select's className (W1667) and aria-label
 * (W1677), plus each option's testid + value round-trip — but no test
 * observes that the "Top rated" label string actually rendered. A typo
 * (e.g. "top-rated", "TopRated", "Top Rated", "Top rated ") would
 * silently degrade the visible toolbar while leaving every
 * value-keyed assertion green.
 *
 * Sibling pin placement:
 *  - LobbySortSelectOptionText.test.tsx (W1686) pins the alphabetical
 *    option's textContent only.
 *  - LobbySortSelectMostPlayedText.test.tsx (W1699) pins the
 *    most-played option's textContent only.
 *  - LobbySortSelectNewestText.test.tsx (W1711) pins the newest
 *    option's textContent only.
 *  - LobbyPage.test.tsx covers each option's testid existence and the
 *    select's value round-trip, but never asserts a non-default
 *    option's textContent.
 */
describe("LobbyPage — sort top-rated option textContent (W1722)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the top-rated <option> with textContent=\"Top rated\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is independent
    // of the attribute under test.
    const option = screen.getByTestId("lobby-sort-top-rated");

    expect(option.tagName).toBe("OPTION");
    expect(option.textContent).toBe("Top rated");
  });
});
