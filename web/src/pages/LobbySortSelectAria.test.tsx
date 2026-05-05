import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1677 — the lobby's sort `<select>` advertises itself to assistive
 * tech with the literal `aria-label="Sort games"`. Without this label
 * the control's only visible context is a sibling `<span>` that screen
 * readers may not associate with the select, so dropping or renaming
 * the attribute would silently regress accessibility while leaving
 * sighted UX and existing className/testid pins (W1667) green.
 *
 * Sibling pin placement:
 *  - LobbySortSelectClass.test.tsx (W1667) pins the className.
 *  - LobbyPage.test.tsx covers default value, persistence, and that
 *    each mode has a testid — none assert the select's aria-label.
 */
describe("LobbyPage — sort select aria-label (W1677)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the sort <select> with aria-label=\"Sort games\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid so the lookup itself is
    // independent of the attribute under test.
    const select = screen.getByTestId("lobby-sort");

    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("aria-label")).toBe("Sort games");
  });
});
