import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3090: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `formnovalidate` attribute is only meaningful on <button> and <input
 * type="submit"|"image"> elements, where it opts a submitter out of the
 * owning form's constraint validation. On a <ul> the attribute carries no
 * defined semantics, but leaving it present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a form submission hint. A wide array
 * of other this-week-list attribute absences are already pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `formnovalidate`
 * absence on `stats-this-week-list`. Pinning it here ensures any future
 * change that accidentally attaches a `formnovalidate` flag to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — formnovalidate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3090: stats-this-week-list ul has no formnovalidate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("formnovalidate")).toBe(false);
    expect(ul.getAttribute("formnovalidate")).toBeNull();
  });
});
