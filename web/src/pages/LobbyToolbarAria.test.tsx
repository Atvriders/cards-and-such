import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1381 — the lobby toolbar wrapper exposes the literal
 * `aria-label="Lobby toolbar"` so screen-reader users can identify
 * the surrounding control group when navigating by landmark/role.
 *
 * Why this needs its own pin:
 *  - The toolbar is a `role="group"` container that hosts the view,
 *    density, mode, and overflow controls. Without an `aria-label`
 *    the group degenerates into an unnamed region whose membership
 *    becomes meaningless to AT consumers, even though every nested
 *    button still carries its own label.
 *  - Existing sibling pins cover the individual button attributes
 *    (`aria-pressed`, `title`, etc.) but no existing test inspects
 *    the parent toolbar's `aria-label`, so a refactor that drops or
 *    rewrites it (e.g. consolidating labels at the section level)
 *    would slip past CI silently.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1270/W1143/W901 sibling pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — toolbar aria-label (W1381)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the lobby toolbar wrapper with aria-label=\"Lobby toolbar\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id rather than via aria so the
    // lookup itself is independent of the attribute under test.
    const toolbar = screen.getByTestId("lobby-toolbar");

    // Pin the literal attribute value. `getAttribute` (rather than
    // a property accessor) guarantees we read what was rendered into
    // the DOM, with no normalisation by the React property bridge.
    expect(toolbar.getAttribute("aria-label")).toBe("Lobby toolbar");
  });
});
