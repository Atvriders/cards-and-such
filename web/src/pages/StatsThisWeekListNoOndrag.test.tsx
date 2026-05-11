import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3185: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `ondrag` attribute is an inline event handler that fires continuously while
 * an element is being dragged. This presentational summary list does not
 * participate in any drag-and-drop interaction, and attaching an inline
 * `ondrag` handler would execute attribute-sourced JavaScript outside of
 * React's synthetic event system, bypass Content Security Policy script-src
 * protections, and create a footgun for future refactors. The sibling
 * `stats-prev-week` ul already has its `ondrag` absence pinned (W3184), and a
 * wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, cite, ARIA, etc.), but no test pins `ondrag` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an inline `ondrag` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — ondrag attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3185: stats-this-week-list ul has no ondrag attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondrag")).toBe(false);
    expect(ul.getAttribute("ondrag")).toBeNull();
  });
});
