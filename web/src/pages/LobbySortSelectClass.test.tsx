import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1667 — the lobby's sort `<select>` carries the literal className
 * `lobby-sort-select`. The CSS rule keyed by that exact class shapes
 * the dropdown's border, padding, and focus ring so it visually
 * matches the surrounding toolbar pills; renaming or dropping the
 * class would silently regress the toolbar's typography while leaving
 * functionality intact and tests passing.
 *
 * Sibling pin placement:
 *  - LobbyPage.test.tsx covers the select's *behaviour* (value updates,
 *    localStorage persistence) via the `lobby-sort` testid, but no test
 *    asserts the className itself.
 *  - The neighbouring inner span `lobby-sort-label` and outer label
 *    `lobby-sort` classes are also unpinned, but each invariant gets
 *    its own short file in this repo's W-numbered convention so
 *    concurrent edits stay collision-free.
 */
describe("LobbyPage — sort select className (W1667)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the sort <select> with className=\"lobby-sort-select\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is
    // independent of the attribute under test.
    const select = screen.getByTestId("lobby-sort");

    // Pin the literal class string via getAttribute so we observe what
    // landed in the DOM rather than relying on classList normalisation.
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("class")).toBe("lobby-sort-select");
  });
});
