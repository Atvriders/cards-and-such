import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onmousemove` HTML attribute would install an inline event handler that
 * fires on every pointer movement over the list — a high-frequency event
 * source that is almost never appropriate for a presentational weekly stats
 * summary. Inline event handler attributes also bypass React's synthetic
 * event system, conflict with CSP policies that forbid inline scripts, and
 * generally signal an accidental leak of DOM-level wiring into a component
 * that should remain purely declarative. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, etc.). Pinning `onmousemove` absence here ensures any future change
 * that accidentally attaches an inline mousemove handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmousemove attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onmousemove attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmousemove")).toBe(false);
    expect(ul.getAttribute("onmousemove")).toBeNull();
  });
});
