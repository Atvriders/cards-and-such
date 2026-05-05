import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1686 — the lobby sort dropdown's "alphabetical" `<option>` exposes
 * the literal user-visible text `"Alphabetical"`. This pins the
 * SORT_LABELS map's projection into the DOM: existing pins assert the
 * `value` round-trip via testids (`lobby-sort-${mode}`) and the select's
 * className/aria-label, but nothing observes that the label string
 * actually rendered inside the option. A typo or stray whitespace in
 * SORT_LABELS would silently degrade the visible toolbar while leaving
 * every value-keyed assertion green.
 *
 * Sibling pin placement:
 *  - LobbyPage.test.tsx covers each option's testid existence and the
 *    select's value round-trip, but never asserts an option's
 *    textContent.
 *  - LobbySortSelectClass.test.tsx (W1667) and
 *    LobbySortSelectAria.test.tsx (W1677) pin the select's className and
 *    aria-label respectively — neither inspects the options.
 */
describe("LobbyPage — sort option textContent (W1686)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the alphabetical <option> with textContent=\"Alphabetical\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is independent
    // of the attribute under test.
    const option = screen.getByTestId("lobby-sort-alphabetical");

    expect(option.tagName).toBe("OPTION");
    expect(option.textContent).toBe("Alphabetical");
  });
});
