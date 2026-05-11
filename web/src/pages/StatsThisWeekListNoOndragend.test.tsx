import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3191: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `ondragend`
 * attribute is an event handler content attribute that fires when a drag operation
 * concludes on the element. This weekly summary list is purely presentational — it
 * is not draggable, does not participate in any drag-and-drop interaction, and has
 * no associated drag lifecycle. Allowing an `ondragend` handler to be attached
 * inline would silently couple the list to drag semantics, opening the door to
 * unintended script execution, accessibility surprises, and CSP violations against
 * inline event handlers. Other event-handler attribute absences on this same ul
 * (e.g. onclick, onmousedown, ondragstart, ondrop) are already pinned by sibling
 * tests, but `ondragend` is not yet covered. Pinning it here ensures any future
 * change that accidentally wires a drag-end handler onto this presentational ul
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondragend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3191: stats-this-week-list ul has no ondragend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragend")).toBe(false);
    expect(ul.getAttribute("ondragend")).toBeNull();
  });
});
