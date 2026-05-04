import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1270 — the lobby view-mode toggle's "grid" button exposes the
 * literal "Grid view" tooltip via the native `title` attribute.
 *
 * Why this needs its own pin:
 *  - The grid/list pill buttons render only a decorative SVG; the
 *    button is otherwise text-free. Sighted mouse users rely on the
 *    native `title` tooltip to understand the affordance, while
 *    assistive tech consumers rely on `aria-label`. The two strings
 *    must remain in sync, and dropping the `title` (e.g. during a
 *    refactor that consolidates labels via `aria-label` only) would
 *    silently regress the hover-tooltip UX.
 *  - Existing coverage in this directory pins `aria-pressed` toggling
 *    behavior on these same buttons, but no existing test inspects
 *    the literal `title` attribute value, so a regression that drops
 *    or rewrites the tooltip would slip past CI.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * mirrors the W1143/W901/W912/W874 sibling pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits.
 */
describe("LobbyPage — view-grid button title (W1270)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the lobby view-grid button with title=\"Grid view\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id rather than via title/aria so the
    // lookup itself is independent of the attribute under test.
    const btn = screen.getByTestId("lobby-view-grid") as HTMLButtonElement;

    // Pin the literal attribute value. `getAttribute` (rather than
    // a property accessor) guarantees we read what was rendered into
    // the DOM, with no normalisation by the React property bridge.
    expect(btn.getAttribute("title")).toBe("Grid view");
  });
});
