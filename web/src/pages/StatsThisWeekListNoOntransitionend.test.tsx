import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3266: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontransitionend` content attribute is a global event handler attribute that,
 * when present, registers an inline JavaScript handler for the `transitionend`
 * event. This presentational weekly summary list has no CSS transitions and no
 * need to react to transition completion; any `ontransitionend` value would be
 * dead code at best and, at worst, an inline script vector that bypasses our
 * React event system and CSP posture. Sibling absences for related transition
 * event handlers are already pinned on this ul (e.g. ontransitionstart W3263),
 * but `ontransitionend` itself is not yet pinned. Pinning it here ensures any
 * future change that accidentally attaches an inline `ontransitionend` handler
 * to this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontransitionend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3266: stats-this-week-list ul has no ontransitionend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontransitionend")).toBe(false);
    expect(ul.getAttribute("ontransitionend")).toBeNull();
  });
});
