import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3138: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy DOM
 * event handler attribute `onmouseover` allows arbitrary inline script to run
 * whenever a pointer enters the element, which is a long-standing XSS vector
 * and a Content-Security-Policy hazard. The sibling `stats-prev-week` ul and
 * a wide array of this-week-list attribute absences (id, role, style, tabindex,
 * cite, various ARIA hooks, etc.) are already pinned, but no test currently
 * pins `onmouseover` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an inline mouseover
 * handler to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmouseover attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3138: stats-this-week-list ul has no onmouseover attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseover")).toBe(false);
    expect(ul.getAttribute("onmouseover")).toBeNull();
  });
});
