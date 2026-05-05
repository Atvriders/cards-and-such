import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1734 — the lobby's sort `<select>` exposes exactly four sort modes:
 * alphabetical, most-played, newest, and top-rated. Sibling pins assert
 * each individual option's textContent (W1686/W1699/W1711/W1722) and
 * that each mode is reachable by testid (LobbyPage.test.tsx), but none
 * pin the *cardinality* of the option list. Adding a fifth mode (or
 * accidentally duplicating one) would slip past those existing pins
 * while still silently changing the dropdown's surface area.
 *
 * This pin asserts the literal `<option>` count is 4 by reading the
 * select's child element count, independent of any individual option's
 * textContent or value attribute.
 *
 * Sibling pin placement:
 *  - LobbySortSelectClass.test.tsx (W1667) pins className+tag.
 *  - LobbySortSelectAria.test.tsx (W1677) pins aria-label.
 *  - LobbySortSelect{Option,MostPlayed,Newest,TopRated}Text.test.tsx
 *    (W1686/W1699/W1711/W1722) pin individual option labels.
 */
describe("LobbyPage — sort select option count (W1734)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exactly four <option> children inside the sort <select>", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is
    // independent of the cardinality under test.
    const select = screen.getByTestId("lobby-sort");

    expect(select.tagName).toBe("SELECT");
    // Use querySelectorAll("option") rather than children.length so we
    // assert specifically the option count, not just child count, in
    // case the markup ever interleaves <optgroup> wrappers.
    expect(select.querySelectorAll("option")).toHaveLength(4);
  });
});
