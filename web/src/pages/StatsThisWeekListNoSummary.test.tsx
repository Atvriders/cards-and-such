import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3018: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `summary`
 * attribute is a legacy <table> attribute (obsolete in HTML5) that was used to
 * describe the structure of a data table for assistive technology. On a <ul> it
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead assistive technology, crawlers, or
 * future refactors that try to interpret the list as a tabular summary. A wide
 * array of other this-week-list attribute absences are already pinned (id,
 * role, style, tabindex, ARIA, cite, pattern, step, coords, bordercolor, etc.),
 * but no test pins `summary` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches a `summary` description
 * to this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — summary attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3018: stats-this-week-list ul has no summary attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("summary")).toBe(false);
    expect(ul.getAttribute("summary")).toBeNull();
  });
});
