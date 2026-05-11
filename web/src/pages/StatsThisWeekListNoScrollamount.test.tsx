import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3062: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `scrollamount`
 * attribute is a legacy attribute of the obsolete <marquee> element, controlling
 * how far in pixels the marquee content scrolls on each step. It has no defined
 * semantics on a <ul>, and modern browsers ignore it outside <marquee>, but if
 * present it would still be exposed via DOM serialization and could mislead
 * future refactors or migration tools that scan for legacy marquee migration
 * candidates. Many other attribute absences on this same ul are already pinned
 * (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `scrollamount` absence. Pinning it here ensures any accidental introduction
 * of a marquee-era scrollamount value on this presentational weekly summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — scrollamount attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3062: stats-this-week-list ul has no scrollamount attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("scrollamount")).toBe(false);
    expect(ul.getAttribute("scrollamount")).toBeNull();
  });
});
