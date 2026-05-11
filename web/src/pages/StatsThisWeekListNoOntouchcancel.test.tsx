import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `ontouchcancel` attribute is an inline event handler used to respond to
 * touch-cancel events (e.g. when the system aborts an in-progress touch).
 * Attaching event handlers via inline HTML attributes bypasses React's
 * synthetic event system, creates a Content-Security-Policy hazard (inline
 * script), and makes behavior harder to reason about. A wide array of other
 * this-week-list attribute absences are already pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `ontouchcancel` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `ontouchcancel` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ontouchcancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no ontouchcancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchcancel")).toBe(false);
    expect(ul.getAttribute("ontouchcancel")).toBeNull();
  });
});
