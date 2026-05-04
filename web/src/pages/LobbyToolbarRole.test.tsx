import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1393 — the lobby toolbar wrapper carries `role="group"` so that
 * the surrounding `<div>` is reported to assistive tech as a related
 * collection of controls (view, density, mode, overflow) rather than
 * a generic, anonymous container.
 *
 * Why this needs its own pin:
 *  - W1381's sibling pin asserts `aria-label="Lobby toolbar"`, but an
 *    aria-label without an interactive/grouping role is ignored by
 *    most screen readers on plain `<div>` elements. The role is the
 *    half of the contract that makes the label meaningful.
 *  - The toolbar's children (`.lobby-view-toggle`, `.lobby-density-toggle`)
 *    are themselves `role="group"`, but those are nested groups and
 *    their pins live alongside their own attributes; nothing currently
 *    pins the OUTER wrapper's role, so a refactor to `role="toolbar"`,
 *    `role="region"`, or removing the role entirely would slip through.
 *
 * Sibling-file placement (rather than extending LobbyToolbarAria.test.tsx)
 * keeps each W-numbered invariant in a single-purpose file, mirroring
 * the W1381/W1270/W1143 layout so concurrent edits do not collide.
 */
describe("LobbyPage — toolbar role (W1393)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("declares role=\"group\" on the lobby toolbar wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable test id so the lookup itself is
    // independent of the attribute under test (we are NOT using
    // *ByRole here on purpose).
    const toolbar = screen.getByTestId("lobby-toolbar");

    // Pin the literal attribute value via getAttribute so we observe
    // what was rendered into the DOM, with no normalisation from the
    // React property bridge.
    expect(toolbar.getAttribute("role")).toBe("group");
  });
});
