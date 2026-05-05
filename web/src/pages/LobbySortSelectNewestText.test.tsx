import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1711 — the lobby sort dropdown's "newest" `<option>` exposes the
 * literal user-visible text `"Newest"`. This pins the SORT_LABELS
 * map's projection for the newest mode into the DOM. Existing pins
 * cover the alphabetical option's textContent (W1686), the
 * most-played option's textContent (W1699), the select's className
 * (W1667) and aria-label (W1677), plus each option's testid + value
 * round-trip — but no test observes that the "Newest" label string
 * actually rendered. A typo (e.g. "newest", "New", "Newest ") would
 * silently degrade the visible toolbar while leaving every
 * value-keyed assertion green.
 *
 * Sibling pin placement:
 *  - LobbySortSelectOptionText.test.tsx (W1686) pins the alphabetical
 *    option's textContent only.
 *  - LobbySortSelectMostPlayedText.test.tsx (W1699) pins the
 *    most-played option's textContent only.
 *  - LobbyPage.test.tsx covers each option's testid existence and the
 *    select's value round-trip, but never asserts a non-default
 *    option's textContent.
 */
describe("LobbyPage — sort newest option textContent (W1711)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the newest <option> with textContent=\"Newest\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is independent
    // of the attribute under test.
    const option = screen.getByTestId("lobby-sort-newest");

    expect(option.tagName).toBe("OPTION");
    expect(option.textContent).toBe("Newest");
  });
});
