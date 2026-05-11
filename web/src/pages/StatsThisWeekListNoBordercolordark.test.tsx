import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3032: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy HTML
 * `bordercolordark` attribute was a non-standard Microsoft extension to <table>
 * (and related table-section) elements in Internet Explorer that controlled the
 * darker shade of a 3-D table border. It has never been part of any HTML
 * standard, is ignored by modern browsers, and carries no defined semantics on
 * a <ul> at all. Leaving it present would still be exposed via DOM
 * serialization and could mislead future refactors, crawlers, or assistive
 * technology that try to interpret it. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, etc.), but no test pins `bordercolordark` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches this obsolete legacy IE attribute to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — bordercolordark attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3032: stats-this-week-list ul has no bordercolordark attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("bordercolordark")).toBe(false);
    expect(ul.getAttribute("bordercolordark")).toBeNull();
  });
});
