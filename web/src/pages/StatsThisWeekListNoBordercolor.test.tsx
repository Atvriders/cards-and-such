import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3008: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy HTML
 * `bordercolor` attribute was a non-standard Internet Explorer extension for
 * <table>, <frame>, and <frameset> elements that specified a border colour. It
 * was never part of any HTML standard, was never defined for <ul>, and is
 * ignored by all modern browsers. Leaving such a legacy presentational
 * attribute on a semantic list would be exposed via DOM serialization and
 * could mislead future refactors, linters, or migration tools that scan for
 * deprecated attributes. The sibling `stats-prev-week` ul has many of its
 * legacy-attribute absences pinned, and a wide array of other this-week-list
 * attribute absences are pinned (cite, id, role, style, tabindex, ARIA, etc.),
 * but no test pins `bordercolor` absence on `stats-this-week-list`. Pinning it
 * here ensures any future change that accidentally attaches a `bordercolor`
 * value to this presentational weekly summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — bordercolor attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3008: stats-this-week-list ul has no bordercolor attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("bordercolor")).toBe(false);
    expect(ul.getAttribute("bordercolor")).toBeNull();
  });
});
