import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3024: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `compact`
 * attribute is a deprecated, presentational boolean attribute that was historically
 * used on list elements (<ul>, <ol>, <dl>, <menu>, <dir>) to request a more
 * compactly rendered list. It has been obsolete since HTML4 and has no effect in
 * modern browsers, with styling instead handled via CSS. Leaving it present would
 * still be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as a styling hint. The
 * sibling `stats-prev-week` ul and a wide array of other this-week-list attribute
 * absences are pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test
 * pins `compact` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches a `compact` attribute to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — compact attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3024: stats-this-week-list ul has no compact attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("compact")).toBe(false);
    expect(ul.getAttribute("compact")).toBeNull();
  });
});
